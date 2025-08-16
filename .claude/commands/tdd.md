---
allowed-tools: [Bash]
description: Test-driven development workflow with red-green-refactor cycle
---

# TDD Command

Efficiently implement test-driven development practices.

## Usage

<bash>
#!/bin/bash

# Delegate to TDD workflow script
node scripts/tdd.js "$@"
</bash>

## Notes

Token-efficient command that delegates to `scripts/tdd.js` for:
- Start TDD sessions for features
- Guide through red-green-refactor cycle
- Run and watch tests
- Track testing statistics

For advanced TDD patterns, see `.claude/commands/detailed/tdd-detailed.md`.