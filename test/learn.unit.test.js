const { describe, it } = require('node:test');
/**
 * Unit tests for learn.js functions
 * TDD approach: Red-Green-Refactor
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
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
  
  it('should export addLearning function', () => {
    const learn = require('../scripts/learn');
    assert.strictEqual(typeof learn.addLearning, 'function');
  });
  
  it('should add learning to file', () => {
    const learn = require('../scripts/learn');
    const testDir = path.join(require('os').tmpdir(), 'learn-add-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      learn.ensureSetup();
      learn.addLearning('Test learning insight');
      
      const content = fs.readFileSync('LEARNINGS.md', 'utf8');
      assert.ok(content.includes('Test learning insight'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  it('should export listLearnings function', () => {
    const learn = require('../scripts/learn');
    assert.strictEqual(typeof learn.listLearnings, 'function');
  });
  
  it('should list recent learnings', () => {
    const learn = require('../scripts/learn');
    const testDir = path.join(require('os').tmpdir(), 'learn-list-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      learn.ensureSetup();
      learn.addLearning('First learning');
      learn.addLearning('Second learning');
      
      // Capture console output
      const originalLog = console.log;
      let output = '';
      console.log = (msg) => { output += msg + '\n'; };
      
      learn.listLearnings(2);
      
      console.log = originalLog;
      
      assert.ok(output.includes('First learning') || output.includes('Second learning'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  it('should export searchLearnings function', () => {
    const learn = require('../scripts/learn');
    assert.strictEqual(typeof learn.searchLearnings, 'function');
  });
  
  it('should search learnings by keyword', () => {
    const learn = require('../scripts/learn');
    const testDir = path.join(require('os').tmpdir(), 'learn-search-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      learn.ensureSetup();
      learn.addLearning('Testing with Jest is great');
      learn.addLearning('Mocha is another option');
      
      // Capture console output
      const originalLog = console.log;
      let output = '';
      console.log = (msg) => { output += msg + '\n'; };
      
      learn.searchLearnings('Jest');
      
      console.log = originalLog;
      
      assert.ok(output.includes('Jest'));
      assert.ok(!output.includes('Mocha'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});

// Note: Setup/teardown handled by test runner