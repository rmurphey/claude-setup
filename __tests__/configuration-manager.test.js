import { strict as assert } from 'assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtemp } from 'fs/promises';

import { ConfigurationManagerImpl } from '../dist/lib/configuration-manager.js';

describe('ConfigurationManager', () => {
  let tempDir;
  let configManager;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await mkdtemp(join(tmpdir(), 'config-manager-test-'));
    configManager = new ConfigurationManagerImpl(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Default Configuration', () => {
    test('should provide sensible default configuration', () => {
      const defaultConfig = configManager.getDefaultConfig();
      
      assert.strictEqual(defaultConfig.enabled, true);
      assert.strictEqual(defaultConfig.delayMinutes, 10);
      assert.strictEqual(defaultConfig.archiveLocation, '.kiro/specs/archive');
      assert.strictEqual(defaultConfig.notificationLevel, 'minimal');
      assert.strictEqual(defaultConfig.backupEnabled, true);
    });

    test('should create default config file when none exists', async () => {
      const config = await configManager.loadConfig();
      
      // Should match default configuration
      const defaultConfig = configManager.getDefaultConfig();
      assert.deepStrictEqual(config, defaultConfig);
      
      // Should create config file
      const configExists = await configManager.configFileExists();
      assert.strictEqual(configExists, true);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate correct configuration', () => {
      const validConfig = {
        enabled: true,
        delayMinutes: 15,
        archiveLocation: 'custom/archive',
        notificationLevel: 'verbose',
        backupEnabled: false
      };
      
      assert.strictEqual(configManager.validateConfig(validConfig), true);
    });

    test('should reject invalid boolean fields', () => {
      const invalidConfigs = [
        { ...configManager.getDefaultConfig(), enabled: 'true' },
        { ...configManager.getDefaultConfig(), backupEnabled: 1 }
      ];
      
      invalidConfigs.forEach(config => {
        assert.strictEqual(configManager.validateConfig(config), false);
      });
    });

    test('should reject invalid delayMinutes', () => {
      const invalidConfigs = [
        { ...configManager.getDefaultConfig(), delayMinutes: -1 },
        { ...configManager.getDefaultConfig(), delayMinutes: 1500 }, // More than 24 hours
        { ...configManager.getDefaultConfig(), delayMinutes: 'ten' }
      ];
      
      invalidConfigs.forEach(config => {
        assert.strictEqual(configManager.validateConfig(config), false);
      });
    });

    test('should reject invalid archiveLocation', () => {
      const invalidConfigs = [
        { ...configManager.getDefaultConfig(), archiveLocation: '' },
        { ...configManager.getDefaultConfig(), archiveLocation: '/absolute/path' },
        { ...configManager.getDefaultConfig(), archiveLocation: '../parent/dir' },
        { ...configManager.getDefaultConfig(), archiveLocation: 123 }
      ];
      
      invalidConfigs.forEach(config => {
        assert.strictEqual(configManager.validateConfig(config), false);
      });
    });

    test('should reject invalid notificationLevel', () => {
      const invalidConfigs = [
        { ...configManager.getDefaultConfig(), notificationLevel: 'invalid' },
        { ...configManager.getDefaultConfig(), notificationLevel: 'debug' },
        { ...configManager.getDefaultConfig(), notificationLevel: null }
      ];
      
      invalidConfigs.forEach(config => {
        assert.strictEqual(configManager.validateConfig(config), false);
      });
    });
  });

  describe('Configuration Persistence', () => {
    test('should save and load configuration correctly', async () => {
      const customConfig = {
        enabled: false,
        delayMinutes: 30,
        archiveLocation: 'my/custom/archive',
        notificationLevel: 'none',
        backupEnabled: false
      };
      
      await configManager.saveConfig(customConfig);
      
      // Create new manager instance to test persistence
      const newManager = new ConfigurationManagerImpl(tempDir);
      const loadedConfig = await newManager.loadConfig();
      
      assert.deepStrictEqual(loadedConfig, customConfig);
    });

    test('should include metadata in saved config file', async () => {
      const config = configManager.getDefaultConfig();
      await configManager.saveConfig(config);
      
      const configPath = configManager.getConfigFilePath();
      const fileContent = await fs.readFile(configPath, 'utf-8');
      const savedData = JSON.parse(fileContent);
      
      assert.ok(savedData._version);
      assert.ok(savedData._lastUpdated);
      assert.strictEqual(savedData.enabled, config.enabled);
    });

    test('should handle file permission errors gracefully', async () => {
      const config = configManager.getDefaultConfig();
      
      // Create manager with invalid directory to simulate permission error
      const invalidManager = new ConfigurationManagerImpl('/invalid/directory/path');
      
      try {
        await invalidManager.saveConfig(config);
        assert.fail('Should have thrown an error for invalid directory');
      } catch (error) {
        assert.ok(error.message.includes('Failed to save archival configuration'));
      }
    });
  });

  describe('Configuration Migration', () => {
    test('should migrate empty/invalid config to defaults', () => {
      const testCases = [
        null,
        undefined,
        {},
        { invalid: 'data' },
        'invalid json'
      ];
      
      testCases.forEach(invalidConfig => {
        const migrated = configManager.migrateConfig(invalidConfig);
        assert.deepStrictEqual(migrated, configManager.getDefaultConfig());
      });
    });

    test('should preserve valid configuration values', () => {
      const validConfig = {
        enabled: false,
        delayMinutes: 45,
        archiveLocation: 'custom/location',
        notificationLevel: 'verbose',
        backupEnabled: false
      };
      
      const migrated = configManager.migrateConfig(validConfig);
      assert.deepStrictEqual(migrated, validConfig);
    });

    test('should migrate legacy field names', () => {
      const legacyConfig = {
        autoArchive: false, // Should migrate to 'enabled'
        waitMinutes: 20,    // Should migrate to 'delayMinutes'
        verboseMode: true,  // Should migrate to 'notificationLevel: verbose'
        archivePath: 'old/path' // Should migrate to 'archiveLocation'
      };
      
      const migrated = configManager.migrateConfig(legacyConfig);
      
      assert.strictEqual(migrated.enabled, false);
      assert.strictEqual(migrated.delayMinutes, 20);
      assert.strictEqual(migrated.notificationLevel, 'verbose');
      assert.strictEqual(migrated.archiveLocation, 'old/path');
    });

    test('should not override new fields with legacy values', () => {
      const mixedConfig = {
        enabled: true,
        autoArchive: false, // Should not override 'enabled'
        delayMinutes: 15,
        waitMinutes: 30,    // Should not override 'delayMinutes'
        notificationLevel: 'minimal',
        verboseMode: true   // Should not override 'notificationLevel'
      };
      
      const migrated = configManager.migrateConfig(mixedConfig);
      
      assert.strictEqual(migrated.enabled, true);
      assert.strictEqual(migrated.delayMinutes, 15);
      assert.strictEqual(migrated.notificationLevel, 'minimal');
    });

    test('should reject invalid legacy values', () => {
      const invalidLegacyConfig = {
        autoArchive: 'invalid',
        waitMinutes: -10,
        verboseMode: 'not boolean',
        archivePath: '/absolute/path'
      };
      
      const migrated = configManager.migrateConfig(invalidLegacyConfig);
      const defaults = configManager.getDefaultConfig();
      
      // Should fall back to defaults for invalid values
      assert.strictEqual(migrated.enabled, defaults.enabled);
      assert.strictEqual(migrated.delayMinutes, defaults.delayMinutes);
      assert.strictEqual(migrated.notificationLevel, defaults.notificationLevel);
      assert.strictEqual(migrated.archiveLocation, defaults.archiveLocation);
    });
  });

  describe('Configuration Updates', () => {
    test('should update individual settings', async () => {
      // Start with defaults
      await configManager.loadConfig();
      
      // Update a single setting
      await configManager.updateSetting('delayMinutes', 25);
      
      const updatedConfig = await configManager.loadConfig();
      assert.strictEqual(updatedConfig.delayMinutes, 25);
      
      // Other settings should remain unchanged
      const defaults = configManager.getDefaultConfig();
      assert.strictEqual(updatedConfig.enabled, defaults.enabled);
      assert.strictEqual(updatedConfig.archiveLocation, defaults.archiveLocation);
    });

    test('should reject invalid setting updates', async () => {
      await configManager.loadConfig();
      
      try {
        await configManager.updateSetting('delayMinutes', -5);
        assert.fail('Should have thrown an error for invalid value');
      } catch (error) {
        assert.ok(error.message.includes('Invalid value for configuration setting'));
      }
    });

    test('should reset to defaults', async () => {
      // Create custom configuration
      const customConfig = {
        enabled: false,
        delayMinutes: 60,
        archiveLocation: 'custom/archive',
        notificationLevel: 'none',
        backupEnabled: false
      };
      
      await configManager.saveConfig(customConfig);
      
      // Reset to defaults
      await configManager.resetToDefaults();
      
      const resetConfig = await configManager.loadConfig();
      assert.deepStrictEqual(resetConfig, configManager.getDefaultConfig());
    });
  });

  describe('Configuration Backup and Restore', () => {
    test('should create configuration backup', async () => {
      const customConfig = {
        enabled: false,
        delayMinutes: 30,
        archiveLocation: 'test/archive',
        notificationLevel: 'verbose',
        backupEnabled: true
      };
      
      await configManager.saveConfig(customConfig);
      const backupPath = await configManager.backupConfig();
      
      // Verify backup file exists
      const backupExists = await fs.stat(backupPath);
      assert.ok(backupExists.isFile());
      
      // Verify backup contains correct data
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData = JSON.parse(backupContent);
      
      assert.strictEqual(backupData.enabled, customConfig.enabled);
      assert.strictEqual(backupData.delayMinutes, customConfig.delayMinutes);
      assert.ok(backupData._backupCreated);
      assert.ok(backupData._originalPath);
    });

    test('should restore from backup', async () => {
      const originalConfig = {
        enabled: false,
        delayMinutes: 45,
        archiveLocation: 'original/archive',
        notificationLevel: 'verbose',
        backupEnabled: false
      };
      
      await configManager.saveConfig(originalConfig);
      const backupPath = await configManager.backupConfig();
      
      // Change configuration
      const changedConfig = {
        enabled: true,
        delayMinutes: 5,
        archiveLocation: 'changed/archive',
        notificationLevel: 'none',
        backupEnabled: true
      };
      
      await configManager.saveConfig(changedConfig);
      
      // Restore from backup
      await configManager.restoreFromBackup(backupPath);
      
      const restoredConfig = await configManager.loadConfig();
      assert.deepStrictEqual(restoredConfig, originalConfig);
    });

    test('should handle invalid backup files', async () => {
      const invalidBackupPath = join(tempDir, 'invalid-backup.json');
      await fs.writeFile(invalidBackupPath, 'invalid json', 'utf-8');
      
      try {
        await configManager.restoreFromBackup(invalidBackupPath);
        assert.fail('Should have thrown an error for invalid backup');
      } catch (error) {
        assert.ok(error.message.includes('Failed to restore from backup'));
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupted config file', async () => {
      const configPath = configManager.getConfigFilePath();
      await fs.writeFile(configPath, 'invalid json content', 'utf-8');
      
      try {
        await configManager.loadConfig();
        assert.fail('Should have thrown an error for corrupted config');
      } catch (error) {
        assert.ok(error.message.includes('Failed to load archival configuration'));
      }
    });

    test('should not save invalid configuration', async () => {
      const invalidConfig = {
        enabled: 'not boolean',
        delayMinutes: -10,
        archiveLocation: '',
        notificationLevel: 'invalid',
        backupEnabled: null
      };
      
      try {
        await configManager.saveConfig(invalidConfig);
        assert.fail('Should have thrown an error for invalid config');
      } catch (error) {
        assert.ok(error.message.includes('Invalid configuration'));
      }
    });
  });

  describe('Utility Methods', () => {
    test('should report config file existence correctly', async () => {
      // Initially no config file
      assert.strictEqual(await configManager.configFileExists(), false);
      
      // After loading/creating config
      await configManager.loadConfig();
      assert.strictEqual(await configManager.configFileExists(), true);
    });

    test('should provide correct config file path', () => {
      const path = configManager.getConfigFilePath();
      assert.ok(path.includes(tempDir));
      assert.ok(path.endsWith('.kiro-archival-config.json'));
    });
  });

  describe('All Notification Levels', () => {
    test('should accept all valid notification levels', () => {
      const levels = ['none', 'minimal', 'verbose'];
      
      levels.forEach(level => {
        const config = {
          ...configManager.getDefaultConfig(),
          notificationLevel: level
        };
        
        assert.strictEqual(
          configManager.validateConfig(config), 
          true, 
          `Should accept notification level: ${level}`
        );
      });
    });
  });

  describe('Boundary Value Testing', () => {
    test('should handle boundary values for delayMinutes', () => {
      const boundaryTests = [
        { value: 0, valid: true },
        { value: 1, valid: true },
        { value: 1440, valid: true },  // 24 hours
        { value: 1441, valid: false }, // Over 24 hours
        { value: -0.1, valid: false }
      ];
      
      boundaryTests.forEach(({ value, valid }) => {
        const config = {
          ...configManager.getDefaultConfig(),
          delayMinutes: value
        };
        
        assert.strictEqual(
          configManager.validateConfig(config), 
          valid,
          `delayMinutes ${value} should be ${valid ? 'valid' : 'invalid'}`
        );
      });
    });
  });
});