# Design Document

## Overview

The code quality hook will be implemented as a git pre-commit hook that validates JavaScript/TypeScript files before they are committed. This approach is vendor-agnostic and works across all development environments. The hook will perform code quality validation focusing on formatting consistency, ES module syntax correctness, and common export/import mistakes, providing fast feedback during the commit process.

## Architecture

### Hook Trigger System
- **Event**: Git pre-commit operations on staged `.js`, `.ts`, `.jsx`, `.tsx` files
- **Execution Mode**: Synchronous validation before commit completion
- **Scope**: Staged files only (git diff --cached --name-only)
- **Timeout**: 5-second maximum execution time with option to bypass
- **Fallback**: Allow commit with warnings if validation fails

### Validation Pipeline
```
Git Commit → Pre-commit Hook → Get Staged Files → Quality Level Check → Validation Rules → Report Generation → Commit Decision
```

### Integration Points
- **ESLint Integration**: Respect existing `.eslintrc` configurations
- **Project Configuration**: Read quality level from `package.json` or `.git-quality-config.json`
- **Output Format**: ESLint-compatible error/warning format for consistency
- **Git Integration**: Use git plumbing commands to access staged file content

## Components and Interfaces

### Core Components

#### 1. Pre-commit Hook Script (`.git/hooks/pre-commit`)
```bash
#!/bin/sh
# Git pre-commit hook for code quality validation
node .git/hooks/code-quality-validator.js
exit $?
```

#### 2. Main Validator (`code-quality-validator.js`)
```javascript
export class CodeQualityValidator {
  constructor(config) {
    this.qualityLevel = config.qualityLevel || 'standard';
    this.validators = new ValidatorRegistry();
  }
  
  async validateStagedFiles() {
    // Main validation entry point for git hook
    const stagedFiles = await this.getStagedJSFiles();
    const results = await this.validateFiles(stagedFiles);
    return this.handleResults(results);
  }
  
  async getStagedJSFiles() {
    // Use git diff --cached --name-only to get staged files
  }
}
```

#### 2. Validator Registry (`validator-registry.js`)
```javascript
export class ValidatorRegistry {
  constructor() {
    this.validators = new Map();
    this.registerDefaultValidators();
  }
  
  register(name, validator) {
    // Register validation rules
  }
  
  validate(content, filePath, qualityLevel) {
    // Execute applicable validators
  }
}
```

#### 3. Individual Validators

**Formatting Validator (`validators/formatting.js`)**
- Indentation consistency (spaces vs tabs)
- Semicolon placement
- Quote consistency (single vs double)
- Line ending consistency

**Export/Import Validator (`validators/modules.js`)**
- ES module syntax validation
- Default vs named export consistency
- Import statement structure
- Circular dependency detection

**Syntax Validator (`validators/syntax.js`)**
- Basic JavaScript/TypeScript syntax checking
- Common mistake patterns
- Variable declaration consistency

#### 4. Quality Level Manager (`quality-levels.js`)
```javascript
export const QualityLevels = {
  strict: {
    enforceAllRules: true,
    allowExceptions: false,
    autoFix: true
  },
  standard: {
    enforceAllRules: true,
    allowMinorVariations: true,
    autoFix: false
  },
  relaxed: {
    enforceCriticalOnly: true,
    allowVariations: true,
    autoFix: false
  }
};
```

#### 5. Report Generator (`report-generator.js`)
```javascript
export class ReportGenerator {
  generateReport(violations, filePath) {
    // Format violations in ESLint-compatible format
    return {
      filePath,
      messages: violations.map(v => ({
        line: v.line,
        column: v.column,
        severity: v.severity,
        message: v.message,
        ruleId: v.ruleId,
        fix: v.suggestedFix
      }))
    };
  }
}
```

## Data Models

### Validation Result
```javascript
{
  filePath: string,
  isValid: boolean,
  violations: [
    {
      line: number,
      column: number,
      severity: 'error' | 'warning' | 'info',
      message: string,
      ruleId: string,
      suggestedFix?: string,
      autoFixable: boolean
    }
  ],
  executionTime: number,
  qualityLevel: string
}
```

### Hook Configuration
```javascript
{
  enabled: boolean,
  qualityLevel: 'strict' | 'standard' | 'relaxed',
  filePatterns: string[],
  excludePatterns: string[],
  maxExecutionTime: number,
  autoFix: boolean,
  integrations: {
    eslint: boolean,
    prettier: boolean
  }
}
```

### Validation Rule
```javascript
{
  id: string,
  name: string,
  description: string,
  severity: 'error' | 'warning' | 'info',
  qualityLevels: string[],
  validate: (content: string, filePath: string) => ValidationViolation[],
  autoFix?: (content: string, violation: ValidationViolation) => string
}
```

## Error Handling

### Validation Failures
- **Timeout Handling**: Graceful degradation after 5-second timeout with option to bypass
- **Parser Errors**: Catch and report syntax errors, allow commit with warnings
- **Rule Failures**: Individual rule failures don't stop other validations
- **Configuration Errors**: Fall back to default settings if config is invalid
- **Git Integration Errors**: Fallback to basic file reading if git commands fail

### User Experience
- **Commit Control**: Block commits only for critical errors, warn for others
- **Bypass Option**: Allow `git commit --no-verify` to skip validation
- **Progressive Enhancement**: Work with or without existing ESLint/Prettier
- **Clear Feedback**: Provide actionable error messages with line numbers

### AI Agent Protocol
When the pre-commit hook fails, any AI agent (Claude, GPT, etc.) should follow this standardized response protocol:

#### Hook Failure Response Format
```json
{
  "hookType": "pre-commit",
  "status": "failed",
  "exitCode": 1,
  "violations": [
    {
      "file": "src/example.js",
      "line": 15,
      "column": 23,
      "severity": "error",
      "rule": "missing-semicolon",
      "message": "Missing semicolon after function declaration",
      "suggestedFix": "Add semicolon at end of line 15"
    }
  ],
  "summary": {
    "totalFiles": 3,
    "filesWithErrors": 1,
    "totalViolations": 1,
    "criticalErrors": 1,
    "warnings": 0
  }
}
```

#### Required AI Agent Actions
1. **Parse Hook Output**: Extract structured violation data from hook output
2. **Categorize Issues**: Distinguish between blocking errors and warnings
3. **Provide Fixes**: Offer specific code corrections for each violation
4. **Explain Context**: Help user understand why each rule exists
5. **Suggest Workflow**: Guide user on next steps (fix vs bypass)

#### AI Agent Response Template
```
🚫 Pre-commit hook failed with [X] violations in [Y] files.

**Critical Issues (blocking commit):**
- [file:line] [rule]: [description]
  Fix: [specific correction]

**Warnings (commit allowed):**
- [file:line] [rule]: [description]
  Suggestion: [improvement]

**Next Steps:**
1. Apply suggested fixes above
2. Run `git add` for fixed files
3. Retry commit, or use `git commit --no-verify` to bypass

**Why these rules matter:**
[Brief explanation of rule importance]
```

#### Integration Requirements
- **Exit Code Handling**: AI agents must check hook exit codes (0=success, 1=failure)
- **Output Parsing**: Parse both JSON and human-readable hook output formats
- **Context Preservation**: Maintain conversation context about previous violations
- **Learning Integration**: Use hook failures as learning opportunities for code quality

## Testing Strategy

### Unit Tests
- Individual validator logic testing
- Quality level configuration testing
- Report generation format validation
- Error handling scenarios

### Integration Tests
- Hook registration and triggering
- ESLint configuration integration
- File system interaction testing
- Performance benchmarking (sub-2-second execution)

### End-to-End Tests
- Complete workflow from file save to user feedback
- Multiple file type handling
- Configuration change scenarios
- Auto-fix functionality testing

### Performance Tests
- Large file handling (>1000 lines)
- Multiple simultaneous file saves
- Memory usage monitoring
- Execution time validation

## Implementation Phases

### Phase 1: Core Infrastructure
- Hook registration system
- Basic validator framework
- Configuration management
- Simple formatting rules

### Phase 2: Advanced Validation
- Export/import validation
- ESLint integration
- Quality level implementation
- Report generation

### Phase 3: User Experience
- Auto-fix capabilities
- Performance optimization
- Error handling refinement
- Documentation and examples