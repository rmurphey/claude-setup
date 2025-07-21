import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { promises as fs } from 'fs';
import { join } from 'path';

import { SpecCompletionDetectorImpl } from '../dist/lib/spec-completion-detector.js';
import { ValidationError } from '../dist/types/archival.js';

describe('SpecCompletionDetector', () => {
  let detector;
  let testDir;
  
  beforeEach(async () => {
    detector = new SpecCompletionDetectorImpl();
    testDir = join(process.cwd(), 'test-spec-detector');
    
    // Create test directory structure
    await fs.mkdir(testDir, { recursive: true });
    await fs.mkdir(join(testDir, '.kiro', 'specs'), { recursive: true });
  });
  
  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('isTasksFileComplete', () => {
    test('should return true for all completed tasks', () => {
      const content = `# Tasks
- [x] Task 1
- [x] Task 2
- [x] Task 3`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, true);
    });

    test('should return false for incomplete tasks', () => {
      const content = `# Tasks
- [x] Task 1
- [ ] Task 2
- [x] Task 3`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, false);
    });

    test('should return false for no tasks', () => {
      const content = `# Tasks
This is just text with no tasks.`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, false);
    });

    test('should handle nested tasks correctly', () => {
      const content = `# Tasks
- [x] 1. Main task
  - [x] 1.1 Subtask
  - [x] 1.2 Another subtask
- [x] 2. Second main task`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, true);
    });

    test('should handle mixed indentation', () => {
      const content = `# Tasks
- [x] Task 1
  - [x] Subtask with spaces
\t- [x] Subtask with tab
- [x] Task 2`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, true);
    });

    test('should ignore malformed task markers', () => {
      const content = `# Tasks
- [x] Valid completed task
- [y] Invalid marker (should be ignored)
- [ ] Valid incomplete task`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, false);
    });
  });

  describe('checkSpecCompletion', () => {
    test('should return correct completion status for completed spec', async () => {
      const specPath = join(testDir, 'completed-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      const tasksContent = `# Tasks
- [x] Task 1
- [x] Task 2
- [x] Task 3`;
      
      await fs.writeFile(join(specPath, 'tasks.md'), tasksContent);
      
      const result = await detector.checkSpecCompletion(specPath);
      
      assert.strictEqual(result.isComplete, true);
      assert.strictEqual(result.totalTasks, 3);
      assert.strictEqual(result.completedTasks, 3);
      assert.ok(result.lastModified instanceof Date);
    });

    test('should return correct completion status for incomplete spec', async () => {
      const specPath = join(testDir, 'incomplete-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      const tasksContent = `# Tasks
- [x] Task 1
- [ ] Task 2
- [x] Task 3
- [ ] Task 4`;
      
      await fs.writeFile(join(specPath, 'tasks.md'), tasksContent);
      
      const result = await detector.checkSpecCompletion(specPath);
      
      assert.strictEqual(result.isComplete, false);
      assert.strictEqual(result.totalTasks, 4);
      assert.strictEqual(result.completedTasks, 2);
      assert.ok(result.lastModified instanceof Date);
    });

    test('should throw ValidationError for missing tasks.md', async () => {
      const specPath = join(testDir, 'no-tasks-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      await assert.rejects(
        () => detector.checkSpecCompletion(specPath),
        (error) => {
          assert.ok(error instanceof ValidationError);
          assert.ok(error.message.includes('Tasks file not found'));
          assert.strictEqual(error.specPath, specPath);
          return true;
        }
      );
    });

    test('should handle empty tasks file', async () => {
      const specPath = join(testDir, 'empty-tasks-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      await fs.writeFile(join(specPath, 'tasks.md'), '');
      
      const result = await detector.checkSpecCompletion(specPath);
      
      assert.strictEqual(result.isComplete, false);
      assert.strictEqual(result.totalTasks, 0);
      assert.strictEqual(result.completedTasks, 0);
    });
  });

  describe('getAllCompletedSpecs', () => {
    test('should find all completed specs', async () => {
      const specsDir = join(testDir, '.kiro', 'specs');
      
      // Create completed spec
      const completedSpec = join(specsDir, 'completed-spec');
      await fs.mkdir(completedSpec, { recursive: true });
      await fs.writeFile(join(completedSpec, 'tasks.md'), '- [x] Task 1\n- [x] Task 2');
      
      // Create incomplete spec
      const incompleteSpec = join(specsDir, 'incomplete-spec');
      await fs.mkdir(incompleteSpec, { recursive: true });
      await fs.writeFile(join(incompleteSpec, 'tasks.md'), '- [x] Task 1\n- [ ] Task 2');
      
      // Create spec without tasks.md
      const noTasksSpec = join(specsDir, 'no-tasks-spec');
      await fs.mkdir(noTasksSpec, { recursive: true });
      
      // Change to test directory to make relative paths work
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const result = await detector.getAllCompletedSpecs();
        
        assert.strictEqual(result.length, 1);
        assert.ok(result[0].includes('completed-spec'));
      } finally {
        process.chdir(originalCwd);
      }
    });

    test('should return empty array when no specs exist', async () => {
      // Change to test directory
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const result = await detector.getAllCompletedSpecs();
        assert.strictEqual(result.length, 0);
      } finally {
        process.chdir(originalCwd);
      }
    });

    test('should ignore archive directory', async () => {
      const specsDir = join(testDir, '.kiro', 'specs');
      
      // Create archive directory with completed spec
      const archiveDir = join(specsDir, 'archive');
      await fs.mkdir(archiveDir, { recursive: true });
      const archivedSpec = join(archiveDir, 'archived-spec');
      await fs.mkdir(archivedSpec, { recursive: true });
      await fs.writeFile(join(archivedSpec, 'tasks.md'), '- [x] Task 1');
      
      // Change to test directory
      const originalCwd = process.cwd();
      process.chdir(testDir);
      
      try {
        const result = await detector.getAllCompletedSpecs();
        assert.strictEqual(result.length, 0);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('validateTasksFormat', () => {
    test('should validate correct task format', () => {
      const content = `# Tasks
- [x] Completed task
- [ ] Incomplete task
  - [x] Nested completed task
  - [ ] Nested incomplete task`;
      
      const result = detector.validateTasksFormat(content);
      
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.issues.length, 0);
    });

    test('should detect empty content', () => {
      const result = detector.validateTasksFormat('');
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.issues.some(issue => issue.includes('empty')));
    });

    test('should detect missing task markers', () => {
      const content = `# Tasks
This is just text without any task markers.`;
      
      const result = detector.validateTasksFormat(content);
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.issues.some(issue => issue.includes('No valid task markers')));
    });

    test('should detect malformed task markers', () => {
      const content = `# Tasks
- [x] Valid task
- [y] Invalid marker
- [z] Another invalid marker`;
      
      const result = detector.validateTasksFormat(content);
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.issues.some(issue => issue.includes('malformed task markers')));
    });

    test('should detect tasks without list formatting', () => {
      const content = `# Tasks
[x] Task without dash
- [x] Valid task
[  ] Another task without dash`;
      
      const result = detector.validateTasksFormat(content);
      
      assert.strictEqual(result.isValid, false);
      assert.ok(result.issues.some(issue => issue.includes('without proper list formatting')));
    });
  });

  describe('getCompletionPercentage', () => {
    test('should calculate correct percentage for partial completion', async () => {
      const specPath = join(testDir, 'partial-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      const tasksContent = `# Tasks
- [x] Task 1
- [x] Task 2
- [ ] Task 3
- [ ] Task 4`;
      
      await fs.writeFile(join(specPath, 'tasks.md'), tasksContent);
      
      const percentage = await detector.getCompletionPercentage(specPath);
      assert.strictEqual(percentage, 50);
    });

    test('should return 100% for completed spec', async () => {
      const specPath = join(testDir, 'complete-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      const tasksContent = `# Tasks
- [x] Task 1
- [x] Task 2`;
      
      await fs.writeFile(join(specPath, 'tasks.md'), tasksContent);
      
      const percentage = await detector.getCompletionPercentage(specPath);
      assert.strictEqual(percentage, 100);
    });

    test('should return 0% for spec with no tasks', async () => {
      const specPath = join(testDir, 'empty-spec');
      await fs.mkdir(specPath, { recursive: true });
      
      await fs.writeFile(join(specPath, 'tasks.md'), '# Tasks\nNo tasks here.');
      
      const percentage = await detector.getCompletionPercentage(specPath);
      assert.strictEqual(percentage, 0);
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle tasks with complex text content', () => {
      const content = `# Tasks
- [x] Task with [brackets] in text
- [x] Task with "quotes" and 'apostrophes'
- [ ] Task with special chars: @#$%^&*()
- [x] Task with
  multiple lines of text`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, false); // 3 completed out of 4 total
    });

    test('should handle very long task descriptions', () => {
      const longText = 'A'.repeat(1000);
      const content = `# Tasks
- [x] ${longText}
- [x] Short task`;
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, true);
    });

    test('should handle mixed line endings', () => {
      const content = '# Tasks\r\n- [x] Windows line ending\n- [x] Unix line ending\r- [x] Mac line ending';
      
      const result = detector.isTasksFileComplete(content);
      assert.strictEqual(result, true);
    });
  });
});