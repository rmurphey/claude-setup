#!/usr/bin/env node

// New modular CLI - delegate everything to main module
import { CLIMain } from '../dist/lib/cli/main.js';

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

// Re-export functions for backward compatibility with tests
export { main };

// Re-export functions from setup module
export { 
  generateClaudeTemplate,
  generateActiveWorkTemplate, 
  generateGitignore,
  getDevContainerConfig
} from '../dist/lib/cli/setup.js';

// Re-export functions from utils module
export { 
  handleLanguageDetection,
  handleConfigManagement,
  handleSyncIssues
} from '../dist/lib/cli/utils.js';

// Re-export setupProject function
export async function setupProject(config) {
  const { ProjectSetup } = await import('../dist/lib/cli/setup.js');
  const setup = new ProjectSetup();
  return setup.setupProject(config);
}