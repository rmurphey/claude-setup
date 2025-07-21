import { ArchiveIndex, ArchiveIndexEntry, ArchiveMetadata } from '../types/archival.js';
/**
 * ArchiveIndexManager - Manages the archive index for tracking all archived specs
 *
 * This class provides functionality to:
 * - Maintain a centralized index of all archived specs
 * - Add, remove, and search archive entries
 * - Persist the index to .archive-index.json file
 * - Handle index file corruption and recovery
 */
export declare class ArchiveIndexManager {
    private static readonly INDEX_FILE_NAME;
    private static readonly INDEX_VERSION;
    private readonly archiveLocation;
    private readonly indexFilePath;
    private indexCache;
    constructor(archiveLocation: string);
    /**
     * Get the current archive index, loading from file if needed
     * @returns Promise<ArchiveIndex> The current archive index
     */
    getIndex(): Promise<ArchiveIndex>;
    /**
     * Add a new archive entry to the index
     * @param metadata Archive metadata from the archived spec
     * @returns Promise<void>
     */
    addArchiveEntry(metadata: ArchiveMetadata): Promise<void>;
    /**
     * Remove an archive entry from the index
     * @param archivePath Path to the archived spec
     * @returns Promise<boolean> True if entry was removed, false if not found
     */
    removeArchiveEntry(archivePath: string): Promise<boolean>;
    /**
     * Search for archive entries by spec name (partial match)
     * @param searchTerm Search term for spec name
     * @returns Promise<ArchiveIndexEntry[]> Matching archive entries
     */
    searchArchives(searchTerm: string): Promise<ArchiveIndexEntry[]>;
    /**
     * Get all archive entries sorted by archival date
     * @returns Promise<ArchiveIndexEntry[]> All archive entries
     */
    getAllArchives(): Promise<ArchiveIndexEntry[]>;
    /**
     * Get archive entry by spec name
     * @param specName Name of the spec to find
     * @returns Promise<ArchiveIndexEntry | null> Archive entry or null if not found
     */
    getArchiveBySpecName(specName: string): Promise<ArchiveIndexEntry | null>;
    /**
     * Get archive entry by archive path
     * @param archivePath Path to the archived spec
     * @returns Promise<ArchiveIndexEntry | null> Archive entry or null if not found
     */
    getArchiveByPath(archivePath: string): Promise<ArchiveIndexEntry | null>;
    /**
     * Get statistics about the archive
     * @returns Promise<{totalArchives: number, oldestArchive?: Date, newestArchive?: Date}>
     */
    getArchiveStats(): Promise<{
        totalArchives: number;
        oldestArchive?: Date;
        newestArchive?: Date;
        totalTasks: number;
    }>;
    /**
     * Validate and repair the archive index if needed
     * @returns Promise<{isValid: boolean, repaired: boolean, issues: string[]}>
     */
    validateAndRepairIndex(): Promise<{
        isValid: boolean;
        repaired: boolean;
        issues: string[];
    }>;
    /**
     * Create a new empty archive index
     * @returns ArchiveIndex Empty archive index
     */
    private createEmptyIndex;
    /**
     * Create an archive index entry from metadata
     * @param metadata Archive metadata
     * @returns ArchiveIndexEntry Index entry
     */
    private createIndexEntry;
    /**
     * Load the archive index from file
     * @returns Promise<void>
     */
    private loadIndex;
    /**
     * Save the archive index to file
     * @param index Archive index to save
     * @returns Promise<void>
     */
    private saveIndex;
    /**
     * Validate and migrate index data from file
     * @param data Raw data from index file
     * @returns ArchiveIndex Validated and migrated index
     */
    private validateAndMigrateIndex;
}
//# sourceMappingURL=archive-index-manager.d.ts.map