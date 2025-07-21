import { ArchivalEngine, ArchivalResult, SafetyCheck, SpecInfo, ArchiveMetadata, ArchivalConfig } from '../types/archival.js';
/**
 * ArchivalEngine - Safely archives completed specs with atomic operations
 *
 * This class provides functionality to:
 * - Safely move completed specs to archive directory
 * - Preserve file permissions and timestamps during copying
 * - Validate spec directories before archival
 * - Implement rollback mechanisms for failed operations
 */
export declare class ArchivalEngineImpl implements ArchivalEngine {
    private static readonly REQUIRED_SPEC_FILES;
    private static readonly ARCHIVE_METADATA_FILE;
    private static readonly METADATA_VERSION;
    private static readonly DEFAULT_ARCHIVE_LOCATION;
    private readonly archiveLocation;
    private readonly indexManager;
    private readonly configManager;
    private readonly specScanner;
    constructor(archiveLocation?: string, configDirectory?: string);
    /**
     * Archive a completed spec with atomic operations
     * @param specPath Path to the spec directory to archive
     * @returns Promise<ArchivalResult> Result of the archival operation
     */
    archiveSpec(specPath: string): Promise<ArchivalResult>;
    /**
     * Validate that a spec can be safely archived
     * @param specPath Path to the spec directory
     * @returns Promise<SafetyCheck> Safety validation results
     */
    validateArchivalSafety(specPath: string): Promise<SafetyCheck>;
    /**
     * Create archive metadata for a spec
     * @param spec Spec information
     * @returns ArchiveMetadata object
     */
    createArchiveMetadata(spec: SpecInfo): ArchiveMetadata;
    /**
     * Generate archive path with timestamp
     * @param specName Name of the spec
     * @param timestamp Archival timestamp
     * @returns Full path to archive location
     */
    private generateArchivePath;
    /**
     * Ensure archive directory exists
     */
    private ensureArchiveDirectory;
    /**
     * Copy spec directory to archive with preserved permissions and timestamps
     * @param sourcePath Source spec directory
     * @param targetPath Target archive directory
     */
    private copySpecToArchive;
    /**
     * Copy a single file preserving metadata
     * @param sourcePath Source file path
     * @param targetPath Target file path
     */
    private copyFileWithMetadata;
    /**
     * Extract spec information from spec directory
     * @param specPath Path to spec directory
     * @returns Promise<SpecInfo> Spec information
     */
    private extractSpecInfo;
    /**
     * Write archive metadata to archive directory
     * @param archivePath Path to archive directory
     * @param metadata Archive metadata
     */
    private writeArchiveMetadata;
    /**
     * Verify archive integrity by comparing file counts and sizes
     * @param originalPath Original spec path
     * @param archivePath Archive path
     */
    private verifyArchiveIntegrity;
    /**
     * Get list of all files in a directory recursively
     * @param dirPath Directory path
     * @returns Promise<string[]> List of file paths
     */
    private getFileList;
    /**
     * Remove original spec directory after successful archival
     * @param specPath Path to original spec directory
     */
    private removeOriginalSpec;
    /**
     * Rollback archival by removing partial archive
     * @param archivePath Path to archive directory to remove
     */
    private rollbackArchival;
    /**
     * Get all archived specs from the index
     * @returns Promise<ArchiveIndexEntry[]> List of all archived specs
     */
    getArchivedSpecs(): Promise<import('../types/archival.js').ArchiveIndexEntry[]>;
    /**
     * Search for archived specs by name
     * @param searchTerm Search term for spec name
     * @returns Promise<ArchiveIndexEntry[]> Matching archived specs
     */
    searchArchivedSpecs(searchTerm: string): Promise<import('../types/archival.js').ArchiveIndexEntry[]>;
    /**
     * Get statistics about archived specs
     * @returns Promise<{totalArchives: number, oldestArchive?: Date, newestArchive?: Date, totalTasks: number}>
     */
    getArchiveStats(): Promise<{
        totalArchives: number;
        oldestArchive?: Date;
        newestArchive?: Date;
        totalTasks: number;
    }>;
    /**
     * Validate and repair the archive index
     * @returns Promise<{isValid: boolean, repaired: boolean, issues: string[]}>
     */
    validateAndRepairArchiveIndex(): Promise<{
        isValid: boolean;
        repaired: boolean;
        issues: string[];
    }>;
    /**
     * Get current archival configuration
     * @returns Promise<ArchivalConfig> Current configuration
     */
    getConfig(): Promise<ArchivalConfig>;
    /**
     * Update archival configuration
     * @param config New configuration to save
     * @returns Promise<void>
     */
    updateConfig(config: ArchivalConfig): Promise<void>;
    /**
     * Check if archival is enabled according to configuration
     * @returns Promise<boolean> True if archival is enabled
     */
    isArchivalEnabled(): Promise<boolean>;
    /**
     * Get configured delay before archival
     * @returns Promise<number> Delay in minutes
     */
    getArchivalDelay(): Promise<number>;
    /**
     * Check if a spec should be archived based on configuration and timing
     * @param specPath Path to spec directory
     * @returns Promise<{shouldArchive: boolean, reason?: string}> Archival decision
     */
    shouldArchiveSpec(specPath: string): Promise<{
        shouldArchive: boolean;
        reason?: string;
    }>;
    /**
     * Archive spec with configuration-aware behavior
     * @param specPath Path to the spec directory to archive
     * @returns Promise<ArchivalResult> Result of the archival operation
     */
    archiveSpecWithConfig(specPath: string): Promise<ArchivalResult>;
    /**
     * Remove an archived spec from both filesystem and index
     * @param archivePath Path to the archived spec directory
     * @returns Promise<boolean> True if successfully removed
     */
    removeArchivedSpec(archivePath: string): Promise<boolean>;
    /**
     * Get all specs from the .kiro/specs directory
     * @returns Promise<string[]> Array of spec directory paths
     */
    getAllSpecs(): Promise<string[]>;
    /**
     * Get all completed specs
     * @returns Promise<string[]> Array of completed spec paths
     */
    getCompletedSpecs(): Promise<string[]>;
    /**
     * Get specs that are ready for archival (completed and valid)
     * @returns Promise<string[]> Array of specs ready for archival
     */
    getSpecsReadyForArchival(): Promise<string[]>;
    /**
     * Scan and validate all specs in the directory
     * @returns Promise<object> Comprehensive scanning and validation report
     */
    scanAndValidateSpecs(): Promise<{
        totalSpecs: number;
        validSpecs: string[];
        invalidSpecs: string[];
        issues: Record<string, string[]>;
    }>;
    /**
     * Automatically archive all completed specs that are ready for archival
     * @returns Promise<ArchivalResult[]> Results of all archival operations
     */
    autoArchiveCompletedSpecs(): Promise<ArchivalResult[]>;
}
//# sourceMappingURL=archival-engine.d.ts.map