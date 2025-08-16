#!/usr/bin/env node

/**
 * Simple test runner for the project
 * Uses Node.js built-in assert module
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

// Test runner
global.describe = function(name, fn) {
  console.log(`\n${colors.blue}${name}${colors.reset}`);
  fn();
};

global.it = function(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${colors.green}✓${colors.reset} ${description}`);
  } catch (error) {
    failedTests++;
    console.log(`  ${colors.red}✗${colors.reset} ${description}`);
    failures.push({
      test: description,
      error: error.message,
      stack: error.stack
    });
  }
};

// Find all test files
function findTestFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && item !== 'fixtures') {
      files.push(...findTestFiles(fullPath));
    } else if (item.endsWith('.test.js')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Main execution
console.log(`${colors.blue}Running tests...${colors.reset}`);
const startTime = Date.now();

const testDir = path.join(__dirname);
const testFiles = findTestFiles(testDir);

if (testFiles.length === 0) {
  console.log(`${colors.yellow}No test files found${colors.reset}`);
  process.exit(0);
}

console.log(`Found ${testFiles.length} test file(s)\n`);

// Run each test file
for (const file of testFiles) {
  const testName = path.basename(file);
  console.log(`${colors.gray}Running ${testName}...${colors.reset}`);
  
  try {
    require(file);
  } catch (error) {
    console.log(`${colors.red}Failed to load ${testName}: ${error.message}${colors.reset}`);
    failedTests++;
  }
}

// Summary
const duration = Date.now() - startTime;
console.log('\n' + '='.repeat(50));
console.log(`\n${colors.blue}Test Summary${colors.reset}`);
console.log(`  Total:  ${totalTests}`);
console.log(`  ${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`  ${colors.red}Failed: ${failedTests}${colors.reset}`);
console.log(`  Time:   ${duration}ms`);

// Show failures if any
if (failures.length > 0) {
  console.log(`\n${colors.red}Failures:${colors.reset}`);
  failures.forEach((failure, index) => {
    console.log(`\n  ${index + 1}. ${failure.test}`);
    console.log(`     ${colors.red}${failure.error}${colors.reset}`);
    if (process.argv.includes('--verbose')) {
      console.log(`     ${colors.gray}${failure.stack}${colors.reset}`);
    }
  });
}

// Exit with appropriate code
if (failedTests > 0) {
  console.log(`\n${colors.red}✗ Tests failed${colors.reset}`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}✓ All tests passed${colors.reset}`);
  process.exit(0);
}