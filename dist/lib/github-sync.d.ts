import type { Result } from '../types/index.js';
import { GitHubAPIError, FileSystemError } from '../types/errors.js';
/**
 * GitHub Issues Integration for ACTIVE_WORK.md
 * Syncs open GitHub issues into active work tracking
 */
export declare class GitHubSync {
    private readonly workFilePath;
    private readonly issueMarker;
    private readonly issueStartMarker;
    private readonly issueEndMarker;
    constructor(workFilePath?: string | null);
    /**
     * Detect ACTIVE_WORK.md path (internal/ or root)
     */
    private detectActiveWorkPath;
    /**
     * Fetch open GitHub issues using GitHub CLI
     */
    private fetchGitHubIssues;
    /**
     * Format GitHub issue for ACTIVE_WORK.md
     */
    private formatIssue;
    /**
     * Update ACTIVE_WORK.md with GitHub issues
     */
    syncIssues(): Promise<Result<boolean, GitHubAPIError | FileSystemError>>;
    /**
     * Check if GitHub CLI is available
     */
    isGitHubCLIAvailable(): boolean;
    /**
     * Create placeholder section when no issues exist
     */
    private createPlaceholderSection;
    /**
     * Auto-sync issues when ACTIVE_WORK.md is accessed
     */
    autoSync(): Promise<Result<boolean, GitHubAPIError | FileSystemError>>;
}
/**
 * CLI command to manually sync GitHub issues
 */
export declare function syncGitHubIssues(workFilePath?: string): Promise<void>;
export declare const gitHubSync: GitHubSync;
//# sourceMappingURL=github-sync.d.ts.map