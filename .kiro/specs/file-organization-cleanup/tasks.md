# File Organization Cleanup - Tasks

## Phase 1: Build Configuration Investigation and Fix

### Task 1.1: Investigate lib/lib/ Structure Issue
- [x] Examine tsconfig.json compilation settings
- [x] Check package.json build scripts
- [x] Identify root cause of nested lib/lib/ directory
- [x] Document current vs expected build output structure

### Task 1.2: Fix TypeScript Build Configuration  
- [x] Update tsconfig.json to correct outDir setting
- [x] Verify rootDir is correctly set to ./src
- [x] Test compilation with corrected settings
- [x] Ensure no other config files override settings

### Task 1.3: Rebuild and Validate Output Structure
- [x] Clean existing build artifacts (rm -rf lib/)
- [x] Run full TypeScript compilation
- [x] Verify dist/ structure is flat (no lib/lib/ nesting)
- [x] Confirm all expected files are in correct locations

### Task 1.4: Clean Up Old Nested Structure
- [x] Remove any remaining lib/lib/ artifacts
- [x] Update .gitignore if necessary
- [x] Verify clean build process from scratch

## Phase 2: Critical File Relocation

### Task 2.1: Move kiro-hook-executor.js to .kiro/
- [x] Search for all references to kiro-hook-executor.js
- [x] Update package.json hooks or scripts referencing the file
- [x] Update any documentation mentioning the file location
- [x] Move file using git mv to preserve history
- [x] Test hook system functionality after move

### Task 2.2: Verify Hook System After Move
- [x] Test kiro hook discovery and loading
- [x] Verify hook execution works correctly
- [x] Run integration tests for spec archival automation
- [x] Confirm no broken references remain

## Phase 3: Documentation and Test File Organization

### Task 3.1: Move VALUE_PROPOSITION.md to docs/
- [x] Ensure docs/ directory exists
- [x] Search for any links to VALUE_PROPOSITION.md
- [x] Update README or other docs with new path
- [x] Move file using git mv
- [x] Verify all documentation links work

### Task 3.2: Move test-integration.js to __tests__/
- [x] Search for references to test-integration.js in package.json
- [x] Update any scripts that execute this file
- [x] Consider renaming to integration-runner.js for clarity
- [x] Move file using git mv
- [x] Test that integration test runner still works

## Phase 4: File and Directory Cleanup

### Task 4.1: Remove Temporary Files
- [x] Verify current-js-files.txt is not referenced anywhere
- [x] Confirm it's a temporary artifact from file listing
- [x] Delete current-js-files.txt
- [x] Remove from git tracking if needed

### Task 4.2: Remove Empty Test Directories
- [x] Confirm test-empty-dir/ is actually empty
- [x] Confirm test-npx/ is actually empty  
- [x] Verify these directories are not used by tests or scripts
- [x] Remove both empty directories
- [x] Clean up any .gitkeep files if present

### Task 4.3: Clean Up Coverage Artifacts
- [x] Review coverage/tmp/ directory contents
- [x] Identify which files are temporary vs persistent
- [x] Remove temporary coverage JSON files
- [x] Update .gitignore to exclude coverage/tmp/ if needed

## Phase 5: Reference Updates and Validation

### Task 5.1: Update All File References
- [x] Search entire codebase for paths to moved files
- [x] Update any hardcoded paths in code
- [x] Update import statements if any exist
- [x] Update documentation and README files
- [x] Update any CI/CD configuration files

### Task 5.2: Comprehensive Testing
- [x] Run full test suite to verify no regressions
- [x] Test NPX package execution
- [x] Test all CLI functionality manually
- [x] Verify hook system works end-to-end
- [x] Test build process produces correct output

### Task 5.3: Final Validation
- [x] Verify root directory is cleaner and more organized
- [x] Confirm all files are in logical locations
- [x] Check that no broken links or references exist
- [x] Validate that project follows standard conventions
- [x] Document the new file organization structure

## Phase 6: Documentation and Cleanup

### Task 6.1: Update Project Documentation
- [x] Update any architecture diagrams showing file structure
- [x] Revise development setup instructions if needed
- [x] Update contributor guidelines with new organization
- [x] Document the changes made and rationale

### Task 6.2: Git History Cleanup
- [x] Ensure all moves used git mv for proper history
- [x] Create meaningful commit messages for each phase
- [ ] Consider squashing minor fixes within phases
- [ ] Tag the completion of reorganization if appropriate

## Rollback Plan

### Emergency Rollback Procedures
- [ ] Document git commands to revert each phase
- [ ] Identify critical restore points (after each phase)
- [ ] Test rollback procedures on branch before applying to main
- [ ] Have backup of current state before starting

## Success Criteria Validation

### Final Checks
- [ ] All tests pass after complete reorganization
- [ ] No lib/lib/ duplication exists
- [ ] All files are in appropriate directories
- [ ] Root directory contains only necessary files
- [ ] All functionality works as expected
- [ ] Project structure follows conventions
- [ ] Documentation is accurate and up-to-date