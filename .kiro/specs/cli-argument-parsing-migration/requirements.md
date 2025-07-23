# Requirements Document

## Introduction

The current CLI argument parsing system in `src/cli/main.ts` uses manual parsing with approximately 200 lines of custom code to handle command-line arguments. This creates maintenance overhead, potential bugs, and reinvents functionality that mature libraries provide. This feature will migrate the CLI argument parsing to use a well-established library (yargs) while maintaining 100% backward compatibility with existing behavior and test expectations.

## Requirements

### Requirement 1: Maintain Complete Backward Compatibility

**User Story:** As a user of the claude-setup CLI, I want all existing commands and flags to work exactly the same way after the migration, so that my scripts and workflows are not disrupted.

#### Acceptance Criteria

1. WHEN I run any existing CLI command THEN the behavior SHALL be identical to the current implementation
2. WHEN I use short flags like `-h` or `-v` THEN they SHALL work exactly as before
3. WHEN I use long flags like `--help` or `--version` THEN they SHALL work exactly as before
4. WHEN I use the `--language` flag with equals syntax `--language=js` THEN it SHALL work as before
5. WHEN I use the `--language` flag with space syntax `--language js` THEN it SHALL work as before
6. WHEN I use the `--no-save` flag THEN it SHALL properly negate the save option as before

### Requirement 2: Preserve All Validation Logic with Descriptive Errors

**User Story:** As a developer maintaining the CLI, I want all existing validation rules to be preserved exactly with clear, actionable error messages, so that invalid flag combinations and missing dependencies are caught the same way and users understand how to fix their commands.

#### Acceptance Criteria

1. WHEN I use conflicting flags like `--detect-language` and `--config` THEN the system SHALL throw a descriptive error message explaining which flags conflict and why
2. WHEN I use `--show` without `--config` THEN the system SHALL throw an error clearly stating the dependency requirement and how to fix it
3. WHEN I use `--reset` without `--config` THEN the system SHALL throw an error clearly stating the dependency requirement and how to fix it
4. WHEN I use `--show` and `--reset` together THEN the system SHALL throw an error explaining the conflict and suggesting alternatives
5. WHEN I provide an invalid language value THEN the system SHALL throw an error with the invalid value, supported languages list, and usage example
6. WHEN I provide an unknown flag THEN the system SHALL throw an error identifying the unknown flag and suggesting `--help` for available options
7. WHEN I provide a flag that requires a value without providing one THEN the system SHALL throw an error explaining what value is expected with an example

### Requirement 3: Maintain Test Compatibility

**User Story:** As a developer working on the CLI, I want all existing tests to pass without modification, so that I can be confident the migration doesn't break existing functionality.

#### Acceptance Criteria

1. WHEN I run the existing test suite THEN all 295 tests SHALL pass without modification
2. WHEN tests expect specific error messages THEN the new implementation SHALL produce identical error messages
3. WHEN tests expect specific flag parsing behavior THEN the new implementation SHALL match exactly
4. WHEN tests check for method existence like `parseArgs()` and `runCLI()` THEN these methods SHALL remain available with the same signatures

### Requirement 4: Reduce Code Complexity

**User Story:** As a developer maintaining the CLI code, I want the argument parsing logic to be simpler and more maintainable, so that future changes are easier to implement.

#### Acceptance Criteria

1. WHEN the migration is complete THEN the argument parsing code SHALL be reduced from ~200 lines to ~50 lines
2. WHEN adding new CLI options in the future THEN it SHALL require minimal code changes
3. WHEN debugging CLI issues THEN the code SHALL be easier to understand and trace
4. WHEN reviewing the code THEN it SHALL use established patterns from the yargs library

### Requirement 5: Preserve Essential Public API

**User Story:** As a developer using the CLIMain class, I want the essential public interface to remain unchanged, so that any code depending on it continues to work.

#### Acceptance Criteria

1. WHEN I instantiate CLIMain THEN the constructor SHALL work the same way
2. WHEN I call `runCLI(argv)` THEN it SHALL execute the same way (this is the main entry point used by bin/cli.js)
3. WHEN I access the CLIFlags interface THEN it SHALL have the same types and values
4. WHEN I use the PrimaryMode type THEN it SHALL remain unchanged
5. IF `parseArgs(argv)` is kept as a public method THEN it SHALL return the same CLIFlags interface, BUT it MAY be made private if only used internally

### Requirement 6: Handle Edge Cases

**User Story:** As a user of the CLI, I want edge cases and error conditions to be handled robustly, so that I get helpful error messages when I make mistakes.

#### Acceptance Criteria

1. WHEN I provide no arguments THEN the system SHALL default to setup mode as before
2. WHEN I provide malformed arguments THEN the system SHALL show helpful error messages
3. WHEN I provide arguments with special characters THEN the system SHALL handle them gracefully
4. WHEN I provide duplicate flags THEN the system SHALL handle them consistently (last one wins)
5. WHEN I provide a large number of arguments THEN the system SHALL process them efficiently

### Requirement 7: Maintain Performance

**User Story:** As a user of the CLI, I want argument parsing to be fast, so that the CLI remains responsive.

#### Acceptance Criteria

1. WHEN I run CLI commands THEN argument parsing SHALL complete in under 100ms for typical usage
2. WHEN I provide 1000+ arguments THEN the system SHALL still process them efficiently
3. WHEN the CLI starts up THEN there SHALL be no noticeable performance regression from the migration