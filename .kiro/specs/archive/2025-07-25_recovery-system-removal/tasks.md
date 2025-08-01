# Recovery System Removal - Implementation Tasks

## Phase 1: Core Infrastructure Removal (Day 1 - Morning)

### Task 1.1: CLI Flag and Routing Removal
**Estimated effort**: 2 hours
**Priority**: Critical

- [x] **Remove recovery flags from CLIFlags interface** (`src/cli/main.ts`)
  - Remove `fix: boolean`
  - Remove `dryRun: boolean` 
  - Remove `autoFix: boolean`
- [x] **Remove recovery flags from supportedFlags set**
  - Remove `'--fix'`, `'--dry-run'`, `'--auto-fix'`
- [x] **Remove recovery flag parsing logic**
  - Lines 102-109: Remove fix, dryRun, autoFix flag parsing
- [x] **Remove recovery from PrimaryMode type**
  - Change `'setup' | 'recovery' | ...` to `'setup' | ...`
- [x] **Remove recovery mode routing**
  - Line 297: Remove `if (flags.fix) return 'recovery'`
  - Lines 180-182: Remove recovery case from switch statement
- [x] **Remove handleRecoveryMode method entirely**
  - Lines 375-386: Complete method removal

**Deliverables**:
- Updated `src/cli/main.ts` without recovery functionality
- CLI compiles and runs without recovery options

### Task 1.2: Type System Cleanup
**Estimated effort**: 1 hour
**Priority**: Critical

- [x] **Remove RecoveryError class** (`src/types/errors.ts`)
  - Lines 222-267: Complete class definition removal
- [x] **Remove recovery error codes**
  - Lines 444-446: Remove `RECOVERY_FAILED`, `TEMPLATE_NOT_FOUND`, `BACKUP_FAILED`
- [x] **Remove recovery properties from archival types** (`src/types/archival.ts`)
  - Line 70: Remove `recoveryAction: string` property
  - Line 89: Remove `recoveryAction` parameter from constructor
- [x] **Clean up any recovery-related imports**
  - Check for unused imports after type removal

**Deliverables**:
- Clean type definitions without recovery types
- TypeScript compilation succeeds

### Task 1.3: Setup Orchestrator Cleanup
**Estimated effort**: 30 minutes
**Priority**: High

- [x] **Remove runRecoveryMode method** (`src/lib/cli/setup.ts`)
  - Lines 105-109: Complete method removal
- [x] **Remove recovery commands from template generation**
  - Lines 339-340: Remove `'recovery-assess'`, `'recovery-plan'`, `'recovery-execute'`
- [x] **Clean up any recovery-related comments or logic**
  - Remove recovery references in configuration manager

**Deliverables**:
- Clean setup orchestrator without recovery functionality
- Template generation excludes recovery commands

## Phase 2: Test Suite Cleanup (Day 1 - Afternoon)

### Task 2.1: Remove Recovery-Specific Tests
**Estimated effort**: 2 hours
**Priority**: High

- [x] **Remove recovery integration tests** (`__tests__/integration.test.js`)
  - Lines 203-240: Remove `CLI --fix should handle empty directory` test
- [x] **Remove recovery flag parsing tests** (`__tests__/cli-main.test.js`)
  - Remove tests for `--fix` flag parsing and validation
  - Remove `determinePrimaryMode` tests for recovery mode
  - Remove flag combination tests involving `--fix`
- [x] **Remove recovery method tests** (`__tests__/setup-orchestrator.test.js`)
  - Lines 21, 142: Remove tests checking for `runRecoveryMode` method
- [x] **Remove recovery properties from error tests** (`__tests__/archival-types.test.js`)
  - Remove tests for `recoveryAction` property in error constructors

**Deliverables**:
- Clean test suite without recovery-related assertions
- All remaining tests pass

### Task 2.2: Test Validation
**Estimated effort**: 1 hour
**Priority**: High

- [x] **Run full test suite and verify no failures**
  - Execute `npm test` and ensure all tests pass
  - Target: 290+ tests passing (reduced from 297)
- [x] **Validate test coverage is maintained**
  - Run `npm run test:coverage` 
  - Ensure no significant coverage drops in non-recovery code
- [x] **Check for orphaned test files or helpers**
  - Remove any test utilities only used for recovery testing

**Deliverables**:
- Full test suite passes
- Test coverage maintained for remaining functionality

## Phase 3: Documentation and Configuration Cleanup (Day 2 - Morning)

### Task 3.1: CLI Help and Documentation
**Estimated effort**: 2 hours
**Priority**: Medium

- [x] **Remove recovery help text** (`src/cli/main.ts`)
  - Lines 326-327: Remove `--fix`, `--dry-run`, `--auto-fix` help text
  - Lines 342-343: Remove `--fix` examples
  - Line 350: Remove "Recovery Mode" description
- [x] **Update README.md**
  - Remove "🏥 Assess and recover existing codebase" mode description
  - Remove "🔧 One-command recovery" with `--fix` description
  - Remove "Recovery Mode" section
  - Remove recovery commands: `/recovery-assess`, `/recovery-plan`, `/recovery-execute`
  - Update mode list to exclude recovery
- [x] **Clean package.json scripts**
  - Remove `"fix": "node bin/cli.js --fix"`
  - Remove `"fix:dry-run": "node bin/cli.js --fix --dry-run"`

**Deliverables**:
- Accurate CLI help output without recovery options
- README reflects actual tool capabilities
- Clean package.json without recovery scripts

### Task 3.2: Architecture and Value Proposition Documentation
**Estimated effort**: 1.5 hours
**Priority**: Medium

- [x] **Update docs/ARCHITECTURE.md**
  - Remove "Error Recovery" from architecture description
  - Remove "Recovery Instructions" from error handling
  - Remove `recovery-system.js` from file structure diagrams
- [x] **Update docs/VALUE_PROPOSITION.md**
  - Remove "Recovery" from key benefits
  - Remove recovery-related value propositions
  - Remove "Recovery/maintenance time savings" claims
  - Remove "Recovery-Capable" as differentiator
- [x] **Update docs/NPX_BEHAVIOR.md**
  - Remove "Recovery Mode" section
  - Remove `--fix` flag documentation
  - Remove "Error Recovery" section

**Deliverables**:
- Architecture documentation reflects actual system
- Value proposition based on working features only
- NPX documentation accurate for available modes

### Task 3.3: Internal Documentation Cleanup
**Estimated effort**: 1 hour
**Priority**: Low

- [x] **Clean internal documentation files**
  - Update `CLAUDE.md` to remove recovery system mentions
  - Clean `internal/` files of recovery references
  - Update development guidelines to remove recovery constraints
- [x] **Remove recovery from configuration comments**
  - Clean `src/lib/configuration-manager.ts` of recovery references

**Deliverables**:
- Internal documentation aligned with actual codebase
- Development guidelines accurate for current features

## Phase 4: Final Validation and Polish (Day 2 - Afternoon)

### Task 4.1: Comprehensive Validation
**Estimated effort**: 2 hours
**Priority**: Critical

- [x] **Full codebase search for recovery references**
  - Search for "recovery", "recover", "fix" across all files
  - Verify no recovery references remain in code or comments
- [x] **CLI functionality validation**
  - Test setup mode works correctly
  - Test language detection works correctly
  - Test configuration management works correctly
  - Test DevContainer generation works correctly
  - Test NPX execution works correctly
- [x] **Build and quality validation**
  - Run `npm run build` and ensure success
  - Run `npm run lint` and ensure no violations
  - Run `npm run type-check` and ensure no errors
  - Run `npm test` and ensure all tests pass

**Deliverables**:
- Zero recovery references in codebase
- All working functionality validated
- Clean build and quality checks

### Task 4.2: User Experience Testing
**Estimated effort**: 1 hour
**Priority**: Medium

- [x] **Test CLI help output**
  - Run `npx . --help` and verify clean, accurate output
  - Ensure no broken promises or missing features mentioned
- [x] **Test error scenarios**
  - Test invalid flags and ensure clean error messages
  - Verify no confusing recovery-related error messages
- [x] **Test normal workflows**
  - Run complete setup workflow to ensure nothing broken
  - Test different project types and configurations

**Deliverables**:
- Professional, accurate user experience
- Clean error messages without recovery confusion
- Validated core workflows

### Task 4.3: Final Documentation Review
**Estimated effort**: 30 minutes
**Priority**: Low

- [x] **Review all user-facing documentation**
  - Ensure README accurately describes available features
  - Verify CLI help matches documentation
  - Check that value proposition is honest and accurate
- [x] **Update any version or change logs**
  - Document recovery system removal in appropriate files
  - Note simplified CLI interface

**Deliverables**:
- Consistent, accurate documentation across all files
- Clear communication about actual tool capabilities

## Risk Mitigation Tasks

### Continuous Validation
**Throughout all phases:**
- [x] Run `npm test` after each major change
- [x] Check TypeScript compilation after type changes
- [x] Validate CLI still launches after interface changes
- [x] Ensure no working features accidentally removed

### Rollback Plan
**If issues arise:**
- [x] Git commits for each phase to enable selective rollback
- [x] Backup of working test suite for comparison
- [x] Documentation of exact changes for quick reversal

## Success Metrics

### Code Quality Metrics:
- [x] **Zero recovery references**: No files contain recovery-related code
- [x] **Clean compilation**: TypeScript compiles without errors
- [x] **Lint compliance**: ESLint passes with no violations
- [x] **Test coverage**: All remaining tests pass (295 actual)

### User Experience Metrics:
- [x] **Accurate help**: CLI help contains no false promises
- [x] **Professional presentation**: Documentation reflects actual capabilities
- [x] **Clean interface**: Simplified command options without confusion
- [x] **Working features**: All advertised functionality operates correctly

### Development Metrics:
- [x] **Reduced complexity**: Fewer CLI flags and modes to maintain
- [x] **Cleaner codebase**: No dead code paths or unused types
- [x] **Faster iteration**: Less recovery-related overhead in development
- [x] **Clear testing**: No mocking of unimplemented features required

## Estimated Timeline
- **Day 1 Morning** (3 hours): Core infrastructure removal
- **Day 1 Afternoon** (3 hours): Test suite cleanup
- **Day 2 Morning** (4.5 hours): Documentation cleanup
- **Day 2 Afternoon** (2.5 hours): Final validation

**Total Effort**: 13 hours (1.5 days)

## Dependencies
- Access to full codebase for comprehensive search and modification
- Ability to run test suite for validation
- TypeScript and ESLint tooling for quality checks
- Git for version control and rollback capability