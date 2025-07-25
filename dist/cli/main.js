import chalk from 'chalk';
import yargs from 'yargs';
import { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from '../lib/cli/utils.js';
/**
 * CLI orchestrator using yargs for argument parsing and validation
 */
export class CLIMain {
    parseArgs(argv = process.argv.slice(2)) {
        const parsed = yargs(argv)
            .scriptName('claude-setup')
            .usage('$0 [options]')
            .option('detect-language', { type: 'boolean', description: 'Detect and display project language' })
            .option('config', { type: 'boolean', description: 'Manage configuration' })
            .option('show', { type: 'boolean', description: 'Show current configuration (requires --config)' })
            .option('reset', { type: 'boolean', description: 'Reset configuration (requires --config)' })
            .option('sync-issues', { type: 'boolean', description: 'Sync GitHub issues with ACTIVE_WORK.md' })
            .option('devcontainer', { type: 'boolean', description: 'Generate DevContainer configuration only' })
            .option('language', {
            type: 'string',
            description: 'Override language detection',
            choices: ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'],
            array: false
        })
            .option('force', { type: 'boolean', description: 'Force operations (skip confirmations)' })
            .option('save', { type: 'boolean', default: true, description: 'Save configuration (use --no-save to disable)' })
            .conflicts('detect-language', 'config')
            .conflicts('detect-language', 'sync-issues')
            .conflicts('config', 'sync-issues')
            .implies('show', 'config')
            .implies('reset', 'config')
            .strict()
            .version('1.0.0')
            .help()
            .exitProcess(false)
            .showHelpOnFail(false)
            .parseSync();
        const flags = {
            detectLanguage: Boolean(parsed['detect-language']),
            config: Boolean(parsed.config),
            show: Boolean(parsed.show),
            reset: Boolean(parsed.reset),
            syncIssues: Boolean(parsed['sync-issues']),
            devcontainer: Boolean(parsed.devcontainer),
            force: Boolean(parsed.force),
            noSave: !parsed.save
        };
        if (parsed.language) {
            flags.language = Array.isArray(parsed.language)
                ? parsed.language[parsed.language.length - 1]
                : parsed.language;
        }
        this.validateComplexBusinessRules(flags);
        return flags;
    }
    /**
     * Custom validation for complex business rules that yargs cannot handle
     */
    validateComplexBusinessRules(flags) {
        // Three-way mutual exclusion check
        if (flags.detectLanguage && flags.config && flags.syncIssues) {
            throw new Error('Cannot use --detect-language, --config, and --sync-issues together');
        }
        // DevContainer language validation
        if (flags.language && flags.devcontainer) {
            const supportedDevContainerLanguages = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java'];
            if (!supportedDevContainerLanguages.includes(flags.language)) {
                throw new Error(`Language '${flags.language}' is not supported for DevContainer generation. Supported: ${supportedDevContainerLanguages.join(', ')}`);
            }
        }
    }
    async runCLI(argv) {
        const args = argv || process.argv.slice(2);
        // Handle help/version flags before parsing to avoid yargs hanging in tests
        if (args.includes('--help') || args.includes('-h')) {
            console.log('Claude Code Project Setup');
            console.log('');
            console.log('USAGE:');
            console.log('  claude-setup [options]');
            console.log('');
            console.log('OPTIONS:');
            console.log('  --detect-language    Detect and display project language');
            console.log('  --config            Manage configuration');
            console.log('  --show              Show current configuration (requires --config)');
            console.log('  --reset             Reset configuration (requires --config)');
            console.log('  --sync-issues       Sync GitHub issues with ACTIVE_WORK.md');
            console.log('  --devcontainer      Generate DevContainer configuration only');
            console.log('  --language <lang>   Override language detection');
            console.log('  --force             Force operations (skip confirmations)');
            console.log('  --no-save           Don\'t save configuration');
            console.log('  --version           Show version number');
            console.log('  --help              Show help');
            return;
        }
        if (args.includes('--version') || args.includes('-v')) {
            console.log('1.0.0');
            return;
        }
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
    async handleSetupMode(_flags) {
        const { InteractiveSetup } = await import('../lib/cli/interactive.js');
        const setup = new InteractiveSetup();
        console.log(chalk.blue('🚀 Starting interactive setup...'));
        await setup.runInteractiveSetup();
    }
    async handleDevContainerMode(_flags) {
        // const { getDevContainerConfig } = await import('../lib/cli/setup.js');
        // Implement DevContainer logic
        console.log(chalk.blue('🐳 Generating DevContainer configuration...'));
        console.log(chalk.yellow('DevContainer mode not fully implemented yet'));
    }
}
//# sourceMappingURL=main.js.map