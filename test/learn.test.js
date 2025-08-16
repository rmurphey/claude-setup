/**
 * Tests for learn.js script
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
  assertOutputContains
} = require('./test-helpers');

describe('learn.js', () => {
  let tempDir;
  let originalCwd;
  
  beforeEach = () => {
    tempDir = createTempDir();
    originalCwd = process.cwd();
    process.chdir(tempDir);
    
    createTestStructure(tempDir, {
      'scripts/learn.js': fs.readFileSync(
        path.join(__dirname, '../scripts/learn.js'), 'utf8'
      ),
      '.claude/learnings/': null // Create directory
    });
  };
  
  afterEach = () => {
    process.chdir(originalCwd);
    cleanupTempDir(tempDir);
  };
  
  it('should show help', () => {
    const result = captureOutput(() => {
      mockArgv(['help'], () => {
        require(path.join(tempDir, 'scripts/learn.js'));
      });
    });
    
    assertOutputContains(result.output, 'Learning Capture Commands');
    assertOutputContains(result.output, '/learn add');
  });
  
  it('should add a learning', () => {
    mockArgv(['add', 'Test insight about code'], () => {
      require(path.join(tempDir, 'scripts/learn.js'));
    });
    
    assert.ok(fs.existsSync(path.join(tempDir, 'LEARNINGS.md')));
    const content = fs.readFileSync(path.join(tempDir, 'LEARNINGS.md'), 'utf8');
    assert.ok(content.includes('Test insight about code'));
  });
  
  it('should list learnings', () => {
    // Create LEARNINGS.md first
    fs.writeFileSync(path.join(tempDir, 'LEARNINGS.md'), 
      '# Learnings\n## Recent Insights\n### 2024-01-01\nTest learning');
    
    const result = captureOutput(() => {
      mockArgv(['list'], () => {
        require(path.join(tempDir, 'scripts/learn.js'));
      });
    });
    
    assertOutputContains(result.output, 'Project Learnings');
    assertOutputContains(result.output, 'Total insights:');
  });
  
  it('should show categories', () => {
    const result = captureOutput(() => {
      mockArgv(['categories'], () => {
        require(path.join(tempDir, 'scripts/learn.js'));
      });
    });
    
    assertOutputContains(result.output, 'Learning Categories');
    assertOutputContains(result.output, 'Recent Insights');
    assertOutputContains(result.output, 'Best Practices');
  });
  
  it('should search learnings', () => {
    fs.writeFileSync(path.join(tempDir, 'LEARNINGS.md'),
      '# Learnings\n## Recent\nPerformance optimization is key');
    
    const result = captureOutput(() => {
      mockArgv(['search', 'performance'], () => {
        require(path.join(tempDir, 'scripts/learn.js'));
      });
    });
    
    assertOutputContains(result.output, 'Searching for: performance');
    assertOutputContains(result.output, 'Found');
  });
});

if (typeof beforeEach === 'function') beforeEach();
if (typeof afterEach === 'function') {
  process.on('exit', afterEach);
}