import chalk from 'chalk';
import yargs from 'yargs';
import { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from '../lib/cli/utils.js';
/**
 * Main CLI orchestrator class
 */
export class CLIMain {
    /**
     * Parse command line arguments into configuration object
     */
    parseArgs(argv = process.argv.slice(2)) {
        // Basic yargs configuration with all CLI options defined
        const parsed = yargs(argv)
            .scriptName('claude-setup')
            .usage('$0 [options]')
            .option('detect-language', {
            type: 'boolean',
            description: 'Detect and display project language'
        })
            .option('config', {
            type: 'boolean',
            description: 'Manage configuration'
        })
            .option('show', {
            type: 'boolean',
            description: 'Show current configuration (requires --config)'
        })
            .option('reset', {
            type: 'boolean',
            description: 'Reset configuration (requires --config)'
        })
            .option('sync-issues', {
            type: 'boolean',
            description: 'Sync GitHub issues with ACTIVE_WORK.md'
        })
            .option('devcontainer', {
            type: 'boolean',
            description: 'Generate DevContainer configuration only'
        })
            .option('language', {
            type: 'string',
            description: 'Override language detection',
            choices: ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift']
        })
            .option('force', {
            type: 'boolean',
            description: 'Force operations (skip confirmations)'
        })
            .option('no-save', {
            type: 'boolean',
            description: 'Don\'t save configuration'
        })
            .version('1.0.0')
            .help()
            .parseSync();
        // Simple option parsing without validation - just convert to CLIFlags interface
        const flags = {
            detectLanguage: Boolean(parsed['detect-language']),
            config: Boolean(parsed.config),
            show: Boolean(parsed.show),
            reset: Boolean(parsed.reset),
            syncIssues: Boolean(parsed['sync-issues']),
            devcontainer: Boolean(parsed.devcontainer),
            force: Boolean(parsed.force),
            noSave: parsed.save === false && parsed.save !== undefined
        };
        if (parsed.language) {
            flags.language = parsed.language;
        }
        return flags;
    }
    /**
     * Main CLI execution method
     */
    async runCLI(argv) {
        try {
            const flags = this.parseArgs(argv);
            const mode = this.determinePrimaryMode(flags);
            switch (mode) {
                case 'language-detection':
                    await handleLanguageDetection(argv || process.argv.slice(2));
                    break;
                case 'configuration':
                    await handleConfigManagement(argv || process.argv.slice(2));
                    break;
                case 'sync-issues':
                    await handleSyncIssues();
                    break;
                case 'devcontainer':
                    await this.handleDevContainerMode(flags);
                    break;
                case 'setup':
                default:
                    await this.handleSetupMode(flags);
                    break;
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(chalk.red('❌ Command line error:'), errorMessage);
            process.exit(1);
        }
    }
    /**
     * Determine primary mode based on flags
     */
    determinePrimaryMode(flags) {
        if (flags.detectLanguage)
            return 'language-detection';
        if (flags.config)
            return 'configuration';
        if (flags.syncIssues)
            return 'sync-issues';
        if (flags.devcontainer)
            return 'devcontainer';
        return 'setup';
    }
    /**
     * Handle setup mode
     */
    async handleSetupMode(_flags) {
        const { InteractiveSetup } = await import('../lib/cli/interactive.js');
        const setup = new InteractiveSetup();
        // Implement setup logic
        console.log(chalk.blue('🚀 Starting interactive setup...'));
        await setup.runInteractiveSetup();
    }
    /**
     * Handle DevContainer mode
     */
    async handleDevContainerMode(_flags) {
        // const { getDevContainerConfig } = await import('../lib/cli/setup.js');
        // Implement DevContainer logic
        console.log(chalk.blue('🐳 Generating DevContainer configuration...'));
        console.log(chalk.yellow('DevContainer mode not fully implemented yet'));
    }
}
//# sourceMappingURL=main.js.map