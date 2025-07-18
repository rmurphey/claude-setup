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


import { LanguageDetector } from './language-detector.js';

export class RecoverySystem {
  constructor() {
    this.templateDir = path.resolve(path.dirname(new globalThis.URL(import.meta.url).pathname), '..', 'templates');
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
      const { confirm } = await import('inquirer').then(m => m.default.prompt({
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with automatic recovery?',
        default: true
      }));

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
   * Detect missing or broken setup files
   */
  async detectIssues() {
    const issues = [];
    
    // Detect project language first
    const detector = new LanguageDetector();
    const detection = await detector.getBestGuess();
    const detectedLanguage = detection.language;
    
    // Core documentation files
    const coreFiles = [
      { path: 'CLAUDE.md', template: 'CLAUDE.md', severity: 'critical', description: 'Missing CLAUDE.md - AI collaboration guidelines' },
      { path: 'ACTIVE_WORK.md', template: 'ACTIVE_WORK.md', severity: 'critical', description: 'Missing ACTIVE_WORK.md - session management' }
    ];

    for (const file of coreFiles) {
      if (!await fs.pathExists(file.path)) {
        issues.push({
          type: 'missing-file',
          ...file,
          language: null
        });
      } else {
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
    } else {
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
    if (!config) return issues;

    for (const file of config) {
      const exists = await fs.pathExists(file.path) || 
                    (file.alternative && await fs.pathExists(file.alternative));
      
      if (!exists) {
        issues.push({
          type: 'missing-language-file',
          path: file.path,
          template: `${language}/${file.path}`,
          severity: 'high',
          description: file.description,
          language
        });
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
        } else {
          console.log(chalk.red(`   ❌ Failed: ${issue.description} - ${result.error}`));
          this.results.failed.push({ issue, error: result.error });
        }
      } catch (error) {
        console.log(chalk.red(`   ❌ Error: ${issue.description} - ${error.message}`));
        this.results.failed.push({ issue, error: error.message });
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
      const setupOptions = {
        qualityLevel: 'standard',
        teamSize: 'solo',
        setupCI: false,
        recoveryMode: true
      };
      
      await module.default.setup(setupOptions);
      
      return { success: true, path: issue.path, generated: true };
    } catch (error) {
      return { success: false, error: `Failed to generate ${issue.language} files: ${error.message}` };
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
      } catch {
        this.results.warnings.push('Git user.name not configured. Run: git config --global user.name "Your Name"');
      }
      
      try {
        execSync('git config user.email', { stdio: 'pipe' });
      } catch {
        this.results.warnings.push('Git user.email not configured. Run: git config --global user.email "your@email.com"');
      }
      
      return { success: true, path: '.git', initialized: true };
    } catch (error) {
      return { success: false, error: `Failed to initialize git: ${error.message}` };
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
    } catch (error) {
      this.results.warnings.push(`Could not process template variables in ${filePath}: ${error.message}`);
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