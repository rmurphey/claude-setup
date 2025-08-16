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
  
  it('should export getFileSize function', () => {
    const context = require('../scripts/context-manage');
    assert.strictEqual(typeof context.getFileSize, 'function');
  });
  
  it('should get file size correctly', () => {
    const context = require('../scripts/context-manage');
    const fs = require('node:fs');
    const path = require('node:path');
    const testDir = path.join(require('os').tmpdir(), 'context-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    
    try {
      const testFile = path.join(testDir, 'test.txt');
      const testContent = 'Hello World!';
      fs.writeFileSync(testFile, testContent);
      
      const size = context.getFileSize(testFile);
      assert.strictEqual(size, Buffer.byteLength(testContent));
    } finally {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
  
  it('should handle non-existent files gracefully', () => {
    const context = require('../scripts/context-manage');
    const size = context.getFileSize('/non/existent/file.txt');
    assert.strictEqual(size, 0);
  });
  
  it('should handle large byte values', () => {
    const context = require('../scripts/context-manage');
    assert.strictEqual(context.formatBytes(1073741824), '1.0 GB');
    assert.strictEqual(context.formatBytes(1099511627776), '1.0 TB');
  });
  
  it('should handle negative byte values', () => {
    const context = require('../scripts/context-manage');
    assert.strictEqual(context.formatBytes(-1), '0 B');
  });
});