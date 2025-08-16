/**
 * Tests for tdd.js script
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
  captureOutput,
  mockArgv,
  mockExecSync,
  assertOutputContains
} = require('./test-helpers');

describe('tdd.js', () => {
  let tempDir;
  let originalCwd;
  let restoreExecSync;
  
  beforeEach = () => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    createTestStructure(tempDir, {
      'package.json': JSON.stringify({
        devDependencies: { jest: '^29.0.0' }
      }),
      'scripts/tdd.js': fs.readFileSync(
        path.join(__dirname, '../scripts/tdd.js'), 'utf8'
      )
    });
    
    restoreExecSync = mockExecSync({
      'find . -name "*.test.*"': 'src/app.test.js\n',
      'git log': 'feat: add tests',
      'npx jest': 'Tests passed'
    });
  };
  
  afterEach = () => {
    restoreExecSync();
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  };
  
  it('should show help', () => {
    const result = captureOutput(() => {
      mockArgv(['help'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'TDD (Test-Driven Development) Commands');
    assertOutputContains(result.output, '/tdd start');
  });
  
  it('should start TDD session', () => {
    const result = captureOutput(() => {
      mockArgv(['start', 'user-auth'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'Starting TDD Workflow');
    assertOutputContains(result.output, 'Feature: user-auth');
    
    // Check that tracking file was created
    const files = fs.readdirSync(tempDir);
    const tddFile = files.find(f => f.startsWith('.tdd-session-'));
    assert.ok(tddFile, 'TDD tracking file should be created');
  });
  
  it('should show red phase guidance', () => {
    const result = captureOutput(() => {
      mockArgv(['red'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'RED Phase');
    assertOutputContains(result.output, 'Write Failing Test');
  });
  
  it('should show green phase guidance', () => {
    const result = captureOutput(() => {
      mockArgv(['green'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'GREEN Phase');
    assertOutputContains(result.output, 'Make Test Pass');
  });
  
  it('should show refactor phase guidance', () => {
    const result = captureOutput(() => {
      mockArgv(['refactor'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'REFACTOR Phase');
    assertOutputContains(result.output, 'Improve Code');
  });
  
  it('should show TDD cycle overview', () => {
    const result = captureOutput(() => {
      mockArgv(['cycle'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'TDD Cycle Overview');
    assertOutputContains(result.output, 'RED');
    assertOutputContains(result.output, 'GREEN');
    assertOutputContains(result.output, 'REFACTOR');
  });
  
  it('should detect test framework', () => {
    const result = captureOutput(() => {
      mockArgv(['start', 'test-feature'], () => {
        require(path.join(tempDir, 'scripts/tdd.js'));
      });
    });
    
    assertOutputContains(result.output, 'Test Framework: jest');
  });
});

if (typeof beforeEach === 'function') beforeEach();
if (typeof afterEach === 'function') {
  process.on('exit', afterEach);
}