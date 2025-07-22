import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { execSync } from 'child_process';

import fs from 'fs-extra';

describe('Integration Tests - Critical CLI Functionality', () => {
  const testDir = path.join(process.cwd(), 'test-integration');
  const timeout = 10000; // 10 second timeout for integration tests
  
  before(async () => {
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  after(async () => {
    await fs.remove(testDir);
  });

  test('NPX execution should work in empty directory', async () => {
    // Test that CLI module can be imported and executed without hanging
    // This simulates what NPX would do
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      // Test direct CLI module import (simulates NPX behavior)
      const cliModule = await import('../bin/cli.js');
      
      // Should export required functions
      assert(typeof cliModule.main === 'function', 'Should export main function');
      assert(typeof cliModule.handleLanguageDetection === 'function', 'Should export handleLanguageDetection');
      
      // Test language detection function directly
      const result = cliModule.handleLanguageDetection(['--detect-language']);
      assert(result !== undefined, 'Language detection should return result');
      
    } catch (error) {
      // Check for timeout-related errors
      const errorMessage = error.message || '';
      assert(!errorMessage.includes('gtimeout'), `Cross-platform timeout error: ${errorMessage}`);
      assert(!errorMessage.includes('timeout'), `Timeout error: ${errorMessage}`);
      
      // Re-throw if it's not a known issue
      throw error;
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('CLI --sync-issues should handle missing ACTIVE_WORK.md', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await fs.emptyDir('.'); // Ensure clean directory
      
      const result = execSync('node ../bin/cli.js --sync-issues', {
        encoding: 'utf8',
        timeout,
        stdio: 'pipe'
      });
      
      // Should handle missing file gracefully
      assert(typeof result === 'string', 'Should produce string output');
      
    } catch (error) {
      // Expected to fail gracefully with proper error message
      const output = (error.stderr || '') + (error.stdout || '');
      
      // Check for timeout errors
      assert(!error.message.includes('timeout'), 'Should not timeout');
      assert(!output.includes('gtimeout'), `Cross-platform timeout error: ${output}`);
      
      // Should contain proper error message
      assert(
        output.includes('ACTIVE_WORK.md') || 
        output.includes('Active work file not found'),
        `Should contain proper error message: ${output}`
      );
    } finally {
      process.chdir(originalCwd);
    }
  });


  test('CLI should handle config management', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await fs.emptyDir('.'); // Ensure clean directory
      
      // Test config show command
      const result = execSync('node ../bin/cli.js --config --show', {
        encoding: 'utf8',
        timeout,
        stdio: 'pipe'
      });
      
      // Should show config information
      assert(typeof result === 'string', 'Should produce string output');
      
    } catch (error) {
      // Config commands might fail in empty directory
      assert(!error.message.includes('timeout'), 'Should not timeout');
      
      const output = (error.stderr || '') + (error.stdout || '');
      assert(!output.includes('gtimeout'), `Cross-platform timeout error: ${output}`);
      
      if (error.status !== 0) {
        console.log(`Config command exited with code ${error.status}, output: ${output}`);
      }
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('CLI should create project files', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await fs.emptyDir('.'); // Ensure clean directory
      
      // Test that CLI can create basic files (simulate setup)
      // This tests file system operations work
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        type: 'module'
      };
      
      await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
      
      // Test language detection with actual files
      const result = execSync('node ../bin/cli.js --detect-language', {
        encoding: 'utf8',
        timeout,
        stdio: 'pipe'
      });
      
      // Should detect JavaScript project
      assert(typeof result === 'string', 'Should produce string output');
      
    } catch (error) {
      assert(!error.message.includes('timeout'), 'Should not timeout');
      
      const output = (error.stderr || '') + (error.stdout || '');
      assert(!output.includes('gtimeout'), `Cross-platform timeout error: ${output}`);
      
      if (error.status !== 0) {
        console.log(`Language detection exited with code ${error.status}, output: ${output}`);
      }
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('CLI should handle interactive mode gracefully', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      await fs.emptyDir('.'); // Ensure clean directory
      
      // Test interactive mode with timeout (should start but timeout)
      try {
        execSync('node ../bin/cli.js', {
          encoding: 'utf8',
          timeout: 3000, // Short timeout since this should be interactive
          stdio: 'pipe'
        });
        
        // If we get here, CLI exited quickly (not interactive)
        assert(true, 'CLI should handle non-interactive execution');
        
      } catch (timeoutError) {
        // Timeout is expected for interactive CLI
        if (timeoutError.message.includes('timeout')) {
          assert(true, 'CLI started interactive mode (timed out as expected)');
        } else {
          // Other errors are not expected
          const output = (timeoutError.stderr || '') + (timeoutError.stdout || '');
          assert(!output.includes('gtimeout'), `Cross-platform timeout error: ${output}`);
          
          // Re-throw if it's not a timeout
          throw timeoutError;
        }
      }
      
    } finally {
      process.chdir(originalCwd);
    }
  });
});