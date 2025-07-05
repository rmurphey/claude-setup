import fs from 'fs-extra';

// Mock fs-extra
jest.mock('fs-extra', () => ({
  default: {
    writeFile: jest.fn(),
    ensureDir: jest.fn(),
    pathExists: jest.fn(),
  }
}));

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};

describe('Template Generation Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
  });

  describe('CLAUDE.md Template', () => {
    test('should generate correct content for strict quality level', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'strict',
          teamSize: 'team',
          cicd: true
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      expect(claudeMdCall).toBeDefined();
      
      const content = claudeMdCall[1];
      expect(content).toContain('Quality Level: strict');
      expect(content).toContain('Team Size: team');
      expect(content).toContain('0 warnings threshold');
      expect(content).toContain('Project AI Guidelines');
      expect(content).toContain('/hygiene');
      expect(content).toContain('/todo');
      expect(content).toContain('/commit');
    });

    test('should generate correct content for standard quality level', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'python',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      const content = claudeMdCall[1];
      expect(content).toContain('Quality Level: standard');
      expect(content).toContain('<10 warnings threshold');
    });

    test('should generate correct content for relaxed quality level', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'go',
          qualityLevel: 'relaxed',
          teamSize: 'small',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      const content = claudeMdCall[1];
      expect(content).toContain('Quality Level: relaxed');
      expect(content).toContain('<50 warnings threshold');
    });
  });

  describe('ACTIVE_WORK.md Template', () => {
    test('should generate consistent template content', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'rust',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const activeWorkCall = fs.writeFile.mock.calls.find(call => call[0] === 'ACTIVE_WORK.md');
      expect(activeWorkCall).toBeDefined();
      
      const content = activeWorkCall[1];
      expect(content).toContain('Active Work - Current Session Focus');
      expect(content).toContain('Next Session Priorities');
      expect(content).toContain('Quality Status');
      expect(content).toContain('- [ ] Review project setup');
      expect(content).toContain('Project setup completed');
    });
  });

  describe('.gitignore Template', () => {
    test('should generate JavaScript-specific gitignore', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const gitignoreCall = fs.writeFile.mock.calls.find(call => call[0] === '.gitignore');
      const content = gitignoreCall[1];
      
      // Common ignores
      expect(content).toContain('node_modules/');
      expect(content).toContain('.DS_Store');
      expect(content).toContain('*.log');
      
      // JavaScript-specific ignores
      expect(content).toContain('dist/');
      expect(content).toContain('build/');
      expect(content).toContain('.eslintcache');
    });

    test('should generate Python-specific gitignore', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'python',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const gitignoreCall = fs.writeFile.mock.calls.find(call => call[0] === '.gitignore');
      const content = gitignoreCall[1];
      
      // Common ignores
      expect(content).toContain('__pycache__/');
      expect(content).toContain('*.pyc');
      
      // Python-specific ignores
      expect(content).toContain('*.egg-info/');
      expect(content).toContain('.pytest_cache/');
      expect(content).toContain('.coverage');
    });

    test('should generate basic gitignore for unknown project types', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'other',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const gitignoreCall = fs.writeFile.mock.calls.find(call => call[0] === '.gitignore');
      const content = gitignoreCall[1];
      
      // Should contain common ignores only
      expect(content).toContain('node_modules/');
      expect(content).toContain('.DS_Store');
      expect(content).toContain('*.log');
      
      // Should not contain language-specific ignores
      expect(content).not.toContain('dist/');
      expect(content).not.toContain('*.egg-info/');
    });
  });

  describe('GitHub Actions Template', () => {
    test('should generate workflow for JavaScript projects', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'standard',
          teamSize: 'team',
          cicd: true
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const workflowCall = fs.writeFile.mock.calls.find(call => call[0] === '.github/workflows/quality.yml');
      expect(workflowCall).toBeDefined();
      
      const content = workflowCall[1];
      expect(content).toContain('name: Quality Check');
      expect(content).toContain('on: [push, pull_request]');
      expect(content).toContain('Setup Node.js');
      expect(content).toContain('npm ci');
      expect(content).toContain('npm run lint');
      expect(content).toContain('npm test');
    });

    test('should not generate workflow when CI/CD not requested', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = await import('../bin/cli.js');
      await main();

      const workflowCall = fs.writeFile.mock.calls.find(call => call[0] === '.github/workflows/quality.yml');
      expect(workflowCall).toBeUndefined();
    });
  });
});