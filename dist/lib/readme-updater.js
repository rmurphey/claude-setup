/**
 * Automatically update README with current command count and list
 */
import fs from 'fs-extra';
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
    }
    catch (error) {
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
        }
        catch (error) {
            console.warn(`Warning: Could not read description for ${cmd}: ${error.message}`);
        }
    }
    return descriptions;
}
/**
 * Categorize commands for README display
 */
export function categorizeCommands() {
    const categories = {
        'Core Workflow': [
            { cmd: 'hygiene', desc: 'Project health check' },
            { cmd: 'todo', desc: 'Quick task capture' },
            { cmd: 'commit', desc: 'Quality-checked commits' },
            { cmd: 'next', desc: 'AI-recommended priorities' }
        ],
        'Planning & Design': [
            { cmd: 'design', desc: 'Feature planning' },
            { cmd: 'estimate', desc: 'Claude usage cost estimation' },
            { cmd: 'defer', desc: 'Postpone tasks with reasons' },
            { cmd: 'ideation', desc: 'AI-powered development idea generation' }
        ],
        'Codebase Analysis & Recovery': [
            { cmd: 'recovery-assess', desc: 'Analyze codebase health (0-100 score)' },
            { cmd: 'recovery-plan', desc: 'Generate prioritized improvement roadmap' },
            { cmd: 'recovery-execute', desc: 'Apply automated improvements' }
        ],
        'Learning & Growth': [
            { cmd: 'learn', desc: 'Capture insights' },
            { cmd: 'reflect', desc: 'Session reflection' },
            { cmd: 'docs', desc: 'Documentation updates' }
        ],
        'Maintenance': [
            { cmd: 'push', desc: 'Reviewed pushes' },
            { cmd: 'version-tag', desc: 'Release management' },
            { cmd: 'maintainability', desc: 'Code health analysis' },
            { cmd: 'idea', desc: 'Quick idea capture' }
        ]
    };
    return categories;
}
/**
 * Generate README command section
 */
export async function generateCommandSection() {
    const commands = await getCommandList();
    const categories = categorizeCommands();
    let section = '### Custom Commands Suite\n\n';
    section += `${commands.length} specialized commands for structured development:\n\n`;
    for (const [categoryName, commandList] of Object.entries(categories)) {
        section += `**${categoryName}**\n`;
        for (const { cmd, desc } of commandList) {
            section += `- \`/${cmd}\` - ${desc}\n`;
        }
        section += '\n';
    }
    return section;
}
/**
 * Update README with current command information
 */
export async function updateReadme() {
    const readmePath = 'README.md';
    if (!await fs.pathExists(readmePath)) {
        throw new Error('README.md not found');
    }
    const content = await fs.readFile(readmePath, 'utf-8');
    const newCommandSection = await generateCommandSection();
    // Replace the Custom Commands Suite section
    const sectionStart = '### Custom Commands Suite';
    const nextSectionStart = '### CI/CD Integration';
    const startIndex = content.indexOf(sectionStart);
    const endIndex = content.indexOf(nextSectionStart);
    if (startIndex === -1 || endIndex === -1) {
        throw new Error('Could not find Custom Commands Suite section in README');
    }
    const updatedContent = content.substring(0, startIndex) +
        newCommandSection +
        content.substring(endIndex);
    await fs.writeFile(readmePath, updatedContent);
    return {
        commandCount: (await getCommandList()).length,
        updated: true
    };
}
/**
 * Update internal ESTIMATES.md with current command count
 */
export async function updateEstimates() {
    const estimatesPath = 'internal/ESTIMATES.md';
    if (!await fs.pathExists(estimatesPath)) {
        console.warn('internal/ESTIMATES.md not found, skipping estimates update');
        return { updated: false };
    }
    const commands = await getCommandList();
    const content = await fs.readFile(estimatesPath, 'utf-8');
    // Update any references to command count in estimates
    // Look for patterns like "15 custom commands" or "18 commands"
    const updatedContent = content.replace(/(\d+)\s+(custom\s+)?commands?/gi, `${commands.length} commands`);
    await fs.writeFile(estimatesPath, updatedContent);
    return {
        commandCount: commands.length,
        updated: true
    };
}
/**
 * Update all documentation files
 */
export async function updateAllDocs() {
    const results = {};
    try {
        results.readme = await updateReadme();
    }
    catch (error) {
        results.readme = { error: error.message };
    }
    try {
        results.estimates = await updateEstimates();
    }
    catch (error) {
        results.estimates = { error: error.message };
    }
    return results;
}
export default {
    getCommandList,
    getCommandDescriptions,
    categorizeCommands,
    generateCommandSection,
    updateReadme,
    updateEstimates,
    updateAllDocs
};
//# sourceMappingURL=readme-updater.js.map