import { ArchivalConfig, ConfigurationManager } from '../types/archival.js';
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
export declare class ConfigurationManagerImpl implements ConfigurationManager {
    private static readonly CONFIG_FILE_NAME;
    private static readonly CONFIG_VERSION;
    private static readonly DEFAULT_ARCHIVE_LOCATION;
    private readonly configFilePath;
    private configCache;
    constructor(configDirectory?: string);
    /**
     * Load configuration from file, falling back to defaults if needed
     * @returns Promise<ArchivalConfig> The loaded or default configuration
     */
    loadConfig(): Promise<ArchivalConfig>;
    /**
     * Save configuration to file
     * @param config Configuration to save
     * @returns Promise<void>
     */
    saveConfig(config: ArchivalConfig): Promise<void>;
    /**
     * Get default configuration with sensible archival behavior
     * @returns ArchivalConfig Default configuration
     */
    getDefaultConfig(): ArchivalConfig;
    /**
     * Validate configuration values
     * @param config Configuration to validate
     * @returns boolean True if configuration is valid
     */
    validateConfig(config: ArchivalConfig): boolean;
    /**
     * Migrate configuration from older versions
     * @param oldConfig Raw configuration data from file
     * @returns ArchivalConfig Migrated configuration
     */
    migrateConfig(oldConfig: unknown): ArchivalConfig;
    /**
     * Handle migration of legacy configuration fields
     * @param oldConfig Old configuration data
     * @param newConfig New configuration object to update
     */
    private migrateLegacyFields;
    /**
     * Update a specific configuration setting
     * @param key Configuration key to update
     * @param value New value for the setting
     * @returns Promise<void>
     */
    updateSetting<K extends keyof ArchivalConfig>(key: K, value: ArchivalConfig[K]): Promise<void>;
    /**
     * Reset configuration to default values
     * @returns Promise<void>
     */
    resetToDefaults(): Promise<void>;
    /**
     * Get configuration file path for debugging/logging
     * @returns string Path to configuration file
     */
    getConfigFilePath(): string;
    /**
     * Check if configuration file exists
     * @returns Promise<boolean> True if configuration file exists
     */
    configFileExists(): Promise<boolean>;
    /**
     * Backup current configuration to a timestamped file
     * @returns Promise<string> Path to backup file
     */
    backupConfig(): Promise<string>;
    /**
     * Restore configuration from a backup file
     * @param backupPath Path to backup file
     * @returns Promise<void>
     */
    restoreFromBackup(backupPath: string): Promise<void>;
}
//# sourceMappingURL=configuration-manager.d.ts.map