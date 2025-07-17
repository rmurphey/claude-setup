#!/usr/bin/env node

// New modular CLI - delegate everything to main module
import { CLIMain } from '../lib/cli/main.js';

/**
 * Main entry point - delegate to modular CLI
 */
async function main() {
  const cli = new CLIMain();
  await cli.runCLI(process.argv.slice(2));
}

// Always run main when this CLI script is executed
// This handles direct execution, npx, and other execution methods
if (process.env.NODE_ENV === 'test') {
  // Skip execution during tests - tests will import and call functions directly
} else {
  // Production mode: always run the CLI
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

export { main };