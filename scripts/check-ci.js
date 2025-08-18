#!/usr/bin/env node

/**
 * Quick CI status check for hygiene command
 */

const { execSync } = require('child_process');

try {
  // Get recent CI runs
  const output = execSync('gh run list --limit 3 --json status,conclusion,name,headBranch', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  const runs = JSON.parse(output);
  const failures = runs.filter(r => r.conclusion === 'failure');
  const successes = runs.filter(r => r.conclusion === 'success');
  
  if (failures.length > 0) {
    console.log('❌ CI has failing workflows:');
    failures.forEach(f => console.log(`   - ${f.name} on ${f.headBranch}: failed`));
  } else if (successes.length > 0) {
    console.log('✅ CI is passing - all workflows successful');
    console.log(`   Last successful: ${successes[0].name}`);
  } else {
    console.log('⏳ CI workflows are running');
  }
} catch {
  console.log('⚠️  CI status unavailable');
}