import inquirer from 'inquirer';
import chalk from 'chalk';
import { LanguageDetector } from '../language-detector.js';

/**
 * Interactive setup handler - manages user prompts and configuration
 */
export class InteractiveSetup {
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
          { name: 'Team - 6+ people, full CI/CD', value: 'team' }
        ]
      },
      {
        type: 'confirm',
        name: 'cicd',
        message: 'Set up CI/CD workflows?',
        default: false
      }
    ];
  }

  /**
   * Build smart questions with language detection and verification
   */
  async buildSmartQuestions() {
    console.log(chalk.blue('🔍 Detecting project language...'));
    
    const detector = new LanguageDetector();
    const detection = await detector.getBestGuess();
    
    let projectTypeQuestion;
    
    if (!detection) {
      // No detection - use original question
      console.log(chalk.gray('   No specific language detected, showing all options'));
      projectTypeQuestion = this.baseQuestions[0];
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
          new inquirer.Separator(),
          ...this.baseQuestions[0].choices
        ]
      };
    }
    
    // Build the full questions array
    const smartQuestions = [projectTypeQuestion];
    
    // Add post-processing for single detection confirmation
    if (detection && detection.type === 'single') {
      smartQuestions.push({
        type: 'list',
        name: 'projectType', 
        message: 'What type of project are you setting up?',
        choices: this.baseQuestions[0].choices,
        when: (answers) => !answers.useDetectedLanguage
      });
    }
    
    // Add the remaining questions (quality, team, cicd)
    smartQuestions.push(...this.baseQuestions.slice(1));
    
    return { smartQuestions, detection };
  }

  /**
   * Process smart question answers to normalize project type
   */
  processSmartAnswers(answers, detection) {
    // If user confirmed detected language, use it
    if (answers.useDetectedLanguage && detection && detection.type === 'single') {
      answers.projectType = detection.language;
    }
    
    delete answers.useDetectedLanguage; // Clean up
    return answers;
  }

  /**
   * Run the interactive setup process
   */
  async runInteractiveSetup() {
    // First ask what mode they want
    const modeAnswer = await inquirer.prompt([this.modeQuestion]);
    
    if (modeAnswer.mode === 'recovery') {
      const { SetupOrchestrator } = await import('./setup.js');
      const orchestrator = new SetupOrchestrator();
      await orchestrator.runRecoveryMode();
    } else if (modeAnswer.mode === 'devcontainer') {
      const { SetupOrchestrator } = await import('./setup.js');
      const orchestrator = new SetupOrchestrator();
      await orchestrator.runDevContainerMode();
    } else {
      await this.runSetupMode();
    }
  }

  /**
   * Handle setup mode with smart language detection
   */
  async runSetupMode() {
    // Smart language detection with verification
    const { smartQuestions, detection } = await this.buildSmartQuestions();
    const rawAnswers = await inquirer.prompt(smartQuestions);
    
    // Process answers to normalize project type
    const answers = this.processSmartAnswers(rawAnswers, detection);
    
    console.log(chalk.green('\n✅ Configuration complete!\n'));
    console.log(chalk.yellow('📋 Your setup:'));
    console.log(`   Project Type: ${answers.projectType}`);
    console.log(`   Quality Level: ${answers.qualityLevel}`);
    console.log(`   Team Size: ${answers.teamSize}`);
    console.log(`   CI/CD: ${answers.cicd ? 'Yes' : 'No'}\n`);
    
    // Delegate to setup orchestrator
    const { SetupOrchestrator } = await import('./setup.js');
    const orchestrator = new SetupOrchestrator();
    await orchestrator.runSetupMode(answers, detection);
  }
}