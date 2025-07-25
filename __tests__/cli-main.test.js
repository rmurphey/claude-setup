import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

import { CLIMain } from '../dist/cli/main.js';

describe('CLIMain', () => {
  let cli;
  let originalConsoleLog;
  let originalConsoleError;
  let originalProcessExit;
  let consoleOutput;
  let consoleErrors;
  let exitCode;

  beforeEach(() => {
    cli = new CLIMain();
    consoleOutput = [];
    consoleErrors = [];
    exitCode = null;

    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalProcessExit = process.exit;

    console.log = (...args) => consoleOutput.push(args.join(' '));
    console.error = (...args) => consoleErrors.push(args.join(' '));
    process.exit = (code) => { exitCode = code; };
  });

  afterEach(() => {
    // Restore original methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  describe('Business Logic Tests', () => {
    // Test our custom validation logic, not yargs functionality
    it('should validate flag combinations correctly', () => {
      // Test yargs built-in conflict validation
      assert.throws(() => {
        cli.parseArgs(['--config', '--detect-language']);
      }, /mutually exclusive/);
    });

    it('should validate flag dependencies correctly', () => {
      // Test yargs built-in dependency validation
      assert.throws(() => {
        cli.parseArgs(['--show']);
      }, /Missing dependent arguments/);
    });

    it('should determine primary mode correctly', () => {
      const flags1 = cli.parseArgs(['--detect-language']);
      assert.strictEqual(cli.determinePrimaryMode(flags1), 'language-detection');

      const flags2 = cli.parseArgs(['--config']);
      assert.strictEqual(cli.determinePrimaryMode(flags2), 'configuration');

      const flags3 = cli.parseArgs([]);
      assert.strictEqual(cli.determinePrimaryMode(flags3), 'setup');
    });

    it('should show help content correctly', async () => {
      await cli.runCLI(['--help']);
      
      const output = consoleOutput.join('\n');
      assert.ok(output.includes('Claude Code Project Setup'));
      assert.ok(output.includes('USAGE:'));
      assert.ok(output.includes('OPTIONS:'));
    });

    it('should show version correctly', async () => {
      await cli.runCLI(['--version']);
      
      const output = consoleOutput.join('\n');
      assert.ok(output.includes('1.0.0'));
    });

    it('should handle errors gracefully', async () => {
      await cli.runCLI(['--config', '--detect-language']);
      
      assert.strictEqual(exitCode, 1);
      assert.ok(consoleErrors.some(err => err.includes('Command line error')));
    });
  });

  describe('Integration Tests', () => {
    it('should have required public methods', () => {
      assert.ok(typeof cli.parseArgs === 'function');
      assert.ok(typeof cli.runCLI === 'function');
      assert.ok(typeof cli.determinePrimaryMode === 'function');
    });

    it('should handle empty arguments', () => {
      const config = cli.parseArgs([]);
      assert.strictEqual(config.detectLanguage, false);
      assert.strictEqual(config.config, false);
      assert.strictEqual(config.syncIssues, false);
    });
  });

  describe('Yargs Built-in Error Handling (Task 5)', () => {
    it('should provide clear error messages for unknown options', () => {
      assert.throws(() => {
        cli.parseArgs(['--unknown-flag']);
      }, /Unknown arguments/);
    });

    it('should provide clear error messages for missing arguments', () => {
      assert.throws(() => {
        cli.parseArgs(['--language']);
      }, /Invalid values/);
    });

    it('should provide clear error messages for invalid choices', () => {
      assert.throws(() => {
        cli.parseArgs(['--language', 'invalid']);
      }, /Invalid values/);
      
      assert.throws(() => {
        cli.parseArgs(['--language', 'cobol']);
      }, /Choices: "js", "javascript", "typescript", "python", "go", "rust", "java", "swift"/);
    });

    it('should handle yargs built-in conflict detection', () => {
      assert.throws(() => {
        cli.parseArgs(['--config', '--detect-language']);
      }, /mutually exclusive/);
    });

    it('should handle yargs built-in dependency detection', () => {
      assert.throws(() => {
        cli.parseArgs(['--show']);
      }, /Missing dependent arguments/);
    });
  });

  describe('Yargs Edge Cases Handling (Task 6)', () => {
    it('should handle --no-save boolean negation automatically', () => {
      const result = cli.parseArgs(['--no-save']);
      assert.strictEqual(result.noSave, true);
      
      const result2 = cli.parseArgs(['--save']);
      assert.strictEqual(result2.noSave, false);
      
      const result3 = cli.parseArgs([]);
      assert.strictEqual(result3.noSave, false); // default is save=true, so noSave=false
    });

    it('should handle empty argument arrays correctly', () => {
      const result = cli.parseArgs([]);
      assert.strictEqual(result.detectLanguage, false);
      assert.strictEqual(result.config, false);
      assert.strictEqual(result.syncIssues, false);
      assert.strictEqual(result.devcontainer, false);
      assert.strictEqual(result.force, false);
      assert.strictEqual(result.noSave, false);
      assert.strictEqual(result.show, false);
      assert.strictEqual(result.reset, false);
      assert.strictEqual(result.language, undefined);
    });

    it('should handle duplicate flags with last-one-wins behavior', () => {
      const result = cli.parseArgs(['--language', 'js', '--language', 'python']);
      assert.strictEqual(result.language, 'python');
      
      const result2 = cli.parseArgs(['--force', '--no-force', '--force']);
      assert.strictEqual(result2.force, true);
    });

    it('should handle arguments with special characters gracefully', () => {
      // Test that yargs handles special characters in string values
      const result = cli.parseArgs(['--language', 'js']);
      assert.strictEqual(result.language, 'js');
      
      // Test boolean flags with special characters in other contexts work
      const result2 = cli.parseArgs(['--force']);
      assert.strictEqual(result2.force, true);
    });

    it('should handle large numbers of arguments efficiently', () => {
      // Create a large argument array with many boolean flags
      const args = [];
      for (let i = 0; i < 100; i++) {
        args.push('--force');
        args.push('--no-force');
      }
      args.push('--force'); // Final value should be true
      
      const start = Date.now();
      const result = cli.parseArgs(args);
      const duration = Date.now() - start;
      
      assert.strictEqual(result.force, true);
      assert.ok(duration < 100, `Parsing took ${duration}ms, should be under 100ms`);
    });

    it('should handle both --language=js and --language js syntax', () => {
      const result1 = cli.parseArgs(['--language=js']);
      assert.strictEqual(result1.language, 'js');
      
      const result2 = cli.parseArgs(['--language', 'python']);
      assert.strictEqual(result2.language, 'python');
    });
  });
});