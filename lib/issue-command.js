import chalk from 'chalk';
import fs from 'fs-extra';

import { GitHubAPI } from './github-api.js';

/**
 * Issue command implementation
 * Used both internally by claude-setup and templated for user projects
 */
export class IssueCommand {
  constructor() {
    this.github = new GitHubAPI();
  }

  /**
   * Main issue command handler
   */
  async execute(args) {
    try {
      if (args.length === 0) {
        return await this.showHelp();
      }

      const command = args[0];

      switch (command) {
        case 'list':
          return await this.listIssues(args.slice(1));
        case 'current':
          return await this.showCurrent();
        case 'help':
          return await this.showHelp();
        default: {
          // Assume it's an issue number
          const issueNumber = parseInt(command);
          if (isNaN(issueNumber)) {
            console.error(chalk.red('❌ Invalid issue number or command'));
            return await this.showHelp();
          }
          return await this.workOnIssue(issueNumber, args.slice(1));
        }
      }
    } catch (error) {
      console.error(chalk.red('❌ Issue command failed:'), error.message);
      process.exit(1);
    }
  }

  /**
   * Work on a specific issue
   */
  async workOnIssue(issueNumber, args) {
    console.log(chalk.blue(`🔍 Fetching issue #${issueNumber}...`));
    
    // Parse optional repo argument
    const repoOverride = args.find(arg => arg.includes('/'));
    
    // Fetch issue details
    const issue = await this.github.fetchIssue(issueNumber, repoOverride);
    
    console.log(chalk.green(`📋 Issue #${issue.number}: ${issue.title}`));
    console.log(chalk.gray(`   Author: ${issue.user.login}`));
    console.log(chalk.gray(`   State: ${issue.state}`));
    console.log(chalk.gray(`   Labels: ${issue.labels?.map(l => l.name).join(', ') || 'None'}`));
    console.log(chalk.gray(`   URL: ${issue.html_url}`));
    
    // Create branch
    console.log(chalk.blue('🌿 Creating branch...'));
    const branchName = await this.github.createIssueBranch(issue);
    console.log(chalk.green(`✅ Created and switched to branch: ${branchName}`));
    
    // Create context documentation
    console.log(chalk.blue('📝 Creating issue context...'));
    const contextFile = await this.github.createIssueContext(issue);
    console.log(chalk.green(`✅ Issue context saved to: ${contextFile}`));
    
    // Update ACTIVE_WORK.md
    await this.updateActiveWork(issue, branchName);
    
    console.log(chalk.green('\n🎯 Ready to work on issue!'));
    console.log(chalk.yellow('Next steps:'));
    console.log(chalk.yellow('  1. Review the issue context in .claude/issues/'));
    console.log(chalk.yellow('  2. Plan your implementation approach'));
    console.log(chalk.yellow('  3. Start development'));
    console.log(chalk.yellow('  4. Use /commit when ready to commit changes'));
  }

  /**
   * List issues
   */
  async listIssues(args) {
    console.log(chalk.blue('📋 Fetching issues...'));
    
    const filters = this.parseListFilters(args);
    const issues = await this.github.listIssues(filters);
    
    if (issues.length === 0) {
      console.log(chalk.yellow('No issues found matching criteria'));
      return;
    }
    
    console.log(chalk.green(`\n📋 Found ${issues.length} issues:\n`));
    
    issues.forEach(issue => {
      const stateColor = issue.state === 'open' ? chalk.green : chalk.gray;
      const labels = issue.labels?.map(l => chalk.cyan(`[${l.name}]`)).join(' ') || '';
      
      console.log(`${stateColor('●')} #${issue.number} ${issue.title}`);
      console.log(chalk.gray(`   ${issue.user.login} • ${new Date(issue.updated_at).toLocaleDateString()} ${labels}`));
      console.log('');
    });
    
    console.log(chalk.blue(`Use 'issue ${issues[0].number}' to work on an issue`));
  }

  /**
   * Show current issue context
   */
  async showCurrent() {
    try {
      // Check if we're on a issue branch
      const currentBranch = require('child_process')
        .execSync('git branch --show-current', { encoding: 'utf8' })
        .trim();
      
      const issueMatch = currentBranch.match(/issue-(\d+)/);
      if (!issueMatch) {
        console.log(chalk.yellow('Not currently on an issue branch'));
        return;
      }
      
      const issueNumber = parseInt(issueMatch[1]);
      const contextFile = `.claude/issues/issue-${issueNumber}.md`;
      
      if (await fs.pathExists(contextFile)) {
        console.log(chalk.green(`📋 Current issue: #${issueNumber}`));
        console.log(chalk.blue(`Branch: ${currentBranch}`));
        console.log(chalk.blue(`Context: ${contextFile}`));
        
        // Show recent commits on this branch
        try {
          const commits = require('child_process')
            .execSync('git log --oneline -5 origin/main..HEAD', { encoding: 'utf8' })
            .trim();
          
          if (commits) {
            console.log(chalk.green('\n📝 Recent commits:'));
            console.log(commits.split('\n').map(line => `  ${line}`).join('\n'));
          }
        } catch {
          // No commits yet
        }
      } else {
        console.log(chalk.yellow(`Issue context file not found: ${contextFile}`));
      }
    } catch (error) {
      console.log(chalk.red('Error checking current issue:', error.message));
    }
  }

  /**
   * Parse list command filters
   */
  parseListFilters(args) {
    const filters = {};
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg === '--state' && args[i + 1]) {
        filters.state = args[i + 1];
        i++;
      } else if (arg === '--assignee' && args[i + 1]) {
        filters.assignee = args[i + 1];
        i++;
      } else if (arg === '--labels' && args[i + 1]) {
        filters.labels = args[i + 1];
        i++;
      } else if (arg === '--limit' && args[i + 1]) {
        filters.limit = args[i + 1];
        i++;
      }
    }
    
    return filters;
  }

  /**
   * Update ACTIVE_WORK.md with issue context
   */
  async updateActiveWork(issue, branchName) {
    const activeWorkPath = 'ACTIVE_WORK.md';
    
    if (await fs.pathExists(activeWorkPath)) {
      try {
        let content = await fs.readFile(activeWorkPath, 'utf8');
        
        // Update current session focus
        const issueSection = `## Current Session Focus
Working on Issue #${issue.number}: ${issue.title}
- **Branch**: ${branchName}
- **State**: ${issue.state}
- **URL**: ${issue.html_url}
- **Context**: .claude/issues/issue-${issue.number}.md

`;
        
        // Replace existing current session focus or add it
        if (content.includes('## Current Session Focus')) {
          content = content.replace(
            /## Current Session Focus[\s\S]*?(?=##|$)/,
            issueSection
          );
        } else {
          content = issueSection + content;
        }
        
        await fs.writeFile(activeWorkPath, content);
        console.log(chalk.green('✅ Updated ACTIVE_WORK.md with issue context'));
      } catch (error) {
        console.log(chalk.yellow('⚠️  Could not update ACTIVE_WORK.md:', error.message));
      }
    }
  }

  /**
   * Show help for issue command
   */
  async showHelp() {
    console.log(chalk.blue('GitHub Issue Command Help\n'));
    
    console.log(chalk.green('Usage:'));
    console.log('  issue <number> [repo]     Work on specific issue');
    console.log('  issue list [options]      List issues');
    console.log('  issue current             Show current issue context');
    console.log('  issue help                Show this help\n');
    
    console.log(chalk.green('Examples:'));
    console.log('  issue 123                 Work on issue #123 in current repo');
    console.log('  issue 456 owner/repo      Work on issue #456 in specific repo');
    console.log('  issue list                List open issues');
    console.log('  issue list --state closed List closed issues');
    console.log('  issue list --assignee me  List issues assigned to you\n');
    
    console.log(chalk.green('List Options:'));
    console.log('  --state <open|closed|all> Filter by issue state');
    console.log('  --assignee <username>     Filter by assignee');
    console.log('  --labels <label1,label2>  Filter by labels');
    console.log('  --limit <number>          Limit number of results (default: 10)\n');
    
    console.log(chalk.yellow('Authentication:'));
    console.log('  Requires GitHub authentication via "gh auth login" or GITHUB_TOKEN env var');
  }
}