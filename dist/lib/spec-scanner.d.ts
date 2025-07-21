import { SpecScanner, SpecValidationResult } from '../types/archival.js';
/**
 * SpecScannerImpl - Scans and validates specs in the .kiro/specs directory
 *
 * This class provides functionality to:
 * - Discover all spec directories in .kiro/specs
 * - Identify completed vs incomplete specs
 * - Validate spec structure and content
 * - Provide comprehensive scanning reports
 */
export declare class SpecScannerImpl implements SpecScanner {
    static SPECS_DIRECTORY: string;
    static ARCHIVE_DIRECTORY: string;
    static REQUIRED_FILES: string[];
    static OPTIONAL_FILES: string[];
    private completionDetector;
    constructor();
    /**
     * Get all spec directories (excluding archive)
     * @returns Promise<string[]> Array of spec directory paths
     */
    getAllSpecs(): Promise<string[]>;
    /**
     * Get all completed specs using SpecCompletionDetector
     * @returns Promise<string[]> Array of completed spec paths
     */
    getCompletedSpecs(): Promise<string[]>;
    /**
     * Get all incomplete specs
     * @returns Promise<string[]> Array of incomplete spec paths
     */
    getIncompleteSpecs(): Promise<string[]>;
    /**
     * Validate a single spec directory
     * @param specPath Path to spec directory
     * @returns Promise<SpecValidationResult> Validation results
     */
    validateSpec(specPath: string): Promise<SpecValidationResult>;
    /**
     * Scan and validate all specs in the directory
     * @returns Promise<object> Comprehensive scanning report
     */
    scanAndValidateAllSpecs(): Promise<{
        totalSpecs: number;
        validSpecs: string[];
        invalidSpecs: string[];
        issues: Record<string, string[]>;
    }>;
    /**
     * Check if a directory looks like a spec directory
     * @param dirPath Path to check
     * @returns Promise<boolean> True if it appears to be a spec directory
     */
    private isSpecDirectory;
    /**
     * Validate tasks.md file format and content
     * @param specPath Spec directory path
     * @param issues Issues array to append to
     * @param warnings Warnings array to append to
     */
    private validateTasksFile;
    /**
     * Check for unexpected files that might indicate issues
     * @param specPath Spec directory path
     * @param warnings Warnings array to append to
     */
    private checkForUnexpectedFiles;
    /**
     * Validate basic file content requirements
     * @param specPath Spec directory path
     * @param issues Issues array to append to
     * @param warnings Warnings array to append to
     */
    private validateFileContent;
    /**
     * Get specs that are ready for archival (completed and validated)
     * @returns Promise<string[]> Array of specs ready for archival
     */
    getSpecsReadyForArchival(): Promise<string[]>;
    /**
     * Get summary statistics about specs
     * @returns Promise<object> Statistics about the spec collection
     */
    getSpecStats(): Promise<{
        total: number;
        completed: number;
        incomplete: number;
        valid: number;
        invalid: number;
        readyForArchival: number;
    }>;
}
//# sourceMappingURL=spec-scanner.d.ts.map