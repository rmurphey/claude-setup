#!/usr/bin/env node

/**
 * Simple archival automation - checks for completed specs and archives them
 * Uses existing archival components without complex orchestration
 */

import fs from 'fs-extra';

import { SpecCompletionDetectorImpl } from '../dist/lib/spec-completion-detector.js';
import { ArchivalEngineImpl } from '../dist/lib/archival-engine.js';

const SPECS_DIR = '.kiro/specs';

async function main() {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');
  const dryRun = process.argv.includes('--dry-run');
  
  if (!await fs.pathExists(SPECS_DIR)) {
    console.log('📭 No specs directory found');
    return;
  }

  try {
    const detector = new SpecCompletionDetectorImpl(SPECS_DIR);
    const archiver = new ArchivalEngineImpl();
    
    // Find all spec directories
    const entries = await fs.readdir(SPECS_DIR, { withFileTypes: true });
    const specs = entries
      .filter(entry => entry.isDirectory() && entry.name !== 'archive')
      .map(entry => entry.name);

    if (verbose) {
      console.log(`🔍 Found ${specs.length} specs to check`);
    }

    let archived = 0;
    let errors = 0;

    for (const specName of specs) {
      try {
        const completion = await detector.checkSpecCompletion(specName);
        
        if (completion.isComplete) {
          if (dryRun) {
            console.log(`[DRY RUN] Would archive: ${specName} (${completion.completedTasks}/${completion.totalTasks})`);
            archived++;
          } else {
            if (verbose) {
              console.log(`📦 Archiving completed spec: ${specName}`);
            }
            
            const result = await archiver.archiveSpec(specName);
            
            if (result.success) {
              console.log(`✅ Archived: ${specName}`);
              archived++;
            } else {
              console.error(`❌ Failed to archive ${specName}: ${result.error}`);
              errors++;
            }
          }
        } else if (verbose) {
          console.log(`⏳ Incomplete: ${specName} (${completion.completedTasks}/${completion.totalTasks} tasks)`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not check ${specName}: ${error.message}`);
      }
    }

    // Summary
    if (archived === 0 && errors === 0) {
      console.log('ℹ️  No completed specs to archive');
    } else {
      console.log(`\n📊 Summary: ${archived} archived, ${errors} errors`);
    }

  } catch (error) {
    console.error('🚨 Archival failed:', error.message);
    process.exit(1);
  }
}

main();