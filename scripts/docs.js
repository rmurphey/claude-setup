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
  
  const catalogPath = path.join(process.cwd(), 'docs', 'COMMAND_CATALOG.md');
  const commandsDir = path.join(process.cwd(), '.claude', 'commands');
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
  console.log(`  • Commit examples updated in README.md and CLAUDE.md`);
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

/**
 * Find exemplary commits matching a pattern
 * @param {string} pattern - Pattern to search for in commit messages
 * @param {number} limit - Maximum number of commits to return (default 5)
 * @returns {Array} Array of commit objects with hash and message
 */
function findExemplaryCommits(pattern, limit = 5) {
  try {
    const output = execSync(
      `git log --grep="${pattern}" --oneline -${limit} 2>/dev/null || echo ""`,
      { encoding: 'utf8' }
    ).trim();
    
    if (!output) return [];
    
    return output.split('\n').map(line => {
      const [hash, ...messageParts] = line.split(' ');
      return {
        hash,
        message: messageParts.join(' ')
      };
    });
  } catch (error) {
    return [];
  }
}

/**
 * Categorize a commit message by its type
 * @param {string} message - Commit message to categorize
 * @returns {string} Category of the commit
 */
function categorizeCommit(message) {
  if (message.includes('🔴') || (message.includes('test:') && message.toLowerCase().includes('fail'))) {
    return 'tdd-red';
  }
  if (message.includes('🟢') || (message.includes('feat:') && message.toLowerCase().includes('pass'))) {
    return 'tdd-green';
  }
  if (message.startsWith('feat:')) {
    return 'feature';
  }
  if (message.startsWith('fix:')) {
    return 'fix';
  }
  if (message.startsWith('docs:')) {
    return 'docs';
  }
  if (message.startsWith('refactor:')) {
    return 'refactor';
  }
  if (message.startsWith('test:')) {
    return 'test';
  }
  return 'other';
}

/**
 * Format a commit as a markdown link
 * @param {string} hash - Commit hash
 * @param {string} message - Commit message
 * @returns {string} Formatted markdown link
 */
function formatCommitReference(hash, message) {
  const maxLength = 80;
  let displayMessage = message;
  
  if (message.length > maxLength) {
    displayMessage = message.substring(0, maxLength - 3) + '...';
  }
  
  return `[${displayMessage}](../../commit/${hash})`;
}

/**
 * Update a section in markdown content with examples
 * @param {string} content - Original markdown content
 * @param {string} sectionName - Name of the section to update
 * @param {Array} examples - Array of example commits
 * @returns {string} Updated content
 */
function updateExampleSection(content, sectionName, examples) {
  const sectionHeader = `### ${sectionName}`;
  const formattedExamples = examples.map(ex => 
    `- ${formatCommitReference(ex.hash, ex.message)}`
  ).join('\n');
  
  // Check if section exists
  if (content.includes(sectionHeader)) {
    // Find section boundaries
    const startIndex = content.indexOf(sectionHeader);
    const afterHeader = startIndex + sectionHeader.length;
    
    // Find next section (### or ##)
    let endIndex = content.indexOf('\n###', afterHeader);
    if (endIndex === -1) {
      endIndex = content.indexOf('\n##', afterHeader);
    }
    if (endIndex === -1) {
      endIndex = content.length;
    }
    
    // Replace section content
    return content.substring(0, afterHeader) + 
           '\n\n' + formattedExamples + '\n' +
           content.substring(endIndex);
  } else {
    // Add new section at the end
    return content + '\n\n' + sectionHeader + '\n\n' + formattedExamples + '\n';
  }
}

/**
 * Run tone analysis using the documentation-tone agent
 * Provides instructions for invoking the agent via Claude's Task tool
 */
function runToneAnalysis() {
  console.log('🎨 Documentation Tone Analysis');
  console.log('==============================');
  console.log('');
  console.log('The documentation-tone agent analyzes your documentation for:');
  console.log('  • Professional yet friendly tone');
  console.log('  • Clear and inclusive language');
  console.log('  • Helpful and encouraging phrasing');
  console.log('  • Consistent voice across files');
  console.log('');
  console.log('To run the tone analysis, use Claude\'s Task tool:');
  console.log('');
  console.log('📋 Instructions for Claude:');
  console.log('───────────────────────────');
  console.log('Use the Task tool with:');
  console.log('  • subagent_type: "general-purpose"');
  console.log('  • description: "Analyze documentation tone"');
  console.log('  • prompt: Read and follow the instructions in .claude/agents/documentation-tone.md');
  console.log('');
  console.log('The agent will:');
  console.log('  1. Scan all documentation files');
  console.log('  2. Score tone across multiple dimensions');
  console.log('  3. Identify problematic patterns');
  console.log('  4. Suggest specific improvements');
  console.log('  5. Generate a report in .claude/agents/reports/');
  console.log('');
  console.log('Agent location: .claude/agents/documentation-tone.md');
  console.log('');
  console.log('💡 Tip: The agent can also fix issues automatically with the --fix flag');
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
  } catch (error) {
    return false;
  }
}

/**
 * Update documentation with commit examples
 * Updates both README.md and CLAUDE.md with relevant commit examples
 */
function updateExamples() {
  console.log('📚 Updating documentation with commit examples...');
  console.log('');
  
  // Define example categories and patterns
  const categories = [
    { name: 'TDD Workflow', patterns: ['🔴', '🟢', 'TDD'], limit: 5 },
    { name: 'Features', patterns: ['feat:'], limit: 5 },
    { name: 'Fixes', patterns: ['fix:'], limit: 3 },
    { name: 'Documentation', patterns: ['docs:'], limit: 3 },
    { name: 'Refactoring', patterns: ['refactor:'], limit: 3 }
  ];
  
  let totalExamples = 0;
  const allExamples = {};
  
  // Collect examples for each category
  categories.forEach(category => {
    console.log(`  Searching for ${category.name} examples...`);
    const examples = [];
    
    category.patterns.forEach(pattern => {
      const commits = findExemplaryCommits(pattern, category.limit);
      commits.forEach(commit => {
        // Avoid duplicates
        if (!examples.find(ex => ex.hash === commit.hash)) {
          examples.push(commit);
        }
      });
    });
    
    // Take only the limit amount
    allExamples[category.name] = examples.slice(0, category.limit);
    totalExamples += allExamples[category.name].length;
    console.log(`    Found ${allExamples[category.name].length} examples`);
  });
  
  // Update README.md
  const readmePath = path.join(process.cwd(), 'README.md');
  if (fs.existsSync(readmePath)) {
    console.log('');
    console.log('  Updating README.md...');
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    
    // Create examples section content
    let examplesSection = '### Living Examples from This Repository\n\n';
    
    Object.entries(allExamples).forEach(([category, examples]) => {
      if (examples.length > 0) {
        examplesSection += `#### ${category}\n`;
        examples.forEach(ex => {
          examplesSection += `- ${formatCommitReference(ex.hash, ex.message)}\n`;
        });
        examplesSection += '\n';
      }
    });
    
    // Update or add the section
    readmeContent = updateExampleSection(readmeContent, 'Living Examples from This Repository', 
      Object.values(allExamples).flat());
    
    fs.writeFileSync(readmePath, readmeContent);
    console.log('    ✓ Updated README.md with examples');
  }
  
  // Update CLAUDE.md
  const claudePath = path.join(process.cwd(), 'CLAUDE.md');
  if (fs.existsSync(claudePath)) {
    console.log('  Updating CLAUDE.md...');
    let claudeContent = fs.readFileSync(claudePath, 'utf8');
    
    // Only add TDD examples to CLAUDE.md
    const tddExamples = allExamples['TDD Workflow'] || [];
    if (tddExamples.length > 0) {
      claudeContent = updateExampleSection(claudeContent, 'TDD Examples', tddExamples);
      fs.writeFileSync(claudePath, claudeContent);
      console.log('    ✓ Updated CLAUDE.md with TDD examples');
    }
  }
  
  console.log('');
  console.log(`✅ Updated documentation with ${totalExamples} commit examples`);
  
  // Validate all examples still exist
  console.log('');
  console.log('  Validating commit references...');
  let invalidCount = 0;
  Object.values(allExamples).flat().forEach(ex => {
    if (!validateCommitExists(ex.hash)) {
      console.log(`    ⚠️  Invalid commit: ${ex.hash}`);
      invalidCount++;
    }
  });
  
  if (invalidCount === 0) {
    console.log('    ✓ All commit references are valid');
  } else {
    console.log(`    ⚠️  Found ${invalidCount} invalid references`);
  }
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
    findExemplaryCommits,
    categorizeCommit,
    formatCommitReference,
    updateExampleSection,
    validateCommitExists,
    updateExamples
  };
}