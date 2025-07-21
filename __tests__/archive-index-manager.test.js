import { strict as assert } from 'assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdtemp } from 'fs/promises';

import { ArchiveIndexManager } from '../dist/lib/archive-index-manager.js';

describe('ArchiveIndexManager', () => {
  let tempDir;
  let indexManager;

  beforeEach(async () => {
    // Create a temporary directory for each test
    tempDir = await mkdtemp(join(tmpdir(), 'archive-index-test-'));
    indexManager = new ArchiveIndexManager(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('Index Creation and Loading', () => {
    test('should create empty index when none exists', async () => {
      const index = await indexManager.getIndex();
      
      assert.strictEqual(index.version, '1.0');
      assert.strictEqual(index.archives.length, 0);
      assert.ok(index.lastUpdated instanceof Date);
    });

    test('should persist and load index from file', async () => {
      await indexManager.getIndex();
      
      // Verify index file was created
      const indexPath = join(tempDir, '.archive-index.json');
      const stat = await fs.stat(indexPath);
      assert.ok(stat.isFile());
      
      // Verify index content
      const indexContent = await fs.readFile(indexPath, 'utf-8');
      const parsedIndex = JSON.parse(indexContent);
      assert.strictEqual(parsedIndex.version, '1.0');
      assert.strictEqual(parsedIndex.archives.length, 0);
    });
  });

  describe('Archive Entry Management', () => {
    test('should add archive entry successfully', async () => {
      const metadata = {
        specName: 'test-spec',
        originalPath: '.kiro/specs/test-spec',
        archivePath: join(tempDir, '2025-01-17_test-spec'),
        completionDate: new Date('2025-01-17T10:00:00Z'),
        archivalDate: new Date('2025-01-17T10:05:00Z'),
        totalTasks: 5,
        completedTasks: 5,
        version: '1.0'
      };

      await indexManager.addArchiveEntry(metadata);
      
      const index = await indexManager.getIndex();
      assert.strictEqual(index.archives.length, 1);
      
      const entry = index.archives[0];
      assert.strictEqual(entry.specName, 'test-spec');
      assert.strictEqual(entry.archivePath, metadata.archivePath);
      assert.strictEqual(entry.totalTasks, 5);
    });

    test('should update existing entry when adding duplicate', async () => {
      const metadata1 = {
        specName: 'test-spec',
        originalPath: '.kiro/specs/test-spec',
        archivePath: join(tempDir, '2025-01-17_test-spec'),
        completionDate: new Date('2025-01-17T10:00:00Z'),
        archivalDate: new Date('2025-01-17T10:05:00Z'),
        totalTasks: 5,
        completedTasks: 5,
        version: '1.0'
      };

      const metadata2 = {
        ...metadata1,
        totalTasks: 7,
        completedTasks: 7
      };

      await indexManager.addArchiveEntry(metadata1);
      await indexManager.addArchiveEntry(metadata2);
      
      const index = await indexManager.getIndex();
      assert.strictEqual(index.archives.length, 1);
      assert.strictEqual(index.archives[0].totalTasks, 7);
    });

    test('should remove archive entry successfully', async () => {
      const metadata = {
        specName: 'test-spec',
        originalPath: '.kiro/specs/test-spec',
        archivePath: join(tempDir, '2025-01-17_test-spec'),
        completionDate: new Date('2025-01-17T10:00:00Z'),
        archivalDate: new Date('2025-01-17T10:05:00Z'),
        totalTasks: 5,
        completedTasks: 5,
        version: '1.0'
      };

      await indexManager.addArchiveEntry(metadata);
      
      const removed = await indexManager.removeArchiveEntry(metadata.archivePath);
      assert.strictEqual(removed, true);
      
      const index = await indexManager.getIndex();
      assert.strictEqual(index.archives.length, 0);
    });

    test('should return false when removing non-existent entry', async () => {
      const removed = await indexManager.removeArchiveEntry('/non/existent/path');
      assert.strictEqual(removed, false);
    });
  });

  describe('Search and Retrieval', () => {
    beforeEach(async () => {
      // Add test data
      const specs = [
        {
          specName: 'user-authentication',
          archivePath: join(tempDir, '2025-01-15_user-authentication'),
          completionDate: new Date('2025-01-15T10:00:00Z'),
          archivalDate: new Date('2025-01-15T10:05:00Z'),
          totalTasks: 8
        },
        {
          specName: 'project-cleanup',
          archivePath: join(tempDir, '2025-01-17_project-cleanup'),
          completionDate: new Date('2025-01-17T10:00:00Z'),
          archivalDate: new Date('2025-01-17T10:05:00Z'),
          totalTasks: 10
        },
        {
          specName: 'user-profile',
          archivePath: join(tempDir, '2025-01-18_user-profile'),
          completionDate: new Date('2025-01-18T10:00:00Z'),
          archivalDate: new Date('2025-01-18T10:05:00Z'),
          totalTasks: 6
        }
      ];

      for (const spec of specs) {
        const metadata = {
          ...spec,
          originalPath: `.kiro/specs/${spec.specName}`,
          completedTasks: spec.totalTasks,
          version: '1.0'
        };
        await indexManager.addArchiveEntry(metadata);
      }
    });

    test('should search archives by spec name', async () => {
      const results = await indexManager.searchArchives('user');
      assert.strictEqual(results.length, 2);
      
      const specNames = results.map(r => r.specName).sort();
      assert.deepStrictEqual(specNames, ['user-authentication', 'user-profile']);
    });

    test('should return all archives sorted by date', async () => {
      const results = await indexManager.getAllArchives();
      assert.strictEqual(results.length, 3);
      
      // Should be sorted by archival date, most recent first
      assert.strictEqual(results[0].specName, 'user-profile');
      assert.strictEqual(results[1].specName, 'project-cleanup');
      assert.strictEqual(results[2].specName, 'user-authentication');
    });

    test('should find archive by spec name', async () => {
      const result = await indexManager.getArchiveBySpecName('project-cleanup');
      assert.ok(result);
      assert.strictEqual(result.specName, 'project-cleanup');
      assert.strictEqual(result.totalTasks, 10);
    });

    test('should find archive by path', async () => {
      const archivePath = join(tempDir, '2025-01-15_user-authentication');
      const result = await indexManager.getArchiveByPath(archivePath);
      assert.ok(result);
      assert.strictEqual(result.specName, 'user-authentication');
      assert.strictEqual(result.totalTasks, 8);
    });

    test('should return null for non-existent searches', async () => {
      const byName = await indexManager.getArchiveBySpecName('non-existent');
      const byPath = await indexManager.getArchiveByPath('/non/existent/path');
      
      assert.strictEqual(byName, null);
      assert.strictEqual(byPath, null);
    });
  });

  describe('Statistics', () => {
    test('should return correct statistics', async () => {
      // Add test data
      const specs = [
        { specName: 'spec1', totalTasks: 5, archivalDate: new Date('2025-01-15T10:00:00Z') },
        { specName: 'spec2', totalTasks: 8, archivalDate: new Date('2025-01-17T10:00:00Z') },
        { specName: 'spec3', totalTasks: 3, archivalDate: new Date('2025-01-16T10:00:00Z') }
      ];

      for (const spec of specs) {
        const metadata = {
          ...spec,
          originalPath: `.kiro/specs/${spec.specName}`,
          archivePath: join(tempDir, `2025-01-15_${spec.specName}`),
          completionDate: spec.archivalDate,
          completedTasks: spec.totalTasks,
          version: '1.0'
        };
        await indexManager.addArchiveEntry(metadata);
      }

      const stats = await indexManager.getArchiveStats();
      
      assert.strictEqual(stats.totalArchives, 3);
      assert.strictEqual(stats.totalTasks, 16); // 5 + 8 + 3
      assert.deepStrictEqual(stats.oldestArchive, new Date('2025-01-15T10:00:00Z'));
      assert.deepStrictEqual(stats.newestArchive, new Date('2025-01-17T10:00:00Z'));
    });

    test('should return empty statistics for no archives', async () => {
      const stats = await indexManager.getArchiveStats();
      
      assert.strictEqual(stats.totalArchives, 0);
      assert.strictEqual(stats.totalTasks, 0);
      assert.strictEqual(stats.oldestArchive, undefined);
      assert.strictEqual(stats.newestArchive, undefined);
    });
  });

  describe('Index Validation and Repair', () => {
    test('should validate healthy index', async () => {
      // Create a healthy archive structure
      const archivePath = join(tempDir, '2025-01-17_test-spec');
      await fs.mkdir(archivePath, { recursive: true });
      await fs.writeFile(join(archivePath, 'requirements.md'), 'test content');
      
      const metadata = {
        specName: 'test-spec',
        originalPath: '.kiro/specs/test-spec',
        archivePath,
        completionDate: new Date('2025-01-17T10:00:00Z'),
        archivalDate: new Date('2025-01-17T10:05:00Z'),
        totalTasks: 5,
        completedTasks: 5,
        version: '1.0'
      };
      
      await indexManager.addArchiveEntry(metadata);
      
      const result = await indexManager.validateAndRepairIndex();
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.repaired, false);
      assert.strictEqual(result.issues.length, 0);
    });

    test('should remove entries for non-existent archives', async () => {
      const metadata = {
        specName: 'test-spec',
        originalPath: '.kiro/specs/test-spec',
        archivePath: join(tempDir, 'non-existent-archive'),
        completionDate: new Date('2025-01-17T10:00:00Z'),
        archivalDate: new Date('2025-01-17T10:05:00Z'),
        totalTasks: 5,
        completedTasks: 5,
        version: '1.0'
      };
      
      await indexManager.addArchiveEntry(metadata);
      
      const result = await indexManager.validateAndRepairIndex();
      assert.strictEqual(result.isValid, false);
      assert.strictEqual(result.repaired, true);
      assert.ok(result.issues.some(issue => issue.includes('Archive directory not found')));
      
      // Verify entry was removed
      const index = await indexManager.getIndex();
      assert.strictEqual(index.archives.length, 0);
    });
  });

  describe('Error Handling', () => {
    test('should handle corrupted index file', async () => {
      // Write invalid JSON to index file
      const indexPath = join(tempDir, '.archive-index.json');
      await fs.writeFile(indexPath, 'invalid json');
      
      // Create new manager to force reload
      const newManager = new ArchiveIndexManager(tempDir);
      
      try {
        await newManager.getIndex();
        assert.fail('Should have thrown an error for corrupted index');
      } catch (error) {
        assert.ok(error.message.includes('Failed to load archive index'));
      }
    });

    test('should handle permission errors gracefully', async () => {
      const metadata = {
        specName: 'test-spec',
        originalPath: '.kiro/specs/test-spec',
        archivePath: join(tempDir, '2025-01-17_test-spec'),
        completionDate: new Date('2025-01-17T10:00:00Z'),
        archivalDate: new Date('2025-01-17T10:05:00Z'),
        totalTasks: 5,
        completedTasks: 5,
        version: '1.0'
      };

      // Create manager with invalid directory to simulate permission error
      const invalidManager = new ArchiveIndexManager('/invalid/directory/path');
      
      try {
        await invalidManager.addArchiveEntry(metadata);
        assert.fail('Should have thrown an error for invalid directory');
      } catch (error) {
        assert.ok(error.message.includes('Failed to add archive entry'));
      }
    });
  });
});