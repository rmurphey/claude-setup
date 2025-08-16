#!/usr/bin/env node

/**
 * Test-Driven Development Script
 * Implements red-green-refactor cycle for TDD workflow
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const command = process.argv[2] || 'help';
const feature = process.argv[3];
const options = process.argv.slice(4);

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function detectTestFramework(packageJson) {
  try {
    // If packageJson provided (for testing), use it
    if (packageJson) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.jest) return 'jest';
      if (deps.vitest) return 'vitest';
      if (deps.mocha) return 'mocha';
      if (deps.jasmine) return 'jasmine';
      if (deps['@playwright/test']) return 'playwright';
      if (deps.cypress) return 'cypress';
      
      return 'unknown';
    }
    
    // Otherwise read from filesystem
    if (fs.existsSync('package.json')) {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return detectTestFramework(pkg);
    }
    
    // Python frameworks
    if (fs.existsSync('pytest.ini') || fs.existsSync('setup.cfg')) return 'pytest';
    if (fs.existsSync('manage.py')) return 'django';
    
    // Ruby
    if (fs.existsSync('Gemfile')) {
      const gemfile = fs.readFileSync('Gemfile', 'utf8');
      if (gemfile.includes('rspec')) return 'rspec';
    }
    
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

function getTestCommand(framework) {
  // If no framework provided, detect it
  if (!framework) {
    framework = detectTestFramework();
  }
  
  switch (framework) {
    case 'jest':
      return 'npx jest --watch';
    case 'vitest':
      return 'npx vitest';
    case 'mocha':
      return 'npx mocha --watch';
    case 'pytest':
      return 'pytest --tb=short -v';
    case 'rspec':
      return 'rspec --format documentation';
    default:
      return 'npm test';
  }
}

function startTDD(featureName) {
  if (!featureName) {
    console.log('❌ Please specify a feature name');
    console.log('Usage: /tdd start <feature-name>');
    process.exit(1);
  }
  
  console.log('🚀 Starting TDD Workflow');
  console.log('========================');
  console.log('');
  console.log(`Feature: ${featureName}`);
  console.log(`Test Framework: ${detectTestFramework()}`);
  console.log('');
  
  // Create TDD tracking file
  const tddFile = `.tdd-session-${Date.now()}.md`;
  const content = `# TDD Session: ${featureName}
Date: ${new Date().toISOString()}
Framework: ${detectTestFramework()}

## Red Phase
- [ ] Write failing test
- [ ] Verify test fails for the right reason

## Green Phase
- [ ] Write minimal code to pass
- [ ] Verify test passes

## Refactor Phase
- [ ] Improve code structure
- [ ] Ensure tests still pass

## Progress Log
`;
  
  fs.writeFileSync(tddFile, content);
  
  console.log('📝 TDD Cycle:');
  console.log('');
  console.log(`  ${colors.red}1. RED${colors.reset} - Write a failing test`);
  console.log(`  ${colors.green}2. GREEN${colors.reset} - Make it pass with minimal code`);
  console.log(`  ${colors.blue}3. REFACTOR${colors.reset} - Improve the code`);
  console.log('');
  console.log('Created TDD tracking file:', tddFile);
  console.log('');
  console.log('Next step: Write your first failing test');
}

function redPhase() {
  console.log(`${colors.red}🔴 RED Phase - Write Failing Test${colors.reset}`);
  console.log('===================================');
  console.log('');
  console.log('Guidelines:');
  console.log('  1. Write the smallest possible failing test');
  console.log('  2. Test one behavior at a time');
  console.log('  3. Name test clearly: test_should_[expected_behavior]');
  console.log('  4. Run test to verify it fails');
  console.log('');
  console.log('Example test structure:');
  
  const framework = detectTestFramework();
  
  switch (framework) {
    case 'jest':
    case 'vitest':
      console.log(`
  describe('Feature', () => {
    it('should do expected behavior', () => {
      // Arrange
      const input = ...;
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });`);
      break;
    case 'pytest':
      console.log(`
  def test_should_do_expected_behavior():
      # Arrange
      input_data = ...
      
      # Act
      result = function_to_test(input_data)
      
      # Assert
      assert result == expected`);
      break;
    default:
      console.log('  • Arrange: Set up test data');
      console.log('  • Act: Execute the function');
      console.log('  • Assert: Verify the result');
  }
  
  console.log('');
  console.log(`Run: ${colors.yellow}${getTestCommand()}${colors.reset}`);
}

function greenPhase() {
  console.log(`${colors.green}🟢 GREEN Phase - Make Test Pass${colors.reset}`);
  console.log('==================================');
  console.log('');
  console.log('Guidelines:');
  console.log('  1. Write MINIMAL code to pass the test');
  console.log('  2. Don\'t worry about elegance yet');
  console.log('  3. Hard-code values if needed');
  console.log('  4. Focus only on making test green');
  console.log('');
  console.log('Anti-patterns to avoid:');
  console.log('  ❌ Adding untested functionality');
  console.log('  ❌ Over-engineering the solution');
  console.log('  ❌ Refactoring before test passes');
  console.log('');
  console.log(`Run: ${colors.yellow}${getTestCommand()}${colors.reset}`);
}

function refactorPhase() {
  console.log(`${colors.blue}🔵 REFACTOR Phase - Improve Code${colors.reset}`);
  console.log('===================================');
  console.log('');
  console.log('Refactoring checklist:');
  console.log('  □ Remove duplication');
  console.log('  □ Improve naming');
  console.log('  □ Extract methods/functions');
  console.log('  □ Simplify conditionals');
  console.log('  □ Apply design patterns');
  console.log('');
  console.log('Rules:');
  console.log('  ✅ Tests must stay green');
  console.log('  ✅ Refactor production code OR tests (not both)');
  console.log('  ✅ Make small, incremental changes');
  console.log('  ✅ Run tests after each change');
  console.log('');
  console.log(`Run: ${colors.yellow}${getTestCommand()}${colors.reset}`);
}

function runTests(watch = false) {
  console.log('🧪 Running Tests');
  console.log('================');
  console.log('');
  
  const testCmd = getTestCommand();
  console.log(`Command: ${testCmd}`);
  console.log('');
  
  try {
    if (watch) {
      // Start test watcher
      console.log('Starting test watcher... (Press Ctrl+C to stop)');
      const child = spawn(testCmd, { shell: true, stdio: 'inherit' });
      
      child.on('error', (error) => {
        console.error(`Error: ${error.message}`);
      });
    } else {
      // Run tests once
      const result = execSync(testCmd.replace('--watch', ''), { encoding: 'utf8' });
      console.log(result);
    }
  } catch (error) {
    console.log(`${colors.red}Tests failed!${colors.reset}`);
    console.log('');
    console.log('This is expected in the RED phase.');
    console.log('Make sure tests fail for the right reason.');
  }
}

function showCycle() {
  console.log('🔄 TDD Cycle Overview');
  console.log('====================');
  console.log('');
  
  console.log(`${colors.red}┌─────────────┐${colors.reset}`);
  console.log(`${colors.red}│   1. RED    │${colors.reset} Write a failing test`);
  console.log(`${colors.red}└──────┬──────┘${colors.reset}`);
  console.log('       │');
  console.log(`${colors.green}┌──────▼──────┐${colors.reset}`);
  console.log(`${colors.green}│  2. GREEN   │${colors.reset} Make test pass (minimal code)`);
  console.log(`${colors.green}└──────┬──────┘${colors.reset}`);
  console.log('       │');
  console.log(`${colors.blue}┌──────▼──────┐${colors.reset}`);
  console.log(`${colors.blue}│ 3. REFACTOR │${colors.reset} Improve code (tests stay green)`);
  console.log(`${colors.blue}└──────┬──────┘${colors.reset}`);
  console.log('       │');
  console.log('       └────────┐');
  console.log('                ↓');
  console.log('         Repeat cycle');
  console.log('');
  console.log('Benefits:');
  console.log('  • Confidence in code correctness');
  console.log('  • Better design through refactoring');
  console.log('  • Living documentation via tests');
  console.log('  • Faster debugging');
}

function showStats() {
  console.log('📊 TDD Statistics');
  console.log('=================');
  console.log('');
  
  // Count test files
  try {
    const testFiles = execSync('find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l', { encoding: 'utf8' }).trim();
    console.log(`Test files: ${testFiles}`);
    
    // Check coverage if available
    if (fs.existsSync('coverage/coverage-summary.json')) {
      const coverage = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'));
      const total = coverage.total;
      
      console.log('');
      console.log('Coverage:');
      console.log(`  • Lines: ${total.lines.pct}%`);
      console.log(`  • Branches: ${total.branches.pct}%`);
      console.log(`  • Functions: ${total.functions.pct}%`);
      console.log(`  • Statements: ${total.statements.pct}%`);
    }
    
    // Recent test commits
    const testCommits = execSync('git log --oneline --grep="test" -5 2>/dev/null', { encoding: 'utf8' });
    if (testCommits) {
      console.log('');
      console.log('Recent test commits:');
      testCommits.split('\n').filter(l => l).forEach(commit => {
        console.log(`  • ${commit}`);
      });
    }
  } catch {
    console.log('Unable to gather test statistics');
  }
}

function showHelp() {
  console.log('🧪 TDD (Test-Driven Development) Commands');
  console.log('=========================================');
  console.log('');
  console.log('Available commands:');
  console.log('  /tdd start <feature>  - Start TDD session for feature');
  console.log('  /tdd red              - Guidelines for RED phase');
  console.log('  /tdd green            - Guidelines for GREEN phase');
  console.log('  /tdd refactor         - Guidelines for REFACTOR phase');
  console.log('  /tdd test [--watch]   - Run tests (with optional watch)');
  console.log('  /tdd cycle            - Show TDD cycle overview');
  console.log('  /tdd stats            - Show testing statistics');
  console.log('  /tdd help             - Show this help message');
  console.log('');
  console.log('Example workflow:');
  console.log('  1. /tdd start user-auth');
  console.log('  2. /tdd red     (write failing test)');
  console.log('  3. /tdd green   (make test pass)');
  console.log('  4. /tdd refactor (improve code)');
  console.log('  5. Repeat steps 2-4');
}

// Main execution
if (require.main === module) {
  // CLI execution
  switch (command) {
    case 'start':
    case 'begin':
      startTDD(feature);
      break;
    case 'red':
      redPhase();
      break;
    case 'green':
      greenPhase();
      break;
    case 'refactor':
      refactorPhase();
      break;
    case 'test':
    case 'run':
      runTests(options.includes('--watch'));
      break;
    case 'cycle':
    case 'overview':
      showCycle();
      break;
    case 'stats':
    case 'statistics':
      showStats();
      break;
    case 'help':
    default:
      showHelp();
  }
} else {
  // Export for testing
  module.exports = {
    detectTestFramework,
    getTestCommand,
    startTDD,
    redPhase,
    greenPhase,
    refactorPhase
  };
}