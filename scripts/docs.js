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
    const commandsDir = path.join(process.cwd(), '.claude', 'commands');
    let count = 0;
    
    function countInDir(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          countInDir(fullPath);
        } else if (item.endsWith('.md') && item !== 'README.md') {
          count++;
        }
      }
    }
    
    countInDir(commandsDir);
    return count;
  } catch {
    return 0;
  }
}

function updateReadme() {
  console.log('📝 Updating README documentation...');
  
  const commandCount = countCommands();
  console.log(`  Found ${commandCount} commands in .claude/commands/`);
  
  const readmePath = path.join(process.cwd(), 'README.md');
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

function findBrokenLinks(content, _filename) {
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
  
  const catalogPath = path.join(process.cwd(), 'docs', 'COMMAND_CATALOG.md');
  const commandsDir = path.join(process.cwd(), '.claude', 'commands');
  
  // Recursively find all command files
  const commands = [];
  
  function scanDir(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath, prefix ? `${prefix}/${item}` : item);
      } else if (item.endsWith('.md') && item !== 'README.md') {
        const content = fs.readFileSync(fullPath, 'utf8');
        const descMatch = content.match(/^description:\s*(.+)$/m);
        const name = item.replace('.md', '');
        const desc = descMatch ? descMatch[1] : 'No description';
        const location = prefix ? `${prefix}/${name}` : name;
        commands.push({ 
          name, 
          desc, 
          location,
          category: prefix || 'Core'
        });
      }
    }
  }
  
  scanDir(commandsDir);
  
  // Group by category
  const categories = {};
  commands.forEach(cmd => {
    if (!categories[cmd.category]) {
      categories[cmd.category] = [];
    }
    categories[cmd.category].push(cmd);
  });
  
  // Sort categories and commands
  const categoryOrder = ['Core', 'maintenance', 'planning'];
  const sortedCategories = categoryOrder.filter(cat => categories[cat]);
  
  // Format categories nicely
  const categoryNames = {
    'Core': 'Core Workflow Commands',
    'maintenance': 'Maintenance Commands',
    'planning': 'Planning Commands'
  };
  
  let catalogContent = `# Command Catalog

Complete list of all available Claude Code commands organized by category.

Last updated: ${new Date().toISOString().split('T')[0]}  
Total Commands: ${commands.length}

`;
  
  for (const cat of sortedCategories) {
    const cmds = categories[cat];
    catalogContent += `## ${categoryNames[cat] || cat} (${cmds.length})\n\n`;
    cmds.sort((a, b) => a.name.localeCompare(b.name));
    cmds.forEach(cmd => {
      catalogContent += `### /${cmd.name}\n${cmd.desc}  \nLocation: \`.claude/commands/${cmd.location}.md\`\n\n`;
    });
  }
  
  // Add summary table
  catalogContent += '---\n\n## Command Categories Summary\n\n';
  catalogContent += '| Category | Count | Purpose |\n';
  catalogContent += '|----------|-------|---------|\n';
  catalogContent += `| Core Workflow | ${categories['Core']?.length || 0} | Daily development tasks |\n`;
  catalogContent += `| Maintenance | ${categories['maintenance']?.length || 0} | Repository maintenance |\n`;
  catalogContent += `| Planning | ${categories['planning']?.length || 0} | Planning and ideation |\n`;
  
  // Write catalog file
  fs.writeFileSync(catalogPath, catalogContent);
  console.log(`    ✓ Updated ${commands.length} commands in catalog`);
  
  return commands.length;
}

function showCatalog() {
  console.log('📖 Analyzing Command Catalog...');
  console.log('');
  console.log('Available Commands:');
  
  const commandsDir = path.join(process.cwd(), '.claude', 'commands');
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const content = fs.readFileSync(path.join(commandsDir, file), 'utf8');
    const descMatch = content.match(/^description:\s*(.+)$/m);
    const name = file.replace('.md', '');
    const desc = descMatch ? descMatch[1] : 'No description';
    console.log(`  • /${name.padEnd(15)} - ${desc}`);
  }
  
  console.log('');
  console.log('Use \'/docs validate\' to check for issues');
}

function updateAll() {
  console.log('🔄 Updating all documentation...');
  console.log('================================');
  console.log('');
  
  // Update README
  console.log('📝 Updating README...');
  const commandCount = countCommands();
  console.log(`  Found ${commandCount} commands in .claude/commands/`);
  
  const readmePath = path.join(process.cwd(), 'README.md');
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
  
  // Update Examples
  console.log('');
  updateExamples();
  
  // Show doc stats
  const docCount = execSync('find docs -name "*.md" 2>/dev/null | wc -l', { encoding: 'utf8' }).trim();
  
  console.log('');
  console.log('✅ All documentation updated successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`  • README.md updated (badge: ${commandCount} commands)`);
  console.log(`  • COMMAND_CATALOG.md updated (${catalogCount} commands documented)`);
  console.log('  • Commit examples updated in README.md and CLAUDE.md');
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
  console.log('  /docs examples  - Update commit examples in docs');
  console.log('  /docs validate  - Check for broken links');
  console.log('  /docs stats     - Show documentation statistics');
  console.log('  /docs catalog   - Show available commands');
  console.log('  /docs tone      - Analyze documentation tone with AI agent');
  console.log('  /docs help      - Show this help message');
  console.log('');
  console.log('For advanced operations, see .claude/commands/detailed/docs-detailed.md');
}

// Note: These helper functions have been simplified or removed
// We now use manual curation for commit examples (see /docs-explain)

/**
 * Run tone analysis using the documentation-auditor agent
 * Provides instructions for invoking the agent via Claude's Task tool
 */
function runToneAnalysis() {
  console.log('🎨 Documentation Tone Analysis');
  console.log('==============================');
  console.log('');
  console.log('The documentation-auditor agent analyzes your documentation for:');
  console.log('  • Professional yet friendly tone');
  console.log('  • Clear and inclusive language');
  console.log('  • Helpful and encouraging phrasing');
  console.log('  • Consistent voice across files');
  console.log('  • Completeness and consistency');
  console.log('');
  console.log('To run the tone analysis, use Claude\'s Task tool:');
  console.log('');
  console.log('📋 Instructions for Claude:');
  console.log('───────────────────────────');
  console.log('Use the Task tool with:');
  console.log('  • subagent_type: "general-purpose"');
  console.log('  • description: "Analyze documentation tone and quality"');
  console.log('  • prompt: Read and follow the instructions in .claude/agents/documentation-auditor.md');
  console.log('');
  console.log('The agent will:');
  console.log('  1. Scan all documentation files');
  console.log('  2. Score tone across multiple dimensions');
  console.log('  3. Check completeness and consistency');
  console.log('  4. Identify problematic patterns');
  console.log('  5. Suggest specific improvements');
  console.log('  6. Generate a report in .claude/agents/reports/');
  console.log('');
  console.log('Agent location: .claude/agents/documentation-auditor.md');
  console.log('');
  console.log('💡 Tip: The agent provides comprehensive documentation quality analysis');
}

/**
 * Validate if a commit exists in the repository
 * @param {string} hash - Commit hash to validate
 * @returns {boolean} True if commit exists, false otherwise
 */
function validateCommitExists(hash) {
  if (!hash) return false;
  
  try {
    execSync(`git rev-parse ${hash} 2>/dev/null`, { encoding: 'utf8' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Update documentation with commit examples
 * Note: This now just validates that manually curated examples are valid.
 * We've moved to manual curation for better educational value.
 */
function updateExamples() {
  console.log('📚 Validating manually curated commit examples...');
  console.log('');
  
  // Read README to find existing commit references
  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) {
    console.log('  ⚠️  README.md not found');
    return;
  }
  
  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  
  // Extract commit hashes from markdown links
  const commitPattern = /\[.*?\]\(\.\.\/\.\.\/commit\/([a-f0-9]+)\)/g;
  const commits = [];
  let match;
  
  while ((match = commitPattern.exec(readmeContent)) !== null) {
    commits.push({
      hash: match[1],
      fullMatch: match[0]
    });
  }
  
  console.log(`  Found ${commits.length} commit references in README.md`);
  
  // Validate all examples still exist
  console.log('');
  console.log('  Validating commit references...');
  let invalidCount = 0;
  commits.forEach(commit => {
    if (!validateCommitExists(commit.hash)) {
      console.log(`    ⚠️  Invalid commit: ${commit.hash} in ${commit.fullMatch}`);
      invalidCount++;
    }
  });
  
  if (invalidCount === 0) {
    console.log('    ✓ All commit references are valid');
  } else {
    console.log(`    ⚠️  Found ${invalidCount} invalid references - please update manually`);
    console.log('');
    console.log('  💡 Tip: Commits are now manually curated for educational value.');
    console.log('     See /docs-explain for the philosophy behind this approach.');
  }
  
  // Also check CLAUDE.md for TDD examples
  const claudePath = path.join(process.cwd(), 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    console.log('');
    console.log('  Checking CLAUDE.md TDD examples...');
    const claudeContent = fs.readFileSync(claudePath, 'utf8');
    const claudeCommits = [];
    let claudeMatch;
    
    while ((claudeMatch = commitPattern.exec(claudeContent)) !== null) {
      claudeCommits.push(claudeMatch[1]);
    }
    
    console.log(`    Found ${claudeCommits.length} commit references in CLAUDE.md`);
  }
  
  console.log('');
  console.log('✅ Documentation validation complete');
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
    case 'examples':
      updateExamples();
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
    case 'tone':
      runToneAnalysis();
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
    updateCommandCatalog,
    validateCommitExists,
    updateExamples
  };
}