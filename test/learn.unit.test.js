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
    // 🔴 RED - testing setup functionality
    const learn = require('../scripts/learn');
    
    assert.ok(!fs.existsSync('LEARNINGS.md'));
    assert.ok(!fs.existsSync('.claude/learnings'));
    
    learn.ensureSetup();
    
    assert.ok(fs.existsSync('LEARNINGS.md'));
    assert.ok(fs.existsSync('.claude/learnings'));
    
    const content = fs.readFileSync('LEARNINGS.md', 'utf8');
    assert.ok(content.includes('# Project Learnings'));
    assert.ok(content.includes('## Recent Insights'));
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

// Run setup/teardown
if (typeof beforeEach === 'function') beforeEach();
if (typeof afterEach === 'function') {
  process.on('exit', afterEach);
}