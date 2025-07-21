import { SpecCompletionDetector, CompletionStatus } from '../types/archival.js';
/**
 * SpecCompletionDetector - Analyzes tasks.md files to determine completion status
 *
 * This class provides functionality to:
 * - Parse tasks.md files for completion markers
 * - Count total and completed tasks
 * - Calculate completion percentages
 * - Validate task file formatting
 */
export declare class SpecCompletionDetectorImpl implements SpecCompletionDetector {
    private static readonly TASK_PATTERN;
    private static readonly COMPLETED_MARKER;
    private static readonly INCOMPLETE_MARKER;
    /**
     * Check completion status of a specific spec
     * @param specPath Path to the spec directory
     * @returns Promise<CompletionStatus> with completion details
     */
    checkSpecCompletion(specPath: string): Promise<CompletionStatus>;
    /**
     * Get all completed specs from the specs directory
     * @returns Promise<string[]> Array of paths to completed specs
     */
    getAllCompletedSpecs(): Promise<string[]>;
    /**
     * Check if a tasks file content indicates completion
     * @param tasksContent Content of the tasks.md file
     * @returns boolean indicating if all tasks are complete
     */
    isTasksFileComplete(tasksContent: string): boolean;
    /**
     * Parse task counts from tasks.md content
     * @param content Content of the tasks.md file
     * @returns Object with totalTasks and completedTasks counts
     */
    parseTaskCounts(content: string): {
        totalTasks: number;
        completedTasks: number;
    };
    /**
     * Extract all tasks from markdown content
     * @param content Markdown content to parse
     * @returns Array of task objects with completion status
     */
    private extractTasks;
    /**
     * Validate that a tasks.md file is properly formatted
     * @param content Content of the tasks.md file
     * @returns Object with validation results
     */
    validateTasksFormat(content: string): {
        isValid: boolean;
        issues: string[];
    };
    /**
     * Get completion percentage for a spec
     * @param specPath Path to the spec directory
     * @returns Promise<number> Completion percentage (0-100)
     */
    getCompletionPercentage(specPath: string): Promise<number>;
}
//# sourceMappingURL=spec-completion-detector.d.ts.map