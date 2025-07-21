import type { GitHubIssue, GitHubListIssuesFilters, Result } from '../types/index.js';
import { GitHubAPIError } from '../types/errors.js';
/**
 * GitHub API wrapper for issue management
 * Used both internally by claude-setup and templated for user projects
 */
export declare class GitHubAPI {
    private readonly token;
    private readonly repo;
    constructor();
    /**
     * Get GitHub token from environment or gh CLI
     */
    private getGitHubToken;
    /**
     * Get current repository from git remote
     */
    private getCurrentRepo;
    /**
     * Fetch issue details from GitHub API
     */
    fetchIssue(issueNumber: number, repoOverride?: string | null): Promise<Result<GitHubIssue, GitHubAPIError>>;
    /**
     * List issues with optional filters
     */
    listIssues(filters?: GitHubListIssuesFilters, repoOverride?: string | null): Promise<Result<GitHubIssue[], GitHubAPIError>>;
    /**
     * Generate branch name from issue
     */
    generateBranchName(issue: GitHubIssue): string;
    /**
     * Get current git username
     */
    private getCurrentUsername;
    /**
     * Determine issue type from labels
     */
    private getIssueType;
    /**
     * Create and checkout branch for issue
     */
    createIssueBranch(issue: GitHubIssue): Promise<Result<string, GitHubAPIError>>;
    /**
     * Get default branch name
     */
    private getDefaultBranch;
    /**
     * Create issue context documentation
     */
    createIssueContext(issue: GitHubIssue): Promise<Result<string, GitHubAPIError>>;
}
//# sourceMappingURL=github-api.d.ts.map