#!/usr/bin/env node

/**
 * GitHub Issue Command
 * 
 * Streamlines working on GitHub issues by:
 * - Fetching issue details from GitHub API
 * - Creating appropriately named branches
 * - Setting up issue context documentation
 * - Updating ACTIVE_WORK.md with issue focus
 * 
 * Usage:
 *   issue <number>           - Work on specific issue
 *   issue <number> owner/repo - Work on issue in different repo
 *   issue list              - List open issues
 *   issue current           - Show current issue context
 *   issue help              - Show help
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';

class GitHubAPI {
  constructor() {
    this.token = this.getGitHubToken();
    this.repo = this.getCurrentRepo();
  }

  getGitHubToken() {
    if (process.env.GITHUB_TOKEN) {
      return process.env.GITHUB_TOKEN;
    }

    try {
      const token = execSync('gh auth token', { encoding: 'utf8', stdio: 'pipe' }).trim();
      return token;
    } catch (error) {
      throw new Error('GitHub authentication required. Please run "gh auth login" or set GITHUB_TOKEN environment variable.');
    }
  }

  getCurrentRepo() {
    try {
      const remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: 'pipe' }).trim();
      const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
      if (!match) {
        throw new Error('Not a GitHub repository');
      }
      return `${match[1]}/${match[2]}`;
    } catch (error) {
      throw new Error('Could not determine GitHub repository. Make sure you\'re in a git repository with a GitHub remote.');
    }
  }

  async fetchIssue(issueNumber, repoOverride = null) {
    const repo = repoOverride || this.repo;
    const url = `https://api.github.com/repos/${repo}/issues/${issueNumber}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'claude-setup-cli'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Issue #${issueNumber} not found in ${repo}`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to GitHub API');
      }
      throw error;
    }
  }

  async listIssues(filters = {}, repoOverride = null) {
    const repo = repoOverride || this.repo;
    const params = new URLSearchParams({
      state: filters.state || 'open',
      sort: filters.sort || 'updated',
      direction: filters.direction || 'desc',
      per_page: filters.limit || '10'
    });

    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.labels) params.append('labels', filters.labels);
    if (filters.milestone) params.append('milestone', filters.milestone);

    const url = `https://api.github.com/repos/${repo}/issues?${params}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `token ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'claude-setup-cli'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to GitHub API');
      }
      throw error;
    }
  }

  generateBranchName(issue) {
    const username = this.getCurrentUsername();
    const issueType = this.getIssueType(issue);
    const sanitizedTitle = issue.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30)
      .replace(/-$/, '');
    
    return `${username}/${issueType}/issue-${issue.number}-${sanitizedTitle}`;
  }

  getCurrentUsername() {
    try {
      return execSync('git config user.name', { encoding: 'utf8', stdio: 'pipe' }).trim().toLowerCase().replace(/\s+/g, '');
    } catch {
      return 'user';
    }
  }

  getIssueType(issue) {
    const labels = issue.labels?.map(l => l.name.toLowerCase()) || [];
    
    if (labels.some(l => l.includes('bug') || l.includes('fix'))) return 'ktlo';
    if (labels.some(l => l.includes('feature') || l.includes('enhancement'))) return 'feat';
    if (labels.some(l => l.includes('docs') || l.includes('documentation'))) return 'docs';
    if (labels.some(l => l.includes('test') || l.includes('testing'))) return 'test';
    if (labels.some(l => l.includes('refactor') || l.includes('cleanup'))) return 'improvement';
    if (labels.some(l => l.includes('dx') || l.includes('developer') || l.includes('tooling'))) return 'productivity';
    
    return 'feat';
  }

  async createIssueBranch(issue) {
    const branchName = this.generateBranchName(issue);
    
    try {
      const defaultBranch = this.getDefaultBranch();
      execSync(`git checkout ${defaultBranch}`, { stdio: 'pipe' });
      execSync('git pull origin HEAD', { stdio: 'pipe' });
      execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
      
      return branchName;
    } catch (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }
  }

  getDefaultBranch() {
    try {
      const branch = execSync('git symbolic-ref refs/remotes/origin/HEAD', { encoding: 'utf8', stdio: 'pipe' })
        .trim()
        .replace('refs/remotes/origin/', '');
      return branch;
    } catch {
      try {
        execSync('git show-ref --verify --quiet refs/heads/main', { stdio: 'pipe' });
        return 'main';
      } catch {
        return 'master';
      }
    }
  }

  async createIssueContext(issue) {
    const content = `# Issue #${issue.number}: ${issue.title}

## Issue Details
- **Repository**: ${issue.repository_url?.split('/').slice(-2).join('/') || this.repo}
- **State**: ${issue.state}
- **Author**: ${issue.user?.login}
- **Created**: ${new Date(issue.created_at).toLocaleDateString()}
- **Updated**: ${new Date(issue.updated_at).toLocaleDateString()}
- **URL**: ${issue.html_url}

## Labels
${issue.labels?.map(l => `- ${l.name}`).join('\n') || 'No labels'}

## Description
${issue.body || 'No description provided'}

## Progress Notes
- [ ] Issue analysis completed
- [ ] Implementation plan created
- [ ] Development started
- [ ] Testing completed
- [ ] Ready for review

## Implementation Notes
*Add notes about your approach, discoveries, and decisions here*

---
*Generated by claude-setup GitHub issue command*
`;

    const filename = `.claude/issues/issue-${issue.number}.md`;
    await fs.ensureDir('.claude/issues');
    await fs.writeFile(filename, content);
    
    return filename;
  }
}

class IssueCommand {
  constructor() {
    this.github = new GitHubAPI();
  }

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
        default:
          const issueNumber = parseInt(command);
          if (isNaN(issueNumber)) {
            console.error('❌ Invalid issue number or command');
            return await this.showHelp();
          }
          return await this.workOnIssue(issueNumber, args.slice(1));
      }
    } catch (error) {
      console.error('❌ Issue command failed:', error.message);
      process.exit(1);
    }
  }

  async workOnIssue(issueNumber, args) {
    console.log(`🔍 Fetching issue #${issueNumber}...`);
    
    const repoOverride = args.find(arg => arg.includes('/'));
    const issue = await this.github.fetchIssue(issueNumber, repoOverride);
    
    console.log(`📋 Issue #${issue.number}: ${issue.title}`);
    console.log(`   Author: ${issue.user.login}`);
    console.log(`   State: ${issue.state}`);
    console.log(`   Labels: ${issue.labels?.map(l => l.name).join(', ') || 'None'}`);
    console.log(`   URL: ${issue.html_url}`);
    
    console.log('🌿 Creating branch...');
    const branchName = await this.github.createIssueBranch(issue);
    console.log(`✅ Created and switched to branch: ${branchName}`);
    
    console.log('📝 Creating issue context...');
    const contextFile = await this.github.createIssueContext(issue);
    console.log(`✅ Issue context saved to: ${contextFile}`);
    
    await this.updateActiveWork(issue, branchName);
    
    console.log('\n🎯 Ready to work on issue!');
    console.log('Next steps:');
    console.log('  1. Review the issue context in .claude/issues/');
    console.log('  2. Plan your implementation approach');
    console.log('  3. Start development');
    console.log('  4. Use /commit when ready to commit changes');
  }

  async listIssues(args) {
    console.log('📋 Fetching issues...');
    
    const filters = this.parseListFilters(args);
    const issues = await this.github.listIssues(filters);
    
    if (issues.length === 0) {
      console.log('No issues found matching criteria');
      return;
    }
    
    console.log(`\n📋 Found ${issues.length} issues:\n`);
    
    issues.forEach(issue => {
      const stateIcon = issue.state === 'open' ? '●' : '○';
      const labels = issue.labels?.map(l => `[${l.name}]`).join(' ') || '';
      
      console.log(`${stateIcon} #${issue.number} ${issue.title}`);
      console.log(`   ${issue.user.login} • ${new Date(issue.updated_at).toLocaleDateString()} ${labels}`);
      console.log('');
    });
    
    console.log(`Use 'issue ${issues[0].number}' to work on an issue`);
  }

  async showCurrent() {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      
      const issueMatch = currentBranch.match(/issue-(\d+)/);
      if (!issueMatch) {
        console.log('Not currently on an issue branch');
        return;
      }
      
      const issueNumber = parseInt(issueMatch[1]);
      const contextFile = `.claude/issues/issue-${issueNumber}.md`;
      
      if (await fs.pathExists(contextFile)) {
        console.log(`📋 Current issue: #${issueNumber}`);
        console.log(`Branch: ${currentBranch}`);
        console.log(`Context: ${contextFile}`);
        
        try {
          const commits = execSync(`git log --oneline -5 origin/main..HEAD`, { encoding: 'utf8' }).trim();
          
          if (commits) {
            console.log('\n📝 Recent commits:');
            console.log(commits.split('\n').map(line => `  ${line}`).join('\n'));
          }
        } catch {
          // No commits yet
        }
      } else {
        console.log(`Issue context file not found: ${contextFile}`);
      }
    } catch (error) {
      console.log('Error checking current issue:', error.message);
    }
  }

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

  async updateActiveWork(issue, branchName) {
    const activeWorkPath = 'ACTIVE_WORK.md';
    
    if (await fs.pathExists(activeWorkPath)) {
      try {
        let content = await fs.readFile(activeWorkPath, 'utf8');
        
        const issueSection = `## Current Session Focus
Working on Issue #${issue.number}: ${issue.title}
- **Branch**: ${branchName}
- **State**: ${issue.state}
- **URL**: ${issue.html_url}
- **Context**: .claude/issues/issue-${issue.number}.md

`;
        
        if (content.includes('## Current Session Focus')) {
          content = content.replace(
            /## Current Session Focus[\s\S]*?(?=##|$)/,
            issueSection
          );
        } else {
          content = issueSection + content;
        }
        
        await fs.writeFile(activeWorkPath, content);
        console.log('✅ Updated ACTIVE_WORK.md with issue context');
      } catch (error) {
        console.log('⚠️  Could not update ACTIVE_WORK.md:', error.message);
      }
    }
  }

  async showHelp() {
    console.log('GitHub Issue Command Help\n');
    
    console.log('Usage:');
    console.log('  issue <number> [repo]     Work on specific issue');
    console.log('  issue list [options]      List issues');
    console.log('  issue current             Show current issue context');
    console.log('  issue help                Show this help\n');
    
    console.log('Examples:');
    console.log('  issue 123                 Work on issue #123 in current repo');
    console.log('  issue 456 owner/repo      Work on issue #456 in specific repo');
    console.log('  issue list                List open issues');
    console.log('  issue list --state closed List closed issues');
    console.log('  issue list --assignee me  List issues assigned to you\n');
    
    console.log('List Options:');
    console.log('  --state <open|closed|all> Filter by issue state');
    console.log('  --assignee <username>     Filter by assignee');
    console.log('  --labels <label1,label2>  Filter by labels');
    console.log('  --limit <number>          Limit number of results (default: 10)\n');
    
    console.log('Authentication:');
    console.log('  Requires GitHub authentication via "gh auth login" or GITHUB_TOKEN env var');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const issueCommand = new IssueCommand();
  await issueCommand.execute(args);
}

main().catch(error => {
  console.error('Issue command failed:', error.message);
  process.exit(1);
});