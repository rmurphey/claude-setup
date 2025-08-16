const { describe, it } = require('node:test');
/**
 * Unit tests for session-history.js functions
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('session-history.js unit tests', () => {
  
  it('should export formatDelta function', () => {
    const sessionHistory = require('../scripts/session-history');
    assert.strictEqual(typeof sessionHistory.formatDelta, 'function');
  });
  
  it('should format time delta correctly', () => {
    const sessionHistory = require('../scripts/session-history');
    
    // Test various delta formats
    assert.strictEqual(sessionHistory.formatDelta(30), '30 seconds');
    assert.strictEqual(sessionHistory.formatDelta(60), '1 minute');
    assert.strictEqual(sessionHistory.formatDelta(90), '1 minute 30 seconds');
    assert.strictEqual(sessionHistory.formatDelta(3600), '1 hour');
    assert.strictEqual(sessionHistory.formatDelta(3665), '1 hour 1 minute');
    assert.strictEqual(sessionHistory.formatDelta(7200), '2 hours');
  });
  
  it('should export getSessionNumber function', () => {
    const sessionHistory = require('../scripts/session-history');
    assert.strictEqual(typeof sessionHistory.getSessionNumber, 'function');
  });
  
  it('should get next session number', () => {
    const sessionHistory = require('../scripts/session-history');
    const testDir = path.join(require('os').tmpdir(), 'session-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create session-history directory
      const sessionDir = 'session-history/2024-01-01';
      fs.mkdirSync(sessionDir, { recursive: true });
      
      // No sessions exist
      let sessionNum = sessionHistory.getSessionNumber('2024-01-01');
      assert.strictEqual(sessionNum, '001');
      
      // Create a session file
      fs.writeFileSync(path.join(sessionDir, 'session-001-120000.txt'), 'test');
      sessionNum = sessionHistory.getSessionNumber('2024-01-01');
      assert.strictEqual(sessionNum, '002');
      
      // Create another session file
      fs.writeFileSync(path.join(sessionDir, 'session-002-130000.txt'), 'test');
      sessionNum = sessionHistory.getSessionNumber('2024-01-01');
      assert.strictEqual(sessionNum, '003');
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  it('should export saveSession function', () => {
    const sessionHistory = require('../scripts/session-history');
    assert.strictEqual(typeof sessionHistory.saveSession, 'function');
  });
  
  it('should save session to file', () => {
    const sessionHistory = require('../scripts/session-history');
    const testDir = path.join(require('os').tmpdir(), 'session-save-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const sessionFile = sessionHistory.saveSession('Test session content');
      assert.ok(fs.existsSync(sessionFile));
      
      const content = fs.readFileSync(sessionFile, 'utf8');
      assert.ok(content.includes('Test session content'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  it('should export listSessions function', () => {
    const sessionHistory = require('../scripts/session-history');
    assert.strictEqual(typeof sessionHistory.listSessions, 'function');
  });
  
  it('should list sessions correctly', () => {
    const sessionHistory = require('../scripts/session-history');
    const testDir = path.join(require('os').tmpdir(), 'session-list-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create session-history directory with sessions
      const sessionDir = 'session-history/2024-01-01';
      fs.mkdirSync(sessionDir, { recursive: true });
      fs.writeFileSync(path.join(sessionDir, 'session-001-120000.txt'), 'session 1');
      fs.writeFileSync(path.join(sessionDir, 'session-002-130000.txt'), 'session 2');
      
      // Capture console output
      const originalLog = console.log;
      let output = '';
      console.log = (msg) => { output += msg + '\n'; };
      
      sessionHistory.listSessions();
      
      console.log = originalLog;
      
      assert.ok(output.includes('2024-01-01') || output.includes('session'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});