# Implementation Plan

- [x] 1. Create ActiveWorkFileResolver class with simple file resolution logic
  - Implement findExistingFile() method to check internal/ACTIVE_WORK.md then ACTIVE_WORK.md
  - Implement createActiveWorkFile() method using existing generateActiveWorkTemplate()
  - Implement resolveActiveWorkFile() method that finds existing or creates new file
  - Add simple logging for file creation and discovery
  - _Requirements: 1.1, 2.1, 2.2, 5.1, 5.2, 5.3_

- [x] 2. Integrate ActiveWorkFileResolver into GitHubSync class
  - Replace current detectActiveWorkPath() logic with new resolver
  - Remove the file existence check that causes the "Active work file not found" error
  - Update constructor to use resolver for file path determination
  - Ensure syncIssues() method always has a valid file path before proceeding
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3_

- [x] 3. Update CLI utils handleSyncIssues function to use new resolver
  - Remove the current file existence check and error exit logic
  - Let the GitHubSync class handle file resolution automatically
  - Simplify the function to just call syncGitHubIssues without path checking
  - _Requirements: 1.1, 1.3, 2.3_

- [ ] 4. Add comprehensive unit tests for ActiveWorkFileResolver
  - Test findExistingFile() with various file existence scenarios
  - Test createActiveWorkFile() with different project structures
  - Test resolveActiveWorkFile() end-to-end functionality
  - Test error handling for permission denied scenarios
  - Mock fs operations to test different file system states
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 5. Add integration tests for GitHubSync with new resolver
  - Test sync-issues command with missing ACTIVE_WORK.md file
  - Test sync-issues command with existing file in internal/ directory
  - Test sync-issues command with existing file in root directory
  - Test permission error scenarios and error messages
  - Verify backward compatibility with existing ACTIVE_WORK.md files
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3_

- [ ] 6. Update CLI integration tests to verify npx execution works
  - Test npx execution in empty directory (should create file and sync)
  - Test npx execution in directory with existing ACTIVE_WORK.md
  - Verify no "Active work file not found" errors occur in any scenario
  - Test cross-platform compatibility for file creation
  - _Requirements: 1.1, 1.3, 2.3_

- [ ] 7. Add error handling tests for edge cases
  - Test behavior when directory is read-only
  - Test behavior when internal/ directory exists but is not writable
  - Test behavior in directories without write permissions
  - Verify clear error messages are shown for permission issues
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Update existing tests to work with new auto-creation behavior
  - Modify tests that expect "file not found" errors to expect file creation
  - Update integration tests to account for automatic file creation
  - Ensure all existing functionality still works with new resolver
  - _Requirements: 2.1, 2.2, 2.3_