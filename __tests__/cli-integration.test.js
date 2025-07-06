import { jest, expect, describe, test, beforeEach, afterEach } from '@jest/globals';
import { 
  generateClaudeTemplate, 
  generateActiveWorkTemplate, 
  generateGitignore,
  getDevContainerConfig,
  main
} from '../bin/cli.js';

// Create a comprehensive test suite for the CLI without deep mocking
describe('Claude Setup CLI Integration Tests', () => {
  describe('Template Generation Functions (Unit Tests)', () => {
    test('generateClaudeTemplate should create proper content for strict quality', () => {
      const config = {
        qualityLevel: 'strict',
        teamSize: 'team'
      };
      
      const result = generateClaudeTemplate(config);
      
      expect(result).toContain('Quality Level: strict');
      expect(result).toContain('Team Size: team');
      expect(result).toContain('0 warnings threshold');
      expect(result).toContain('Project AI Guidelines');
    });

    test('generateClaudeTemplate should create proper content for standard quality', () => {
      const config = {
        qualityLevel: 'standard',
        teamSize: 'solo'
      };
      
      const result = generateClaudeTemplate(config);
      
      expect(result).toContain('Quality Level: standard');
      expect(result).toContain('Team Size: solo');
      expect(result).toContain('<10 warnings threshold');
    });

    test('generateClaudeTemplate should create proper content for relaxed quality', () => {
      const config = {
        qualityLevel: 'relaxed',
        teamSize: 'small'
      };
      
      const result = generateClaudeTemplate(config);
      
      expect(result).toContain('Quality Level: relaxed');
      expect(result).toContain('Team Size: small');
      expect(result).toContain('<50 warnings threshold');
    });

    test('generateActiveWorkTemplate should create consistent content', () => {
      const config = { qualityLevel: 'standard', projectType: 'js' };
      const result = generateActiveWorkTemplate(config);
      
      expect(result).toContain('Active Work - Current Session Focus');
      expect(result).toContain('Next Session Priorities');
      expect(result).toContain('Quality Status');
      expect(result).toContain('- [ ] Review project setup');
      expect(result).toContain('Project setup completed');
    });

    test('generateGitignore should handle JavaScript projects', () => {
      const result = generateGitignore('js');
      
      expect(result).toContain('node_modules/');
      expect(result).toContain('.DS_Store');
      expect(result).toContain('*.log');
      expect(result).toContain('dist/');
      expect(result).toContain('build/');
      expect(result).toContain('.eslintcache');
    });

    test('generateGitignore should handle Python projects', () => {
      const result = generateGitignore('python');
      
      expect(result).toContain('__pycache__/');
      expect(result).toContain('*.pyc');
      expect(result).toContain('*.egg-info/');
      expect(result).toContain('.pytest_cache/');
      expect(result).toContain('.coverage');
    });

    test('generateGitignore should handle Go projects with common patterns', () => {
      const result = generateGitignore('go');
      
      // Go projects get the common template since no specific case exists
      expect(result).toContain('node_modules/');
      expect(result).toContain('.DS_Store');
      expect(result).toContain('*.log');
      expect(result).toContain('target/'); // Part of common template
    });

    test('generateGitignore should handle Rust projects with common patterns', () => {
      const result = generateGitignore('rust');
      
      // Rust projects get the common template since no specific case exists
      expect(result).toContain('target/'); // Part of common template
      expect(result).toContain('.DS_Store');
      expect(result).toContain('*.log');
    });

    test('generateGitignore should handle Swift projects', () => {
      const result = generateGitignore('swift');
      
      expect(result).toContain('.build/');
      expect(result).toContain('.swiftpm/');
      expect(result).toContain('*.xcodeproj/');
      expect(result).toContain('*.xcworkspace/');
      expect(result).toContain('xcuserdata/');
      expect(result).toContain('DerivedData/');
      expect(result).toContain('Carthage/');
      expect(result).toContain('Pods/');
      expect(result).toContain('*.dSYM');
    });

    test('generateGitignore should handle Java projects with common patterns', () => {
      const result = generateGitignore('java');
      
      // Java projects get the common template since no specific case exists
      expect(result).toContain('target/'); // Part of common template
      expect(result).toContain('.DS_Store');
      expect(result).toContain('*.log');
    });

    test('generateGitignore should handle unknown project types with basic content', () => {
      const result = generateGitignore('other');
      
      // Should contain common ignores
      expect(result).toContain('node_modules/');
      expect(result).toContain('.DS_Store');
      expect(result).toContain('*.log');
      expect(result).toContain('target/'); // Part of common template
      
      // Should not contain language-specific ignores
      expect(result).not.toContain('dist/'); // JS-specific
      expect(result).not.toContain('*.egg-info/'); // Python-specific
      expect(result).not.toContain('.eslintcache'); // JS-specific
    });
  });

  describe('Quality Level Variations', () => {
    const qualityLevels = ['strict', 'standard', 'relaxed'];
    const teamSizes = ['solo', 'small', 'team'];

    qualityLevels.forEach(qualityLevel => {
      teamSizes.forEach(teamSize => {
        test(`should generate proper CLAUDE.md for ${qualityLevel} quality and ${teamSize} team`, () => {
          const config = { qualityLevel, teamSize };
          const result = generateClaudeTemplate(config);
          
          expect(result).toContain(`Quality Level: ${qualityLevel}`);
          expect(result).toContain(`Team Size: ${teamSize}`);
          
          // Check quality-specific thresholds
          if (qualityLevel === 'strict') {
            expect(result).toContain('0 warnings threshold');
          } else if (qualityLevel === 'standard') {
            expect(result).toContain('<10 warnings threshold');
          } else if (qualityLevel === 'relaxed') {
            expect(result).toContain('<50 warnings threshold');
          }
        });
      });
    });
  });

  describe('Language-Specific Content', () => {
    const supportedLanguages = ['js', 'python'];
    const commonLanguages = ['go', 'rust', 'java'];
    
    supportedLanguages.forEach(language => {
      test(`should generate language-specific gitignore for ${language}`, () => {
        const result = generateGitignore(language);
        
        // All should have common patterns
        expect(result).toContain('.DS_Store');
        expect(result).toContain('*.log');
        
        // Language-specific checks
        switch(language) {
          case 'js':
            expect(result).toContain('node_modules/');
            expect(result).toContain('dist/');
            expect(result).toContain('.eslintcache');
            break;
          case 'python':
            expect(result).toContain('__pycache__/');
            expect(result).toContain('*.pyc');
            expect(result).toContain('.pytest_cache/');
            break;
        }
      });
    });

    commonLanguages.forEach(language => {
      test(`should generate common gitignore for ${language}`, () => {
        const result = generateGitignore(language);
        
        // Should have common patterns
        expect(result).toContain('.DS_Store');
        expect(result).toContain('*.log');
        expect(result).toContain('target/'); // Part of common template
        expect(result).toContain('node_modules/'); // Part of common template
      });
    });
  });

  describe('Smart Language Detection', () => {
    test('LanguageDetector should detect JavaScript projects', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      // This test runs in a project with package.json, so should detect JS
      const detection = await detector.getBestGuess();
      
      expect(detection).toBeTruthy();
      expect(detection.type).toBe('single');
      expect(detection.language).toBe('js');
      expect(detection.name).toBe('JavaScript/TypeScript');
    });

    test('LanguageDetector should format evidence properly', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      const evidence = {
        foundFiles: ['package.json', 'package-lock.json'],
        foundExtensions: ['.js', '.test.js'],
        fileCount: 5
      };
      
      const formatted = detector.formatEvidence(evidence);
      expect(formatted).toContain('package.json');
      expect(formatted).toContain('5 source files');
      expect(formatted).toContain('.js');
    });

    test('LanguageDetector should handle no detection gracefully', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      // Mock empty directory
      const originalReaddir = detector.findSourceFiles;
      detector.findSourceFiles = async () => ({ extensions: [], count: 0 });
      
      const detections = await detector.detectLanguages();
      expect(Array.isArray(detections)).toBe(true);
    });

    test('LanguageDetector should include Swift in detection patterns', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      // Check that Swift patterns are included
      const swiftPattern = detector.detectionPatterns.find(p => p.language === 'swift');
      expect(swiftPattern).toBeTruthy();
      expect(swiftPattern.name).toBe('Swift');
      expect(swiftPattern.files).toContain('Package.swift');
      expect(swiftPattern.extensions).toContain('.swift');
      expect(swiftPattern.confidence).toBe('high');
    });
  });

  describe('GitHub Issue Command', () => {
    test('issue command should be available in commands list', async () => {
      // Check that the issue command is included in the CLI commands
      const fs = await import('fs-extra');
      const cliContent = await fs.default.readFile('./bin/cli.js', 'utf8');
      
      expect(cliContent).toContain("'issue'");
    });

    test('issue command template should exist', async () => {
      const fs = await import('fs-extra');
      const templateExists = await fs.default.pathExists('./templates/commands/issue.md');
      expect(templateExists).toBe(true);
    });

    test('internal issue command should exist as markdown file', async () => {
      const fs = await import('fs-extra');
      const commandExists = await fs.default.pathExists('./.claude/commands/issue.md');
      expect(commandExists).toBe(true);
      
      // Verify it's a markdown command file with proper format
      const content = await fs.default.readFile('./.claude/commands/issue.md', 'utf8');
      expect(content).toContain('---'); // YAML frontmatter
      expect(content).toContain('# GitHub Issue Command'); // Command title
    });
  });

  describe('DevContainer Configuration', () => {
    test('getDevContainerConfig should handle Swift projects', () => {
      const config = getDevContainerConfig('swift');
      
      expect(config.name).toBe('Swift Development');
      expect(config.image).toBe('mcr.microsoft.com/devcontainers/swift:latest');
      expect(config.customizations.vscode.extensions).toContain('sswg.swift-lang');
      expect(config.forwardPorts).toContain(8080);
      expect(config.onCreateCommand).toContain('swift package resolve');
    });

    test('getDevContainerConfig should handle JavaScript projects', () => {
      const config = getDevContainerConfig('js');
      
      expect(config.name).toBe('JavaScript/TypeScript Development');
      expect(config.image).toBe('mcr.microsoft.com/devcontainers/javascript-node:18');
      expect(config.customizations.vscode.extensions).toContain('esbenp.prettier-vscode');
      expect(config.forwardPorts).toContain(3000);
    });

    test('getDevContainerConfig should handle unknown project types', () => {
      const config = getDevContainerConfig('unknown');
      
      expect(config.name).toBe('Development Container');
      expect(config.image).toBe('mcr.microsoft.com/devcontainers/universal:2');
    });
  });

  describe('Template Consistency', () => {
    test('all templates should contain required sections', () => {
      const claudeTemplate = generateClaudeTemplate({ qualityLevel: 'standard', teamSize: 'solo' });
      const activeWorkTemplate = generateActiveWorkTemplate({ qualityLevel: 'standard', projectType: 'js' });
      
      // CLAUDE.md should have essential sections
      expect(claudeTemplate).toContain('Project AI Guidelines');
      expect(claudeTemplate).toContain('Quality Standards');
      expect(claudeTemplate).toContain('Commands');
      expect(claudeTemplate).toContain('/hygiene');
      expect(claudeTemplate).toContain('/todo');
      expect(claudeTemplate).toContain('/commit');
      
      // ACTIVE_WORK.md should have essential sections
      expect(activeWorkTemplate).toContain('Current Session Focus');
      expect(activeWorkTemplate).toContain('Next Session Priorities');
      expect(activeWorkTemplate).toContain('Quality Status');
    });

    test('templates should be valid and well-formatted', () => {
      const claudeTemplate = generateClaudeTemplate({ qualityLevel: 'strict', teamSize: 'team' });
      
      // Should start with header
      expect(claudeTemplate).toMatch(/^# CLAUDE\.md/);
      
      // Should contain proper markdown structure
      expect(claudeTemplate).toContain('## ');
      
      // Should not have empty sections
      expect(claudeTemplate).not.toContain('## \n');
      
      // Should end properly
      expect(claudeTemplate.trim()).not.toMatch(/\n\n$/);
    });
  });
});