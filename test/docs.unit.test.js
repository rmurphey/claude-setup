/**
 * Unit tests for docs.js functions
 * Following TDD approach: Red-Green-Refactor
 */

const assert = require('assert');
const path = require('path');

describe('docs.js unit tests', () => {
  
  it('should export countCommands function', () => {
    // RED phase - this will fail because countCommands is not exported
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.countCommands, 'function');
  });
  
  it('should count .md files in commands directory', () => {
    const docs = require('../scripts/docs');
    const count = docs.countCommands();
    assert.strictEqual(typeof count, 'number');
    assert.ok(count >= 0);
  });
  
  it('should export findBrokenLinks function', () => {
    // 🔴 RED phase - this will fail
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.findBrokenLinks, 'function');
  });
  
  it('should find broken links in markdown content', () => {
    const docs = require('../scripts/docs');
    const content = '[Working](README.md)\n[Broken](nonexistent.md)';
    const brokenLinks = docs.findBrokenLinks(content, 'test.md');
    
    assert.ok(Array.isArray(brokenLinks));
    assert.strictEqual(brokenLinks.length, 1);
    assert.strictEqual(brokenLinks[0], 'nonexistent.md');
  });
  
  it('should export updateAll function', () => {
    // 🔴 RED phase - testing new updateAll function
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.updateAll, 'function');
  });
  
  it('should export updateCommandCatalog function', () => {
    // 🔴 RED phase - testing new catalog function
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.updateCommandCatalog, 'function');
  });
  
  it('should generate command catalog with correct content', () => {
    // 🔴 RED phase - test catalog generation
    const docs = require('../scripts/docs');
    const fs = require('fs');
    const os = require('os');
    
    // Create test environment
    const testDir = path.join(os.tmpdir(), 'docs-test-' + Date.now());
    fs.mkdirSync(path.join(testDir, '.claude', 'commands'), { recursive: true });
    fs.mkdirSync(path.join(testDir, 'docs'), { recursive: true });
    
    // Create test command files
    fs.writeFileSync(path.join(testDir, '.claude', 'commands', 'test1.md'), 
      '---\ndescription: Test command one\n---\n# Test 1');
    fs.writeFileSync(path.join(testDir, '.claude', 'commands', 'test2.md'),
      '---\ndescription: Test command two\n---\n# Test 2');
    
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const count = docs.updateCommandCatalog();
      
      // Verify results
      assert.strictEqual(count, 2);
      assert.ok(fs.existsSync(path.join(testDir, 'docs', 'COMMAND_CATALOG.md')));
      
      const catalog = fs.readFileSync(path.join(testDir, 'docs', 'COMMAND_CATALOG.md'), 'utf8');
      assert.ok(catalog.includes('Test command one'));
      assert.ok(catalog.includes('Test command two'));
      assert.ok(catalog.includes('Total Commands: 2'));
      assert.ok(catalog.includes('### /test1'));
      assert.ok(catalog.includes('### /test2'));
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
});