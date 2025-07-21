import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { ArchivalEngineImpl } from '../dist/lib/archival-engine.js';

describe('ArchivalEngine', () => {
  let tempDir;
  let archivalEngine;
  let testSpecPath;
  let archiveLocation;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await fs.mkdtemp(join(tmpdir(), 'archival-engine-test-'));
    archiveLocation = join(tempDir, 'archive');
    archivalEngine = new ArchivalEngineImpl(archiveLocation);
    
    // Create test spec directory
    testSpecPath = join(tempDir, 'test-spec');
    await fs.mkdir(testSpecPath, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('validateArchivalSafety', () => {
    test('should pass validation for complete spec with all required files', async () => {
      // Create required spec files
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design');
      await fs.writeFile(join(testSpecPath, 'tasks.md'), '- [x] Task 1\n- [x] Task 2');

      // Set modification time to past (older than 5 minutes) to pass validation
      const pastTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const tasksPath = join(testSpecPath, 'tasks.md');
      await fs.utimes(tasksPath, pastTime, pastTime);

      const result = await archivalEngine.validateArchivalSafety(testSpecPath);

      assert.strictEqual(result.isSafe, true);
      assert.strictEqual(result.canProceed, true);
      assert.strictEqual(result.issues.length, 0);
    });

    test('should fail validation when required files are missing', async () => {
      // Only create some required files
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design');
      // Missing tasks.md

      const result = await archivalEngine.validateArchivalSafety(testSpecPath);

      assert.strictEqual(result.isSafe, false);
      assert.strictEqual(result.canProceed, false);
      assert.ok(result.issues.some(issue => issue.includes('Missing required file: tasks.md')));
    });

    test('should fail validation when spec directory does not exist', async () => {
      const nonExistentPath = join(tempDir, 'non-existent-spec');

      const result = await archivalEngine.validateArchivalSafety(nonExistentPath);

      assert.strictEqual(result.isSafe, false);
      assert.strictEqual(result.canProceed, false);
      assert.ok(result.issues.length > 0);
    });

    test('should fail validation when spec was recently modified', async () => {
      // Create required spec files
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design');
      
      // Create tasks.md with current timestamp (recently modified)
      const tasksPath = join(testSpecPath, 'tasks.md');
      await fs.writeFile(tasksPath, '- [x] Task 1');
      
      // Set modification time to now (within 5 minute threshold)
      const now = new Date();
      await fs.utimes(tasksPath, now, now);

      const result = await archivalEngine.validateArchivalSafety(testSpecPath);

      assert.strictEqual(result.isSafe, false);
      assert.strictEqual(result.canProceed, false);
      assert.ok(result.issues.some(issue => issue.includes('recently modified')));
    });
  });

  describe('createArchiveMetadata', () => {
    test('should create proper archive metadata', () => {
      const specInfo = {
        name: 'test-spec',
        path: join(archiveLocation, '2025-01-17_test-spec'),
        completionDate: new Date('2025-01-17T10:00:00Z'),
        totalTasks: 5,
        completedTasks: 5
      };

      const metadata = archivalEngine.createArchiveMetadata(specInfo);

      assert.strictEqual(metadata.specName, 'test-spec');
      assert.strictEqual(metadata.archivePath, specInfo.path);
      assert.strictEqual(metadata.completionDate, specInfo.completionDate);
      assert.strictEqual(metadata.totalTasks, 5);
      assert.strictEqual(metadata.completedTasks, 5);
      assert.strictEqual(metadata.version, '1.0');
      assert.ok(metadata.archivalDate instanceof Date);
    });
  });

  describe('archiveSpec', () => {
    test('should successfully archive a complete spec', async () => {
      // Create a complete spec
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements\nTest requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design\nTest design');
      await fs.writeFile(join(testSpecPath, 'tasks.md'), '- [x] Task 1\n- [x] Task 2');
      
      // Set modification time to past (older than 5 minutes)
      const pastTime = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      const tasksPath = join(testSpecPath, 'tasks.md');
      await fs.utimes(tasksPath, pastTime, pastTime);

      const result = await archivalEngine.archiveSpec(testSpecPath);

      assert.strictEqual(result.success, true);
      assert.strictEqual(result.originalPath, testSpecPath);
      assert.ok(result.archivePath.includes('archive'));
      assert.ok(result.timestamp instanceof Date);
      assert.strictEqual(result.error, undefined);

      // Verify original spec is removed
      try {
        await fs.stat(testSpecPath);
        assert.fail('Original spec should have been removed');
      } catch (err) {
        assert.strictEqual(err.code, 'ENOENT');
      }

      // Verify archive exists with all files
      const archiveFiles = await fs.readdir(result.archivePath);
      assert.ok(archiveFiles.includes('requirements.md'));
      assert.ok(archiveFiles.includes('design.md'));
      assert.ok(archiveFiles.includes('tasks.md'));
      assert.ok(archiveFiles.includes('.archive-metadata.json'));

      // Verify metadata content
      const metadataContent = await fs.readFile(join(result.archivePath, '.archive-metadata.json'), 'utf-8');
      const metadata = JSON.parse(metadataContent);
      assert.strictEqual(metadata.specName, 'test-spec');
      assert.strictEqual(metadata.version, '1.0');
    });

    test('should fail archival and rollback when validation fails', async () => {
      // Create incomplete spec (missing tasks.md)
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design');

      const result = await archivalEngine.archiveSpec(testSpecPath);

      assert.strictEqual(result.success, false);
      assert.strictEqual(result.originalPath, testSpecPath);
      assert.ok(result.error);
      assert.ok(result.error.includes('validation failed'));

      // Verify original spec still exists
      const originalExists = await fs.stat(testSpecPath);
      assert.ok(originalExists.isDirectory());

      // Verify no partial archive was left behind
      try {
        await fs.stat(result.archivePath);
        assert.fail('Partial archive should have been cleaned up');
      } catch (err) {
        assert.strictEqual(err.code, 'ENOENT');
      }
    });

    test('should preserve file permissions and timestamps', async () => {
      // Create spec files with specific permissions
      const requirementsPath = join(testSpecPath, 'requirements.md');
      const designPath = join(testSpecPath, 'design.md');
      const tasksPath = join(testSpecPath, 'tasks.md');
      
      await fs.writeFile(requirementsPath, '# Requirements');
      await fs.writeFile(designPath, '# Design');
      await fs.writeFile(tasksPath, '- [x] Task 1');

      // Set specific permissions and timestamps
      await fs.chmod(requirementsPath, 0o644);
      const testTime = new Date('2025-01-01T12:00:00Z');
      await fs.utimes(requirementsPath, testTime, testTime);
      
      // Set tasks.md to past time to pass validation
      const pastTime = new Date(Date.now() - 10 * 60 * 1000);
      await fs.utimes(tasksPath, pastTime, pastTime);

      const result = await archivalEngine.archiveSpec(testSpecPath);
      assert.strictEqual(result.success, true);

      // Verify preserved permissions and timestamps
      const archivedRequirements = join(result.archivePath, 'requirements.md');
      const archivedStats = await fs.stat(archivedRequirements);
      
      assert.strictEqual(archivedStats.mode & 0o777, 0o644);
      assert.strictEqual(archivedStats.mtime.getTime(), testTime.getTime());
    });

    test('should handle subdirectories in spec', async () => {
      // Create spec with subdirectory
      const subDir = join(testSpecPath, 'assets');
      await fs.mkdir(subDir);
      
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design');
      await fs.writeFile(join(testSpecPath, 'tasks.md'), '- [x] Task 1');
      await fs.writeFile(join(subDir, 'diagram.md'), '# Diagram');
      
      // Set tasks.md to past time
      const pastTime = new Date(Date.now() - 10 * 60 * 1000);
      await fs.utimes(join(testSpecPath, 'tasks.md'), pastTime, pastTime);

      const result = await archivalEngine.archiveSpec(testSpecPath);
      assert.strictEqual(result.success, true);

      // Verify subdirectory was copied
      const archivedSubDir = join(result.archivePath, 'assets');
      const subDirStats = await fs.stat(archivedSubDir);
      assert.ok(subDirStats.isDirectory());
      
      const archivedDiagram = join(archivedSubDir, 'diagram.md');
      const diagramContent = await fs.readFile(archivedDiagram, 'utf-8');
      assert.strictEqual(diagramContent, '# Diagram');
    });
  });

  describe('error handling', () => {
    test('should handle permission errors gracefully', async () => {
      // Create spec files
      await fs.writeFile(join(testSpecPath, 'requirements.md'), '# Requirements');
      await fs.writeFile(join(testSpecPath, 'design.md'), '# Design');
      await fs.writeFile(join(testSpecPath, 'tasks.md'), '- [x] Task 1');
      
      // Set tasks.md to past time
      const pastTime = new Date(Date.now() - 10 * 60 * 1000);
      await fs.utimes(join(testSpecPath, 'tasks.md'), pastTime, pastTime);

      // Create archive location with no write permissions
      await fs.mkdir(archiveLocation, { recursive: true });
      await fs.chmod(archiveLocation, 0o444); // Read-only

      const result = await archivalEngine.archiveSpec(testSpecPath);

      assert.strictEqual(result.success, false);
      assert.ok(result.error);

      // Restore permissions for cleanup
      await fs.chmod(archiveLocation, 0o755);
    });

    test('should handle concurrent archival attempts', async () => {
      // Create two identical specs
      const spec1Path = join(tempDir, 'duplicate-spec');
      const spec2Path = join(tempDir, 'specs', 'duplicate-spec');
      
      await fs.mkdir(spec1Path, { recursive: true });
      await fs.mkdir(join(tempDir, 'specs'), { recursive: true });
      await fs.mkdir(spec2Path, { recursive: true });

      // Create files for both specs
      for (const specPath of [spec1Path, spec2Path]) {
        await fs.writeFile(join(specPath, 'requirements.md'), '# Requirements');
        await fs.writeFile(join(specPath, 'design.md'), '# Design');
        await fs.writeFile(join(specPath, 'tasks.md'), '- [x] Task 1');
        
        const pastTime = new Date(Date.now() - 10 * 60 * 1000);
        await fs.utimes(join(specPath, 'tasks.md'), pastTime, pastTime);
      }

      // Archive first spec
      const result1 = await archivalEngine.archiveSpec(spec1Path);
      assert.strictEqual(result1.success, true);

      // Try to archive second spec with same name - should handle gracefully
      const engine2 = new ArchivalEngineImpl(archiveLocation);
      const result2 = await engine2.archiveSpec(spec2Path);
      
      // Second archival should succeed with different timestamp
      assert.strictEqual(result2.success, true);
      assert.notStrictEqual(result1.archivePath, result2.archivePath);
    });
  });
});