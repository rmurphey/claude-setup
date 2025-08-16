#!/usr/bin/env node

/**
 * Learning Capture Script
 * Capture and organize insights from development work
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const command = process.argv[2] || 'help';
const args = process.argv.slice(3).join(' ');

const LEARNINGS_FILE = 'LEARNINGS.md';
const LEARNINGS_DIR = '.claude/learnings';

function ensureSetup() {
  // Ensure learnings directory exists
  if (!fs.existsSync(LEARNINGS_DIR)) {
    fs.mkdirSync(LEARNINGS_DIR, { recursive: true });
  }
  
  // Create LEARNINGS.md if it doesn't exist
  if (!fs.existsSync(LEARNINGS_FILE)) {
    const template = `# Project Learnings

Captured insights, discoveries, and knowledge gained during development.

## Table of Contents
- [Recent Insights](#recent-insights)
- [Technical Discoveries](#technical-discoveries)
- [Best Practices](#best-practices)
- [Gotchas & Pitfalls](#gotchas--pitfalls)

## Recent Insights

## Technical Discoveries

## Best Practices

## Gotchas & Pitfalls
`;
    fs.writeFileSync(LEARNINGS_FILE, template);
  }
}

function addLearning(insight) {
  if (!insight) {
    console.log('❌ Please provide a learning topic or insight');
    console.log('Usage: /learn add <insight or topic>');
    process.exit(1);
  }
  
  ensureSetup();
  
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().slice(0, 5);
  
  console.log(`📝 Capturing learning: ${insight}`);
  
  // Read current content
  let content = fs.readFileSync(LEARNINGS_FILE, 'utf8');
  
  // Add to Recent Insights section
  const entry = `\n### ${date} - ${time}\n${insight}\n`;
  content = content.replace(
    '## Recent Insights',
    `## Recent Insights\n${entry}`
  );
  
  fs.writeFileSync(LEARNINGS_FILE, content);
  
  // Also save to dated file
  const monthFile = path.join(LEARNINGS_DIR, `${date.slice(0, 7)}.md`);
  const monthEntry = `## ${date} - ${time}\n${insight}\n\n`;
  
  if (fs.existsSync(monthFile)) {
    fs.appendFileSync(monthFile, monthEntry);
  } else {
    fs.writeFileSync(monthFile, `# Learnings - ${date.slice(0, 7)}\n\n${monthEntry}`);
  }
  
  console.log('✅ Learning captured successfully');
  console.log(`  • Added to ${LEARNINGS_FILE}`);
  console.log(`  • Archived in ${monthFile}`);
}

function listLearnings(filter) {
  ensureSetup();
  
  console.log('📚 Project Learnings');
  console.log('===================');
  console.log('');
  
  if (filter === 'recent') {
    // Show recent learnings
    const content = fs.readFileSync(LEARNINGS_FILE, 'utf8');
    const recentSection = content.match(/## Recent Insights[\s\S]*?(?=##|$)/);
    
    if (recentSection) {
      const entries = recentSection[0].match(/### \d{4}-\d{2}-\d{2}/g) || [];
      console.log(`Found ${entries.length} recent insights`);
      console.log('');
      
      // Show last 5
      const lines = recentSection[0].split('\n').slice(0, 20);
      lines.forEach(line => {
        if (line.startsWith('###')) {
          console.log(`  📌 ${line.replace('###', '').trim()}`);
        } else if (line.trim() && !line.startsWith('##')) {
          console.log(`     ${line.trim()}`);
        }
      });
    }
  } else if (filter === 'categories') {
    // Show by category
    const content = fs.readFileSync(LEARNINGS_FILE, 'utf8');
    const categories = content.match(/^## .+$/gm) || [];
    
    console.log('Categories:');
    categories.forEach(cat => {
      const name = cat.replace('##', '').trim();
      if (name !== 'Table of Contents') {
        console.log(`  • ${name}`);
      }
    });
  } else {
    // Show summary
    const content = fs.readFileSync(LEARNINGS_FILE, 'utf8');
    const insights = (content.match(/### \d{4}-\d{2}-\d{2}/g) || []).length;
    
    // Count archived files
    let archived = 0;
    if (fs.existsSync(LEARNINGS_DIR)) {
      archived = fs.readdirSync(LEARNINGS_DIR).filter(f => f.endsWith('.md')).length;
    }
    
    console.log('Summary:');
    console.log(`  • Total insights: ${insights}`);
    console.log(`  • Archive files: ${archived}`);
    console.log(`  • Main file: ${LEARNINGS_FILE}`);
    console.log('');
    console.log('Use "/learn list recent" to see recent insights');
    console.log('Use "/learn search <term>" to find specific learnings');
  }
}

function searchLearnings(term) {
  if (!term) {
    console.log('❌ Please provide a search term');
    console.log('Usage: /learn search <term>');
    process.exit(1);
  }
  
  ensureSetup();
  
  console.log(`🔍 Searching for: ${term}`);
  console.log('==================');
  console.log('');
  
  // Search in main file
  const content = fs.readFileSync(LEARNINGS_FILE, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  
  lines.forEach((line, index) => {
    if (line.toLowerCase().includes(term.toLowerCase())) {
      // Get context (line before and after)
      const context = {
        line: line,
        lineNum: index + 1,
        before: lines[index - 1] || '',
        after: lines[index + 1] || ''
      };
      matches.push(context);
    }
  });
  
  if (matches.length > 0) {
    console.log(`Found ${matches.length} matches:`);
    console.log('');
    
    matches.slice(0, 5).forEach(match => {
      console.log(`  Line ${match.lineNum}: ${match.line.trim()}`);
      if (match.before.startsWith('###')) {
        console.log(`    (${match.before.replace('###', '').trim()})`);
      }
    });
    
    if (matches.length > 5) {
      console.log(`  ... and ${matches.length - 5} more`);
    }
  } else {
    console.log('No matches found');
  }
}

function reviewLearnings() {
  ensureSetup();
  
  console.log('📖 Review Mode');
  console.log('=============');
  console.log('');
  
  // Get a random learning for review
  const content = fs.readFileSync(LEARNINGS_FILE, 'utf8');
  const insights = content.match(/### \d{4}-\d{2}-\d{2}[\s\S]*?(?=###|##|$)/g) || [];
  
  if (insights.length > 0) {
    const random = insights[Math.floor(Math.random() * insights.length)];
    console.log('Random learning for review:');
    console.log('');
    console.log(random.trim());
    console.log('');
    console.log('💡 Reflect on this learning and consider if it still applies');
  } else {
    console.log('No learnings to review yet. Start capturing insights with:');
    console.log('  /learn add <your insight>');
  }
}

function showCategories() {
  ensureSetup();
  
  console.log('📂 Learning Categories');
  console.log('=====================');
  console.log('');
  console.log('Available categories for organizing learnings:');
  console.log('');
  console.log('  • Recent Insights - Latest discoveries');
  console.log('  • Technical Discoveries - Implementation details');
  console.log('  • Best Practices - Patterns that work well');
  console.log('  • Gotchas & Pitfalls - Things to avoid');
  console.log('');
  console.log('Edit LEARNINGS.md to add insights to specific categories');
}

function showHelp() {
  console.log('📚 Learning Capture Commands');
  console.log('===========================');
  console.log('');
  console.log('Available commands:');
  console.log('  /learn add <insight>    - Capture a new learning');
  console.log('  /learn list [filter]    - List learnings (recent/categories)');
  console.log('  /learn search <term>    - Search for specific learnings');
  console.log('  /learn review           - Review a random learning');
  console.log('  /learn categories       - Show available categories');
  console.log('  /learn help             - Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  /learn add "React hooks must be called in consistent order"');
  console.log('  /learn search "performance"');
  console.log('  /learn list recent');
}

// Main execution
switch (command) {
  case 'add':
  case 'new':
  case 'capture':
    addLearning(args);
    break;
  case 'list':
  case 'show':
    listLearnings(args);
    break;
  case 'search':
  case 'find':
    searchLearnings(args);
    break;
  case 'review':
  case 'random':
    reviewLearnings();
    break;
  case 'categories':
  case 'cats':
    showCategories();
    break;
  case 'help':
  default:
    showHelp();
}