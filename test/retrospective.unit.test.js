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
      assert(result.total === 5, 'Should count 5 commits');
      assert(result.types, 'Should categorize commit types');
      assert(result.types.feat === 2, 'Should find 2 feature commits');
      assert(result.types.fix === 1, 'Should find 1 fix commit');
      assert(result.types.docs === 1, 'Should find 1 docs commit');
      assert(result.types.refactor === 1, 'Should find 1 refactor commit');
    });
    
    it('should handle empty git history', () => {
      mockGitOutput = {
        gitLog: ''
      };
      
      const result = retro.analyzeGitHistory();
      
      assert(result.total === 0, 'Should handle empty history');
      assert(result.commits.length === 0, 'Should return empty commits array');
    });
  });
  
  describe('analyzeFileChanges', () => {
    it('should analyze file changes', () => {
      mockGitOutput = {
        gitDiff: ' src/Button.jsx | 25 +++\n src/api.js | 10 +-\n test/Button.test.js | 50 ++++\n 3 files changed, 75 insertions(+), 10 deletions(-)'
      };
      
      const result = retro.analyzeFileChanges();
      
      assert(result.stats, 'Should return stats');
      assert(result.filesChanged === 3, 'Should count 3 files changed');
      assert(result.insertions === 75, 'Should count insertions');
      assert(result.deletions === 10, 'Should count deletions');
    });
    
    it('should handle no changes', () => {
      mockGitOutput = {
        gitDiff: ''
      };
      
      const result = retro.analyzeFileChanges();
      
      assert(result.filesChanged === 0, 'Should handle no changes');
    });
  });
  
  describe('generateSummary', () => {
    it('should generate insights from analysis', () => {
      const gitHistory = {
        total: 10,
        commits: [
          { hash: 'abc123', type: 'feat', message: 'add feature' },
          { hash: 'def456', type: 'fix', message: 'fix bug' }
        ],
        types: { feat: 5, fix: 3, docs: 2 }
      };
      
      const fileChanges = {
        filesChanged: 15,
        insertions: 200,
        deletions: 50,
        stats: ' 15 files changed, 200 insertions(+), 50 deletions(-)'
      };
      
      const result = retro.generateSummary(gitHistory, fileChanges);
      
      assert(Array.isArray(result.insights), 'Should return insights array');
      assert(result.insights.length > 0, 'Should generate insights');
      assert(result.focus, 'Should identify focus area');
      assert(result.metrics, 'Should include metrics');
    });
    
    it('should handle feature-heavy development', () => {
      const gitHistory = {
        total: 10,
        commits: [],
        types: { feat: 8, fix: 1, docs: 1 }
      };
      
      const fileChanges = {
        filesChanged: 20,
        insertions: 500,
        deletions: 100
      };
      
      const result = retro.generateSummary(gitHistory, fileChanges);
      
      assert(result.focus.includes('feature') || result.focus.includes('Feature'), 
             'Should identify feature development focus');
    });
    
    it('should handle bug-fixing session', () => {
      const gitHistory = {
        total: 10,
        commits: [],
        types: { feat: 1, fix: 7, test: 2 }
      };
      
      const fileChanges = {
        filesChanged: 10,
        insertions: 100,
        deletions: 80
      };
      
      const result = retro.generateSummary(gitHistory, fileChanges);
      
      assert(result.focus.includes('fix') || result.focus.includes('Fix') || result.focus.includes('bug'),
             'Should identify bug fixing focus');
    });
  });
  
  describe('runCommand', () => {
    it('should handle command execution', () => {
      const result = retro.runCommand('echo "test"');
      assert(result === '', 'Should execute command'); // Our mock returns empty string
    });
    
    it('should handle command failure gracefully', () => {
      // Mock a failing command
      require('child_process').execSync = () => {
        throw new Error('Command failed');
      };
      
      const result = retro.runCommand('failing-command');
      assert(result === '', 'Should return empty string on failure');
    });
  });
});