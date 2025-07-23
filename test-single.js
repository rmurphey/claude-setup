import { describe, it } from 'node:test';
import assert from 'node:assert';

import { CLIMain } from './dist/cli/main.js';

describe('CLIMain Basic Test', () => {
  it('should create instance', () => {
    const cli = new CLIMain();
    assert.ok(cli);
  });
  
  it('should parse basic flags', () => {
    const cli = new CLIMain();
    const config = cli.parseArgs(['--help']);
    assert.strictEqual(config.help, true);
  });
});