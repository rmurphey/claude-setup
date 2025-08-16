/**
 * Test helpers and utilities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

/**
 * Create a temporary directory for testing
 */
function createTempDir() {
  const tempDir = path.join(os.tmpdir(), `test-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up a temporary directory
 */
function cleanupTempDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/**
 * Create a test file structure
 */
function createTestStructure(baseDir, structure) {
  Object.entries(structure).forEach(([name, content]) => {
    const fullPath = path.join(baseDir, name);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (typeof content === 'string') {
      fs.writeFileSync(fullPath, content);
    } else if (content === null) {
      // Create directory only
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
}

/**
 * Capture console output
 */
function captureOutput(fn) {
  const originalLog = console.log;
  const originalError = console.error;
  const output = [];
  const errors = [];
  
  console.log = (...args) => output.push(args.join(' '));
  console.error = (...args) => errors.push(args.join(' '));
  
  try {
    fn();
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
  
  return {
    output: output.join('\n'),
    errors: errors.join('\n')
  };
}

/**
 * Mock process.argv for testing CLI commands
 */
function mockArgv(args, fn) {
  const originalArgv = process.argv;
  process.argv = ['node', 'script.js', ...args];
  
  try {
    return fn();
  } finally {
    process.argv = originalArgv;
  }
}

/**
 * Mock execSync for testing git commands
 */
function mockExecSync(mocks = {}) {
  const child_process = require('child_process');
  const originalExecSync = child_process.execSync;
  
  child_process.execSync = (command, options) => {
    for (const [pattern, response] of Object.entries(mocks)) {
      if (command.includes(pattern)) {
        if (typeof response === 'function') {
          return response(command, options);
        }
        return response;
      }
    }
    // Default: return empty string
    return '';
  };
  
  return () => {
    child_process.execSync = originalExecSync;
  };
}

/**
 * Test that a function throws an error
 */
function assertThrows(fn, expectedMessage) {
  const assert = require('assert');
  let thrown = false;
  
  try {
    fn();
  } catch (error) {
    thrown = true;
    if (expectedMessage) {
      assert.ok(
        error.message.includes(expectedMessage),
        `Expected error to include "${expectedMessage}", got "${error.message}"`
      );
    }
  }
  
  assert.ok(thrown, 'Expected function to throw an error');
}

/**
 * Test that output contains expected text
 */
function assertOutputContains(output, expected) {
  const assert = require('assert');
  assert.ok(
    output.includes(expected),
    `Expected output to contain "${expected}"\nActual output: ${output}`
  );
}

module.exports = {
  createTempDir,
  cleanupTempDir,
  createTestStructure,
  captureOutput,
  mockArgv,
  mockExecSync,
  assertThrows,
  assertOutputContains
};