---
allowed-tools: [Bash, Read, Write]
description: Test-driven development workflow with red-green-refactor cycle
---

# Test-Driven Development (TDD) Command

<!-- 
This command is self-updating. To regenerate:
In Claude Code: /docs update tdd-command
Last updated: 2025-01-16
Git SHA: 9af0fdc7e42e3e0fff960e73cf8520a9c32e7dcb
-->

Implements the red-green-refactor cycle for test-driven development, helping you write better code through test-first methodology.

## Context
- Test framework: !`grep -E "jest|mocha|vitest|pytest|rspec" package.json 2>/dev/null | head -1 | grep -o '"[^"]*"' | head -1 | tr -d '"' || echo "not detected"`
- Test files: !`find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l | xargs`+ test files
- Coverage: !`[ -f coverage/coverage-summary.json ] && grep -o '"pct":[0-9.]*' coverage/coverage-summary.json | head -1 | cut -d: -f2 || echo "unknown"`%
- Last test run: !`git log -1 --format="%cr" --grep="test" 2>/dev/null || echo "unknown"`

## Your Task

Guide through the TDD workflow using the red-green-refactor cycle:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-start}"
FEATURE="${2}"
OPTIONS="${*:3}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

case "$COMMAND" in
  "start"|"begin")
    echo "🚀 Starting TDD Workflow"
    echo "========================"
    
    if [ -z "$FEATURE" ]; then
      echo "❌ Please specify a feature name"
      echo "Usage: /tdd start <feature-name>"
      exit 1
    fi
    
    echo ""
    echo "📋 TDD Cycle for: $FEATURE"
    echo ""
    echo -e "${RED}Step 1: RED - Write a failing test${NC}"
    echo "--------------------------------------"
    echo "Create a test that describes the desired behavior:"
    echo ""
    
    # Detect test framework
    if grep -q "jest" package.json 2>/dev/null; then
      cat << EOF
// $FEATURE.test.js
describe('$FEATURE', () => {
  it('should [describe expected behavior]', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = $FEATURE(input);
    
    // Assert
    expect(result).toBe(expectedValue);
  });
});
EOF
    elif grep -q "mocha" package.json 2>/dev/null; then
      cat << EOF
// $FEATURE.test.js
const assert = require('assert');

describe('$FEATURE', () => {
  it('should [describe expected behavior]', () => {
    // Arrange
    const input = ...;
    
    // Act
    const result = $FEATURE(input);
    
    // Assert
    assert.equal(result, expectedValue);
  });
});
EOF
    else
      echo "// Write your test for $FEATURE"
      echo "// Following the Arrange-Act-Assert pattern"
    fi
    
    echo ""
    echo "💡 Tips for Step 1 (RED):"
    echo "  • Write the simplest test that could fail"
    echo "  • Focus on one specific behavior"
    echo "  • Test should fail because the code doesn't exist yet"
    echo "  • Run: npm test (to verify it fails)"
    echo ""
    echo "Next: /tdd green $FEATURE"
    ;;
    
  "green"|"implement")
    echo -e "${GREEN}Step 2: GREEN - Make the test pass${NC}"
    echo "------------------------------------"
    
    if [ -z "$FEATURE" ]; then
      echo "Implementing minimal code to pass the test..."
    else
      echo "Implementing minimal code for: $FEATURE"
    fi
    
    echo ""
    echo "Write the MINIMUM code required to make the test pass:"
    echo ""
    
    cat << EOF
// $FEATURE.js
function $FEATURE(input) {
  // Write just enough code to make the test pass
  // Don't worry about elegance yet
  return expectedValue; // Even hard-coding is OK initially
}

module.exports = $FEATURE;
EOF
    
    echo ""
    echo "💡 Tips for Step 2 (GREEN):"
    echo "  • Write the simplest code that makes the test pass"
    echo "  • Don't optimize or generalize yet"
    echo "  • It's OK to hard-code values initially"
    echo "  • Run: npm test (should now pass)"
    echo ""
    echo "Next: /tdd refactor $FEATURE"
    ;;
    
  "refactor"|"improve")
    echo -e "${YELLOW}Step 3: REFACTOR - Improve the code${NC}"
    echo "------------------------------------"
    
    if [ -z "$FEATURE" ]; then
      echo "Refactoring to improve code quality..."
    else
      echo "Refactoring: $FEATURE"
    fi
    
    echo ""
    echo "Now improve the code while keeping tests green:"
    echo ""
    echo "Refactoring checklist:"
    echo "  ✓ Remove duplication"
    echo "  ✓ Improve naming"
    echo "  ✓ Extract methods/functions"
    echo "  ✓ Simplify complex logic"
    echo "  ✓ Apply design patterns if appropriate"
    echo "  ✓ Improve performance (if needed)"
    echo ""
    echo "After EACH change:"
    echo "  1. Run tests: npm test"
    echo "  2. Ensure all tests still pass"
    echo "  3. Commit if tests pass"
    echo ""
    echo "💡 Tips for Step 3 (REFACTOR):"
    echo "  • Make small, incremental changes"
    echo "  • Run tests after each change"
    echo "  • Keep the external behavior the same"
    echo "  • Focus on code clarity and maintainability"
    echo ""
    echo "Next: /tdd cycle $FEATURE (start next cycle)"
    ;;
    
  "cycle"|"next")
    echo "🔄 Starting Next TDD Cycle"
    echo "=========================="
    
    echo ""
    echo "Ready for the next feature or edge case!"
    echo ""
    echo "1. Add a new test for:"
    echo "   • Next feature requirement"
    echo "   • Edge case handling"
    echo "   • Error conditions"
    echo "   • Performance requirements"
    echo ""
    echo "2. Follow the cycle again:"
    echo -e "   ${RED}RED${NC} → ${GREEN}GREEN${NC} → ${YELLOW}REFACTOR${NC}"
    echo ""
    echo "Continue with: /tdd start <next-feature>"
    ;;
    
  "status"|"check")
    echo "📊 TDD Status Check"
    echo "==================="
    
    # Check for test files
    TEST_COUNT=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l | xargs)
    SRC_COUNT=$(find . -name "*.js" -o -name "*.ts" | grep -v -E "test|spec|node_modules" | wc -l | xargs)
    
    echo ""
    echo "Project Test Status:"
    echo "  📁 Test files: $TEST_COUNT"
    echo "  📄 Source files: $SRC_COUNT"
    
    if [ $TEST_COUNT -gt 0 ]; then
      RATIO=$(echo "scale=2; $TEST_COUNT / $SRC_COUNT" | bc 2>/dev/null || echo "N/A")
      echo "  📊 Test ratio: $RATIO tests per source file"
    fi
    
    # Run tests if available
    if grep -q '"test"' package.json 2>/dev/null; then
      echo ""
      echo "Running tests..."
      npm test 2>&1 | tail -10
    else
      echo ""
      echo "⚠️  No test script configured in package.json"
      echo "Add: \"test\": \"jest\" or your test runner"
    fi
    
    # Check coverage if available
    if [ -d "coverage" ]; then
      echo ""
      echo "Coverage Report:"
      if [ -f "coverage/coverage-summary.json" ]; then
        grep -o '"pct":[0-9.]*' coverage/coverage-summary.json | while read -r line; do
          echo "  • Coverage: ${line#*:}%"
        done | head -4
      else
        echo "  Run tests with coverage: npm test -- --coverage"
      fi
    fi
    ;;
    
  "tips"|"best-practices")
    echo "💡 TDD Best Practices"
    echo "====================="
    echo ""
    echo "RED Phase:"
    echo "  • Write the test first, before any implementation"
    echo "  • Test one thing at a time"
    echo "  • Use descriptive test names"
    echo "  • Follow Arrange-Act-Assert pattern"
    echo ""
    echo "GREEN Phase:"
    echo "  • Write minimum code to pass"
    echo "  • Don't overthink the solution"
    echo "  • Hard-coding is acceptable initially"
    echo "  • Focus only on making the test pass"
    echo ""
    echo "REFACTOR Phase:"
    echo "  • Clean up duplication"
    echo "  • Improve variable/function names"
    echo "  • Extract helper functions"
    echo "  • Apply SOLID principles"
    echo "  • Keep tests passing at all times"
    echo ""
    echo "General Tips:"
    echo "  • Commit after each phase"
    echo "  • Keep cycles small (< 10 minutes)"
    echo "  • Test behavior, not implementation"
    echo "  • Write tests for bugs before fixing them"
    echo "  • Maintain high test coverage (> 80%)"
    ;;
    
  "help"|"--help"|"-h")
    cat << 'EOF'
Test-Driven Development (TDD) Command

USAGE:
  /tdd [phase] [feature-name] [options]

PHASES:
  start, begin         Start RED phase - write failing test
  green, implement     Start GREEN phase - make test pass
  refactor, improve    Start REFACTOR phase - improve code
  cycle, next         Start next TDD cycle
  status, check       Check test status and coverage
  tips               Show TDD best practices

WORKFLOW:
  1. RED: Write a failing test
  2. GREEN: Write minimal code to pass
  3. REFACTOR: Improve code quality
  4. REPEAT: Start next cycle

EXAMPLES:
  /tdd start login          # Start TDD for login feature
  /tdd green login          # Implement login to pass test
  /tdd refactor login       # Refactor login implementation
  /tdd status              # Check test coverage
  /tdd tips                # Show best practices

BENEFITS:
- Better code design through test-first thinking
- Immediate feedback on code correctness
- Built-in regression test suite
- Improved code confidence
- Natural documentation through tests

Based on industry best practices and proven TDD methodology.
EOF
    ;;
    
  *)
    echo "❌ Unknown TDD phase: $COMMAND"
    echo "Valid phases: start, green, refactor, cycle, status, tips"
    echo "Use '/tdd help' for more information"
    exit 1
    ;;
esac

# Add contextual next steps
if [ "$COMMAND" != "help" ] && [ "$COMMAND" != "tips" ]; then
  echo ""
  echo "🔄 TDD Cycle Reminder:"
  echo -e "   ${RED}RED${NC} (write failing test) → ${GREEN}GREEN${NC} (make it pass) → ${YELLOW}REFACTOR${NC} (improve code)"
fi
```

## Features

### Complete TDD Workflow
- **Guided RED phase**: Templates for writing failing tests
- **Minimal GREEN phase**: Guidance for simplest passing code
- **Smart REFACTOR phase**: Checklist for improvements
- **Cycle management**: Easy progression through phases

### Framework Detection
- Automatically detects Jest, Mocha, Vitest
- Provides framework-specific test templates
- Adapts examples to your testing setup

### Quality Metrics
- Test file counting
- Test-to-source ratio calculation
- Coverage reporting integration
- Test execution status

### Best Practices Built-in
- Arrange-Act-Assert pattern
- One assertion per test guidance
- Small cycle recommendations
- Commit point reminders

## Why TDD with Claude?

As noted in best practices:
> "The robots LOVE TDD. Seriously. With TDD you have the robot friend build out the test, and the mock. Then your next prompt you build the mock to be real. It is the most effective counter to hallucination and LLM scope drift."

This command helps enforce disciplined TDD practice, reducing AI hallucination and improving code quality.

## Integration with Other Commands

Works seamlessly with:
- `/commit` - Commit after each phase
- `/hygiene` - Verify project health
- `/todo` - Track TDD tasks
- `/learn` - Capture TDD insights