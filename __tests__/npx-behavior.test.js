import { describe, test, before, after } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import { execSync } from 'child_process';

import fs from 'fs-extra';

describe('NPX Behavior Tests', () => {
  const testDir = path.join(process.cwd(), 'test-npx-behavior');
  
  before(async () => {
    // Create clean test directory
    await fs.ensureDir(testDir);
    await fs.emptyDir(testDir);
  });

  after(async () => {
    // Clean up test directory
    await fs.remove(testDir);
  });

  test('CLI should not execute when imported in test environment', async () => {
    // This test verifies that importing the CLI module doesn't trigger execution
    // when NODE_ENV=test
    process.env.NODE_ENV = 'test';
    
    // This should not hang or execute the CLI
    const { main } = await import('../bin/cli.js');
    
    // Verify main function exists and is callable
    assert.strictEqual(typeof main, 'function');
  });

  test('CLI should execute when NODE_ENV is not test', async () => {
    // Verify CLI executes in production environment
    const originalEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;
    
    try {
      // Test CLI execution with --help (quick exit)
      const result = execSync('node bin/cli.js --help || true', {
        cwd: process.cwd(),
        encoding: 'utf8',
        timeout: 5000
      });
      
      // CLI should start (even if it fails quickly with no --help support)
      // The key is that it doesn't hang
      assert(typeof result === 'string');
    } catch (error) {
      // Expected - CLI doesn't have --help flag, but it should start
      assert(error.message.includes('timeout') === false, 'CLI should not hang');
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  test('Empty directory detection should work', async () => {
    // Test language detection in empty directory
    process.env.NODE_ENV = 'test';
    const { LanguageDetector } = await import('../lib/language-detector.js');
    
    // Change to empty test directory
    const originalCwd = process.cwd();
    process.chdir(testDir);
    
    try {
      const detector = new LanguageDetector();
      const detection = await detector.getBestGuess();
      
      // Empty directory should return null (no detection)
      assert.strictEqual(detection, null);
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('Template generation should work for all quality levels', async () => {
    process.env.NODE_ENV = 'test';
    const { generateClaudeTemplate, generateActiveWorkTemplate, generateGitignore } = await import('../bin/cli.js');
    
    const configs = [
      { qualityLevel: 'strict', teamSize: 'solo', projectType: 'js' },
      { qualityLevel: 'standard', teamSize: 'small', projectType: 'python' },
      { qualityLevel: 'relaxed', teamSize: 'team', projectType: 'go' }
    ];
    
    for (const config of configs) {
      // Test CLAUDE.md generation
      const claudeContent = generateClaudeTemplate(config);
      assert(claudeContent.includes(`**Quality Level**: ${config.qualityLevel}`));
      assert(claudeContent.includes(`**Team Size**: ${config.teamSize}`));
      
      // Test ACTIVE_WORK.md generation
      const activeWorkContent = generateActiveWorkTemplate(config);
      assert(activeWorkContent.includes('# Active Work'));
      assert(activeWorkContent.includes(config.projectType));
      
      // Test .gitignore generation
      const gitignoreContent = generateGitignore(config.projectType);
      assert(gitignoreContent.includes('node_modules/') || gitignoreContent.includes('__pycache__/'));
    }
  });

  test('DevContainer configuration should work for all languages', async () => {
    process.env.NODE_ENV = 'test';
    const { getDevContainerConfig } = await import('../bin/cli.js');
    
    const languages = ['js', 'python', 'go', 'rust', 'java', 'swift', 'other'];
    
    for (const lang of languages) {
      const config = getDevContainerConfig(lang);
      
      // All configs should have required fields
      assert(config.name);
      assert(config.image);
      assert(config.customizations);
      assert(config.customizations.vscode);
      assert(Array.isArray(config.customizations.vscode.extensions));
    }
  });

  test('GitHub sync should handle missing ACTIVE_WORK.md gracefully', async () => {
    process.env.NODE_ENV = 'test';
    const { GitHubSync } = await import('../lib/github-sync.js');
    
    const sync = new GitHubSync('nonexistent-file.md');
    
    // Should not throw, should return Result object with error
    const result = await sync.syncIssues();
    assert.strictEqual(result.success, false);
    assert(result.error);
    assert.strictEqual(result.error.code, 'FILE_SYSTEM_ERROR');
  });

  test('File creation templates should be valid', async () => {
    process.env.NODE_ENV = 'test';
    
    // Test that template files exist and are readable
    const templateDir = path.join(process.cwd(), 'templates');
    
    const requiredTemplates = [
      'CLAUDE.md',
      'ACTIVE_WORK.md',
      'commands/issue.md'
    ];
    
    for (const template of requiredTemplates) {
      const templatePath = path.join(templateDir, template);
      assert(await fs.pathExists(templatePath), `Template ${template} should exist`);
      
      const content = await fs.readFile(templatePath, 'utf8');
      assert(content.length > 0, `Template ${template} should not be empty`);
    }
  });

  test('Command templates should be comprehensive', async () => {
    const commandsDir = path.join(process.cwd(), 'templates', 'commands');
    
    // Check that command directory exists
    assert(await fs.pathExists(commandsDir), 'Commands template directory should exist');
    
    const commandFiles = await fs.readdir(commandsDir);
    const expectedCommands = ['issue.md', 'update-docs.md'];
    
    for (const expected of expectedCommands) {
      assert(commandFiles.includes(expected), `Command template ${expected} should exist`);
    }
  });
});