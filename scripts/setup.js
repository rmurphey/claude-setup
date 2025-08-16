#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 Claude Code Commands Setup');
console.log('==============================');

// Check if we're in a git repository
try {
  execSync('git status', { stdio: 'ignore' });
} catch (e) {
  console.log('❌ Not a git repository. Run "git init" first.');
  process.exit(1);
}

// Create .claude directory
if (!fs.existsSync('.claude')) {
  fs.mkdirSync('.claude', { recursive: true });
  console.log('✅ Created .claude directory');
}

// Copy commands
const sourceCommands = path.join(__dirname, '../.claude/commands');
const targetCommands = '.claude/commands';

if (fs.existsSync(sourceCommands)) {
  execSync(`cp -r "${sourceCommands}" "${targetCommands}"`);
  console.log('✅ Copied commands');
} else {
  console.log('❌ Source commands not found');
  process.exit(1);
}

// Copy agents
const sourceAgents = path.join(__dirname, '../.claude/agents');
const targetAgents = '.claude/agents';

if (fs.existsSync(sourceAgents)) {
  execSync(`cp -r "${sourceAgents}" "${targetAgents}"`);
  console.log('✅ Copied agents');
}

// Copy essential files
const filesToCopy = ['CLAUDE.md', 'AGENTS.md', 'ACTIVE_WORK.md'];

filesToCopy.forEach(file => {
  const sourcePath = path.join(__dirname, '..', file);
  if (fs.existsSync(sourcePath) && !fs.existsSync(file)) {
    fs.copyFileSync(sourcePath, file);
    console.log(`✅ Created ${file}`);
  }
});

console.log('');
console.log('🎉 Setup complete!');
console.log('');
console.log('Next steps:');
console.log('• Use /hygiene to check project health');
console.log('• Use /todo to manage tasks');
console.log('• Read AGENTS.md to understand agents vs commands');
console.log('• Customize commands in .claude/commands/ for your project');