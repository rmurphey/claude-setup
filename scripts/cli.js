#!/usr/bin/env node

/**
 * Main CLI entry point for claude-setup tools
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const commands = {
  setup: {
    script: 'setup.js',
    description: 'Initialize Claude Code commands in your project'
  },
  learn: {
    script: 'learn.js', 
    description: 'Capture and manage project learnings'
  },
  tdd: {
    script: 'tdd.js',
    description: 'Test-driven development workflow assistant'
  },
  docs: {
    script: 'docs.js',
    description: 'Documentation management and analysis'
  },
  monitor: {
    script: 'monitor-repo.js',
    description: 'Monitor GitHub repository health'
  },
  retrospective: {
    script: 'retrospective.js',
    description: 'Session retrospective analysis'
  }
};

function showHelp() {
  console.log('🤖 Claude Setup - AI-Assisted Development Tools');
  console.log('================================================');
  console.log('');
  console.log('Usage: claude-setup [command] [options]');
  console.log('');
  console.log('Commands:');
  Object.entries(commands).forEach(([name, info]) => {
    console.log(`  ${name.padEnd(15)} ${info.description}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  claude-setup                  # Interactive setup');
  console.log('  claude-setup learn add "..."  # Add a learning');
  console.log('  claude-setup tdd start        # Start TDD workflow');
  console.log('  claude-setup docs             # Analyze documentation');
  console.log('  claude-setup monitor status   # Check repo health');
  console.log('');
  console.log('For command-specific help:');
  console.log('  claude-setup [command] --help');
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

// No command - show help or run setup
if (!command || command === '--help' || command === '-h') {
  if (!command) {
    // Default to setup if no command given
    const setupScript = path.join(__dirname, 'setup.js');
    require(setupScript);
  } else {
    showHelp();
  }
  process.exit(0);
}

// Check if command exists
if (!commands[command]) {
  console.error(`❌ Unknown command: ${command}`);
  console.error('');
  showHelp();
  process.exit(1);
}

// Execute the command
const scriptPath = path.join(__dirname, commands[command].script);
if (!fs.existsSync(scriptPath)) {
  console.error(`❌ Script not found: ${scriptPath}`);
  process.exit(1);
}

// Pass remaining arguments to the script
process.argv = [process.argv[0], scriptPath, ...args.slice(1)];
require(scriptPath);