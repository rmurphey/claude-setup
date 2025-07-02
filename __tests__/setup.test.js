const fs = require('fs-extra');
const path = require('path');

// Import functions from CLI (we'll need to refactor CLI to export these)
const cli = require('../bin/cli.js');

// Mock fs-extra
jest.mock('fs-extra', () => ({
  writeFile: jest.fn(),
  ensureDir: jest.fn(),
  pathExists: jest.fn(),
}));

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};

// We need to extract functions from cli.js for testing
// For now, we'll test the integration through the main function
// TODO: Refactor cli.js to export individual functions

describe('Project Setup Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
  });

  describe('Documentation Creation', () => {
    test('should create required documentation files', async () => {
      // Mock inquirer for this test
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      // Verify documentation files are created
      expect(fs.writeFile).toHaveBeenCalledWith('CLAUDE.md', expect.stringContaining('Project AI Guidelines'));
      expect(fs.writeFile).toHaveBeenCalledWith('ACTIVE_WORK.md', expect.stringContaining('Active Work'));
      expect(fs.writeFile).toHaveBeenCalledWith('.gitignore', expect.stringContaining('node_modules'));
    });

    test('should include correct quality level in CLAUDE.md', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'strict',
          teamSize: 'team',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      expect(claudeMdCall[1]).toContain('Quality Level: strict');
      expect(claudeMdCall[1]).toContain('0 warnings threshold');
    });
  });

  describe('Custom Commands Setup', () => {
    test('should create .claude/commands directory', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'python',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      expect(fs.ensureDir).toHaveBeenCalledWith('.claude/commands');
    });

    test('should create all required command files', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'go',
          qualityLevel: 'relaxed',
          teamSize: 'small',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      const expectedCommands = [
        'hygiene', 'todo', 'design', 'commit', 'next',
        'learn', 'docs', 'estimate', 'reflect', 'defer'
      ];

      expectedCommands.forEach(cmd => {
        expect(fs.writeFile).toHaveBeenCalledWith(
          `.claude/commands/${cmd}`,
          expect.stringContaining(`# ${cmd} - Custom Claude Code command`)
        );
      });
    });
  });

  describe('CI/CD Setup', () => {
    test('should create GitHub Actions workflow when requested', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'standard',
          teamSize: 'team',
          cicd: true
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      expect(fs.ensureDir).toHaveBeenCalledWith('.github/workflows');
      expect(fs.writeFile).toHaveBeenCalledWith(
        '.github/workflows/quality.yml',
        expect.stringContaining('name: Quality Check')
      );
    });

    test('should not create CI/CD files when not requested', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'python',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      expect(fs.ensureDir).not.toHaveBeenCalledWith('.github/workflows');
      expect(fs.writeFile).not.toHaveBeenCalledWith(
        '.github/workflows/quality.yml',
        expect.any(String)
      );
    });
  });
});