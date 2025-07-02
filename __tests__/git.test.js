const fs = require('fs-extra');
const { execSync } = require('child_process');

// Mock fs-extra
jest.mock('fs-extra', () => ({
  writeFile: jest.fn(),
  ensureDir: jest.fn(),
  pathExists: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock child_process
jest.mock('child_process', () => ({
  execSync: jest.fn()
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

describe('Git Repository Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
    fs.pathExists.mockResolvedValue(false);
    fs.readFileSync.mockReturnValue('mock template content {{QUALITY_LEVEL}}');
    execSync.mockReturnValue();
  });

  describe('Git Repository Initialization', () => {
    test('should initialize git repository for new project', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'solo',
        cicd: false
      });

      // Mock git rev-parse to throw (no existing repo)
      execSync.mockImplementationOnce(() => {
        throw new Error('Not a git repository');
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Verify git init was called
      expect(execSync).toHaveBeenCalledWith('git init', { stdio: 'ignore' });
      expect(execSync).toHaveBeenCalledWith('git branch -M main', { stdio: 'ignore' });
    });

    test('should skip initialization if git repository already exists', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'python',
        qualityLevel: 'strict',
        teamSize: 'team',
        cicd: true
      });

      // Mock git rev-parse to succeed (existing repo)
      execSync.mockImplementationOnce(() => '.git');

      const { main } = require('../bin/cli.js');
      await main();

      // Should only call git rev-parse, not git init
      expect(execSync).toHaveBeenCalledWith('git rev-parse --git-dir', { stdio: 'ignore' });
      expect(execSync).not.toHaveBeenCalledWith('git init', expect.any(Object));
    });

    test('should handle git initialization errors gracefully', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'go',
        qualityLevel: 'relaxed',
        teamSize: 'small',
        cicd: false
      });

      // Mock git commands to throw errors
      execSync.mockImplementation(() => {
        throw new Error('Git not found');
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Should continue with setup even if git fails
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Warning: Could not initialize git repository'));
      expect(fs.writeFile).toHaveBeenCalled(); // Files should still be created
    });
  });

  describe('Initial Commit Creation', () => {
    test('should create initial commit with project details', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'js',
        qualityLevel: 'strict',
        teamSize: 'team',
        cicd: true
      });

      // Mock successful git operations
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git rev-parse --git-dir') {
          throw new Error('Not a git repository');
        }
        return '';
      });

      const { main } = require('../bin/cli.js');
      await main();

      // Verify git add and commit were called
      expect(execSync).toHaveBeenCalledWith('git add .', { stdio: 'ignore' });
      expect(execSync).toHaveBeenCalledWith(
        expect.stringContaining('git commit -m "Initial Claude Code project setup'),
        { stdio: 'ignore' }
      );

      // Find the commit call
      const commitCall = execSync.mock.calls.find(call => 
        call[0].includes('git commit -m')
      );
      expect(commitCall[0]).toContain('Project Type: js');
      expect(commitCall[0]).toContain('Quality Level: strict');
      expect(commitCall[0]).toContain('Team Size: team');
      expect(commitCall[0]).toContain('CI/CD: Yes');
      expect(commitCall[0]).toContain('🤖 Generated with [Claude Code]');
      expect(commitCall[0]).toContain('Co-Authored-By: Claude');
    });

    test('should handle commit errors gracefully', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'python',
        qualityLevel: 'standard',
        teamSize: 'solo',
        cicd: false
      });

      // Mock git init to succeed but commit to fail
      execSync.mockImplementation((cmd) => {
        if (cmd === 'git rev-parse --git-dir') {
          throw new Error('Not a git repository');
        }
        if (cmd.includes('git commit')) {
          throw new Error('Nothing to commit');
        }
        return '';
      });

      const { main } = require('../bin/cli.js');
      await main();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Warning: Could not create initial commit'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Files created but not committed'));
    });

    test('should show git remote instructions after successful setup', async () => {
      inquirer.prompt.mockResolvedValue({
        projectType: 'rust',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: false
      });

      execSync.mockImplementation((cmd) => {
        if (cmd === 'git rev-parse --git-dir') {
          throw new Error('Not a git repository');
        }
        return '';
      });

      const { main } = require('../bin/cli.js');
      await main();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Git repository ready!'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('git remote add origin'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('git push -u origin main'));
    });
  });

  describe('Git Integration with Different Project Types', () => {
    test('should work correctly with all project types', async () => {
      const projectTypes = ['js', 'python', 'go', 'rust', 'java', 'other'];
      
      for (const projectType of projectTypes) {
        jest.clearAllMocks();
        fs.writeFile.mockResolvedValue();
        fs.ensureDir.mockResolvedValue();
        fs.readFileSync.mockReturnValue('mock template {{QUALITY_LEVEL}}');
        
        inquirer.prompt.mockResolvedValue({
          projectType,
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        });

        execSync.mockImplementation((cmd) => {
          if (cmd === 'git rev-parse --git-dir') {
            throw new Error('Not a git repository');
          }
          return '';
        });

        const { main } = require('../bin/cli.js');
        await main();

        // Should initialize git for all project types
        expect(execSync).toHaveBeenCalledWith('git init', { stdio: 'ignore' });
        expect(execSync).toHaveBeenCalledWith('git add .', { stdio: 'ignore' });
        
        // Should include project type in commit message
        const commitCall = execSync.mock.calls.find(call => 
          call[0].includes('git commit -m')
        );
        expect(commitCall[0]).toContain(`Project Type: ${projectType}`);
      }
    });
  });
});