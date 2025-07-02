#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

console.log(chalk.blue.bold('\n🤖 Claude Code Project Setup\n'));

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
    console.log('1. Run quality check: npm run lint (or equivalent)');
    console.log('2. Review CLAUDE.md for AI collaboration guidelines');
    console.log('3. Start coding with professional standards in place\n');
    
  } catch (error) {
    console.error(chalk.red('❌ Setup failed:'), error.message);
    process.exit(1);
  }
}

async function setupProject(config) {
  console.log(chalk.blue('📁 Creating project structure...'));
  
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
  
  switch (config.projectType) {
    case 'js':
      await setupJavaScript(config);
      break;
    case 'python':
      await setupPython(config);
      break;
    case 'go':
      await setupGo(config);
      break;
    case 'rust':
      await setupRust(config);
      break;
    case 'java':
      await setupJava(config);
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
    'push', 'version-tag', 'maintainability', 'idea'
  ];
  
  for (const cmd of commands) {
    const content = `#!/bin/bash
# ${cmd} - Custom Claude Code command
echo "Running ${cmd} command..."
# Add command logic here
`;
    await fs.writeFile(`.claude/commands/${cmd}`, content);
    console.log(chalk.gray(`   Created command: ${cmd}`));
  }
}

async function setupJavaScript(config) {
  // Check if package.json exists, create if not
  if (!await fs.pathExists('package.json')) {
    const packageJson = {
      name: path.basename(process.cwd()),
      version: '1.0.0',
      scripts: {
        lint: 'eslint .',
        'lint:fix': 'eslint . --fix',
        format: 'prettier --write .',
        test: 'jest'
      }
    };
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log(chalk.gray('   Created package.json'));
  }
  
  console.log(chalk.yellow('   Run: npm install --save-dev eslint prettier jest'));
}

async function setupPython(config) {
  const pyprojectToml = `[tool.ruff]
line-length = 88
target-version = "py38"

[tool.ruff.lint]
select = ["E", "F", "W", "C90", "I", "N", "UP", "YTT", "S", "BLE", "FBT", "B", "A", "COM", "C4", "DTZ", "T10", "EM", "EXE", "ISC", "ICN", "G", "INP", "PIE", "T20", "PYI", "PT", "Q", "RSE", "RET", "SLF", "SIM", "TID", "TCH", "ARG", "PTH", "ERA", "PD", "PGH", "PL", "TRY", "NPY", "RUF"]
ignore = []

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
`;
  
  await fs.writeFile('pyproject.toml', pyprojectToml);
  console.log(chalk.gray('   Created pyproject.toml'));
  console.log(chalk.yellow('   Run: pip install ruff pytest'));
}

async function setupGo(config) {
  if (!await fs.pathExists('go.mod')) {
    console.log(chalk.yellow('   Run: go mod init <module-name>'));
  }
  console.log(chalk.yellow('   Install: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest'));
}

async function setupRust(config) {
  if (!await fs.pathExists('Cargo.toml')) {
    console.log(chalk.yellow('   Run: cargo init .'));
  }
}

async function setupJava(config) {
  console.log(chalk.yellow('   Run: gradle init (or maven setup)'));
}

async function setupCICD(config) {
  console.log(chalk.blue('🚀 Setting up CI/CD...'));
  await fs.ensureDir('.github/workflows');
  
  const workflow = generateGitHubActions(config);
  await fs.writeFile('.github/workflows/quality.yml', workflow);
  console.log(chalk.gray('   Created GitHub Actions workflow'));
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

if (require.main === module) {
  main();
}

module.exports = { main };