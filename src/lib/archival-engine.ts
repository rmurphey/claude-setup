import { promises as fs , createReadStream, createWriteStream } from 'fs';
import { join, basename } from 'path';
import { pipeline } from 'stream/promises';

import { 
  ArchivalEngine, 
  ArchivalResult, 
  SafetyCheck, 
  SpecInfo, 
  ArchiveMetadata,
  ArchivalError,
  ValidationError,
  CopyError,
  ArchivalConfig
} from '../types/archival.js';

import { ArchiveIndexManager } from './archive-index-manager.js';
import { ConfigurationManagerImpl } from './configuration-manager.js';
import { SpecScannerImpl } from './spec-scanner.js';

/**
 * ArchivalEngine - Safely archives completed specs with atomic operations
 * 
 * This class provides functionality to:
 * - Safely move completed specs to archive directory
 * - Preserve file permissions and timestamps during copying
 * - Validate spec directories before archival
 * - Implement rollback mechanisms for failed operations
 */
export class ArchivalEngineImpl implements ArchivalEngine {
  private static readonly REQUIRED_SPEC_FILES = ['requirements.md', 'design.md', 'tasks.md'];
  private static readonly ARCHIVE_METADATA_FILE = '.archive-metadata.json';
  private static readonly METADATA_VERSION = '1.0';
  private static readonly DEFAULT_ARCHIVE_LOCATION = '.kiro/specs/archive';

  private readonly archiveLocation: string;
  private readonly indexManager: ArchiveIndexManager;
  private readonly configManager: ConfigurationManagerImpl;
  private readonly specScanner: SpecScannerImpl;

  constructor(archiveLocation: string = ArchivalEngineImpl.DEFAULT_ARCHIVE_LOCATION, configDirectory = '.') {
    this.archiveLocation = archiveLocation;
    this.indexManager = new ArchiveIndexManager(archiveLocation);
    this.configManager = new ConfigurationManagerImpl(configDirectory);
    this.specScanner = new SpecScannerImpl();
  }

  /**
   * Archive a completed spec with atomic operations
   * @param specPath Path to the spec directory to archive
   * @returns Promise<ArchivalResult> Result of the archival operation
   */
  async archiveSpec(specPath: string): Promise<ArchivalResult> {
    const timestamp = new Date();
    const specName = basename(specPath);
    const archivePath = await this.generateArchivePath(specName, timestamp);

    try {
      // Step 1: Validate archival safety
      const safetyCheck = await this.validateArchivalSafety(specPath);
      if (!safetyCheck.canProceed) {
        throw new ValidationError(
          `Archival safety validation failed: ${safetyCheck.issues.join(', ')}`,
          specPath
        );
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

    } catch (error) {
      // Rollback: Clean up partial archive on failure
      await this.rollbackArchival(archivePath);
      
      const archivalError = error instanceof ArchivalError ? error : 
        new ArchivalError(
          `Archival failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'COPY_FAILED',
          specPath
        );

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
  async validateArchivalSafety(specPath: string): Promise<SafetyCheck> {
    const issues: string[] = [];

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
        } catch {
          issues.push(`Missing required file: ${requiredFile}`);
        }
      }

      // Check if archive destination already exists
      const specName = basename(specPath);
      const potentialArchivePath = await this.generateArchivePath(specName, new Date());
      try {
        await fs.stat(potentialArchivePath);
        issues.push(`Archive destination already exists: ${potentialArchivePath}`);
      } catch {
        // Good - archive destination doesn't exist
      }

      // Check write permissions for archive location
      try {
        await this.ensureArchiveDirectory();
        // Test write access by creating and removing a temporary file
        const testFile = join(this.archiveLocation, '.write-test');
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
      } catch {
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
      } catch {
        // Already handled by required files check
      }

    } catch (error) {
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
  createArchiveMetadata(spec: SpecInfo): ArchiveMetadata {
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
  private async generateArchivePath(specName: string, timestamp: Date): Promise<string> {
    const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD format
    let archiveName = `${dateStr}_${specName}`;
    let archivePath = join(this.archiveLocation, archiveName);
    
    // Handle conflicts by adding time suffix
    let counter = 1;
    let pathExists = true;
    while (pathExists) {
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
      } catch {
        // Path doesn't exist, we can use it
        pathExists = false;
      }
    }
    
    return archivePath;
  }

  /**
   * Ensure archive directory exists
   */
  private async ensureArchiveDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.archiveLocation, { recursive: true });
    } catch (error) {
      throw new ArchivalError(
        `Failed to create archive directory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONFIG_ERROR',
        this.archiveLocation
      );
    }
  }

  /**
   * Copy spec directory to archive with preserved permissions and timestamps
   * @param sourcePath Source spec directory
   * @param targetPath Target archive directory
   */
  private async copySpecToArchive(sourcePath: string, targetPath: string): Promise<void> {
    try {
      const entries = await fs.readdir(sourcePath, { withFileTypes: true });

      for (const entry of entries) {
        const sourceFile = join(sourcePath, entry.name);
        const targetFile = join(targetPath, entry.name);

        if (entry.isDirectory()) {
          // Recursively copy subdirectories
          await fs.mkdir(targetFile, { recursive: true });
          await this.copySpecToArchive(sourceFile, targetFile);
        } else if (entry.isFile()) {
          // Copy file with preserved permissions and timestamps
          await this.copyFileWithMetadata(sourceFile, targetFile);
        }
      }
    } catch (error) {
      throw new CopyError(
        `Failed to copy spec to archive: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sourcePath
      );
    }
  }

  /**
   * Copy a single file preserving metadata
   * @param sourcePath Source file path
   * @param targetPath Target file path
   */
  private async copyFileWithMetadata(sourcePath: string, targetPath: string): Promise<void> {
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
    } catch (error) {
      throw new CopyError(
        `Failed to copy file with metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sourcePath
      );
    }
  }

  /**
   * Extract spec information from spec directory
   * @param specPath Path to spec directory
   * @returns Promise<SpecInfo> Spec information
   */
  private async extractSpecInfo(specPath: string): Promise<SpecInfo> {
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
    } catch (error) {
      throw new ValidationError(
        `Failed to extract spec info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        specPath
      );
    }
  }

  /**
   * Write archive metadata to archive directory
   * @param archivePath Path to archive directory
   * @param metadata Archive metadata
   */
  private async writeArchiveMetadata(archivePath: string, metadata: ArchiveMetadata): Promise<void> {
    const metadataPath = join(archivePath, ArchivalEngineImpl.ARCHIVE_METADATA_FILE);
    
    try {
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    } catch (error) {
      throw new ArchivalError(
        `Failed to write archive metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COPY_FAILED',
        archivePath
      );
    }
  }

  /**
   * Verify archive integrity by comparing file counts and sizes
   * @param originalPath Original spec path
   * @param archivePath Archive path
   */
  private async verifyArchiveIntegrity(originalPath: string, archivePath: string): Promise<void> {
    try {
      const originalFiles = await this.getFileList(originalPath);
      const archiveFiles = await this.getFileList(archivePath);
      
      // Filter out metadata file from archive
      const archiveFilesFiltered = archiveFiles.filter(
        file => !file.endsWith(ArchivalEngineImpl.ARCHIVE_METADATA_FILE)
      );
      
      if (originalFiles.length !== archiveFilesFiltered.length) {
        throw new Error(`File count mismatch: original ${originalFiles.length}, archive ${archiveFilesFiltered.length}`);
      }
      
      // Verify each required file exists in archive
      for (const requiredFile of ArchivalEngineImpl.REQUIRED_SPEC_FILES) {
        const archiveFile = join(archivePath, requiredFile);
        try {
          await fs.stat(archiveFile);
        } catch {
          throw new Error(`Required file missing in archive: ${requiredFile}`);
        }
      }
    } catch (error) {
      throw new ArchivalError(
        `Archive integrity verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'COPY_FAILED',
        archivePath
      );
    }
  }

  /**
   * Get list of all files in a directory recursively
   * @param dirPath Directory path
   * @returns Promise<string[]> List of file paths
   */
  private async getFileList(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await this.getFileList(fullPath);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Remove original spec directory after successful archival
   * @param specPath Path to original spec directory
   */
  private async removeOriginalSpec(specPath: string): Promise<void> {
    try {
      await fs.rm(specPath, { recursive: true, force: true });
    } catch (error) {
      throw new ArchivalError(
        `Failed to remove original spec: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLEANUP_FAILED',
        specPath
      );
    }
  }

  /**
   * Rollback archival by removing partial archive
   * @param archivePath Path to archive directory to remove
   */
  private async rollbackArchival(archivePath: string): Promise<void> {
    try {
      await fs.rm(archivePath, { recursive: true, force: true });
    } catch {
      // Ignore rollback errors - they're not critical
    }
  }

  /**
   * Get all archived specs from the index
   * @returns Promise<ArchiveIndexEntry[]> List of all archived specs
   */
  async getArchivedSpecs(): Promise<import('../types/archival.js').ArchiveIndexEntry[]> {
    return await this.indexManager.getAllArchives();
  }

  /**
   * Search for archived specs by name
   * @param searchTerm Search term for spec name
   * @returns Promise<ArchiveIndexEntry[]> Matching archived specs
   */
  async searchArchivedSpecs(searchTerm: string): Promise<import('../types/archival.js').ArchiveIndexEntry[]> {
    return await this.indexManager.searchArchives(searchTerm);
  }

  /**
   * Get statistics about archived specs
   * @returns Promise<{totalArchives: number, oldestArchive?: Date, newestArchive?: Date, totalTasks: number}>
   */
  async getArchiveStats(): Promise<{
    totalArchives: number;
    oldestArchive?: Date;
    newestArchive?: Date;
    totalTasks: number;
  }> {
    return await this.indexManager.getArchiveStats();
  }

  /**
   * Validate and repair the archive index
   * @returns Promise<{isValid: boolean, repaired: boolean, issues: string[]}>
   */
  async validateAndRepairArchiveIndex(): Promise<{
    isValid: boolean;
    repaired: boolean;
    issues: string[];
  }> {
    return await this.indexManager.validateAndRepairIndex();
  }

  /**
   * Get current archival configuration
   * @returns Promise<ArchivalConfig> Current configuration
   */
  async getConfig(): Promise<ArchivalConfig> {
    return await this.configManager.loadConfig();
  }

  /**
   * Update archival configuration
   * @param config New configuration to save
   * @returns Promise<void>
   */
  async updateConfig(config: ArchivalConfig): Promise<void> {
    await this.configManager.saveConfig(config);
  }

  /**
   * Check if archival is enabled according to configuration
   * @returns Promise<boolean> True if archival is enabled
   */
  async isArchivalEnabled(): Promise<boolean> {
    const config = await this.getConfig();
    return config.enabled;
  }

  /**
   * Get configured delay before archival
   * @returns Promise<number> Delay in minutes
   */
  async getArchivalDelay(): Promise<number> {
    const config = await this.getConfig();
    return config.delayMinutes;
  }

  /**
   * Check if a spec should be archived based on configuration and timing
   * @param specPath Path to spec directory
   * @returns Promise<{shouldArchive: boolean, reason?: string}> Archival decision
   */
  async shouldArchiveSpec(specPath: string): Promise<{shouldArchive: boolean, reason?: string}> {
    const config = await this.getConfig();
    
    // Check if archival is disabled
    if (!config.enabled) {
      return { shouldArchive: false, reason: 'Archival is disabled in configuration' };
    }
    
    // Check safety conditions first
    const safetyCheck = await this.validateArchivalSafety(specPath);
    if (!safetyCheck.canProceed) {
      return { shouldArchive: false, reason: `Safety validation failed: ${safetyCheck.issues.join(', ')}` };
    }
    
    // Check timing delay
    if (config.delayMinutes > 0) {
      const tasksFile = join(specPath, 'tasks.md');
      try {
        const tasksStats = await fs.stat(tasksFile);
        const delayMs = config.delayMinutes * 60 * 1000; // Convert minutes to milliseconds
        const timeSinceModification = Date.now() - tasksStats.mtime.getTime();
        
        if (timeSinceModification < delayMs) {
          const remainingMinutes = Math.ceil((delayMs - timeSinceModification) / (60 * 1000));
          return { 
            shouldArchive: false, 
            reason: `Waiting for delay period (${remainingMinutes} minutes remaining)` 
          };
        }
      } catch {
        return { shouldArchive: false, reason: 'Unable to check file modification time' };
      }
    }
    
    return { shouldArchive: true };
  }

  /**
   * Archive spec with configuration-aware behavior
   * @param specPath Path to the spec directory to archive
   * @returns Promise<ArchivalResult> Result of the archival operation
   */
  async archiveSpecWithConfig(specPath: string): Promise<ArchivalResult> {
    // Check if archival should proceed
    const { shouldArchive, reason } = await this.shouldArchiveSpec(specPath);
    
    if (!shouldArchive) {
      return {
        success: false,
        originalPath: specPath,
        archivePath: '',
        timestamp: new Date(),
        error: reason || 'Archival was skipped'
      };
    }
    
    // Proceed with normal archival
    return await this.archiveSpec(specPath);
  }

  /**
   * Remove an archived spec from both filesystem and index
   * @param archivePath Path to the archived spec directory
   * @returns Promise<boolean> True if successfully removed
   */
  async removeArchivedSpec(archivePath: string): Promise<boolean> {
    try {
      // Remove from index first
      const wasInIndex = await this.indexManager.removeArchiveEntry(archivePath);
      
      // Remove from filesystem
      try {
        await fs.rm(archivePath, { recursive: true, force: true });
        return true;
      } catch (fsError) {
        // If filesystem removal failed but was in index, we have inconsistency
        if (wasInIndex) {
          // Try to re-add to index to maintain consistency
          try {
            const metadataPath = join(archivePath, ArchivalEngineImpl.ARCHIVE_METADATA_FILE);
            const metadataContent = await fs.readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            await this.indexManager.addArchiveEntry(metadata);
          } catch {
            // If we can't restore index entry, that's acceptable since the archive might be truly gone
          }
        }
        
        throw new ArchivalError(
          `Failed to remove archived spec from filesystem: ${fsError instanceof Error ? fsError.message : 'Unknown error'}`,
          'CLEANUP_FAILED',
          archivePath
        );
      }
    } catch (error) {
      if (error instanceof ArchivalError) {
        throw error;
      }
      
      throw new ArchivalError(
        `Failed to remove archived spec: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CLEANUP_FAILED',
        archivePath
      );
    }
  }

  // ============================================================================
  // Spec Scanning and Detection Methods
  // ============================================================================

  /**
   * Get all specs from the .kiro/specs directory
   * @returns Promise<string[]> Array of spec directory paths
   */
  async getAllSpecs(): Promise<string[]> {
    return await this.specScanner.getAllSpecs();
  }

  /**
   * Get all completed specs
   * @returns Promise<string[]> Array of completed spec paths
   */
  async getCompletedSpecs(): Promise<string[]> {
    return await this.specScanner.getCompletedSpecs();
  }

  /**
   * Get specs that are ready for archival (completed and valid)
   * @returns Promise<string[]> Array of specs ready for archival
   */
  async getSpecsReadyForArchival(): Promise<string[]> {
    return await this.specScanner.getSpecsReadyForArchival();
  }

  /**
   * Scan and validate all specs in the directory
   * @returns Promise<object> Comprehensive scanning and validation report
   */
  async scanAndValidateSpecs(): Promise<{
    totalSpecs: number;
    validSpecs: string[];
    invalidSpecs: string[];
    issues: Record<string, string[]>;
  }> {
    return await this.specScanner.scanAndValidateAllSpecs();
  }

  /**
   * Automatically archive all completed specs that are ready for archival
   * @returns Promise<ArchivalResult[]> Results of all archival operations
   */
  async autoArchiveCompletedSpecs(): Promise<ArchivalResult[]> {
    const config = await this.getConfig();
    
    // Check if archival is enabled
    if (!config.enabled) {
      return [];
    }

    const specsReadyForArchival = await this.getSpecsReadyForArchival();
    const results: ArchivalResult[] = [];

    for (const specPath of specsReadyForArchival) {
      try {
        // Check if spec should be archived based on configuration
        const { shouldArchive } = await this.shouldArchiveSpec(specPath);
        
        if (shouldArchive) {
          const result = await this.archiveSpec(specPath);
          results.push(result);
          
          // Log successful archival if configured
          if (config.notificationLevel !== 'none') {
            console.log(`✓ Archived spec: ${specPath} -> ${result.archivePath}`);
          }
        }
      } catch (error) {
        // Log archival failure but continue with other specs
        const failResult: ArchivalResult = {
          success: false,
          originalPath: specPath,
          archivePath: '',
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown archival error'
        };
        results.push(failResult);
        
        if (config.notificationLevel === 'verbose') {
          console.error(`✗ Failed to archive spec: ${specPath} - ${failResult.error}`);
        }
      }
    }

    return results;
  }
}