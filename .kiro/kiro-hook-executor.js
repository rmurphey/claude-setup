#!/usr/bin/env node

/**
 * Kiro Hook Executor - Bridge between .kiro.hook files and Claude Code's native hook system
 * 
 * This script reads .kiro.hook files and executes their prompts via Claude CLI when 
 * file patterns match. It integrates with Claude Code's existing hook infrastructure.
 */

import { promises as fs } from 'fs';
import { join, dirname, relative } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

import { minimatch } from 'minimatch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class KiroHookExecutor {
  constructor() {
    this.projectRoot = join(__dirname, '..'); // Script is now in .kiro/ directory
    this.hooksDir = join(this.projectRoot, '.kiro', 'hooks');
    this.loadedHooks = [];
  }

  /**
   * Load and parse all .kiro.hook files
   */
  async loadKiroHooks() {
    try {
      const hookFiles = await fs.readdir(this.hooksDir);
      this.loadedHooks = [];

      for (const file of hookFiles) {
        if (file.endsWith('.kiro.hook')) {
          const hookPath = join(this.hooksDir, file);
          try {
            const hookContent = await fs.readFile(hookPath, 'utf-8');
            const hookConfig = JSON.parse(hookContent);
            
            if (hookConfig.enabled !== false) {
              this.loadedHooks.push({
                file,
                config: hookConfig,
                path: hookPath
              });
            }
          } catch (error) {
            console.error(`Error loading hook ${file}:`, error.message);
          }
        }
      }

      console.log(`Loaded ${this.loadedHooks.length} kiro hooks`);
    } catch (error) {
      console.error('Error loading kiro hooks:', error.message);
    }
  }

  /**
   * Check if a file change matches any hook patterns
   */
  findMatchingHooks(changedFile) {
    return this.loadedHooks.filter(hook => {
      if (hook.config.when?.type !== 'fileEdited') return false;
      
      const patterns = hook.config.when.patterns || [];
      return patterns.some(pattern => minimatch(changedFile, pattern));
    });
  }

  /**
   * Execute Claude CLI with a hook's prompt
   */
  async executeClaude(prompt) {
    return new Promise((resolve, reject) => {
      // Try different Claude CLI commands that might be available
      const claudeCommands = ['claude', 'claude-code', 'npx claude-code'];
      
      let cmdIndex = 0;
      
      const tryCommand = () => {
        if (cmdIndex >= claudeCommands.length) {
          reject(new Error('Could not find Claude CLI command'));
          return;
        }

        const cmd = claudeCommands[cmdIndex];
        const args = ['--print', prompt];
        
        console.log(`Executing: ${cmd} --print <prompt>`);
        console.log(`Prompt: ${prompt.substring(0, 100)}...`);
        
        const claudeProcess = spawn(cmd, args, {
          stdio: ['pipe', 'inherit', 'inherit'],
          cwd: this.projectRoot
        });

        claudeProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else if (code === 127 || code === 1) {
            // Command not found or failed, try next
            cmdIndex++;
            tryCommand();
          } else {
            reject(new Error(`Claude CLI exited with code ${code}`));
          }
        });

        claudeProcess.on('error', (error) => {
          if (error.code === 'ENOENT') {
            // Command not found, try next
            cmdIndex++;
            tryCommand();
          } else {
            reject(error);
          }
        });
      };

      tryCommand();
    });
  }

  /**
   * Process file changes and execute matching hooks
   */
  async processFileChange(changedFile) {
    await this.loadKiroHooks();
    
    // Convert absolute path to relative from project root
    const relativePath = relative(this.projectRoot, changedFile);
    
    const matchingHooks = this.findMatchingHooks(relativePath);
    
    if (matchingHooks.length === 0) {
      console.log(`No hooks match file: ${relativePath}`);
      return;
    }

    console.log(`Found ${matchingHooks.length} matching hook(s) for: ${relativePath}`);

    for (const hook of matchingHooks) {
      console.log(`\\nExecuting hook: ${hook.config.name}`);
      console.log(`Description: ${hook.config.description}`);
      
      if (hook.config.then?.type === 'askAgent') {
        try {
          console.log('📝 Would execute Claude with prompt:');
          console.log(`   ${hook.config.then.prompt.substring(0, 200)}...`);
          
          // For testing, we'll skip actual Claude execution and just simulate success
          if (process.env.KIRO_HOOK_TEST_MODE === 'true') {
            console.log(`✅ Hook ${hook.config.name} completed successfully (TEST MODE)`);
          } else {
            await this.executeClaude(hook.config.then.prompt);
            console.log(`✅ Hook ${hook.config.name} completed successfully`);
          }
        } catch (error) {
          console.error(`❌ Hook ${hook.config.name} failed:`, error.message);
        }
      } else {
        console.log(`⚠️ Unsupported hook action type: ${hook.config.then?.type}`);
      }
    }
  }

  /**
   * Main entry point - process command line arguments
   */
  async run() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log('Kiro Hook Executor');
      console.log('Usage: node kiro-hook-executor.js <changed-file-path>');
      console.log('       node kiro-hook-executor.js --list-hooks');
      console.log('       node kiro-hook-executor.js --test <file-pattern>');
      return;
    }

    if (args[0] === '--list-hooks') {
      await this.loadKiroHooks();
      console.log('\\nLoaded Kiro Hooks:');
      this.loadedHooks.forEach(hook => {
        console.log(`\\n• ${hook.config.name} (${hook.file})`);
        console.log(`  Description: ${hook.config.description}`);
        console.log(`  Patterns: ${hook.config.when?.patterns?.join(', ') || 'none'}`);
        console.log(`  Enabled: ${hook.config.enabled !== false}`);
      });
      return;
    }

    if (args[0] === '--test' && args[1]) {
      await this.loadKiroHooks();
      const testFile = args[1];
      const matchingHooks = this.findMatchingHooks(testFile);
      console.log(`\\nTesting file pattern: ${testFile}`);
      console.log(`Matching hooks: ${matchingHooks.length}`);
      matchingHooks.forEach(hook => {
        console.log(`  • ${hook.config.name}`);
      });
      return;
    }

    // Process file change
    const changedFile = args[0];
    await this.processFileChange(changedFile);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const executor = new KiroHookExecutor();
  executor.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { KiroHookExecutor };