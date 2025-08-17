#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Parse command-line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  skip: args.includes('--skip'),
  backup: args.includes('--backup'),
  help: args.includes('--help') || args.includes('-h'),
  interactive: !args.some(arg => ['--force', '--skip', '--backup'].includes(arg))
};

// Show help if requested
if (options.help) {
  console.log('🤖 Claude Code Commands Setup');
  console.log('==============================');
  console.log('');
  console.log('Usage: npx claude-setup [options]');
  console.log('');
  console.log('Options:');
  console.log('  --skip    Skip existing files (preserve customizations)');
  console.log('  --backup  Backup existing files before replacing');
  console.log('  --force   Replace all files (creates backup)');
  console.log('  --help    Show this help message');
  console.log('');
  console.log('Default behavior is interactive - you\'ll be prompted for conflicts.');
  process.exit(0);
}

console.log('🤖 Claude Code Commands Setup');
console.log('==============================');

// Check if we're in a git repository
function isGitRepo() {
  try {
    execSync('git status', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

if (!isGitRepo()) {
  console.log('❌ Not a git repository. Run "git init" first.');
  process.exit(1);
}

// Utility function to get all files recursively
function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// Detect conflicts between source and target
function detectConflicts(sourceDir, targetDir) {
  const conflicts = [];
  if (!fs.existsSync(targetDir)) return conflicts;
  
  const sourceFiles = getAllFiles(sourceDir);
  for (const file of sourceFiles) {
    const relativePath = path.relative(sourceDir, file);
    const targetPath = path.join(targetDir, relativePath);
    if (fs.existsSync(targetPath)) {
      conflicts.push(relativePath);
    }
  }
  return conflicts;
}

// Prompt user for conflict resolution
async function promptUser(conflicts) {
  console.log('');
  console.log(`⚠️  Found ${conflicts.length} existing file(s):`);
  // Show first 5 conflicts
  conflicts.slice(0, 5).forEach(file => {
    console.log(`   • ${file}`);
  });
  if (conflicts.length > 5) {
    console.log(`   ... and ${conflicts.length - 5} more`);
  }
  
  console.log('');
  console.log('How would you like to proceed?');
  console.log('  1. Skip - Keep your existing files (recommended)');
  console.log('  2. Backup - Backup existing and install fresh');
  console.log('  3. Merge - Add only non-conflicting files');
  console.log('  4. Cancel - Exit without changes');
  console.log('');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Choice [1-4]: ', (answer) => {
      rl.close();
      switch (answer.trim()) {
        case '1': resolve('skip'); break;
        case '2': resolve('backup'); break;
        case '3': resolve('merge'); break;
        case '4': resolve('cancel'); break;
        default: 
          console.log('Invalid choice, using "skip" as default');
          resolve('skip');
      }
    });
  });
}

// Determine resolution strategy
async function determineStrategy(conflicts, options) {
  if (conflicts.length === 0) return 'proceed';
  
  if (options.skip) return 'skip';
  if (options.backup) return 'backup';
  if (options.force) return 'backup'; // Force is like backup but less interactive
  if (options.interactive) return await promptUser(conflicts);
  
  return 'skip'; // Default safe behavior
}

// Copy directory recursively
function copyRecursive(source, target, skipExisting = false) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const items = fs.readdirSync(source);
  let copied = 0;
  let skipped = 0;
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      const result = copyRecursive(sourcePath, targetPath, skipExisting);
      copied += result.copied;
      skipped += result.skipped;
    } else {
      if (skipExisting && fs.existsSync(targetPath)) {
        skipped++;
      } else {
        fs.copyFileSync(sourcePath, targetPath);
        copied++;
      }
    }
  }
  
  return { copied, skipped };
}

// Backup existing directory
function backupDirectory(dir) {
  if (!fs.existsSync(dir)) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = `${dir}.backup-${timestamp}`;
  fs.renameSync(dir, backupPath);
  return backupPath;
}

// Safe copy with conflict resolution
function safeCopy(source, target, strategy, name) {
  let result = { copied: 0, skipped: 0, backedUp: null };
  
  switch (strategy) {
    case 'proceed':
      // No conflicts, just copy
      result = copyRecursive(source, target);
      break;
      
    case 'skip':
      // Skip all conflicts
      console.log(`   ⏭️  Preserving existing ${name}`);
      result.skipped = getAllFiles(source).length;
      break;
      
    case 'backup':
      // Backup existing and copy fresh
      if (fs.existsSync(target)) {
        result.backedUp = backupDirectory(target);
        console.log(`   📦 Backed up to ${path.basename(result.backedUp)}`);
      }
      result = copyRecursive(source, target);
      break;
      
    case 'merge':
      // Only copy non-conflicting files
      result = copyRecursive(source, target, true);
      break;
      
    case 'cancel':
      console.log('❌ Setup cancelled');
      process.exit(0);
      break;
  }
  
  return result;
}

// Main setup function
async function main() {
  // Define source and target paths
  const sourceCommands = path.join(__dirname, '../.claude/commands');
  const targetCommands = '.claude/commands';
  const sourceAgents = path.join(__dirname, '../.claude/agents');
  const targetAgents = '.claude/agents';
  
  // Check if source files exist
  if (!fs.existsSync(sourceCommands)) {
    console.log('❌ Source commands not found. Make sure you\'re running from the correct package.');
    process.exit(1);
  }
  
  // Create .claude directory if it doesn't exist
  if (!fs.existsSync('.claude')) {
    fs.mkdirSync('.claude', { recursive: true });
    console.log('✅ Created .claude directory');
  }
  
  // Detect conflicts
  const commandConflicts = detectConflicts(sourceCommands, targetCommands);
  const agentConflicts = detectConflicts(sourceAgents, targetAgents);
  const allConflicts = [...new Set([...commandConflicts, ...agentConflicts])];
  
  // Determine strategy
  const strategy = await determineStrategy(allConflicts, options);
  
  // Copy commands
  console.log('\n📦 Installing Claude commands...');
  const commandResult = safeCopy(sourceCommands, targetCommands, strategy, 'commands');
  if (commandResult.copied > 0) {
    console.log(`   ✅ Installed ${commandResult.copied} command files`);
  }
  if (commandResult.skipped > 0) {
    console.log(`   ⏭️  Skipped ${commandResult.skipped} existing files`);
  }
  
  // Copy agents
  let agentResult = { copied: 0, skipped: 0, backedUp: null };
  if (fs.existsSync(sourceAgents)) {
    console.log('\n📦 Installing Claude agents...');
    agentResult = safeCopy(sourceAgents, targetAgents, strategy, 'agents');
    if (agentResult.copied > 0) {
      console.log(`   ✅ Installed ${agentResult.copied} agent files`);
    }
    if (agentResult.skipped > 0) {
      console.log(`   ⏭️  Skipped ${agentResult.skipped} existing files`);
    }
  }
  
  // Copy essential root files (only if they don't exist)
  console.log('\n📦 Setting up configuration files...');
  const filesToCopy = ['CLAUDE.md', 'AGENTS.md', 'ACTIVE_WORK.md'];
  let configCopied = 0;
  
  filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    if (fs.existsSync(sourcePath) && !fs.existsSync(file)) {
      fs.copyFileSync(sourcePath, file);
      console.log(`   ✅ Created ${file}`);
      configCopied++;
    }
  });
  
  if (configCopied === 0) {
    console.log('   ℹ️  Configuration files already exist');
  }
  
  // Final message
  console.log('');
  console.log('🎉 Setup complete!');
  console.log('');
  
  if (strategy === 'skip' || strategy === 'merge') {
    console.log('ℹ️  Some files were preserved to keep your customizations');
    console.log('');
  }
  
  console.log('Next steps:');
  console.log('• Review .claude/commands/ for available commands');
  console.log('• Use /hygiene to check project health');
  console.log('• Use /todo to manage tasks');
  console.log('• Customize commands for your specific needs');
  
  if (commandResult.backedUp || agentResult.backedUp) {
    console.log('');
    console.log('📝 Note: Your previous setup was backed up');
  }
}

// Run the setup
main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});