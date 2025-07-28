import { test, describe } from 'node:test';
import assert from 'node:assert';
import path from 'path';

import fs from 'fs-extra';

import { ActiveWorkFileResolver } from '../dist/lib/active-work-file-resolver.js';

describe('ActiveWorkFileResolver', () => {
  const testDir = path.join(process.cwd(), 'test-resolver-temp');
  let originalCwd;

  // Setup test directory before each test
  async function setupTestDir() {
    originalCwd = process.cwd();
    await fs.ensureDir(testDir);
    process.chdir(testDir);
  }

  // Cleanup test directory after each test
  async function cleanupTestDir() {
    process.chdir(originalCwd);
    await fs.remove(testDir);
  }

  describe('findExistingFile', () => {
    test('should find internal/ACTIVE_WORK.md when it exists', async () => {
      await setupTestDir();
      
      // Create internal directory and file
      await fs.ensureDir('internal');
      await fs.writeFile('internal/ACTIVE_WORK.md', '# Test content');
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'internal/ACTIVE_WORK.md');
      
      await cleanupTestDir();
    });

    test('should find ACTIVE_WORK.md in root when internal version does not exist', async () => {
      await setupTestDir();
      
      // Create root file only
      await fs.writeFile('ACTIVE_WORK.md', '# Test content');
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'ACTIVE_WORK.md');
      
      await cleanupTestDir();
    });

    test('should prefer internal/ACTIVE_WORK.md when both exist', async () => {
      await setupTestDir();
      
      // Create both files
      await fs.ensureDir('internal');
      await fs.writeFile('internal/ACTIVE_WORK.md', '# Internal content');
      await fs.writeFile('ACTIVE_WORK.md', '# Root content');
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'internal/ACTIVE_WORK.md');
      
      await cleanupTestDir();
    });
  });

  describe('createActiveWorkFile', () => {
    test('should create ACTIVE_WORK.md in internal/ when internal directory exists', async () => {
      await setupTestDir();
      
      // Create internal directory
      await fs.ensureDir('internal');
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'internal/ACTIVE_WORK.md');
      assert(await fs.pathExists('internal/ACTIVE_WORK.md'));
      
      // Verify content contains expected template structure
      const content = await fs.readFile('internal/ACTIVE_WORK.md', 'utf8');
      assert(content.includes('# Active Work Session'));
      assert(content.includes('## Project Info'));
      
      await cleanupTestDir();
    });

    test('should create ACTIVE_WORK.md in root when no internal directory exists', async () => {
      await setupTestDir();
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'ACTIVE_WORK.md');
      assert(await fs.pathExists('ACTIVE_WORK.md'));
      
      // Verify content contains expected template structure
      const content = await fs.readFile('ACTIVE_WORK.md', 'utf8');
      assert(content.includes('# Active Work Session'));
      assert(content.includes('## Project Info'));
      
      await cleanupTestDir();
    });

    test('should create ACTIVE_WORK.md in internal/ when .kiro directory exists', async () => {
      await setupTestDir();
      
      // Create .kiro directory (indicates this is a kiro project)
      await fs.ensureDir('.kiro');
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'internal/ACTIVE_WORK.md');
      assert(await fs.pathExists('internal/ACTIVE_WORK.md'));
      assert(await fs.pathExists('internal')); // Should create internal dir
      
      await cleanupTestDir();
    });
  });

  describe('resolveActiveWorkFile', () => {
    test('should return existing file path when file exists', async () => {
      await setupTestDir();
      
      await fs.writeFile('ACTIVE_WORK.md', '# Existing content');
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'ACTIVE_WORK.md');
      
      // Should not modify existing file
      const content = await fs.readFile('ACTIVE_WORK.md', 'utf8');
      assert.strictEqual(content, '# Existing content');
      
      await cleanupTestDir();
    });

    test('should create new file when no file exists', async () => {
      await setupTestDir();
      
      const resolver = new ActiveWorkFileResolver();
      const result = await resolver.resolveActiveWorkFile();
      
      assert.strictEqual(result, 'ACTIVE_WORK.md');
      assert(await fs.pathExists('ACTIVE_WORK.md'));
      
      // Should contain generated template content
      const content = await fs.readFile('ACTIVE_WORK.md', 'utf8');
      assert(content.includes('# Active Work Session'));
      
      await cleanupTestDir();
    });
  });
});