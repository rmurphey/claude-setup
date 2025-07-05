/**
 * Automatically update README with current command count and descriptions
 * 
 * This is a template version for generated projects
 */
import fs from 'fs-extra';
import path from 'path';

/**
 * Get list of commands by scanning .claude/commands directory
 */
export async function getCommandList() {
  try {
    const commandsDir = '.claude/commands';
    if (!await fs.pathExists(commandsDir)) {
      return [];
    }
    
    const files = await fs.readdir(commandsDir);
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
      .sort();
  } catch (error) {
    console.warn('Could not read commands directory:', error.message);
    return [];
  }
}

/**
 * Get command descriptions from actual command files
 */
export async function getCommandDescriptions() {
  const commands = await getCommandList();
  const descriptions = {};
  
  for (const cmd of commands) {
    try {
      const cmdPath = `.claude/commands/${cmd}.md`;
      if (await fs.pathExists(cmdPath)) {
        const content = await fs.readFile(cmdPath, 'utf-8');
        // Extract description from YAML frontmatter
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (frontmatterMatch) {
          const yamlContent = frontmatterMatch[1];
          const descMatch = yamlContent.match(/description:\s*(.+)/);
          if (descMatch) {
            descriptions[cmd] = descMatch[1];
          }
        }
        
        // Fallback: look for first heading
        if (!descriptions[cmd]) {
          const headingMatch = content.match(/^# (.+)$/m);
          if (headingMatch) {
            descriptions[cmd] = headingMatch[1];
          }
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not read description for ${cmd}: ${error.message}`);
    }
  }
  
  return descriptions;
}

/**
 * Categorize commands for README display
 * Note: This is a basic categorization - customize for your project
 */
export function categorizeCommands(commands) {
  // Basic categorization - projects should customize this
  const categories = {
    'Core Workflow': [],
    'Planning & Design': [],
    'Quality & Testing': [],
    'Documentation': [],
    'Maintenance': []
  };
  
  // Auto-categorize based on command names
  commands.forEach(cmd => {
    if (['hygiene', 'todo', 'commit', 'next'].includes(cmd)) {
      categories['Core Workflow'].push({ cmd, desc: `${cmd} command` });
    } else if (['design', 'estimate', 'ideation'].includes(cmd)) {
      categories['Planning & Design'].push({ cmd, desc: `${cmd} command` });
    } else if (['test', 'quality', 'lint'].some(keyword => cmd.includes(keyword))) {
      categories['Quality & Testing'].push({ cmd, desc: `${cmd} command` });
    } else if (['docs', 'learn', 'reflect'].includes(cmd)) {
      categories['Documentation'].push({ cmd, desc: `${cmd} command` });
    } else {
      categories['Maintenance'].push({ cmd, desc: `${cmd} command` });
    }
  });
  
  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) {
      delete categories[key];
    }
  });
  
  return categories;
}

/**
 * Generate README command section
 */
export async function generateCommandSection() {
  const commands = await getCommandList();
  const categories = categorizeCommands(commands);
  
  let section = `### Custom Commands\n\n`;
  section += `${commands.length} specialized commands for structured development:\n\n`;
  
  for (const [categoryName, commandList] of Object.entries(categories)) {
    section += `**${categoryName}**\n`;
    for (const { cmd, desc } of commandList) {
      section += `- \`/${cmd}\` - ${desc}\n`;
    }
    section += `\n`;
  }
  
  return section;
}

/**
 * Update README with current command information
 */
export async function updateReadme() {
  const readmePath = 'README.md';
  
  if (!await fs.pathExists(readmePath)) {
    console.warn('README.md not found - creating basic README');
    await createBasicReadme();
    return { commandCount: 0, created: true };
  }
  
  const content = await fs.readFile(readmePath, 'utf-8');
  const commands = await getCommandList();
  
  // If README doesn't have a commands section, add it
  if (!content.includes('### Custom Commands')) {
    const newCommandSection = await generateCommandSection();
    const updatedContent = content + `\n\n${newCommandSection}`;
    await fs.writeFile(readmePath, updatedContent);
    return { commandCount: commands.length, added: true };
  }
  
  // Replace existing commands section
  const newCommandSection = await generateCommandSection();
  const sectionStart = '### Custom Commands';
  
  // Find next section or end of file
  const lines = content.split('\n');
  const startIndex = lines.findIndex(line => line.startsWith(sectionStart));
  
  if (startIndex === -1) {
    // Add at end if no section found
    const updatedContent = content + `\n\n${newCommandSection}`;
    await fs.writeFile(readmePath, updatedContent);
    return { commandCount: commands.length, added: true };
  }
  
  // Find next section starting with ###
  let endIndex = lines.length;
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].startsWith('### ')) {
      endIndex = i;
      break;
    }
  }
  
  // Replace the section
  const beforeSection = lines.slice(0, startIndex).join('\n');
  const afterSection = lines.slice(endIndex).join('\n');
  const updatedContent = beforeSection + '\n' + newCommandSection + afterSection;
  
  await fs.writeFile(readmePath, updatedContent);
  
  return {
    commandCount: commands.length,
    updated: true
  };
}

/**
 * Create a basic README if none exists
 */
async function createBasicReadme() {
  const packagePath = 'package.json';
  let projectName = 'My Project';
  
  if (await fs.pathExists(packagePath)) {
    try {
      const pkg = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
      projectName = pkg.name || projectName;
    } catch (error) {
      // Use default name
    }
  }
  
  const basicReadme = `# ${projectName}

Project description goes here.

## Getting Started

1. Install dependencies
2. Run development setup
3. Start coding with Claude Code integration

${await generateCommandSection()}

## Development

This project uses Claude Code for AI-assisted development. Use the commands above for structured workflows.
`;

  await fs.writeFile('README.md', basicReadme);
}

export default {
  getCommandList,
  getCommandDescriptions,
  categorizeCommands,
  generateCommandSection,
  updateReadme
};