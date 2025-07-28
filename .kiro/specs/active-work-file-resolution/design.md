# Design Document

## Overview

The current implementation has a critical flaw where the `--sync-issues` command fails with "Active work file not found" when no ACTIVE_WORK.md file exists, particularly when running via npx in fresh directories. The issue stems from rigid file path expectations without proper fallback mechanisms or auto-creation capabilities.

This design implements a robust file resolution system that gracefully handles missing files, provides intelligent fallbacks, and auto-creates necessary files when appropriate. The solution maintains backward compatibility while significantly improving user experience across different execution contexts.

## Architecture

### Current Problem Analysis

1. **GitHubSync.syncIssues()** fails immediately if ACTIVE_WORK.md doesn't exist (line 89-96 in github-sync.ts)
2. **handleSyncIssues()** in cli/utils.ts exits with error code 1 if no file exists (line 186-190)
3. **detectActiveWorkPath()** returns a default fallback but doesn't create the file
4. No mechanism exists to auto-create ACTIVE_WORK.md with proper structure

### New Architecture Components

#### 1. Simple File Resolution System
- **ActiveWorkFileResolver** class: Find existing ACTIVE_WORK.md or create it if missing
- **Path Priority**: Check internal/ACTIVE_WORK.md first, then ACTIVE_WORK.md, create at preferred location

#### 2. Always-Create System
- **Template Integration**: Reuse existing generateActiveWorkTemplate() for consistent structure
- **Smart Location**: Create in internal/ if directory exists, otherwise in project root
- **Clear Logging**: Always log when creating the file so users know what happened

#### 3. Simplified Error Handling
- **Permission Issues**: Only error case that matters - provide clear guidance
- **Success Logging**: Clear messages when file is created or found

## Components and Interfaces

### ActiveWorkFileResolver

```typescript
class ActiveWorkFileResolver {
  private readonly searchPaths = [
    'internal/ACTIVE_WORK.md',  // Preferred location
    'ACTIVE_WORK.md'            // Fallback location
  ];

  async resolveActiveWorkFile(): Promise<string>
  private async findExistingFile(): Promise<string | null>
  private async createActiveWorkFile(): Promise<string>
  private getPreferredPath(): string
}
```

### Enhanced GitHubSync

```typescript
class GitHubSync {
  private readonly resolver: ActiveWorkFileResolver;
  
  constructor(workFilePath: string | null = null)
  
  async syncIssues(): Promise<Result<boolean, GitHubAPIError | FileSystemError>>
  private async ensureActiveWorkFile(): Promise<string>
}
```

### Project Structure Detection

```typescript
interface ProjectStructure {
  hasInternalDir: boolean;
  hasClaudeDir: boolean;
  isNpxExecution: boolean;
  workingDirectory: string;
  recommendedPath: string;
}

class StructureDetector {
  static async analyze(workingDir?: string): Promise<ProjectStructure>
  static getRecommendedPath(structure: ProjectStructure): string
}
```

## Data Models

### Simple Resolution Result

```typescript
// No complex interfaces needed - just return the file path
// Log creation/found status directly in the resolver
```

## Error Handling

### Simple Error Handling

1. **File Creation Success**: Log "✅ Created ACTIVE_WORK.md at {path}" and continue
2. **File Found**: Log "📄 Using existing ACTIVE_WORK.md at {path}" and continue  
3. **Permission Denied**: Only error case - show clear message and exit

### Minimal Error Types

```typescript
// Use existing FileSystemError - no new error types needed
// Just provide clear error messages for permission issues
```

### Simple Logging Messages

```typescript
// Success cases (just log and continue)
console.log('✅ Created ACTIVE_WORK.md at internal/ACTIVE_WORK.md');
console.log('📄 Using existing ACTIVE_WORK.md at ACTIVE_WORK.md');

// Only error case that matters
console.error('❌ Cannot create ACTIVE_WORK.md: Permission denied');
console.log('Fix permissions with: chmod u+w . && mkdir -p internal');
console.log('Or create the file manually: touch ACTIVE_WORK.md');
```

## Testing Strategy

### Unit Tests

1. **ActiveWorkFileResolver**
   - File detection in various project structures
   - Auto-creation with different template configurations
   - Permission handling and error scenarios
   - Fallback path resolution

2. **Enhanced GitHubSync**
   - Integration with new resolver
   - Backward compatibility with existing behavior
   - Error handling improvements

3. **StructureDetector**
   - Project structure analysis accuracy
   - Recommendation logic for different scenarios

### Integration Tests

1. **NPX Execution Scenarios**
   - Fresh directory with no existing files
   - Directory with partial project structure
   - Directory with existing ACTIVE_WORK.md in different locations

2. **CLI Command Testing**
   - `--sync-issues` with missing files
   - `--sync-issues` with existing files in various locations
   - Error scenarios and recovery

3. **Cross-Platform Testing**
   - File path resolution on different operating systems
   - Permission handling variations
   - Template generation consistency

### End-to-End Tests

1. **User Journey Testing**
   - Complete npx workflow from empty directory
   - Sync issues workflow with auto-creation
   - Error recovery and user guidance

2. **Regression Testing**
   - Existing functionality preservation
   - Template compatibility
   - CLI argument handling

## Implementation Phases

### Phase 1: Core File Resolution
- Implement ActiveWorkFileResolver class
- Add StructureDetector for project analysis
- Create enhanced error handling system

### Phase 2: GitHubSync Integration
- Modify GitHubSync to use new resolver
- Implement auto-creation logic
- Add template integration for file creation

### Phase 3: CLI Integration
- Update handleSyncIssues to use new system
- Add command-line flags for resolution strategy
- Implement user-friendly error messages

### Phase 4: Testing and Validation
- Comprehensive test suite implementation
- NPX execution testing
- Cross-platform validation

## Backward Compatibility

### Existing Behavior Preservation
- **Improved default behavior**: Auto-creation eliminates previous error cases while maintaining existing functionality
- Existing ACTIVE_WORK.md files continue to work without modification
- CLI arguments maintain same interface with enhanced reliability

### Migration Strategy
- **Zero breaking changes**: New behavior only adds functionality, never removes it
- **Immediate improvement**: Users who previously encountered errors will now get working functionality
- **Clear logging**: All auto-creation actions are logged with clear messages like "✅ Created ACTIVE_WORK.md at internal/ACTIVE_WORK.md"

## Performance Considerations

### File System Operations
- Minimize redundant file existence checks
- Cache project structure analysis results
- Efficient template generation and file creation

### Error Handling Efficiency
- Fast-fail for unrecoverable errors
- Lazy loading of template generation
- Minimal overhead for successful operations