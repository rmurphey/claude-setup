# Recovery System Removal - Design

## Overview
Systematic removal of all recovery system components from the codebase while preserving all working functionality and maintaining clean architecture.

## Removal Strategy

### Phase 1: Core Infrastructure Removal
Remove the fundamental recovery system components that other parts depend on.

### Phase 2: CLI Interface Cleanup  
Clean command line interface, help text, and user-facing documentation.

### Phase 3: Test and Documentation Cleanup
Remove recovery-related tests and update all documentation.

### Phase 4: Final Validation
Ensure complete removal and validate all remaining functionality.

## Component Analysis

### 1. CLI Interface Components

#### Files Affected:
- `src/cli/main.ts` (primary CLI logic)
- `src/lib/cli/setup.ts` (setup orchestrator)

#### Changes Required:

**`src/cli/main.ts`:**
```typescript
// REMOVE: Recovery mode from PrimaryMode type
- type PrimaryMode = 'setup' | 'recovery' | 'language-detection' | ...
+ type PrimaryMode = 'setup' | 'language-detection' | ...

// REMOVE: Recovery flags from supportedFlags
- '--fix', '--dry-run', '--auto-fix'

// REMOVE: Recovery flag parsing logic
- Lines 102-109: fix, dryRun, autoFix flag parsing

// REMOVE: Recovery mode routing
- Lines 297: if (flags.fix) return 'recovery'
- Lines 180-182: case 'recovery': await this.handleRecoveryMode(flags)

// REMOVE: Recovery help text
- Lines 326-327, 342-343, 350: Recovery flag and mode descriptions

// REMOVE: handleRecoveryMode method entirely
- Lines 375-386: Complete method removal
```

**`src/lib/cli/setup.ts`:**
```typescript
// REMOVE: runRecoveryMode method entirely
- Lines 105-109: Complete method removal

// REMOVE: Recovery commands from template generation
- Lines 339-340: 'recovery-assess', 'recovery-plan', 'recovery-execute'
```

### 2. Type System Cleanup

#### Files Affected:
- `src/types/errors.ts`
- `src/types/archival.ts`
- `src/cli/main.ts`

#### Changes Required:

**`src/types/errors.ts`:**
```typescript
// REMOVE: RecoveryError class entirely
- Lines 222-267: Complete class definition

// REMOVE: Recovery error codes
- Lines 444-446: RECOVERY_FAILED, TEMPLATE_NOT_FOUND, BACKUP_FAILED
```

**`src/types/archival.ts`:**
```typescript
// REMOVE: recoveryAction properties
- Line 70: recoveryAction: string property
- Line 89: recoveryAction parameter in constructor
```

**`src/cli/main.ts`:**
```typescript
// UPDATE: CLIFlags interface
interface CLIFlags {
  help: boolean;
  version: boolean;
- fix: boolean;            // REMOVE
- dryRun: boolean;         // REMOVE  
- autoFix: boolean;        // REMOVE
  detectLanguage: boolean;
  // ... keep others
}
```

### 3. Configuration System Cleanup

#### Files Affected:
- `package.json`
- `src/lib/configuration-manager.ts`

#### Changes Required:

**`package.json`:**
```json
{
  "scripts": {
    // REMOVE: Recovery-related scripts
-   "fix": "node bin/cli.js --fix",
-   "fix:dry-run": "node bin/cli.js --fix --dry-run",
    // ... keep others
  }
}
```

**`src/lib/configuration-manager.ts`:**
```typescript
// REMOVE: Recovery-related comments and logic
- Line 19: "Handle configuration file errors with recovery" comment
```

### 4. Documentation Cleanup

#### Files Affected:
- `README.md`
- `docs/ARCHITECTURE.md`
- `docs/VALUE_PROPOSITION.md`
- `docs/NPX_BEHAVIOR.md`

#### Changes Required:

**`README.md`:**
```markdown
<!-- REMOVE: Recovery mode descriptions -->
- "🏥 Assess and recover existing codebase" mode
- "🔧 One-command recovery" descriptions
- "Recovery Mode" section
- All `--fix` examples and references
- Recovery commands: /recovery-assess, /recovery-plan, /recovery-execute

<!-- UPDATE: Mode list to exclude recovery -->
Choose from 2 main modes plus utilities:
- **🚀 Set up new project infrastructure**
- **📦 Generate GitHub Codespaces DevContainer only**
```

**Documentation Strategy:**
- Remove all recovery value propositions
- Update architecture diagrams to remove recovery components  
- Clean help text examples
- Update feature lists to be accurate

### 5. Test Suite Cleanup

#### Files Affected:
- `__tests__/integration.test.js`
- `__tests__/cli-main.test.js`
- `__tests__/setup-orchestrator.test.js`
- `__tests__/archival-types.test.js`

#### Changes Required:

**Test Removal Strategy:**
```javascript
// REMOVE: Recovery flag tests
- Tests for --fix flag parsing and validation
- Tests for flag combination validation with --fix
- Recovery mode routing tests

// REMOVE: Recovery integration tests  
- Lines 203-240: CLI --fix empty directory test

// REMOVE: Recovery method tests
- Tests checking for runRecoveryMode method existence

// UPDATE: Error type tests
- Remove recoveryAction property tests from archival types
```

## Implementation Strategy

### 1. Dependency Order
Remove components in order of dependencies to avoid breaking intermediate states:

1. **Tests first** - Remove failing tests that expect recovery functionality
2. **CLI routing** - Remove recovery mode handling  
3. **Type definitions** - Remove recovery-specific types
4. **Documentation** - Update all user-facing content
5. **Configuration** - Clean up scripts and settings

### 2. Validation Strategy
After each phase, validate:
- TypeScript compilation succeeds
- ESLint passes without violations
- All remaining tests pass
- CLI help output is clean and accurate

### 3. Safe Removal Patterns

**For CLI flags:**
```typescript
// Before: Complex flag validation with recovery
if (flags.fix && flags.config) {
  throw new Error('Cannot use --fix with --config');
}

// After: Simplified validation without recovery
// (Remove entire validation block if only recovery-related)
```

**For error handling:**
```typescript
// Before: Recovery-specific error types
throw new RecoveryError('Recovery failed', { recoveryAction: 'restore' });

// After: Use standard error types
throw new ConfigurationError('Operation failed');
```

**For help text:**
```typescript
// Before: Recovery mode documentation
case 'recovery':
  console.log('Recovery mode: Assess and fix project issues');
  
// After: Remove entire case block
```

## Risk Mitigation

### 1. Functional Preservation
**Strategy**: Validate each major component removal with test suite
- Run tests after each file modification
- Ensure no working features are accidentally removed
- Validate CLI still handles all supported modes

### 2. Documentation Accuracy  
**Strategy**: Update documentation to reflect actual capabilities
- Remove all promises of unimplemented features
- Ensure help text matches actual CLI behavior
- Provide clear, honest feature descriptions

### 3. User Experience
**Strategy**: Clean, professional presentation without broken promises
- CLI help should be complete and accurate
- No confusing error messages about missing functionality
- Clear value proposition based on working features

## Validation Checklist

### Code Quality Validation:
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no new violations  
- [ ] All tests pass (296+ tests expected)
- [ ] No unused imports remain
- [ ] No dead code paths remain

### Functional Validation:
- [ ] Setup mode works correctly
- [ ] Language detection works correctly
- [ ] Configuration management works correctly
- [ ] DevContainer generation works correctly
- [ ] NPX execution works correctly

### Documentation Validation:
- [ ] README accurately describes available features
- [ ] CLI help text matches actual functionality
- [ ] No broken promises in documentation
- [ ] Architecture docs reflect actual codebase
- [ ] Value proposition based on working features

### User Experience Validation:
- [ ] Clear error messages for invalid commands
- [ ] Professional presentation without confusion
- [ ] Honest capability descriptions
- [ ] Smooth workflow for supported operations

## Expected Outcomes

### Code Reduction:
- **~40 files modified** to remove recovery references
- **~300-500 lines removed** from codebase
- **3 CLI flags removed**: `--fix`, `--dry-run`, `--auto-fix`
- **1 primary mode removed**: 'recovery'
- **1 error class removed**: `RecoveryError`

### User Experience Improvement:
- **Honest feature advertising** - no broken promises
- **Cleaner CLI interface** - fewer confusing options
- **Accurate documentation** - matches actual capabilities
- **Professional presentation** - focuses on working features

### Development Benefits:
- **Reduced maintenance overhead** - no recovery stub maintenance
- **Clearer codebase** - eliminates dead code paths
- **Faster development** - less complexity to navigate
- **Better testing** - no need to mock unimplemented features