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
});