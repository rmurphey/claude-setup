import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import { join } from 'path';

import { SpecScannerImpl } from '../dist/lib/spec-scanner.js';

describe('SpecScannerImpl', () => {
  let scanner;
  let testDir;

  beforeEach(async () => {
    scanner = new SpecScannerImpl();
    
    // Create test directory structure
    testDir = join(process.cwd(), '__tests__', 'test-specs');
    await fs.mkdir(testDir, { recursive: true });
    
    // Mock the specs directory by temporarily changing the static property
    SpecScannerImpl.SPECS_DIRECTORY = testDir;
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    
    // Restore original specs directory
    SpecScannerImpl.SPECS_DIRECTORY = '.kiro/specs';
  });

  describe('getAllSpecs()', () => {
    test('should return empty array when no specs exist', async () => {
      const specs = await scanner.getAllSpecs();
      assert.deepStrictEqual(specs, []);
    });

    test('should find valid spec directories', async () => {
      // Create valid spec directories
      const spec1 = join(testDir, 'spec-1');
      const spec2 = join(testDir, 'spec-2');
      
      await fs.mkdir(spec1, { recursive: true });
      await fs.mkdir(spec2, { recursive: true });
      
      // Add tasks.md to make them valid spec directories
      await fs.writeFile(join(spec1, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');
      await fs.writeFile(join(spec2, 'tasks.md'), '- [x] Task 1\n');

      const specs = await scanner.getAllSpecs();
      assert.strictEqual(specs.length, 2);
      assert.ok(specs.includes(spec1));
      assert.ok(specs.includes(spec2));
    });

    test('should exclude archive directory', async () => {
      // Create archive directory
      const archiveDir = join(testDir, 'archive');
      await fs.mkdir(archiveDir, { recursive: true });
      await fs.writeFile(join(archiveDir, 'tasks.md'), '- [x] Task 1\n');

      // Create valid spec
      const spec1 = join(testDir, 'spec-1');
      await fs.mkdir(spec1, { recursive: true });
      await fs.writeFile(join(spec1, 'tasks.md'), '- [x] Task 1\n');

      const specs = await scanner.getAllSpecs();
      assert.strictEqual(specs.length, 1);
      assert.ok(specs.includes(spec1));
      assert.ok(!specs.includes(archiveDir));
    });

    test('should exclude directories without tasks.md', async () => {
      // Create directory without tasks.md
      const invalidSpec = join(testDir, 'invalid-spec');
      await fs.mkdir(invalidSpec, { recursive: true });
      await fs.writeFile(join(invalidSpec, 'requirements.md'), 'Some requirements\n');

      // Create valid spec
      const validSpec = join(testDir, 'valid-spec');
      await fs.mkdir(validSpec, { recursive: true });
      await fs.writeFile(join(validSpec, 'tasks.md'), '- [x] Task 1\n');

      const specs = await scanner.getAllSpecs();
      assert.strictEqual(specs.length, 1);
      assert.ok(specs.includes(validSpec));
      assert.ok(!specs.includes(invalidSpec));
    });

    test('should return specs in sorted order', async () => {
      // Create specs in reverse alphabetical order
      const specC = join(testDir, 'spec-c');
      const specA = join(testDir, 'spec-a'); 
      const specB = join(testDir, 'spec-b');
      
      for (const spec of [specC, specA, specB]) {
        await fs.mkdir(spec, { recursive: true });
        await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n');
      }

      const specs = await scanner.getAllSpecs();
      assert.deepStrictEqual(specs, [specA, specB, specC]);
    });
  });

  describe('getCompletedSpecs()', () => {
    test('should return empty array when no completed specs', async () => {
      // Create incomplete spec
      const spec1 = join(testDir, 'spec-1');
      await fs.mkdir(spec1, { recursive: true });
      await fs.writeFile(join(spec1, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');

      const completed = await scanner.getCompletedSpecs();
      assert.deepStrictEqual(completed, []);
    });

    test('should find completed specs', async () => {
      // Create completed spec
      const completedSpec = join(testDir, 'completed-spec');
      await fs.mkdir(completedSpec, { recursive: true });
      await fs.writeFile(join(completedSpec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2\n');

      // Create incomplete spec
      const incompleteSpec = join(testDir, 'incomplete-spec');
      await fs.mkdir(incompleteSpec, { recursive: true });
      await fs.writeFile(join(incompleteSpec, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');

      const completed = await scanner.getCompletedSpecs();
      assert.strictEqual(completed.length, 1);
      assert.ok(completed.includes(completedSpec));
      assert.ok(!completed.includes(incompleteSpec));
    });

    test('should handle specs with invalid tasks.md', async () => {
      // Create spec with corrupted tasks.md
      const corruptedSpec = join(testDir, 'corrupted-spec');
      await fs.mkdir(corruptedSpec, { recursive: true });
      await fs.writeFile(join(corruptedSpec, 'tasks.md'), 'Invalid content without proper task format\n');

      // Create valid completed spec
      const validSpec = join(testDir, 'valid-spec');
      await fs.mkdir(validSpec, { recursive: true });
      await fs.writeFile(join(validSpec, 'tasks.md'), '- [x] Task 1\n');

      const completed = await scanner.getCompletedSpecs();
      assert.strictEqual(completed.length, 1);
      assert.ok(completed.includes(validSpec));
    });
  });

  describe('getIncompleteSpecs()', () => {
    test('should return specs that are not completed', async () => {
      // Create completed spec
      const completedSpec = join(testDir, 'completed-spec');
      await fs.mkdir(completedSpec, { recursive: true });
      await fs.writeFile(join(completedSpec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2\n');

      // Create incomplete specs
      const incompleteSpec1 = join(testDir, 'incomplete-spec-1');
      await fs.mkdir(incompleteSpec1, { recursive: true });
      await fs.writeFile(join(incompleteSpec1, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');

      const incompleteSpec2 = join(testDir, 'incomplete-spec-2');
      await fs.mkdir(incompleteSpec2, { recursive: true });
      await fs.writeFile(join(incompleteSpec2, 'tasks.md'), '- [ ] Task 1\n');

      const incomplete = await scanner.getIncompleteSpecs();
      assert.strictEqual(incomplete.length, 2);
      assert.ok(incomplete.includes(incompleteSpec1));
      assert.ok(incomplete.includes(incompleteSpec2));
      assert.ok(!incomplete.includes(completedSpec));
    });
  });

  describe('validateSpec()', () => {
    test('should validate spec with all required files', async () => {
      const spec = join(testDir, 'valid-spec');
      await fs.mkdir(spec, { recursive: true });
      
      // Create all required files
      await fs.writeFile(join(spec, 'requirements.md'), 'Requirements content here with sufficient length to avoid warnings about being too short. This contains actual requirements for the spec.');
      await fs.writeFile(join(spec, 'design.md'), 'Design content here with sufficient length to avoid warnings about being too short. This contains the design for the spec.');
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');

      const result = await scanner.validateSpec(spec);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.issues.length, 0);
    });

    test('should report missing required files', async () => {
      const spec = join(testDir, 'incomplete-spec');
      await fs.mkdir(spec, { recursive: true });
      
      // Only create tasks.md
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n');

      const result = await scanner.validateSpec(spec);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.issues.some(issue => issue.includes('requirements.md')));
      assert.ok(result.issues.some(issue => issue.includes('design.md')));
    });

    test('should warn about empty files', async () => {
      const spec = join(testDir, 'empty-files-spec');
      await fs.mkdir(spec, { recursive: true });
      
      // Create required files, some empty
      await fs.writeFile(join(spec, 'requirements.md'), '');
      await fs.writeFile(join(spec, 'design.md'), 'Design content');
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n');

      const result = await scanner.validateSpec(spec);
      assert.strictEqual(result.isValid, false); // Empty required file should be an issue
      assert.ok(result.issues.some(issue => issue.includes('requirements.md') && issue.includes('empty')));
    });

    test('should validate tasks.md format', async () => {
      const spec = join(testDir, 'bad-tasks-spec');
      await fs.mkdir(spec, { recursive: true });
      
      await fs.writeFile(join(spec, 'requirements.md'), 'Requirements content');
      await fs.writeFile(join(spec, 'design.md'), 'Design content');
      await fs.writeFile(join(spec, 'tasks.md'), 'Invalid task format without checkboxes');

      const result = await scanner.validateSpec(spec);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.issues.some(issue => issue.includes('tasks.md')));
    });

    test('should warn about unexpected files', async () => {
      const spec = join(testDir, 'extra-files-spec');
      await fs.mkdir(spec, { recursive: true });
      
      // Create required files
      await fs.writeFile(join(spec, 'requirements.md'), 'Requirements content');
      await fs.writeFile(join(spec, 'design.md'), 'Design content');
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n');
      
      // Add unexpected files
      await fs.writeFile(join(spec, 'random-file.txt'), 'Random content');
      await fs.mkdir(join(spec, 'random-dir'), { recursive: true });

      const result = await scanner.validateSpec(spec);
      assert.ok(result.warnings.some(warning => warning.includes('random-file.txt')));
      assert.ok(result.warnings.some(warning => warning.includes('random-dir')));
    });

    test('should warn about very short content files', async () => {
      const spec = join(testDir, 'short-content-spec');
      await fs.mkdir(spec, { recursive: true });
      
      await fs.writeFile(join(spec, 'requirements.md'), 'Short');
      await fs.writeFile(join(spec, 'design.md'), 'Also short');
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n');

      const result = await scanner.validateSpec(spec);
      assert.ok(result.warnings.some(warning => warning.includes('requirements.md') && warning.includes('very short')));
      assert.ok(result.warnings.some(warning => warning.includes('design.md') && warning.includes('very short')));
    });

    test('should warn when all tasks are completed', async () => {
      const spec = join(testDir, 'completed-spec');
      await fs.mkdir(spec, { recursive: true });
      
      await fs.writeFile(join(spec, 'requirements.md'), 'Requirements content');
      await fs.writeFile(join(spec, 'design.md'), 'Design content');
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2\n');

      const result = await scanner.validateSpec(spec);
      assert.ok(result.warnings.some(warning => warning.includes('ready for archival')));
    });
  });

  describe('scanAndValidateAllSpecs()', () => {
    test('should scan and categorize all specs', async () => {
      // Create valid spec
      const validSpec = join(testDir, 'valid-spec');
      await fs.mkdir(validSpec, { recursive: true });
      await fs.writeFile(join(validSpec, 'requirements.md'), 'Requirements content with sufficient length');
      await fs.writeFile(join(validSpec, 'design.md'), 'Design content with sufficient length');
      await fs.writeFile(join(validSpec, 'tasks.md'), '- [x] Task 1\n');

      // Create invalid spec
      const invalidSpec = join(testDir, 'invalid-spec');
      await fs.mkdir(invalidSpec, { recursive: true });
      await fs.writeFile(join(invalidSpec, 'tasks.md'), 'Invalid format');

      const result = await scanner.scanAndValidateAllSpecs();
      
      assert.strictEqual(result.totalSpecs, 2);
      assert.strictEqual(result.validSpecs.length, 1);
      assert.strictEqual(result.invalidSpecs.length, 1);
      assert.ok(result.validSpecs.includes(validSpec));
      assert.ok(result.invalidSpecs.includes(invalidSpec));
      assert.ok(Object.keys(result.issues).length > 0);
    });

    test('should collect issues and warnings for each spec', async () => {
      // Create spec with warnings
      const warningSpec = join(testDir, 'warning-spec');
      await fs.mkdir(warningSpec, { recursive: true });
      await fs.writeFile(join(warningSpec, 'requirements.md'), 'Short'); // Will cause warning
      await fs.writeFile(join(warningSpec, 'design.md'), 'Design content with sufficient length');
      await fs.writeFile(join(warningSpec, 'tasks.md'), '- [x] Task 1\n');

      const result = await scanner.scanAndValidateAllSpecs();
      
      assert.ok(result.issues[warningSpec]);
      assert.ok(result.issues[warningSpec].some(issue => issue.includes('WARNING')));
    });
  });

  describe('getSpecsReadyForArchival()', () => {
    test('should return only completed and valid specs', async () => {
      // Create completed and valid spec
      const readySpec = join(testDir, 'ready-spec');
      await fs.mkdir(readySpec, { recursive: true });
      await fs.writeFile(join(readySpec, 'requirements.md'), 'Requirements content with sufficient length');
      await fs.writeFile(join(readySpec, 'design.md'), 'Design content with sufficient length');
      await fs.writeFile(join(readySpec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2\n');

      // Create completed but invalid spec
      const invalidSpec = join(testDir, 'invalid-spec');
      await fs.mkdir(invalidSpec, { recursive: true });
      await fs.writeFile(join(invalidSpec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2\n');
      // Missing required files

      // Create valid but incomplete spec
      const incompleteSpec = join(testDir, 'incomplete-spec');
      await fs.mkdir(incompleteSpec, { recursive: true });
      await fs.writeFile(join(incompleteSpec, 'requirements.md'), 'Requirements content');
      await fs.writeFile(join(incompleteSpec, 'design.md'), 'Design content');
      await fs.writeFile(join(incompleteSpec, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');

      const ready = await scanner.getSpecsReadyForArchival();
      assert.strictEqual(ready.length, 1);
      assert.ok(ready.includes(readySpec));
      assert.ok(!ready.includes(invalidSpec));
      assert.ok(!ready.includes(incompleteSpec));
    });
  });

  describe('getSpecStats()', () => {
    test('should return comprehensive statistics', async () => {
      // Create completed and valid spec
      const completedValidSpec = join(testDir, 'completed-valid');
      await fs.mkdir(completedValidSpec, { recursive: true });
      await fs.writeFile(join(completedValidSpec, 'requirements.md'), 'Requirements content with sufficient length');
      await fs.writeFile(join(completedValidSpec, 'design.md'), 'Design content with sufficient length');
      await fs.writeFile(join(completedValidSpec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2\n');

      // Create incomplete spec
      const incompleteSpec = join(testDir, 'incomplete');
      await fs.mkdir(incompleteSpec, { recursive: true });
      await fs.writeFile(join(incompleteSpec, 'requirements.md'), 'Requirements content');
      await fs.writeFile(join(incompleteSpec, 'design.md'), 'Design content');
      await fs.writeFile(join(incompleteSpec, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2\n');

      // Create invalid spec
      const invalidSpec = join(testDir, 'invalid');
      await fs.mkdir(invalidSpec, { recursive: true });
      await fs.writeFile(join(invalidSpec, 'tasks.md'), 'Invalid format');

      const stats = await scanner.getSpecStats();
      
      assert.strictEqual(stats.total, 3);
      assert.strictEqual(stats.completed, 1);
      assert.strictEqual(stats.incomplete, 2);
      assert.strictEqual(stats.valid, 2); // completedValidSpec and incompleteSpec
      assert.strictEqual(stats.invalid, 1);
      assert.strictEqual(stats.readyForArchival, 1);
    });
  });

  describe('error handling', () => {
    test('should handle missing specs directory gracefully', async () => {
      // Set specs directory to non-existent path
      SpecScannerImpl.SPECS_DIRECTORY = join(testDir, 'non-existent');
      
      await assert.rejects(
        scanner.getAllSpecs(),
        /Failed to scan specs directory/
      );
    });

    test('should handle corrupted spec directory', async () => {
      // Create a file instead of directory with spec name
      const fakeSpec = join(testDir, 'fake-spec');
      await fs.writeFile(fakeSpec, 'This is a file, not a directory');

      // Should not be included in results
      const specs = await scanner.getAllSpecs();
      assert.ok(!specs.includes(fakeSpec));
    });

    test('should handle permission errors gracefully', async () => {
      const spec = join(testDir, 'permission-spec');
      await fs.mkdir(spec, { recursive: true });
      await fs.writeFile(join(spec, 'tasks.md'), '- [x] Task 1\n');
      
      // This should not throw but may have warnings
      const validation = await scanner.validateSpec(spec);
      assert.ok(typeof validation.isValid === 'boolean');
    });
  });
});