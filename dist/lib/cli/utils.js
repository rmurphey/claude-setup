import chalk from 'chalk';
import fs from 'fs-extra';
import { LanguageDetector } from '../language-detector.js';
/**
 * CLI utilities - shared functions for CLI operations
 */
export class CLIUtils {
    /**
     * Format output with consistent styling
     */
    static formatOutput(message, type = 'info') {
        switch (type) {
            case 'success':
                return chalk.green(`✅ ${message}`);
            case 'warning':
                return chalk.yellow(`⚠️  ${message}`);
            case 'error':
                return chalk.red(`❌ ${message}`);
            case 'info':
            default:
                return chalk.blue(`ℹ️  ${message}`);
        }
    }
    /**
     * Validate basic project structure
     */
    static async validateProjectStructure(projectPath = process.cwd()) {
        const checks = {
            isDirectory: await fs.pathExists(projectPath),
            isWritable: true, // Will be checked by attempting to write
            hasGit: false
        };
        try {
            // Check if git repository exists
            const gitPath = `${projectPath}/.git`;
            checks.hasGit = await fs.pathExists(gitPath);
        }
        catch (error) {
            // Git check failed, but not critical
        }
        try {
            // Test write permissions
            const testFile = `${projectPath}/.claude-setup-test`;
            await fs.writeFile(testFile, 'test');
            await fs.remove(testFile);
        }
        catch (error) {
            checks.isWritable = false;
        }
        return checks;
    }
}
/**
 * Handle language detection command
 */
export async function handleLanguageDetection(args) {
    const detector = new LanguageDetector();
    const forceDetection = args.includes('--force');
    const saveConfig = !args.includes('--no-save');
    console.log(chalk.blue('🔍 Detecting project language...'));
    try {
        const detection = await detector.getBestGuess(!forceDetection);
        if (!detection) {
            console.log(chalk.yellow('❌ No language detected in current directory'));
            console.log('Try running in a directory with source code files.');
            return;
        }
        if (detection.source === 'config') {
            console.log(chalk.green(`✅ Using cached detection: ${detection.name}`));
            console.log(chalk.gray(`   Detected: ${new Date(detector.config.language.detected).toLocaleString()}`));
            console.log(chalk.gray('   Use --force to run fresh detection'));
        }
        else {
            console.log(chalk.green(`✅ Detected: ${detection.name}`));
            if (detection.type === 'single') {
                const evidence = detector.formatEvidence(detection.evidence);
                console.log(chalk.gray(`   Evidence: ${evidence}`));
                console.log(chalk.gray(`   Confidence: ${detection.confidence}`));
                if (saveConfig) {
                    const saved = await detector.saveConfig(detection);
                    if (saved) {
                        console.log(chalk.gray('   Saved to .claude-setup.json'));
                    }
                }
            }
            else {
                console.log(chalk.yellow('   Multiple languages detected:'));
                detection.candidates.forEach((candidate, i) => {
                    const evidence = detector.formatEvidence(candidate.evidence);
                    console.log(chalk.gray(`   ${i + 1}. ${candidate.name} (${evidence})`));
                });
            }
        }
    }
    catch (error) {
        console.error(chalk.red('❌ Language detection failed:'), error.message);
        process.exit(1);
    }
}
/**
 * Handle configuration management command
 */
export async function handleConfigManagement(args) {
    const detector = new LanguageDetector();
    if (args.includes('--show')) {
        // Show current config
        const config = await detector.loadConfig();
        if (Object.keys(config).length === 0) {
            console.log(chalk.yellow('No configuration file found'));
            console.log('Run --detect-language to create one');
        }
        else {
            console.log(chalk.green('Current configuration:'));
            console.log(JSON.stringify(config, null, 2));
        }
        return;
    }
    if (args.includes('--reset')) {
        // Reset/delete config
        try {
            if (await fs.pathExists('.claude-setup.json')) {
                await fs.remove('.claude-setup.json');
                console.log(chalk.green('✅ Configuration reset'));
            }
            else {
                console.log(chalk.yellow('No configuration file to reset'));
            }
        }
        catch (error) {
            console.error(chalk.red('❌ Failed to reset config:'), error.message);
            process.exit(1);
        }
        return;
    }
    // Default: show config info
    console.log(chalk.blue('Configuration management options:'));
    console.log('  --config --show    Show current configuration');
    console.log('  --config --reset   Reset configuration');
    console.log('  --detect-language  Detect and save language config');
}
/**
 * Handle GitHub issues sync command
 */
export async function handleSyncIssues() {
    const { syncGitHubIssues } = await import('../github-sync.js');
    // Check which ACTIVE_WORK.md file exists
    const internalPath = 'internal/ACTIVE_WORK.md';
    const rootPath = 'ACTIVE_WORK.md';
    let activeWorkPath;
    if (await fs.pathExists(internalPath)) {
        activeWorkPath = internalPath;
    }
    else if (await fs.pathExists(rootPath)) {
        activeWorkPath = rootPath;
    }
    else {
        console.error(chalk.red('❌ No ACTIVE_WORK.md file found'));
        console.log('Run the setup tool first to create project structure');
        process.exit(1);
    }
    await syncGitHubIssues(activeWorkPath);
}
/**
 * Get language-specific commands
 */
export async function getLanguageCommands(projectType) {
    // Import language modules dynamically
    const languageModules = {
        js: () => import('../languages/javascript.js'),
        python: () => import('../languages/python.js'),
        go: () => import('../languages/go.js'),
        rust: () => import('../languages/rust.js'),
        java: () => import('../languages/java.js'),
        swift: () => import('../languages/swift.js')
    };
    if (languageModules[projectType]) {
        try {
            const module = await languageModules[projectType]();
            return {
                installCmd: module.default?.installCommand || 'Install dependencies according to your project type',
                lintCmd: module.default?.lintCommand || 'Run quality checks according to your project type'
            };
        }
        catch (error) {
            // Fallback if module import fails
        }
    }
    return {
        installCmd: 'Install dependencies according to your project type',
        lintCmd: 'Run quality checks according to your project type'
    };
}
//# sourceMappingURL=utils.js.map