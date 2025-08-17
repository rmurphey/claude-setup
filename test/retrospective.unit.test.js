#!/usr/bin/env node

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

describe('retrospective.js tests', () => {
  let retro;
  let originalExecSync;
  let mockGitOutput = {};
  
  beforeEach(() => {
    // Save original functions
    originalExecSync = require('child_process').execSync;
    
    // Mock execSync for git commands
    require('child_process').execSync = (cmd, options) => {
      if (cmd.includes('git log --since')) {
        return mockGitOutput.gitLog || 'abc123 feat: add new feature\ndef456 fix: resolve bug\nghi789 docs: update readme';
      }
      if (cmd.includes('git diff --stat')) {
        return mockGitOutput.gitDiff || ' 3 files changed, 45 insertions(+), 10 deletions(-)';
      }
      if (cmd.includes('git status --porcelain')) {
        return mockGitOutput.gitStatus || 'M  file1.js\nA  file2.js\n?? file3.js';
      }
      if (cmd.includes('git branch --show-current')) {
        return mockGitOutput.gitBranch || 'main';
      }
      if (cmd.includes('find . -name "*.js"')) {
        return mockGitOutput.jsFiles || './file1.js\n./file2.js\n./test/test.js';
      }
      if (cmd.includes('wc -l')) {
        return mockGitOutput.lineCount || '      150';
      }
      if (cmd.includes('git shortlog')) {
        return mockGitOutput.gitShortlog || '    10  Alice\n     5  Bob';
      }
      return '';
    };
    
    // Clear require cache and get fresh module
    delete require.cache[require.resolve('../scripts/retrospective.js')];
    retro = require('../scripts/retrospective.js');
  });
  
  afterEach(() => {
    // Restore original functions
    require('child_process').execSync = originalExecSync;
  });
  
  describe('analyzeGitHistory', () => {
    it('should analyze git commits and return stats', () => {
      mockGitOutput = {
        gitLog: 'abc123 feat: add authentication\ndef456 fix: resolve login bug\nghi789 feat: add dashboard\njkl012 docs: update API docs\nmno345 refactor: clean up utils'
      };
      
      const result = retro.analyzeGitHistory();
      
      assert(result.commits, 'Should return commits');
      assert.strictEqual(result.commits.length, 5, 'Should have 5 commits');
      assert(result.types, 'Should categorize commit types');
      assert.strictEqual(result.types.feat, 2, 'Should find 2 feature commits');
      assert.strictEqual(result.types.fix, 1, 'Should find 1 fix commit');
      assert.strictEqual(result.types.docs, 1, 'Should find 1 docs commit');
    });
    
    it('should handle empty git history', () => {
      mockGitOutput = {
        gitLog: ''
      };
      
      const result = retro.analyzeGitHistory();
      
      assert.strictEqual(result.commits.length, 0, 'Should handle empty history');
    });
  });
  
  describe('getMetrics', () => {
    it('should gather project metrics', () => {
      mockGitOutput = {
        gitDiff: ' 3 files changed, 75 insertions(+), 10 deletions(-)',
        gitStatus: 'M  file1.js\nM  file2.js',
        gitBranch: 'feature/test',
        jsFiles: './file1.js\n./file2.js\n./file3.js',
        lineCount: '      500'
      };
      
      const result = retro.getMetrics();
      
      assert(result.changedFiles, 'Should return changed files');
      assert(result.branch, 'Should return branch');
      assert.strictEqual(result.branch, 'feature/test', 'Should have correct branch');
    });
  });
  
  describe('identifyLearnings', () => {
    it('should identify patterns in commits', () => {
      const commits = [
        { hash: 'abc123', type: 'feat', message: 'add authentication', scope: 'auth' },
        { hash: 'def456', type: 'feat', message: 'add user profile', scope: 'user' },
        { hash: 'ghi789', type: 'fix', message: 'fix login bug', scope: 'auth' },
        { hash: 'jkl012', type: 'test', message: 'add auth tests', scope: 'auth' },
        { hash: 'mno345', type: 'docs', message: 'update API docs', scope: 'api' }
      ];
      
      const result = retro.identifyLearnings(commits);
      
      assert(result.patterns, 'Should identify patterns');
      assert(result.learnings, 'Should generate learnings');
      assert(Array.isArray(result.learnings), 'Learnings should be an array');
    });
    
    it('should handle empty commits', () => {
      const result = retro.identifyLearnings([]);
      
      assert(result.patterns, 'Should handle empty commits');
      assert(result.learnings, 'Should have learnings property');
    });
  });
  
  describe('runCommand', () => {
    it('should handle command execution', () => {
      const result = retro.runCommand('echo "test"');
      assert.strictEqual(result, '', 'Should execute command'); // Our mock returns empty string
    });
    
    it('should handle command failure gracefully', () => {
      // Mock a failing command
      require('child_process').execSync = () => {
        throw new Error('Command failed');
      };
      
      const result = retro.runCommand('failing-command');
      assert.strictEqual(result, '', 'Should return empty string on failure');
    });
  });
});