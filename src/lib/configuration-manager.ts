import { promises as fs } from 'fs';
import { join } from 'path';

import { 
  ArchivalConfig, 
  ConfigurationManager, 
  NotificationLevel,
  ConfigurationError 
} from '../types/archival.js';

/**
 * ConfigurationManagerImpl - Manages archival configuration settings
 * 
 * This class provides functionality to:
 * - Load and save archival configuration from/to JSON files
 * - Provide sensible default configuration settings
 * - Validate configuration values for correctness
 * - Migrate configuration between versions
 * - Handle configuration file errors with recovery
 */
export class ConfigurationManagerImpl implements ConfigurationManager {
  private static readonly CONFIG_FILE_NAME = '.kiro-archival-config.json';
  private static readonly CONFIG_VERSION = '1.0';
  private static readonly DEFAULT_ARCHIVE_LOCATION = '.kiro/specs/archive';
  
  private readonly configFilePath: string;
  private configCache: ArchivalConfig | null = null;
  
  constructor(configDirectory = '.kiro') {
    this.configFilePath = join(configDirectory, ConfigurationManagerImpl.CONFIG_FILE_NAME);
  }

  /**
   * Load configuration from file, falling back to defaults if needed
   * @returns Promise<ArchivalConfig> The loaded or default configuration
   */
  async loadConfig(): Promise<ArchivalConfig> {
    if (this.configCache !== null) {
      return this.configCache;
    }

    try {
      const configContent = await fs.readFile(this.configFilePath, 'utf-8');
      const parsedConfig = JSON.parse(configContent);
      
      // Validate and migrate the configuration
      this.configCache = this.migrateConfig(parsedConfig);
      
      // Validate the final configuration
      if (!this.validateConfig(this.configCache)) {
        throw new Error('Invalid configuration after migration');
      }
      
      return this.configCache;
      
    } catch (error) {
      if ((error as { code?: string }).code === 'ENOENT') {
        // Configuration file doesn't exist, create default
        this.configCache = this.getDefaultConfig();
        await this.saveConfig(this.configCache);
        return this.configCache;
      } else {
        throw new ConfigurationError(
          `Failed to load archival configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
          this.configFilePath
        );
      }
    }
  }

  /**
   * Save configuration to file
   * @param config Configuration to save
   * @returns Promise<void>
   */
  async saveConfig(config: ArchivalConfig): Promise<void> {
    try {
      // Validate configuration before saving
      if (!this.validateConfig(config)) {
        throw new Error('Invalid configuration - cannot save');
      }

      // Add version and timestamp metadata
      const configWithMeta = {
        ...config,
        _version: ConfigurationManagerImpl.CONFIG_VERSION,
        _lastUpdated: new Date().toISOString()
      };

      const configJson = JSON.stringify(configWithMeta, null, 2);
      await fs.writeFile(this.configFilePath, configJson, 'utf-8');
      this.configCache = config;
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to save archival configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.configFilePath
      );
    }
  }

  /**
   * Get default configuration with sensible archival behavior
   * @returns ArchivalConfig Default configuration
   */
  getDefaultConfig(): ArchivalConfig {
    return {
      enabled: true,
      delayMinutes: 10, // Wait 10 minutes after spec completion before archiving
      archiveLocation: ConfigurationManagerImpl.DEFAULT_ARCHIVE_LOCATION,
      notificationLevel: 'minimal',
      backupEnabled: true
    };
  }

  /**
   * Validate configuration values
   * @param config Configuration to validate
   * @returns boolean True if configuration is valid
   */
  validateConfig(config: ArchivalConfig): boolean {
    try {
      // Check required fields exist and have correct types
      if (typeof config.enabled !== 'boolean') {
        return false;
      }
      
      if (typeof config.delayMinutes !== 'number' || config.delayMinutes < 0) {
        return false;
      }
      
      if (typeof config.archiveLocation !== 'string' || config.archiveLocation.trim() === '') {
        return false;
      }
      
      if (typeof config.backupEnabled !== 'boolean') {
        return false;
      }
      
      // Validate notification level
      const validNotificationLevels: NotificationLevel[] = ['none', 'minimal', 'verbose'];
      if (!validNotificationLevels.includes(config.notificationLevel)) {
        return false;
      }
      
      // Additional validation constraints
      if (config.delayMinutes > 1440) { // Max 24 hours
        return false;
      }
      
      // Archive location should not be an absolute path to prevent accidental system-wide changes
      if (config.archiveLocation.startsWith('/') || config.archiveLocation.includes('..')) {
        return false;
      }
      
      return true;
      
    } catch {
      return false;
    }
  }

  /**
   * Migrate configuration from older versions
   * @param oldConfig Raw configuration data from file
   * @returns ArchivalConfig Migrated configuration
   */
  migrateConfig(oldConfig: unknown): ArchivalConfig {
    if (!oldConfig || typeof oldConfig !== 'object') {
      return this.getDefaultConfig();
    }
    
    const typedConfig = oldConfig as Record<string, unknown>;
    
    // Start with default config and override with valid values
    const defaultConfig = this.getDefaultConfig();
    const migratedConfig: ArchivalConfig = { ...defaultConfig };
    
    // Migrate boolean fields
    if (typeof typedConfig.enabled === 'boolean') {
      migratedConfig.enabled = typedConfig.enabled;
    }
    
    if (typeof typedConfig.backupEnabled === 'boolean') {
      migratedConfig.backupEnabled = typedConfig.backupEnabled;
    }
    
    // Migrate numeric fields with bounds checking
    if (typeof typedConfig.delayMinutes === 'number' && 
        typedConfig.delayMinutes >= 0 && 
        typedConfig.delayMinutes <= 1440) {
      migratedConfig.delayMinutes = typedConfig.delayMinutes;
    }
    
    // Migrate string fields with validation
    if (typeof typedConfig.archiveLocation === 'string' && 
        typedConfig.archiveLocation.trim() !== '' &&
        !typedConfig.archiveLocation.startsWith('/') &&
        !typedConfig.archiveLocation.includes('..')) {
      migratedConfig.archiveLocation = typedConfig.archiveLocation.trim();
    }
    
    // Migrate notification level with validation
    if (typeof typedConfig.notificationLevel === 'string') {
      const level = typedConfig.notificationLevel as NotificationLevel;
      if (['none', 'minimal', 'verbose'].includes(level)) {
        migratedConfig.notificationLevel = level;
      }
    }
    
    // Handle legacy field migrations
    this.migrateLegacyFields(typedConfig, migratedConfig);
    
    return migratedConfig;
  }

  /**
   * Handle migration of legacy configuration fields
   * @param oldConfig Old configuration data
   * @param newConfig New configuration object to update
   */
  private migrateLegacyFields(oldConfig: Record<string, unknown>, newConfig: ArchivalConfig): void {
    // Migrate deprecated 'autoArchive' field to 'enabled'
    if (typeof oldConfig.autoArchive === 'boolean' && oldConfig.enabled === undefined) {
      newConfig.enabled = oldConfig.autoArchive;
    }
    
    // Migrate deprecated 'waitMinutes' field to 'delayMinutes'
    if (typeof oldConfig.waitMinutes === 'number' && 
        oldConfig.delayMinutes === undefined &&
        oldConfig.waitMinutes >= 0 && 
        oldConfig.waitMinutes <= 1440) {
      newConfig.delayMinutes = oldConfig.waitMinutes;
    }
    
    // Migrate deprecated 'verboseMode' field to 'notificationLevel'
    if (typeof oldConfig.verboseMode === 'boolean' && oldConfig.notificationLevel === undefined) {
      newConfig.notificationLevel = oldConfig.verboseMode ? 'verbose' : 'minimal';
    }
    
    // Migrate deprecated 'archivePath' field to 'archiveLocation'
    if (typeof oldConfig.archivePath === 'string' && 
        oldConfig.archiveLocation === undefined &&
        oldConfig.archivePath.trim() !== '' &&
        !oldConfig.archivePath.startsWith('/') &&
        !oldConfig.archivePath.includes('..')) {
      newConfig.archiveLocation = oldConfig.archivePath.trim();
    }
  }

  /**
   * Update a specific configuration setting
   * @param key Configuration key to update
   * @param value New value for the setting
   * @returns Promise<void>
   */
  async updateSetting<K extends keyof ArchivalConfig>(
    key: K, 
    value: ArchivalConfig[K]
  ): Promise<void> {
    const currentConfig = await this.loadConfig();
    const updatedConfig = { ...currentConfig, [key]: value };
    
    if (!this.validateConfig(updatedConfig)) {
      throw new ConfigurationError(
        `Invalid value for configuration setting '${key}': ${value}`,
        this.configFilePath
      );
    }
    
    await this.saveConfig(updatedConfig);
  }

  /**
   * Reset configuration to default values
   * @returns Promise<void>
   */
  async resetToDefaults(): Promise<void> {
    const defaultConfig = this.getDefaultConfig();
    await this.saveConfig(defaultConfig);
  }

  /**
   * Get configuration file path for debugging/logging
   * @returns string Path to configuration file
   */
  getConfigFilePath(): string {
    return this.configFilePath;
  }

  /**
   * Check if configuration file exists
   * @returns Promise<boolean> True if configuration file exists
   */
  async configFileExists(): Promise<boolean> {
    try {
      await fs.stat(this.configFilePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Backup current configuration to a timestamped file
   * @returns Promise<string> Path to backup file
   */
  async backupConfig(): Promise<string> {
    try {
      const config = await this.loadConfig();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.configFilePath.replace('.json', `.backup-${timestamp}.json`);
      
      const backupData = {
        ...config,
        _backupCreated: new Date().toISOString(),
        _originalPath: this.configFilePath
      };
      
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2), 'utf-8');
      return backupPath;
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to backup configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.configFilePath
      );
    }
  }

  /**
   * Restore configuration from a backup file
   * @param backupPath Path to backup file
   * @returns Promise<void>
   */
  async restoreFromBackup(backupPath: string): Promise<void> {
    try {
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData = JSON.parse(backupContent);
      
      // Extract configuration data, ignoring backup-specific metadata
      const config = { ...backupData };
      delete config._backupCreated;
      delete config._originalPath;
      delete config._version;
      delete config._lastUpdated;
      
      // Validate and migrate the backup configuration
      const migratedConfig = this.migrateConfig(config);
      
      if (!this.validateConfig(migratedConfig)) {
        throw new Error('Invalid configuration in backup file');
      }
      
      await this.saveConfig(migratedConfig);
      
    } catch (error) {
      throw new ConfigurationError(
        `Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        backupPath
      );
    }
  }
}