import { execSync } from 'child_process';

import fs from 'fs-extra';

import { GitHubAPIError, FileSystemError } from './types/errors.js';
/**
 * GitHub Issues Integration for ACTIVE_WORK.md
 * Syncs open GitHub issues into active work tracking
 */
export class GitHubSync {
    workFilePath;
    issueMarker = '## GitHub Issues';
    issueStartMarker = '<!-- GITHUB_ISSUES_START -->';
    issueEndMarker = '<!-- GITHUB_ISSUES_END -->';
    constructor(workFilePath = null) {
        // Auto-detect ACTIVE_WORK.md path if not provided
        if (!workFilePath) {
            workFilePath = this.detectActiveWorkPath();
        }
        this.workFilePath = workFilePath;
    }
    /**
     * Detect ACTIVE_WORK.md path (internal/ or root)
     */
    detectActiveWorkPath() {
        if (fs.pathExistsSync('internal/ACTIVE_WORK.md')) {
            return 'internal/ACTIVE_WORK.md';
        }
        else if (fs.pathExistsSync('ACTIVE_WORK.md')) {
            return 'ACTIVE_WORK.md';
        }
        return 'ACTIVE_WORK.md'; // Default fallback
    }
    /**
     * Fetch open GitHub issues using GitHub CLI
     */
    async fetchGitHubIssues() {
        try {
            const result = execSync('gh issue list --state open --json number,title,labels,assignees,createdAt,url --limit 50', { encoding: 'utf8', stdio: 'pipe' });
            const issues = JSON.parse(result);
            return { success: true, data: issues };
        }
        catch (error) {
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
    formatIssue(issue) {
        const labels = issue.labels.map(l => l.name).join(', ');
        const assignee = issue.assignees.length > 0 ? ` (@${issue.assignees[0]?.login})` : '';
        const labelText = labels ? ` [${labels}]` : '';
        return `- [ ] **#${issue.number}**${labelText} ${issue.title}${assignee}\n  - **URL**: ${issue.url}\n  - **Created**: ${new Date(issue.createdAt).toLocaleDateString()}`;
    }
    /**
     * Update ACTIVE_WORK.md with GitHub issues
     */
    async syncIssues() {
        if (!await fs.pathExists(this.workFilePath)) {
            return {
                success: false,
                error: new FileSystemError(`Active work file not found: ${this.workFilePath}`, {
                    path: this.workFilePath,
                    operation: 'read'
                })
            };
        }
        const issuesResult = await this.fetchGitHubIssues();
        if (!issuesResult.success) {
            return issuesResult;
        }
        const issues = issuesResult.data;
        if (issues.length === 0) {
            console.log('No open GitHub issues found in this repository');
            console.log('📝 When issues are created, they will automatically appear in ACTIVE_WORK.md');
            return this.createPlaceholderSection();
        }
        try {
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
            }
            else {
                // Add new GitHub Issues section before Deferred Items
                const deferredIndex = content.indexOf('## Deferred Items');
                if (deferredIndex !== -1) {
                    const before = content.substring(0, deferredIndex);
                    const after = content.substring(deferredIndex);
                    content = before + issuesSection + '\n\n---\n\n' + after;
                }
                else {
                    // Add at the end if no Deferred Items section
                    content += '\n\n---\n\n' + issuesSection;
                }
            }
            await fs.writeFile(this.workFilePath, content);
            console.log(`✅ Synced ${issues.length} GitHub issues to ${this.workFilePath}`);
            return { success: true, data: true };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: new FileSystemError(`Failed to update active work file: ${message}`, {
                    path: this.workFilePath,
                    operation: 'write'
                })
            };
        }
    }
    /**
     * Check if GitHub CLI is available
     */
    isGitHubCLIAvailable() {
        try {
            execSync('gh --version', { stdio: 'ignore' });
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Create placeholder section when no issues exist
     */
    async createPlaceholderSection() {
        try {
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
                }
                else {
                    content += '\n\n---\n\n' + placeholderSection;
                }
                await fs.writeFile(this.workFilePath, content);
                console.log('✅ GitHub Issues section added to ACTIVE_WORK.md');
            }
            return { success: true, data: true };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: new FileSystemError(`Failed to create placeholder section: ${message}`, {
                    path: this.workFilePath,
                    operation: 'write'
                })
            };
        }
    }
    /**
     * Auto-sync issues when ACTIVE_WORK.md is accessed
     */
    async autoSync() {
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
        }
        catch (error) {
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
export async function syncGitHubIssues(workFilePath) {
    const sync = new GitHubSync(workFilePath ?? null);
    if (!sync.isGitHubCLIAvailable()) {
        console.error('❌ GitHub CLI (gh) is required for issue syncing');
        console.log('Install: https://cli.github.com/');
        process.exit(1);
    }
    const result = await sync.syncIssues();
    if (result.success) {
        console.log('🎉 GitHub issues synced successfully!');
    }
    else {
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
//# sourceMappingURL=github-sync.js.map