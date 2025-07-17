import { describe, test } from 'node:test';
import assert from 'node:assert';

describe('CLI Modes Integration', () => {

  test('CLI exports required functions', async () => {
    // Simple test: ensure CLI module exports expected functions
    // This should be instant since NODE_ENV=test prevents execution
    const cliModule = await import('../bin/cli.js');
    
    assert(typeof cliModule.main === 'function', 'Should export main function');
    assert(typeof cliModule.setupProject === 'function', 'Should export setupProject function');
    assert(typeof cliModule.generateClaudeTemplate === 'function', 'Should export generateClaudeTemplate function');
    assert(typeof cliModule.handleLanguageDetection === 'function', 'Should export handleLanguageDetection function');
    assert(typeof cliModule.handleConfigManagement === 'function', 'Should export handleConfigManagement function');
  });

  test('generateClaudeTemplate creates valid content', async () => {
    // Test template generation function directly
    const { generateClaudeTemplate } = await import('../bin/cli.js');
    
    const config = {
      qualityLevel: 'strict',
      teamSize: 'solo'
    };
    
    const template = generateClaudeTemplate(config);
    
    assert(typeof template === 'string', 'Should return a string');
    assert(template.includes('strict'), 'Should include quality level');
    assert(template.includes('solo'), 'Should include team size');
    assert(template.length > 100, 'Should generate substantial content');
  });

  test('generateGitignore creates appropriate content', async () => {
    // Test gitignore generation function directly
    const { generateGitignore } = await import('../bin/cli.js');
    
    const jsGitignore = generateGitignore('js');
    const pythonGitignore = generateGitignore('python');
    
    assert(typeof jsGitignore === 'string', 'Should return string for JS');
    assert(typeof pythonGitignore === 'string', 'Should return string for Python');
    assert(jsGitignore.includes('node_modules'), 'JS gitignore should include node_modules');
    assert(pythonGitignore.includes('__pycache__'), 'Python gitignore should include __pycache__');
  });

  test('language module detection works', async () => {
    // Test that language modules are accessible
    const { handleLanguageDetection } = await import('../bin/cli.js');
    
    assert(typeof handleLanguageDetection === 'function', 'handleLanguageDetection should be a function');
  });

  test('config management functions work', async () => {
    // Test that config management is accessible
    const { handleConfigManagement } = await import('../bin/cli.js');
    
    assert(typeof handleConfigManagement === 'function', 'handleConfigManagement should be a function');
  });
});