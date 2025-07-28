import chalk from 'chalk';
import fs from 'fs-extra';

// eslint-disable-next-line import/no-unresolved
import { LanguageDetector, SingleDetectionGuess } from '../language-detector.js';

export interface ProjectStructureChecks {
  isDirectory: boolean;
  isWritable: boolean;
  hasGit: boolean;
}

export interface LanguageCommands {
  installCmd: string;
  lintCmd: string;
}

export type OutputType = 'success' | 'warning' | 'error' | 'info';

/**
 * CLI utilities - shared functions for CLI operations
 */
export class CLIUtils {
  /**
   * Format output with consistent styling
   */
  static formatOutput(message: string, type: OutputType = 'info'): string {
    switch (type) {
      case 'success':
        return chalk.green(`✅ ${message}`);
      case 'warning':
        return chalk.yellow(`⚠️  ${message}`);
      case 'error':
        return chalk.red(`❌ ${message}`);
      case 'info':
      default:
        return chalk.blue(`ℹ️  ${message}`);
    }
  }

  /**
   * Validate basic project structure
   */
  static async validateProjectStructure(projectPath: string = process.cwd()): Promise<ProjectStructureChecks> {
    const checks: ProjectStructureChecks = {
      isDirectory: await fs.pathExists(projectPath),
      isWritable: true, // Will be checked by attempting to write
      hasGit: false
    };

    try {
      // Check if git repository exists
      const gitPath = `${projectPath}/.git`;
      checks.hasGit = await fs.pathExists(gitPath);
    } catch {
      // Git check failed, but not critical
    }

    try {
      // Test write permissions
      const testFile = `${projectPath}/.claude-setup-test`;
      await fs.writeFile(testFile, 'test');
      await fs.remove(testFile);
    } catch {
      checks.isWritable = false;
    }

    return checks;
  }
}

/**
 * Handle language detection command
 */
export async function handleLanguageDetection(args: string[]): Promise<void> {
  const detector = new LanguageDetector();
  
  const forceDetection = args.includes('--force');
  const saveConfig = !args.includes('--no-save');
  
  console.log(chalk.blue('🔍 Detecting project language...'));
  
  try {
    const detection = await detector.getBestGuess(!forceDetection);
    
    if (!detection) {
      console.log(chalk.yellow('❌ No language detected in current directory'));
      console.log('Try running in a directory with source code files.');
      return;
    }
    
    if (detection.source === 'config') {
      console.log(chalk.green(`✅ Using cached detection: ${detection.name}`));
      const config = await detector.loadConfig();
      if (config.language?.detected) {
        console.log(chalk.gray(`   Detected: ${new Date(config.language.detected).toLocaleString()}`));
      }
      console.log(chalk.gray('   Use --force to run fresh detection'));
    } else {
      if (detection.type === 'single') {
        console.log(chalk.green(`✅ Detected: ${detection.name}`));
        const evidence = detector.formatEvidence(detection.evidence);
        console.log(chalk.gray(`   Evidence: ${evidence}`));
        console.log(chalk.gray(`   Confidence: ${detection.confidence}`));
        
        if (saveConfig) {
          const saved = await detector.saveConfig(detection as SingleDetectionGuess);
          if (saved) {
            console.log(chalk.gray('   Saved to .claude-setup.json'));
          }
        }
      } else {
        console.log(chalk.yellow('   Multiple languages detected:'));
        detection.candidates.forEach((candidate, i) => {
          const evidence = detector.formatEvidence(candidate.evidence);
          console.log(chalk.gray(`   ${i + 1}. ${candidate.name} (${evidence})`));
        });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(chalk.red('❌ Language detection failed:'), errorMessage);
    process.exit(1);
  }
}

/**
 * Handle configuration management command
 */
export async function handleConfigManagement(args: string[]): Promise<void> {
  const detector = new LanguageDetector();
  
  if (args.includes('--show')) {
    // Show current config
    const config = await detector.loadConfig();
    if (Object.keys(config).length === 0) {
      console.log(chalk.yellow('No configuration file found'));
      console.log('Run --detect-language to create one');
    } else {
      console.log(chalk.green('Current configuration:'));
      console.log(JSON.stringify(config, null, 2));
    }
    return;
  }
  
  if (args.includes('--reset')) {
    // Reset/delete config
    try {
      if (await fs.pathExists('.claude-setup.json')) {
        await fs.remove('.claude-setup.json');
        console.log(chalk.green('✅ Configuration reset'));
      } else {
        console.log(chalk.yellow('No configuration file to reset'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(chalk.red('❌ Failed to reset config:'), errorMessage);
      process.exit(1);
    }
    return;
  }
  
  // Default: show config info
  console.log(chalk.blue('Configuration management options:'));
  console.log('  --config --show    Show current configuration');
  console.log('  --config --reset   Reset configuration');
  console.log('  --detect-language  Detect and save language config');
}

/**
 * Handle GitHub issues sync command
 */
export async function handleSyncIssues(): Promise<void> {
  const { syncGitHubIssues } = await import('../github-sync.js') as { syncGitHubIssues: () => Promise<void> };
  
  // Let GitHubSync class handle file resolution automatically using ActiveWorkFileResolver
  // This removes the file existence check that caused "Active work file not found" errors
  await syncGitHubIssues();
}

/**
 * Get language-specific commands
 */
export async function getLanguageCommands(projectType: string): Promise<LanguageCommands> {
  // Import language modules dynamically
  interface LanguageModule {
    default?: {
      installCommand?: string;
      lintCommand?: string;
    };
  }
  
  const languageModules: Record<string, () => Promise<LanguageModule>> = {
    js: () => import('../languages/javascript.js'),
    python: () => import('../languages/python.js'),
    go: () => import('../languages/go.js'),
    rust: () => import('../languages/rust.js'),
    java: () => import('../languages/java.js'),
    swift: () => import('../languages/swift.js')
  };
  
  if (languageModules[projectType]) {
    try {
      const module = await languageModules[projectType]();
      return {
        installCmd: module.default?.installCommand || 'Install dependencies according to your project type',
        lintCmd: module.default?.lintCommand || 'Run quality checks according to your project type'
      };
    } catch {
      // Fallback if module import fails
    }
  }
  
  return {
    installCmd: 'Install dependencies according to your project type',
    lintCmd: 'Run quality checks according to your project type'
  };
}