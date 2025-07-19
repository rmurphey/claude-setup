import { execSync } from 'child_process';
import path from 'path';
import chalk from 'chalk';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import { LanguageDetector } from '../language-detector.js';
// Language setup modules
import javascript from '../languages/javascript.js';
import python from '../languages/python.js';
import go from '../languages/go.js';
import rust from '../languages/rust.js';
import java from '../languages/java.js';
import swift from '../languages/swift.js';
/**
 * Setup orchestrator - coordinates different setup modes
 */
class SetupOrchestrator {
    languageModules;
    constructor() {
        this.languageModules = {
            js: javascript,
            python,
            go,
            rust,
            java,
            swift
        };
    }
    /**
     * Run the main setup mode - moved from main.js
     */
    async runSetupMode(config, detection) {
        console.log(chalk.blue.bold('\n🤖 Claude Code Project Setup\n'));
        // Language override handling is now done in main.js
        // This method expects a full config object
        // If we have a full config, run direct setup
        if (config && config.projectType) {
            await this.setupProject(config);
            // Save language detection config for future use
            if (detection && detection.type === 'single') {
                const detector = new LanguageDetector();
                await detector.saveConfig(detection, {
                    qualityLevel: config.qualityLevel,
                    teamSize: config.teamSize,
                    cicd: config.cicd,
                    lastSetup: new Date().toISOString()
                });
                console.log(chalk.gray('   Saved language detection config to .claude-setup.json'));
            }
            console.log(chalk.green.bold('🎉 Project setup complete!\n'));
            console.log(chalk.blue('Next steps:'));
            // Get language-specific commands with fallbacks
            const { getLanguageCommands } = await import('./utils.js');
            const { installCmd, lintCmd } = await getLanguageCommands(config.projectType);
            console.log(`1. Install dependencies: ${installCmd}`);
            console.log('2. Connect to remote repository (if desired)');
            console.log(`3. Run quality check: ${lintCmd}`);
            console.log('4. Review CLAUDE.md for AI collaboration guidelines');
            console.log('5. Start coding with professional standards in place\n');
        }
        else {
            // No config provided - this should be handled by main.js
            console.error(chalk.red('❌ No configuration provided to setup orchestrator'));
            throw new Error('Setup orchestrator requires configuration');
        }
    }
    /**
     * Run recovery mode - moved from main.js
     */
    async runRecoveryMode() {
        console.log(chalk.blue.bold('\n🔧 Claude Setup Recovery\n'));
        const { runRecovery } = await import('../recovery-system.js');
        await runRecovery(process.argv.slice(2));
    }
    /**
     * Run DevContainer mode
     */
    async runDevContainerMode() {
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
            }
            else {
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
        }
        else {
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
        await this.generateDevContainer(projectTypeAnswer.projectType);
        console.log(chalk.green.bold('🎉 GitHub Codespaces DevContainer created!\n'));
        console.log(chalk.blue('Next steps:'));
        console.log('1. Commit the .devcontainer/ directory to your repository');
        console.log('2. Open repository in GitHub Codespaces');
        console.log('3. Codespaces will automatically use this configuration');
        console.log('4. Dependencies and tools will be pre-installed\n');
        console.log(chalk.yellow('💡 For complete project setup (linting, testing, etc.), run this tool again in setup mode'));
    }
    /**
     * Main project setup orchestration
     */
    async setupProject(config) {
        console.log(chalk.blue('📁 Creating project structure...'));
        // Initialize git repository first
        await this.initializeGitRepository();
        // Create basic documentation
        await this.createDocumentation(config);
        // Create language-specific setup
        await this.setupLanguage(config);
        // Create custom commands
        await this.setupCommands();
        // Setup CI/CD if requested
        if (config.cicd) {
            await this.setupCICD(config);
        }
        // Create initial commit
        await this.createInitialCommit(config);
    }
    /**
     * Initialize git repository
     */
    async initializeGitRepository() {
        console.log(chalk.blue('🔄 Initializing git repository...'));
        try {
            // Check if already a git repository
            try {
                execSync('git rev-parse --git-dir', { stdio: 'ignore' });
                console.log(chalk.gray('   Git repository already exists'));
                return;
            }
            catch {
                // Not a git repository, continue with initialization
            }
            // Initialize git repository
            execSync('git init', { stdio: 'ignore' });
            console.log(chalk.gray('   Initialized git repository'));
            // Set up initial branch as main
            try {
                execSync('git branch -M main', { stdio: 'ignore' });
            }
            catch {
                // Ignore if already on main or no commits yet
            }
        }
        catch {
            console.log(chalk.yellow('   Warning: Could not initialize git repository'));
            console.log(chalk.yellow('   Please run "git init" manually'));
        }
    }
    /**
     * Create project documentation
     */
    async createDocumentation(config) {
        const templates = {
            'CLAUDE.md': this.generateClaudeTemplate(config),
            'ACTIVE_WORK.md': this.generateActiveWorkTemplate(config),
            '.gitignore': this.generateGitignore(config.projectType)
        };
        for (const [filename, content] of Object.entries(templates)) {
            await fs.writeFile(filename, content);
            console.log(chalk.gray(`   Created ${filename}`));
        }
        // Copy utility libraries for project maintenance
        await this.copyUtilityLibraries();
    }
    /**
     * Setup language-specific tools
     */
    async setupLanguage(config) {
        console.log(chalk.blue('🔧 Setting up language-specific tools...'));
        // Create proper LanguageDetection object for language modules
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
            },
            language: config.projectType,
            confidence: 1.0,
            evidence: ['setup-mode']
        };
        // Create proper LanguageConfig object for language modules
        const languageConfig = {
            projectType: config.projectType,
            qualityLevel: config.qualityLevel,
            teamSize: config.teamSize,
            cicd: config.cicd
        };
        const languageModule = this.languageModules[config.projectType];
        if (languageModule) {
            // Use the existing language module interface
            await languageModule.setup(languageConfig, detection);
        }
        else {
            console.log(chalk.yellow('   Manual setup required for this project type'));
        }
    }
    /**
     * Copy utility libraries
     */
    async copyUtilityLibraries() {
        console.log(chalk.blue('📚 Installing utility libraries...'));
        await fs.ensureDir('lib');
        const libraries = ['readme-updater.js'];
        for (const lib of libraries) {
            try {
                const templatePath = path.join(process.cwd(), 'templates', 'lib', lib);
                const targetPath = `lib/${lib}`;
                if (await fs.pathExists(templatePath)) {
                    await fs.copy(templatePath, targetPath);
                    console.log(chalk.gray(`   Created lib/${lib}`));
                }
            }
            catch {
                console.log(chalk.yellow(`   Warning: Could not create lib/${lib}`));
            }
        }
    }
    /**
     * Setup custom commands
     */
    async setupCommands() {
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
            const templatePath = path.join(process.cwd(), 'templates', 'commands', `${cmd}.md`);
            const targetPath = `.claude/commands/${cmd}.md`;
            try {
                if (await fs.pathExists(templatePath)) {
                    await fs.copy(templatePath, targetPath);
                    console.log(chalk.gray(`   Created command: ${cmd}.md`));
                }
                else {
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
            }
            catch {
                console.log(chalk.yellow(`   Warning: Could not create ${cmd} command`));
            }
        }
    }
    /**
     * Setup CI/CD workflows
     */
    async setupCICD(config) {
        console.log(chalk.blue('🚀 Setting up CI/CD...'));
        await fs.ensureDir('.github/workflows');
        const workflow = this.generateGitHubActions(config);
        await fs.writeFile('.github/workflows/quality.yml', workflow);
        console.log(chalk.gray('   Created GitHub Actions workflow'));
    }
    /**
     * Create initial commit
     */
    async createInitialCommit(config) {
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
        }
        catch {
            console.log(chalk.yellow('   Warning: Could not create initial commit'));
            console.log(chalk.yellow('   Files created but not committed to git'));
            console.log(chalk.gray('   Run "git add . && git commit -m \'Initial setup\'" manually'));
        }
    }
    /**
     * Generate DevContainer configuration
     */
    async generateDevContainer(projectType) {
        console.log(chalk.blue('📦 Generating DevContainer configuration...'));
        await fs.ensureDir('.devcontainer');
        const devcontainerConfig = this.getDevContainerConfig(projectType);
        await fs.writeFile('.devcontainer/devcontainer.json', JSON.stringify(devcontainerConfig, null, 2));
        console.log(chalk.gray('   Created .devcontainer/devcontainer.json'));
    }
    /**
     * Generate Claude template
     */
    generateClaudeTemplate(config) {
        const template = `# Claude Code Collaboration Guidelines

## Project Configuration
- **Quality Level**: ${config.qualityLevel}
- **Team Size**: ${config.teamSize}
- **Warning Threshold**: ${config.qualityLevel === 'strict' ? '0' : config.qualityLevel === 'standard' ? '<10' : '<50'}
- **Coverage Target**: ${config.qualityLevel === 'strict' ? '70' : config.qualityLevel === 'standard' ? '50' : '30'}%

## Development Standards
This project follows ${config.qualityLevel} quality standards with ${config.teamSize} team practices.

## Custom Commands
Use the following commands for structured development:
- \`/hygiene\` - Code quality check
- \`/todo\` - Task management
- \`/commit\` - Structured commits
- \`/learn\` - Knowledge capture
- \`/docs\` - Documentation updates

## Quality Guidelines
- Maintain ${config.qualityLevel} code quality standards
- Keep warnings ${config.qualityLevel === 'strict' ? 'at zero' : config.qualityLevel === 'standard' ? 'under 10' : 'under 50'}
- Target ${config.qualityLevel === 'strict' ? '70' : config.qualityLevel === 'standard' ? '50' : '30'}% test coverage
- Follow team size practices for ${config.teamSize} development

## Collaboration
This project is set up for AI-assisted development with Claude Code.
`;
        return template;
    }
    /**
     * Generate Active Work template
     */
    generateActiveWorkTemplate(config) {
        const template = `# Active Work Session

## Project Info
- **Type**: ${config.projectType}
- **Quality**: ${config.qualityLevel}
- **Date**: ${new Date().toISOString().split('T')[0]}

## Current Session
*Update this section with your current work focus*

### Goals
- [ ] Initial project setup complete

### Progress
- [x] Project structure created
- [x] Quality tools configured
- [ ] First feature implementation

### Notes
Project initialized with ${config.qualityLevel} quality standards.

## Next Steps
1. Review generated configuration files
2. Install dependencies
3. Begin feature development
4. Set up remote repository

---
*This file tracks active development sessions and progress*
`;
        return template;
    }
    /**
     * Generate gitignore file
     */
    generateGitignore(projectType) {
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
    /**
     * Generate GitHub Actions workflow
     */
    generateGitHubActions(config) {
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
    /**
     * Get DevContainer configuration
     */
    getDevContainerConfig(projectType) {
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
}
// Export individual functions for backward compatibility with tests
const orchestrator = new SetupOrchestrator();
function generateClaudeTemplate(config) {
    return orchestrator.generateClaudeTemplate(config);
}
function generateActiveWorkTemplate(config) {
    return orchestrator.generateActiveWorkTemplate(config);
}
function generateGitignore(projectType) {
    return orchestrator.generateGitignore(projectType);
}
function getDevContainerConfig(projectType) {
    return orchestrator.getDevContainerConfig(projectType);
}
export { SetupOrchestrator, generateClaudeTemplate, generateActiveWorkTemplate, generateGitignore, getDevContainerConfig };
//# sourceMappingURL=setup.js.map