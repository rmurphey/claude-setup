/**
 * CLI command to manually sync GitHub issues
 */
export function syncGitHubIssues(workFilePath: any): Promise<void>;
/**
 * GitHub Issues Integration for ACTIVE_WORK.md
 * Syncs open GitHub issues into active work tracking
 */
export class GitHubSync {
    constructor(workFilePath?: null);
    workFilePath: any;
    issueMarker: string;
    issueStartMarker: string;
    issueEndMarker: string;
    /**
     * Detect ACTIVE_WORK.md path (internal/ or root)
     */
    detectActiveWorkPath(): "internal/ACTIVE_WORK.md" | "ACTIVE_WORK.md";
    /**
     * Fetch open GitHub issues using GitHub CLI
     */
    fetchGitHubIssues(): Promise<any>;
    /**
     * Format GitHub issue for ACTIVE_WORK.md
     */
    formatIssue(issue: any): string;
    /**
     * Update ACTIVE_WORK.md with GitHub issues
     */
    syncIssues(): Promise<boolean>;
    /**
     * Check if GitHub CLI is available
     */
    isGitHubCLIAvailable(): boolean;
    /**
     * Create placeholder section when no issues exist
     */
    createPlaceholderSection(): Promise<boolean>;
    /**
     * Auto-sync issues when ACTIVE_WORK.md is accessed
     */
    autoSync(): Promise<boolean>;
}
export const gitHubSync: GitHubSync;
//# sourceMappingURL=github-sync.d.ts.map