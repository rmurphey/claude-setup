const { describe, it } = require('node:test');
/**
 * Unit tests for GitHub repository monitoring
 * TDD RED phase - all tests should fail initially
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

describe('monitor-repo.js', () => {
  // Clean up test files after tests - ONLY in test directory
  const testDir = path.join(__dirname, 'test-monitor-files');
  const testFiles = [
    path.join(testDir, '.monitor-status.json'),
    path.join(testDir, '.monitor-history.json'),
    path.join(testDir, '.monitor-config.json')
  ];
  
  function cleanupTestFiles() {
    // Only clean up test directory files, never project files
    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    // Clean up test directory if empty
    if (fs.existsSync(testDir)) {
      try {
        fs.rmdirSync(testDir);
      } catch {
        // Directory not empty, that's ok
      }
    }
  }
  
  describe('exports', () => {
    it('should export checkWorkflowStatus function', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.strictEqual(typeof monitor.checkWorkflowStatus, 'function');
    });

    it('should export checkPullRequests function', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.strictEqual(typeof monitor.checkPullRequests, 'function');
    });

    it('should export formatReport function', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.strictEqual(typeof monitor.formatReport, 'function');
    });

    it('should export startMonitoring function', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.strictEqual(typeof monitor.startMonitoring, 'function');
    });

    it('should export checkStatus function', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.strictEqual(typeof monitor.checkStatus, 'function');
    });
    
    it('should export new functions for enhanced monitoring', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.strictEqual(typeof monitor.getFailureDetails, 'function', 'should export getFailureDetails');
      assert.strictEqual(typeof monitor.loadConfig, 'function', 'should export loadConfig');
      assert.strictEqual(typeof monitor.loadHistory, 'function', 'should export loadHistory');
      assert.strictEqual(typeof monitor.saveToHistory, 'function', 'should export saveToHistory');
      assert.strictEqual(typeof monitor.isNewFailure, 'function', 'should export isNewFailure');
    });
  });

  describe('checkWorkflowStatus', () => {
    it('should return an array of workflow runs', async () => {
      const monitor = require('../scripts/monitor-repo');
      const runs = await monitor.checkWorkflowStatus();
      assert(Array.isArray(runs), 'should return an array');
    });

    it('should include status and conclusion for each run', async () => {
      const monitor = require('../scripts/monitor-repo');
      const runs = await monitor.checkWorkflowStatus();
      if (runs.length > 0) {
        assert('status' in runs[0], 'should have status field');
        assert('name' in runs[0], 'should have name field');
      }
    });
    
    it('should filter for test workflows when testsOnly option is true', async () => {
      const monitor = require('../scripts/monitor-repo');
      const runs = await monitor.checkWorkflowStatus({ testsOnly: true });
      assert(Array.isArray(runs), 'should return an array');
      // All returned runs should have 'test' in the name
      runs.forEach(run => {
        const hasTest = (run.workflowName?.toLowerCase().includes('test') || 
                        run.name?.toLowerCase().includes('test'));
        if (runs.length > 0) {
          assert(hasTest, 'filtered runs should contain "test" in name');
        }
      });
    });
  });

  describe('checkPullRequests', () => {
    it('should return an array of pull requests', async () => {
      const monitor = require('../scripts/monitor-repo');
      const prs = await monitor.checkPullRequests();
      assert(Array.isArray(prs), 'should return an array');
    });

    it('should include PR details if any exist', async () => {
      const monitor = require('../scripts/monitor-repo');
      const prs = await monitor.checkPullRequests();
      if (prs.length > 0) {
        assert('number' in prs[0], 'should have number field');
        assert('title' in prs[0], 'should have title field');
      }
    });
  });

  describe('formatReport', () => {
    it('should format status data into readable report', () => {
      const monitor = require('../scripts/monitor-repo');
      const mockStatus = {
        timestamp: new Date().toISOString(),
        workflows: [
          { name: 'Test', status: 'completed', conclusion: 'failure' }
        ],
        pullRequests: [
          { number: 123, title: 'Test PR', author: { login: 'user' } }
        ]
      };
      
      const report = monitor.formatReport(mockStatus);
      assert(typeof report === 'string', 'should return a string');
      assert(report.includes('Test'), 'should include workflow name');
      assert(report.includes('Test PR'), 'should include PR title');
    });
    
    it('should separate test failures from other failures', () => {
      const monitor = require('../scripts/monitor-repo');
      const mockStatus = {
        timestamp: new Date().toISOString(),
        workflows: [
          { name: 'Test Suite', workflowName: 'Test Suite', status: 'completed', conclusion: 'failure' },
          { name: 'Quality Checks', workflowName: 'Quality Checks', status: 'completed', conclusion: 'failure' }
        ],
        pullRequests: []
      };
      
      const report = monitor.formatReport(mockStatus);
      assert(typeof report === 'string', 'should return a string');
      // Should have separate sections for test failures
      assert(report.includes('Failed Tests') || report.includes('Failed Workflows'), 
        'should categorize failures');
    });

    it('should handle empty status gracefully', () => {
      const monitor = require('../scripts/monitor-repo');
      const emptyStatus = {
        timestamp: new Date().toISOString(),
        workflows: [],
        pullRequests: []
      };
      
      const report = monitor.formatReport(emptyStatus);
      assert(typeof report === 'string', 'should return a string');
      assert(report.includes('clean') || report.includes('no issues'), 
        'should indicate no issues');
    });
  });

  describe('checkStatus', () => {
    it('should read status from file if it exists', () => {
      const monitor = require('../scripts/monitor-repo');
      const testFile = '.monitor-status-test.json';
      const testData = {
        timestamp: new Date().toISOString(),
        workflows: [],
        pullRequests: []
      };
      
      // Write test file
      fs.writeFileSync(testFile, JSON.stringify(testData, null, 2));
      
      try {
        const status = monitor.checkStatus(testFile);
        assert.deepStrictEqual(status, testData, 'should read status correctly');
      } finally {
        // Clean up
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      }
    });

    it('should return null if status file does not exist', () => {
      const monitor = require('../scripts/monitor-repo');
      const status = monitor.checkStatus('nonexistent-file.json');
      assert.strictEqual(status, null, 'should return null for missing file');
    });
  });

  describe('startMonitoring', () => {
    it('should accept interval parameter', () => {
      const monitor = require('../scripts/monitor-repo');
      // Just test that it doesn't throw with valid params
      // We won't actually start the monitoring in tests
      assert.doesNotThrow(() => {
        const instance = monitor.startMonitoring(1000, true); // dry run mode
        if (instance && instance.stop) {
          instance.stop(); // Stop immediately if it returns a handle
        }
      });
    });
  });
  
  describe('loadConfig', () => {
    it('should return default config when no file exists', () => {
      const monitor = require('../scripts/monitor-repo');
      const config = monitor.loadConfig();
      
      assert(typeof config === 'object', 'should return an object');
      assert('watchTestsOnly' in config, 'should have watchTestsOnly');
      assert('notifications' in config, 'should have notifications');
      assert('alertThresholds' in config, 'should have alertThresholds');
    });
  });
  
  describe('loadHistory', () => {
    it('should return empty array when no history exists', () => {
      const monitor = require('../scripts/monitor-repo');
      const history = monitor.loadHistory();
      
      assert(Array.isArray(history), 'should return an array');
    });
  });
  
  describe('saveToHistory', () => {
    it('should save failure to history file', () => {
      const monitor = require('../scripts/monitor-repo');
      const failure = {
        name: 'Test Workflow',
        conclusion: 'failure',
        workflowName: 'Test Suite',
        headBranch: 'main'
      };
      
      // Save and verify it can be loaded
      monitor.saveToHistory(failure);
      const history = monitor.loadHistory();
      
      assert(history.length > 0, 'history should have entries');
      assert(history[0].name === failure.name, 'should save correct data');
      
      // Cleanup
      cleanupTestFiles();
    });
  });
  
  describe('isNewFailure', () => {
    it.skip('should identify new failures correctly', () => {
      // Clean up before test to ensure clean state
      cleanupTestFiles();
      
      const monitor = require('../scripts/monitor-repo');
      const failure = {
        name: 'New Test',
        workflowName: 'Test Suite',
        headBranch: 'feature-branch'
      };
      
      // First failure should be new
      assert(monitor.isNewFailure(failure), 'first occurrence should be new');
      
      // Save it
      monitor.saveToHistory(failure);
      
      // Same failure should not be new
      assert(!monitor.isNewFailure(failure), 'repeated failure should not be new');
      
      // Cleanup
      cleanupTestFiles();
    });
  });
});