/**
 * Tests for feature-check quality script
 * Validates that new features have corresponding tests and documentation
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

// Import the feature check module (TDD RED - doesn't exist yet)
const featureCheck = require('../scripts/feature-check');

describe('Feature Check Quality Script', () => {
  
  describe('Feature Detection', () => {
    it('should detect new JavaScript files as features', () => {
      const changes = [
        { status: 'A', file: 'scripts/new-feature.js' },
        { status: 'A', file: 'README.md' }
      ];
      
      const features = featureCheck.detectFeatures(changes);
      assert.strictEqual(features.length, 1);
      assert.strictEqual(features[0], 'scripts/new-feature.js');
    });
    
    it('should detect significant modifications as features', () => {
      const changes = [
        { status: 'M', file: 'scripts/existing.js', additions: 75 },
        { status: 'M', file: 'scripts/minor.js', additions: 10 }
      ];
      
      const features = featureCheck.detectFeatures(changes);
      assert.strictEqual(features.length, 1);
      assert.strictEqual(features[0], 'scripts/existing.js');
    });
    
    it('should exclude test files from feature detection', () => {
      const changes = [
        { status: 'A', file: 'test/new.test.js' },
        { status: 'A', file: 'scripts/feature.js' }
      ];
      
      const features = featureCheck.detectFeatures(changes);
      assert.strictEqual(features.length, 1);
      assert.strictEqual(features[0], 'scripts/feature.js');
    });
    
    it('should exclude documentation files from feature detection', () => {
      const changes = [
        { status: 'A', file: 'docs/NEW.md' },
        { status: 'M', file: 'README.md' },
        { status: 'A', file: '.claude/commands/new.md' }
      ];
      
      const features = featureCheck.detectFeatures(changes);
      assert.strictEqual(features.length, 0);
    });
    
    it('should exclude config files from feature detection', () => {
      const changes = [
        { status: 'M', file: 'package.json' },
        { status: 'A', file: '.eslintrc.js' },
        { status: 'M', file: 'tsconfig.json' }
      ];
      
      const features = featureCheck.detectFeatures(changes);
      assert.strictEqual(features.length, 0);
    });
  });
  
  describe('Test Coverage Verification', () => {
    it('should find corresponding test file for feature', () => {
      const feature = 'scripts/my-feature.js';
      const testFiles = [
        'test/my-feature.test.js',
        'test/other.test.js'
      ];
      
      const hasTest = featureCheck.findTestsForFeature(feature, testFiles);
      assert.ok(hasTest);
    });
    
    it('should find unit test file for feature', () => {
      const feature = 'scripts/calculator.js';
      const testFiles = [
        'test/calculator.unit.test.js',
        'test/other.test.js'
      ];
      
      const hasTest = featureCheck.findTestsForFeature(feature, testFiles);
      assert.ok(hasTest);
    });
    
    it('should detect missing tests for feature', () => {
      const feature = 'scripts/untested.js';
      const testFiles = [
        'test/other.test.js',
        'test/another.test.js'
      ];
      
      const hasTest = featureCheck.findTestsForFeature(feature, testFiles);
      assert.ok(!hasTest);
    });
    
    it('should handle features in subdirectories', () => {
      const feature = 'lib/utils/helper.js';
      const testFiles = [
        'test/utils/helper.test.js',
        'test/helper.test.js'
      ];
      
      const hasTest = featureCheck.findTestsForFeature(feature, testFiles);
      assert.ok(hasTest);
    });
  });
  
  describe('Documentation Verification', () => {
    it('should detect documentation for feature in README', () => {
      const feature = 'scripts/analyzer.js';
      const docContent = {
        'README.md': '## Analyzer\nThe analyzer script provides...'
      };
      
      const hasDocs = featureCheck.findDocsForFeature(feature, docContent);
      assert.ok(hasDocs);
    });
    
    it('should detect documentation in docs directory', () => {
      const feature = 'scripts/monitor.js';
      const docContent = {
        'docs/MONITORING.md': '# Monitor\nThe monitor script watches...'
      };
      
      const hasDocs = featureCheck.findDocsForFeature(feature, docContent);
      assert.ok(hasDocs);
    });
    
    it('should detect missing documentation', () => {
      const feature = 'scripts/undocumented.js';
      const docContent = {
        'README.md': 'Some other content',
        'docs/OTHER.md': 'Different feature docs'
      };
      
      const hasDocs = featureCheck.findDocsForFeature(feature, docContent);
      assert.ok(!hasDocs);
    });
    
    it('should check for command documentation', () => {
      const feature = 'scripts/new-command.js';
      const docContent = {
        '.claude/commands/new-command.md': 'Command documentation'
      };
      
      const hasDocs = featureCheck.findDocsForFeature(feature, docContent);
      assert.ok(hasDocs);
    });
  });
  
  describe('Bypass Mechanism', () => {
    it('should bypass check for test-only changes', () => {
      const changes = [
        { status: 'A', file: 'test/new.test.js' },
        { status: 'M', file: 'test/existing.test.js' }
      ];
      
      const shouldCheck = featureCheck.shouldRunCheck(changes);
      assert.ok(!shouldCheck);
    });
    
    it('should bypass check for docs-only changes', () => {
      const changes = [
        { status: 'M', file: 'README.md' },
        { status: 'A', file: 'docs/NEW.md' }
      ];
      
      const shouldCheck = featureCheck.shouldRunCheck(changes);
      assert.ok(!shouldCheck);
    });
    
    it('should bypass check for config-only changes', () => {
      const changes = [
        { status: 'M', file: 'package.json' },
        { status: 'M', file: '.github/workflows/test.yml' }
      ];
      
      const shouldCheck = featureCheck.shouldRunCheck(changes);
      assert.ok(!shouldCheck);
    });
    
    it('should run check for mixed changes with features', () => {
      const changes = [
        { status: 'M', file: 'README.md' },
        { status: 'A', file: 'scripts/feature.js' }
      ];
      
      const shouldCheck = featureCheck.shouldRunCheck(changes);
      assert.ok(shouldCheck);
    });
    
    it('should respect .featurecheckignore file', () => {
      const feature = 'scripts/ignored-feature.js';
      const ignorePatterns = ['scripts/ignored-*.js'];
      
      const isIgnored = featureCheck.isIgnored(feature, ignorePatterns);
      assert.ok(isIgnored);
    });
  });
  
  describe('Main Check Function', () => {
    it('should pass when features have tests and docs', () => {
      const result = featureCheck.runCheck({
        features: ['scripts/complete.js'],
        testFiles: ['test/complete.test.js'],
        docFiles: { 'README.md': 'complete feature docs' }
      });
      
      assert.ok(result.success);
      assert.strictEqual(result.errors.length, 0);
    });
    
    it('should fail when features lack tests', () => {
      const result = featureCheck.runCheck({
        features: ['scripts/untested.js'],
        testFiles: [],
        docFiles: { 'README.md': 'untested feature docs' }
      });
      
      assert.ok(!result.success);
      assert.ok(result.errors.some(e => e.includes('missing test')));
    });
    
    it('should fail when features lack documentation', () => {
      const result = featureCheck.runCheck({
        features: ['scripts/undocumented.js'],
        testFiles: ['test/undocumented.test.js'],
        docFiles: {}
      });
      
      assert.ok(!result.success);
      assert.ok(result.errors.some(e => e.includes('missing documentation')));
    });
    
    it('should provide clear error messages', () => {
      const result = featureCheck.runCheck({
        features: ['scripts/incomplete.js'],
        testFiles: [],
        docFiles: {}
      });
      
      assert.ok(!result.success);
      assert.ok(result.errors.length >= 2); // Missing test and docs
      result.errors.forEach(error => {
        assert.ok(error.includes('scripts/incomplete.js'));
      });
    });
  });
  
  describe('Git Integration', () => {
    it('should get changes from git diff', () => {
      // This will use actual git commands, so we mock or skip in unit tests
      const changes = featureCheck.getGitChanges();
      assert.ok(Array.isArray(changes));
    });
    
    it('should parse git diff output correctly', () => {
      const gitOutput = `A\tscripts/new.js
M\tscripts/existing.js
D\tscripts/deleted.js`;
      
      const changes = featureCheck.parseGitDiff(gitOutput);
      assert.strictEqual(changes.length, 3);
      assert.strictEqual(changes[0].status, 'A');
      assert.strictEqual(changes[0].file, 'scripts/new.js');
    });
    
    it('should get line additions for modified files', () => {
      const statsOutput = `scripts/feature.js | 85 +++++++++++++++++++++++++++++++------`;
      
      const additions = featureCheck.parseGitStats(statsOutput);
      assert.ok(additions['scripts/feature.js'] >= 50);
    });
  });
  
  describe('CLI Usage', () => {
    it('should export a main function for CLI use', () => {
      assert.strictEqual(typeof featureCheck.main, 'function');
    });
    
    it('should support --skip-feature-check flag', () => {
      const result = featureCheck.main(['--skip-feature-check']);
      assert.ok(result.skipped);
    });
    
    it('should return exit code 0 on success', () => {
      const result = featureCheck.main([], {
        features: [],
        testFiles: [],
        docFiles: {}
      });
      assert.strictEqual(result.exitCode, 0);
    });
    
    it('should return exit code 1 on failure', () => {
      const result = featureCheck.main([], {
        features: ['scripts/bad.js'],
        testFiles: [],
        docFiles: {}
      });
      assert.strictEqual(result.exitCode, 1);
    });
  });
});