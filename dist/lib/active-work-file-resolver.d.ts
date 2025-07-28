/**
 * ActiveWorkFileResolver - Handles finding existing ACTIVE_WORK.md files or creating new ones
 *
 * This class implements a simple file resolution strategy:
 * 1. Check for internal/ACTIVE_WORK.md first (preferred location)
 * 2. Check for ACTIVE_WORK.md in root as fallback
 * 3. Create new file if neither exists, preferring internal/ if directory exists
 */
export declare class ActiveWorkFileResolver {
    private readonly searchPaths;
    /**
     * Find existing ACTIVE_WORK.md file in search paths
     * @returns Path to existing file or null if none found
     */
    private findExistingFile;
    /**
     * Create new ACTIVE_WORK.md file using existing template generation
     * @returns Path to created file
     */
    private createActiveWorkFile;
    /**
     * Get preferred path for creating new ACTIVE_WORK.md file
     * @returns Preferred file path based on project structure
     */
    private getPreferredPath;
    /**
     * Resolve ACTIVE_WORK.md file path - find existing or create new
     * This is the main public method that handles the complete resolution logic
     * @returns Path to ACTIVE_WORK.md file (existing or newly created)
     */
    resolveActiveWorkFile(): Promise<string>;
}
//# sourceMappingURL=active-work-file-resolver.d.ts.map