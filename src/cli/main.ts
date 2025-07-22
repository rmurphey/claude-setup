import chalk from 'chalk';

import { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from '../lib/cli/utils.js';

export interface CLIFlags {
  help: boolean;
  version: boolean;
  detectLanguage: boolean;
  config: boolean;
  show: boolean;
  reset: boolean;
  syncIssues: boolean;
  devcontainer: boolean;
  language?: string;
  force: boolean;
  noSave: boolean;
}

export type PrimaryMode = 'setup' | 'language-detection' | 'configuration' | 'sync-issues' | 'devcontainer';

/**
 * Main CLI orchestrator class
 */
export class CLIMain {
  private supportedFlags = new Set([
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

  private flagConflicts = new Map([
    ['--detect-language', ['--config', '--sync-issues']],
    ['--config', ['--detect-language', '--sync-issues']],
    ['--sync-issues', ['--detect-language', '--config']],
    ['--show', ['--reset']],
    ['--reset', ['--show']]
  ]);

  private flagDependencies = new Map([
    ['--show', ['--config']],
    ['--reset', ['--config']]
  ]);

  /**
   * Parse command line arguments into configuration object
   */
  parseArgs(argv: string[] = process.argv.slice(2)): CLIFlags {
    const flags: CLIFlags = {
      help: false,
      version: false,
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
      if (!arg) continue;

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
            } else {
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
  async runCLI(argv?: string[]): Promise<void> {
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
    } catch (error) {
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
  extractFlagValue(argv: string[], flagName: string): string | null {
    let lastValue: string | null = null;
    
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      if (!arg) continue;
      
      if (arg.startsWith(flagName)) {
        if (arg.includes('=')) {
          const parts = arg.split('=');
          lastValue = parts.slice(1).join('=') || null;
        } else {
          const nextArg = argv[i + 1];
          if (nextArg && !nextArg.startsWith('-')) {
            lastValue = nextArg;
          } else {
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
  private validateFlagCombinations(flags: CLIFlags): void {
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
  private configKeyToFlag(key: string): string {
    const flagMap: Record<string, string> = {
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
  private determinePrimaryMode(flags: CLIFlags): PrimaryMode {
    if (flags.detectLanguage) return 'language-detection';
    if (flags.config) return 'configuration';
    if (flags.syncIssues) return 'sync-issues';
    if (flags.devcontainer) return 'devcontainer';
    return 'setup';
  }

  /**
   * Check if language is valid
   */
  private isValidLanguage(language: string): boolean {
    const validLanguages = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'];
    return validLanguages.includes(language.toLowerCase());
  }

  /**
   * Show help information
   */
  private showHelp(): void {
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
  private showVersion(): void {
    // Import package.json to get version
    console.log('1.0.0');
  }

  /**
   * Handle setup mode
   */
  private async handleSetupMode(_flags: CLIFlags): Promise<void> {
    const { InteractiveSetup } = await import('../lib/cli/interactive.js');
    const setup = new InteractiveSetup();
    
    // Implement setup logic
    console.log(chalk.blue('🚀 Starting interactive setup...'));
    await setup.runInteractiveSetup();
  }

  /**
   * Handle DevContainer mode
   */
  private async handleDevContainerMode(_flags: CLIFlags): Promise<void> {
    // const { getDevContainerConfig } = await import('../lib/cli/setup.js');
    
    // Implement DevContainer logic
    console.log(chalk.blue('🐳 Generating DevContainer configuration...'));
    console.log(chalk.yellow('DevContainer mode not fully implemented yet'));
  }
}