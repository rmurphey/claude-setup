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
    } catch (e) {
      return null;
    }
  }
  return null;
}

function updateLastSaveInfo(info) {
  ensureDirectoryExists(SESSION_HISTORY_DIR);
  fs.writeFileSync(LAST_SAVE_FILE, JSON.stringify(info, null, 2));
}

function getClaudeMetadata() {
  const metadata = {
    timestamp: new Date().toISOString(),
    claudeVersion: 'unknown',
    environment: process.env.CLAUDE_CODE_ENTRYPOINT || 'cli'
  };
  
  // Get Claude Code version
  try {
    const version = execSync('claude --version 2>/dev/null', {encoding: 'utf8'}).trim();
    metadata.claudeVersion = version;
  } catch (e) {
    // Fallback - version unavailable
    metadata.claudeVersion = 'Claude Code (version unknown)';
  }
  
  return metadata;
}

// Command implementations
function saveSession(description = '') {
  const sessionDir = getSessionDirectory();
  const sessionNum = getNextSessionNumber(sessionDir);
  const timestamp = getTimeString();
  
  // Determine filename
  const baseFilename = `session-${sessionNum}-${timestamp}`;
  const filename = description 
    ? `${baseFilename}-${description.replace(/[^a-z0-9]/gi, '-')}.txt`
    : `${baseFilename}.txt`;
  
  const filepath = path.join(sessionDir, filename);
  
  // Get metadata
  const metadata = getClaudeMetadata();
  
  // Create session file with metadata header
  const header = `# Claude Code Session Transcript - ${getDateString()}

## Metadata
- **Date**: ${getDateString()}
- **Time**: ${new Date().toTimeString().split(' ')[0]}
- **Claude Version**: ${metadata.claudeVersion}
- **Environment**: ${metadata.environment}
- **Session Number**: ${sessionNum}
- **Save Type**: full
- **Description**: ${description || 'Manual save'}
- **Timestamp**: ${metadata.timestamp}

## Session Content
[Session transcript will be added here by Claude]
`;
  
  // Write the header to the file
  fs.writeFileSync(filepath, header);
  
  console.log('\n📝 Session file created with metadata header');
  console.log(`Claude Version: ${metadata.claudeVersion}`);
  
  // Update last save info
  updateLastSaveInfo({
    date: getDateString(),
    time: timestamp,
    file: filepath,
    sessionNumber: sessionNum
  });
  
  console.log('\n✅ Session save prepared');
  console.log(`📁 Location: ${filepath}`);
  
  return filepath;
}

function saveDelta() {
  const lastSave = getLastSaveInfo();
  
  if (!lastSave) {
    console.log('⚠️  No previous save found, performing full save');
    return saveSession('delta');
  }
  
  console.log('\n📝 Saving delta since last save...');
  console.log(`Last save: ${lastSave.date} at ${lastSave.time}`);
  
  const sessionDir = getSessionDirectory();
  const sessionNum = getNextSessionNumber(sessionDir);
  const timestamp = getTimeString();
  const filename = `session-${sessionNum}-${timestamp}-delta.txt`;
  const filepath = path.join(sessionDir, filename);
  
  // Get metadata
  const metadata = getClaudeMetadata();
  
  // Create delta file with metadata header
  const header = `# Claude Code Session Delta - ${getDateString()}

## Metadata
- **Date**: ${getDateString()}
- **Time**: ${new Date().toTimeString().split(' ')[0]}
- **Claude Version**: ${metadata.claudeVersion}
- **Environment**: ${metadata.environment}
- **Session Number**: ${sessionNum}
- **Save Type**: delta
- **Previous Save**: ${lastSave ? lastSave.file : 'none'}
- **Timestamp**: ${metadata.timestamp}

## Delta Content (since ${lastSave.date} ${lastSave.time})
[Delta transcript will be added here by Claude]
`;
  
  // Write the header to the file
  fs.writeFileSync(filepath, header);
  
  console.log('\n📝 Delta file created with metadata header');
  console.log(`Claude Version: ${metadata.claudeVersion}`);
  
  // Update last save info
  updateLastSaveInfo({
    date: getDateString(),
    time: timestamp,
    file: filepath,
    sessionNumber: sessionNum,
    isDelta: true,
    previousSave: lastSave.file
  });
  
  console.log('\n✅ Delta save prepared');
  console.log(`📁 Location: ${filepath}`);
  
  return filepath;
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
        } catch (e) {
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
            } catch (e) {
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
    formatDelta,
    getSessionNumber,
    saveSession,
    listSessions,
    archiveSessions
  };
}