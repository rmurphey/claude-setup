#!/usr/bin/env node

/**
 * GitHub Issue Management for Todo System
 * Replaces ACTIVE_WORK.md with GitHub Issues
 */

const { execSync } = require('child_process');

const LABELS = {
  priority: ['high', 'medium', 'low'],
  type: ['bug', 'feature', 'docs', 'refactor', 'test'],
  status: ['blocked', 'in-progress'],
  area: ['commands', 'scripts', 'docs', 'ci', 'setup']
};

function exec(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

function formatIssue(issue) {
  const parts = issue.split('\t');
  const number = parts[0];
  const state = parts[1];
  const title = parts[2];
  const labels = parts[3] || '';
  
  const stateIcon = state === 'OPEN' ? '🔵' : '✅';
  const labelStr = labels ? ` [${labels}]` : '';
  
  return `${stateIcon} #${number}: ${title}${labelStr}`;
}

function listIssues(filter = 'open') {
  console.log(`\n📋 GitHub Issues (${filter}):`);
  console.log('─'.repeat(50));
  
  const stateFlag = filter === 'all' ? '' : `--state ${filter}`;
  const command = `gh issue list ${stateFlag} --limit 30 --json number,state,title,labels,updatedAt --template '{{range .}}{{.number}}\t{{.state}}\t{{.title}}\t{{range .labels}}{{.name}} {{end}}\t{{.updatedAt}}{{println}}{{end}}'`;
  
  const output = exec(command);
  
  if (!output) {
    console.log('No issues found');
    return;
  }
  
  const issues = output.split('\n').filter(Boolean);
  issues.forEach(issue => {
    console.log(formatIssue(issue));
  });
  
  console.log('─'.repeat(50));
  console.log(`Total: ${issues.length} issues`);
}

function createIssue(title, body = '', labels = []) {
  console.log(`\n➕ Creating issue: "${title}"`);
  
  const labelFlag = labels.length > 0 ? `--label "${labels.join(',')}"` : '';
  const bodyFlag = body ? `--body "${body}"` : '';
  
  const command = `gh issue create --title "${title}" ${bodyFlag} ${labelFlag}`;
  const result = exec(command);
  
  console.log(`✅ Issue created: ${result}`);
  return result;
}

function closeIssue(number, comment = '') {
  console.log(`\n✅ Closing issue #${number}`);
  
  if (comment) {
    exec(`gh issue comment ${number} --body "${comment}"`);
  }
  
  exec(`gh issue close ${number}`);
  console.log(`Issue #${number} closed`);
}

function reopenIssue(number, comment = '') {
  console.log(`\n🔄 Reopening issue #${number}`);
  
  if (comment) {
    exec(`gh issue comment ${number} --body "${comment}"`);
  }
  
  exec(`gh issue reopen ${number}`);
  console.log(`Issue #${number} reopened`);
}

function addComment(number, comment) {
  console.log(`\n💬 Adding comment to issue #${number}`);
  exec(`gh issue comment ${number} --body "${comment}"`);
  console.log(`Comment added to issue #${number}`);
}

function showIssue(number) {
  console.log(`\n📄 Issue #${number} Details:`);
  console.log('─'.repeat(50));
  
  const issue = exec(`gh issue view ${number}`);
  console.log(issue);
}

function showStats() {
  console.log('\n📊 Issue Statistics:');
  console.log('─'.repeat(50));
  
  const openCount = exec('gh issue list --state open --limit 999 --json number --jq "length"');
  const closedCount = exec('gh issue list --state closed --limit 999 --json number --jq "length"');
  
  console.log(`🔵 Open: ${openCount}`);
  console.log(`✅ Closed: ${closedCount}`);
  console.log(`📈 Total: ${parseInt(openCount) + parseInt(closedCount)}`);
  
  // Get label distribution
  console.log('\n🏷️  Label Distribution:');
  const labels = exec('gh issue list --state open --limit 999 --json labels --jq "[.[].labels[].name] | group_by(.) | map({label: .[0], count: length})"');
  
  if (labels && labels !== '[]') {
    const labelData = JSON.parse(labels);
    labelData.forEach(item => {
      console.log(`  ${item.label}: ${item.count}`);
    });
  }
}

function showHelp() {
  console.log(`
📋 GitHub Issue Todo Management

Usage: node scripts/todo-github.js <command> [options]

Commands:
  list [filter]        List issues (open/closed/all, default: open)
  add <title> [body]   Create new issue
  done <number>        Close an issue
  reopen <number>      Reopen an issue
  comment <number>     Add comment to issue
  show <number>        Show issue details
  stats               Show issue statistics
  help                Show this help

Examples:
  node scripts/todo-github.js list
  node scripts/todo-github.js add "Fix login bug"
  node scripts/todo-github.js done 42
  node scripts/todo-github.js comment 42 "Working on this"

Labels:
  Priority: ${LABELS.priority.join(', ')}
  Type: ${LABELS.type.join(', ')}
  Status: ${LABELS.status.join(', ')}
  Area: ${LABELS.area.join(', ')}
`);
}

// Main execution
const command = process.argv[2] || 'list';
const args = process.argv.slice(3);

switch (command) {
  case 'list':
    listIssues(args[0] || 'open');
    break;
    
  case 'add':
  case 'create':
    if (!args[0]) {
      console.error('Error: Title required');
      process.exit(1);
    }
    createIssue(args[0], args[1] || '');
    break;
    
  case 'done':
  case 'close':
    if (!args[0]) {
      console.error('Error: Issue number required');
      process.exit(1);
    }
    closeIssue(args[0], args[1]);
    break;
    
  case 'reopen':
    if (!args[0]) {
      console.error('Error: Issue number required');
      process.exit(1);
    }
    reopenIssue(args[0], args[1]);
    break;
    
  case 'comment':
    if (!args[0] || !args[1]) {
      console.error('Error: Issue number and comment required');
      process.exit(1);
    }
    addComment(args[0], args.slice(1).join(' '));
    break;
    
  case 'show':
  case 'view':
    if (!args[0]) {
      console.error('Error: Issue number required');
      process.exit(1);
    }
    showIssue(args[0]);
    break;
    
  case 'stats':
  case 'status':
    showStats();
    break;
    
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
    
  default:
    console.error(`Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}