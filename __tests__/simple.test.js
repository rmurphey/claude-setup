import { describe, test } from 'node:test';
import assert from 'node:assert';
import { 
  generateClaudeTemplate, 
  generateGitignore 
} from '../bin/cli.js';

describe('Template Functions', () => {
  test('generateClaudeTemplate should create proper content', () => {
    const config = {
      qualityLevel: 'strict',
      teamSize: 'team'
    };
    
    const result = generateClaudeTemplate(config);
    
    assert(result.includes('**Quality Level**: strict'));
    assert(result.includes('**Team Size**: team'));
    assert(result.includes('Warning Threshold**: 0'));
  });

  test('generateGitignore should handle JavaScript projects', () => {
    const result = generateGitignore('js');
    
    assert(result.includes('node_modules/'));
    assert(result.includes('dist/'));
    assert(result.includes('.eslintcache'));
  });

  test('generateGitignore should handle Python projects', () => {
    const result = generateGitignore('python');
    
    assert(result.includes('__pycache__/'));
    assert(result.includes('*.pyc'));
    assert(result.includes('.pytest_cache/'));
  });
});