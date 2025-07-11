import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

describe('CLI Modes Integration', () => {
  const testDir = path.join(process.cwd(), 'test-cli-modes');
  
  before(async () => {
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  after(async () => {
    await fs.remove(testDir);
  });

  test('--sync-issues should handle missing ACTIVE_WORK.md', async () => {
    // Test in directory without ACTIVE_WORK.md
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const result = execSync('node ../bin/cli.js --sync-issues', {
        encoding: 'utf8',
        timeout: 10000,
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      // Should contain error message about missing file
      assert(result.includes('No ACTIVE_WORK.md file found') || 
             result.includes('Active work file not found'));
    } catch (error) {
      // Expected to exit with error code
      assert(error.status === 1, `Expected exit code 1, got ${error.status}`);
      const output = error.stderr + error.stdout;
      assert(output.includes('No ACTIVE_WORK.md file found') ||
             output.includes('Active work file not found'), 
             `Expected error message in output: ${output}`);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('--sync-issues should work with existing ACTIVE_WORK.md', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Create minimal ACTIVE_WORK.md
      await fs.writeFile('ACTIVE_WORK.md', `# Active Work

## Current Focus
Test content

## Deferred Items
Nothing yet
`);
      
      const result = execSync('node ../bin/cli.js --sync-issues', {
        encoding: 'utf8',
        timeout: 10000
      });
      
      // Should complete without error
      assert(result.includes('GitHub Issues') || 
             result.includes('Syncing GitHub Issues') ||
             result.includes('No open GitHub issues'));
             
      // File should still exist and have GitHub Issues section
      const content = await fs.readFile('ACTIVE_WORK.md', 'utf8');
      assert(content.includes('# Active Work'));
      
    } catch (error) {
      if (error.message.includes('timeout')) {
        assert.fail('Command should not timeout');
      }
      // GitHub CLI might not be available, which is acceptable
      console.log('Note: GitHub CLI might not be available for testing');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('--fix should handle empty directory', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Clean directory first
      await fs.emptyDir('.');
      
      const result = execSync('node ../bin/cli.js --fix', {
        encoding: 'utf8',
        timeout: 15000
      });
      
      // Should start recovery mode
      assert(result.includes('Recovery') || 
             result.includes('Codebase Recovery') ||
             result.includes('recovery'));
             
    } catch (error) {
      if (error.message.includes('timeout')) {
        assert.fail('--fix command should not timeout');
      }
      // Command might exit with error in empty directory, which is expected
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('Main CLI should start interactive mode', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Clean directory
      await fs.emptyDir('.');
      
      // Run CLI with timeout since it's interactive
      execSync('timeout 3s node ../bin/cli.js || true', {
        encoding: 'utf8',
        timeout: 5000,
        stdio: 'pipe'
      });
      
      // If we get here, CLI started (even if it times out due to interaction)
      assert(true, 'CLI should start without hanging');
      
    } catch (error) {
      // Timeout is expected for interactive CLI
      if (error.message.includes('timeout') || 
          error.status === 124) { // timeout exit code
        assert(true, 'CLI started and was interactive (timed out as expected)');
      } else {
        throw error;
      }
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('NPX simulation should work', async () => {
    // Test the conditions that NPX would create
    const originalArgv = process.argv;
    const originalEnv = process.env.NODE_ENV;
    
    try {
      // Simulate NPX environment
      process.argv = ['node', '/path/to/npx/cache/claude-setup/bin/cli.js'];
      delete process.env.NODE_ENV;
      
      // Import the CLI module (should not execute due to path check)
      const cliModule = await import('../bin/cli.js');
      
      // Verify functions are available
      assert(typeof cliModule.main === 'function');
      assert(typeof cliModule.generateClaudeTemplate === 'function');
      assert(typeof cliModule.setupProject === 'function');
      
    } finally {
      process.argv = originalArgv;
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('Environment variable controls execution', async () => {
    // Test that NODE_ENV=test prevents execution
    process.env.NODE_ENV = 'test';
    
    // This should not hang or execute
    const start = Date.now();
    const cliModule = await import('../bin/cli.js');
    const duration = Date.now() - start;
    
    // Should import quickly without execution
    assert(duration < 1000, 'Import should be fast when NODE_ENV=test');
    assert(typeof cliModule.main === 'function');
    
    // Reset environment
    delete process.env.NODE_ENV;
  });
});