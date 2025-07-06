# Interactive Setup Preview Design

## Problem Statement
Users run `claude-setup` without knowing what files will be created, what tools will be installed, or how long setup will take. This creates hesitation and uncertainty, particularly for new users who don't trust opaque setup processes.

**Current User Experience Issues:**
- No visibility into what setup will do before running
- Cannot compare configuration options with concrete examples  
- Unknown time commitment creates barrier to trying the tool
- Post-setup confusion about what was actually installed

## Requirements

### Functional Requirements
- Show file tree preview before creating any files
- Display estimated setup time based on configuration choices
- List dependencies that will be installed
- Allow users to cancel before any changes are made
- Show different previews for different quality levels/team sizes
- Provide option to save preview without executing

### Non-Functional Requirements
- Preview generation must be fast (<500ms)
- Preview must be accurate (no false promises)
- Display must work in all terminal sizes
- Memory usage should be minimal for preview generation

## Technical Approach

### Preview Generation System
Create `lib/preview-generator.js` that simulates setup without file system changes:

```javascript
class SetupPreviewGenerator {
  async generatePreview(config) {
    const mockFileSystem = new MockFileSystem();
    const mockDetection = { existingFiles: {} };
    
    // Simulate setup without writing files
    await this.simulateLanguageSetup(config, mockDetection, mockFileSystem);
    await this.simulateCommandCreation(mockFileSystem);
    await this.simulateCICD(config, mockFileSystem);
    
    return {
      files: mockFileSystem.getFileList(),
      dependencies: this.extractDependencies(),
      estimatedTime: this.calculateEstimatedTime(config),
      scripts: this.getPackageScripts()
    };
  }
}
```

### Display System
Enhance CLI with preview mode before confirmation:

```javascript
// In cli.js after configuration collection
const preview = await generatePreview(answers);
await displayPreview(preview);
const confirmed = await confirmSetup();
if (!confirmed) process.exit(0);
```

### Preview Display Format
```
📋 Setup Preview for JavaScript/Strict/Team:
   
   Files to create (8):
   ├── .eslintrc.js (ESLint strict config)
   ├── .prettierrc (Prettier formatting)  
   ├── package.json (scripts: lint, test, build)
   ├── CLAUDE.md (AI collaboration guidelines)
   ├── .claude/commands/ (14 custom commands)
   ├── .github/workflows/quality.yml (CI/CD pipeline)
   ├── .gitignore (Node.js patterns)
   └── lib/readme-updater.js (utility library)
   
   📦 Dependencies to install:
   • eslint, @eslint/js, eslint-config-prettier
   • prettier  
   • jest, @types/jest
   
   ⏱️  Estimated time: 45-60 seconds
   💾 Total size: ~2.1MB (dependencies + config files)
   
   Continue with setup? [Y/n]
```

## Implementation Phases

### Phase 1: Basic Preview Infrastructure
- Create MockFileSystem class that tracks file operations
- Modify existing setup functions to accept mock filesystem
- Basic preview display with file list
- Integration into CLI flow with confirmation prompt

### Phase 2: Enhanced Preview Details  
- Dependency extraction and display
- Time estimation based on configuration complexity
- File size calculations
- Preview save functionality (`--preview-only` flag)

### Phase 3: Preview Comparison
- Side-by-side comparison of different quality levels
- Interactive quality level selection with live preview updates
- Template preview for CI/CD workflows and configs

## Cost Estimate
- **Size**: Medium
- **Effort**: 2-3 development sessions (~90-120 Claude messages)
- **Confidence**: High

**Breakdown:**
- Phase 1: ~40 messages (infrastructure, basic display)
- Phase 2: ~35 messages (enhanced details, time estimation)  
- Phase 3: ~25 messages (comparison features)
- Testing/Polish: ~20 messages

## Testing Strategy

### Unit Tests
- MockFileSystem operations match real filesystem
- Preview generation accuracy for each language
- Time estimation calibration
- Display formatting edge cases

### Integration Tests  
- Preview -> setup consistency validation
- CLI flow with preview enabled/disabled
- Preview cancellation handling
- Different terminal size rendering

### User Testing
- A/B test setup completion rates with/without preview
- Measure user confidence before/after preview implementation
- Validate time estimates against actual setup times

## Dependencies

### Internal Dependencies
- Existing language setup modules must support mock filesystem
- CLI flow modification for preview insertion
- Template system awareness for preview generation

### External Dependencies  
- No new external packages required
- Terminal display capabilities (existing chalk/inquirer sufficient)

### Technical Dependencies
- Mock filesystem must accurately simulate real operations
- Preview generation performance must not impact UX

## Success Metrics

### User Experience Metrics
- Increased setup completion rate (target: +15%)
- Reduced support questions about "what did setup do?"
- User confidence surveys (target: 4.5/5 for "I understood what would happen")

### Technical Metrics
- Preview accuracy: 100% match between preview and actual setup
- Preview generation time: <500ms for all configurations  
- No regression in actual setup performance

### Feature Adoption
- Preview usage rate among new users
- Cancellation rate after preview (indicates informed decision-making)
- Feature request reduction for "show me what will happen"

## Future Enhancements

### Advanced Preview Features
- Interactive preview with live config changes
- Export preview as documentation for team review
- Integration with existing project analysis

### Performance Optimizations
- Cache common preview components
- Lazy loading for complex dependency trees
- Streaming preview updates for large projects