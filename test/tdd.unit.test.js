/**
 * Unit tests for tdd.js functions
 * TDD approach: Red-Green-Refactor
 */

const assert = require('assert');

describe('tdd.js unit tests', () => {
  
  it('should export detectTestFramework function', () => {
    // 🔴 RED - function not exported yet
    const tdd = require('../scripts/tdd');
    assert.strictEqual(typeof tdd.detectTestFramework, 'function');
  });
  
  it('should detect jest framework', () => {
    // 🔴 RED - testing framework detection
    const tdd = require('../scripts/tdd');
    
    const mockPackageJson = {
      devDependencies: { jest: '^29.0.0' }
    };
    
    const framework = tdd.detectTestFramework(mockPackageJson);
    assert.strictEqual(framework, 'jest');
  });
  
  it('should detect vitest framework', () => {
    // 🔴 RED
    const tdd = require('../scripts/tdd');
    
    const mockPackageJson = {
      devDependencies: { vitest: '^0.34.0' }
    };
    
    const framework = tdd.detectTestFramework(mockPackageJson);
    assert.strictEqual(framework, 'vitest');
  });
  
  it('should export getTestCommand function', () => {
    // 🔴 RED - function not exported
    const tdd = require('../scripts/tdd');
    assert.strictEqual(typeof tdd.getTestCommand, 'function');
  });
  
  it('should return correct test command for jest', () => {
    // 🔴 RED - testing command generation
    const tdd = require('../scripts/tdd');
    
    const command = tdd.getTestCommand('jest');
    assert.strictEqual(command, 'npx jest --watch');
  });
  
  it('should return correct test command for vitest', () => {
    // 🔴 RED
    const tdd = require('../scripts/tdd');
    
    const command = tdd.getTestCommand('vitest');
    assert.strictEqual(command, 'npx vitest');
  });
});