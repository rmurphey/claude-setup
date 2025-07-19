import inquirer from 'inquirer';
import chalk from 'chalk';

import { LanguageDetector } from '../language-detector.js';
import type { 
  CLIConfig, 
  QualityLevel, 
  TeamSize, 
  InquirerPrompt,
  InquirerAnswers,
  InteractiveSetupResult
} from '../../types/index.js';
import type { ValidationError } from '../../types/utils.js';
import type { DetectionGuess } from '../language-detector.js';

/**
 * Interactive setup handler - manages user prompts and configuration
 */
export class InteractiveSetup {
  private readonly modeQuestion: InquirerPrompt;
  private readonly baseQuestions: InquirerPrompt[];
  private readonly validProjectTypes: readonly string[];
  private readonly validQualityLevels: readonly QualityLevel[];
  private readonly validTeamSizes: readonly TeamSize[];

  constructor() {
    this.modeQuestion = {
      type: 'list',
      name: 'mode',
      message: 'What would you like to do?',
      choices: [
        { name: '🚀 Set up new project infrastructure', value: 'setup' },
        { name: '🏥 Assess and recover existing codebase', value: 'recovery' },
        { name: '📦 Generate GitHub Codespaces DevContainer only', value: 'devcontainer' },
      ]
    };

    this.baseQuestions = [
      {
        type: 'list',
        name: 'projectType',
        message: 'What type of project are you setting up?',
        choices: [
          { name: 'JavaScript/TypeScript', value: 'js' },
          { name: 'Python', value: 'python' },
          { name: 'Go', value: 'go' },
          { name: 'Rust', value: 'rust' },
          { name: 'Java', value: 'java' },
          { name: 'Swift', value: 'swift' },
          { name: 'Mixed/Other', value: 'other' }
        ]
      },
      {
        type: 'list',
        name: 'qualityLevel',
        message: 'What quality level do you want?',
        choices: [
          { name: 'Strict - Zero warnings, maximum automation', value: 'strict' },
          { name: 'Standard - Balanced approach, <10 warnings', value: 'standard' },
          { name: 'Relaxed - Warnings okay, errors only', value: 'relaxed' }
        ]
      },
      {
        type: 'list',
        name: 'teamSize',
        message: 'What is your team size?',
        choices: [
          { name: 'Solo - Individual developer', value: 'solo' },
          { name: 'Small - 2-5 people', value: 'small' },
          { name: 'Team - 6+ people, full CI/CD', value: 'large' }
        ]
      },
      {
        type: 'confirm',
        name: 'cicd',
        message: 'Set up CI/CD workflows?',
        default: false
      }
    ];

    // Valid project types for validation
    this.validProjectTypes = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift', 'other'] as const;
    this.validQualityLevels = ['strict', 'standard', 'relaxed'] as const;
    this.validTeamSizes = ['solo', 'small', 'large'] as const;
  }

  /**
   * Build smart questions with language detection and verification
   */
  async buildSmartQuestions(): Promise<{ smartQuestions: InquirerPrompt[]; detection: DetectionGuess }> {
    console.log(chalk.blue('🔍 Detecting project language...'));
    
    const detector = new LanguageDetector();
    const detection = await detector.getBestGuess();
    
    let projectTypeQuestion: InquirerPrompt;
    
    if (!detection) {
      // No detection - use original question
      console.log(chalk.gray('   No specific language detected, showing all options'));
      projectTypeQuestion = this.baseQuestions[0]!;
    } else if (detection.type === 'single') {
      // Single confident detection - verify with user
      const evidence = detector.formatEvidence(detection.evidence);
      console.log(chalk.green(`   Detected ${detection.name} (${evidence})`));
      
      projectTypeQuestion = {
        type: 'confirm',
        name: 'useDetectedLanguage',
        message: `Use detected language: ${detection.name}?`,
        default: true
      };
    } else {
      // Multiple detections - show as options
      const candidateNames = detection.candidates.map(c => c.name).join(', ');
      console.log(chalk.yellow(`   Multiple languages detected: ${candidateNames}`));
      
      projectTypeQuestion = {
        type: 'list',
        name: 'projectType',
        message: 'Which language should be the primary setup focus?',
        choices: [
          ...detection.candidates.map(c => ({
            name: `${c.name} (detected: ${detector.formatEvidence(c.evidence)})`,
            value: c.language
          })),
          { name: '--- Other Options ---', value: 'separator' },
          ...(this.baseQuestions[0]!.choices as Array<{ name: string; value: string }>)
        ]
      };
    }
    
    // Build the full questions array
    const smartQuestions: InquirerPrompt[] = [projectTypeQuestion];
    
    // Add post-processing for single detection confirmation
    if (detection && detection.type === 'single') {
      const baseChoices = this.baseQuestions[0]!.choices;
      if (baseChoices) {
        smartQuestions.push({
          type: 'list',
          name: 'projectType', 
          message: 'What type of project are you setting up?',
          choices: baseChoices
        });
      }
    }
    
    // Add the remaining questions (quality, team, cicd)
    smartQuestions.push(...this.baseQuestions.slice(1));
    
    return { smartQuestions, detection };
  }

  /**
   * Process smart question answers to normalize project type
   */
  processSmartAnswers(answers: InquirerAnswers, detection: DetectionGuess): InquirerAnswers {
    // If user confirmed detected language, use it
    if (answers.useDetectedLanguage && detection && detection.type === 'single') {
      answers.projectType = detection.language;
    }
    
    delete answers.useDetectedLanguage; // Clean up
    return answers;
  }

  /**
   * Validate user input configuration
   */
  validateConfiguration(config: Partial<CLIConfig>): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate project type
    if (!config.projectType || !this.validProjectTypes.includes(config.projectType)) {
      errors.push({
        field: 'projectType',
        message: `Invalid project type: ${config.projectType}. Must be one of: ${this.validProjectTypes.join(', ')}`,
        code: 'INVALID_PROJECT_TYPE',
        value: config.projectType
      });
    }

    // Validate quality level
    if (!config.qualityLevel || !this.validQualityLevels.includes(config.qualityLevel)) {
      errors.push({
        field: 'qualityLevel',
        message: `Invalid quality level: ${config.qualityLevel}. Must be one of: ${this.validQualityLevels.join(', ')}`,
        code: 'INVALID_QUALITY_LEVEL',
        value: config.qualityLevel
      });
    }

    // Validate team size
    if (!config.teamSize || !this.validTeamSizes.includes(config.teamSize)) {
      errors.push({
        field: 'teamSize',
        message: `Invalid team size: ${config.teamSize}. Must be one of: ${this.validTeamSizes.join(', ')}`,
        code: 'INVALID_TEAM_SIZE',
        value: config.teamSize
      });
    }

    // Validate CI/CD flag
    if (typeof config.cicd !== 'boolean') {
      errors.push({
        field: 'cicd',
        message: `Invalid CI/CD setting: ${config.cicd}. Must be true or false`,
        code: 'INVALID_CICD_FLAG',
        value: config.cicd
      });
    }

    return errors;
  }

  /**
   * Sanitize and normalize configuration values
   */
  sanitizeConfiguration(config: Partial<CLIConfig>): CLIConfig {
    const sanitized: Partial<CLIConfig> = { ...config };

    // Normalize project type
    if (sanitized.projectType) {
      sanitized.projectType = sanitized.projectType.toLowerCase().trim();
      
      // Handle common aliases
      const aliases: Record<string, string> = {
        'javascript': 'js',
        'typescript': 'js',
        'ts': 'js',
        'node': 'js',
        'nodejs': 'js',
        'py': 'python',
        'golang': 'go',
        'rs': 'rust'
      };
      
      if (sanitized.projectType && sanitized.projectType in aliases) {
        const aliasValue = aliases[sanitized.projectType];
        if (aliasValue) {
          sanitized.projectType = aliasValue;
        }
      }
    }

    // Normalize quality level
    if (sanitized.qualityLevel) {
      sanitized.qualityLevel = sanitized.qualityLevel.toLowerCase().trim() as QualityLevel;
    }

    // Normalize team size
    if (sanitized.teamSize) {
      sanitized.teamSize = sanitized.teamSize.toLowerCase().trim() as TeamSize;
      // Handle 'team' -> 'large' mapping
      if (sanitized.teamSize === 'team' as TeamSize) {
        sanitized.teamSize = 'large';
      }
    }

    // Ensure CI/CD is boolean
    if (typeof sanitized.cicd === 'string') {
      const lowerValue = (sanitized.cicd as string).toLowerCase();
      sanitized.cicd = lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
    }

    // Provide defaults for required fields
    return {
      projectType: sanitized.projectType || 'other',
      qualityLevel: sanitized.qualityLevel || 'standard',
      teamSize: sanitized.teamSize || 'small',
      cicd: sanitized.cicd || false,
      ...sanitized
    };
  }

  /**
   * Run the interactive setup process with enhanced validation
   */
  async runInteractiveSetup(options: { languageOverride?: string } = {}): Promise<InteractiveSetupResult> {
    try {
      // Handle language override from CLI
      if (options.languageOverride) {
        const config: Partial<CLIConfig> = {
          projectType: options.languageOverride,
          qualityLevel: 'standard',
          teamSize: 'small',
          cicd: false
        };
        
        // Validate and sanitize the override
        const sanitizedConfig = this.sanitizeConfiguration(config);
        const validationErrors = this.validateConfiguration(sanitizedConfig);
        
        if (validationErrors.length > 0) {
          console.error(chalk.red('❌ Invalid language override:'));
          validationErrors.forEach(error => console.error(chalk.red(`   ${error.message}`)));
          throw new Error('Invalid configuration provided');
        }
        
        console.log(chalk.blue.bold('\n🤖 Claude Code Project Setup\n'));
        console.log(chalk.yellow(`Using language override: ${sanitizedConfig.projectType}`));
        
        // Return config for setup orchestrator to handle
        return sanitizedConfig;
      }

      // First ask what mode they want
      const modeAnswer = await inquirer.prompt([this.modeQuestion]);
      
      if (modeAnswer.mode === 'recovery') {
        return { mode: 'recovery' };
      } else if (modeAnswer.mode === 'devcontainer') {
        return { mode: 'devcontainer' };
      } else {
        return await this.runSetupMode();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Interactive setup failed:'), errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error(chalk.gray('Stack trace:'), error instanceof Error ? error.stack : 'No stack trace available');
      }
      throw error;
    }
  }

  /**
   * Handle setup mode with smart language detection and validation
   */
  async runSetupMode(): Promise<CLIConfig & { detection?: DetectionGuess }> {
    try {
      // Smart language detection with verification
      const { smartQuestions, detection } = await this.buildSmartQuestions();
      const rawAnswers = await inquirer.prompt(smartQuestions);
      
      // Process answers to normalize project type
      const processedAnswers = this.processSmartAnswers(rawAnswers, detection);
      
      // Sanitize and validate the configuration
      const sanitizedConfig = this.sanitizeConfiguration(processedAnswers);
      const validationErrors = this.validateConfiguration(sanitizedConfig);
      
      if (validationErrors.length > 0) {
        console.error(chalk.red('❌ Configuration validation failed:'));
        validationErrors.forEach(error => console.error(chalk.red(`   ${error.message}`)));
        throw new Error('Invalid configuration provided');
      }
      
      console.log(chalk.green('\n✅ Configuration complete!\n'));
      console.log(chalk.yellow('📋 Your setup:'));
      console.log(`   Project Type: ${sanitizedConfig.projectType}`);
      console.log(`   Quality Level: ${sanitizedConfig.qualityLevel}`);
      console.log(`   Team Size: ${sanitizedConfig.teamSize}`);
      console.log(`   CI/CD: ${sanitizedConfig.cicd ? 'Yes' : 'No'}\n`);
      
      // Delegate to setup orchestrator
      const { SetupOrchestrator } = await import('./setup.js');
      const orchestrator = new SetupOrchestrator();
      await orchestrator.runSetupMode(sanitizedConfig, detection);
      
      return { ...sanitizedConfig, detection };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Setup mode failed:'), errorMessage);
      if (process.env.NODE_ENV === 'development') {
        console.error(chalk.gray('Stack trace:'), error instanceof Error ? error.stack : 'No stack trace available');
      }
      throw error;
    }
  }
}