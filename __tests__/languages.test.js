const fs = require('fs-extra');

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

describe('Language-Specific Setup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.writeFile.mockResolvedValue();
    fs.ensureDir.mockResolvedValue();
  });

  describe('JavaScript Setup', () => {
    test('should create package.json for new JavaScript projects', async () => {
      fs.pathExists.mockResolvedValue(false); // No existing package.json

      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'js',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      // Mock process.cwd() for project name
      const mockCwd = jest.spyOn(process, 'cwd').mockReturnValue('/test/project');

      const { main } = require('../bin/cli.js');
      await main();

      // Verify package.json creation
      const packageJsonCall = fs.writeFile.mock.calls.find(call => call[0] === 'package.json');
      expect(packageJsonCall).toBeDefined();
      
      const packageJson = JSON.parse(packageJsonCall[1]);
      expect(packageJson.name).toBe('project');
      expect(packageJson.scripts.lint).toBe('eslint .');
      expect(packageJson.scripts.test).toBe('jest');

      mockCwd.mockRestore();
    });

    test('should not overwrite existing package.json', async () => {
      fs.pathExists.mockResolvedValue(true); // Existing package.json

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

      // Should not create package.json
      const packageJsonCall = fs.writeFile.mock.calls.find(call => call[0] === 'package.json');
      expect(packageJsonCall).toBeUndefined();
    });
  });

  describe('Python Setup', () => {
    test('should create pyproject.toml for Python projects', async () => {
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

      const pyprojectCall = fs.writeFile.mock.calls.find(call => call[0] === 'pyproject.toml');
      expect(pyprojectCall).toBeDefined();
      expect(pyprojectCall[1]).toContain('[tool.ruff]');
      expect(pyprojectCall[1]).toContain('[tool.pytest.ini_options]');
    });
  });

  describe('Go Setup', () => {
    test('should provide setup instructions for Go projects', async () => {
      fs.pathExists.mockResolvedValue(false); // No existing go.mod

      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'go',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      // Go setup should log instructions but not create files
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('go mod init'));
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('golangci-lint'));
    });
  });

  describe('Rust Setup', () => {
    test('should provide setup instructions for Rust projects', async () => {
      fs.pathExists.mockResolvedValue(false); // No existing Cargo.toml

      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'rust',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('cargo init'));
    });
  });

  describe('Java Setup', () => {
    test('should provide setup instructions for Java projects', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'java',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('gradle init'));
    });
  });

  describe('Other/Unknown Project Types', () => {
    test('should handle unknown project types gracefully', async () => {
      jest.doMock('inquirer', () => ({
        prompt: jest.fn().mockResolvedValue({
          projectType: 'other',
          qualityLevel: 'standard',
          teamSize: 'solo',
          cicd: false
        })
      }));

      const { main } = require('../bin/cli.js');
      await main();

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Manual setup required'));
    });
  });
});