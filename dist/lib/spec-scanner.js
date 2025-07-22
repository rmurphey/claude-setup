import { promises as fs } from 'fs';
import { join } from 'path';
import { ValidationError } from '../types/archival.js';
import { SpecCompletionDetectorImpl } from './spec-completion-detector.js';
/**
 * SpecScannerImpl - Scans and validates specs in the .kiro/specs directory
 *
 * This class provides functionality to:
 * - Discover all spec directories in .kiro/specs
 * - Identify completed vs incomplete specs
 * - Validate spec structure and content
 * - Provide comprehensive scanning reports
 */
export class SpecScannerImpl {
    static SPECS_DIRECTORY = '.kiro/specs';
    static ARCHIVE_DIRECTORY = 'archive';
    static REQUIRED_FILES = ['requirements.md', 'design.md', 'tasks.md'];
    static OPTIONAL_FILES = ['notes.md', 'testing.md'];
    completionDetector;
    constructor() {
        this.completionDetector = new SpecCompletionDetectorImpl();
    }
    /**
     * Get all spec directories (excluding archive)
     * @returns Promise<string[]> Array of spec directory paths
     */
    async getAllSpecs() {
        try {
            const specs = [];
            const entries = await fs.readdir(SpecScannerImpl.SPECS_DIRECTORY, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name !== SpecScannerImpl.ARCHIVE_DIRECTORY) {
                    const specPath = join(SpecScannerImpl.SPECS_DIRECTORY, entry.name);
                    // Basic validation - check if it looks like a spec directory
                    if (await this.isSpecDirectory(specPath)) {
                        specs.push(specPath);
                    }
                }
            }
            return specs.sort(); // Return sorted for consistent ordering
        }
        catch (error) {
            throw new ValidationError(`Failed to scan specs directory: ${error instanceof Error ? error.message : 'Unknown error'}`, SpecScannerImpl.SPECS_DIRECTORY);
        }
    }
    /**
     * Get all completed specs using SpecCompletionDetector
     * @returns Promise<string[]> Array of completed spec paths
     */
    async getCompletedSpecs() {
        const allSpecs = await this.getAllSpecs();
        const completedSpecs = [];
        for (const specPath of allSpecs) {
            try {
                const status = await this.completionDetector.checkSpecCompletion(specPath);
                if (status.isComplete) {
                    completedSpecs.push(specPath);
                }
            }
            catch {
                // Skip specs that can't be checked for completion
                continue;
            }
        }
        return completedSpecs;
    }
    /**
     * Get all incomplete specs
     * @returns Promise<string[]> Array of incomplete spec paths
     */
    async getIncompleteSpecs() {
        const allSpecs = await this.getAllSpecs();
        const completedSpecs = await this.getCompletedSpecs();
        // Return specs that are not in the completed list
        return allSpecs.filter(spec => !completedSpecs.includes(spec));
    }
    /**
     * Validate a single spec directory
     * @param specPath Path to spec directory
     * @returns Promise<SpecValidationResult> Validation results
     */
    async validateSpec(specPath) {
        const issues = [];
        const warnings = [];
        try {
            // Check if spec directory exists
            const specStats = await fs.stat(specPath);
            if (!specStats.isDirectory()) {
                issues.push(`Spec path is not a directory: ${specPath}`);
                return { isValid: false, issues, warnings };
            }
            // Check for required files
            for (const requiredFile of SpecScannerImpl.REQUIRED_FILES) {
                const filePath = join(specPath, requiredFile);
                try {
                    const fileStats = await fs.stat(filePath);
                    if (!fileStats.isFile()) {
                        issues.push(`Required file is not a regular file: ${requiredFile}`);
                    }
                    else {
                        // Check if file is empty
                        const fileSize = fileStats.size;
                        if (fileSize === 0) {
                            issues.push(`Required file is empty: ${requiredFile}`);
                        }
                    }
                }
                catch {
                    issues.push(`Missing required file: ${requiredFile}`);
                }
            }
            // Validate tasks.md format specifically
            if (issues.filter(issue => issue.includes('tasks.md')).length === 0) {
                await this.validateTasksFile(specPath, issues, warnings);
            }
            // Check for unexpected files (potential indicators of incomplete cleanup)
            await this.checkForUnexpectedFiles(specPath, warnings);
            // Validate file content basics
            await this.validateFileContent(specPath, issues, warnings);
        }
        catch (error) {
            issues.push(`Failed to validate spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return {
            isValid: issues.length === 0,
            issues,
            warnings
        };
    }
    /**
     * Scan and validate all specs in the directory
     * @returns Promise<object> Comprehensive scanning report
     */
    async scanAndValidateAllSpecs() {
        const allSpecs = await this.getAllSpecs();
        const validSpecs = [];
        const invalidSpecs = [];
        const issues = {};
        for (const specPath of allSpecs) {
            try {
                const validation = await this.validateSpec(specPath);
                if (validation.isValid) {
                    validSpecs.push(specPath);
                }
                else {
                    invalidSpecs.push(specPath);
                }
                // Collect all issues and warnings for this spec
                const allIssues = [...validation.issues];
                if (validation.warnings.length > 0) {
                    allIssues.push(...validation.warnings.map(w => `WARNING: ${w}`));
                }
                if (allIssues.length > 0) {
                    issues[specPath] = allIssues;
                }
            }
            catch (error) {
                invalidSpecs.push(specPath);
                issues[specPath] = [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`];
            }
        }
        return {
            totalSpecs: allSpecs.length,
            validSpecs,
            invalidSpecs,
            issues
        };
    }
    /**
     * Check if a directory looks like a spec directory
     * @param dirPath Path to check
     * @returns Promise<boolean> True if it appears to be a spec directory
     */
    async isSpecDirectory(dirPath) {
        try {
            // A spec directory should have at least a tasks.md file
            const tasksFile = join(dirPath, 'tasks.md');
            const stats = await fs.stat(tasksFile);
            return stats.isFile();
        }
        catch {
            return false;
        }
    }
    /**
     * Validate tasks.md file format and content
     * @param specPath Spec directory path
     * @param issues Issues array to append to
     * @param warnings Warnings array to append to
     */
    async validateTasksFile(specPath, issues, warnings) {
        try {
            const tasksFilePath = join(specPath, 'tasks.md');
            const tasksContent = await fs.readFile(tasksFilePath, 'utf-8');
            // Use SpecCompletionDetector to validate format
            const formatValidation = this.completionDetector.validateTasksFormat(tasksContent);
            if (!formatValidation.isValid) {
                issues.push(...formatValidation.issues.map(issue => `tasks.md: ${issue}`));
            }
            // Check for reasonable task count
            const { totalTasks, completedTasks } = this.completionDetector.parseTaskCounts(tasksContent);
            if (totalTasks === 0) {
                warnings.push('tasks.md contains no tasks');
            }
            else if (totalTasks > 50) {
                warnings.push(`tasks.md contains many tasks (${totalTasks}) - consider breaking into smaller specs`);
            }
            // Check for completion status
            if (totalTasks > 0 && completedTasks === totalTasks) {
                warnings.push('All tasks completed - spec may be ready for archival');
            }
        }
        catch (error) {
            issues.push(`Failed to validate tasks.md: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Check for unexpected files that might indicate issues
     * @param specPath Spec directory path
     * @param warnings Warnings array to append to
     */
    async checkForUnexpectedFiles(specPath, warnings) {
        try {
            const entries = await fs.readdir(specPath, { withFileTypes: true });
            const allKnownFiles = [...SpecScannerImpl.REQUIRED_FILES, ...SpecScannerImpl.OPTIONAL_FILES];
            for (const entry of entries) {
                if (entry.isFile()) {
                    if (!allKnownFiles.includes(entry.name) && !entry.name.startsWith('.')) {
                        warnings.push(`Unexpected file found: ${entry.name}`);
                    }
                }
                else if (entry.isDirectory()) {
                    warnings.push(`Unexpected subdirectory found: ${entry.name}`);
                }
            }
        }
        catch {
            // Ignore errors in this validation step
        }
    }
    /**
     * Validate basic file content requirements
     * @param specPath Spec directory path
     * @param issues Issues array to append to
     * @param warnings Warnings array to append to
     */
    async validateFileContent(specPath, issues, warnings) {
        // Check requirements.md
        try {
            const reqFile = join(specPath, 'requirements.md');
            const reqContent = await fs.readFile(reqFile, 'utf-8');
            if (reqContent.trim().length < 100) {
                warnings.push('requirements.md is very short - may need more detail');
            }
            // Basic content checks
            if (!reqContent.toLowerCase().includes('requirement')) {
                warnings.push('requirements.md may not contain actual requirements');
            }
        }
        catch {
            // Already handled by required files check
        }
        // Check design.md
        try {
            const designFile = join(specPath, 'design.md');
            const designContent = await fs.readFile(designFile, 'utf-8');
            if (designContent.trim().length < 100) {
                warnings.push('design.md is very short - may need more detail');
            }
        }
        catch {
            // Already handled by required files check
        }
    }
    /**
     * Get specs that are ready for archival (completed and validated)
     * @returns Promise<string[]> Array of specs ready for archival
     */
    async getSpecsReadyForArchival() {
        const completedSpecs = await this.getCompletedSpecs();
        const readySpecs = [];
        for (const specPath of completedSpecs) {
            const validation = await this.validateSpec(specPath);
            // Only include specs that are valid (no blocking issues)
            if (validation.isValid) {
                readySpecs.push(specPath);
            }
        }
        return readySpecs;
    }
    /**
     * Get summary statistics about specs
     * @returns Promise<object> Statistics about the spec collection
     */
    async getSpecStats() {
        const [allSpecs, completedSpecs, scanResults, readySpecs] = await Promise.all([
            this.getAllSpecs(),
            this.getCompletedSpecs(),
            this.scanAndValidateAllSpecs(),
            this.getSpecsReadyForArchival()
        ]);
        return {
            total: allSpecs.length,
            completed: completedSpecs.length,
            incomplete: allSpecs.length - completedSpecs.length,
            valid: scanResults.validSpecs.length,
            invalid: scanResults.invalidSpecs.length,
            readyForArchival: readySpecs.length
        };
    }
}
//# sourceMappingURL=spec-scanner.js.map