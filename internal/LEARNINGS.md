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

## User Experience Patterns
*Document what works/doesn't work for setup tools*