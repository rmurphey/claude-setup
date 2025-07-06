#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import { LanguageDetector } from '../lib/language-detector.js';

// Language setup modules
import javascript from '../lib/languages/javascript.js';
import python from '../lib/languages/python.js';
import go from '../lib/languages/go.js';
import rust from '../lib/languages/rust.js';
import java from '../lib/languages/java.js';
import swift from '../lib/languages/swift.js';

const modeQuestion = {
  type: 'list',
  name: 'mode',
  message: 'What would you like to do?',
  choices: [
    { name: '🚀 Set up new project infrastructure', value: 'setup' },
    { name: '🏥 Assess and recover existing codebase', value: 'recovery' },
    { name: '📦 Generate GitHub Codespaces DevContainer only', value: 'devcontainer' },
  ]
};

const questions = [
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

/**
 * Build smart questions with language detection and verification
 */
async function buildSmartQuestions() {
  console.log(chalk.blue('🔍 Detecting project language...'));
  
  const detector = new LanguageDetector();
  const detection = await detector.getBestGuess();
  
  let projectTypeQuestion;
  
  if (!detection) {
    // No detection - use original question
    console.log(chalk.gray('   No specific language detected, showing all options'));
    projectTypeQuestion = questions[0]; // Original project type question
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
        { name: 'JavaScript/TypeScript', value: 'js' },
        { name: 'Python', value: 'python' },
        { name: 'Go', value: 'go' },
        { name: 'Rust', value: 'rust' },
        { name: 'Java', value: 'java' },
        { name: 'Swift', value: 'swift' },
        { name: 'Mixed/Other', value: 'other' }
      ]
    };
  }
  
  // Build the full questions array
  const smartQuestions = [projectTypeQuestion];
  
  // Add post-processing for single detection confirmation
  if (detection && detection.type === 'single') {
    // We'll handle this after the confirmation
    smartQuestions.push({
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
      ],
      when: (answers) => !answers.useDetectedLanguage
    });
  }
  
  // Add the remaining questions (quality, team, cicd)
  smartQuestions.push(...questions.slice(1));
  
  return smartQuestions;
}

/**
 * Process smart question answers to normalize project type
 */
function processSmartAnswers(answers, detection) {
  // If user confirmed detected language, use it
  if (answers.useDetectedLanguage && detection && detection.type === 'single') {
    answers.projectType = detection.language;
  }
  
  delete answers.useDetectedLanguage; // Clean up
  return answers;
}

async function main() {
  try {
    console.log(chalk.blue.bold('\n🤖 Claude Code Project Setup\n'));
    
    // First ask what mode they want
    const modeAnswer = await inquirer.prompt([modeQuestion]);
    
    if (modeAnswer.mode === 'recovery') {
      await handleRecoveryMode();
    } else if (modeAnswer.mode === 'devcontainer') {
      await handleDevContainerMode();
    } else {
      await handleSetupMode();
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Operation failed:'), error.message);
    process.exit(1);
  }
}

async function handleSetupMode() {
  // Smart language detection with verification
  const detector = new LanguageDetector();
  const detection = await detector.getBestGuess();
  const smartQuestions = await buildSmartQuestions();
  const rawAnswers = await inquirer.prompt(smartQuestions);
  
  // Process answers to normalize project type
  const answers = processSmartAnswers(rawAnswers, detection);
  
  console.log(chalk.green('\n✅ Configuration complete!\n'));
  console.log(chalk.yellow('📋 Your setup:'));
  console.log(`   Project Type: ${answers.projectType}`);
  console.log(`   Quality Level: ${answers.qualityLevel}`);
  console.log(`   Team Size: ${answers.teamSize}`);
  console.log(`   CI/CD: ${answers.cicd ? 'Yes' : 'No'}\n`);
  
  await setupProject(answers);
  
  console.log(chalk.green.bold('🎉 Project setup complete!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log('1. Install dependencies as shown above');
  console.log('2. Connect to remote repository (if desired)');
  console.log('3. Run quality check: npm run lint (or equivalent)');
  console.log('4. Review CLAUDE.md for AI collaboration guidelines');
  console.log('5. Start coding with professional standards in place\n');
}

async function handleRecoveryMode() {
  console.log(chalk.blue.bold('\n🏥 Codebase Recovery Mode\n'));
  
  // Add recovery commands to the project
  await setupRecoveryCommands();
  
  console.log(chalk.green.bold('🎉 Recovery system installed!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log('1. Run `/recovery-assess` to analyze codebase health');
  console.log('2. Use `/recovery-plan` to generate improvement roadmap');
  console.log('3. Execute `/recovery-execute` for automated improvements');
  console.log('4. Track progress with regular assessments\n');
  console.log(chalk.yellow('💡 Pro tip: Start with assessment to understand current state\n'));
}

async function handleDevContainerMode() {
  console.log(chalk.blue.bold('\n📦 GitHub Codespaces DevContainer Generator\n'));
  console.log(chalk.gray('This creates .devcontainer/devcontainer.json for GitHub Codespaces'));
  console.log(chalk.gray('For full project setup, use the main setup mode instead.\n'));
  
  // Use smart detection for DevContainer too
  const detector = new LanguageDetector();
  const detection = await detector.getBestGuess();
  
  let projectTypeAnswer;
  
  if (detection && detection.type === 'single') {
    const evidence = detector.formatEvidence(detection.evidence);
    console.log(chalk.green(`   Detected ${detection.name} (${evidence})`));
    
    const confirmation = await inquirer.prompt([{
      type: 'confirm',
      name: 'useDetected',
      message: `Create DevContainer for detected language: ${detection.name}?`,
      default: true
    }]);
    
    if (confirmation.useDetected) {
      projectTypeAnswer = { projectType: detection.language };
    } else {
      projectTypeAnswer = await inquirer.prompt([{
        type: 'list',
        name: 'projectType',
        message: 'What programming language will you use in Codespaces?',
        choices: [
          { name: 'JavaScript/TypeScript', value: 'js' },
          { name: 'Python', value: 'python' },
          { name: 'Go', value: 'go' },
          { name: 'Rust', value: 'rust' },
          { name: 'Java', value: 'java' },
          { name: 'Swift', value: 'swift' },
          { name: 'Mixed/Other (basic configuration)', value: 'other' }
        ]
      }]);
    }
  } else {
    projectTypeAnswer = await inquirer.prompt([{
      type: 'list',
      name: 'projectType',
      message: 'What programming language will you use in Codespaces?',
      choices: [
        { name: 'JavaScript/TypeScript', value: 'js' },
        { name: 'Python', value: 'python' },
        { name: 'Go', value: 'go' },
        { name: 'Rust', value: 'rust' },
        { name: 'Java', value: 'java' },
        { name: 'Swift', value: 'swift' },
        { name: 'Mixed/Other (basic configuration)', value: 'other' }
      ]
    }]);
  }
  
  await generateDevContainer(projectTypeAnswer.projectType);
  
  console.log(chalk.green.bold('🎉 GitHub Codespaces DevContainer created!\n'));
  console.log(chalk.blue('Next steps:'));
  console.log('1. Commit the .devcontainer/ directory to your repository');
  console.log('2. Open repository in GitHub Codespaces');
  console.log('3. Codespaces will automatically use this configuration');
  console.log('4. Dependencies and tools will be pre-installed\n');
  console.log(chalk.yellow('💡 For complete project setup (linting, testing, etc.), run this tool again in setup mode'));
}

async function setupProject(config) {
  console.log(chalk.blue('📁 Creating project structure...'));
  
  // Initialize git repository first
  await initializeGitRepository();
  
  // Create basic documentation
  await createDocumentation(config);
  
  // Create language-specific setup
  await setupLanguage(config);
  
  // Create custom commands
  await setupCommands();
  
  // Setup CI/CD if requested
  if (config.cicd) {
    await setupCICD(config);
  }
  
  // Create initial commit
  await createInitialCommit(config);
}

async function createDocumentation(config) {
  const templates = {
    'CLAUDE.md': generateClaudeTemplate(config),
    'ACTIVE_WORK.md': generateActiveWorkTemplate(config),
    '.gitignore': generateGitignore(config.projectType)
  };
  
  for (const [filename, content] of Object.entries(templates)) {
    await fs.writeFile(filename, content);
    console.log(chalk.gray(`   Created ${filename}`));
  }
  
  // Copy utility libraries for project maintenance
  await copyUtilityLibraries();
}

async function setupLanguage(config) {
  console.log(chalk.blue('🔧 Setting up language-specific tools...'));
  
  // Simple detection for existing files
  const detection = {
    existingFiles: {
      packageJson: await fs.pathExists('package.json'),
      pyprojectToml: await fs.pathExists('pyproject.toml'),
      goMod: await fs.pathExists('go.mod'),
      cargoToml: await fs.pathExists('Cargo.toml'),
      pomXml: await fs.pathExists('pom.xml'),
      buildGradle: await fs.pathExists('build.gradle'),
      packageSwift: await fs.pathExists('Package.swift'),
      xcodeproj: await fs.pathExists('*.xcodeproj'),
      xcworkspace: await fs.pathExists('*.xcworkspace')
    }
  };
  
  switch (config.projectType) {
    case 'js':
      await javascript.setup(config, detection);
      break;
    case 'python':
      await python.setup(config, detection);
      break;
    case 'go':
      await go.setup(config, detection);
      break;
    case 'rust':
      await rust.setup(config, detection);
      break;
    case 'java':
      await java.setup(config, detection);
      break;
    case 'swift':
      await swift.setup(config, detection);
      break;
    default:
      console.log(chalk.yellow('   Manual setup required for this project type'));
  }
}

async function copyUtilityLibraries() {
  console.log(chalk.blue('📚 Installing utility libraries...'));
  
  await fs.ensureDir('lib');
  
  const libraries = [
    'readme-updater.js'
  ];
  
  for (const lib of libraries) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'lib', lib);
      const targetPath = `lib/${lib}`;
      
      if (await fs.pathExists(templatePath)) {
        await fs.copy(templatePath, targetPath);
        console.log(chalk.gray(`   Created lib/${lib}`));
      }
    } catch (error) {
      console.log(chalk.yellow(`   Warning: Could not create lib/${lib}`));
    }
  }
}

async function setupCommands() {
  console.log(chalk.blue('⚡ Creating custom commands...'));
  
  await fs.ensureDir('.claude/commands');
  
  const commands = [
    'hygiene', 'todo', 'design', 'commit', 'next',
    'learn', 'docs', 'estimate', 'reflect', 'defer',
    'push', 'version-tag', 'maintainability', 'idea', 'ideation',
    'recovery-assess', 'recovery-plan', 'recovery-execute', 'update-docs',
    'issue'
  ];
  
  for (const cmd of commands) {
    // Copy command template from our templates directory
    const templatePath = path.join(__dirname, '..', 'templates', 'commands', `${cmd}.md`);
    const targetPath = `.claude/commands/${cmd}.md`;
    
    try {
      if (await fs.pathExists(templatePath)) {
        await fs.copy(templatePath, targetPath);
        console.log(chalk.gray(`   Created command: ${cmd}.md`));
      } else {
        // Fallback for commands without templates yet
        const content = `---
allowed-tools: [Bash]
description: ${cmd} command
---

# ${cmd.charAt(0).toUpperCase() + cmd.slice(1)} Command

## Context
- Project status: !git status --porcelain

## Your task
Implement ${cmd} functionality.

## Output
Provide helpful output for the ${cmd} command.
`;
        await fs.writeFile(targetPath, content);
        console.log(chalk.gray(`   Created command template: ${cmd}.md`));
      }
    } catch (error) {
      console.log(chalk.yellow(`   Warning: Could not create ${cmd} command`));
    }
  }
}

async function setupRecoveryCommands() {
  console.log(chalk.blue('🏥 Installing recovery system...'));
  
  await fs.ensureDir('.claude/commands');
  
  const recoveryCommands = ['recovery-assess', 'recovery-plan', 'recovery-execute'];
  
  for (const cmd of recoveryCommands) {
    const sourcePath = path.join(__dirname, '..', '.claude', 'commands', `${cmd}.md`);
    const targetPath = `.claude/commands/${cmd}.md`;
    
    try {
      await fs.copy(sourcePath, targetPath);
      console.log(chalk.gray(`   Installed: ${cmd}.md`));
    } catch (error) {
      console.log(chalk.yellow(`   Warning: Could not install ${cmd} command`));
    }
  }
  
  // Also copy the basic commands if .claude doesn't exist
  if (!await fs.pathExists('.claude/commands/hygiene.md')) {
    console.log(chalk.blue('📋 Installing basic command suite...'));
    const basicCommands = ['hygiene', 'todo', 'learn', 'commit', 'push', 'next', 'ideation'];
    
    for (const cmd of basicCommands) {
      const sourcePath = path.join(__dirname, '..', '.claude', 'commands', `${cmd}.md`);
      const targetPath = `.claude/commands/${cmd}.md`;
      
      try {
        await fs.copy(sourcePath, targetPath);
        console.log(chalk.gray(`   Installed: ${cmd}.md`));
      } catch (error) {
        console.log(chalk.yellow(`   Warning: Could not install ${cmd} command`));
      }
    }
  }
}


async function setupCICD(config) {
  console.log(chalk.blue('🚀 Setting up CI/CD...'));
  await fs.ensureDir('.github/workflows');
  
  const workflow = generateGitHubActions(config);
  await fs.writeFile('.github/workflows/quality.yml', workflow);
  console.log(chalk.gray('   Created GitHub Actions workflow'));
}

async function initializeGitRepository() {
  console.log(chalk.blue('🔄 Initializing git repository...'));
  
  try {
    // Check if already a git repository
    try {
      execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      console.log(chalk.gray('   Git repository already exists'));
      return;
    } catch {
      // Not a git repository, continue with initialization
    }
    
    // Initialize git repository
    execSync('git init', { stdio: 'ignore' });
    console.log(chalk.gray('   Initialized git repository'));
    
    // Set up initial branch as main
    try {
      execSync('git branch -M main', { stdio: 'ignore' });
    } catch {
      // Ignore if already on main or no commits yet
    }
    
  } catch (error) {
    console.log(chalk.yellow('   Warning: Could not initialize git repository'));
    console.log(chalk.yellow('   Please run "git init" manually'));
  }
}

async function createInitialCommit(config) {
  console.log(chalk.blue('📝 Creating initial commit...'));
  
  try {
    // Add all files
    execSync('git add .', { stdio: 'ignore' });
    
    // Create initial commit
    const commitMessage = `Initial Claude Code project setup

Project Type: ${config.projectType}
Quality Level: ${config.qualityLevel}
Team Size: ${config.teamSize}
CI/CD: ${config.cicd ? 'Yes' : 'No'}

Setup includes:
- Quality tools and configuration
- Custom Claude commands
- Documentation templates
- ${config.cicd ? 'GitHub Actions workflows' : 'Local development tools'}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;

    execSync(`git commit -m "${commitMessage}"`, { stdio: 'ignore' });
    console.log(chalk.gray('   Created initial commit'));
    
    // Show next steps for git
    console.log(chalk.blue('\n📡 Git repository ready!'));
    console.log(chalk.gray('   To connect to remote repository:'));
    console.log(chalk.gray('   git remote add origin <your-repo-url>'));
    console.log(chalk.gray('   git push -u origin main'));
    
  } catch (error) {
    console.log(chalk.yellow('   Warning: Could not create initial commit'));
    console.log(chalk.yellow('   Files created but not committed to git'));
    console.log(chalk.gray('   Run "git add . && git commit -m \'Initial setup\'" manually'));
  }
}

function generateClaudeTemplate(config) {
  const template = fs.readFileSync(path.join(__dirname, '../templates/CLAUDE.md'), 'utf8');
  return template
    .replace(/\{\{QUALITY_LEVEL\}\}/g, config.qualityLevel)
    .replace(/\{\{TEAM_SIZE\}\}/g, config.teamSize)
    .replace(/\{\{WARNING_THRESHOLD\}\}/g, config.qualityLevel === 'strict' ? '0' : config.qualityLevel === 'standard' ? '<10' : '<50')
    .replace(/\{\{COVERAGE_TARGET\}\}/g, config.qualityLevel === 'strict' ? '70' : config.qualityLevel === 'standard' ? '50' : '30');
}

function generateActiveWorkTemplate(config) {
  const template = fs.readFileSync(path.join(__dirname, '../templates/ACTIVE_WORK.md'), 'utf8');
  return template
    .replace(/\{\{QUALITY_LEVEL\}\}/g, config.qualityLevel)
    .replace(/\{\{PROJECT_TYPE\}\}/g, config.projectType)
    .replace(/\{\{DATE\}\}/g, new Date().toISOString().split('T')[0]);
}

function generateGitignore(projectType) {
  const common = `
# Dependencies
node_modules/
__pycache__/
target/
*.pyc
*.pyo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/
`;

  switch (projectType) {
    case 'js':
      return `${common}
# JavaScript/TypeScript
dist/
build/
*.tsbuildinfo
.eslintcache
`;
    case 'swift':
      return `${common}
# Swift
.build/
.swiftpm/
*.xcodeproj/
*.xcworkspace/
xcuserdata/
DerivedData/
*.hmap
*.ipa
*.dSYM.zip
*.dSYM
Carthage/
Pods/
`;
    case 'python':
      return `${common}
# Python
*.egg-info/
.pytest_cache/
.coverage
htmlcov/
`;
    default:
      return common;
  }
}

async function generateDevContainer(projectType) {
  console.log(chalk.blue('📦 Generating DevContainer configuration...'));
  
  await fs.ensureDir('.devcontainer');
  
  const devcontainerConfig = getDevContainerConfig(projectType);
  await fs.writeFile('.devcontainer/devcontainer.json', JSON.stringify(devcontainerConfig, null, 2));
  
  console.log(chalk.gray('   Created .devcontainer/devcontainer.json'));
}

function getDevContainerConfig(projectType) {
  const baseConfig = {
    name: 'Development Container',
    image: 'mcr.microsoft.com/devcontainers/universal:2',
    features: {},
    customizations: {
      vscode: {
        extensions: []
      }
    },
    forwardPorts: [],
    postCreateCommand: '',
    remoteUser: 'vscode'
  };
  
  switch (projectType) {
    case 'js':
      return {
        name: 'JavaScript/TypeScript Development',
        image: 'mcr.microsoft.com/devcontainers/javascript-node:18',
        customizations: {
          vscode: {
            extensions: [
              'esbenp.prettier-vscode',
              'dbaeumer.vscode-eslint',
              'ms-vscode.vscode-typescript-next'
            ]
          }
        },
        forwardPorts: [3000, 8080],
        portsAttributes: {
          '3000': { label: 'App' },
          '8080': { label: 'Server' }
        },
        onCreateCommand: 'npm ci --prefer-offline',
        remoteUser: 'node',
        waitFor: 'onCreateCommand'
      };
    
    case 'python':
      return {
        name: 'Python Development',
        image: 'mcr.microsoft.com/devcontainers/python:3.11',
        customizations: {
          vscode: {
            extensions: [
              'ms-python.python',
              'ms-python.flake8',
              'charliermarsh.ruff'
            ]
          }
        },
        forwardPorts: [8000, 5000],
        portsAttributes: {
          '8000': { label: 'Django' },
          '5000': { label: 'Flask' }
        },
        onCreateCommand: 'pip install --cache-dir /tmp/pip-cache -e . || echo \'No setup.py found\'',
        remoteUser: 'vscode',
        waitFor: 'onCreateCommand'
      };
    
    case 'go':
      return {
        name: 'Go Development',
        image: 'mcr.microsoft.com/devcontainers/go:1.21',
        customizations: {
          vscode: {
            extensions: [
              'golang.go'
            ]
          }
        },
        forwardPorts: [8080],
        portsAttributes: {
          '8080': { label: 'Go Server' }
        },
        onCreateCommand: 'go mod download || echo \'No go.mod found\'',
        remoteUser: 'vscode',
        waitFor: 'onCreateCommand'
      };
    
    case 'rust':
      return {
        name: 'Rust Development', 
        image: 'mcr.microsoft.com/devcontainers/rust:latest',
        customizations: {
          vscode: {
            extensions: [
              'rust-lang.rust-analyzer'
            ]
          }
        },
        forwardPorts: [8080],
        portsAttributes: {
          '8080': { label: 'Rust Server' }
        },
        onCreateCommand: 'cargo fetch || echo \'No Cargo.toml found\'',
        remoteUser: 'vscode',
        waitFor: 'onCreateCommand'
      };
    
    case 'java':
      return {
        name: 'Java Development',
        image: 'mcr.microsoft.com/devcontainers/java:17',
        customizations: {
          vscode: {
            extensions: [
              'vscjava.vscode-java-pack'
            ]
          }
        },
        forwardPorts: [8080],
        portsAttributes: {
          '8080': { label: 'Java Server' }
        },
        onCreateCommand: 'mvn dependency:go-offline || gradle build --refresh-dependencies || echo \'No build file found\'',
        remoteUser: 'vscode',
        waitFor: 'onCreateCommand'
      };
    
    case 'swift':
      return {
        name: 'Swift Development',
        image: 'mcr.microsoft.com/devcontainers/swift:latest',
        customizations: {
          vscode: {
            extensions: [
              'sswg.swift-lang'
            ]
          }
        },
        forwardPorts: [8080],
        portsAttributes: {
          '8080': { label: 'Swift Server' }
        },
        onCreateCommand: 'swift package resolve || echo \'No Package.swift found\'',
        remoteUser: 'vscode',
        waitFor: 'onCreateCommand'
      };
    
    default:
      return baseConfig;
  }
}

function generateGitHubActions(config) {
  return `name: Quality Check
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        if: contains('js', '${config.projectType}')
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        if: contains('js', '${config.projectType}')
        run: npm ci
        
      - name: Run linting
        if: contains('js', '${config.projectType}')
        run: npm run lint
        
      - name: Run tests
        if: contains('js', '${config.projectType}')
        run: npm test
`;
}

// In ES modules, check if script is run directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run main only if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { 
  main, 
  setupProject, 
  createDocumentation, 
  setupLanguage, 
  setupCommands, 
  generateClaudeTemplate, 
  generateActiveWorkTemplate, 
  generateGitignore,
  generateDevContainer,
  getDevContainerConfig
};