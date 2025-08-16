const { describe, it } = require('node:test');
/**
 * Unit tests for context-manage.js functions
 * TDD approach: Red-Green-Refactor
 */

const assert = require('node:assert');

describe('context-manage.js unit tests', () => {
  
  it('should export formatBytes function', () => {
    // 🔴 RED - function not exported yet
    const context = require('../scripts/context-manage');
    assert.strictEqual(typeof context.formatBytes, 'function');
  });
  
  it('should format bytes correctly', () => {
    // 🔴 RED - testing byte formatting logic
    const context = require('../scripts/context-manage');
    
    assert.strictEqual(context.formatBytes(0), '0 B');
    assert.strictEqual(context.formatBytes(512), '512 B');
    assert.strictEqual(context.formatBytes(1024), '1.0 KB');
    assert.strictEqual(context.formatBytes(1536), '1.5 KB');
    assert.strictEqual(context.formatBytes(1048576), '1.0 MB');
    assert.strictEqual(context.formatBytes(5242880), '5.0 MB');
  });
  
  it('should export estimateTokens function', () => {
    // 🔴 RED - function not exported
    const context = require('../scripts/context-manage');
    assert.strictEqual(typeof context.estimateTokens, 'function');
  });
  
  it('should estimate tokens from text', () => {
    // 🔴 RED - testing token estimation
    const context = require('../scripts/context-manage');
    
    // ~4 characters per token is the rough estimate
    assert.strictEqual(context.estimateTokens('test'), 1);
    assert.strictEqual(context.estimateTokens('hello world'), 3);
    assert.strictEqual(context.estimateTokens('a'.repeat(100)), 25);
  });
});