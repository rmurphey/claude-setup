import chalk from 'chalk';
import { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from '../lib/cli/utils.js';
/**
 * Main CLI orchestrator class
 */
export class CLIMain {
    supportedFlags = new Set([
        '--help', '-h',
        '--version', '-v',
        '--fix',
        '--dry-run',
        '--auto-fix',
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
        ['--fix', ['--detect-language', '--config', '--sync-issues']],
        ['--detect-language', ['--fix', '--config', '--sync-issues']],
        ['--config', ['--fix', '--detect-language', '--sync-issues']],
        ['--sync-issues', ['--fix', '--detect-language', '--config']],
        ['--show', ['--reset']],
        ['--reset', ['--show']]
    ]);
    flagDependencies = new Map([
        ['--dry-run', ['--fix']],
        ['--auto-fix', ['--fix']],
        ['--show', ['--config']],
        ['--reset', ['--config']]
    ]);
    /**
     * Parse command line arguments into configuration object
     */
    parseArgs(argv = process.argv.slice(2)) {
        const flags = {
            help: false,
            version: false,
            fix: false,
            dryRun: false,
            autoFix: false,
            detectLanguage: false,
            config: false,
            show: false,
            reset: false,
            syncIssues: false,
            devcontainer: false,
            force: false,
            noSave: false
        };
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (!arg)
                continue;
            // Check for unknown flags
            if (arg.startsWith('-')) {
                const flagName = arg.split('=')[0];
                if (flagName && !this.supportedFlags.has(flagName)) {
                    throw new Error(`Unknown flag: ${arg}`);
                }
            }
            switch (arg) {
                case '--help':
                case '-h':
                    flags.help = true;
                    break;
                case '--version':
                case '-v':
                    flags.version = true;
                    break;
                case '--fix':
                    flags.fix = true;
                    break;
                case '--dry-run':
                    flags.dryRun = true;
                    break;
                case '--auto-fix':
                    flags.autoFix = true;
                    break;
                case '--detect-language':
                    flags.detectLanguage = true;
                    break;
                case '--config':
                    flags.config = true;
                    break;
                case '--show':
                    flags.show = true;
                    break;
                case '--reset':
                    flags.reset = true;
                    break;
                case '--sync-issues':
                    flags.syncIssues = true;
                    break;
                case '--devcontainer':
                    flags.devcontainer = true;
                    break;
                case '--force':
                    flags.force = true;
                    break;
                case '--no-save':
                    flags.noSave = true;
                    break;
                default:
                    if (arg.startsWith('--language')) {
                        const value = this.extractFlagValue(argv, '--language');
                        if (!value) {
                            throw new Error('--language flag requires a value');
                        }
                        if (!this.isValidLanguage(value)) {
                            throw new Error(`Invalid language: ${value}. Supported: js, python, go, rust, java, swift`);
                        }
                        flags.language = value;
                        if (arg.includes('=')) {
                            // Value was in same argument, don't increment i
                        }
                        else {
                            // Value was in next argument, skip it
                            i++;
                        }
                    }
                    break;
            }
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
                case 'recovery':
                    await this.handleRecoveryMode(flags);
                    break;
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
        if (flags.fix)
            return 'recovery';
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
  --fix                   Run recovery mode to fix broken setup
      --dry-run           Preview changes without applying them (requires --fix)
      --auto-fix          Automatically apply fixes without confirmation (requires --fix)
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
  claude-setup --fix                  # Fix broken project setup
  claude-setup --fix --dry-run        # Preview recovery changes
  claude-setup --detect-language      # Detect project language
  claude-setup --config --show        # Show current config
  claude-setup --config --reset       # Reset configuration

MODES:
  Setup Mode       Set up new project infrastructure (default)
  Recovery Mode    Assess and recover existing codebase (--fix)
  Language Mode    Detect and display project language (--detect-language)
  Config Mode      Manage configuration settings (--config)
  Sync Mode        Sync GitHub issues with ACTIVE_WORK.md (--sync-issues)
  DevContainer     Generate DevContainer configuration only (--devcontainer)

FLAG DEPENDENCIES:
  --dry-run, --auto-fix require --fix
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
     * Handle recovery mode
     */
    async handleRecoveryMode(flags) {
        // const { RecoverySystem } = await import('../lib/recovery-system.js');
        // const recovery = new RecoverySystem();
        if (flags.dryRun) {
            console.log(chalk.blue('🔍 Running in dry-run mode...'));
            // Implement dry-run logic
        }
        // Implement recovery logic
        console.log(chalk.yellow('Recovery mode not fully implemented yet'));
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