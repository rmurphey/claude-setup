/**
 * Tests for docs.js script
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

describe('docs.js', () => {
  let tempDir;
  let originalCwd;
  let restoreExecSync;
  
  // Setup before tests
  beforeEach = () => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    // Create a test structure
    createTestStructure(tempDir, {
      'README.md': '# Test Project\n[![Commands](https://img.shields.io/badge/commands-5-green)]()',
      'docs/TEST.md': '# Test Doc\n[Link](../README.md)',
      'docs/GUIDE.md': '# Guide\n```js\nconsole.log("test");\n```',
      '.claude/commands/test1.md': '---\ndescription: Test command 1\n---\n# Test 1',
      '.claude/commands/test2.md': '---\ndescription: Test command 2\n---\n# Test 2',
      'scripts/docs.js': fs.readFileSync(path.join(__dirname, '../scripts/docs.js'), 'utf8')
    });
    
    // Mock execSync
    restoreExecSync = mockExecSync({
      'find docs': 'docs/TEST.md\ndocs/GUIDE.md\n',
      'find . -name "*.md"': 'README.md\ndocs/TEST.md\ndocs/GUIDE.md\n',
      'wc -l': '100',
      'git log': '5 minutes ago'
    });
  };
  
  // Cleanup after tests
  afterEach = () => {
    restoreExecSync();
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  };
  
  it('should show help when no arguments provided', () => {
    const result = captureOutput(() => {
      mockArgv([], () => {
        require(path.join(tempDir, 'scripts/docs.js'));
      });
    });
    
    assertOutputContains(result.output, 'Documentation Commands');
    assertOutputContains(result.output, '/docs update');
    assertOutputContains(result.output, '/docs validate');
  });
  
  it('should count commands correctly', () => {
    const result = captureOutput(() => {
      mockArgv(['stats'], () => {
        require(path.join(tempDir, 'scripts/docs.js'));
      });
    });
    
    assertOutputContains(result.output, 'Core commands: 2');
  });
  
  it('should update README command count', () => {
    mockArgv(['update'], () => {
      require(path.join(tempDir, 'scripts/docs.js'));
    });
    
    const readme = fs.readFileSync(path.join(tempDir, 'README.md'), 'utf8');
    assert.ok(readme.includes('commands-2'), 'README should be updated with correct count');
  });
  
  it('should validate internal links', () => {
    // Add a broken link
    fs.writeFileSync(
      path.join(tempDir, 'docs/BROKEN.md'),
      '[Broken](nonexistent.md)'
    );
    
    const result = captureOutput(() => {
      mockArgv(['validate'], () => {
        require(path.join(tempDir, 'scripts/docs.js'));
      });
    });
    
    assertOutputContains(result.output, 'Broken link');
  });
  
  it('should show command catalog', () => {
    const result = captureOutput(() => {
      mockArgv(['catalog'], () => {
        require(path.join(tempDir, 'scripts/docs.js'));
      });
    });
    
    assertOutputContains(result.output, '/test1');
    assertOutputContains(result.output, 'Test command 1');
    assertOutputContains(result.output, '/test2');
    assertOutputContains(result.output, 'Test command 2');
  });
  
  it('should show statistics', () => {
    const result = captureOutput(() => {
      mockArgv(['stats'], () => {
        require(path.join(tempDir, 'scripts/docs.js'));
      });
    });
    
    assertOutputContains(result.output, 'Documentation Statistics');
    assertOutputContains(result.output, 'Files in docs/: 2');
    assertOutputContains(result.output, 'Code examples:');
  });
});

// Run setup/teardown
if (typeof beforeEach === 'function') beforeEach();
if (typeof afterEach === 'function') {
  process.on('exit', afterEach);
}