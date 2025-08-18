# Real-World Command Workflows

## Feature Development Flow

A complete example of developing a new feature using TDD and quality checks:

```bash
# 1. Check project health
/hygiene
# Output: ✅ All checks passing

# 2. Start with TDD
/tdd start "new feature"
# Creates test file and guides through red-green-refactor

# 3. Track your work
/todo add "Write failing tests"
/todo add "Implement feature"
/todo add "Refactor and optimize"

# 4. Capture learnings
/learn "TDD helps clarify requirements before coding"

# 5. Make quality-checked commits
/commit feat "add new feature with tests"
# Runs: lint, tests before committing

# 6. Push when ready
/push
# Validates and pushes to remote
```

## Daily Development Flow

Your typical daily workflow with Claude Code:

```bash
# Morning: Check status and priorities
/next
# Output: Recommends highest priority task

/todo list
# Shows current task list

# During work: Atomic commits
/commit
# Enforces small, focused commits (1-3 files)

# Capture insights
/learn "Using middleware for auth is cleaner than decorators"

# End of day: Reflect
/reflect
# Captures session learnings
```

## Quick Status Check

```bash
/hygiene && /todo list && /next
# Full status check → task list → recommendations
```

## Bug Fix Workflow

```bash
# 1. Reproduce and understand
/todo add "Reproduce bug in test"
/tdd start "bug fix"

# 2. Fix with verification
# Make fix...
/hygiene  # Ensure no regressions

# 3. Document
/learn "Bug was caused by race condition in async handler"
/commit fix "resolve race condition in user handler"
```

## Refactoring Workflow

```bash
# 1. Ensure tests pass first
/hygiene

# 2. Plan refactoring
/todo add "Extract validation logic"
/todo add "Create validator module"
/todo add "Update tests"

# 3. Refactor incrementally
# Make changes...
/hygiene  # Check after each step

# 4. Commit atomically
/commit refactor "extract validation to dedicated module"
```

## Documentation Update

```bash
# 1. Analyze current docs
/docs

# 2. Make updates
# Edit documentation...

# 3. Verify and commit
/commit docs "update API documentation"
```

## Release Preparation

```bash
# 1. Full quality check
/hygiene

# 2. Review changes
/reflect  # Summarize what's changed

# 3. Update docs if needed
/docs

# 4. Final push
/push
```

## Tips for Efficient Workflows

### Chaining Commands
Commands can be chained for efficiency:
```bash
/hygiene && /todo list && /next
```

### Regular Health Checks
Run `/hygiene` before and after major changes to catch issues early.

### Atomic Commits
Use `/commit` frequently for small, focused commits rather than large batches.

### Continuous Learning
Use `/learn` throughout the day to build your project knowledge base.