#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  since: '1 day ago',
  commits: 10,
  update: false,
  metrics: false
};

// Process arguments
args.forEach(arg => {
  if (arg.startsWith('--since=')) {
    options.since = arg.split('=')[1];
  } else if (arg.startsWith('--commits=')) {
    options.commits = parseInt(arg.split('=')[1]);
  } else if (arg === '--update') {
    options.update = true;
  } else if (arg === '--metrics') {
    options.metrics = true;
  }
});

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return '';
  }
}

function analyzeGitHistory() {
  const gitLog = runCommand(`git log --since="${options.since}" --oneline -${options.commits}`);
  const commits = gitLog.split('\n').filter(line => line);
  
  // Analyze commit patterns
  const patterns = {
    feat: 0,
    fix: 0,
    refactor: 0,
    docs: 0,
    test: 0,
    chore: 0,
    style: 0
  };
  
  commits.forEach(commit => {
    Object.keys(patterns).forEach(pattern => {
      if (commit.includes(`${pattern}:`)) {
        patterns[pattern]++;
      }
    });
  });
  
  return { commits, patterns };
}

function getMetrics() {
  const stats = runCommand(`git diff --stat HEAD~${options.commits}`);
  const statsLine = stats.split('\n').slice(-1)[0] || '';
  
  const filesChanged = (statsLine.match(/(\d+) files? changed/) || [0, 0])[1];
  const insertions = (statsLine.match(/(\d+) insertions?/) || [0, 0])[1];
  const deletions = (statsLine.match(/(\d+) deletions?/) || [0, 0])[1];
  
  return { filesChanged, insertions, deletions };
}

function identifyLearnings(commits) {
  const learnings = [];
  
  // Look for patterns indicating learnings
  if (commits.some(c => c.includes('fix:'))) {
    learnings.push('Bug fixes indicate areas needing more testing');
  }
  
  if (commits.some(c => c.includes('refactor:'))) {
    learnings.push('Refactoring suggests initial implementation could be improved');
  }
  
  if (commits.filter(c => c.includes('docs:')).length > 2) {
    learnings.push('Multiple documentation updates suggest initial docs were incomplete');
  }
  
  // Check for reverts or fixes to recent commits
  const revertPattern = /revert|undo|fix.*previous/i;
  if (commits.some(c => revertPattern.test(c))) {
    learnings.push('Reverts suggest need for better testing before commits');
  }
  
  return learnings;
}

function generateReport() {
  console.log('\n📊 Session Retrospective\n');
  console.log('='.repeat(50));
  
  const { commits, patterns } = analyzeGitHistory();
  
  console.log(`\n📅 Period: ${options.since}`);
  console.log(`📝 Total Commits: ${commits.length}`);
  
  if (options.metrics) {
    const metrics = getMetrics();
    console.log(`\n📈 Metrics:`);
    console.log(`  Files Changed: ${metrics.filesChanged}`);
    console.log(`  Lines Added: ${metrics.insertions}`);
    console.log(`  Lines Removed: ${metrics.deletions}`);
    console.log(`  Net Change: ${metrics.insertions - metrics.deletions}`);
  }
  
  console.log(`\n🔍 Commit Patterns:`);
  Object.entries(patterns)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .forEach(([type, count]) => {
      const percentage = Math.round((count / commits.length) * 100);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
  
  console.log(`\n💡 Recent Changes:`);
  commits.slice(0, 5).forEach(commit => {
    console.log(`  • ${commit}`);
  });
  
  const learnings = identifyLearnings(commits);
  if (learnings.length > 0) {
    console.log(`\n🎓 Potential Learnings:`);
    learnings.forEach(learning => {
      console.log(`  • ${learning}`);
    });
  }
  
  console.log(`\n📝 Recommendations:`);
  
  // Generate recommendations based on patterns
  if (patterns.test === 0) {
    console.log('  • Add tests for recent changes');
  }
  
  if (patterns.docs === 0 && commits.length > 5) {
    console.log('  • Update documentation for recent features');
  }
  
  if (patterns.fix > patterns.feat) {
    console.log('  • Focus on stability before adding new features');
  }
  
  if ((patterns.refactor / commits.length) > 0.3) {
    console.log('  • Consider more upfront design to reduce refactoring');
  }
  
  console.log('  • Review LEARNINGS.md for captured patterns');
  console.log('  • Update ACTIVE_WORK.md with session insights');
  console.log('  • Run tests before next session');
  
  if (options.update) {
    updateLearnings(commits, patterns, learnings);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Retrospective complete\n');
}

function updateLearnings(commits, patterns, learnings) {
  const learningsFile = path.join(process.cwd(), 'LEARNINGS.md');
  
  if (!fs.existsSync(learningsFile)) {
    console.log('\n⚠️  LEARNINGS.md not found, skipping update');
    return;
  }
  
  const date = new Date().toISOString().split('T')[0];
  const entry = `
### Session Retrospective - ${date}
**Commits**: ${commits.length}
**Primary Focus**: ${Object.entries(patterns).sort(([,a], [,b]) => b - a)[0]?.[0] || 'mixed'}

#### Patterns Observed
${Object.entries(patterns)
  .filter(([, count]) => count > 0)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

#### Key Insights
${learnings.map(l => `- ${l}`).join('\n') || '- Session focused on implementation'}

---
`;
  
  // Read current content
  let content = fs.readFileSync(learningsFile, 'utf8');
  
  // Find the Recent Session Learnings section and add entry
  const marker = '## Recent Session Learnings';
  const index = content.indexOf(marker);
  
  if (index !== -1) {
    const nextSection = content.indexOf('\n##', index + marker.length);
    const insertPoint = content.indexOf('\n', index + marker.length) + 1;
    
    content = content.slice(0, insertPoint) + entry + content.slice(insertPoint);
    
    fs.writeFileSync(learningsFile, content);
    console.log('\n✅ Updated LEARNINGS.md with retrospective');
  }
}

// Run the retrospective
generateReport();