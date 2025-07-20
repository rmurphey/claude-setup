# Project Cleanup Design Document

## Overview

This design outlines the cleanup of the project structure after TypeScript migration. The cleanup will remove redundant JavaScript files, consolidate build outputs, and establish a clear separation between source code and build artifacts while maintaining all functionality.

## Architecture

### Directory Structure (Current vs Target)

**Current Structure (Problematic):**
```
├── src/                    # TypeScript source files
├── lib/                    # Old compiled JavaScript (REDUNDANT)
├── dist/                   # New compiled output
├── dist-test/              # Test compilation artifacts (TEMPORARY)
├── __tests__/              # Test files (mixed .js/.ts)
└── Various .js files       # Scattered JavaScript files
```

**Target Structure (Clean):**
```
├── src/                    # TypeScript source files (KEEP)
├── lib/                    # Compiled JavaScript output (RENAME from dist/)
├── __tests__/              # Test files (KEEP)
├── bin/                    # CLI entry points (KEEP)
├── templates/              # User templates (KEEP)
└── Root config files       # Essential configuration (KEEP)
```

### Build Output Strategy

The project will use a single, consistent build output approach:
- **Source**: TypeScript files in `src/`
- **Output**: Compiled JavaScript in `lib/` (matching NPM convention)
- **Distribution**: NPM package ships compiled JavaScript from `lib/`
- **Tests**: Run against compiled output for integration testing

## Components and Interfaces

### Files to Remove

#### Redundant Compiled JavaScript
- `lib/` directory (old compiled output)
- `dist-test/` directory (temporary test artifacts)
- Scattered `.js` files that have TypeScript equivalents

#### Temporary Build Artifacts
- `tsconfig.tsbuildinfo` (will be regenerated)
- Coverage artifacts in non-standard locations
- Test compilation outputs

### Files to Keep

#### Essential Source Files
- All files in `src/` (TypeScript source)
- All files in `__tests__/` (test files)
- `bin/cli.js` (CLI entry point)
- Root configuration files

#### Build Configuration
- `tsconfig.json` (TypeScript configuration)
- `package.json` (NPM configuration)
- `eslint.config.js` (Linting configuration)

### Build Process Updates

#### TypeScript Compilation Target
```json
{
  "compilerOptions": {
    "outDir": "./lib",
    "rootDir": "./src"
  }
}
```

#### Package.json Updates
```json
{
  "main": "./lib/index.js",
  "files": [
    "bin/",
    "lib/",
    "templates/",
    "docs/"
  ],
  "scripts": {
    "build": "tsc",
    "clean": "rm -rf lib/",
    "prebuild": "npm run clean"
  }
}
```

## Data Models

### Cleanup Operations

#### File Removal Strategy
```typescript
interface CleanupOperation {
  type: 'remove' | 'keep' | 'move';
  path: string;
  reason: string;
  safety: 'safe' | 'verify' | 'dangerous';
}

interface CleanupPlan {
  operations: CleanupOperation[];
  backupRequired: boolean;
  testValidation: string[];
}
```

#### Safety Classifications
- **Safe**: Files that can be safely removed (redundant compiled output)
- **Verify**: Files that should be checked before removal (potential source files)
- **Dangerous**: Files that should never be removed (source code, configuration)

## Error Handling

### Validation Steps

#### Pre-Cleanup Validation
1. Verify all TypeScript source files exist in `src/`
2. Confirm build process works before cleanup
3. Run full test suite to establish baseline
4. Create backup of current state

#### Post-Cleanup Validation
1. Verify TypeScript compilation succeeds
2. Confirm all tests pass
3. Validate CLI functionality
4. Check NPM package structure

### Rollback Strategy

#### Backup Creation
- Git commit before cleanup operations
- Selective file backup for critical operations
- Documentation of all changes made

#### Recovery Process
- Git reset for complete rollback
- Selective file restoration for partial issues
- Rebuild process verification

## Testing Strategy

### Validation Approach

#### Build Verification
1. Clean build from TypeScript source
2. Verify compiled output structure
3. Test CLI execution from compiled output
4. Validate NPM package contents

#### Functional Testing
1. Run complete test suite
2. Test CLI commands in various scenarios
3. Verify NPX installation and execution
4. Test development workflow (build, test, lint)

### Test Execution Plan

#### Pre-Cleanup Tests
```bash
npm test                    # Establish baseline
npm run build              # Verify build works
npm run lint               # Verify linting works
npx . --help              # Test CLI functionality
```

#### Post-Cleanup Tests
```bash
npm run clean             # Clean build artifacts
npm run build             # Build from TypeScript
npm test                  # Verify all tests pass
npm run lint              # Verify linting works
npx . --help              # Test CLI functionality
```

## Implementation Strategy

### Phase 1: Preparation and Validation
- Run comprehensive tests to establish baseline
- Create git commit for rollback point
- Verify TypeScript compilation works correctly
- Document current file structure

### Phase 2: Safe Removals
- Remove obviously redundant directories (`dist-test/`)
- Remove temporary build artifacts
- Remove duplicate compiled JavaScript files
- Verify build still works after each removal

### Phase 3: Build Configuration Updates
- Update `tsconfig.json` to output to `lib/`
- Update `package.json` files array and main entry
- Update any import paths that reference old locations
- Test build process with new configuration

### Phase 4: Final Validation and Testing
- Run complete test suite
- Test CLI functionality thoroughly
- Verify NPM package structure
- Test NPX installation and execution

### Phase 5: Documentation and Cleanup
- Update documentation to reflect new structure
- Remove any references to old file locations
- Clean up any remaining temporary files
- Verify git status is clean

## Risk Mitigation

### Critical File Protection
- Never remove files from `src/` directory
- Preserve all configuration files
- Maintain backup of CLI entry points
- Keep all test files intact

### Incremental Approach
- Remove files in small batches
- Test after each batch of removals
- Maintain ability to rollback at each step
- Verify functionality before proceeding

### Validation Gates
- Build must succeed before proceeding
- Tests must pass before proceeding
- CLI must function before proceeding
- NPM package must be valid before completion

This design ensures a safe, systematic cleanup of the project structure while maintaining all functionality and providing multiple safety nets for rollback if issues arise.