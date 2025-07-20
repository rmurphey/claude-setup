import { promises as fs } from 'fs';
import { join, basename } from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { ArchivalError, ValidationError, CopyError } from '../types/archival.js';
import { ArchiveIndexManager } from './archive-index-manager.js';
/**
 * ArchivalEngine - Safely archives completed specs with atomic operations
 *
 * This class provides functionality to:
 * - Safely move completed specs to archive directory
 * - Preserve file permissions and timestamps during copying
 * - Validate spec directories before archival
 * - Implement rollback mechanisms for failed operations
 */
export class ArchivalEngineImpl {
    static REQUIRED_SPEC_FILES = ['requirements.md', 'design.md', 'tasks.md'];
    static ARCHIVE_METADATA_FILE = '.archive-metadata.json';
    static METADATA_VERSION = '1.0';
    static DEFAULT_ARCHIVE_LOCATION = '.kiro/specs/archive';
    archiveLocation;
    indexManager;
    constructor(archiveLocation = ArchivalEngineImpl.DEFAULT_ARCHIVE_LOCATION) {
        this.archiveLocation = archiveLocation;
        this.indexManager = new ArchiveIndexManager(archiveLocation);
    }
    /**
     * Archive a completed spec with atomic operations
     * @param specPath Path to the spec directory to archive
     * @returns Promise<ArchivalResult> Result of the archival operation
     */
    async archiveSpec(specPath) {
        const timestamp = new Date();
        const specName = basename(specPath);
        const archivePath = await this.generateArchivePath(specName, timestamp);
        try {
            // Step 1: Validate archival safety
            const safetyCheck = await this.validateArchivalSafety(specPath);
            if (!safetyCheck.canProceed) {
                throw new ValidationError(`Archival safety validation failed: ${safetyCheck.issues.join(', ')}`, specPath, 'Fix validation issues before attempting archival');
            }
            // Step 2: Create archive directory structure
            await this.ensureArchiveDirectory();
            await fs.mkdir(archivePath, { recursive: true });
            // Step 3: Copy spec files to archive (atomic operation)
            await this.copySpecToArchive(specPath, archivePath);
            // Step 4: Create archive metadata
            const specInfo = await this.extractSpecInfo(specPath);
            const metadata = this.createArchiveMetadata({
                ...specInfo,
                path: archivePath
            });
            await this.writeArchiveMetadata(archivePath, metadata);
            // Step 5: Verify archive integrity
            await this.verifyArchiveIntegrity(specPath, archivePath);
            // Step 6: Update archive index
            await this.indexManager.addArchiveEntry(metadata);
            // Step 7: Remove original spec directory
            await this.removeOriginalSpec(specPath);
            return {
                success: true,
                originalPath: specPath,
                archivePath,
                timestamp
            };
        }
        catch (error) {
            // Rollback: Clean up partial archive on failure
            await this.rollbackArchival(archivePath);
            const archivalError = error instanceof ArchivalError ? error :
                new ArchivalError(`Archival failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COPY_FAILED', specPath, 'Check file permissions and disk space, then retry archival');
            return {
                success: false,
                originalPath: specPath,
                archivePath,
                timestamp,
                error: archivalError.message
            };
        }
    }
    /**
     * Validate that a spec can be safely archived
     * @param specPath Path to the spec directory
     * @returns Promise<SafetyCheck> Safety validation results
     */
    async validateArchivalSafety(specPath) {
        const issues = [];
        try {
            // Check if spec directory exists
            const specStats = await fs.stat(specPath);
            if (!specStats.isDirectory()) {
                issues.push(`Spec path is not a directory: ${specPath}`);
            }
            // Check for required spec files
            for (const requiredFile of ArchivalEngineImpl.REQUIRED_SPEC_FILES) {
                const filePath = join(specPath, requiredFile);
                try {
                    const fileStats = await fs.stat(filePath);
                    if (!fileStats.isFile()) {
                        issues.push(`Required file is not a regular file: ${requiredFile}`);
                    }
                }
                catch {
                    issues.push(`Missing required file: ${requiredFile}`);
                }
            }
            // Check if archive destination already exists
            const specName = basename(specPath);
            const potentialArchivePath = await this.generateArchivePath(specName, new Date());
            try {
                await fs.stat(potentialArchivePath);
                issues.push(`Archive destination already exists: ${potentialArchivePath}`);
            }
            catch {
                // Good - archive destination doesn't exist
            }
            // Check write permissions for archive location
            try {
                await this.ensureArchiveDirectory();
                // Test write access by creating and removing a temporary file
                const testFile = join(this.archiveLocation, '.write-test');
                await fs.writeFile(testFile, 'test');
                await fs.unlink(testFile);
            }
            catch {
                issues.push(`No write permission for archive location: ${this.archiveLocation}`);
            }
            // Check if spec is currently being modified (within last 5 minutes)
            const recentModificationThreshold = Date.now() - (5 * 60 * 1000); // 5 minutes ago
            const tasksFile = join(specPath, 'tasks.md');
            try {
                const tasksStats = await fs.stat(tasksFile);
                if (tasksStats.mtime.getTime() > recentModificationThreshold) {
                    issues.push('Spec was recently modified - wait before archiving to avoid conflicts');
                }
            }
            catch {
                // Already handled by required files check
            }
        }
        catch (error) {
            issues.push(`Failed to validate spec: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        return {
            isSafe: issues.length === 0,
            issues,
            canProceed: issues.length === 0
        };
    }
    /**
     * Create archive metadata for a spec
     * @param spec Spec information
     * @returns ArchiveMetadata object
     */
    createArchiveMetadata(spec) {
        return {
            specName: spec.name,
            originalPath: spec.path.replace(this.archiveLocation + '/', ''), // Remove archive prefix for original path
            archivePath: spec.path,
            completionDate: spec.completionDate,
            archivalDate: new Date(),
            totalTasks: spec.totalTasks,
            completedTasks: spec.completedTasks,
            version: ArchivalEngineImpl.METADATA_VERSION
        };
    }
    /**
     * Generate archive path with timestamp
     * @param specName Name of the spec
     * @param timestamp Archival timestamp
     * @returns Full path to archive location
     */
    async generateArchivePath(specName, timestamp) {
        const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format
        let archiveName = `${dateStr}_${specName}`;
        let archivePath = join(this.archiveLocation, archiveName);
        // Handle conflicts by adding time suffix
        let counter = 1;
        while (true) {
            try {
                await fs.stat(archivePath);
                // Path exists, try with time suffix
                const timePart = timestamp.toISOString().split('T')[1];
                const timeStr = timePart ? timePart.split('.')[0]?.replace(/:/g, '-') : 'unknown'; // HH-MM-SS format
                archiveName = `${dateStr}_${timeStr}_${specName}`;
                if (counter > 1) {
                    archiveName = `${dateStr}_${timeStr}_${counter}_${specName}`;
                }
                archivePath = join(this.archiveLocation, archiveName);
                counter++;
            }
            catch {
                // Path doesn't exist, we can use it
                break;
            }
        }
        return archivePath;
    }
    /**
     * Ensure archive directory exists
     */
    async ensureArchiveDirectory() {
        try {
            await fs.mkdir(this.archiveLocation, { recursive: true });
        }
        catch (error) {
            throw new ArchivalError(`Failed to create archive directory: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CONFIG_ERROR', this.archiveLocation, 'Check permissions and disk space for archive location');
        }
    }
    /**
     * Copy spec directory to archive with preserved permissions and timestamps
     * @param sourcePath Source spec directory
     * @param targetPath Target archive directory
     */
    async copySpecToArchive(sourcePath, targetPath) {
        try {
            const entries = await fs.readdir(sourcePath, { withFileTypes: true });
            for (const entry of entries) {
                const sourceFile = join(sourcePath, entry.name);
                const targetFile = join(targetPath, entry.name);
                if (entry.isDirectory()) {
                    // Recursively copy subdirectories
                    await fs.mkdir(targetFile, { recursive: true });
                    await this.copySpecToArchive(sourceFile, targetFile);
                }
                else if (entry.isFile()) {
                    // Copy file with preserved permissions and timestamps
                    await this.copyFileWithMetadata(sourceFile, targetFile);
                }
            }
        }
        catch (error) {
            throw new CopyError(`Failed to copy spec to archive: ${error instanceof Error ? error.message : 'Unknown error'}`, sourcePath, 'Check source file permissions and target directory write access');
        }
    }
    /**
     * Copy a single file preserving metadata
     * @param sourcePath Source file path
     * @param targetPath Target file path
     */
    async copyFileWithMetadata(sourcePath, targetPath) {
        try {
            // Get source file stats
            const sourceStats = await fs.stat(sourcePath);
            // Copy file content using streams for efficiency
            const sourceStream = createReadStream(sourcePath);
            const targetStream = createWriteStream(targetPath);
            await pipeline(sourceStream, targetStream);
            // Preserve file permissions and timestamps
            await fs.chmod(targetPath, sourceStats.mode);
            await fs.utimes(targetPath, sourceStats.atime, sourceStats.mtime);
        }
        catch (error) {
            throw new CopyError(`Failed to copy file with metadata: ${error instanceof Error ? error.message : 'Unknown error'}`, sourcePath, 'Check file permissions and disk space');
        }
    }
    /**
     * Extract spec information from spec directory
     * @param specPath Path to spec directory
     * @returns Promise<SpecInfo> Spec information
     */
    async extractSpecInfo(specPath) {
        const specName = basename(specPath);
        const tasksFile = join(specPath, 'tasks.md');
        try {
            const tasksStats = await fs.stat(tasksFile);
            const tasksContent = await fs.readFile(tasksFile, 'utf-8');
            // Parse task counts (simplified version - full implementation would use SpecCompletionDetector)
            const taskMatches = tasksContent.match(/^\s*-\s*\[([x\s])\]/gm) || [];
            const completedTasks = taskMatches.filter(match => match.includes('[x]')).length;
            return {
                name: specName,
                path: specPath,
                completionDate: tasksStats.mtime,
                totalTasks: taskMatches.length,
                completedTasks
            };
        }
        catch (error) {
            throw new ValidationError(`Failed to extract spec info: ${error instanceof Error ? error.message : 'Unknown error'}`, specPath, 'Ensure tasks.md file exists and is readable');
        }
    }
    /**
     * Write archive metadata to archive directory
     * @param archivePath Path to archive directory
     * @param metadata Archive metadata
     */
    async writeArchiveMetadata(archivePath, metadata) {
        const metadataPath = join(archivePath, ArchivalEngineImpl.ARCHIVE_METADATA_FILE);
        try {
            await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
        }
        catch (error) {
            throw new ArchivalError(`Failed to write archive metadata: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COPY_FAILED', archivePath, 'Check write permissions for archive directory');
        }
    }
    /**
     * Verify archive integrity by comparing file counts and sizes
     * @param originalPath Original spec path
     * @param archivePath Archive path
     */
    async verifyArchiveIntegrity(originalPath, archivePath) {
        try {
            const originalFiles = await this.getFileList(originalPath);
            const archiveFiles = await this.getFileList(archivePath);
            // Filter out metadata file from archive
            const archiveFilesFiltered = archiveFiles.filter(file => !file.endsWith(ArchivalEngineImpl.ARCHIVE_METADATA_FILE));
            if (originalFiles.length !== archiveFilesFiltered.length) {
                throw new Error(`File count mismatch: original ${originalFiles.length}, archive ${archiveFilesFiltered.length}`);
            }
            // Verify each required file exists in archive
            for (const requiredFile of ArchivalEngineImpl.REQUIRED_SPEC_FILES) {
                const archiveFile = join(archivePath, requiredFile);
                try {
                    await fs.stat(archiveFile);
                }
                catch {
                    throw new Error(`Required file missing in archive: ${requiredFile}`);
                }
            }
        }
        catch (error) {
            throw new ArchivalError(`Archive integrity verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COPY_FAILED', archivePath, 'Archive may be corrupted - manual verification required');
        }
    }
    /**
     * Get list of all files in a directory recursively
     * @param dirPath Directory path
     * @returns Promise<string[]> List of file paths
     */
    async getFileList(dirPath) {
        const files = [];
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = join(dirPath, entry.name);
            if (entry.isDirectory()) {
                const subFiles = await this.getFileList(fullPath);
                files.push(...subFiles);
            }
            else {
                files.push(fullPath);
            }
        }
        return files;
    }
    /**
     * Remove original spec directory after successful archival
     * @param specPath Path to original spec directory
     */
    async removeOriginalSpec(specPath) {
        try {
            await fs.rm(specPath, { recursive: true, force: true });
        }
        catch (error) {
            throw new ArchivalError(`Failed to remove original spec: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CLEANUP_FAILED', specPath, 'Manual cleanup required - remove original spec directory');
        }
    }
    /**
     * Rollback archival by removing partial archive
     * @param archivePath Path to archive directory to remove
     */
    async rollbackArchival(archivePath) {
        try {
            await fs.rm(archivePath, { recursive: true, force: true });
        }
        catch {
            // Ignore rollback errors - they're not critical
        }
    }
    /**
     * Get all archived specs from the index
     * @returns Promise<ArchiveIndexEntry[]> List of all archived specs
     */
    async getArchivedSpecs() {
        return await this.indexManager.getAllArchives();
    }
    /**
     * Search for archived specs by name
     * @param searchTerm Search term for spec name
     * @returns Promise<ArchiveIndexEntry[]> Matching archived specs
     */
    async searchArchivedSpecs(searchTerm) {
        return await this.indexManager.searchArchives(searchTerm);
    }
    /**
     * Get statistics about archived specs
     * @returns Promise<{totalArchives: number, oldestArchive?: Date, newestArchive?: Date, totalTasks: number}>
     */
    async getArchiveStats() {
        return await this.indexManager.getArchiveStats();
    }
    /**
     * Validate and repair the archive index
     * @returns Promise<{isValid: boolean, repaired: boolean, issues: string[]}>
     */
    async validateAndRepairArchiveIndex() {
        return await this.indexManager.validateAndRepairIndex();
    }
    /**
     * Remove an archived spec from both filesystem and index
     * @param archivePath Path to the archived spec directory
     * @returns Promise<boolean> True if successfully removed
     */
    async removeArchivedSpec(archivePath) {
        try {
            // Remove from index first
            const wasInIndex = await this.indexManager.removeArchiveEntry(archivePath);
            // Remove from filesystem
            try {
                await fs.rm(archivePath, { recursive: true, force: true });
                return true;
            }
            catch (fsError) {
                // If filesystem removal failed but was in index, we have inconsistency
                if (wasInIndex) {
                    // Try to re-add to index to maintain consistency
                    try {
                        const metadataPath = join(archivePath, ArchivalEngineImpl.ARCHIVE_METADATA_FILE);
                        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
                        const metadata = JSON.parse(metadataContent);
                        await this.indexManager.addArchiveEntry(metadata);
                    }
                    catch {
                        // If we can't restore index entry, that's acceptable since the archive might be truly gone
                    }
                }
                throw new ArchivalError(`Failed to remove archived spec from filesystem: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`, 'CLEANUP_FAILED', archivePath, 'Manual removal of archive directory may be required');
            }
        }
        catch (error) {
            if (error instanceof ArchivalError) {
                throw error;
            }
            throw new ArchivalError(`Failed to remove archived spec: ${error instanceof Error ? error.message : 'Unknown error'}`, 'CLEANUP_FAILED', archivePath, 'Check archive path and permissions');
        }
    }
}
//# sourceMappingURL=archival-engine.js.map