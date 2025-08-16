#!/usr/bin/env node

/**
 * Context Management Script
 * Helps manage Claude's context window efficiently
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const action = process.argv[2] || 'status';
const target = process.argv[3];

// Color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function estimateTokens(text) {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function showStatus() {
  console.log('📊 Context Window Status');
  console.log('========================');
  console.log('');
  
  console.log('Current Context Usage Estimates:');
  console.log('');
  
  // Check recently accessed files
  try {
    const recentFiles = execSync('find . -type f -name "*.md" -o -name "*.js" -o -name "*.json" | grep -v node_modules | head -20', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f);
    
    let totalSize = 0;
    let fileCount = 0;
    
    recentFiles.forEach(file => {
      const size = getFileSize(file);
      totalSize += size;
      if (size > 0) fileCount++;
    });
    
    const estimatedTokens = estimateTokens(fs.readFileSync(recentFiles[0] || 'README.md', 'utf8'));
    
    console.log(`  📄 Files in context: ~${fileCount}`);
    console.log(`  💾 Total size: ${formatBytes(totalSize)}`);
    console.log(`  🎯 Estimated tokens: ~${(estimatedTokens * fileCount / 1000).toFixed(1)}k`);
    
    // Check git status
    const gitChanges = execSync('git status --porcelain 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
    console.log(`  📝 Uncommitted changes: ${gitChanges} files`);
    
    // Check active work
    if (fs.existsSync('ACTIVE_WORK.md')) {
      const todos = fs.readFileSync('ACTIVE_WORK.md', 'utf8');
      const pending = (todos.match(/- \[ \]/g) || []).length;
      console.log(`  ✅ Active tasks: ${pending}`);
    }
    
    console.log('');
    console.log('💡 Tips:');
    console.log('  • Use /context clear to reset conversation');
    console.log('  • Use /context focus <topic> to narrow scope');
    console.log('  • Commit changes regularly to reduce context');
    
  } catch (error) {
    console.log('  ⚠️ Unable to estimate context usage');
  }
}

function clearContext() {
  console.log('🧹 Clearing Context');
  console.log('==================');
  console.log('');
  
  console.log('Recommended actions:');
  console.log('  1. Start a new conversation for unrelated work');
  console.log('  2. Commit current changes: git add . && git commit');
  console.log('  3. Close unnecessary files in your editor');
  console.log('  4. Archive completed work items');
  console.log('');
  console.log('✅ Context clearing guide provided');
}

function focusContext(topic) {
  console.log(`🎯 Focusing Context: ${topic || 'current work'}`);
  console.log('=========================');
  console.log('');
  
  if (!topic) {
    console.log('Current focus areas:');
    
    // List main directories
    ['src', 'lib', 'scripts', 'docs', '.claude'].forEach(dir => {
      if (fs.existsSync(dir)) {
        const fileCount = execSync(`find ${dir} -type f | wc -l`, { encoding: 'utf8' }).trim();
        console.log(`  • ${dir}/: ${fileCount} files`);
      }
    });
  } else {
    console.log(`Focusing on: ${topic}`);
    console.log('');
    
    // Find relevant files
    try {
      const relevantFiles = execSync(`find . -type f -name "*${topic}*" | grep -v node_modules | head -10`, { encoding: 'utf8' })
        .split('\n')
        .filter(f => f);
      
      if (relevantFiles.length > 0) {
        console.log('Relevant files:');
        relevantFiles.forEach(f => console.log(`  • ${f}`));
      } else {
        console.log('  No files found matching topic');
      }
    } catch {
      console.log('  Unable to search for topic files');
    }
  }
  
  console.log('');
  console.log('✅ Context focused');
}

function optimizeContext() {
  console.log('⚡ Optimizing Context');
  console.log('====================');
  console.log('');
  
  let optimizations = 0;
  
  // Check for large files
  console.log('Checking for optimization opportunities...');
  console.log('');
  
  try {
    // Find large markdown files
    const largeFiles = execSync('find . -name "*.md" -size +100k | grep -v node_modules', { encoding: 'utf8' })
      .split('\n')
      .filter(f => f);
    
    if (largeFiles.length > 0) {
      console.log('⚠️ Large files detected:');
      largeFiles.forEach(f => {
        const size = getFileSize(f);
        console.log(`  • ${f}: ${formatBytes(size)}`);
      });
      optimizations++;
    }
    
    // Check for too many open files
    const openFiles = execSync('find . -type f -newer /tmp 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
    if (parseInt(openFiles) > 50) {
      console.log(`⚠️ Many files accessed recently: ${openFiles}`);
      console.log('  Consider focusing on specific areas');
      optimizations++;
    }
    
    // Check session history
    if (fs.existsSync('session-history')) {
      const sessions = fs.readdirSync('session-history').length;
      if (sessions > 30) {
        console.log(`⚠️ Large session history: ${sessions} sessions`);
        console.log('  Consider archiving old sessions');
        optimizations++;
      }
    }
    
    if (optimizations === 0) {
      console.log('✅ Context is already optimized!');
    } else {
      console.log('');
      console.log(`Found ${optimizations} optimization opportunities`);
    }
    
  } catch (error) {
    console.log('  Unable to analyze for optimizations');
  }
}

function showHelp() {
  console.log('🎯 Context Management Commands');
  console.log('==============================');
  console.log('');
  console.log('Available commands:');
  console.log('  /context status    - Show current context usage');
  console.log('  /context clear     - Guide for clearing context');
  console.log('  /context focus     - Focus on specific area');
  console.log('  /context optimize  - Find optimization opportunities');
  console.log('  /context help      - Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  /context focus auth   - Focus on authentication code');
  console.log('  /context optimize     - Find ways to reduce context');
}

// Main execution
switch (action) {
  case 'status':
  case 'check':
    showStatus();
    break;
  case 'clear':
  case 'reset':
    clearContext();
    break;
  case 'focus':
    focusContext(target);
    break;
  case 'optimize':
    optimizeContext();
    break;
  case 'help':
  default:
    showHelp();
}