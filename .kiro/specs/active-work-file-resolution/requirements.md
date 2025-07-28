# Requirements Document

## Introduction

This feature addresses the issue where users encounter "Active work file not found: internal/ACTIVE_WORK.md" errors when running the claude-setup tool via npx. The problem occurs because the tool expects to find an ACTIVE_WORK.md file in a specific location, but the file path resolution logic doesn't handle all execution contexts properly, particularly when the tool is run from different directories or via npx.

The solution should provide robust file path resolution that works consistently across different execution contexts (local development, npx execution, different working directories) and gracefully handle missing files with appropriate fallback behavior.

## Requirements

### Requirement 1

**User Story:** As a developer running claude-setup via npx in any directory, I want the tool to work without file path errors, so that I can use the tool immediately without setup issues.

#### Acceptance Criteria

1. WHEN a user runs `npx github:rmurphey/claude-setup` in any directory THEN the tool SHALL execute without "Active work file not found" errors
2. WHEN the tool cannot find internal/ACTIVE_WORK.md THEN it SHALL gracefully handle the missing file without crashing
3. WHEN running via npx THEN the tool SHALL use appropriate fallback paths or create necessary files as needed

### Requirement 2

**User Story:** As a developer using claude-setup in different project contexts, I want consistent file resolution behavior, so that the tool works reliably regardless of how I invoke it.

#### Acceptance Criteria

1. WHEN the tool is run from the project root directory THEN it SHALL find or create ACTIVE_WORK.md in the correct location
2. WHEN the tool is run from a subdirectory THEN it SHALL still resolve file paths correctly relative to the project root
3. WHEN the tool is run via different methods (direct execution, npx, local install) THEN file path resolution SHALL behave consistently

### Requirement 3

**User Story:** As a developer encountering missing file errors, I want clear error messages and automatic recovery, so that I understand what's happening and can continue working.

#### Acceptance Criteria

1. WHEN a required file is missing THEN the tool SHALL provide a clear, actionable error message
2. WHEN possible to auto-create missing files THEN the tool SHALL create them with appropriate default content
3. WHEN auto-creation is not possible THEN the tool SHALL provide specific instructions on how to resolve the issue

### Requirement 4

**User Story:** As a developer working with the --sync-issues feature, I want it to work regardless of ACTIVE_WORK.md file location, so that I can sync GitHub issues without path-related errors.

#### Acceptance Criteria

1. WHEN running `--sync-issues` and internal/ACTIVE_WORK.md exists THEN it SHALL use that file
2. WHEN running `--sync-issues` and internal/ACTIVE_WORK.md is missing but ACTIVE_WORK.md exists in root THEN it SHALL use the root file
3. WHEN running `--sync-issues` and no ACTIVE_WORK.md exists THEN it SHALL create one in the appropriate location with proper structure

### Requirement 5

**User Story:** As a developer using claude-setup in various project structures, I want the tool to adapt to different project layouts, so that it works with my existing project organization.

#### Acceptance Criteria

1. WHEN the project has an internal/ directory THEN the tool SHALL prefer internal/ACTIVE_WORK.md
2. WHEN the project has no internal/ directory THEN the tool SHALL use ACTIVE_WORK.md in the project root
3. WHEN neither file exists THEN the tool SHALL create the appropriate file based on project structure and user preferences