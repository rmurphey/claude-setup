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
    // 🔴 RED phase - testing link validation logic
    const docs = require('../scripts/docs');
    const content = '[Working](README.md)\n[Broken](nonexistent.md)';
    const brokenLinks = docs.findBrokenLinks(content, 'test.md');
    
    assert.ok(Array.isArray(brokenLinks));
    assert.strictEqual(brokenLinks.length, 1);
    assert.strictEqual(brokenLinks[0], 'nonexistent.md');
  });
  
});