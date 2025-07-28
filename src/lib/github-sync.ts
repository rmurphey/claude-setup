import { execSync } from 'child_process';

import fs from 'fs-extra';

import type { 
  Result
} from '../types/index.js';
import { GitHubAPIError, FileSystemError } from '../types/errors.js';

import { ActiveWorkFileResolver } from './active-work-file-resolver.js';

/**
 * Simplified GitHub issue data for CLI operations
 */
interface GitHubCLIIssue {
  number: number;
  title: string;
  labels: Array<{ name: string }>;
  assignees: Array<{ login: string }>;
  createdAt: string;
  url: string;
}

/**
 * GitHub Issues Integration for ACTIVE_WORK.md
 * Syncs open GitHub issues into active work tracking
 */
export class GitHubSync {
  private readonly resolver: ActiveWorkFileResolver;
  private readonly explicitWorkFilePath: string | null;
  private readonly issueMarker = '## GitHub Issues';
  private readonly issueStartMarker = '<!-- GITHUB_ISSUES_START -->';
  private readonly issueEndMarker = '<!-- GITHUB_ISSUES_END -->';

  constructor(workFilePath: string | null = null) {
    this.resolver = new ActiveWorkFileResolver();
    this.explicitWorkFilePath = workFilePath;
  }



  /**
   * Fetch open GitHub issues using GitHub CLI
   */
  private async fetchGitHubIssues(): Promise<Result<GitHubCLIIssue[], GitHubAPIError>> {
    try {
      const result = execSync(
        'gh issue list --state open --json number,title,labels,assignees,createdAt,url --limit 50',
        { encoding: 'utf8', stdio: 'pipe' }
      );
      const issues = JSON.parse(result) as GitHubCLIIssue[];
      return { success: true, data: issues };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: new GitHubAPIError(`Unable to fetch GitHub issues: ${message}`, {
          endpoint: 'gh issue list'
        })
      };
    }
  }

  /**
   * Format GitHub issue for ACTIVE_WORK.md
   */
  private formatIssue(issue: GitHubCLIIssue): string {
    const labels = issue.labels.map(l => l.name).join(', ');
    const assignee = issue.assignees.length > 0 ? ` (@${issue.assignees[0]?.login})` : '';
    const labelText = labels ? ` [${labels}]` : '';
    
    return `- [ ] **#${issue.number}**${labelText} ${issue.title}${assignee}\n  - **URL**: ${issue.url}\n  - **Created**: ${new Date(issue.createdAt).toLocaleDateString()}`;
  }

  /**
   * Update ACTIVE_WORK.md with GitHub issues
   */
  async syncIssues(): Promise<Result<boolean, GitHubAPIError | FileSystemError>> {
    // Use explicit path if provided, otherwise use resolver
    const workFilePath = this.explicitWorkFilePath || await this.resolver.resolveActiveWorkFile();

    const issuesResult = await this.fetchGitHubIssues();
    if (!issuesResult.success) {
      return issuesResult;
    }

    const issues = issuesResult.data;
    if (issues.length === 0) {
      console.log('No open GitHub issues found in this repository');
      console.log('📝 When issues are created, they will automatically appear in ACTIVE_WORK.md');
      return this.createPlaceholderSection(workFilePath);
    }

    try {
      let content = await fs.readFile(workFilePath, 'utf8');

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

      await fs.writeFile(workFilePath, content);
      console.log(`✅ Synced ${issues.length} GitHub issues to ${workFilePath}`);
      return { success: true, data: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: new FileSystemError(`Failed to update active work file: ${message}`, {
          path: workFilePath,
          operation: 'write'
        })
      };
    }
  }

  /**
   * Check if GitHub CLI is available
   */
  isGitHubCLIAvailable(): boolean {
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
  private async createPlaceholderSection(workFilePath: string): Promise<Result<boolean, FileSystemError>> {
    try {
      let content = await fs.readFile(workFilePath, 'utf8');
      
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
        
        await fs.writeFile(workFilePath, content);
        console.log('✅ GitHub Issues section added to ACTIVE_WORK.md');
      }
      
      return { success: true, data: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: new FileSystemError(`Failed to create placeholder section: ${message}`, {
          path: workFilePath,
          operation: 'write'
        })
      };
    }
  }

  /**
   * Auto-sync issues when ACTIVE_WORK.md is accessed
   */
  async autoSync(): Promise<Result<boolean, GitHubAPIError | FileSystemError>> {
    if (!this.isGitHubCLIAvailable()) {
      return {
        success: false,
        error: new GitHubAPIError('GitHub CLI not available', {
          endpoint: 'gh --version'
        })
      };
    }

    try {
      return await this.syncIssues();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: new GitHubAPIError(`Auto-sync failed: ${message}`)
      };
    }
  }
}

/**
 * CLI command to manually sync GitHub issues
 */
export async function syncGitHubIssues(_workFilePath?: string): Promise<void> {
  // workFilePath parameter is kept for backward compatibility but not used
  // The GitHubSync class will use ActiveWorkFileResolver to handle file resolution
  const sync = new GitHubSync();
  
  if (!sync.isGitHubCLIAvailable()) {
    console.error('❌ GitHub CLI (gh) is required for issue syncing');
    console.log('Install: https://cli.github.com/');
    process.exit(1);
  }

  const result = await sync.syncIssues();
  if (result.success) {
    console.log('🎉 GitHub issues synced successfully!');
  } else {
    console.error('❌ Failed to sync GitHub issues');
    console.error(result.error.getUserMessage());
    process.exit(1);
  }
}

// Export for easy access
export const gitHubSync = new GitHubSync();

// Auto-sync disabled by default to prevent errors in user projects
// Only enable auto-sync when explicitly developing claude-setup itself
// Users should run `claude-setup --sync-issues` manually when needed