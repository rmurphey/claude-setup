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
    // RED phase - this will fail because function is not accessible
    const docs = require('../scripts/docs');
    const count = docs.countCommands();
    assert.strictEqual(typeof count, 'number');
    assert.ok(count >= 0);
  });
  
});