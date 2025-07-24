# Requirements Document

## Introduction

The current CLI argument parsing system in `src/cli/main.ts` uses manual parsing with approximately 200 lines of custom code to handle command-line arguments. This creates maintenance overhead, potential bugs, and reinvents functionality that mature libraries provide. This feature will migrate the CLI argument parsing to use a well-established library (yargs) while maintaining 100% backward compatibility with existing behavior and test expectations.

## Requirements

### Requirement 1: Leverage Yargs Built-in Features

**User Story:** As a developer maintaining the CLI, I want to use yargs' built-in capabilities for help, version, and validation instead of duplicating this functionality, so that the code is simpler and more maintainable.

#### Acceptance Criteria

1. WHEN I use `-h` or `--help` THEN yargs SHALL automatically display help and exit the process
2. WHEN I use `-v` or `--version` THEN yargs SHALL automatically display version and exit the process
3. WHEN yargs handles help/version THEN my parseArgs method SHALL never receive help: true or version: true flags
4. WHEN I use the `--language` flag with equals syntax `--language=js` THEN yargs SHALL parse it automatically
5. WHEN I use the `--language` flag with space syntax `--language js` THEN yargs SHALL parse it automatically
6. WHEN I use the `--no-save` flag THEN yargs SHALL handle the boolean negation automatically

### Requirement 2: Use Yargs Built-in Validation Where Possible

**User Story:** As a developer maintaining the CLI, I want to leverage yargs' built-in validation features for common scenarios and only implement custom validation for complex business rules, so that the code is simpler and more reliable.

#### Acceptance Criteria

1. WHEN I provide an invalid language value THEN yargs choices validation SHALL automatically reject it with a clear error message
2. WHEN I provide an unknown flag THEN yargs SHALL automatically throw an error and suggest `--help`
3. WHEN I provide a flag that requires a value without providing one THEN yargs SHALL automatically handle this validation
4. WHEN I use yargs built-in conflicts() method THEN it SHALL handle simple flag conflicts automatically
5. WHEN I use yargs built-in implies() method THEN it SHALL handle simple flag dependencies automatically
6. WHEN complex business logic is needed THEN custom validation SHALL be added on top of yargs parsing
7. WHEN validation fails THEN error messages SHALL be clear and actionable

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

### Requirement 5: Simplify Public API to Reflect Yargs Usage

**User Story:** As a developer using the CLIMain class, I want the public interface to be simplified to reflect that yargs handles help/version automatically, so that the API is cleaner and more intuitive.

#### Acceptance Criteria

1. WHEN I instantiate CLIMain THEN the constructor SHALL work the same way
2. WHEN I call `runCLI(argv)` THEN it SHALL execute the same way (this is the main entry point used by bin/cli.js)
3. WHEN I access the CLIFlags interface THEN it SHALL NOT include help and version flags since yargs handles these automatically
4. WHEN I use the PrimaryMode type THEN it SHALL remain unchanged
5. WHEN yargs handles help/version and exits THEN runCLI SHALL never be called with those flags

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