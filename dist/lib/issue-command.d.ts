/**
 * Issue command implementation
 * Used both internally by claude-setup and templated for user projects
 */
export class IssueCommand {
    github: GitHubAPI;
    /**
     * Main issue command handler
     */
    execute(args: any): Promise<void>;
    /**
     * Work on a specific issue
     */
    workOnIssue(issueNumber: any, args: any): Promise<void>;
    /**
     * List issues
     */
    listIssues(args: any): Promise<void>;
    /**
     * Show current issue context
     */
    showCurrent(): Promise<void>;
    /**
     * Parse list command filters
     */
    parseListFilters(args: any): {
        state: any;
        assignee: any;
        labels: any;
        limit: any;
    };
    /**
     * Update ACTIVE_WORK.md with issue context
     */
    updateActiveWork(issue: any, branchName: any): Promise<void>;
    /**
     * Show help for issue command
     */
    showHelp(): Promise<void>;
}
import { GitHubAPI } from './github-api.js';
//# sourceMappingURL=issue-command.d.ts.map