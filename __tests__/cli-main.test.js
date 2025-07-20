import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

import { CLIMain } from '../lib/cli/main.js';

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

  describe('parseArgs', () => {
    it('should parse basic flags correctly', () => {
      const config = cli.parseArgs(['--help', '--version']);
      assert.strictEqual(config.help, true);
      assert.strictEqual(config.version, true);
      assert.strictEqual(config.fix, false);
    });

    it('should parse short flags correctly', () => {
      const config = cli.parseArgs(['-h', '-v']);
      assert.strictEqual(config.help, true);
      assert.strictEqual(config.version, true);
    });

    it('should parse language flag with equals syntax', () => {
      const config = cli.parseArgs(['--language=js']);
      assert.strictEqual(config.language, 'js');
    });

    it('should parse language flag with space syntax', () => {
      const config = cli.parseArgs(['--language', 'python']);
      assert.strictEqual(config.language, 'python');
    });

    it('should handle multiple flags correctly', () => {
      const config = cli.parseArgs(['--fix', '--dry-run', '--force']);
      assert.strictEqual(config.fix, true);
      assert.strictEqual(config.dryRun, true);
      assert.strictEqual(config.force, true);
    });

    it('should throw error for unknown flags', () => {
      assert.throws(() => {
        cli.parseArgs(['--unknown-flag']);
      }, /Unknown flag: --unknown-flag/);
    });

    it('should throw error for language flag without value', () => {
      assert.throws(() => {
        cli.parseArgs(['--language']);
      }, /--language flag requires a value/);
    });

    it('should throw error for invalid language value', () => {
      assert.throws(() => {
        cli.parseArgs(['--language=invalid']);
      }, /Invalid language: invalid/);
    });

    it('should accept valid language values', () => {
      const validLanguages = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'];
      
      for (const lang of validLanguages) {
        const config = cli.parseArgs([`--language=${lang}`]);
        assert.strictEqual(config.language, lang);
      }
    });
  });

  describe('validateFlagCombinations', () => {
    it('should throw error for conflicting flags', () => {
      assert.throws(() => {
        cli.parseArgs(['--fix', '--detect-language']);
      }, /--fix cannot be used with: --detect-language/);
    });

    it('should throw error for multiple conflicting flags', () => {
      assert.throws(() => {
        cli.parseArgs(['--config', '--fix', '--sync-issues']);
      }, /cannot be used with/);
    });

    it('should throw error for missing dependencies', () => {
      assert.throws(() => {
        cli.parseArgs(['--dry-run']);
      }, /--dry-run requires: --fix/);
    });

    it('should throw error for show without config', () => {
      assert.throws(() => {
        cli.parseArgs(['--show']);
      }, /--show requires: --config/);
    });

    it('should throw error for reset without config', () => {
      assert.throws(() => {
        cli.parseArgs(['--reset']);
      }, /--reset requires: --config/);
    });

    it('should throw error for show and reset together', () => {
      assert.throws(() => {
        cli.parseArgs(['--config', '--show', '--reset']);
      }, /--show cannot be used with: --reset/);
    });

    it('should allow valid flag combinations', () => {
      // These should not throw
      assert.doesNotThrow(() => cli.parseArgs(['--fix', '--dry-run']));
      assert.doesNotThrow(() => cli.parseArgs(['--fix', '--auto-fix']));
      assert.doesNotThrow(() => cli.parseArgs(['--config', '--show']));
      assert.doesNotThrow(() => cli.parseArgs(['--config', '--reset']));
      assert.doesNotThrow(() => cli.parseArgs(['--detect-language', '--force']));
    });
  });

  describe('extractFlagValue', () => {
    it('should extract value from equals format', () => {
      const value = cli.extractFlagValue(['--language=js'], '--language');
      assert.strictEqual(value, 'js');
    });

    it('should extract value from space format', () => {
      const value = cli.extractFlagValue(['--language', 'python'], '--language');
      assert.strictEqual(value, 'python');
    });

    it('should return null for missing flag', () => {
      const value = cli.extractFlagValue(['--other-flag'], '--language');
      assert.strictEqual(value, null);
    });

    it('should return null for flag without value', () => {
      const value = cli.extractFlagValue(['--language'], '--language');
      assert.strictEqual(value, null);
    });

    it('should not extract flag as value', () => {
      const value = cli.extractFlagValue(['--language', '--other-flag'], '--language');
      assert.strictEqual(value, null);
    });
  });

  describe('determinePrimaryMode', () => {
    it('should return recovery for fix flag', () => {
      const config = { fix: true };
      assert.strictEqual(cli.determinePrimaryMode(config), 'recovery');
    });

    it('should return language-detection for detectLanguage flag', () => {
      const config = { detectLanguage: true };
      assert.strictEqual(cli.determinePrimaryMode(config), 'language-detection');
    });

    it('should return configuration for config flag', () => {
      const config = { config: true };
      assert.strictEqual(cli.determinePrimaryMode(config), 'configuration');
    });

    it('should return sync-issues for syncIssues flag', () => {
      const config = { syncIssues: true };
      assert.strictEqual(cli.determinePrimaryMode(config), 'sync-issues');
    });

    it('should return setup as default', () => {
      const config = {};
      assert.strictEqual(cli.determinePrimaryMode(config), 'setup');
    });

    it('should prioritize modes correctly', () => {
      // Fix should take priority over other modes
      const config = { fix: true, detectLanguage: true };
      assert.strictEqual(cli.determinePrimaryMode(config), 'recovery');
    });
  });

  describe('configKeyToFlag', () => {
    it('should convert config keys to flag names', () => {
      assert.strictEqual(cli.configKeyToFlag('help'), '--help');
      assert.strictEqual(cli.configKeyToFlag('version'), '--version');
      assert.strictEqual(cli.configKeyToFlag('fix'), '--fix');
      assert.strictEqual(cli.configKeyToFlag('dryRun'), '--dry-run');
      assert.strictEqual(cli.configKeyToFlag('autoFix'), '--auto-fix');
      assert.strictEqual(cli.configKeyToFlag('detectLanguage'), '--detect-language');
      assert.strictEqual(cli.configKeyToFlag('syncIssues'), '--sync-issues');
    });

    it('should handle unknown keys', () => {
      assert.strictEqual(cli.configKeyToFlag('unknown'), '--unknown');
    });
  });

  describe('isValidLanguage', () => {
    it('should accept valid languages', () => {
      const validLanguages = ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift'];
      
      for (const lang of validLanguages) {
        assert.strictEqual(cli.isValidLanguage(lang), true);
      }
    });

    it('should accept case insensitive languages', () => {
      assert.strictEqual(cli.isValidLanguage('JS'), true);
      assert.strictEqual(cli.isValidLanguage('Python'), true);
      assert.strictEqual(cli.isValidLanguage('RUST'), true);
    });

    it('should reject invalid languages', () => {
      assert.strictEqual(cli.isValidLanguage('invalid'), false);
      assert.strictEqual(cli.isValidLanguage('cpp'), false);
      assert.strictEqual(cli.isValidLanguage(''), false);
    });
  });

  describe('showHelp', () => {
    it('should display help information', () => {
      cli.showHelp();
      
      const output = consoleOutput.join('\n');
      assert.ok(output.includes('Claude Code Project Setup'));
      assert.ok(output.includes('USAGE:'));
      assert.ok(output.includes('OPTIONS:'));
      assert.ok(output.includes('EXAMPLES:'));
      assert.ok(output.includes('MODES:'));
      assert.ok(output.includes('--language <lang>'));
      assert.ok(output.includes('FLAG DEPENDENCIES:'));
    });
  });

  describe('runCLI error handling', () => {
    it('should handle argument validation errors gracefully', async () => {
      await cli.runCLI(['--unknown-flag']);
      
      assert.strictEqual(exitCode, 1);
      assert.ok(consoleErrors.some(err => err.includes('Command line error')));
      assert.ok(consoleErrors.some(err => err.includes('Unknown flag: --unknown-flag')));
    });

    it('should handle flag combination errors gracefully', async () => {
      await cli.runCLI(['--fix', '--detect-language']);
      
      assert.strictEqual(exitCode, 1);
      assert.ok(consoleErrors.some(err => err.includes('Command line error')));
      assert.ok(consoleErrors.some(err => err.includes('cannot be used with')));
    });

    it('should show help suggestion for argument errors', async () => {
      await cli.runCLI(['--invalid']);
      
      assert.ok(consoleOutput.some(out => out.includes('Use --help to see available options')));
    });
  });

  describe('Edge cases', () => {
    it('should handle empty arguments', () => {
      const config = cli.parseArgs([]);
      assert.strictEqual(config.help, false);
      assert.strictEqual(config.version, false);
      assert.strictEqual(config.fix, false);
    });

    it('should handle arguments with special characters', () => {
      assert.throws(() => {
        cli.parseArgs(['--language=c++']);
      }, /Invalid language: c\+\+/);
    });

    it('should handle mixed case in language validation', () => {
      const config = cli.parseArgs(['--language=JavaScript']);
      assert.strictEqual(config.language, 'JavaScript');
    });

    it('should handle multiple equals signs in flag value', () => {
      // This is an edge case that might occur with complex values
      const value = cli.extractFlagValue(['--language=js=test'], '--language');
      assert.strictEqual(value, 'js=test');
    });

    it('should handle flags at different positions', () => {
      const config = cli.parseArgs(['--force', '--language=js', '--no-save']);
      assert.strictEqual(config.force, true);
      assert.strictEqual(config.language, 'js');
      assert.strictEqual(config.noSave, true);
    });

    it('should handle duplicate flags (last one wins)', () => {
      const config = cli.parseArgs(['--language=js', '--language=python']);
      assert.strictEqual(config.language, 'python');
    });
  });

  describe('Performance and boundary conditions', () => {
    it('should handle large number of arguments efficiently', () => {
      const manyArgs = Array(1000).fill('--force');
      const startTime = Date.now();
      const config = cli.parseArgs(manyArgs);
      const endTime = Date.now();
      
      assert.strictEqual(config.force, true);
      assert.ok(endTime - startTime < 100, 'Parsing should complete quickly');
    });

    it('should handle very long flag values', () => {
      const longValue = 'a'.repeat(1000);
      assert.throws(() => {
        cli.parseArgs([`--language=${longValue}`]);
      }, /Invalid language/);
    });
  });
});