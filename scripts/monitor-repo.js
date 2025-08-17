#!/usr/bin/env node

/**
 * GitHub repository monitoring script
 * Monitors workflow runs and pull requests
 */

const { execSync } = require('child_process');
const fs = require('fs');

const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STATUS_FILE = '.monitor-status.json';
const HISTORY_FILE = '.monitor-history.json';
const CONFIG_FILE = '.monitor-config.json';
const MAX_HISTORY_ENTRIES = 50;

/**
 * Check workflow status using gh CLI
 * @param {Object} options - Options for filtering workflows
 * @returns {Array} Array of workflow runs
 */
async function checkWorkflowStatus(options = {}) {
  try {
    const limit = options.limit || 5;
    const fields = 'status,name,conclusion,headBranch,workflowName,databaseId,url,startedAt';
    const output = execSync(`gh run list --limit ${limit} --json ${fields}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const runs = JSON.parse(output);
    
    // Filter for test-specific workflows if requested
    if (options.testsOnly) {
      return runs.filter(r => 
        r.workflowName?.toLowerCase().includes('test') ||
        r.name?.toLowerCase().includes('test')
      );
    }
    
    return runs;
  } catch {
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
  } catch {
    // Return empty array if gh command fails
    return [];
  }
}

/**
 * Get detailed failure information for a workflow run
 * @param {Number} runId - Database ID of the run
 * @returns {Object} Detailed failure information
 */
async function getFailureDetails(runId) {
  try {
    // Get run details
    const runOutput = execSync(`gh run view ${runId} --json jobs,conclusion,url`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const runData = JSON.parse(runOutput);
    
    // Find failed jobs
    const failedJobs = runData.jobs?.filter(j => j.conclusion === 'failure') || [];
    
    return {
      url: runData.url,
      failedJobs: failedJobs.map(j => ({
        name: j.name,
        steps: j.steps?.filter(s => s.conclusion === 'failure').map(s => s.name) || []
      }))
    };
  } catch {
    return null;
  }
}

/**
 * Load monitoring configuration
 * @returns {Object} Configuration object
 */
function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch {}
  
  // Default configuration
  return {
    watchTestsOnly: false,
    notifications: {
      enabled: false,
      sound: false,
      desktop: false
    },
    alertThresholds: {
      failureCount: 1,
      consecutiveFailures: 3
    },
    watchedWorkflows: []
  };
}

/**
 * Load failure history
 * @returns {Array} Array of historical failures
 */
function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
    }
  } catch {}
  return [];
}

/**
 * Save failure to history
 * @param {Object} failure - Failure data to save
 */
function saveToHistory(failure) {
  let history = loadHistory();
  
  // Add timestamp if not present
  if (!failure.timestamp) {
    failure.timestamp = new Date().toISOString();
  }
  
  // Add to beginning of array
  history.unshift(failure);
  
  // Limit history size
  if (history.length > MAX_HISTORY_ENTRIES) {
    history = history.slice(0, MAX_HISTORY_ENTRIES);
  }
  
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

/**
 * Check if failure is new (not in recent history)
 * @param {Object} failure - Failure to check
 * @returns {Boolean} True if new failure
 */
function isNewFailure(failure) {
  const history = loadHistory();
  const recentHistory = history.slice(0, 10); // Check last 10 entries
  
  return !recentHistory.some(h => 
    h.workflowName === failure.workflowName &&
    h.headBranch === failure.headBranch &&
    h.name === failure.name
  );
}

/**
 * Format status data into readable report
 * @param {Object} status - Status object with workflows and PRs
 * @returns {String} Formatted report
 */
function formatReport(status) {
  let report = [];
  
  report.push('📊 Repository Status Report');
  report.push(`🕐 ${new Date(status.timestamp).toLocaleString()}`);
  report.push('');
  
  // Workflow status
  const failedWorkflows = status.workflows.filter(w => w.conclusion === 'failure');
  const failedTests = failedWorkflows.filter(w => 
    w.workflowName?.toLowerCase().includes('test') || 
    w.name?.toLowerCase().includes('test')
  );
  const runningWorkflows = status.workflows.filter(w => w.status === 'in_progress');
  
  // Separate test failures from other failures
  if (failedTests.length > 0) {
    report.push(`🧪 Failed Tests (${failedTests.length}):`);
    failedTests.forEach(w => {
      const isNew = status.newFailures?.includes(w.databaseId) ? ' 🆕' : '';
      report.push(`   • ${w.name} on ${w.headBranch || 'unknown branch'}${isNew}`);
      if (w.url) {
        report.push(`     ${w.url}`);
      }
    });
    report.push('');
  }
  
  const otherFailures = failedWorkflows.filter(w => !failedTests.includes(w));
  if (otherFailures.length > 0) {
    report.push(`❌ Other Failed Workflows (${otherFailures.length}):`);
    otherFailures.forEach(w => {
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
  
  // Summary statistics
  if (status.stats) {
    report.push('📈 Statistics:');
    if (status.stats.consecutiveFailures > 0) {
      report.push(`   • Consecutive failures: ${status.stats.consecutiveFailures}`);
    }
    if (status.stats.failureRate !== undefined) {
      report.push(`   • Recent failure rate: ${(status.stats.failureRate * 100).toFixed(1)}%`);
    }
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
  } catch {
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
    const config = loadConfig();
    const status = {
      timestamp: new Date().toISOString(),
      workflows: await checkWorkflowStatus({ testsOnly: config.watchTestsOnly }),
      pullRequests: await checkPullRequests()
    };
    
    // Check for new failures
    const failures = status.workflows.filter(w => w.conclusion === 'failure');
    const testFailures = failures.filter(w => 
      w.workflowName?.toLowerCase().includes('test') || 
      w.name?.toLowerCase().includes('test')
    );
    
    // Track new failures
    status.newFailures = [];
    for (const failure of failures) {
      if (isNewFailure(failure)) {
        status.newFailures.push(failure.databaseId);
        saveToHistory(failure);
      }
    }
    
    // Calculate statistics
    const history = loadHistory();
    const recentRuns = history.slice(0, 20);
    status.stats = {
      consecutiveFailures: 0,
      failureRate: recentRuns.length > 0 ? 
        recentRuns.filter(r => r.conclusion === 'failure').length / recentRuns.length : 0
    };
    
    // Count consecutive failures
    for (const run of history) {
      if (run.conclusion === 'failure') {
        status.stats.consecutiveFailures++;
      } else {
        break;
      }
    }
    
    // Write status file
    fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
    
    // Alert if issues found
    const openPRs = status.pullRequests.length;
    if (testFailures.length > 0 || (failures.length > 0 && !config.watchTestsOnly) || openPRs > 0) {
      // Enhanced notification for new failures
      const hasNewFailures = status.newFailures.length > 0;
      if (hasNewFailures && config.notifications.enabled) {
        // Visual alert
        console.log('\n' + '='.repeat(60));
        console.log('🚨 ' + ' NEW FAILURES DETECTED '.padStart(38).padEnd(56) + ' 🚨');
        console.log('='.repeat(60));
        
        // Terminal bell if sound enabled
        if (config.notifications.sound) {
          process.stdout.write('\x07');
        }
      }
      
      console.log(`\n⚠️  Repository Alert at ${new Date().toLocaleTimeString()}`);
      
      // Highlight new test failures
      if (testFailures.length > 0) {
        const newTestFailures = testFailures.filter(f => status.newFailures.includes(f.databaseId));
        if (newTestFailures.length > 0) {
          console.log(`  🆕 NEW Test Failures (${newTestFailures.length}):`);
          newTestFailures.forEach(w => {
            console.log(`     • ${w.name} on ${w.headBranch || 'unknown'}`);
            console.log(`       ${w.url || ''}`);
          });
        }
        
        const existingTestFailures = testFailures.filter(f => !status.newFailures.includes(f.databaseId));
        if (existingTestFailures.length > 0) {
          console.log(`  🧪 Ongoing Test Failures (${existingTestFailures.length}):`);
          existingTestFailures.forEach(w => {
            console.log(`     • ${w.name} on ${w.headBranch || 'unknown'}`);
          });
        }
      }
      
      // Show other failures if not in test-only mode
      if (!config.watchTestsOnly) {
        const otherFailures = failures.filter(f => !testFailures.includes(f));
        if (otherFailures.length > 0) {
          console.log(`  🔴 Other Failures (${otherFailures.length}):`);
          otherFailures.forEach(w => {
            console.log(`     • ${w.name} on ${w.headBranch || 'unknown'}`);
          });
        }
      }
      
      if (openPRs > 0) {
        console.log(`  🔵 ${openPRs} open pull request(s)`);
        status.pullRequests.forEach(pr => {
          console.log(`     • #${pr.number}: ${pr.title}`);
        });
      }
      
      // Show statistics if concerning
      if (status.stats.consecutiveFailures >= config.alertThresholds.consecutiveFailures) {
        console.log(`\n  ⚠️  Alert: ${status.stats.consecutiveFailures} consecutive failures!`);
      }
    }
  }
}

// CLI handling
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case '--status':
    case 'status': {
      const status = checkStatus();
      if (status) {
        console.log(formatReport(status));
      } else {
        console.log('No monitoring status found. Start monitoring first.');
      }
      break;
    }
    
    case '--failures':
    case 'failures': {
      (async () => {
        const workflows = await checkWorkflowStatus({ testsOnly: true, limit: 10 });
        const failures = workflows.filter(w => w.conclusion === 'failure');
        
        if (failures.length === 0) {
          console.log('✅ No test failures found');
        } else {
          console.log(`🧪 Test Failures (${failures.length}):`);
          console.log('');
          for (const failure of failures) {
            console.log(`❌ ${failure.name}`);
            console.log(`   Branch: ${failure.headBranch}`);
            console.log(`   Time: ${new Date(failure.startedAt).toLocaleString()}`);
            console.log(`   URL: ${failure.url}`);
            
            // Try to get details
            const details = await getFailureDetails(failure.databaseId);
            if (details && details.failedJobs.length > 0) {
              console.log(`   Failed Jobs:`);
              details.failedJobs.forEach(job => {
                console.log(`     • ${job.name}`);
                if (job.steps.length > 0) {
                  console.log(`       Failed steps: ${job.steps.join(', ')}`);
                }
              });
            }
            console.log('');
          }
        }
      })();
      break;
    }
    
    case '--history':
    case 'history': {
      const history = loadHistory();
      if (history.length === 0) {
        console.log('No failure history recorded');
      } else {
        console.log(`📜 Failure History (last ${history.length} entries):`);
        console.log('');
        
        // Group by date
        const byDate = {};
        history.forEach(h => {
          const date = new Date(h.timestamp).toLocaleDateString();
          if (!byDate[date]) byDate[date] = [];
          byDate[date].push(h);
        });
        
        Object.entries(byDate).forEach(([date, entries]) => {
          console.log(`📅 ${date}:`);
          entries.forEach(e => {
            const time = new Date(e.timestamp).toLocaleTimeString();
            console.log(`   ${time} - ${e.name} on ${e.headBranch}`);
          });
          console.log('');
        });
      }
      break;
    }
    
    case '--clear':
    case 'clear': {
      if (fs.existsSync(STATUS_FILE)) fs.unlinkSync(STATUS_FILE);
      if (fs.existsSync(HISTORY_FILE)) fs.unlinkSync(HISTORY_FILE);
      console.log('✅ Monitoring data cleared');
      break;
    }
    
    case '--config':
    case 'config': {
      const config = loadConfig();
      console.log('⚙️  Current Configuration:');
      console.log(JSON.stringify(config, null, 2));
      console.log('');
      console.log('Edit .monitor-config.json to change settings');
      break;
    }
      
    case '--help':
    case 'help':
      console.log('GitHub Repository Monitor - Enhanced');
      console.log('');
      console.log('Usage:');
      console.log('  node monitor-repo.js              Start monitoring');
      console.log('  node monitor-repo.js status       Check current status');
      console.log('  node monitor-repo.js failures     Show test failures with details');
      console.log('  node monitor-repo.js history      Show failure history');
      console.log('  node monitor-repo.js clear        Clear all monitoring data');
      console.log('  node monitor-repo.js config       Show current configuration');
      console.log('  node monitor-repo.js help         Show this help');
      console.log('');
      console.log('Configuration:');
      console.log('  Edit .monitor-config.json to customize monitoring behavior');
      break;
      
    default: {
      // Start monitoring
      const interval = process.argv[3] ? parseInt(process.argv[3]) * 1000 : DEFAULT_INTERVAL;
      startMonitoring(interval);
    }
  }
}

// Export for testing
module.exports = {
  checkWorkflowStatus,
  checkPullRequests,
  formatReport,
  checkStatus,
  startMonitoring,
  getFailureDetails,
  loadConfig,
  loadHistory,
  saveToHistory,
  isNewFailure
};