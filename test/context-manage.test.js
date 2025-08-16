/**
 * Tests for context-manage.js script
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

describe('context-manage.js', () => {
  let tempDir;
  let originalCwd;
  let restoreExecSync;
  
  beforeEach = () => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    createTestStructure(tempDir, {
      'ACTIVE_WORK.md': '# Tasks\n- [ ] Task 1\n- [ ] Task 2',
      'src/test.js': 'console.log("test");',
      'docs/guide.md': '# Guide',
      'scripts/context-manage.js': fs.readFileSync(
        path.join(__dirname, '../scripts/context-manage.js'), 'utf8'
      )
    });
    
    restoreExecSync = mockExecSync({
      'find . -type f': 'src/test.js\ndocs/guide.md\n',
      'git status': '2 files',
      'wc -l': '10'
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
        require(path.join(tempDir, 'scripts/context-manage.js'));
      });
    });
    
    assertOutputContains(result.output, 'Context Management Commands');
    assertOutputContains(result.output, '/context status');
  });
  
  it('should show status', () => {
    const result = captureOutput(() => {
      mockArgv(['status'], () => {
        require(path.join(tempDir, 'scripts/context-manage.js'));
      });
    });
    
    assertOutputContains(result.output, 'Context Window Status');
    assertOutputContains(result.output, 'Active tasks: 2');
  });
  
  it('should provide clear guidance', () => {
    const result = captureOutput(() => {
      mockArgv(['clear'], () => {
        require(path.join(tempDir, 'scripts/context-manage.js'));
      });
    });
    
    assertOutputContains(result.output, 'Clearing Context');
    assertOutputContains(result.output, 'Recommended actions');
  });
  
  it('should focus context', () => {
    const result = captureOutput(() => {
      mockArgv(['focus', 'test'], () => {
        require(path.join(tempDir, 'scripts/context-manage.js'));
      });
    });
    
    assertOutputContains(result.output, 'Focusing Context: test');
  });
});

if (typeof beforeEach === 'function') beforeEach();
if (typeof afterEach === 'function') {
  process.on('exit', afterEach);
}