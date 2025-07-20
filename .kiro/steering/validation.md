---
inclusion: always
---

# Validation-First Development

## Core Principle
**Never claim functionality without demonstrating it through testing.**

## Pre-Response Validation Checklist
Before every response that mentions code functionality:

1. **Did I test what I'm claiming works?**
   - Run the actual code/tests
   - Show exit codes and real output
   - Demonstrate behavior, don't describe it

2. **Am I showing actual results or just describing files?**
   - File contents ≠ working functionality
   - Code reading ≠ code execution
   - Assumptions ≠ validated behavior

3. **Am I making assumptions about functionality?**
   - Stop and test instead of inferring
   - Prove behavior through execution
   - Show evidence, not reasoning

4. **Do I have proof for my claims?**
   - Exit code 0 = success, non-zero = failure
   - Real output demonstrates actual behavior
   - Test results validate functionality

## Forbidden Phrases Without Testing
- "This is working"
- "Task completed"
- "Implementation is done"
- "The code should work"
- "This fixes the issue"
- "You're absolutely right"

## Required Phrases When Untested
- "I need to test this"
- "Let me verify this works"
- "I should run tests to confirm"
- "I'll demonstrate this functionality"

## Testing Requirements
- **Always run `npm test` before claiming code works**
- **Always show exit codes for validation**
- **Always demonstrate functionality with real execution**
- **Never assume code behavior from reading files**

## Violation Recovery
If you catch yourself making claims without testing:
1. Stop immediately
2. Acknowledge the violation
3. Run appropriate tests
4. Show actual results
5. Only then continue with validated claims