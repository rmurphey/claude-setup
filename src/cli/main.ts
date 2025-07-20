import chalk from 'chalk';

import { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from '../lib/cli/utils.js';

export interface CLIFlags {
  help: boolean;
  version: boolean;
  fix: boolean;
  dryRun: boolean;
  autoFix: boolean;
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

export type PrimaryMode = 'setup' | 'recovery' | 'language-detection' | 'configuration' | 'sync-issues' | 'devcontainer';

/**
 * Main CLI orchestrator class
 */
export class CLIMain {
  private supportedFlags = new Set([
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

  private flagConflicts = new Map([
    ['--help', ['--version', '--fix', '--detect-language', '--config', '--sync-issues']],
    ['--version', ['--help', '--fix', '--detect-language', '--config', '--sync-issues']],
    ['--show', ['--reset']],
    ['--reset', ['--show']]
  ]);

  private flagDependencies = new Map([
    ['--dry-run', ['--fix']],
    ['--auto-fix', ['--fix']],
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
            const value = this.extractFlagValue(arg, argv, i);
            if (!value) {
              throw new Error('--language flag requires a value');
            }
            if (!this.isValidLanguage(value)) {
              throw new Error(`Invalid language: ${value}. Supported: js, python, go, rust, java, swift`);
            }
            flags.language = value.toLowerCase();
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('❌ Error:'), errorMessage);
      
      if (errorMessage.includes('Unknown flag') || errorMessage.includes('requires a value')) {
        console.log('\nUse --help to see available options.');
      }
      
      process.exit(1);
    }
  }

  /**
   * Extract flag value from argument
   */
  private extractFlagValue(arg: string, argv: string[], index: number): string | null {
    if (arg.includes('=')) {
      return arg.split('=')[1] || null;
    }
    
    const nextArg = argv[index + 1];
    if (nextArg && !nextArg.startsWith('-')) {
      return nextArg;
    }
    
    return null;
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
          throw new Error(`Flag ${flag} conflicts with: ${conflictingFlags.join(', ')}`);
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
    if (flags.fix) return 'recovery';
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
    const validLanguages = ['js', 'javascript', 'python', 'go', 'rust', 'java', 'swift'];
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
  private showVersion(): void {
    // Import package.json to get version
    console.log('1.0.0');
  }

  /**
   * Handle recovery mode
   */
  private async handleRecoveryMode(flags: CLIFlags): Promise<void> {
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