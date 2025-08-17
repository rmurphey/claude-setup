# GitHub Test Failure Monitor

Enhanced monitoring for GitHub Actions test failures with history tracking and smart notifications.

## Features

### 🧪 Test-Specific Monitoring
- Automatically detects and separates test failures from other workflow failures
- Tracks test suite runs specifically
- Provides detailed failure information including failed jobs and steps

### 📊 Failure History
- Maintains history of last 50 failures
- Tracks new vs recurring failures
- Calculates failure statistics (consecutive failures, failure rate)

### 🔔 Smart Notifications
- Visual alerts for new failures
- Terminal bell sound (optional)
- Differentiates between new and ongoing failures
- Configurable alert thresholds

### ⚙️ Configuration
Customize monitoring behavior via `.monitor-config.json`:
```json
{
  "watchTestsOnly": false,          // Only monitor test workflows
  "notifications": {
    "enabled": true,                // Enable notifications
    "sound": false,                 // Terminal bell on new failures
    "desktop": false                // Reserved for future use
  },
  "alertThresholds": {
    "failureCount": 1,              // Alert after N failures
    "consecutiveFailures": 3        // Alert for N consecutive failures
  },
  "watchedWorkflows": [],          // Specific workflows to watch (empty = all)
  "checkInterval": 300000          // Check interval in ms (5 minutes)
}
```

## Commands

### Start Monitoring
```bash
npm run monitor:start
# or
node scripts/monitor-repo.js
```
Runs in background, checking every 5 minutes (configurable).

### Check Status
```bash
npm run monitor:status
```
Shows current repository status with categorized failures.

### View Test Failures
```bash
npm run monitor:failures
```
Displays detailed test failure information including:
- Failed jobs and steps
- Failure timestamps
- Direct links to GitHub Actions runs

### View History
```bash
npm run monitor:history
```
Shows failure history grouped by date, useful for identifying patterns.

### Clear Data
```bash
npm run monitor:clear
```
Removes all monitoring data and history.

### View Configuration
```bash
npm run monitor:config
```
Shows current monitoring configuration.

### Stop Monitoring
```bash
npm run monitor:stop
```
Stops the background monitoring process.

## Files Created

- `.monitor-status.json` - Current monitoring status
- `.monitor-history.json` - Failure history (last 50 entries)
- `.monitor-config.json` - Configuration settings

## Example Output

### New Failure Alert
```
============================================================
🚨                  NEW FAILURES DETECTED                 🚨
============================================================

⚠️  Repository Alert at 5:30:00 PM
  🆕 NEW Test Failures (1):
     • Test Suite on main
       https://github.com/user/repo/actions/runs/12345
  🧪 Ongoing Test Failures (2):
     • Integration Tests on main
     • Unit Tests on feature-branch
```

### Status Report
```
📊 Repository Status Report
🕐 8/17/2025, 5:30:00 PM

🧪 Failed Tests (2):
   • Test Suite on main 🆕
     https://github.com/user/repo/actions/runs/12345
   • Integration Tests on main

📈 Statistics:
   • Consecutive failures: 3
   • Recent failure rate: 25.0%

🔵 Open Pull Requests (1):
   • #123: Add new feature
     by @developer
```

## Use Cases

1. **Continuous Monitoring** - Run in background during development
2. **CI/CD Health Checks** - Quick status checks before deployments
3. **Failure Pattern Analysis** - Use history to identify flaky tests
4. **Team Notifications** - Alert team to new test failures

## Integration Ideas

- Add webhook support for Slack/Discord notifications
- Export failure metrics to monitoring dashboards
- Integrate with issue tracking for automatic ticket creation
- Add failure trend analysis and reporting

## Technical Details

Built using:
- GitHub CLI (`gh`) for API access
- Node.js file system for persistence
- Zero external dependencies
- Async/await for efficient API calls

The monitor is designed to be lightweight and run continuously without impacting system resources.