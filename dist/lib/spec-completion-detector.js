import { promises as fs } from 'fs';
import { join } from 'path';
import { ValidationError } from '../types/archival.js';
/**
 * SpecCompletionDetector - Analyzes tasks.md files to determine completion status
 *
 * This class provides functionality to:
 * - Parse tasks.md files for completion markers
 * - Count total and completed tasks
 * - Calculate completion percentages
 * - Validate task file formatting
 */
export class SpecCompletionDetectorImpl {
    static TASK_PATTERN = /^\s*-\s*\[([x\s])\]\s*(.+)$/gm;
    static COMPLETED_MARKER = 'x';
    static INCOMPLETE_MARKER = ' ';
    /**
     * Check completion status of a specific spec
     * @param specPath Path to the spec directory
     * @returns Promise<CompletionStatus> with completion details
     */
    async checkSpecCompletion(specPath) {
        const tasksFilePath = join(specPath, 'tasks.md');
        try {
            // Check if tasks.md exists
            const stats = await fs.stat(tasksFilePath);
            const tasksContent = await fs.readFile(tasksFilePath, 'utf-8');
            // Parse tasks and calculate completion
            const { totalTasks, completedTasks } = this.parseTaskCounts(tasksContent);
            const isComplete = totalTasks > 0 && completedTasks === totalTasks;
            return {
                isComplete,
                totalTasks,
                completedTasks,
                lastModified: stats.mtime
            };
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                throw new ValidationError(`Tasks file not found: ${tasksFilePath}`, specPath);
            }
            throw new ValidationError(`Failed to read tasks file: ${err instanceof Error ? err.message : 'Unknown error'}`, specPath);
        }
    }
    /**
     * Get all completed specs from the specs directory
     * @returns Promise<string[]> Array of paths to completed specs
     */
    async getAllCompletedSpecs() {
        const specsDir = '.kiro/specs';
        const completedSpecs = [];
        try {
            const entries = await fs.readdir(specsDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== 'archive') {
                    const specPath = join(specsDir, entry.name);
                    try {
                        const status = await this.checkSpecCompletion(specPath);
                        if (status.isComplete) {
                            completedSpecs.push(specPath);
                        }
                    }
                    catch {
                        // Skip specs that can't be checked (missing tasks.md, etc.)
                        continue;
                    }
                }
            }
        }
        catch (err) {
            throw new ValidationError(`Failed to scan specs directory: ${err instanceof Error ? err.message : 'Unknown error'}`, specsDir);
        }
        return completedSpecs;
    }
    /**
     * Check if a tasks file content indicates completion
     * @param tasksContent Content of the tasks.md file
     * @returns boolean indicating if all tasks are complete
     */
    isTasksFileComplete(tasksContent) {
        const { totalTasks, completedTasks } = this.parseTaskCounts(tasksContent);
        return totalTasks > 0 && completedTasks === totalTasks;
    }
    /**
     * Parse task counts from tasks.md content
     * @param content Content of the tasks.md file
     * @returns Object with totalTasks and completedTasks counts
     */
    parseTaskCounts(content) {
        const tasks = this.extractTasks(content);
        const completedTasks = tasks.filter(task => task.completed).length;
        return {
            totalTasks: tasks.length,
            completedTasks
        };
    }
    /**
     * Extract all tasks from markdown content
     * @param content Markdown content to parse
     * @returns Array of task objects with completion status
     */
    extractTasks(content) {
        const tasks = [];
        let match;
        // Reset regex lastIndex to ensure consistent behavior
        SpecCompletionDetectorImpl.TASK_PATTERN.lastIndex = 0;
        while ((match = SpecCompletionDetectorImpl.TASK_PATTERN.exec(content)) !== null) {
            const marker = match[1];
            const text = match[2]?.trim();
            // Skip if text is undefined or marker is invalid
            if (!text || (marker !== SpecCompletionDetectorImpl.COMPLETED_MARKER &&
                marker !== SpecCompletionDetectorImpl.INCOMPLETE_MARKER)) {
                continue;
            }
            tasks.push({
                text,
                completed: marker === SpecCompletionDetectorImpl.COMPLETED_MARKER
            });
        }
        return tasks;
    }
    /**
     * Validate that a tasks.md file is properly formatted
     * @param content Content of the tasks.md file
     * @returns Object with validation results
     */
    validateTasksFormat(content) {
        const issues = [];
        // Check if content is empty
        if (!content.trim()) {
            issues.push('Tasks file is empty');
            return { isValid: false, issues };
        }
        // Check for presence of task markers
        const hasTaskMarkers = /^\s*-\s*\[[x\s]\]/m.test(content);
        if (!hasTaskMarkers) {
            issues.push('No valid task markers found (expected format: - [x] or - [ ])');
        }
        // Check for malformed task markers
        const malformedMarkers = content.match(/^\s*-\s*\[[^x\s]\]/gm);
        if (malformedMarkers) {
            issues.push(`Found malformed task markers: ${malformedMarkers.join(', ')}`);
        }
        // Check for tasks without proper list formatting
        const invalidTasks = content.match(/^\s*\[[x\s]\]/gm);
        if (invalidTasks) {
            issues.push('Found task markers without proper list formatting (missing "- " prefix)');
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
    /**
     * Get completion percentage for a spec
     * @param specPath Path to the spec directory
     * @returns Promise<number> Completion percentage (0-100)
     */
    async getCompletionPercentage(specPath) {
        const status = await this.checkSpecCompletion(specPath);
        if (status.totalTasks === 0) {
            return 0;
        }
        return Math.round((status.completedTasks / status.totalTasks) * 100);
    }
}
//# sourceMappingURL=spec-completion-detector.js.map