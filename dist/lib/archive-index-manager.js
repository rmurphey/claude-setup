import { promises as fs } from 'fs';
import { join } from 'path';
import { ConfigurationError } from '../types/archival.js';
/**
 * ArchiveIndexManager - Manages the archive index for tracking all archived specs
 *
 * This class provides functionality to:
 * - Maintain a centralized index of all archived specs
 * - Add, remove, and search archive entries
 * - Persist the index to .archive-index.json file
 * - Handle index file corruption and recovery
 */
export class ArchiveIndexManager {
    static INDEX_FILE_NAME = '.archive-index.json';
    static INDEX_VERSION = '1.0';
    archiveLocation;
    indexFilePath;
    indexCache = null;
    constructor(archiveLocation) {
        this.archiveLocation = archiveLocation;
        this.indexFilePath = join(archiveLocation, ArchiveIndexManager.INDEX_FILE_NAME);
    }
    /**
     * Get the current archive index, loading from file if needed
     * @returns Promise<ArchiveIndex> The current archive index
     */
    async getIndex() {
        if (this.indexCache === null) {
            await this.loadIndex();
        }
        return this.indexCache;
    }
    /**
     * Add a new archive entry to the index
     * @param metadata Archive metadata from the archived spec
     * @returns Promise<void>
     */
    async addArchiveEntry(metadata) {
        try {
            const index = await this.getIndex();
            // Check if entry already exists
            const existingIndex = index.archives.findIndex(entry => entry.archivePath === metadata.archivePath);
            if (existingIndex >= 0) {
                // Update existing entry
                index.archives[existingIndex] = this.createIndexEntry(metadata);
            }
            else {
                // Add new entry
                index.archives.push(this.createIndexEntry(metadata));
            }
            // Sort entries by archival date (most recent first)
            index.archives.sort((a, b) => b.archivalDate.getTime() - a.archivalDate.getTime());
            // Update index metadata
            index.lastUpdated = new Date();
            await this.saveIndex(index);
        }
        catch (error) {
            throw new ConfigurationError(`Failed to add archive entry: ${error instanceof Error ? error.message : 'Unknown error'}`, metadata.archivePath);
        }
    }
    /**
     * Remove an archive entry from the index
     * @param archivePath Path to the archived spec
     * @returns Promise<boolean> True if entry was removed, false if not found
     */
    async removeArchiveEntry(archivePath) {
        try {
            const index = await this.getIndex();
            const initialLength = index.archives.length;
            // Remove entry with matching archive path
            index.archives = index.archives.filter(entry => entry.archivePath !== archivePath);
            const wasRemoved = index.archives.length < initialLength;
            if (wasRemoved) {
                // Update index metadata
                index.lastUpdated = new Date();
                await this.saveIndex(index);
            }
            return wasRemoved;
        }
        catch (error) {
            throw new ConfigurationError(`Failed to remove archive entry: ${error instanceof Error ? error.message : 'Unknown error'}`, archivePath);
        }
    }
    /**
     * Search for archive entries by spec name (partial match)
     * @param searchTerm Search term for spec name
     * @returns Promise<ArchiveIndexEntry[]> Matching archive entries
     */
    async searchArchives(searchTerm) {
        const index = await this.getIndex();
        const lowerSearchTerm = searchTerm.toLowerCase();
        return index.archives.filter(entry => entry.specName.toLowerCase().includes(lowerSearchTerm));
    }
    /**
     * Get all archive entries sorted by archival date
     * @returns Promise<ArchiveIndexEntry[]> All archive entries
     */
    async getAllArchives() {
        const index = await this.getIndex();
        return [...index.archives]; // Return a copy to prevent external mutations
    }
    /**
     * Get archive entry by spec name
     * @param specName Name of the spec to find
     * @returns Promise<ArchiveIndexEntry | null> Archive entry or null if not found
     */
    async getArchiveBySpecName(specName) {
        const index = await this.getIndex();
        return index.archives.find(entry => entry.specName === specName) || null;
    }
    /**
     * Get archive entry by archive path
     * @param archivePath Path to the archived spec
     * @returns Promise<ArchiveIndexEntry | null> Archive entry or null if not found
     */
    async getArchiveByPath(archivePath) {
        const index = await this.getIndex();
        return index.archives.find(entry => entry.archivePath === archivePath) || null;
    }
    /**
     * Get statistics about the archive
     * @returns Promise<{totalArchives: number, oldestArchive?: Date, newestArchive?: Date}>
     */
    async getArchiveStats() {
        const index = await this.getIndex();
        if (index.archives.length === 0) {
            return { totalArchives: 0, totalTasks: 0 };
        }
        const sortedByDate = [...index.archives].sort((a, b) => a.archivalDate.getTime() - b.archivalDate.getTime());
        const totalTasks = index.archives.reduce((sum, entry) => sum + entry.totalTasks, 0);
        const firstEntry = sortedByDate[0];
        const lastEntry = sortedByDate[sortedByDate.length - 1];
        const result = {
            totalArchives: index.archives.length,
            totalTasks
        };
        if (firstEntry) {
            result.oldestArchive = firstEntry.archivalDate;
        }
        if (lastEntry) {
            result.newestArchive = lastEntry.archivalDate;
        }
        return result;
    }
    /**
     * Validate and repair the archive index if needed
     * @returns Promise<{isValid: boolean, repaired: boolean, issues: string[]}>
     */
    async validateAndRepairIndex() {
        const issues = [];
        let repaired = false;
        try {
            const index = await this.getIndex();
            // Check for duplicate entries
            const pathSet = new Set();
            const duplicates = [];
            index.archives.forEach((entry, i) => {
                if (pathSet.has(entry.archivePath)) {
                    duplicates.push(i);
                    issues.push(`Duplicate entry for path: ${entry.archivePath}`);
                }
                else {
                    pathSet.add(entry.archivePath);
                }
            });
            // Remove duplicates if found
            if (duplicates.length > 0) {
                duplicates.reverse().forEach(i => index.archives.splice(i, 1));
                repaired = true;
            }
            // Check for entries pointing to non-existent archives
            const nonExistentEntries = [];
            for (let i = 0; i < index.archives.length; i++) {
                const entry = index.archives[i];
                if (entry) {
                    try {
                        await fs.stat(entry.archivePath);
                    }
                    catch {
                        nonExistentEntries.push(i);
                        issues.push(`Archive directory not found: ${entry.archivePath}`);
                    }
                }
            }
            // Remove entries for non-existent archives
            if (nonExistentEntries.length > 0) {
                nonExistentEntries.reverse().forEach(i => index.archives.splice(i, 1));
                repaired = true;
            }
            // Save repaired index
            if (repaired) {
                index.lastUpdated = new Date();
                await this.saveIndex(index);
            }
            return {
                isValid: issues.length === 0,
                repaired,
                issues
            };
        }
        catch (error) {
            issues.push(`Failed to validate index: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                isValid: false,
                repaired: false,
                issues
            };
        }
    }
    /**
     * Create a new empty archive index
     * @returns ArchiveIndex Empty archive index
     */
    createEmptyIndex() {
        return {
            version: ArchiveIndexManager.INDEX_VERSION,
            lastUpdated: new Date(),
            archives: []
        };
    }
    /**
     * Create an archive index entry from metadata
     * @param metadata Archive metadata
     * @returns ArchiveIndexEntry Index entry
     */
    createIndexEntry(metadata) {
        return {
            specName: metadata.specName,
            archivePath: metadata.archivePath,
            completionDate: metadata.completionDate,
            archivalDate: metadata.archivalDate,
            totalTasks: metadata.totalTasks
        };
    }
    /**
     * Load the archive index from file
     * @returns Promise<void>
     */
    async loadIndex() {
        try {
            // Ensure archive directory exists
            await fs.mkdir(this.archiveLocation, { recursive: true });
            // Try to read existing index file
            const indexContent = await fs.readFile(this.indexFilePath, 'utf-8');
            const parsedIndex = JSON.parse(indexContent);
            // Validate and migrate index if needed
            this.indexCache = this.validateAndMigrateIndex(parsedIndex);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                // Index file doesn't exist, create new empty index
                this.indexCache = this.createEmptyIndex();
                await this.saveIndex(this.indexCache);
            }
            else {
                throw new ConfigurationError(`Failed to load archive index: ${error instanceof Error ? error.message : 'Unknown error'}`, this.indexFilePath);
            }
        }
    }
    /**
     * Save the archive index to file
     * @param index Archive index to save
     * @returns Promise<void>
     */
    async saveIndex(index) {
        try {
            const indexJson = JSON.stringify(index, null, 2);
            await fs.writeFile(this.indexFilePath, indexJson, 'utf-8');
            this.indexCache = index;
        }
        catch (error) {
            throw new ConfigurationError(`Failed to save archive index: ${error instanceof Error ? error.message : 'Unknown error'}`, this.indexFilePath);
        }
    }
    /**
     * Validate and migrate index data from file
     * @param data Raw data from index file
     * @returns ArchiveIndex Validated and migrated index
     */
    validateAndMigrateIndex(data) {
        // Basic structure validation
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid index format: not an object');
        }
        const typedData = data;
        // Version migration (for future versions)
        if (!typedData.version || typedData.version !== ArchiveIndexManager.INDEX_VERSION) {
            // For now, just update version if missing or different
            typedData.version = ArchiveIndexManager.INDEX_VERSION;
        }
        // Ensure required fields exist
        if (!typedData.archives || !Array.isArray(typedData.archives)) {
            typedData.archives = [];
        }
        // Convert date strings back to Date objects
        if (typedData.lastUpdated && typeof typedData.lastUpdated === 'string') {
            typedData.lastUpdated = new Date(typedData.lastUpdated);
        }
        else {
            typedData.lastUpdated = new Date();
        }
        // Validate and convert archive entries
        if (Array.isArray(typedData.archives)) {
            typedData.archives = typedData.archives.map((entry) => {
                if (!entry || typeof entry !== 'object') {
                    throw new Error('Invalid archive entry format');
                }
                const entryData = entry;
                return {
                    specName: String(entryData.specName || ''),
                    archivePath: String(entryData.archivePath || ''),
                    completionDate: entryData.completionDate ? new Date(entryData.completionDate) : new Date(),
                    archivalDate: entryData.archivalDate ? new Date(entryData.archivalDate) : new Date(),
                    totalTasks: Number(entryData.totalTasks || 0)
                };
            });
        }
        return {
            version: typedData.version,
            lastUpdated: typedData.lastUpdated,
            archives: typedData.archives
        };
    }
}
//# sourceMappingURL=archive-index-manager.js.map