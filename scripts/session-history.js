#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SESSION_HISTORY_DIR = path.join(process.cwd(), 'session-history');
const LAST_SAVE_FILE = path.join(SESSION_HISTORY_DIR, '.last-save');

// Parse command line arguments
const command = process.argv[2] || 'save';
const args = process.argv.slice(3);

// Helper functions
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getDateString() {
  return new Date().toISOString().split('T')[0];
}

function getTimeString() {
  return new Date().toTimeString().split(' ')[0].replace(/:/g, '');
}

function getSessionDirectory() {
  const dateDir = path.join(SESSION_HISTORY_DIR, getDateString());
  ensureDirectoryExists(dateDir);
  return dateDir;
}

function getNextSessionNumber(dateDir) {
  if (!fs.existsSync(dateDir)) {
    return '001';
  }
  
  const files = fs.readdirSync(dateDir);
  const sessionFiles = files.filter(f => f.startsWith('session-'));
  
  if (sessionFiles.length === 0) {
    return '001';
  }
  
  // Extract numbers and find max
  const numbers = sessionFiles
    .map(f => f.match(/session-(\d{3})/))
    .filter(m => m)
    .map(m => parseInt(m[1]));
  
  const maxNum = Math.max(...numbers, 0);
  return String(maxNum + 1).padStart(3, '0');
}

function getLastSaveInfo() {
  if (fs.existsSync(LAST_SAVE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(LAST_SAVE_FILE, 'utf8'));
    } catch {
      return null;
    }
  }
  return null;
}

function updateLastSaveInfo(info) {
  ensureDirectoryExists(SESSION_HISTORY_DIR);
  fs.writeFileSync(LAST_SAVE_FILE, JSON.stringify(info, null, 2));
}

// Currently unused but kept for future metadata needs
// function getClaudeMetadata() {
//   const metadata = {
//     timestamp: new Date().toISOString(),
//     claudeVersion: 'unknown',
//     environment: process.env.CLAUDE_CODE_ENTRYPOINT || 'cli'
//   };
//   
//   // Get Claude Code version
//   try {
//     const version = execSync('claude --version 2>/dev/null', {encoding: 'utf8'}).trim();
//     metadata.claudeVersion = version;
//   } catch {
//     // Fallback - version unavailable
//     metadata.claudeVersion = 'Claude Code (version unknown)';
//   }
//   
//   return metadata;
// }

function captureGitActivity(sinceCommit = null) {
  const activity = {
    commits: [],
    filesChanged: [],
    branch: 'unknown',
    newCommitsOnly: false
  };
  
  try {
    // Get current branch
    activity.branch = execSync('git branch --show-current', {encoding: 'utf8'}).trim();
    
    // Get commits since last save or recent commits
    let commitCommand = 'git log --oneline -20';
    if (sinceCommit) {
      // Only get commits since the specified commit
      commitCommand = `git log --oneline ${sinceCommit}..HEAD`;
      activity.newCommitsOnly = true;
    }
    
    const commits = execSync(commitCommand, {encoding: 'utf8'}).trim();
    if (commits) {
      activity.commits = commits.split('\n').map(c => {
        const [hash, ...messageParts] = c.split(' ');
        return {
          hash: hash.substring(0, 7),
          message: messageParts.join(' ')
        };
      });
    }
    
    // Get files changed in working directory
    const changes = execSync('git status --porcelain', {encoding: 'utf8'}).trim();
    if (changes) {
      activity.filesChanged = changes.split('\n').map(line => {
        const [status, ...fileParts] = line.trim().split(' ');
        return {
          status: status,
          file: fileParts.join(' ')
        };
      });
    }
  } catch {
    // Not in a git repo or git not available
    console.log('⚠️  Git information unavailable');
  }
  
  return activity;
}

function captureTestResults() {
  const results = {
    lastRun: null,
    passing: 0,
    failing: 0
  };
  
  try {
    // Try to run tests and capture output
    const output = execSync('npm test 2>&1', {encoding: 'utf8'});
    
    // Parse test output (Node.js test runner format)
    const passMatch = output.match(/# pass (\d+)/);
    const failMatch = output.match(/# fail (\d+)/);
    
    if (passMatch) results.passing = parseInt(passMatch[1]);
    if (failMatch) results.failing = parseInt(failMatch[1]);
    
    results.lastRun = new Date().toISOString();
  } catch (e) {
    // Tests failed or not configured
    const output = e.stdout || '';
    const passMatch = output.match(/# pass (\d+)/);
    const failMatch = output.match(/# fail (\d+)/);
    
    if (passMatch) results.passing = parseInt(passMatch[1]);
    if (failMatch) results.failing = parseInt(failMatch[1]);
  }
  
  return results;
}

// Get last git commit hash from previous save
function getLastCommitFromSave() {
  const lastSave = getLastSaveInfo();
  if (!lastSave || !lastSave.file) return null;
  
  try {
    const content = fs.readFileSync(lastSave.file, 'utf8');
    // Extract the first commit hash from the previous save
    const match = content.match(/- `([a-f0-9]{7})` /); 
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Detect session type based on environment
function detectSessionType() {
  // Check if running in test environment (but not just "testing" in description)
  if (process.env.NODE_ENV === 'test' || process.argv[1]?.includes('test.js')) {
    return 'test';
  }
  
  // Check if running automated (CI, cron, etc)
  if (process.env.CI || process.env.GITHUB_ACTIONS) {
    return 'automated';
  }
  
  // Default to manual
  return 'manual';
}

// Command implementations
function saveSession(description = '', options = {}) {
  // Detect session type and check if we should skip
  const sessionType = options.sessionType || detectSessionType();
  if (sessionType === 'test' && !options.forceSave) {
    console.log('⏭️  Skipping test session save');
    return null;
  }
  
  const sessionDir = getSessionDirectory();
  const sessionNum = getNextSessionNumber(sessionDir);
  const timestamp = getTimeString();
  
  // Check for delta mode
  const isDelta = options.delta || false;
  const lastCommit = isDelta ? getLastCommitFromSave() : null;
  
  // Determine filename
  const baseFilename = `session-${sessionNum}-${timestamp}`;
  const suffix = isDelta ? '-delta' : '';
  const filename = description 
    ? `${baseFilename}${suffix}-${description.replace(/[^a-z0-9]/gi, '-')}.txt`
    : `${baseFilename}${suffix}.txt`;
  
  const filepath = path.join(sessionDir, filename);
  
  // Get metadata (not used in regular save, kept for future use)
  // const metadata = getClaudeMetadata();
  
  // Capture actual session data (with delta if requested)
  const gitActivity = captureGitActivity(lastCommit);
  const testResults = sessionType !== 'test' ? captureTestResults() : { passing: 0, failing: 0 };
  
  // Check if any actual changes were made
  const hasChanges = gitActivity.commits.length > 0 || gitActivity.filesChanged.length > 0;
  if (!hasChanges && !options.forceSave) {
    console.log('ℹ️  No changes detected, skipping save');
    return null;
  }
  
  // Build session content
  const sessionTitle = isDelta ? 'Delta Session' : 'Session';
  let content = `# Claude Code ${sessionTitle} - ${getDateString()} ${new Date().toTimeString().split(' ')[0]}

`;
  
  content += `## Session Metadata
`;
  content += `- **Date**: ${getDateString()}\n`;
  content += `- **Time**: ${new Date().toTimeString().split(' ')[0]}\n`;
  content += `- **Session Number**: ${sessionNum}\n`;
  content += `- **Session Type**: ${sessionType}\n`;
  content += `- **Description**: ${description || 'Development session'}\n`;
  if (isDelta && lastCommit) {
    content += `- **Since Commit**: ${lastCommit}\n`;
  }
  content += '\n';
  
  // Git Activity Section
  content += '## Git Activity\n';
  content += `**Branch**: ${gitActivity.branch}\n\n`;
  
  if (gitActivity.commits.length > 0) {
    const commitTitle = gitActivity.newCommitsOnly ? 'New Commits' : 'Recent Commits';
    content += `### ${commitTitle} (${gitActivity.commits.length})\n`;
    gitActivity.commits.slice(0, 10).forEach(commit => {
      content += `- \`${commit.hash}\` ${commit.message}\n`;
    });
    if (gitActivity.commits.length > 10) {
      content += `- ... and ${gitActivity.commits.length - 10} more\n`;
    }
    content += '\n';
  } else if (isDelta) {
    content += '### No new commits since last save\n\n';
  }
  
  if (gitActivity.filesChanged.length > 0) {
    content += `### Working Directory Changes (${gitActivity.filesChanged.length} files)\n`;
    gitActivity.filesChanged.forEach(change => {
      const statusMap = {
        'M': 'Modified',
        'A': 'Added',
        'D': 'Deleted',
        '??': 'Untracked',
        'AM': 'Added+Modified'
      };
      const status = statusMap[change.status] || change.status;
      content += `- **${status}**: ${change.file}\n`;
    });
    content += '\n';
  }
  
  // Test Results Section
  content += '## Test Results\n';
  if (testResults.lastRun) {
    content += `- **Passing**: ${testResults.passing}\n`;
    content += `- **Failing**: ${testResults.failing}\n`;
    content += `- **Status**: ${testResults.failing === 0 ? '✅ All tests passing' : '❌ Tests failing'}\n`;
  } else {
    content += '- Tests not run in this session\n';
  }
  content += '\n';
  
  // Session Summary
  content += '## Session Summary\n';
  content += `This session captured at ${new Date().toLocaleString()}\n\n`;
  
  if (description) {
    content += `### Description\n${description}\n\n`;
  }
  
  content += '### Metrics\n';
  content += `- Commits: ${gitActivity.commits.length}\n`;
  content += `- Files changed: ${gitActivity.filesChanged.length}\n`;
  content += `- Tests: ${testResults.passing}/${testResults.passing + testResults.failing} passing\n`;
  
  // Write the content to file
  fs.writeFileSync(filepath, content);
  
  console.log('\n📝 Session saved with actual data');
  console.log(`  Branch: ${gitActivity.branch}`);
  console.log(`  Commits: ${gitActivity.commits.length}`);
  console.log(`  Files changed: ${gitActivity.filesChanged.length}`);
  console.log(`  Tests: ${testResults.passing}/${testResults.passing + testResults.failing} passing`);
  
  // Update last save info
  updateLastSaveInfo({
    date: getDateString(),
    time: timestamp,
    file: filepath,
    sessionNumber: sessionNum
  });
  
  console.log('\n✅ Session saved successfully');
  console.log(`📁 Location: ${filepath}`);
  
  return filepath;
}

function saveDelta() {
  const lastSave = getLastSaveInfo();
  
  if (!lastSave) {
    console.log('⚠️  No previous save found, performing full save');
    return saveSession('initial', { delta: false });
  }
  
  console.log('\n📝 Saving delta since last save...');
  console.log(`Last save: ${lastSave.date} at ${lastSave.time}`);
  
  // Use the new saveSession with delta option
  return saveSession('', { delta: true });
}

function listSessions() {
  console.log('\n📚 Session History\n');
  console.log('='.repeat(50));
  
  if (!fs.existsSync(SESSION_HISTORY_DIR)) {
    console.log('No session history found');
    return;
  }
  
  const dates = fs.readdirSync(SESSION_HISTORY_DIR)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d))
    .sort()
    .reverse();
  
  if (dates.length === 0) {
    console.log('No sessions saved yet');
    return;
  }
  
  // Show recent sessions
  dates.slice(0, 7).forEach(date => {
    const dateDir = path.join(SESSION_HISTORY_DIR, date);
    const files = fs.readdirSync(dateDir)
      .filter(f => f.startsWith('session-'))
      .sort();
    
    if (files.length > 0) {
      console.log(`\n📅 ${date}`);
      files.forEach(file => {
        // Skip metadata files if they still exist (backwards compatibility)
        if (file.endsWith('.meta.json')) return;
        
        const stats = fs.statSync(path.join(dateDir, file));
        const size = (stats.size / 1024).toFixed(1);
        const isDelta = file.includes('delta');
        const icon = isDelta ? '📊' : '📄';
        
        // Try to extract version from file header (new format) or .meta.json (old format)
        let versionInfo = '';
        const filePath = path.join(dateDir, file);
        
        try {
          // First try to read from file header
          const content = fs.readFileSync(filePath, 'utf8');
          const versionMatch = content.match(/- \*\*Claude Version\*\*: (.+)/);
          if (versionMatch) {
            const shortVersion = versionMatch[1].replace(' (Claude Code)', '');
            versionInfo = ` [v${shortVersion}]`;
          }
        } catch {
          // Fallback to .meta.json for backwards compatibility
          const metaFile = file.replace('.txt', '.meta.json');
          const metaPath = path.join(dateDir, metaFile);
          if (fs.existsSync(metaPath)) {
            try {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
              if (meta.claudeVersion && meta.claudeVersion !== 'unknown') {
                const shortVersion = meta.claudeVersion.replace(' (Claude Code)', '');
                versionInfo = ` [v${shortVersion}]`;
              }
            } catch {
              // Ignore metadata read errors
            }
          }
        }
        
        console.log(`  ${icon} ${file} (${size} KB)${versionInfo}`);
      });
    }
  });
  
  const lastSave = getLastSaveInfo();
  if (lastSave) {
    console.log('\n📍 Last Save:');
    console.log(`  Date: ${lastSave.date}`);
    console.log(`  Time: ${lastSave.time}`);
    console.log(`  Type: ${lastSave.isDelta ? 'Delta' : 'Full'}`);
  }
  
  console.log('\n' + '='.repeat(50));
}

function archiveSessions(daysOld = 30) {
  const archiveDir = path.join(SESSION_HISTORY_DIR, 'archive');
  ensureDirectoryExists(archiveDir);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  console.log(`\n📦 Archiving sessions older than ${daysOld} days...`);
  console.log(`Cutoff date: ${cutoffDate.toISOString().split('T')[0]}`);
  
  if (!fs.existsSync(SESSION_HISTORY_DIR)) {
    console.log('No sessions to archive');
    return;
  }
  
  const dates = fs.readdirSync(SESSION_HISTORY_DIR)
    .filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d));
  
  let archivedCount = 0;
  dates.forEach(date => {
    const dateObj = new Date(date);
    if (dateObj < cutoffDate) {
      const sourcePath = path.join(SESSION_HISTORY_DIR, date);
      const destPath = path.join(archiveDir, date);
      
      // Move directory to archive
      if (!fs.existsSync(destPath)) {
        fs.renameSync(sourcePath, destPath);
        console.log(`  Archived: ${date}`);
        archivedCount++;
      }
    }
  });
  
  console.log(`\n✅ Archived ${archivedCount} date directories`);
}

function showHelp() {
  console.log(`
📚 Session History Manager

Usage: node scripts/session-history.js [command] [options]

Commands:
  save [description]  Save current session with optional description
  delta              Save only changes since last save
  list               List recent session history
  archive [days]     Archive sessions older than N days (default: 30)
  help               Show this help message

Examples:
  npm run session:save
  npm run session:save "feature-implementation"
  npm run session:delta
  npm run session:list
  npm run session:archive 60

Notes:
  - Sessions are organized by date in session-history/
  - Delta saves only capture changes since last save
  - Use 'save' for full session captures
  - Archive old sessions to keep history organized
`);
}

// Main execution
if (require.main === module) {
  switch (command) {
    case 'save':
      saveSession(args.join('-'));
      break;
    
    case 'delta':
      saveDelta();
      break;
    
    case 'list':
      listSessions();
      break;
    
    case 'archive':
      archiveSessions(parseInt(args[0]) || 30);
      break;
    
    case 'help':
      showHelp();
      break;
    
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Use "help" to see available commands');
      process.exit(1);
  }
} else {
  // Export for testing
  module.exports = {
    saveSession,
    saveDelta,
    listSessions,
    archiveSessions,
    detectSessionType,
    getLastCommitFromSave,
    captureGitActivity
  };
}