const fs = require('fs-extra');
const path = require('path');
const { main } = require('../bin/cli.js');

// Mock inquirer to avoid interactive prompts during tests
jest.mock('inquirer', () => ({
  prompt: jest.fn()
}));

const inquirer = require('inquirer');

// Mock fs-extra
jest.mock('fs-extra', () => ({
  writeFile: jest.fn(),
  ensureDir: jest.fn(),
  pathExists: jest.fn(),
}));

// Mock console methods to avoid cluttering test output
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};

describe('CLI Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
  });

  describe('main function', () => {
    test('should complete setup for JavaScript project with standard quality', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'solo',
        cicd: false
      });

      await main();

      expect(inquirer.prompt).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          name: 'projectType',
          type: 'list'
        }),
        expect.objectContaining({
          name: 'qualityLevel',
          type: 'list'
        }),
        expect.objectContaining({
          name: 'teamSize',
          type: 'list'
        }),
        expect.objectContaining({
          name: 'cicd',
          type: 'confirm'
        })
      ]));

      // Verify basic files are created
      expect(fs.writeFile).toHaveBeenCalledWith('CLAUDE.md', expect.stringContaining('CLAUDE.md - Project AI Guidelines'));
      expect(fs.writeFile).toHaveBeenCalledWith('ACTIVE_WORK.md', expect.stringContaining('Active Work - Current Session Focus'));
      expect(fs.writeFile).toHaveBeenCalledWith('.gitignore', expect.stringContaining('node_modules/'));
    });

    test('should setup CI/CD when requested', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'python',
        qualityLevel: 'strict',
        teamSize: 'team',
        cicd: true
      });

      await main();

      expect(fs.ensureDir).toHaveBeenCalledWith('.github/workflows');
      expect(fs.writeFile).toHaveBeenCalledWith('.github/workflows/quality.yml', expect.stringContaining('name: Quality Check'));
    });

    test('should handle setup errors gracefully', async () => {
      inquirer.prompt.mockRejectedValue(new Error('User cancelled'));
      
      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      await main();

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Setup failed:'), 'User cancelled');
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe('project type questions', () => {
    test('should include all expected project types', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'go',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: false
      });

      await main();

      const projectTypeQuestion = inquirer.prompt.mock.calls[0][0].find(q => q.name === 'projectType');
      const choices = projectTypeQuestion.choices.map(c => c.value);
      
      expect(choices).toContain('js');
      expect(choices).toContain('python');
      expect(choices).toContain('go');
      expect(choices).toContain('rust');
      expect(choices).toContain('java');
      expect(choices).toContain('other');
    });
  });

  describe('quality level questions', () => {
    test('should include all quality levels', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'relaxed',
        teamSize: 'solo',
        cicd: false
      });

      await main();

      const qualityQuestion = inquirer.prompt.mock.calls[0][0].find(q => q.name === 'qualityLevel');
      const choices = qualityQuestion.choices.map(c => c.value);
      
      expect(choices).toContain('strict');
      expect(choices).toContain('standard');
      expect(choices).toContain('relaxed');
    });
  });
});