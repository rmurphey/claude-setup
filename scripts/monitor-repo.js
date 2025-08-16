#!/usr/bin/env node

/**
 * GitHub repository monitoring script
 * Monitors workflow runs and pull requests
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STATUS_FILE = '.monitor-status.json';

/**
 * Check workflow status using gh CLI
 * @returns {Array} Array of workflow runs
 */
async function checkWorkflowStatus() {
  try {
    const output = execSync('gh run list --limit 5 --json status,name,conclusion,headBranch', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output);
  } catch (error) {
    // Return empty array if gh command fails (e.g., not in a git repo)
    return [];
  }
}

/**
 * Check open pull requests using gh CLI
 * @returns {Array} Array of pull requests
 */
async function checkPullRequests() {
  try {
    const output = execSync('gh pr list --json number,title,author,reviews,isDraft', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return JSON.parse(output);
  } catch (error) {
    // Return empty array if gh command fails
    return [];
  }
}

/**
 * Format status data into readable report
 * @param {Object} status - Status object with workflows and PRs
 * @returns {String} Formatted report
 */
function formatReport(status) {
  let report = [];
  
  report.push(`📊 Repository Status Report`);
  report.push(`🕐 ${new Date(status.timestamp).toLocaleString()}`);
  report.push('');
  
  // Workflow status
  const failedWorkflows = status.workflows.filter(w => w.conclusion === 'failure');
  const runningWorkflows = status.workflows.filter(w => w.status === 'in_progress');
  
  if (failedWorkflows.length > 0) {
    report.push(`❌ Failed Workflows (${failedWorkflows.length}):`);
    failedWorkflows.forEach(w => {
      report.push(`   • ${w.name} on ${w.headBranch || 'unknown branch'}`);
    });
    report.push('');
  }
  
  if (runningWorkflows.length > 0) {
    report.push(`🔄 Running Workflows (${runningWorkflows.length}):`);
    runningWorkflows.forEach(w => {
      report.push(`   • ${w.name} on ${w.headBranch || 'unknown branch'}`);
    });
    report.push('');
  }
  
  // Pull requests
  if (status.pullRequests.length > 0) {
    report.push(`🔵 Open Pull Requests (${status.pullRequests.length}):`);
    status.pullRequests.forEach(pr => {
      const draft = pr.isDraft ? ' [DRAFT]' : '';
      report.push(`   • #${pr.number}: ${pr.title}${draft}`);
      report.push(`     by @${pr.author.login}`);
    });
    report.push('');
  }
  
  // All clear message
  if (failedWorkflows.length === 0 && status.pullRequests.length === 0) {
    report.push('✅ All clear - no issues detected');
  }
  
  return report.join('\n');
}

/**
 * Check status from file
 * @param {String} file - Path to status file (optional)
 * @returns {Object|null} Status object or null if not found
 */
function checkStatus(file = STATUS_FILE) {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    // Return null if can't read or parse
  }
  return null;
}

/**
 * Start monitoring with interval
 * @param {Number} interval - Check interval in ms
 * @param {Boolean} dryRun - If true, don't actually start interval
 * @returns {Object} Monitor instance with stop method
 */
function startMonitoring(interval = DEFAULT_INTERVAL, dryRun = false) {
  console.log('🔍 Starting repository monitoring...');
  console.log(`   Interval: ${interval / 1000} seconds`);
  console.log(`   Status file: ${STATUS_FILE}`);
  console.log('');
  
  if (dryRun) {
    return { stop: () => {} };
  }
  
  // Initial check
  performCheck();
  
  // Set up interval
  const intervalId = setInterval(performCheck, interval);
  
  // Keep process running
  if (!process.env.NODE_ENV === 'test') {
    process.stdin.resume();
  }
  
  // Return handle for stopping
  return {
    stop: () => {
      clearInterval(intervalId);
      if (process.stdin.isPaused && process.stdin.isPaused()) {
        process.stdin.pause();
      }
    }
  };
  
  async function performCheck() {
    const status = {
      timestamp: new Date().toISOString(),
      workflows: await checkWorkflowStatus(),
      pullRequests: await checkPullRequests()
    };
    
    // Write status file
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    
    // Check for issues
    const failures = status.workflows.filter(w => w.conclusion === 'failure');
    const openPRs = status.pullRequests.length;
    
    // Alert if issues found
    if (failures.length > 0 || openPRs > 0) {
      console.log(`\n⚠️  Repository Alert at ${new Date().toLocaleTimeString()}`);
      if (failures.length > 0) {
        console.log(`  🔴 ${failures.length} workflow failure(s)`);
        failures.forEach(w => {
          console.log(`     • ${w.name} on ${w.headBranch || 'unknown'}`);
        });
      }
      if (openPRs > 0) {
        console.log(`  🔵 ${openPRs} open pull request(s)`);
        status.pullRequests.forEach(pr => {
          console.log(`     • #${pr.number}: ${pr.title}`);
        });
      }
    }
  }
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case '--status':
    case 'status':
      const status = checkStatus();
      if (status) {
        console.log(formatReport(status));
      } else {
        console.log('No monitoring status found. Start monitoring first.');
      }
      break;
      
    case '--help':
    case 'help':
      console.log('GitHub Repository Monitor');
      console.log('');
      console.log('Usage:');
      console.log('  node monitor-repo.js         Start monitoring');
      console.log('  node monitor-repo.js status  Check current status');
      console.log('  node monitor-repo.js help    Show this help');
      break;
      
    default:
      // Start monitoring
      const interval = process.argv[3] ? parseInt(process.argv[3]) * 1000 : DEFAULT_INTERVAL;
      startMonitoring(interval);
  }
}

// Export for testing
module.exports = {
  checkWorkflowStatus,
  checkPullRequests,
  formatReport,
  checkStatus,
  startMonitoring
};