# Design Document

## Overview

This design outlines the migration from manual CLI argument parsing to using the yargs library. The migration will replace approximately 200 lines of custom parsing logic with a more maintainable, feature-rich solution while preserving 100% backward compatibility.

## Architecture

### Current Architecture
```
CLIMain
├── Manual argument parsing (for-loop through argv)
├── Custom flag validation (Maps for conflicts/dependencies)  
├── Custom help/version handling
├── Manual flag value extraction
└── Custom error message formatting
```

### Target Architecture
```
CLIMain
├── Yargs-based argument parsing (declarative configuration)
├── Yargs built-in validation (choices, conflicts, implies)
├── Yargs built-in help/version (automatic exit)
├── Yargs built-in value extraction
└── Minimal custom validation for complex business rules
```

## Components and Interfaces

### 1. CLIMain Class (Refactored)

**Responsibilities:**
- Configure yargs with all CLI options
- Maintain existing public API (`runCLI`, optionally `parseArgs`)
- Apply custom validation logic for flag conflicts and dependencies
- Format error messages to match existing test expectations

**Key Changes:**
- Replace manual parsing with yargs configuration
- Simplify validation logic using yargs features where possible
- Maintain custom validation for complex business rules

### 2. Yargs Configuration

**Option Definitions:**
```typescript
yargs
  .scriptName('claude-setup')
  .usage('$0 [options]')
  .description('Interactive CLI to set up Claude Code projects with professional development standards')
  .option('detect-language', { type: 'boolean', description: 'Detect and display project language' })
  .option('config', { type: 'boolean', description: 'Manage configuration' })
  .option('show', { type: 'boolean', description: 'Show current configuration (requires --config)' })
  .option('reset', { type: 'boolean', description: 'Reset configuration (requires --config)' })
  .option('sync-issues', { type: 'boolean', description: 'Sync GitHub issues with ACTIVE_WORK.md' })
  .option('devcontainer', { type: 'boolean', description: 'Generate DevContainer configuration only' })
  .option('language', { 
    type: 'string', 
    description: 'Override language detection',
    choices: ['js', 'javascript', 'typescript', 'python', 'go', 'rust', 'java', 'swift']
  })
  .option('force', { type: 'boolean', description: 'Force operations (skip confirmations)' })
  .option('no-save', { type: 'boolean', description: "Don't save configuration" })
  .version('1.0.0')
  .help()
```

**Built-in Yargs Features Used:**
- `.help()` - Automatically handles -h/--help flags and exits process
- `.version('1.0.0')` - Automatically handles -v/--version flags and exits process  
- `.choices()` - Validates language option values automatically
- `.scriptName()` and `.usage()` - Provides proper help formatting
- `.description()` - Adds description to help output

**Custom Validation (if needed):**
```typescript
// Only implement custom validation for complex business rules
// that yargs built-in validation cannot handle
```

### 3. Error Message Compatibility Layer

**Purpose:** Ensure error messages match existing test expectations

**Implementation:**
- Catch yargs validation errors
- Transform them to match current error message format
- Preserve specific error text that tests expect

**Example Transformations:**
```typescript
// Yargs: "Missing required argument: config"
// Current: "Flag --show requires --config"
// Transform: Detect dependency errors and format consistently

// Yargs: "Arguments conflict: detect-language, config"  
// Current: "Cannot use --detect-language, --config, and --sync-issues together"
// Transform: Detect conflict errors and format consistently
```

## Data Models

### CLIFlags Interface (Updated)
```typescript
export interface CLIFlags {
  // help and version removed - yargs handles these automatically and exits process
  detectLanguage: boolean;
  config: boolean;
  show: boolean;
  reset: boolean;
  syncIssues: boolean;
  devcontainer: boolean;
  language?: string;
  force: boolean;
  noSave: boolean;
}
```

### PrimaryMode Type (Unchanged)
```typescript
export type PrimaryMode = 'setup' | 'language-detection' | 'configuration' | 'sync-issues' | 'devcontainer';
```

## Error Handling

### Error Categories and Responses

1. **Unknown Options**
   - Yargs handles detection
   - Custom formatter ensures message matches: `"error: unknown option '--unknown-flag'"`
   - Include help suggestion

2. **Missing Required Values**
   - Yargs handles detection for `--language`
   - Custom formatter ensures message matches: `"error: option '--language <lang>' argument missing"`
   - Include usage example

3. **Invalid Values**
   - Yargs choices validation for language
   - Custom formatter for invalid language: `"Invalid language: {value}. Supported: js, python, go, rust, java, swift"`

4. **Flag Conflicts**
   - Custom validation layer (yargs conflicts may not handle complex cases)
   - Preserve exact error messages: `"Cannot use --detect-language, --config, and --sync-issues together"`

5. **Missing Dependencies**
   - Custom validation layer
   - Preserve exact error messages: `"Flag --show requires --config"`

### Error Handling Flow
```
1. Yargs parses arguments
2. Yargs validates basic constraints (types, choices, conflicts)
3. Custom validation layer checks complex business rules
4. Error message formatter transforms errors to match test expectations
5. Error thrown with formatted message
```

## Testing Strategy

### Test Compatibility Approach
1. **No Test Modifications:** All existing tests must pass without changes
2. **Error Message Matching:** Implement error message transformation to match exact test expectations
3. **Behavior Preservation:** Ensure edge cases (duplicate flags, empty args, etc.) work identically

### Test Categories to Verify
1. **Basic Flag Parsing:** Short flags, long flags, boolean flags
2. **Value Extraction:** `--language=js` vs `--language js` syntax
3. **Validation Logic:** Conflicts, dependencies, invalid values
4. **Error Messages:** Exact text matching for all error scenarios
5. **Edge Cases:** Empty args, special characters, performance with many args

### Migration Testing Strategy
1. **Parallel Implementation:** Keep old code temporarily for comparison
2. **Test Suite Verification:** Run full test suite against new implementation
3. **Error Message Alignment:** Adjust error formatting until all tests pass
4. **Performance Testing:** Verify no regression in argument parsing speed

## Implementation Phases

### Phase 1: Setup and Basic Parsing
- Add yargs dependency
- Create basic yargs configuration
- Implement simple option parsing
- Ensure basic flags work (help, version, boolean flags)

### Phase 2: Value Handling and Validation
- Implement language option with choices validation
- Add custom validation layer for conflicts and dependencies
- Handle `--no-save` boolean negation

### Phase 3: Error Message Compatibility
- Implement error message transformation layer
- Ensure all error messages match test expectations
- Handle edge cases and special error scenarios

### Phase 4: Testing and Cleanup
- Run full test suite and fix any remaining issues
- Performance testing and optimization
- Remove old manual parsing code
- Update documentation

## Migration Risks and Mitigations

### Risk 1: Test Failures Due to Different Error Messages
**Mitigation:** Implement comprehensive error message transformation layer

### Risk 2: Subtle Behavior Changes in Edge Cases
**Mitigation:** Extensive testing of edge cases, parallel implementation for comparison

### Risk 3: Performance Regression
**Mitigation:** Performance testing, yargs is well-optimized and should be faster

### Risk 4: Breaking Changes in Public API
**Mitigation:** Maintain exact same public method signatures, only change internal implementation

## Benefits After Migration

1. **Reduced Code Complexity:** ~200 lines → ~50 lines
2. **Better Maintainability:** Standard library patterns instead of custom logic
3. **Enhanced Features:** Better help formatting, automatic validation
4. **Improved Reliability:** Well-tested library instead of custom parsing
5. **Future Extensibility:** Easy to add new options and validation rules