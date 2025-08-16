#!/usr/bin/env node

/**
 * Documentation management script
 * Handles README updates, link validation, and documentation statistics
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const command = process.argv[2] || 'all';

function countCommands() {
  try {
    const commandsDir = path.join(__dirname, '..', '.claude', 'commands');
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
    return files.length;
  } catch {
    return 0;
  }
}

function updateReadme() {
  console.log('📝 Updating README documentation...');
  
  const commandCount = countCommands();
  console.log(`  Found ${commandCount} commands in .claude/commands/`);
  
  const readmePath = path.join(__dirname, '..', 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Update command count badge
    if (content.includes('commands-')) {
      content = content.replace(/commands-\d+\+?/g, `commands-${commandCount}`);
      fs.writeFileSync(readmePath, content);
      console.log(`  ✓ Updated command count badge to ${commandCount}`);
    }
  }
  
  // Show doc stats
  const docCount = execSync('find docs -name "*.md" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
  console.log(`  ✓ Documentation files: ${docCount}`);
  
  console.log('✅ README updated successfully');
}

function findBrokenLinks(content, filename) {
  const brokenLinks = [];
  const linkRegex = /\[([^\]]+)\]\(([^http][^)]+\.md[^)]*)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2].split('#')[0];
    
    // Check if file exists relative to repo root
    const possiblePaths = [
      linkPath,
      path.join('docs', linkPath),
      path.join('.claude', 'commands', linkPath)
    ];
    
    if (!possiblePaths.some(p => fs.existsSync(p))) {
      brokenLinks.push(linkPath);
    }
  }
  
  return brokenLinks;
}

function validateDocs() {
  console.log('🔍 Validating documentation...');
  console.log('');
  console.log('Checking internal links...');
  
  let totalBroken = 0;
  const files = ['README.md', ...fs.readdirSync('docs').filter(f => f.endsWith('.md')).map(f => `docs/${f}`)];
  
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf8');
    const brokenLinks = findBrokenLinks(content, file);
    
    brokenLinks.forEach(link => {
      console.log(`  ❌ Broken link in ${path.basename(file)}: ${link}`);
      totalBroken++;
    });
  }
  
  if (totalBroken === 0) {
    console.log('  ✓ All internal links valid');
  }
  
  console.log('');
  console.log('✅ Validation complete');
}

function showStats() {
  console.log('📊 Documentation Statistics');
  console.log('===========================');
  console.log('');
  
  // Command statistics
  const commandCount = countCommands();
  const detailedCount = fs.existsSync('.claude/commands/detailed') ? 
    fs.readdirSync('.claude/commands/detailed').filter(f => f.endsWith('.md')).length : 0;
  
  console.log('Commands:');
  console.log(`  • Core commands: ${commandCount}`);
  console.log(`  • Detailed versions: ${detailedCount}`);
  console.log('');
  
  // Documentation statistics
  const docCount = fs.readdirSync('docs').filter(f => f.endsWith('.md')).length;
  const readmeLines = fs.readFileSync('README.md', 'utf8').split('\n').length;
  const totalLines = execSync('find . -name "*.md" -not -path "./node_modules/*" -not -path "./session-history/*" | xargs wc -l 2>/dev/null | tail -1', { encoding: 'utf8' })
    .trim().split(/\s+/)[0];
  
  console.log('Documentation:');
  console.log(`  • Files in docs/: ${docCount}`);
  console.log(`  • README lines: ${readmeLines}`);
  console.log(`  • Total markdown lines: ${totalLines}`);
  console.log('');
  
  // Code examples
  let codeBlocks = 0;
  ['README.md', ...fs.readdirSync('docs').filter(f => f.endsWith('.md')).map(f => `docs/${f}`)].forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      codeBlocks += (content.match(/```/g) || []).length / 2;
    }
  });
  
  console.log('Content:');
  console.log(`  • Code examples: ~${Math.floor(codeBlocks)} blocks`);
  
  // Git info
  try {
    const lastUpdate = execSync('git log -1 --format="%cr" -- "*.md" 2>/dev/null', { encoding: 'utf8' }).trim();
    console.log('');
    console.log('Maintenance:');
    console.log(`  • Last doc update: ${lastUpdate}`);
  } catch {
    // Git not available or no history
  }
}

function updateCommandCatalog() {
  console.log('  📖 Updating Command Catalog...');
  
  const catalogPath = path.join(__dirname, '..', 'docs', 'COMMAND_CATALOG.md');
  const commandsDir = path.join(__dirname, '..', '.claude', 'commands');
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  
  let catalogContent = `# Command Catalog

Complete list of available Claude Code commands.

Last updated: ${new Date().toISOString().split('T')[0]}

## Available Commands

`;
  
  // Group commands by category (could be enhanced)
  const commands = [];
  for (const file of files) {
    const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
    const descMatch = content.match(/^description:\s*(.+)$/m);
    const name = file.replace('.md', '');
    const desc = descMatch ? descMatch[1] : 'No description';
    commands.push({ name, desc });
  }
  
  // Sort alphabetically
  commands.sort((a, b) => a.name.localeCompare(b.name));
  
  // Add to catalog
  commands.forEach(cmd => {
    catalogContent += `### /${cmd.name}\n\n${cmd.desc}\n\nLocation: \`.claude/commands/${cmd.name}.md\`\n\n---\n\n`;
  });
  
  catalogContent += `\n## Total Commands: ${commands.length}\n`;
  
  // Write catalog file
  fs.writeFileSync(catalogPath, catalogContent);
  console.log(`    ✓ Updated ${commands.length} commands in catalog`);
  
  return commands.length;
}

function showCatalog() {
  console.log('📖 Analyzing Command Catalog...');
  console.log('');
  console.log('Available Commands:');
  
  const commandsDir = path.join(__dirname, '..', '.claude', 'commands');
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
    const descMatch = content.match(/^description:\s*(.+)$/m);
    const name = file.replace('.md', '');
    const desc = descMatch ? descMatch[1] : 'No description';
    console.log(`  • /${name.padEnd(15)} - ${desc}`);
  }
  
  console.log('');
  console.log("Use '/docs validate' to check for issues");
}

function updateAll() {
  console.log('🔄 Updating all documentation...');
  console.log('================================');
  console.log('');
  
  // Update README
  console.log('📝 Updating README...');
  const commandCount = countCommands();
  console.log(`  Found ${commandCount} commands in .claude/commands/`);
  
  const readmePath = path.join(__dirname, '..', 'README.md');
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Update command count badge
    if (content.includes('commands-')) {
      content = content.replace(/commands-\d+\+?/g, `commands-${commandCount}`);
      fs.writeFileSync(readmePath, content);
      console.log(`  ✓ Updated command count badge to ${commandCount}`);
    }
  }
  
  // Update Command Catalog
  const catalogCount = updateCommandCatalog();
  
  // Show doc stats
  const docCount = execSync('find docs -name "*.md" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
  
  console.log('');
  console.log('✅ All documentation updated successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  • README.md updated (badge: ${commandCount} commands)`);
  console.log(`  • COMMAND_CATALOG.md updated (${catalogCount} commands documented)`);
  console.log(`  • Total documentation files: ${docCount}`);
}

function showHelp() {
  console.log('📚 Documentation Commands');
  console.log('========================');
  console.log('');
  console.log('Available commands:');
  console.log('  /docs           - Update all documentation (default)');
  console.log('  /docs all       - Update all documentation');
  console.log('  /docs readme    - Update only README.md');
  console.log('  /docs validate  - Check for broken links');
  console.log('  /docs stats     - Show documentation statistics');
  console.log('  /docs catalog   - Show available commands');
  console.log('  /docs help      - Show this help message');
  console.log('');
  console.log('For advanced operations, see .claude/commands/detailed/docs-detailed.md');
}

// Main execution
if (require.main === module) {
  // CLI execution
  switch (command) {
    case 'all':
    case 'update':
      updateAll();
      break;
    case 'readme':
      updateReadme();
      break;
    case 'validate':
      validateDocs();
      break;
    case 'stats':
      showStats();
      break;
    case 'catalog':
      showCatalog();
      break;
    case 'help':
      showHelp();
      break;
    default:
      updateAll();
  }
} else {
  // Export for testing
  module.exports = {
    countCommands,
    findBrokenLinks,
    updateAll,
    updateCommandCatalog
  };
}