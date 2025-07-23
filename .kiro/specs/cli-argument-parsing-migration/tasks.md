# Implementation Plan

- [ ] 1. Setup yargs dependency and basic configuration
  - Add yargs and @types/yargs as dependencies to package.json
  - Create basic yargs configuration with all CLI options defined
  - Implement simple option parsing without validation
  - Verify basic boolean flags work (--help, --version, --force, etc.)
  - _Requirements: 1.1, 1.2, 1.3, 5.1_

- [ ] 2. Implement language option handling with validation
  - Configure --language option with choices validation in yargs
  - Handle both --language=js and --language js syntax
  - Implement custom language validation to match existing error messages
  - Test language validation with valid and invalid values
  - _Requirements: 1.4, 1.5, 2.5, 6.4_

- [ ] 3. Implement flag conflict detection and validation
  - Create custom validation layer for complex flag conflicts
  - Implement conflict detection for --detect-language vs --config vs --sync-issues
  - Implement conflict detection for --show vs --reset
  - Ensure error messages match existing test expectations exactly
  - _Requirements: 2.1, 2.4, 3.2_

- [ ] 4. Implement flag dependency validation
  - Add custom validation for --show requires --config dependency
  - Add custom validation for --reset requires --config dependency
  - Ensure dependency error messages match existing test expectations
  - Test all dependency scenarios from existing test suite
  - _Requirements: 2.2, 2.3, 3.2_

- [ ] 5. Implement error message compatibility layer
  - Create error message transformation functions
  - Handle unknown option errors to match "error: unknown option '--flag'" format
  - Handle missing argument errors to match "error: option '--language <lang>' argument missing" format
  - Handle invalid value errors with descriptive messages and suggestions
  - Add help suggestions for error scenarios
  - _Requirements: 2.6, 2.7, 6.2, 6.3_

- [ ] 6. Handle edge cases and special argument scenarios
  - Implement --no-save boolean negation handling
  - Handle empty argument arrays (default to setup mode)
  - Handle duplicate flags (last one wins behavior)
  - Handle arguments with special characters
  - Ensure performance with large numbers of arguments
  - _Requirements: 1.6, 6.1, 6.4, 6.5, 7.1, 7.2_

- [ ] 7. Integrate yargs parsing into CLIMain class
  - Replace manual parseArgs implementation with yargs-based version
  - Maintain exact same CLIFlags interface and return values
  - Preserve runCLI method behavior and error handling
  - Ensure constructor and public API remain unchanged
  - _Requirements: 3.3, 5.1, 5.2, 5.3, 5.4_

- [ ] 8. Run comprehensive test suite validation
  - Execute all existing CLI tests without modification
  - Verify all 295 tests pass with new implementation
  - Fix any test failures by adjusting error message formatting
  - Ensure no behavioral regressions in edge cases
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 9. Performance testing and optimization
  - Benchmark argument parsing performance vs current implementation
  - Test with 1000+ arguments to ensure efficiency
  - Verify CLI startup time shows no regression
  - Optimize yargs configuration if needed for performance
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 10. Remove commander dependency and cleanup
  - Remove commander import from src/cli/main.ts
  - Remove commander dependency from package.json
  - Update package-lock.json by running npm install
  - Verify no other files import or use commander
  - _Requirements: 4.1, 4.4_

- [ ] 11. Code cleanup and documentation
  - Remove old manual parsing methods (extractFlagValue, configKeyToFlag, etc.)
  - Remove unused validation Maps and Sets
  - Update code comments and documentation
  - Verify code reduction from ~200 lines to ~50 lines achieved
  - _Requirements: 4.1, 4.2, 4.3, 4.4_