import chalk from 'chalk';

/**
 * Main CLI orchestrator - handles argument parsing and routing
 */
export class CLIMain {
  constructor() {
    this.args = [];
    this.supportedFlags = new Set([
      '--help', '-h',
      '--version', '-v', 
      '--fix',
      '--dry-run',
      '--auto-fix',
      '--detect-language',
      '--config',
      '--sync-issues',
      '--devcontainer',
      '--force',
      '--no-save',
      '--show',
      '--reset',
      '--language'
    ]);
    
    // Define flag conflicts and requirements
    this.flagConflicts = new Map([
      ['--fix', ['--detect-language', '--config', '--sync-issues']],
      ['--detect-language', ['--fix', '--config', '--sync-issues']],
      ['--config', ['--fix', '--detect-language', '--sync-issues']],
      ['--sync-issues', ['--fix', '--detect-language', '--config']],
      ['--show', ['--reset']],
      ['--reset', ['--show']]
    ]);
    
    // Define flag dependencies
    this.flagDependencies = new Map([
      ['--show', ['--config']],
      ['--reset', ['--config']],
      ['--dry-run', ['--fix']],
      ['--auto-fix', ['--fix']]
    ]);
  }

  /**
   * Parse command line arguments and return structured configuration
   */
  parseArgs(argv = process.argv.slice(2)) {
    this.args = argv;
    
    // Validate arguments first
    this.validateArgs(argv);
    
    const config = {
      help: argv.includes('--help') || argv.includes('-h'),
      version: argv.includes('--version') || argv.includes('-v'),
      fix: argv.includes('--fix'),
      dryRun: argv.includes('--dry-run'),
      autoFix: argv.includes('--auto-fix'),
      detectLanguage: argv.includes('--detect-language'),
      config: argv.includes('--config'),
      syncIssues: argv.includes('--sync-issues'),
      devcontainer: argv.includes('--devcontainer'),
      force: argv.includes('--force'),
      noSave: argv.includes('--no-save'),
      show: argv.includes('--show'),
      reset: argv.includes('--reset'),
      language: this.extractFlagValue(argv, '--language')
    };
    
    // Validate flag combinations
    this.validateFlagCombinations(config);
    
    return config;
  }

  /**
   * Extract value for flags that take parameters (e.g., --language=js or --language js)
   */
  extractFlagValue(argv, flag) {
    // Find all instances of the flag (to handle duplicates - last one wins)
    const flagIndices = argv
      .map((arg, index) => arg.startsWith(flag) ? index : -1)
      .filter(index => index !== -1);
    
    if (flagIndices.length === 0) return null;
    
    // Use the last occurrence (last one wins for duplicates)
    const flagIndex = flagIndices[flagIndices.length - 1];
    const flagArg = argv[flagIndex];
    
    // Handle --flag=value format (preserve everything after first =)
    if (flagArg.includes('=')) {
      const equalIndex = flagArg.indexOf('=');
      return flagArg.substring(equalIndex + 1);
    }
    
    // Handle --flag value format
    if (flagIndex + 1 < argv.length && !argv[flagIndex + 1].startsWith('-')) {
      return argv[flagIndex + 1];
    }
    
    return null;
  }

  /**
   * Validate command line arguments for unknown flags and basic syntax
   */
  validateArgs(argv) {
    const errors = [];
    
    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];
      
      // Skip non-flag arguments
      if (!arg.startsWith('-')) {
        continue;
      }
      
      // Handle --flag=value format
      const flagName = arg.includes('=') ? arg.split('=')[0] : arg;
      
      // Check if flag is supported
      if (!this.supportedFlags.has(flagName)) {
        errors.push(`Unknown flag: ${flagName}`);
        continue;
      }
      
      // Special validation for --language flag
      if (flagName === '--language') {
        const value = this.extractFlagValue(argv, '--language');
        if (!value) {
          errors.push('--language flag requires a value (e.g., --language=js or --language js)');
        } else if (!this.isValidLanguage(value)) {
          errors.push(`Invalid language: ${value}. Supported: js, python, go, rust, java, swift`);
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Invalid arguments:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    }
  }

  /**
   * Validate flag combinations for conflicts and dependencies
   */
  validateFlagCombinations(config) {
    const errors = [];
    const activeFlags = Object.entries(config)
      .filter(([_key, value]) => value === true)
      .map(([key]) => this.configKeyToFlag(key));
    
    // Check for conflicts
    for (const flag of activeFlags) {
      const conflicts = this.flagConflicts.get(flag);
      if (conflicts) {
        const conflictingFlags = conflicts.filter(conflictFlag => 
          activeFlags.includes(conflictFlag)
        );
        if (conflictingFlags.length > 0) {
          errors.push(`${flag} cannot be used with: ${conflictingFlags.join(', ')}`);
        }
      }
    }
    
    // Check for missing dependencies
    for (const flag of activeFlags) {
      const dependencies = this.flagDependencies.get(flag);
      if (dependencies) {
        const missingDeps = dependencies.filter(depFlag => 
          !activeFlags.includes(depFlag)
        );
        if (missingDeps.length > 0) {
          errors.push(`${flag} requires: ${missingDeps.join(', ')}`);
        }
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Invalid flag combinations:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    }
  }

  /**
   * Convert config key back to flag name for validation
   */
  configKeyToFlag(key) {
    const keyToFlag = {
      help: '--help',
      version: '--version',
      fix: '--fix',
      dryRun: '--dry-run',
      autoFix: '--auto-fix',
      detectLanguage: '--detect-language',
      config: '--config',
      syncIssues: '--sync-issues',
      force: '--force',
      noSave: '--no-save',
      show: '--show',
      reset: '--reset'
    };
    return keyToFlag[key] || `--${key}`;
  }

  /**
   * Check if language value is valid
   */
  isValidLanguage(language) {
    const validLanguages = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'];
    return validLanguages.includes(language.toLowerCase());
  }

  /**
   * Main CLI entry point - routes to appropriate mode
   */
  async runCLI(argv) {
    try {
      const config = this.parseArgs(argv);
      
      // Handle help and version first (these don't require validation)
      if (config.help) {
        this.showHelp();
        return;
      }
      
      if (config.version) {
        await this.showVersion();
        return;
      }
      
      // Route to appropriate mode based on configuration
      await this.routeToMode(config);
      
    } catch (error) {
      // Enhanced error handling with specific error types
      if (error.message.includes('Invalid arguments:') || error.message.includes('Invalid flag combinations:')) {
        console.error(chalk.red('❌ Command line error:'));
        console.error(error.message);
        console.log(chalk.gray('\nUse --help to see available options'));
      } else {
        console.error(chalk.red('❌ Operation failed:'), error.message);
        if (process.env.NODE_ENV === 'development') {
          console.error(chalk.gray('Stack trace:'), error.stack);
        }
      }
      process.exit(1);
    }
  }

  /**
   * Route to the appropriate mode based on parsed configuration
   */
  async routeToMode(config) {
    // Determine the primary mode
    const mode = this.determinePrimaryMode(config);
    
    switch (mode) {
      case 'recovery':
        await this.runRecoveryMode(config);
        break;
      case 'language-detection':
        await this.runLanguageDetectionMode(config);
        break;
      case 'configuration':
        await this.runConfigurationMode(config);
        break;
      case 'sync-issues':
        await this.runSyncIssuesMode(config);
        break;
      case 'devcontainer':
        await this.runDevContainerMode(config);
        break;
      case 'setup':
      default:
        await this.runSetupMode(config);
        break;
    }
  }

  /**
   * Determine the primary mode from configuration
   */
  determinePrimaryMode(config) {
    if (config.fix) return 'recovery';
    if (config.detectLanguage) return 'language-detection';
    if (config.config) return 'configuration';
    if (config.syncIssues) return 'sync-issues';
    if (config.devcontainer) return 'devcontainer';
    return 'setup';
  }

  /**
   * Run recovery mode
   */
  async runRecoveryMode() {
    const { SetupOrchestrator } = await import('./setup.js');
    const orchestrator = new SetupOrchestrator();
    await orchestrator.runRecoveryMode();
  }

  /**
   * Run language detection mode
   */
  async runLanguageDetectionMode() {
    console.log(chalk.blue.bold('\n🔍 Language Detection\n'));
    const { handleLanguageDetection } = await import('./utils.js');
    await handleLanguageDetection(this.args);
  }

  /**
   * Run configuration management mode
   */
  async runConfigurationMode() {
    console.log(chalk.blue.bold('\n⚙️  Configuration Management\n'));
    const { handleConfigManagement } = await import('./utils.js');
    await handleConfigManagement(this.args);
  }

  /**
   * Run GitHub issues sync mode
   */
  async runSyncIssuesMode() {
    console.log(chalk.blue.bold('\n📋 Syncing GitHub Issues\n'));
    const { handleSyncIssues } = await import('./utils.js');
    await handleSyncIssues();
  }

  /**
   * Run DevContainer mode - delegated to SetupOrchestrator
   */
  async runDevContainerMode(_config) {
    const { SetupOrchestrator } = await import('./setup.js');
    const orchestrator = new SetupOrchestrator();
    await orchestrator.runDevContainerMode();
  }

  /**
   * Run interactive setup mode (default) - delegated to SetupOrchestrator
   */
  async runSetupMode(config) {
    const { SetupOrchestrator } = await import('./setup.js');
    const orchestrator = new SetupOrchestrator();
    
    // Handle language override
    if (config.language) {
      const setupConfig = {
        projectType: config.language,
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: false
      };
      
      console.log(chalk.blue.bold('\n🤖 Claude Code Project Setup\n'));
      console.log(chalk.yellow(`Using language override: ${setupConfig.projectType}`));
      
      await orchestrator.runSetupMode(setupConfig);
    } else {
      // Run interactive setup
      const { InteractiveSetup } = await import('./interactive.js');
      const interactive = new InteractiveSetup();
      const result = await interactive.runInteractiveSetup();
      
      // Handle different result types from interactive setup
      if (result && result.mode === 'recovery') {
        await orchestrator.runRecoveryMode();
      } else if (result && result.mode === 'devcontainer') {
        await orchestrator.runDevContainerMode();
      } else if (result && result.projectType) {
        await orchestrator.runSetupMode(result);
      }
    }
  }

  /**
   * Show help information
   */
  showHelp() {
    console.log(`
${chalk.blue.bold('Claude Code Project Setup')}

${chalk.yellow('USAGE:')}
  claude-setup [OPTIONS]

${chalk.yellow('OPTIONS:')}
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

${chalk.yellow('EXAMPLES:')}
  claude-setup                        # Interactive setup
  claude-setup --language=js          # Setup with JavaScript override
  claude-setup --fix                  # Fix broken project setup
  claude-setup --fix --dry-run        # Preview recovery changes
  claude-setup --detect-language      # Detect project language
  claude-setup --config --show        # Show current config
  claude-setup --config --reset       # Reset configuration

${chalk.yellow('MODES:')}
  Setup Mode       Set up new project infrastructure (default)
  Recovery Mode    Assess and recover existing codebase (--fix)
  Language Mode    Detect and display project language (--detect-language)
  Config Mode      Manage configuration settings (--config)
  Sync Mode        Sync GitHub issues with ACTIVE_WORK.md (--sync-issues)
  DevContainer     Generate DevContainer configuration only (--devcontainer)

${chalk.yellow('FLAG DEPENDENCIES:')}
  --dry-run, --auto-fix require --fix
  --show, --reset require --config

For more information, visit: https://github.com/rmurphey/claude-setup
`);
  }

  /**
   * Show version information
   */
  async showVersion() {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const packagePath = path.join(process.cwd(), 'package.json');
      
      try {
        const data = await fs.promises.readFile(packagePath, 'utf8');
        const pkg = JSON.parse(data);
        console.log(`claude-setup v${pkg.version || '1.0.0'}`);
      } catch {
        console.log('claude-setup v1.0.0');
      }
    } catch {
      console.log('claude-setup v1.0.0');
    }
  }
}