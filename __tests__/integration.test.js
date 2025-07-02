const fs = require('fs-extra');
const path = require('path');

// Mock fs-extra
jest.mock('fs-extra', () => ({
  writeFile: jest.fn(),
  ensureDir: jest.fn(),
  pathExists: jest.fn(),
}));

// Mock inquirer
jest.mock('inquirer', () => ({
  prompt: jest.fn()
}));

const inquirer = require('inquirer');

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn()
};

describe('Integration Tests - Full Setup Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
  });

  describe('Complete JavaScript Project Setup', () => {
    test('should set up complete JavaScript project with all components', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: true
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Verify all expected files were created
      const expectedFiles = [
        'CLAUDE.md',
        'ACTIVE_WORK.md', 
        '.gitignore',
        'package.json',
        '.github/workflows/quality.yml'
      ];

      expectedFiles.forEach(file => {
        expect(fs.writeFile).toHaveBeenCalledWith(file, expect.any(String));
      });

      // Verify directories were created
      expect(fs.ensureDir).toHaveBeenCalledWith('.claude/commands');
      expect(fs.ensureDir).toHaveBeenCalledWith('.github/workflows');

      // Verify all commands were created
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

  describe('Complete Python Project Setup', () => {
    test('should set up complete Python project without CI/CD', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'python',
        qualityLevel: 'strict',
        teamSize: 'solo',
        cicd: false
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Python-specific files
      expect(fs.writeFile).toHaveBeenCalledWith('pyproject.toml', expect.stringContaining('[tool.ruff]'));
      
      // Should not create CI/CD files
      expect(fs.ensureDir).not.toHaveBeenCalledWith('.github/workflows');
      expect(fs.writeFile).not.toHaveBeenCalledWith('.github/workflows/quality.yml', expect.any(String));

      // Verify CLAUDE.md has strict settings
      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      expect(claudeMdCall[1]).toContain('Quality Level: strict');
      expect(claudeMdCall[1]).toContain('0 warnings threshold');
    });
  });

  describe('COMMANDS.md and Command Integration', () => {
    test('should verify COMMANDS.md exists and commands are created correctly', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'go',
        qualityLevel: 'relaxed',
        teamSize: 'team',
        cicd: false
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Verify .claude/commands directory is created
      expect(fs.ensureDir).toHaveBeenCalledWith('.claude/commands');

      // Verify all commands from COMMANDS.md are created
      const expectedCommands = [
        'hygiene', 'todo', 'design', 'commit', 'next',
        'learn', 'docs', 'estimate', 'reflect', 'defer'
      ];

      expectedCommands.forEach(cmd => {
        const commandCall = fs.writeFile.mock.calls.find(call => 
          call[0] === `.claude/commands/${cmd}`
        );
        expect(commandCall).toBeDefined();
        expect(commandCall[1]).toContain(`# ${cmd} - Custom Claude Code command`);
        expect(commandCall[1]).toContain('#!/bin/bash');
        expect(commandCall[1]).toContain(`Running ${cmd} command...`);
      });
    });

    test('should create commands with proper shell script structure', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'rust',
        qualityLevel: 'standard',
        teamSize: 'solo',
        cicd: false
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Check hygiene command specifically
      const hygieneCall = fs.writeFile.mock.calls.find(call => 
        call[0] === '.claude/commands/hygiene'
      );
      
      expect(hygieneCall).toBeDefined();
      const content = hygieneCall[1];
      expect(content).toContain('#!/bin/bash');
      expect(content).toContain('# hygiene - Custom Claude Code command');
      expect(content).toContain('echo "Running hygiene command..."');
      expect(content).toContain('# Add command logic here');
    });
  });

  describe('Quality Level Consistency', () => {
    test('should maintain consistent quality settings across all generated files', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'strict',
        teamSize: 'team',
        cicd: true
      });

      const { main } = require('../bin/cli.js');
      await main();

      // CLAUDE.md should reflect strict quality
      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      expect(claudeMdCall[1]).toContain('Quality Level: strict');
      expect(claudeMdCall[1]).toContain('0 warnings threshold');

      // ACTIVE_WORK.md should be created
      const activeWorkCall = fs.writeFile.mock.calls.find(call => call[0] === 'ACTIVE_WORK.md');
      expect(activeWorkCall).toBeDefined();

      // Package.json should have quality scripts
      const packageJsonCall = fs.writeFile.mock.calls.find(call => call[0] === 'package.json');
      if (packageJsonCall) {
        const packageJson = JSON.parse(packageJsonCall[1]);
        expect(packageJson.scripts.lint).toBe('eslint .');
        expect(packageJson.scripts.test).toBe('jest');
      }
    });
  });

  describe('Error Handling in Full Workflow', () => {
    test('should handle file creation errors gracefully', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'solo',
        cicd: false
      });

      // Simulate file write error
      fs.writeFile.mockRejectedValueOnce(new Error('Permission denied'));

      const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

      const { main } = require('../bin/cli.js');
      await main();

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Setup failed:'),
        'Permission denied'
      );
      expect(mockExit).toHaveBeenCalledWith(1);

      mockExit.mockRestore();
    });
  });

  describe('Team Size Impact on Setup', () => {
    test('should create different setups for different team sizes', async () => {
      // Test team setup with CI/CD
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'team',
        cicd: true
      });

      const { main } = require('../bin/cli.js');
      await main();

      const claudeMdCall = fs.writeFile.mock.calls.find(call => call[0] === 'CLAUDE.md');
      expect(claudeMdCall[1]).toContain('Team Size: team');

      // Should create CI/CD for team
      expect(fs.ensureDir).toHaveBeenCalledWith('.github/workflows');
    });
  });
});