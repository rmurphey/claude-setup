#!/usr/bin/env node
/**
 * One-Command Project Recovery System
 *
 * Detects missing or broken setup files and restores them from templates.
 * Saves hours of manual re-setup when projects get corrupted.
 */
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import chalk from 'chalk';
import { RecoveryError } from '../types/index.js';
import { LanguageDetector } from './language-detector.js';
export class RecoverySystem {
    templateDir;
    results;
    constructor() {
        this.templateDir = path.resolve(path.dirname(new globalThis.URL(import.meta.url).pathname), '..', '..', 'templates');
        this.results = {
            detected: [],
            restored: [],
            failed: [],
            warnings: []
        };
    }
    /**
     * Main recovery command - detect and fix all issues
     */
    async executeRecovery(options = {}) {
        console.log(chalk.blue('🔧 Claude Setup Recovery - Scanning for issues...'));
        const issues = await this.detectIssues();
        if (issues.length === 0) {
            console.log(chalk.green('✅ No issues detected! Your setup appears to be complete.'));
            return { success: true, issues: [], restored: [] };
        }
        console.log(chalk.yellow(`\n⚠️  Detected ${issues.length} issues:`));
        issues.forEach(issue => {
            console.log(`   ${issue.severity === 'critical' ? '🔴' : '🟡'} ${issue.description}`);
        });
        if (options.dryRun) {
            console.log(chalk.blue('\n📋 Dry run mode - no changes will be made'));
            return { success: true, issues, restored: [] };
        }
        // Confirm recovery
        if (!options.autoFix) {
            const inquirer = await import('inquirer');
            const { confirm } = await inquirer.default.prompt({
                type: 'confirm',
                name: 'confirm',
                message: 'Proceed with automatic recovery?',
                default: true
            });
            if (!confirm) {
                console.log(chalk.gray('Recovery cancelled by user.'));
                return { success: false, issues, restored: [] };
            }
        }
        console.log(chalk.blue('\n🔨 Starting recovery process...'));
        const restored = await this.fixIssues(issues);
        console.log(chalk.green(`\n✅ Recovery complete! Fixed ${restored.length} issues.`));
        if (this.results.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Warnings:'));
            this.results.warnings.forEach(warning => console.log(`   ${warning}`));
        }
        return { success: true, issues, restored };
    }
    /**
     * Assess recovery needs and create assessment
     */
    async assessRecovery() {
        const issues = await this.detectIssues();
        // Calculate overall severity
        const severityLevels = { critical: 4, high: 3, medium: 2, low: 1 };
        const maxSeverity = Math.max(...issues.map(issue => severityLevels[issue.severity]));
        const overallSeverity = Object.keys(severityLevels).find(key => severityLevels[key] === maxSeverity);
        // Estimate fix time (in minutes)
        const timeEstimates = { critical: 5, high: 3, medium: 2, low: 1 };
        const estimatedFixTime = issues.reduce((total, issue) => total + timeEstimates[issue.severity], 0);
        // Check if all issues are auto-fixable
        const autoFixable = issues.every(issue => this.isAutoFixable(issue));
        return {
            issues,
            severity: overallSeverity,
            estimatedFixTime,
            autoFixable
        };
    }
    /**
     * Create a recovery plan for the detected issues
     */
    async createRecoveryPlan(issues) {
        const steps = [];
        let requiresUserInput = false;
        for (const issue of issues) {
            const step = this.createRecoveryStep(issue);
            steps.push(step);
            if (!this.isAutoFixable(issue)) {
                requiresUserInput = true;
            }
        }
        // Estimate total time (in minutes)
        const timeEstimates = { critical: 5, high: 3, medium: 2, low: 1 };
        const estimatedTime = issues.reduce((total, issue) => total + timeEstimates[issue.severity], 0);
        return {
            steps,
            estimatedTime,
            requiresUserInput
        };
    }
    /**
     * Create a recovery step for a specific issue
     */
    createRecoveryStep(issue) {
        switch (issue.type) {
            case 'missing-file':
            case 'corrupted-file':
                return {
                    description: `Restore ${issue.path} from template`,
                    command: `copy template ${issue.template} to ${issue.path}`,
                    validation: `check file exists: ${issue.path}`,
                    rollback: issue.type === 'corrupted-file' ? `restore backup of ${issue.path}` : undefined
                };
            case 'missing-directory':
                return {
                    description: `Create directory ${issue.path}`,
                    command: `copy template directory ${issue.template} to ${issue.path}`,
                    validation: `check directory exists: ${issue.path}`
                };
            case 'missing-command':
                return {
                    description: `Restore command file ${issue.path}`,
                    command: `copy template ${issue.template} to ${issue.path}`,
                    validation: `check file exists: ${issue.path}`
                };
            case 'missing-language-file':
                return {
                    description: `Generate ${issue.language} configuration file ${issue.path}`,
                    command: `run ${issue.language} setup module`,
                    validation: `check file exists: ${issue.path}`
                };
            case 'missing-git':
                return {
                    description: 'Initialize git repository',
                    command: 'git init',
                    validation: 'check .git directory exists'
                };
            default:
                return {
                    description: `Fix unknown issue: ${issue.description}`,
                    command: 'manual intervention required',
                    validation: 'manual verification required'
                };
        }
    }
    /**
     * Check if an issue can be automatically fixed
     */
    isAutoFixable(issue) {
        // Git initialization might require user configuration
        if (issue.type === 'missing-git') {
            return false;
        }
        // Language files might require user input for configuration
        if (issue.type === 'missing-language-file') {
            return true; // We can generate with defaults
        }
        // File and directory restoration is always auto-fixable
        return true;
    }
    /**
     * Detect missing or broken setup files
     */
    async detectIssues() {
        const issues = [];
        // Detect project language first
        const detector = new LanguageDetector();
        const detection = await detector.getBestGuess();
        const detectedLanguage = detection && 'language' in detection ? detection.language : 'unknown';
        // Core documentation files
        const coreFiles = [
            {
                path: 'CLAUDE.md',
                template: 'CLAUDE.md',
                severity: 'critical',
                description: 'Missing CLAUDE.md - AI collaboration guidelines'
            },
            {
                path: 'ACTIVE_WORK.md',
                template: 'ACTIVE_WORK.md',
                severity: 'critical',
                description: 'Missing ACTIVE_WORK.md - session management'
            }
        ];
        for (const file of coreFiles) {
            if (!await fs.pathExists(file.path)) {
                issues.push({
                    type: 'missing-file',
                    ...file,
                    language: null
                });
            }
            else {
                // Check if file is corrupted (too small or missing key content)
                const content = await fs.readFile(file.path, 'utf8');
                if (content.length < 100 || !content.includes('# ')) {
                    issues.push({
                        type: 'corrupted-file',
                        ...file,
                        description: file.description.replace('Missing', 'Corrupted'),
                        language: null
                    });
                }
            }
        }
        // Command directory and files
        const commandsDir = '.claude/commands';
        if (!await fs.pathExists(commandsDir)) {
            issues.push({
                type: 'missing-directory',
                path: commandsDir,
                template: 'commands',
                severity: 'critical',
                description: 'Missing .claude/commands directory - custom commands not available',
                language: null
            });
        }
        else {
            // Check for essential commands
            const essentialCommands = ['hygiene.md', 'todo.md', 'commit.md', 'next.md'];
            for (const cmd of essentialCommands) {
                const cmdPath = path.join(commandsDir, cmd);
                if (!await fs.pathExists(cmdPath)) {
                    issues.push({
                        type: 'missing-command',
                        path: cmdPath,
                        template: `commands/${cmd}`,
                        severity: 'high',
                        description: `Missing essential command: /${cmd.replace('.md', '')}`,
                        language: null
                    });
                }
            }
        }
        // Language-specific files
        if (detectedLanguage && detectedLanguage !== 'unknown') {
            const langIssues = await this.detectLanguageIssues(detectedLanguage);
            issues.push(...langIssues);
        }
        // Git repository
        if (!await fs.pathExists('.git')) {
            issues.push({
                type: 'missing-git',
                path: '.git',
                template: null,
                severity: 'high',
                description: 'Not a git repository - version control not initialized',
                language: null
            });
        }
        return issues.sort((a, b) => {
            const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
            return severityOrder[a.severity] - severityOrder[b.severity];
        });
    }
    /**
     * Detect language-specific setup issues
     */
    async detectLanguageIssues(language) {
        const issues = [];
        const languageConfigs = {
            javascript: [
                { path: 'package.json', description: 'Missing package.json - Node.js project configuration' },
                { path: '.eslintrc.json', description: 'Missing ESLint configuration' }
            ],
            python: [
                { path: 'pyproject.toml', description: 'Missing pyproject.toml - Python project configuration' }
            ],
            go: [
                { path: 'go.mod', description: 'Missing go.mod - Go module configuration' }
            ],
            rust: [
                { path: 'Cargo.toml', description: 'Missing Cargo.toml - Rust project configuration' }
            ],
            java: [
                { path: 'pom.xml', description: 'Missing pom.xml or build.gradle - Java build configuration', alternative: 'build.gradle' }
            ],
            swift: [
                { path: 'Package.swift', description: 'Missing Package.swift - Swift package configuration' }
            ]
        };
        const config = languageConfigs[language];
        if (!config)
            return issues;
        for (const file of config) {
            const exists = await fs.pathExists(file.path) ||
                (file.alternative && await fs.pathExists(file.alternative));
            if (!exists) {
                const issue = {
                    type: 'missing-language-file',
                    path: file.path,
                    template: `${language}/${file.path}`,
                    severity: 'high',
                    description: file.description,
                    language
                };
                if (file.alternative) {
                    issue.alternative = file.alternative;
                }
                issues.push(issue);
            }
        }
        return issues;
    }
    /**
     * Fix detected issues by restoring from templates
     */
    async fixIssues(issues) {
        const restored = [];
        for (const issue of issues) {
            try {
                const result = await this.fixSingleIssue(issue);
                if (result.success) {
                    restored.push(result);
                    console.log(chalk.green(`   ✅ Fixed: ${issue.description}`));
                }
                else {
                    console.log(chalk.red(`   ❌ Failed: ${issue.description} - ${result.error}`));
                    this.results.failed.push({ issue, error: result.error || 'Unknown error' });
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.log(chalk.red(`   ❌ Error: ${issue.description} - ${errorMessage}`));
                this.results.failed.push({ issue, error: errorMessage });
            }
        }
        return restored;
    }
    /**
     * Fix a single issue
     */
    async fixSingleIssue(issue) {
        switch (issue.type) {
            case 'missing-file':
            case 'corrupted-file':
                return await this.restoreFileFromTemplate(issue);
            case 'missing-directory':
                return await this.restoreDirectoryFromTemplate(issue);
            case 'missing-command':
                return await this.restoreCommandFromTemplate(issue);
            case 'missing-language-file':
                return await this.restoreLanguageFileFromTemplate(issue);
            case 'missing-git':
                return await this.initializeGitRepository();
            default:
                return { success: false, error: `Unknown issue type: ${issue.type}` };
        }
    }
    /**
     * Restore a file from template
     */
    async restoreFileFromTemplate(issue) {
        if (!issue.template) {
            return { success: false, error: 'No template specified for file restoration' };
        }
        const templatePath = path.join(this.templateDir, issue.template);
        if (!await fs.pathExists(templatePath)) {
            return { success: false, error: `Template not found: ${templatePath}` };
        }
        // Backup existing file if corrupted
        if (issue.type === 'corrupted-file' && await fs.pathExists(issue.path)) {
            const backupPath = `${issue.path}.backup.${Date.now()}`;
            await fs.move(issue.path, backupPath);
            this.results.warnings.push(`Backed up corrupted file to ${backupPath}`);
        }
        await fs.copy(templatePath, issue.path);
        // Process template variables if needed
        await this.processTemplateVariables(issue.path, issue.language);
        return { success: true, path: issue.path, template: issue.template };
    }
    /**
     * Restore entire command directory
     */
    async restoreDirectoryFromTemplate(issue) {
        if (!issue.template) {
            return { success: false, error: 'No template specified for directory restoration' };
        }
        const templatePath = path.join(this.templateDir, issue.template);
        if (!await fs.pathExists(templatePath)) {
            return { success: false, error: `Template directory not found: ${templatePath}` };
        }
        await fs.ensureDir(path.dirname(issue.path));
        await fs.copy(templatePath, issue.path);
        return { success: true, path: issue.path, template: issue.template };
    }
    /**
     * Restore a single command file
     */
    async restoreCommandFromTemplate(issue) {
        if (!issue.template) {
            return { success: false, error: 'No template specified for command restoration' };
        }
        const templatePath = path.join(this.templateDir, issue.template);
        if (!await fs.pathExists(templatePath)) {
            return { success: false, error: `Command template not found: ${templatePath}` };
        }
        await fs.ensureDir(path.dirname(issue.path));
        await fs.copy(templatePath, issue.path);
        return { success: true, path: issue.path, template: issue.template };
    }
    /**
     * Restore language-specific configuration file
     */
    async restoreLanguageFileFromTemplate(issue) {
        if (!issue.language) {
            return { success: false, error: 'No language specified for language file restoration' };
        }
        // For language files, we need to generate them using the language setup modules
        const languageModules = {
            javascript: () => import('./languages/javascript.js'),
            python: () => import('./languages/python.js'),
            go: () => import('./languages/go.js'),
            rust: () => import('./languages/rust.js'),
            java: () => import('./languages/java.js'),
            swift: () => import('./languages/swift.js')
        };
        const moduleLoader = languageModules[issue.language];
        if (!moduleLoader) {
            return { success: false, error: `No module found for language: ${issue.language}` };
        }
        try {
            const module = await moduleLoader();
            // Call the setup function with recovery mode
            const config = {
                projectType: issue.language,
                qualityLevel: 'standard',
                teamSize: 'solo',
                cicd: false,
                recoveryMode: true
            };
            const detection = {
                existingFiles: {},
                language: issue.language,
                confidence: 1.0,
                evidence: ['recovery-mode']
            };
            await module.default.setup(config, detection);
            return { success: true, path: issue.path, generated: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: `Failed to generate ${issue.language} files: ${errorMessage}` };
        }
    }
    /**
     * Initialize git repository
     */
    async initializeGitRepository() {
        try {
            execSync('git init', { stdio: 'pipe' });
            // Set up basic git configuration if not present
            try {
                execSync('git config user.name', { stdio: 'pipe' });
            }
            catch {
                this.results.warnings.push('Git user.name not configured. Run: git config --global user.name "Your Name"');
            }
            try {
                execSync('git config user.email', { stdio: 'pipe' });
            }
            catch {
                this.results.warnings.push('Git user.email not configured. Run: git config --global user.email "your@email.com"');
            }
            return { success: true, path: '.git', initialized: true };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return { success: false, error: `Failed to initialize git: ${errorMessage}` };
        }
    }
    /**
     * Process template variables in restored files
     */
    async processTemplateVariables(filePath, _language) {
        try {
            let content = await fs.readFile(filePath, 'utf8');
            // Replace common template variables
            const replacements = {
                '{{QUALITY_LEVEL}}': 'Standard',
                '{{TEAM_SIZE}}': 'Solo',
                '{{WARNING_THRESHOLD}}': '<10',
                '{{COVERAGE_TARGET}}': '50'
            };
            for (const [placeholder, value] of Object.entries(replacements)) {
                content = content.replace(new RegExp(placeholder, 'g'), value);
            }
            await fs.writeFile(filePath, content);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.results.warnings.push(`Could not process template variables in ${filePath}: ${errorMessage}`);
        }
    }
    /**
     * Generate recovery report
     */
    generateReport() {
        return {
            summary: {
                detected: this.results.detected.length,
                restored: this.results.restored.length,
                failed: this.results.failed.length,
                warnings: this.results.warnings.length
            },
            details: this.results
        };
    }
    /**
     * Validate recovery operations with comprehensive error handling
     */
    async validateRecovery(issues) {
        try {
            for (const issue of issues) {
                const isValid = await this.validateSingleIssue(issue);
                if (!isValid) {
                    return {
                        success: false,
                        error: new RecoveryError(`Validation failed for issue: ${issue.description}`, {
                            issue: issue.type,
                            path: issue.path
                        })
                    };
                }
            }
            return { success: true, data: true };
        }
        catch (error) {
            return {
                success: false,
                error: new RecoveryError('Recovery validation failed', {
                    originalError: error instanceof Error ? error.message : 'Unknown error'
                })
            };
        }
    }
    /**
     * Validate a single recovery issue
     */
    async validateSingleIssue(issue) {
        switch (issue.type) {
            case 'missing-file':
            case 'corrupted-file':
            case 'missing-command':
                return await fs.pathExists(issue.path);
            case 'missing-directory':
                return await fs.pathExists(issue.path) && (await fs.stat(issue.path)).isDirectory();
            case 'missing-language-file':
                return await fs.pathExists(issue.path) ||
                    (issue.alternative ? await fs.pathExists(issue.alternative) : false);
            case 'missing-git':
                return await fs.pathExists('.git') && (await fs.stat('.git')).isDirectory();
            default:
                return false;
        }
    }
}
// CLI usage
export async function runRecovery(args = []) {
    const options = {
        dryRun: args.includes('--dry-run'),
        autoFix: args.includes('--auto-fix'),
        verbose: args.includes('--verbose')
    };
    const recovery = new RecoverySystem();
    const result = await recovery.executeRecovery(options);
    if (options.verbose) {
        console.log(chalk.blue('\n📊 Recovery Report:'));
        const report = recovery.generateReport();
        console.log(JSON.stringify(report, null, 2));
    }
    return result;
}
export default RecoverySystem;
//# sourceMappingURL=recovery-system.js.map