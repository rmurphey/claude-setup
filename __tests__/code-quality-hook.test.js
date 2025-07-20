import { test, describe } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';

import { QualityLevelManager } from '../lib/lib/quality-levels.js';

describe('Code Quality Hook', () => {
  test('QualityLevelManager can get current level', async () => {
    const manager = new QualityLevelManager();
    const level = await manager.getCurrentLevel();
    assert.ok(['strict', 'standard', 'relaxed'].includes(level));
  });

  test('QualityLevelManager can get available levels', async () => {
    const manager = new QualityLevelManager();
    const levels = await manager.getAvailableLevels();
    
    assert.strictEqual(levels.length, 3);
    assert.ok(levels.some(l => l.value === 'strict'));
    assert.ok(levels.some(l => l.value === 'standard'));
    assert.ok(levels.some(l => l.value === 'relaxed'));
  });

  test('ESLint configuration validates import/export rules', () => {
    const testFile = 'test-temp-quality.js';
    const badCode = `import fs from 'fs'
import path from 'path'
export function test() { console.log("bad") }`;
    
    try {
      writeFileSync(testFile, badCode);
      
      // This should fail due to missing semicolons and wrong quotes
      try {
        execSync(`npx eslint ${testFile}`, { stdio: 'pipe' });
        assert.fail('ESLint should have found errors');
      } catch (error) {
        // Expected to fail - ESLint found issues
        assert.ok(error.stdout.toString().includes('Missing semicolon'));
      }
    } finally {
      if (existsSync(testFile)) {
        unlinkSync(testFile);
      }
    }
  });

  test('ESLint auto-fix works correctly', async () => {
    const testFile = 'test-temp-autofix.js';
    const badCode = `import fs from 'fs'
export function test() { console.log("bad") }`;
    
    try {
      writeFileSync(testFile, badCode);
      
      // Run auto-fix - expect it to fail due to unused vars but still apply fixes
      try {
        execSync(`npx eslint ${testFile} --fix`, { stdio: 'pipe' });
      } catch (error) {
        // Expected to fail due to unused 'fs' import, but fixes should still be applied
      }
      
      // Verify fixes were applied
      const { readFileSync } = await import('fs');
      const fixedCode = readFileSync(testFile, 'utf8');
      assert.ok(fixedCode.includes('import fs from \'fs\';'));
      assert.ok(fixedCode.includes('console.log(\'bad\');'));
    } finally {
      if (existsSync(testFile)) {
        unlinkSync(testFile);
      }
    }
  });

  test('lint-staged configuration exists', async () => {
    const { readFileSync } = await import('fs');
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    assert.ok(packageJson['lint-staged']);
    assert.ok(packageJson['lint-staged']['*.{js,mjs,cjs,ts}']);
  });
});