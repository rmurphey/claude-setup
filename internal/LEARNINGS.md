# Development Learnings - Internal

## Key Insights About Building This Tool

### 2025-01-04 - Dual Directory Structure
**Problem**: Project needs to provide development record capabilities while using those same capabilities internally without polluting the deliverable.

**Solution**: Separate `/internal/` directory for development records vs `/templates/` directory for user-facing templates.

**Pattern**: Tools that generate development infrastructure often face this meta-problem.

## Template Design Insights
*Add learnings about template design patterns*

## CLI Tool Architecture

### 2025-07-05 - ES Module Migration & Test Infrastructure
**Problem**: Test suite broken after ES module conversion - tests used CommonJS `require()` but codebase converted to ES `import` statements.

**Root Cause**: 
1. Import/export mismatches between test and source files
2. Jest needs special configuration for ES modules 
3. CLI had side effects on import (console output)

**Solution**: 
- Jest: `node --experimental-vm-modules` flag required
- CLI: Conditional execution using `import.meta.url` check
- Tests: Simple unit tests work better than complex integration tests

**Key Pattern**: Import statements should never cause side effects - move all console output into functions that are explicitly called.

**Working Test Structure**:
```javascript
import { functionToTest } from '../bin/cli.js';
test('function works', () => {
  expect(functionToTest(input)).toContain('expected');
});
```

**Status**: Basic tests working (~200ms, 3 tests), 6 test files need conversion.

### 2025-07-05 - Automated Documentation Synchronization
**Problem**: README command count manually maintained, can drift out of sync with actual commands.

**Solution**: 
- Created `lib/readme-updater.js` to automatically scan `.claude/commands/` directory
- Added `/update-readme` command for manual synchronization
- Added `npm run update-readme` script for easy maintenance
- Updater dynamically counts commands and updates README section

**Key Pattern**: Documentation should be generated from source of truth (actual files) rather than manually maintained.

**Automation**: Now when commands are added/removed, run `npm run update-readme` to sync documentation automatically.

### 2025-01-05 21:45 - Engineering Pragmatism: Tree-sitter Overkill
**Insight**: Complex AST parsing was massive engineering overkill for our actual use case. Simple regex patterns captured 90% of needed insights with 10x better reliability and performance.

**Context**: Commit f6231a1

**Problem**: 
- Tree-sitter required native compilation (Python, C++, node-gyp)
- Created chicken-and-egg problem for a project setup tool
- AST parsing failed on 17/21 files in our own codebase
- 50MB of dependencies for basic code insights

**Solution**:
- Replaced with lightweight text analysis using regex patterns
- Same development insights (functions, complexity, tests, APIs)
- Reduced dependencies from 50MB to 5MB
- 100% success rate vs AST parsing failures
- 10x faster analysis

**Key Pattern**: Match tool complexity to problem complexity. For sophisticated code transformations → AST makes sense. For basic project insights → text patterns are perfect.

**Anti-Pattern**: "Better technology" that doesn't serve the actual user need is engineering gold-plating.

**Decision Framework**: When evaluating technical sophistication, ask:
1. What specific user problem does this solve?
2. What's the simplest solution that works reliably?
3. Does the complexity serve the end goal or just technical elegance?

**Result**: From 0 functions detected (AST failures) to 42 functions detected (text patterns) - simpler approach was demonstrably better.

## User Experience Patterns
*Document what works/doesn't work for setup tools*