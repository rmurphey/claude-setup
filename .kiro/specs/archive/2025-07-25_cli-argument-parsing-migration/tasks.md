# Implementation Plan

- [x] 1. Setup yargs dependency and basic configuration
  - Add yargs and @types/yargs as dependencies to package.json
  - Create basic yargs configuration with all CLI options defined
  - Use yargs built-in .help() and .version() methods instead of custom handling
  - Remove help and version from CLIFlags interface since yargs handles them automatically
  - Verify basic boolean flags work (--force, --detect-language, etc.)
  - _Requirements: 1.1, 1.2, 1.3, 5.3_

- [x] 2. Implement language option handling with yargs built-in validation
  - Configure --language option with choices validation in yargs
  - Verify yargs automatically handles both --language=js and --language js syntax
  - Test that yargs choices validation automatically rejects invalid language values
  - Verify yargs provides clear error messages for invalid choices
  - _Requirements: 1.4, 1.5, 2.1, 2.2_

- [x] 3. Use yargs built-in validation for simple conflicts and dependencies
  - Use yargs .conflicts() method for simple flag conflicts where possible
  - Use yargs .implies() method for simple flag dependencies where possible
  - Test yargs built-in conflict detection (e.g., .conflicts('show', 'reset'))
  - Test yargs built-in dependency detection (e.g., .implies('show', 'config'))
  - _Requirements: 2.4, 2.5_

- [x] 4. Add custom validation only for complex business rules
  - Identify which validation rules cannot be handled by yargs built-ins
  - Implement minimal custom validation layer only for complex cases
  - Ensure custom validation works on top of yargs parsing results
  - Test that custom validation provides clear error messages
  - _Requirements: 2.6, 2.7_

- [x] 5. Verify yargs built-in error handling is sufficient
  - Test that yargs automatically provides clear error messages for unknown options
  - Test that yargs automatically provides clear error messages for missing arguments
  - Test that yargs choices validation provides clear error messages for invalid values
  - Only implement custom error formatting if yargs defaults are insufficient
  - _Requirements: 2.2, 2.3, 6.2, 6.3_

- [x] 6. Verify yargs handles edge cases automatically
  - Test that yargs automatically handles --no-save boolean negation
  - Verify empty argument arrays work correctly (yargs returns default values)
  - Test that yargs handles duplicate flags with last-one-wins behavior
  - Test that yargs handles arguments with special characters gracefully
  - Verify yargs performance with large numbers of arguments
  - _Requirements: 1.6, 6.1, 6.4, 6.5, 7.1, 7.2_

- [x] 7. Integrate yargs parsing into CLIMain class
  - Replace manual parseArgs implementation with yargs-based version
  - Maintain exact same CLIFlags interface and return values
  - Preserve runCLI method behavior and error handling
  - Ensure constructor and public API remain unchanged
  - _Requirements: 3.3, 5.1, 5.2, 5.3, 5.4_

- [x] 8. Run comprehensive test suite validation
  - Execute all existing CLI tests without modification
  - Verify all 295 tests pass with new implementation
  - Fix any test failures by adjusting error message formatting
  - Ensure no behavioral regressions in edge cases
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 9. Remove commander dependency and cleanup
  - Remove commander import from src/cli/main.ts
  - Remove commander dependency from package.json
  - Update package-lock.json by running npm install
  - Verify no other files import or use commander
  - _Requirements: 4.1, 4.4_

- [x] 10. Code cleanup and documentation
  - Remove old manual parsing methods (extractFlagValue, configKeyToFlag, etc.)
  - Remove unused validation Maps and Sets
  - Update code comments and documentation
  - Verify code reduction from ~200 lines to ~50 lines achieved
  - _Requirements: 4.1, 4.2, 4.3, 4.4_