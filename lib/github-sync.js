import { execSync } from 'child_process';
import fs from 'fs-extra';

/**
 * GitHub Issues Integration for ACTIVE_WORK.md
 * Syncs open GitHub issues into active work tracking
 */

export class GitHubSync {
  constructor(workFilePath = 'internal/ACTIVE_WORK.md') {
    this.workFilePath = workFilePath;
    this.issueMarker = '## GitHub Issues';
    this.issueStartMarker = '<!-- GITHUB_ISSUES_START -->';
    this.issueEndMarker = '<!-- GITHUB_ISSUES_END -->';
  }

  /**
   * Fetch open GitHub issues using GitHub CLI
   */
  async fetchGitHubIssues() {
    try {
      const result = execSync(
        'gh issue list --state open --json number,title,labels,assignees,createdAt,url --limit 50',
        { encoding: 'utf8', stdio: 'pipe' }
      );
      return JSON.parse(result);
    } catch (error) {
      console.warn('Unable to fetch GitHub issues:', error.message);
      return [];
    }
  }

  /**
   * Format GitHub issue for ACTIVE_WORK.md
   */
  formatIssue(issue) {
    const labels = issue.labels.map(l => l.name).join(', ');
    const assignee = issue.assignees.length > 0 ? ` (@${issue.assignees[0].login})` : '';
    const labelText = labels ? ` [${labels}]` : '';
    
    return `- [ ] **#${issue.number}**${labelText} ${issue.title}${assignee}\n  - **URL**: ${issue.url}\n  - **Created**: ${new Date(issue.createdAt).toLocaleDateString()}`;
  }

  /**
   * Update ACTIVE_WORK.md with GitHub issues
   */
  async syncIssues() {
    if (!await fs.pathExists(this.workFilePath)) {
      console.warn(`Active work file not found: ${this.workFilePath}`);
      return false;
    }

    const issues = await this.fetchGitHubIssues();
    if (issues.length === 0) {
      console.log('No open GitHub issues found in this repository');
      console.log('📝 When issues are created, they will automatically appear in ACTIVE_WORK.md');
      return this.createPlaceholderSection();
    }

    let content = await fs.readFile(this.workFilePath, 'utf8');

    // Format issues section
    const formattedIssues = issues.map(issue => this.formatIssue(issue)).join('\n\n');
    const issuesSection = `${this.issueMarker}

${this.issueStartMarker}
${formattedIssues}
${this.issueEndMarker}`;

    // Check if GitHub Issues section already exists
    if (content.includes(this.issueMarker)) {
      // Replace existing section
      const startIndex = content.indexOf(this.issueStartMarker);
      const endIndex = content.indexOf(this.issueEndMarker) + this.issueEndMarker.length;
      
      if (startIndex !== -1 && endIndex !== -1) {
        const before = content.substring(0, startIndex);
        const after = content.substring(endIndex);
        content = before + `${this.issueStartMarker}\n${formattedIssues}\n${this.issueEndMarker}` + after;
      }
    } else {
      // Add new GitHub Issues section before Deferred Items
      const deferredIndex = content.indexOf('## Deferred Items');
      if (deferredIndex !== -1) {
        const before = content.substring(0, deferredIndex);
        const after = content.substring(deferredIndex);
        content = before + issuesSection + '\n\n---\n\n' + after;
      } else {
        // Add at the end if no Deferred Items section
        content += '\n\n---\n\n' + issuesSection;
      }
    }

    await fs.writeFile(this.workFilePath, content);
    console.log(`✅ Synced ${issues.length} GitHub issues to ${this.workFilePath}`);
    return true;
  }

  /**
   * Check if GitHub CLI is available
   */
  isGitHubCLIAvailable() {
    try {
      execSync('gh --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Create placeholder section when no issues exist
   */
  async createPlaceholderSection() {
    let content = await fs.readFile(this.workFilePath, 'utf8');
    
    const placeholderSection = `${this.issueMarker}

${this.issueStartMarker}
*No open GitHub issues*

When new issues are created, they will automatically appear here. Run \`claude-setup --sync-issues\` to refresh.
${this.issueEndMarker}`;

    // Add placeholder section if it doesn't exist
    if (!content.includes(this.issueMarker)) {
      const deferredIndex = content.indexOf('## Deferred Items');
      if (deferredIndex !== -1) {
        const before = content.substring(0, deferredIndex);
        const after = content.substring(deferredIndex);
        content = before + placeholderSection + '\n\n---\n\n' + after;
      } else {
        content += '\n\n---\n\n' + placeholderSection;
      }
      
      await fs.writeFile(this.workFilePath, content);
      console.log('✅ GitHub Issues section added to ACTIVE_WORK.md');
    }
    
    return true;
  }

  /**
   * Auto-sync issues when ACTIVE_WORK.md is accessed
   */
  async autoSync() {
    if (!this.isGitHubCLIAvailable()) {
      return false;
    }

    try {
      await this.syncIssues();
      return true;
    } catch (error) {
      console.warn('Auto-sync failed:', error.message);
      return false;
    }
  }
}

/**
 * CLI command to manually sync GitHub issues
 */
export async function syncGitHubIssues(workFilePath) {
  const sync = new GitHubSync(workFilePath);
  
  if (!sync.isGitHubCLIAvailable()) {
    console.error('❌ GitHub CLI (gh) is required for issue syncing');
    console.log('Install: https://cli.github.com/');
    process.exit(1);
  }

  const success = await sync.syncIssues();
  if (success) {
    console.log('🎉 GitHub issues synced successfully!');
  } else {
    console.error('❌ Failed to sync GitHub issues');
    process.exit(1);
  }
}

// Export for easy access
export const gitHubSync = new GitHubSync();

// Auto-sync when this module is imported in development (but not during CLI usage)
if (process.env.NODE_ENV !== 'test' && !process.argv.includes('--sync-issues')) {
  gitHubSync.autoSync().catch(() => {
    // Silently fail auto-sync to avoid breaking other functionality
  });
}