const { describe, it } = require('node:test');
/**
 * Unit tests for tdd.js functions
 * TDD approach: Red-Green-Refactor
 */

const assert = require('node:assert');

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
  
  it('should export startTDD function', () => {
    const tdd = require('../scripts/tdd');
    assert.strictEqual(typeof tdd.startTDD, 'function');
  });
  
  it('should export redPhase function', () => {
    const tdd = require('../scripts/tdd');
    assert.strictEqual(typeof tdd.redPhase, 'function');
  });
  
  it('should export greenPhase function', () => {
    const tdd = require('../scripts/tdd');
    assert.strictEqual(typeof tdd.greenPhase, 'function');
  });
  
  it('should export refactorPhase function', () => {
    const tdd = require('../scripts/tdd');
    assert.strictEqual(typeof tdd.refactorPhase, 'function');
  });
  
  it('should handle TDD workflow phases', () => {
    const tdd = require('../scripts/tdd');
    const fs = require('node:fs');
    const path = require('node:path');
    const testDir = path.join(require('os').tmpdir(), 'tdd-test-' + Date.now());
    fs.mkdirSync(testDir, { recursive: true });
    const cwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create mock package.json
      fs.writeFileSync('package.json', JSON.stringify({
        name: 'test-project',
        scripts: { test: 'node --test' }
      }));
      
      // Capture console output
      const originalLog = console.log;
      let output = '';
      console.log = (msg) => { output += msg + '\n'; };
      
      // Test red phase
      tdd.redPhase('test feature');
      assert.ok(output.includes('RED') || output.includes('red') || output.includes('failing'));
      
      // Test green phase
      output = '';
      tdd.greenPhase('test feature');
      assert.ok(output.includes('GREEN') || output.includes('green') || output.includes('pass'));
      
      // Test refactor phase
      output = '';
      tdd.refactorPhase('test feature');
      assert.ok(output.includes('REFACTOR') || output.includes('refactor') || output.includes('clean'));
      
      console.log = originalLog;
    } finally {
      process.chdir(cwd);
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });
});