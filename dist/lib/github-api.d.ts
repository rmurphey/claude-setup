/**
 * GitHub API wrapper for issue management
 * Used both internally by claude-setup and templated for user projects
 */
export class GitHubAPI {
    token: string;
    repo: string;
    /**
     * Get GitHub token from environment or gh CLI
     */
    getGitHubToken(): string;
    /**
     * Get current repository from git remote
     */
    getCurrentRepo(): string;
    /**
     * Fetch issue details from GitHub API
     */
    fetchIssue(issueNumber: any, repoOverride?: null): Promise<unknown>;
    /**
     * List issues with optional filters
     */
    listIssues(filters?: {}, repoOverride?: null): Promise<unknown>;
    /**
     * Generate branch name from issue
     */
    generateBranchName(issue: any): string;
    /**
     * Get current git username
     */
    getCurrentUsername(): string;
    /**
     * Determine issue type from labels
     */
    getIssueType(issue: any): "test" | "ktlo" | "feat" | "docs" | "improvement" | "productivity";
    /**
     * Create and checkout branch for issue
     */
    createIssueBranch(issue: any): Promise<string>;
    /**
     * Get default branch name
     */
    getDefaultBranch(): string;
    /**
     * Create issue context documentation
     */
    createIssueContext(issue: any): Promise<string>;
}
//# sourceMappingURL=github-api.d.ts.map