/**
 * Kiro Spec File Scanner
 *
 * Discovers and parses .kiro/specs directory structure to extract tasks,
 * requirements, and other project metadata.
 */
import type { KiroTask, ParsedTaskItem, ScanResult } from '../types/kiro-task.js';
export declare class KiroSpecScanner {
    private baseDir;
    private specsDir;
    private markdownScanner;
    constructor(baseDir?: string);
    /**
     * Scan all specs and return comprehensive results
     */
    scanAllSpecs(): Promise<ScanResult>;
    /**
     * Discover all spec directories in .kiro/specs/
     */
    private discoverSpecDirectories;
    /**
     * Scan a specific spec directory for metadata
     */
    private scanSpecDirectory;
    /**
     * Extract title from requirements.md file
     */
    private extractTitleFromRequirements;
    /**
     * Extract all tasks from a spec directory
     */
    extractTasksFromSpec(specName: string): Promise<KiroTask[]>;
    /**
     * Parse tasks.md file and extract task items using AST-based parsing
     */
    parseTasksFile(filePath: string): Promise<ParsedTaskItem[]>;
    /**
     * Convert AST task to ParsedTaskItem format for backward compatibility
     */
    private convertAstTaskToParseTask;
    /**
     * Convert parsed task item to KiroTask
     */
    private convertToKiroTask;
    /**
     * Normalize priority string to valid priority level
     */
    private normalizePriority;
    /**
     * Categorize task based on content
     */
    private categorizeTask;
    /**
     * Estimate effort based on task description complexity
     */
    private estimateEffort;
}
export default KiroSpecScanner;
//# sourceMappingURL=kiro-spec-scanner.d.ts.map