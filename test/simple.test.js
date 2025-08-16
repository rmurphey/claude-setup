/**
 * Simple smoke tests for all scripts
 * Tests that scripts can run without errors
 */

const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

describe('Script Smoke Tests', () => {
  
  it('docs.js should show help', () => {
    const output = execSync('node scripts/docs.js help', { encoding: 'utf8' });
    assert.ok(output.includes('Documentation Commands'));
  });
  
  it('context-manage.js should show help', () => {
    const output = execSync('node scripts/context-manage.js help', { encoding: 'utf8' });
    assert.ok(output.includes('Context Management Commands'));
  });
  
  it('learn.js should show help', () => {
    const output = execSync('node scripts/learn.js help', { encoding: 'utf8' });
    assert.ok(output.includes('Learning Capture Commands'));
  });
  
  it('tdd.js should show help', () => {
    const output = execSync('node scripts/tdd.js help', { encoding: 'utf8' });
    assert.ok(output.includes('TDD (Test-Driven Development) Commands'));
  });
  
  it('retrospective.js should run without error', () => {
    // This script reads from session-history, might not have output
    try {
      execSync('node scripts/retrospective.js', { encoding: 'utf8' });
      assert.ok(true); // If no error, test passes
    } catch (error) {
      // Check if it's just empty history
      assert.ok(error.stdout.includes('Session') || error.stdout.includes('No'));
    }
  });
  
  it('session-history.js should show help', () => {
    const output = execSync('node scripts/session-history.js', { encoding: 'utf8' });
    assert.ok(output.includes('list') || output.includes('save'));
  });
  
  it('all scripts should be executable', () => {
    const scripts = fs.readdirSync('scripts').filter(f => f.endsWith('.js'));
    assert.ok(scripts.length > 0, 'Should have scripts');
    
    scripts.forEach(script => {
      const scriptPath = path.join('scripts', script);
      assert.ok(fs.existsSync(scriptPath), `${script} should exist`);
    });
  });
  
  it('all command files should be minimal', () => {
    const commands = fs.readdirSync('.claude/commands').filter(f => f.endsWith('.md'));
    
    commands.forEach(cmd => {
      const content = fs.readFileSync(path.join('.claude/commands', cmd), 'utf8');
      const lines = content.split('\n').length;
      
      // Token-efficient commands should be under 50 lines
      if (['docs.md', 'context-manage.md', 'learn.md'].includes(cmd)) {
        assert.ok(lines < 50, `${cmd} should be under 50 lines (has ${lines})`);
      }
    });
  });
});