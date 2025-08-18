const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

/**
 * TDD RED Phase - Tests for ESLint compliance in session-history.js
 * These tests should fail initially and pass after fixing lint issues
 */

describe('session-history.js ESLint compliance', () => {
  const filePath = path.join(__dirname, '..', 'scripts', 'session-history.js');
  let fileContent;

  // Read the file once before all tests
  it('should load the session-history.js file', () => {
    assert.ok(fs.existsSync(filePath), 'session-history.js should exist');
    fileContent = fs.readFileSync(filePath, 'utf8');
    assert.ok(fileContent.length > 0, 'File should have content');
  });

  it('should use single quotes instead of double quotes for strings', () => {
    // Check lines that were reported with double quote issues
    const lines = fileContent.split('\n');
    
    // Line 199 (0-indexed would be 198)
    assert.ok(!lines[198]?.includes('"test"'), 'Line 199 should not contain double quotes');
    
    // Line 227
    assert.ok(!lines[226]?.includes('"test"'), 'Line 227 should not contain double quotes');
    
    // Line 233
    assert.ok(!lines[232]?.includes('"test"'), 'Line 233 should not contain double quotes');
    
    // Line 238
    assert.ok(!lines[237]?.includes('"test"'), 'Line 238 should not contain double quotes');
    
    // Line 245
    assert.ok(!lines[244]?.includes('"test"'), 'Line 245 should not contain double quotes');
  });

  it('should not have unused variables', () => {
    const lines = fileContent.split('\n');
    
    // Line 125 - check for unused 'e' in catch block
    const line125 = lines[124];
    if (line125?.includes('catch')) {
      // If it's a catch block with (e), it should use the error or have empty parens
      assert.ok(
        !line125.includes('catch (e)') || 
        fileContent.includes('console.error(e)') ||
        line125.includes('catch ()'),
        'Line 125: catch block should either use the error or have empty parentheses'
      );
    }
    
    // Line 180 - check for unused 'metadata' variable
    const line180 = lines[179];
    if (line180?.includes('metadata')) {
      // Check if metadata is used somewhere after being assigned
      const afterLine180 = lines.slice(180).join('\n');
      assert.ok(
        afterLine180.includes('metadata') || !line180.includes('const metadata'),
        'Line 180: metadata variable should be used if defined'
      );
    }
  });

  it('should pass ESLint with no errors', async () => {
    // This test will run eslint and check for zero exit code
    const { execSync } = require('child_process');
    
    try {
      execSync('npx eslint scripts/session-history.js', { 
        encoding: 'utf8',
        stdio: 'pipe' 
      });
      assert.ok(true, 'ESLint passed with no errors');
    } catch (error) {
      assert.fail(`ESLint found errors: ${error.stdout || error.message}`);
    }
  });
});