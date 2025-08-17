const { describe, it } = require('node:test');
/**
 * Unit tests for GitHub repository monitoring
 * TDD RED phase - all tests should fail initially
 */

const assert = require('node:assert');
const fs = require('node:fs');

describe('monitor-repo.js', () => {
  
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
});