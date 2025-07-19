import { execSync } from 'child_process';
import fs from 'fs-extra';
import { GitHubAPIError } from '../types/errors.js';
/**
 * GitHub API wrapper for issue management
 * Used both internally by claude-setup and templated for user projects
 */
export class GitHubAPI {
    token;
    repo;
    constructor() {
        this.token = this.getGitHubToken();
        this.repo = this.getCurrentRepo();
    }
    /**
     * Get GitHub token from environment or gh CLI
     */
    getGitHubToken() {
        // Try environment variable first
        if (process.env.GITHUB_TOKEN) {
            return process.env.GITHUB_TOKEN;
        }
        // Try gh CLI token
        try {
            const token = execSync('gh auth token', { encoding: 'utf8', stdio: 'pipe' }).trim();
            return token;
        }
        catch {
            throw new GitHubAPIError('GitHub authentication required. Please run "gh auth login" or set GITHUB_TOKEN environment variable.', { status: 401 });
        }
    }
    /**
     * Get current repository from git remote
     */
    getCurrentRepo() {
        try {
            const remote = execSync('git remote get-url origin', { encoding: 'utf8', stdio: 'pipe' }).trim();
            // Parse GitHub repo from various URL formats
            const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
            if (!match) {
                throw new GitHubAPIError('Not a GitHub repository', { endpoint: 'git remote' });
            }
            return `${match[1]}/${match[2]}`;
        }
        catch (error) {
            if (error instanceof GitHubAPIError) {
                throw error;
            }
            throw new GitHubAPIError('Could not determine GitHub repository. Make sure you\'re in a git repository with a GitHub remote.', { endpoint: 'git remote' });
        }
    }
    /**
     * Fetch issue details from GitHub API
     */
    async fetchIssue(issueNumber, repoOverride = null) {
        const repo = repoOverride ?? this.repo;
        const url = `https://api.github.com/repos/${repo}/issues/${issueNumber}`;
        try {
            const response = await globalThis.fetch(url, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'claude-setup-cli'
                }
            });
            if (!response.ok) {
                if (response.status === 404) {
                    return {
                        success: false,
                        error: new GitHubAPIError(`Issue #${issueNumber} not found in ${repo}`, { status: 404, endpoint: url, repo })
                    };
                }
                return {
                    success: false,
                    error: new GitHubAPIError(`GitHub API error: ${response.status} ${response.statusText}`, { status: response.status, endpoint: url, repo })
                };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            if (error instanceof GitHubAPIError) {
                return { success: false, error };
            }
            const message = error instanceof Error && error.message.includes('fetch')
                ? 'Network error: Could not connect to GitHub API'
                : 'Unknown error occurred while fetching issue';
            return {
                success: false,
                error: new GitHubAPIError(message, { endpoint: url, repo })
            };
        }
    }
    /**
     * List issues with optional filters
     */
    async listIssues(filters = {}, repoOverride = null) {
        const repo = repoOverride ?? this.repo;
        const params = new globalThis.URLSearchParams({
            state: filters.state ?? 'open',
            sort: filters.sort ?? 'updated',
            direction: filters.direction ?? 'desc',
            per_page: filters.limit ?? '10'
        });
        if (filters.assignee)
            params.append('assignee', filters.assignee);
        if (filters.labels)
            params.append('labels', filters.labels);
        if (filters.milestone)
            params.append('milestone', filters.milestone);
        const url = `https://api.github.com/repos/${repo}/issues?${params}`;
        try {
            const response = await globalThis.fetch(url, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'claude-setup-cli'
                }
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: new GitHubAPIError(`GitHub API error: ${response.status} ${response.statusText}`, { status: response.status, endpoint: url, repo })
                };
            }
            const data = await response.json();
            return { success: true, data };
        }
        catch (error) {
            if (error instanceof GitHubAPIError) {
                return { success: false, error };
            }
            const message = error instanceof Error && error.message.includes('fetch')
                ? 'Network error: Could not connect to GitHub API'
                : 'Unknown error occurred while listing issues';
            return {
                success: false,
                error: new GitHubAPIError(message, { endpoint: url, repo })
            };
        }
    }
    /**
     * Generate branch name from issue
     */
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
    /**
     * Get current git username
     */
    getCurrentUsername() {
        try {
            return execSync('git config user.name', { encoding: 'utf8', stdio: 'pipe' })
                .trim()
                .toLowerCase()
                .replace(/\s+/g, '');
        }
        catch {
            return 'user';
        }
    }
    /**
     * Determine issue type from labels
     */
    getIssueType(issue) {
        const labels = issue.labels?.map(l => l.name.toLowerCase()) ?? [];
        if (labels.some(l => l.includes('bug') || l.includes('fix')))
            return 'ktlo';
        if (labels.some(l => l.includes('feature') || l.includes('enhancement')))
            return 'feat';
        if (labels.some(l => l.includes('docs') || l.includes('documentation')))
            return 'docs';
        if (labels.some(l => l.includes('test') || l.includes('testing')))
            return 'test';
        if (labels.some(l => l.includes('refactor') || l.includes('cleanup')))
            return 'improvement';
        if (labels.some(l => l.includes('dx') || l.includes('developer') || l.includes('tooling')))
            return 'productivity';
        return 'feat'; // Default to feature
    }
    /**
     * Create and checkout branch for issue
     */
    async createIssueBranch(issue) {
        const branchName = this.generateBranchName(issue);
        try {
            // Ensure we're on main/master and up to date
            const defaultBranch = this.getDefaultBranch();
            execSync(`git checkout ${defaultBranch}`, { stdio: 'pipe' });
            execSync('git pull origin HEAD', { stdio: 'pipe' });
            // Create and checkout new branch
            execSync(`git checkout -b ${branchName}`, { stdio: 'pipe' });
            return { success: true, data: branchName };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: new GitHubAPIError(`Failed to create branch: ${message}`, {
                    repo: this.repo
                })
            };
        }
    }
    /**
     * Get default branch name
     */
    getDefaultBranch() {
        try {
            const branch = execSync('git symbolic-ref refs/remotes/origin/HEAD', { encoding: 'utf8', stdio: 'pipe' })
                .trim()
                .replace('refs/remotes/origin/', '');
            return branch;
        }
        catch {
            // Fallback attempts
            try {
                execSync('git show-ref --verify --quiet refs/heads/main', { stdio: 'pipe' });
                return 'main';
            }
            catch {
                return 'master';
            }
        }
    }
    /**
     * Create issue context documentation
     */
    async createIssueContext(issue) {
        const content = `# Issue #${issue.number}: ${issue.title}

## Issue Details
- **Repository**: ${issue.repository_url?.split('/').slice(-2).join('/') ?? this.repo}
- **State**: ${issue.state}
- **Author**: ${issue.user?.login}
- **Created**: ${new Date(issue.created_at).toLocaleDateString()}
- **Updated**: ${new Date(issue.updated_at).toLocaleDateString()}
- **URL**: ${issue.html_url}

## Labels
${issue.labels?.map(l => `- ${l.name}`).join('\n') ?? 'No labels'}

## Description
${issue.body ?? 'No description provided'}

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
        try {
            await fs.ensureDir('.claude/issues');
            await fs.writeFile(filename, content);
            return { success: true, data: filename };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: new GitHubAPIError(`Failed to create issue context: ${message}`)
            };
        }
    }
}
//# sourceMappingURL=github-api.js.map