import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';

import { InteractiveSetup } from '../lib/cli/interactive.js';

describe('InteractiveSetup', () => {
  let interactive;
  let originalConsoleLog;
  let originalConsoleError;
  let consoleOutput;
  let consoleErrors;


  beforeEach(() => {
    interactive = new InteractiveSetup();
    consoleOutput = [];
    consoleErrors = [];

    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = (...args) => consoleOutput.push(args.join(' '));
    console.error = (...args) => consoleErrors.push(args.join(' '));
  });

  afterEach(() => {
    // Restore original methods
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    mock.restoreAll();
  });

  describe('constructor', () => {
    it('should initialize with correct default questions', () => {
      assert.strictEqual(interactive.modeQuestion.type, 'list');
      assert.strictEqual(interactive.modeQuestion.name, 'mode');
      assert.strictEqual(interactive.modeQuestion.choices.length, 3);
      
      assert.strictEqual(interactive.baseQuestions.length, 4);
      assert.strictEqual(interactive.baseQuestions[0].name, 'projectType');
      assert.strictEqual(interactive.baseQuestions[1].name, 'qualityLevel');
      assert.strictEqual(interactive.baseQuestions[2].name, 'teamSize');
      assert.strictEqual(interactive.baseQuestions[3].name, 'cicd');
    });

    it('should initialize validation arrays correctly', () => {
      assert.ok(Array.isArray(interactive.validProjectTypes));
      assert.ok(Array.isArray(interactive.validQualityLevels));
      assert.ok(Array.isArray(interactive.validTeamSizes));
      
      assert.ok(interactive.validProjectTypes.includes('js'));
      assert.ok(interactive.validProjectTypes.includes('python'));
      assert.ok(interactive.validQualityLevels.includes('strict'));
      assert.ok(interactive.validTeamSizes.includes('solo'));
    });
  });

  describe('validateConfiguration', () => {
    it('should return no errors for valid configuration', () => {
      const config = {
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: true
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 0);
    });

    it('should return error for invalid project type', () => {
      const config = {
        projectType: 'invalid',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: true
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes('Invalid project type'));
    });

    it('should return error for missing project type', () => {
      const config = {
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: true
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes('Invalid project type'));
    });

    it('should return error for invalid quality level', () => {
      const config = {
        projectType: 'js',
        qualityLevel: 'invalid',
        teamSize: 'small',
        cicd: true
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes('Invalid quality level'));
    });

    it('should return error for invalid team size', () => {
      const config = {
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'invalid',
        cicd: true
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes('Invalid team size'));
    });

    it('should return error for invalid cicd type', () => {
      const config = {
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: 'invalid'
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 1);
      assert.ok(errors[0].includes('Invalid CI/CD setting'));
    });

    it('should return multiple errors for multiple invalid fields', () => {
      const config = {
        projectType: 'invalid',
        qualityLevel: 'invalid',
        teamSize: 'invalid',
        cicd: 'invalid'
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 4);
    });
  });

  describe('sanitizeConfiguration', () => {
    it('should normalize project type to lowercase', () => {
      const config = { projectType: 'JS', qualityLevel: 'STANDARD', teamSize: 'SMALL', cicd: true };
      const sanitized = interactive.sanitizeConfiguration(config);
      
      assert.strictEqual(sanitized.projectType, 'js');
      assert.strictEqual(sanitized.qualityLevel, 'standard');
      assert.strictEqual(sanitized.teamSize, 'small');
    });

    it('should handle project type aliases', () => {
      const testCases = [
        { input: 'javascript', expected: 'js' },
        { input: 'typescript', expected: 'js' },
        { input: 'ts', expected: 'js' },
        { input: 'node', expected: 'js' },
        { input: 'nodejs', expected: 'js' },
        { input: 'py', expected: 'python' },
        { input: 'golang', expected: 'go' },
        { input: 'rs', expected: 'rust' }
      ];
      
      for (const testCase of testCases) {
        const config = { projectType: testCase.input, qualityLevel: 'standard', teamSize: 'small', cicd: true };
        const sanitized = interactive.sanitizeConfiguration(config);
        assert.strictEqual(sanitized.projectType, testCase.expected, `Failed for input: ${testCase.input}`);
      }
    });

    it('should trim whitespace from string values', () => {
      const config = {
        projectType: '  js  ',
        qualityLevel: '  standard  ',
        teamSize: '  small  ',
        cicd: true
      };
      
      const sanitized = interactive.sanitizeConfiguration(config);
      assert.strictEqual(sanitized.projectType, 'js');
      assert.strictEqual(sanitized.qualityLevel, 'standard');
      assert.strictEqual(sanitized.teamSize, 'small');
    });

    it('should convert string cicd values to boolean', () => {
      const testCases = [
        { input: 'true', expected: true },
        { input: 'yes', expected: true },
        { input: '1', expected: true },
        { input: 'false', expected: false },
        { input: 'no', expected: false },
        { input: '0', expected: false },
        { input: 'invalid', expected: false }
      ];
      
      for (const testCase of testCases) {
        const config = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: testCase.input };
        const sanitized = interactive.sanitizeConfiguration(config);
        assert.strictEqual(sanitized.cicd, testCase.expected, `Failed for input: ${testCase.input}`);
      }
    });

    it('should preserve boolean cicd values', () => {
      const config1 = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: true };
      const config2 = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: false };
      
      const sanitized1 = interactive.sanitizeConfiguration(config1);
      const sanitized2 = interactive.sanitizeConfiguration(config2);
      
      assert.strictEqual(sanitized1.cicd, true);
      assert.strictEqual(sanitized2.cicd, false);
    });

    it('should not modify original config object', () => {
      const originalConfig = { projectType: 'JS', qualityLevel: 'STANDARD', teamSize: 'SMALL', cicd: 'true' };
      const configCopy = { ...originalConfig };
      
      interactive.sanitizeConfiguration(originalConfig);
      
      assert.deepStrictEqual(originalConfig, configCopy);
    });
  });

  describe('processSmartAnswers', () => {
    it('should use detected language when user confirms', () => {
      const answers = { useDetectedLanguage: true, qualityLevel: 'standard', teamSize: 'small', cicd: false };
      const detection = { type: 'single', language: 'python', name: 'Python' };
      
      const processed = interactive.processSmartAnswers(answers, detection);
      
      assert.strictEqual(processed.projectType, 'python');
      assert.strictEqual(processed.useDetectedLanguage, undefined);
    });

    it('should not modify answers when user rejects detection', () => {
      const answers = { useDetectedLanguage: false, projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: false };
      const detection = { type: 'single', language: 'python', name: 'Python' };
      
      const processed = interactive.processSmartAnswers(answers, detection);
      
      assert.strictEqual(processed.projectType, 'js');
      assert.strictEqual(processed.useDetectedLanguage, undefined);
    });

    it('should not modify answers when no detection available', () => {
      const answers = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: false };
      const detection = null;
      
      const processed = interactive.processSmartAnswers(answers, detection);
      
      assert.strictEqual(processed.projectType, 'js');
    });

    it('should not modify answers for multiple detection type', () => {
      const answers = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: false };
      const detection = { type: 'multiple', candidates: [] };
      
      const processed = interactive.processSmartAnswers(answers, detection);
      
      assert.strictEqual(processed.projectType, 'js');
    });

    it('should clean up useDetectedLanguage property', () => {
      const answers = { useDetectedLanguage: true, qualityLevel: 'standard', teamSize: 'small', cicd: false };
      const detection = { type: 'single', language: 'python', name: 'Python' };
      
      const processed = interactive.processSmartAnswers(answers, detection);
      
      assert.ok(!Object.prototype.hasOwnProperty.call(processed, 'useDetectedLanguage'));
    });
  });

  describe('buildSmartQuestions', () => {
    it('should handle no language detection', async () => {
      // Test the buildSmartQuestions method with a mock that simulates no detection
      // Since we can't easily mock ES modules, we'll test the logic indirectly
      const result = await interactive.buildSmartQuestions();
      
      assert.ok(result.smartQuestions);
      assert.ok(result.smartQuestions.length >= 4); // Should have at least the base questions
      
      // Should have questions for quality level, team size, and cicd
      const qualityQuestion = result.smartQuestions.find(q => q.name === 'qualityLevel');
      const teamQuestion = result.smartQuestions.find(q => q.name === 'teamSize');
      const cicdQuestion = result.smartQuestions.find(q => q.name === 'cicd');
      
      assert.ok(qualityQuestion);
      assert.ok(teamQuestion);
      assert.ok(cicdQuestion);
    });

    it('should handle buildSmartQuestions structure', async () => {
      const result = await interactive.buildSmartQuestions();
      
      assert.ok(result.smartQuestions);
      assert.ok(Array.isArray(result.smartQuestions));
      assert.ok(result.smartQuestions.length > 0);
      
      // Each question should have required properties
      for (const question of result.smartQuestions) {
        assert.ok(question.type);
        assert.ok(question.name);
        assert.ok(question.message);
      }
    });

    it('should include project type question in some form', async () => {
      const result = await interactive.buildSmartQuestions();
      
      // Should have either a projectType question or a useDetectedLanguage question
      const hasProjectType = result.smartQuestions.some(q => q.name === 'projectType');
      const hasDetectedLanguage = result.smartQuestions.some(q => q.name === 'useDetectedLanguage');
      
      assert.ok(hasProjectType || hasDetectedLanguage, 'Should have some form of project type question');
    });

    it('should include all base questions', async () => {
      const result = await interactive.buildSmartQuestions();
      
      // Should have questions for quality level, team size, and cicd
      const qualityQuestion = result.smartQuestions.find(q => q.name === 'qualityLevel');
      const teamQuestion = result.smartQuestions.find(q => q.name === 'teamSize');
      const cicdQuestion = result.smartQuestions.find(q => q.name === 'cicd');
      
      assert.ok(qualityQuestion);
      assert.ok(teamQuestion);
      assert.ok(cicdQuestion);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle empty configuration object', () => {
      const config = {};
      const errors = interactive.validateConfiguration(config);
      
      assert.strictEqual(errors.length, 4); // All fields should be invalid
    });

    it('should handle null configuration values', () => {
      const config = {
        projectType: null,
        qualityLevel: null,
        teamSize: null,
        cicd: null
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 4);
    });

    it('should handle undefined configuration values', () => {
      const config = {
        projectType: undefined,
        qualityLevel: undefined,
        teamSize: undefined,
        cicd: undefined
      };
      
      const errors = interactive.validateConfiguration(config);
      assert.strictEqual(errors.length, 4);
    });

    it('should sanitize configuration with missing fields', () => {
      const config = { projectType: 'js' };
      const sanitized = interactive.sanitizeConfiguration(config);
      
      assert.strictEqual(sanitized.projectType, 'js');
      assert.strictEqual(sanitized.qualityLevel, undefined);
      assert.strictEqual(sanitized.teamSize, undefined);
      assert.strictEqual(sanitized.cicd, undefined);
    });

    it('should handle case-insensitive string boolean conversion', () => {
      const testCases = ['TRUE', 'True', 'YES', 'Yes', 'FALSE', 'False', 'NO', 'No'];
      
      for (const testCase of testCases) {
        const config = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: testCase };
        const sanitized = interactive.sanitizeConfiguration(config);
        
        const expected = ['TRUE', 'True', 'YES', 'Yes'].includes(testCase);
        assert.strictEqual(sanitized.cicd, expected, `Failed for input: ${testCase}`);
      }
    });

    it('should preserve original object structure during sanitization', () => {
      const config = {
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: true,
        extraField: 'should be preserved'
      };
      
      const sanitized = interactive.sanitizeConfiguration(config);
      assert.strictEqual(sanitized.extraField, 'should be preserved');
    });
  });

  describe('Performance considerations', () => {
    it('should handle large validation arrays efficiently', () => {
      // Add many items to validation arrays
      const originalTypes = [...interactive.validProjectTypes];
      interactive.validProjectTypes = [...originalTypes, ...Array(1000).fill('test-type')];
      
      const config = { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: true };
      
      const startTime = Date.now();
      const errors = interactive.validateConfiguration(config);
      const endTime = Date.now();
      
      assert.strictEqual(errors.length, 0);
      assert.ok(endTime - startTime < 50, 'Validation should complete quickly');
      
      // Restore original array
      interactive.validProjectTypes = originalTypes;
    });

    it('should handle complex configuration objects efficiently', () => {
      const config = {
        projectType: 'js',
        qualityLevel: 'standard',
        teamSize: 'small',
        cicd: true,
        // Add many extra fields
        ...Object.fromEntries(Array(100).fill().map((_, i) => [`field${i}`, `value${i}`]))
      };
      
      const startTime = Date.now();
      const sanitized = interactive.sanitizeConfiguration(config);
      const endTime = Date.now();
      
      assert.strictEqual(sanitized.projectType, 'js');
      assert.ok(endTime - startTime < 50, 'Sanitization should complete quickly');
    });
  });
});