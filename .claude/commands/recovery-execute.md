---
allowed-tools: [Bash, Edit, Write, MultiEdit]
description: Execute automated recovery improvements safely
---

# Codebase Recovery Execution

## Context
- Recovery plan: @internal/RECOVERY_PLAN.md
- Current git status: !`git status --porcelain`
- Backup branch: !`git branch | grep recovery-backup || echo "No backup branch"`
- Lint status: !`npm run lint 2>/dev/null || echo "Linting needs setup"`
- Test status: !`npm test 2>/dev/null || echo "Testing needs setup"`

## Your task
Execute automated recovery improvements safely with full rollback capability:

### Pre-execution Safety Checks
1. **Git Status**: Ensure clean working tree or create backup
2. **Backup Creation**: Create `recovery-backup-{timestamp}` branch
3. **Current Assessment**: Capture baseline metrics
4. **Risk Validation**: Confirm low-risk actions only

### Automated Improvements to Execute

#### Phase 1: Infrastructure Setup (Always Safe)
- **Linting Setup**: Install and configure appropriate linters
- **Formatting**: Apply consistent code formatting
- **Git Hooks**: Install pre-commit quality checks
- **CI/CD**: Set up basic quality pipelines
- **Documentation**: Generate missing doc templates

#### Phase 2: Code Quality (Low Risk)
- **Import Organization**: Sort and clean imports
- **Dead Code Removal**: Remove unused variables/imports
- **Consistent Naming**: Fix obvious naming inconsistencies
- **Comment Improvements**: Add missing function/class docs
- **Error Handling**: Add basic try-catch where missing

#### Phase 3: Test Infrastructure (Medium Risk)
- **Test Framework**: Install appropriate testing tools
- **Test Templates**: Create test file templates
- **Coverage Setup**: Configure coverage reporting
- **Basic Tests**: Generate skeleton tests for untested functions

### Execution Process
1. **Safety Backup**:
   ```bash
   git checkout -b recovery-backup-$(date +%Y%m%d_%H%M%S)
   git checkout main  # or original branch
   ```

2. **Execute in Order**:
   - Run each improvement individually
   - Validate after each change
   - Commit incrementally with descriptive messages
   - Test that nothing breaks

3. **Validation Checks**:
   - All tests still pass (if any existed)
   - Project still builds/runs
   - No new linting errors introduced
   - Core functionality unaffected

4. **Progress Tracking**:
   - Update RECOVERY_PLAN.md with completed items
   - Document any issues encountered
   - Record metrics improvements

### Safety Protocols

#### Before Each Change
- Save current state
- Run existing tests
- Document current behavior

#### After Each Change  
- Run automated tests
- Check basic functionality
- Validate no regressions
- Commit with clear message

#### Rollback Triggers
- Any tests that previously passed now fail
- Application/build no longer works
- Critical functionality affected
- Team requests halt

### Execution Options
Prompt user for execution scope:
- **Full Auto**: Execute all safe improvements
- **Phase-by-Phase**: Execute one phase at a time with approval
- **Individual**: Execute specific improvements only
- **Dry Run**: Show what would be done without executing

## Output Format
```
🔧 RECOVERY EXECUTION STARTING

🛡️  SAFETY MEASURES:
✅ Backup branch created: recovery-backup-{timestamp}
✅ Clean working tree confirmed
✅ Baseline metrics captured

🚀 EXECUTING IMPROVEMENTS:

Phase 1: Infrastructure Setup
✅ Linting configured (ESLint/Ruff/Clippy)
✅ Code formatting applied  
✅ Pre-commit hooks installed
✅ CI/CD pipeline updated
📊 Improvement: Lint warnings 45 → 12

Phase 2: Code Quality  
✅ Imports organized
✅ Dead code removed (15 unused variables)
✅ Function documentation added (23 functions)
⚠️  Skipped: Complex refactoring (requires manual review)
📊 Improvement: Code complexity score 3.2 → 2.8

Phase 3: Test Infrastructure
✅ Jest/Pytest framework installed
✅ Test templates created
✅ Coverage reporting configured
📊 Improvement: Test coverage 0% → 15% (skeleton tests)

🎯 EXECUTION COMPLETE

📊 METRICS IMPROVEMENT:
• Code Quality: 45 → 72 (+27)
• Test Coverage: 0% → 15% (+15%)
• Lint Warnings: 45 → 12 (-33)
• Build Time: 45s → 32s (-13s)

✅ {X} improvements completed successfully
⚠️  {Y} improvements require manual attention
🔄 {Z} improvements deferred to later phases

📋 NEXT STEPS:
1. Review changes and test thoroughly
2. Address manual improvements from RECOVERY_PLAN.md
3. Run `/recovery-assess` to measure progress
4. Continue with next phase when ready

🛟 ROLLBACK: Use `git checkout recovery-backup-{timestamp}` if issues
```

**Safety First**: All changes are incremental, tested, and reversible. Stop execution immediately if any issues arise.