/**
 * Test utility functions and behavioral testing helpers
 * 
 * This module provides utilities for writing behavior-focused tests that avoid
 * structural antipatterns and focus on functional outcomes.
 */

// =============================================================================
// Test Data Factories
// =============================================================================

/**
 * Create a valid test configuration for testing purposes
 */
export function createValidConfig(overrides = {}) {
  return {
    projectType: 'js',
    qualityLevel: 'standard',
    teamSize: 'small',
    cicd: false,
    ...overrides
  };
}

/**
 * Create an invalid test configuration for error testing
 */
export function createInvalidConfig(invalidFields = {}) {
  const base = createValidConfig();
  return { ...base, ...invalidFields };
}

/**
 * Test configuration data sets for comprehensive testing
 */
export const TEST_CONFIGURATIONS = {
  valid: {
    minimal: { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: false },
    complete: { projectType: 'python', qualityLevel: 'strict', teamSize: 'large', cicd: true },
    javascript: { projectType: 'js', qualityLevel: 'relaxed', teamSize: 'solo', cicd: false },
    typescript: { projectType: 'typescript', qualityLevel: 'strict', teamSize: 'small', cicd: true },
    python: { projectType: 'python', qualityLevel: 'standard', teamSize: 'large', cicd: false },
    go: { projectType: 'go', qualityLevel: 'strict', teamSize: 'small', cicd: true },
    rust: { projectType: 'rust', qualityLevel: 'relaxed', teamSize: 'solo', cicd: false },
    java: { projectType: 'java', qualityLevel: 'standard', teamSize: 'large', cicd: true },
    swift: { projectType: 'swift', qualityLevel: 'strict', teamSize: 'small', cicd: false }
  },
  invalid: {
    missingType: { qualityLevel: 'standard', teamSize: 'small', cicd: false },
    invalidType: { projectType: 'invalid-language', qualityLevel: 'standard', teamSize: 'small', cicd: false },
    invalidQuality: { projectType: 'js', qualityLevel: 'invalid-quality', teamSize: 'small', cicd: false },
    invalidTeamSize: { projectType: 'js', qualityLevel: 'standard', teamSize: 'invalid-size', cicd: false },
    invalidCicd: { projectType: 'js', qualityLevel: 'standard', teamSize: 'small', cicd: 'invalid-boolean' },
    multipleInvalid: { projectType: 'invalid', qualityLevel: 'invalid', teamSize: 'invalid', cicd: 'invalid' }
  }
};

// =============================================================================
// Behavioral Assertion Helpers
// =============================================================================

/**
 * Assert that a configuration validation produces expected results
 */
export function assertValidationResult(validator, config, expectedErrorCount, expectedErrorTypes = []) {
  const errors = validator.validateConfiguration(config);
  
  if (errors.length !== expectedErrorCount) {
    throw new Error(`Expected ${expectedErrorCount} validation errors, got ${errors.length}. Errors: ${JSON.stringify(errors)}`);
  }
  
  for (const errorType of expectedErrorTypes) {
    const hasExpectedError = errors.some(error => error.includes(errorType));
    if (!hasExpectedError) {
      throw new Error(`Expected error containing "${errorType}", but got errors: ${JSON.stringify(errors)}`);
    }
  }
}

/**
 * Assert that a function produces expected outcomes
 */
export function assertFunctionBehavior(fn, input, outcomeValidator, errorMessage = 'Function behavior assertion failed') {
  const result = fn(input);
  if (!outcomeValidator(result)) {
    throw new Error(`${errorMessage}. Input: ${JSON.stringify(input)}, Result: ${JSON.stringify(result)}`);
  }
  return result;
}

/**
 * Assert that async operations complete successfully
 */
export async function assertAsyncSuccess(asyncFn, ...args) {
  try {
    const result = await asyncFn(...args);
    if (result === undefined || result === null) {
      throw new Error('Async operation returned null/undefined');
    }
    return result;
  } catch (error) {
    throw new Error(`Expected async operation to succeed, but it failed: ${error.message}`);
  }
}

/**
 * Assert array contents without depending on order or indices
 */
export function assertArrayContains(array, expectedItems, message = 'Array should contain expected items') {
  if (!Array.isArray(array)) {
    throw new Error(`${message}: Expected array, got ${typeof array}`);
  }
  
  for (const item of expectedItems) {
    if (!array.includes(item)) {
      throw new Error(`${message}: missing "${item}". Array contents: ${JSON.stringify(array)}`);
    }
  }
}

/**
 * Assert that a template contains expected content
 */
export function assertTemplateContent(template, expectedContent, unexpectedContent = []) {
  if (typeof template !== 'string') {
    throw new Error(`Expected template to be string, got ${typeof template}`);
  }
  
  for (const content of expectedContent) {
    if (!template.includes(content)) {
      throw new Error(`Template missing expected content: "${content}"`);
    }
  }
  
  for (const content of unexpectedContent) {
    if (template.includes(content)) {
      throw new Error(`Template contains unexpected content: "${content}"`);
    }
  }
}

/**
 * Assert configuration sanitization behavior
 */
export function assertSanitizationBehavior(sanitizer, input, expectedTransformations) {
  const result = sanitizer.sanitizeConfiguration(input);
  
  for (const [field, expectedValue] of Object.entries(expectedTransformations)) {
    if (result[field] !== expectedValue) {
      throw new Error(`Sanitization failed for field "${field}": expected "${expectedValue}", got "${result[field]}"`);
    }
  }
  
  return result;
}

// =============================================================================
// Mock Strategies
// =============================================================================

/**
 * Create a mock file system for testing
 */
export function createMockFileSystem() {
  const mockFs = {
    readFile: null,
    writeFile: null,
    exists: null,
    mkdir: null,
    readdir: null
  };
  
  // Set up default behaviors
  mockFs.readFile = async (path) => {
    if (path.includes('package.json')) {
      return JSON.stringify({ name: 'test-project', version: '1.0.0' });
    }
    return 'mock file content';
  };
  
  mockFs.writeFile = async () => true;
  mockFs.exists = async () => true;
  mockFs.mkdir = async () => true;
  mockFs.readdir = async () => ['file1.js', 'file2.js'];
  
  return mockFs;
}

/**
 * Create a mock inquirer for interactive testing
 */
export function createMockInquirer(responses) {
  return {
    prompt: async (questions) => {
      const answers = {};
      for (const question of questions) {
        if (responses[question.name] !== undefined) {
          answers[question.name] = responses[question.name];
        } else if (question.default !== undefined) {
          answers[question.name] = question.default;
        } else {
          throw new Error(`No mock response provided for question: ${question.name}`);
        }
      }
      return answers;
    }
  };
}

/**
 * Create a mock language detector for testing
 */
export function createMockLanguageDetector(detectionResult) {
  return {
    detectLanguage: async () => detectionResult,
    getBestGuess: async () => detectionResult,
    loadConfig: async () => ({
      language: { primary: detectionResult?.language || 'js' },
      setup: { qualityLevel: 'standard', teamSize: 'small' }
    }),
    saveConfig: async () => true
  };
}

// =============================================================================
// Test Execution Helpers
// =============================================================================

/**
 * Run a test with temporary file cleanup
 */
export async function withTempFiles(testFn, filePaths = []) {
  try {
    await testFn();
  } finally {
    // Clean up any temporary files
    const fs = await import('fs');
    for (const filePath of filePaths) {
      try {
        await fs.promises.unlink(filePath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Test that a function handles errors gracefully
 */
export async function assertErrorHandling(fn, input, expectedErrorPattern) {
  try {
    await fn(input);
    throw new Error('Expected function to throw an error, but it succeeded');
  } catch (error) {
    if (expectedErrorPattern && !error.message.match(expectedErrorPattern)) {
      throw new Error(`Expected error matching pattern "${expectedErrorPattern}", got: ${error.message}`);
    }
  }
}

/**
 * Assert that a configuration produces expected setup behavior
 */
export function assertSetupBehavior(setupFn, config, expectedOutcomes) {
  return assertFunctionBehavior(
    setupFn,
    config,
    (result) => {
      for (const [key, expectedValue] of Object.entries(expectedOutcomes)) {
        if (result[key] !== expectedValue) {
          return false;
        }
      }
      return true;
    },
    'Setup behavior assertion failed'
  );
}

// =============================================================================
// Expected Outcomes
// =============================================================================

export const EXPECTED_OUTCOMES = {
  validation: {
    validConfig: { errorCount: 0, errors: [] },
    invalidType: { errorCount: 1, errors: ['Invalid project type'] },
    invalidQuality: { errorCount: 1, errors: ['Invalid quality level'] },
    invalidTeamSize: { errorCount: 1, errors: ['Invalid team size'] },
    invalidCicd: { errorCount: 1, errors: ['Invalid CI/CD setting'] },
    multipleErrors: { errorCount: 4, errors: ['Invalid project type', 'Invalid quality level', 'Invalid team size', 'Invalid CI/CD setting'] }
  },
  templates: {
    claude: {
      shouldContain: ['Quality Level**', 'Team Size**', 'Project Type**'],
      shouldNotContain: ['undefined', 'null', '{{', 'NaN']
    },
    activeWork: {
      shouldContain: ['Type**', 'Quality**', new Date().toISOString().split('T')[0]],
      shouldNotContain: ['undefined', 'null', '{{']
    },
    gitignore: {
      shouldContain: ['node_modules/', '.env', '*.log'],
      shouldNotContain: ['undefined', 'null']
    }
  },
  devContainer: {
    javascript: {
      shouldHave: { name: 'JavaScript/TypeScript Development', forwardPorts: [3000, 8080] },
      shouldNotHave: { name: 'Python Development' }
    },
    python: {
      shouldHave: { name: 'Python Development', forwardPorts: [8000, 5000] },
      shouldNotHave: { name: 'JavaScript/TypeScript Development' }
    }
  }
};

// =============================================================================
// Language-Specific Test Data
// =============================================================================

export const LANGUAGE_TEST_DATA = {
  js: {
    extensions: ['.js', '.mjs', '.ts', '.tsx'],
    files: ['package.json', 'index.js', 'src/main.js'],
    validAliases: ['javascript', 'typescript', 'ts', 'node', 'nodejs']
  },
  python: {
    extensions: ['.py', '.pyw', '.pyi'],
    files: ['requirements.txt', 'setup.py', 'main.py', 'src/__init__.py'],
    validAliases: ['py']
  },
  go: {
    extensions: ['.go'],
    files: ['go.mod', 'go.sum', 'main.go'],
    validAliases: ['golang']
  },
  rust: {
    extensions: ['.rs'],
    files: ['Cargo.toml', 'Cargo.lock', 'src/main.rs'],
    validAliases: ['rs']
  },
  java: {
    extensions: ['.java', '.class', '.jar'],
    files: ['pom.xml', 'build.gradle', 'src/main/java/Main.java'],
    validAliases: []
  },
  swift: {
    extensions: ['.swift'],
    files: ['Package.swift', 'Sources/main.swift'],
    validAliases: []
  }
};