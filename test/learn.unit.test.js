/**
 * Unit tests for learn.js functions
 * TDD approach: Red-Green-Refactor
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { createTempDir, cleanupTempDir } = require('./test-helpers');

describe('learn.js unit tests', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach = () => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
  };
  
  afterEach = () => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  };
  
  it('should export ensureSetup function', () => {
    // 🔴 RED - function not exported yet
    const learn = require('../scripts/learn');
    assert.strictEqual(typeof learn.ensureSetup, 'function');
  });
  
  it('should create LEARNINGS.md and directory structure', () => {
    // Test in a temp directory
    const learn = require('../scripts/learn');
    const testDir = path.join(require('os').tmpdir(), 'learn-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      assert.ok(!fs.existsSync('LEARNINGS.md'));
      assert.ok(!fs.existsSync('.claude/learnings'));
      
      learn.ensureSetup();
      
      assert.ok(fs.existsSync('LEARNINGS.md'));
      assert.ok(fs.existsSync('.claude/learnings'));
      
      const content = fs.readFileSync('LEARNINGS.md', 'utf8');
      assert.ok(content.includes('# Project Learnings'));
      assert.ok(content.includes('## Recent Insights'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  it('should export formatLearningEntry function', () => {
    // 🔴 RED - function not exported
    const learn = require('../scripts/learn');
    assert.strictEqual(typeof learn.formatLearningEntry, 'function');
  });
  
  it('should format learning entries correctly', () => {
    // 🔴 RED - testing entry formatting
    const learn = require('../scripts/learn');
    
    const entry = learn.formatLearningEntry('Test insight', '2024-01-15', '14:30');
    assert.ok(entry.includes('### 2024-01-15 - 14:30'));
    assert.ok(entry.includes('Test insight'));
  });
});

// Note: Setup/teardown handled by test runner