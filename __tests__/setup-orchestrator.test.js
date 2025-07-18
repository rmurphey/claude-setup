import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

import { SetupOrchestrator } from '../lib/cli/setup.js';

describe('SetupOrchestrator', () => {
  let orchestrator;

  beforeEach(() => {
    orchestrator = new SetupOrchestrator();
  });

  describe('basic functionality', () => {
    it('should instantiate SetupOrchestrator class', () => {
      assert(orchestrator instanceof SetupOrchestrator);
      assert(orchestrator.languageModules);
    });

    it('should have all required methods', () => {
      assert.strictEqual(typeof orchestrator.runSetupMode, 'function');
      assert.strictEqual(typeof orchestrator.runRecoveryMode, 'function');
      assert.strictEqual(typeof orchestrator.runDevContainerMode, 'function');
      assert.strictEqual(typeof orchestrator.setupProject, 'function');
      assert.strictEqual(typeof orchestrator.generateDevContainer, 'function');
      assert.strictEqual(typeof orchestrator.generateClaudeTemplate, 'function');
      assert.strictEqual(typeof orchestrator.generateActiveWorkTemplate, 'function');
      assert.strictEqual(typeof orchestrator.generateGitignore, 'function');
      assert.strictEqual(typeof orchestrator.getDevContainerConfig, 'function');
    });

    it('should initialize with language modules', () => {
      assert(orchestrator.languageModules);
      assert(orchestrator.languageModules.js);
      assert(orchestrator.languageModules.python);
      assert(orchestrator.languageModules.go);
      assert(orchestrator.languageModules.rust);
      assert(orchestrator.languageModules.java);
      assert(orchestrator.languageModules.swift);
    });
  });

  describe('template generation methods', () => {
    it('should generate Claude template with correct configuration', () => {
      const config = {
        qualityLevel: 'strict',
        teamSize: 'large',
        projectType: 'js'
      };

      const template = orchestrator.generateClaudeTemplate(config);

      assert(template.includes('Quality Level**: strict'));
      assert(template.includes('Team Size**: large'));
      assert(template.includes('strict quality standards'));
      assert(template.includes('70% test coverage'));
    });

    it('should generate Active Work template with project info', () => {
      const config = {
        projectType: 'python',
        qualityLevel: 'standard'
      };

      const template = orchestrator.generateActiveWorkTemplate(config);

      assert(template.includes('Type**: python'));
      assert(template.includes('Quality**: standard'));
      assert(template.includes(new Date().toISOString().split('T')[0]));
    });

    it('should generate appropriate gitignore for JavaScript projects', () => {
      const gitignore = orchestrator.generateGitignore('js');

      assert(gitignore.includes('node_modules/'));
      assert(gitignore.includes('dist/'));
      assert(gitignore.includes('*.tsbuildinfo'));
      assert(gitignore.includes('.eslintcache'));
    });

    it('should generate appropriate gitignore for Python projects', () => {
      const gitignore = orchestrator.generateGitignore('python');

      assert(gitignore.includes('__pycache__/'));
      assert(gitignore.includes('*.egg-info/'));
      assert(gitignore.includes('.pytest_cache/'));
      assert(gitignore.includes('.coverage'));
    });

    it('should generate appropriate gitignore for Swift projects', () => {
      const gitignore = orchestrator.generateGitignore('swift');

      assert(gitignore.includes('.build/'));
      assert(gitignore.includes('*.xcodeproj/'));
      assert(gitignore.includes('xcuserdata/'));
      assert(gitignore.includes('DerivedData/'));
    });
  });

  describe('getDevContainerConfig', () => {
    it('should return JavaScript-specific DevContainer config', () => {
      const config = orchestrator.getDevContainerConfig('js');

      assert.strictEqual(config.name, 'JavaScript/TypeScript Development');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/javascript-node:18');
      assert(config.customizations.vscode.extensions.includes('esbenp.prettier-vscode'));
      assert(config.customizations.vscode.extensions.includes('dbaeumer.vscode-eslint'));
      assert(config.forwardPorts.includes(3000));
      assert(config.forwardPorts.includes(8080));
    });

    it('should return Python-specific DevContainer config', () => {
      const config = orchestrator.getDevContainerConfig('python');

      assert.strictEqual(config.name, 'Python Development');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/python:3.11');
      assert(config.customizations.vscode.extensions.includes('ms-python.python'));
      assert(config.forwardPorts.includes(8000));
      assert(config.forwardPorts.includes(5000));
    });

    it('should return Go-specific DevContainer config', () => {
      const config = orchestrator.getDevContainerConfig('go');

      assert.strictEqual(config.name, 'Go Development');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/go:1.21');
      assert(config.customizations.vscode.extensions.includes('golang.go'));
      assert(config.forwardPorts.includes(8080));
    });

    it('should return base config for unknown project types', () => {
      const config = orchestrator.getDevContainerConfig('unknown');

      assert.strictEqual(config.name, 'Development Container');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/universal:2');
      assert.strictEqual(config.remoteUser, 'vscode');
    });
  });

  describe('method existence and basic functionality', () => {
    it('should have all required methods', () => {
      assert.strictEqual(typeof orchestrator.runSetupMode, 'function');
      assert.strictEqual(typeof orchestrator.runRecoveryMode, 'function');
      assert.strictEqual(typeof orchestrator.runDevContainerMode, 'function');
      assert.strictEqual(typeof orchestrator.setupProject, 'function');
      assert.strictEqual(typeof orchestrator.generateDevContainer, 'function');
      assert.strictEqual(typeof orchestrator.generateClaudeTemplate, 'function');
      assert.strictEqual(typeof orchestrator.generateActiveWorkTemplate, 'function');
      assert.strictEqual(typeof orchestrator.generateGitignore, 'function');
      assert.strictEqual(typeof orchestrator.getDevContainerConfig, 'function');
    });

    it('should initialize with language modules', () => {
      assert(orchestrator.languageModules);
      assert(orchestrator.languageModules.js);
      assert(orchestrator.languageModules.python);
      assert(orchestrator.languageModules.go);
      assert(orchestrator.languageModules.rust);
      assert(orchestrator.languageModules.java);
      assert(orchestrator.languageModules.swift);
    });
  });
});