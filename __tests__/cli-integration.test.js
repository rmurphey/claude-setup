import { describe, test } from 'node:test';
import assert from 'node:assert';
import { 
  generateClaudeTemplate, 
  generateActiveWorkTemplate, 
  generateGitignore,
  getDevContainerConfig,
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
      
      assert(result.includes('**Quality Level**: strict'));
      assert(result.includes('**Team Size**: team'));
      assert(result.includes('Warning Threshold**: 0'));
      assert(result.includes('Claude Code Collaboration Guidelines'));
    });

    test('generateClaudeTemplate should create proper content for standard quality', () => {
      const config = {
        qualityLevel: 'standard',
        teamSize: 'solo'
      };
      
      const result = generateClaudeTemplate(config);
      
      assert(result.includes('**Quality Level**: standard'));
      assert(result.includes('**Team Size**: solo'));
      assert(result.includes('Warning Threshold**: <10'));
    });

    test('generateClaudeTemplate should create proper content for relaxed quality', () => {
      const config = {
        qualityLevel: 'relaxed',
        teamSize: 'small'
      };
      
      const result = generateClaudeTemplate(config);
      
      assert(result.includes('**Quality Level**: relaxed'));
      assert(result.includes('**Team Size**: small'));
      assert(result.includes('Warning Threshold**: <50'));
    });

    test('generateActiveWorkTemplate should create consistent content', () => {
      const config = { qualityLevel: 'standard', projectType: 'js' };
      const result = generateActiveWorkTemplate(config);
      
      assert(result.includes('# Active Work Session'));
      assert(result.includes('## Current Session'));
      assert(result.includes('## Next Steps'));
      assert(result.includes('- [ ] Initial project setup complete'));
      assert(result.includes('Project initialized with'));
    });

    test('generateGitignore should handle JavaScript projects', () => {
      const result = generateGitignore('js');
      
      assert(result.includes('node_modules/'));
      assert(result.includes('.DS_Store'));
      assert(result.includes('*.log'));
      assert(result.includes('dist/'));
      assert(result.includes('build/'));
      assert(result.includes('.eslintcache'));
    });

    test('generateGitignore should handle Python projects', () => {
      const result = generateGitignore('python');
      
      assert(result.includes('__pycache__/'));
      assert(result.includes('*.pyc'));
      assert(result.includes('*.egg-info/'));
      assert(result.includes('.pytest_cache/'));
      assert(result.includes('.coverage'));
    });

    test('generateGitignore should handle Go projects with common patterns', () => {
      const result = generateGitignore('go');
      
      // Go projects get the common template since no specific case exists
      assert(result.includes('node_modules/'));
      assert(result.includes('.DS_Store'));
      assert(result.includes('*.log'));
      assert(result.includes('target/')); // Part of common template
    });

    test('generateGitignore should handle Rust projects with common patterns', () => {
      const result = generateGitignore('rust');
      
      // Rust projects get the common template since no specific case exists
      assert(result.includes('target/')); // Part of common template
      assert(result.includes('.DS_Store'));
      assert(result.includes('*.log'));
    });

    test('generateGitignore should handle Swift projects', () => {
      const result = generateGitignore('swift');
      
      assert(result.includes('.build/'));
      assert(result.includes('.swiftpm/'));
      assert(result.includes('*.xcodeproj/'));
      assert(result.includes('*.xcworkspace/'));
      assert(result.includes('xcuserdata/'));
      assert(result.includes('DerivedData/'));
      assert(result.includes('Carthage/'));
      assert(result.includes('Pods/'));
      assert(result.includes('*.dSYM'));
    });

    test('generateGitignore should handle Java projects with common patterns', () => {
      const result = generateGitignore('java');
      
      // Java projects get the common template since no specific case exists
      assert(result.includes('target/')); // Part of common template
      assert(result.includes('.DS_Store'));
      assert(result.includes('*.log'));
    });

    test('generateGitignore should handle unknown project types with basic content', () => {
      const result = generateGitignore('other');
      
      // Should contain common ignores
      assert(result.includes('node_modules/'));
      assert(result.includes('.DS_Store'));
      assert(result.includes('*.log'));
      assert(result.includes('target/')); // Part of common template
      
      // Should not contain language-specific ignores
      assert(!result.includes('dist/')); // JS-specific
      assert(!result.includes('*.egg-info/')); // Python-specific
      assert(!result.includes('.eslintcache')); // JS-specific
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
          
          assert(result.includes(`**Quality Level**: ${qualityLevel}`));
          assert(result.includes(`**Team Size**: ${teamSize}`));
          
          // Check quality-specific thresholds
          if (qualityLevel === 'strict') {
            assert(result.includes('Warning Threshold**: 0'));
          } else if (qualityLevel === 'standard') {
            assert(result.includes('Warning Threshold**: <10'));
          } else if (qualityLevel === 'relaxed') {
            assert(result.includes('Warning Threshold**: <50'));
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
        assert(result.includes('.DS_Store'));
        assert(result.includes('*.log'));
        
        // Language-specific checks
        switch(language) {
          case 'js':
            assert(result.includes('node_modules/'));
            assert(result.includes('dist/'));
            assert(result.includes('.eslintcache'));
            break;
          case 'python':
            assert(result.includes('__pycache__/'));
            assert(result.includes('*.pyc'));
            assert(result.includes('.pytest_cache/'));
            break;
        }
      });
    });

    commonLanguages.forEach(language => {
      test(`should generate common gitignore for ${language}`, () => {
        const result = generateGitignore(language);
        
        // Should have common patterns
        assert(result.includes('.DS_Store'));
        assert(result.includes('*.log'));
        assert(result.includes('target/')); // Part of common template
        assert(result.includes('node_modules/')); // Part of common template
      });
    });
  });

  describe('Smart Language Detection', () => {
    test('LanguageDetector should detect JavaScript projects', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      // This test runs in a project with package.json, so should detect JS
      const detection = await detector.getBestGuess();
      
      assert(detection);
      assert.strictEqual(detection.type, 'single');
      assert.strictEqual(detection.language, 'js');
      assert.strictEqual(detection.name, 'JavaScript/TypeScript');
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
      assert(formatted.includes('package.json'));
      assert(formatted.includes('5 source files'));
      assert(formatted.includes('.js'));
    });

    test('LanguageDetector should handle no detection gracefully', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      // Mock empty directory
      // const originalReaddir = detector.findSourceFiles;
      detector.findSourceFiles = async () => ({ extensions: [], count: 0 });
      
      const detections = await detector.detectLanguages();
      assert(Array.isArray(detections));
    });

    test('LanguageDetector should include Swift in detection patterns', async () => {
      const { LanguageDetector } = await import('../lib/language-detector.js');
      const detector = new LanguageDetector();
      
      // Check that Swift patterns are included
      const swiftPattern = detector.detectionPatterns.find(p => p.language === 'swift');
      assert(swiftPattern);
      assert.strictEqual(swiftPattern.name, 'Swift');
      assert(swiftPattern.files.includes('Package.swift'));
      assert(swiftPattern.extensions.includes('.swift'));
      assert.strictEqual(swiftPattern.confidence, 'high');
    });
  });

  describe('GitHub Issue Command', () => {
    test('CLI should have main function exported', async () => {
      // Check that the CLI exports the main function
      const fs = await import('fs-extra');
      const cliContent = await fs.default.readFile('./bin/cli.js', 'utf8');
      
      assert(cliContent.includes('export { main }'));
    });

    test('issue command template should exist', async () => {
      const fs = await import('fs-extra');
      const templateExists = await fs.default.pathExists('./templates/commands/issue.md');
      assert.strictEqual(templateExists, true);
    });

    test('internal issue command should exist as markdown file', async () => {
      const fs = await import('fs-extra');
      const commandExists = await fs.default.pathExists('./.claude/commands/issue.md');
      assert.strictEqual(commandExists, true);
      
      // Verify it's a markdown command file with proper format
      const content = await fs.default.readFile('./.claude/commands/issue.md', 'utf8');
      assert(content.includes('---')); // YAML frontmatter
      assert(content.includes('# GitHub Issue Command')); // Command title
    });
  });

  describe('DevContainer Configuration', () => {
    test('getDevContainerConfig should handle Swift projects', () => {
      const config = getDevContainerConfig('swift');
      
      assert.strictEqual(config.name, 'Swift Development');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/swift:latest');
      assert(config.customizations.vscode.extensions.includes('sswg.swift-lang'));
      assert(config.forwardPorts.includes(8080));
      assert(config.onCreateCommand.includes('swift package resolve'));
    });

    test('getDevContainerConfig should handle JavaScript projects', () => {
      const config = getDevContainerConfig('js');
      
      assert.strictEqual(config.name, 'JavaScript/TypeScript Development');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/javascript-node:18');
      assert(config.customizations.vscode.extensions.includes('esbenp.prettier-vscode'));
      assert(config.forwardPorts.includes(3000));
    });

    test('getDevContainerConfig should handle unknown project types', () => {
      const config = getDevContainerConfig('unknown');
      
      assert.strictEqual(config.name, 'Development Container');
      assert.strictEqual(config.image, 'mcr.microsoft.com/devcontainers/universal:2');
    });
  });

  describe('Template Consistency', () => {
    test('all templates should contain required sections', () => {
      const claudeTemplate = generateClaudeTemplate({ qualityLevel: 'standard', teamSize: 'solo' });
      const activeWorkTemplate = generateActiveWorkTemplate({ qualityLevel: 'standard', projectType: 'js' });
      
      // CLAUDE.md should have essential sections
      assert(claudeTemplate.includes('Claude Code Collaboration Guidelines'));
      assert(claudeTemplate.includes('Quality Guidelines'));
      assert(claudeTemplate.includes('Custom Commands'));
      assert(claudeTemplate.includes('/hygiene'));
      assert(claudeTemplate.includes('/todo'));
      assert(claudeTemplate.includes('/commit'));
      
      // ACTIVE_WORK.md should have essential sections
      assert(activeWorkTemplate.includes('## Current Session'));
      assert(activeWorkTemplate.includes('## Next Steps'));
      assert(activeWorkTemplate.includes('## Progress'));
    });

    test('templates should be valid and well-formatted', () => {
      const claudeTemplate = generateClaudeTemplate({ qualityLevel: 'strict', teamSize: 'team' });
      
      // Should start with header
      assert(/^# Claude Code/.test(claudeTemplate));
      
      // Should contain proper markdown structure
      assert(claudeTemplate.includes('## '));
      
      // Should not have empty sections
      assert(!claudeTemplate.includes('## \n'));
      
      // Should end properly
      assert(!/\n\n$/.test(claudeTemplate.trim()));
    });
  });
});