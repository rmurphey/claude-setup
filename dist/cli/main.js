import chalk from 'chalk';
import yargs from 'yargs';
import { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from '../lib/cli/utils.js';
/**
 * Main CLI orchestrator class
 */
export class CLIMain {
    supportedFlags = new Set([
        '--help', '-h',
        '--version', '-v',
        '--detect-language',
        '--config',
        '--show',
        '--reset',
        '--sync-issues',
        '--devcontainer',
        '--language',
        '--force',
        '--no-save'
    ]);
    flagConflicts = new Map([
        ['--detect-language', ['--config', '--sync-issues']],
        ['--config', ['--detect-language', '--sync-issues']],
        ['--sync-issues', ['--detect-language', '--config']],
        ['--show', ['--reset']],
        ['--reset', ['--show']]
    ]);
    flagDependencies = new Map([
        ['--show', ['--config']],
        ['--reset', ['--config']]
    ]);
    /**
     * Parse command line arguments into configuration object
     */
    parseArgs(argv = process.argv.slice(2)) {
        const parsed = yargs(argv)
            .option('help', { alias: 'h', type: 'boolean', description: 'Show help information' })
            .option('version', { alias: 'v', type: 'boolean', description: 'Show version information' })
            .option('detect-language', { type: 'boolean', description: 'Detect and display project language' })
            .option('config', { type: 'boolean', description: 'Manage configuration' })
            .option('show', { type: 'boolean', description: 'Show current configuration (requires --config)' })
            .option('reset', { type: 'boolean', description: 'Reset configuration (requires --config)' })
            .option('sync-issues', { type: 'boolean', description: 'Sync GitHub issues with ACTIVE_WORK.md' })
            .option('devcontainer', { type: 'boolean', description: 'Generate DevContainer configuration only' })
            .option('language', { type: 'string', description: 'Override language detection', choices: ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'] })
            .option('force', { type: 'boolean', description: 'Force operations (skip confirmations)' })
            .option('no-save', { type: 'boolean', description: 'Don\'t save configuration' })
            .help(false)
            .version(false)
            .parseSync();
        const flags = {
            help: Boolean(parsed.help),
            version: Boolean(parsed.version),
            detectLanguage: Boolean(parsed['detect-language']),
            config: Boolean(parsed.config),
            show: Boolean(parsed.show),
            reset: Boolean(parsed.reset),
            syncIssues: Boolean(parsed['sync-issues']),
            devcontainer: Boolean(parsed.devcontainer),
            force: Boolean(parsed.force),
            noSave: Boolean(parsed['no-save'])
        };
        if (parsed.language) {
            flags.language = parsed.language;
        }
        this.validateFlagCombinations(flags);
        return flags;
    }
    /**
     * Main CLI execution method
     */
    async runCLI(argv) {
        try {
            const flags = this.parseArgs(argv);
            if (flags.help) {
                this.showHelp();
                return;
            }
            if (flags.version) {
                this.showVersion();
                return;
            }
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
            if (errorMessage.includes('Unknown flag') || errorMessage.includes('requires a value')) {
                console.log('\nUse --help to see available options.');
            }
            process.exit(1);
        }
    }
    /**
     * Extract flag value from argument array (last occurrence wins)
     */
    extractFlagValue(argv, flagName) {
        let lastValue = null;
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (!arg)
                continue;
            if (arg.startsWith(flagName)) {
                if (arg.includes('=')) {
                    const parts = arg.split('=');
                    lastValue = parts.slice(1).join('=') || null;
                }
                else {
                    const nextArg = argv[i + 1];
                    if (nextArg && !nextArg.startsWith('-')) {
                        lastValue = nextArg;
                    }
                    else {
                        lastValue = null;
                    }
                }
            }
        }
        return lastValue;
    }
    /**
     * Validate flag combinations
     */
    validateFlagCombinations(flags) {
        const activeFlags = Object.entries(flags)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => this.configKeyToFlag(key));
        // Check for conflicts
        for (const flag of activeFlags) {
            const conflicts = this.flagConflicts.get(flag);
            if (conflicts) {
                const conflictingFlags = conflicts.filter(conflict => activeFlags.includes(conflict));
                if (conflictingFlags.length > 0) {
                    throw new Error(`${flag} cannot be used with: ${conflictingFlags.join(', ')}`);
                }
            }
        }
        // Check for dependencies
        for (const flag of activeFlags) {
            const dependencies = this.flagDependencies.get(flag);
            if (dependencies) {
                const missingDeps = dependencies.filter(dep => !activeFlags.includes(dep));
                if (missingDeps.length > 0) {
                    throw new Error(`Flag ${flag} requires: ${missingDeps.join(', ')}`);
                }
            }
        }
    }
    /**
     * Convert config key to flag name
     */
    configKeyToFlag(key) {
        const flagMap = {
            help: '--help',
            version: '--version',
            fix: '--fix',
            dryRun: '--dry-run',
            autoFix: '--auto-fix',
            detectLanguage: '--detect-language',
            config: '--config',
            show: '--show',
            reset: '--reset',
            syncIssues: '--sync-issues',
            devcontainer: '--devcontainer',
            force: '--force',
            noSave: '--no-save'
        };
        return flagMap[key] || `--${key}`;
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
     * Check if language is valid
     */
    isValidLanguage(language) {
        const validLanguages = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'];
        return validLanguages.includes(language.toLowerCase());
    }
    /**
     * Show help information
     */
    showHelp() {
        console.log(`
Claude Code Project Setup

USAGE:
  claude-setup [OPTIONS]

OPTIONS:
  -h, --help              Show this help message
  -v, --version           Show version information
  --detect-language       Detect and display project language
  --config                Manage configuration
      --show              Show current configuration (requires --config)
      --reset             Reset configuration (requires --config)
  --sync-issues           Sync GitHub issues with ACTIVE_WORK.md
  --devcontainer          Generate DevContainer configuration only
  --language <lang>       Override language detection (js, python, go, rust, java, swift)
  --force                 Force operations (skip confirmations)
  --no-save               Don't save configuration

EXAMPLES:
  claude-setup                        # Interactive setup
  claude-setup --language=js          # Setup with JavaScript override
  claude-setup --detect-language      # Detect project language
  claude-setup --config --show        # Show current config
  claude-setup --config --reset       # Reset configuration

MODES:
  Setup Mode       Set up new project infrastructure (default)
  Language Mode    Detect and display project language (--detect-language)
  Config Mode      Manage configuration settings (--config)
  Sync Mode        Sync GitHub issues with ACTIVE_WORK.md (--sync-issues)
  DevContainer     Generate DevContainer configuration only (--devcontainer)

FLAG DEPENDENCIES:
  --show, --reset require --config

For more information, visit: https://github.com/rmurphey/claude-setup
`);
    }
    /**
     * Show version information
     */
    showVersion() {
        // Import package.json to get version
        console.log('1.0.0');
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