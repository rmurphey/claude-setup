#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

// Language setup modules
import javascript from '../lib/languages/javascript.js';
import python from '../lib/languages/python.js';
import go from '../lib/languages/go.js';
import rust from '../lib/languages/rust.js';
import java from '../lib/languages/java.js';

console.log(chalk.blue.bold('\n🤖 Claude Code Project Setup\n'));

const modeQuestion = {
  type: 'list',
  name: 'mode',
  message: 'What would you like to do?',
  choices: [
    { name: '🚀 Set up new project infrastructure', value: 'setup' },
    { name: '🏥 Assess and recover existing codebase', value: 'recovery' },
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

async function main() {
  try {
    // First ask what mode they want
    const modeAnswer = await inquirer.prompt([modeQuestion]);
    
    if (modeAnswer.mode === 'recovery') {
      await handleRecoveryMode();
    } else {
      await handleSetupMode();
    }
    
  } catch (error) {
    console.error(chalk.red('❌ Operation failed:'), error.message);
    process.exit(1);
  }
}

async function handleSetupMode() {
  const answers = await inquirer.prompt(questions);
  
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
      buildGradle: await fs.pathExists('build.gradle')
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
    default:
      console.log(chalk.yellow('   Manual setup required for this project type'));
  }
}

async function setupCommands() {
  console.log(chalk.blue('⚡ Creating custom commands...'));
  
  await fs.ensureDir('.claude/commands');
  
  const commands = [
    'hygiene', 'todo', 'design', 'commit', 'next',
    'learn', 'docs', 'estimate', 'reflect', 'defer',
    'push', 'version-tag', 'maintainability', 'idea',
    'recovery-assess', 'recovery-plan', 'recovery-execute'
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
    const basicCommands = ['hygiene', 'todo', 'learn', 'commit', 'push', 'next'];
    
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

// Run main - CLI is always meant to be executed
main();

export { main };