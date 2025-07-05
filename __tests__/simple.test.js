import { 
  generateClaudeTemplate, 
  generateActiveWorkTemplate, 
  generateGitignore 
} from '../bin/cli.js';

describe('Template Functions', () => {
  test('generateClaudeTemplate should create proper content', () => {
    const config = {
      qualityLevel: 'strict',
      teamSize: 'team'
    };
    
    const result = generateClaudeTemplate(config);
    
    expect(result).toContain('Quality Level: strict');
    expect(result).toContain('Team Size: team');
    expect(result).toContain('0 warnings threshold');
  });

  test('generateGitignore should handle JavaScript projects', () => {
    const result = generateGitignore('js');
    
    expect(result).toContain('node_modules/');
    expect(result).toContain('dist/');
    expect(result).toContain('.eslintcache');
  });

  test('generateGitignore should handle Python projects', () => {
    const result = generateGitignore('python');
    
    expect(result).toContain('__pycache__/');
    expect(result).toContain('*.pyc');
    expect(result).toContain('.pytest_cache/');
  });
});