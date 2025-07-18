#!/usr/bin/env node
export function setupProject(config: any): Promise<any>;
/**
 * Main entry point - delegate to modular CLI
 */
export function main(): Promise<void>;
export { generateClaudeTemplate, generateActiveWorkTemplate, generateGitignore, getDevContainerConfig } from "../lib/cli/setup.js";
export { handleLanguageDetection, handleConfigManagement, handleSyncIssues } from "../lib/cli/utils.js";
//# sourceMappingURL=cli.d.ts.map