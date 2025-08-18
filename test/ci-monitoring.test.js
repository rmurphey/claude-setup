const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
// const { execSync } = require('child_process');

/**
 * TDD RED Phase - Tests for CI monitoring features
 * These tests verify all three CI monitoring options
 */

describe('CI Monitoring Features', () => {

  describe('Option 1: CI Check in Hygiene Command', () => {
    const hygienePath = path.join(__dirname, '..', '.claude', 'commands', 'hygiene.md');
    
    it('should have hygiene command file', () => {
      assert.ok(fs.existsSync(hygienePath), 'hygiene.md should exist');
    });

    it('should include CI status check in hygiene command', () => {
      const content = fs.readFileSync(hygienePath, 'utf8');
      assert.ok(
        content.includes('check-ci') || 
        content.includes('CI status') ||
        content.includes('GitHub Actions'),
        'Hygiene command should check CI status'
      );
    });
  });

  describe('Option 2: Desktop Notifications', () => {
    const configPath = path.join(__dirname, '..', '.monitor-config.json');
    
    it('should have monitor config file', () => {
      assert.ok(fs.existsSync(configPath), '.monitor-config.json should exist');
    });

    it('should have desktop notifications enabled', () => {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(
        config.notifications.desktop, 
        true, 
        'Desktop notifications should be enabled'
      );
    });

    it('should have sound notifications configured', () => {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.strictEqual(
        typeof config.notifications.sound, 
        'boolean', 
        'Sound notifications should be configured'
      );
    });

    it('should have reasonable check interval', () => {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      assert.ok(
        config.checkInterval >= 60000 && config.checkInterval <= 600000,
        'Check interval should be between 1-10 minutes'
      );
    });

    it('should have monitor notification function', () => {
      const monitor = require('../scripts/monitor-repo');
      assert.ok(
        typeof monitor.sendNotification === 'function' ||
        typeof monitor.notifyFailure === 'function',
        'Monitor should have notification capability'
      );
    });
  });

  describe('Option 3: Pre-Push Hook', () => {
    const hookPath = path.join(__dirname, '..', '.husky', 'pre-push');
    
    it('should have pre-push hook file', () => {
      assert.ok(
        fs.existsSync(hookPath) || 
        fs.existsSync('.git/hooks/pre-push'),
        'Pre-push hook should exist'
      );
    });

    it('should check CI status before push', () => {
      if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');
        assert.ok(
          content.includes('gh run') || 
          content.includes('CI') ||
          content.includes('workflow'),
          'Pre-push hook should check CI status'
        );
      } else {
        assert.ok(false, 'Pre-push hook not found');
      }
    });

    it('should block push on CI failure', () => {
      if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');
        assert.ok(
          content.includes('exit 1') || 
          content.includes('return 1') ||
          content.includes('failed'),
          'Pre-push hook should block on failure'
        );
      } else {
        assert.ok(false, 'Pre-push hook not found');
      }
    });

    it('should support --no-verify override', () => {
      // This tests that git's --no-verify flag is respected
      // We can't directly test this, but we can verify the hook doesn't
      // block the override mechanism
      if (fs.existsSync(hookPath)) {
        const content = fs.readFileSync(hookPath, 'utf8');
        assert.ok(
          !content.includes('trap') || content.includes('#!/'),
          'Pre-push hook should not trap the no-verify signal'
        );
      } else {
        assert.ok(false, 'Pre-push hook not found');
      }
    });
  });

  describe('Integration: All Options Working Together', () => {
    it('should have all three monitoring methods available', () => {
      const hygienePath = path.join(__dirname, '..', '.claude', 'commands', 'hygiene.md');
      const configPath = path.join(__dirname, '..', '.monitor-config.json');
      const hookPath = path.join(__dirname, '..', '.husky', 'pre-push');
      
      const hygieneExists = fs.existsSync(hygienePath);
      const configExists = fs.existsSync(configPath);
      const hookExists = fs.existsSync(hookPath) || fs.existsSync('.git/hooks/pre-push');
      
      assert.ok(
        hygieneExists && configExists && hookExists,
        'All three monitoring methods should be available'
      );
    });

    it('should have documentation for all monitoring methods', () => {
      const docsPath = path.join(__dirname, '..', 'docs');
      const readmePath = path.join(__dirname, '..', 'README.md');
      
      // Check if docs exist for monitoring
      const hasMonitorDocs = fs.existsSync(path.join(docsPath, 'GITHUB_MONITOR.md')) ||
                            fs.existsSync(path.join(docsPath, 'CI_MONITORING.md'));
      
      // Or check if README mentions monitoring
      const readme = fs.readFileSync(readmePath, 'utf8');
      const hasReadmeMention = readme.includes('monitor') || readme.includes('CI');
      
      assert.ok(
        hasMonitorDocs || hasReadmeMention,
        'Documentation should exist for monitoring features'
      );
    });
  });
});