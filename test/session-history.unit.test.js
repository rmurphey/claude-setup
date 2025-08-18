const { describe, it } = require('node:test');
/**
 * Unit tests for session-history.js functions
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('session-history.js unit tests', () => {
  
  it('should export saveSession function', () => {
    const sessionHistory = require('../scripts/session-history');
    assert.strictEqual(typeof sessionHistory.saveSession, 'function');
  });
  
  it('should save session to file with git data', () => {
    // Temporarily allow saves for this specific test
    const originalSkip = process.env.SKIP_SESSION_SAVE;
    delete process.env.SKIP_SESSION_SAVE;
    
    const sessionHistory = require('../scripts/session-history');
    const testDir = path.join(require('os').tmpdir(), 'session-save-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Initialize a test git repo
      require('child_process').execSync('git init', { stdio: 'ignore' });
      require('child_process').execSync('git config user.email "test@test.com"', { stdio: 'ignore' });
      require('child_process').execSync('git config user.name "Test User"', { stdio: 'ignore' });
      
      const sessionFile = sessionHistory.saveSession('Test session content');
      assert.ok(fs.existsSync(sessionFile));
      
      // Verify content includes git data
      const content = fs.readFileSync(sessionFile, 'utf8');
      assert.ok(content.includes('Claude Code Session'), 'should have header');
      assert.ok(content.includes('Git Activity'), 'should have git section');
      assert.ok(content.includes('Test Results'), 'should have test section');
      assert.ok(content.includes('Test session content'), 'should include description');
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
      // Restore original setting
      if (originalSkip) {
        process.env.SKIP_SESSION_SAVE = originalSkip;
      }
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