# Token-Efficient Command Architecture

## Overview

This repository demonstrates a token-efficient approach to Claude Code commands, reducing AI token consumption by **85-90%** through npm script delegation.

## The Problem

Traditional Claude Code commands embed all logic directly in markdown files:
- Commands average 250-450 lines
- Claude reads entire file content on each use
- 19 commands × 300 lines = 5,700 lines per full scan
- Significant token consumption for repetitive tasks

## The Solution: NPM Script Delegation

### Architecture

```
┌─────────────────────┐
│  Minimal Command    │  (20-40 lines)
│   /hygiene.md       │
└──────────┬──────────┘
           │ Delegates to
           ▼
┌─────────────────────┐
│   NPM Scripts       │  (package.json)
│  npm run hygiene    │
└─────────────────────┘
```

### Token Savings

| Command | Original | Optimized | Reduction |
|---------|----------|-----------|-----------|
| /hygiene | 264 lines | 30 lines | 88% |
| /commit | 296 lines | 33 lines | 88% |
| /maintainability | 458 lines | 42 lines | 90% |
| /todo | 305 lines | 43 lines | 85% |
| **Average** | **330 lines** | **37 lines** | **89%** |

## Implementation Guide

### 1. Create NPM Scripts

Add comprehensive scripts to `package.json`:

```json
{
  "scripts": {
    "hygiene": "npm run hygiene:quick --silent",
    "hygiene:quick": "npm run lint:check && npm run test:check",
    "lint:check": "eslint . --max-warnings 10 || echo 'No linter'",
    "test:check": "npm test || echo 'No tests'"
  }
}
```

### 2. Minimize Command Files

Transform verbose commands into minimal delegates:

**Before** (264 lines):
```markdown
# Project Hygiene Check

[... 250+ lines of bash logic ...]
```

**After** (30 lines):
```markdown
# Project Hygiene Check

\`\`\`bash
npm run hygiene:full --silent
\`\`\`
```

### 3. Benefits

#### For Users
- **Faster Claude responses** - Less content to parse
- **Lower costs** - Fewer tokens consumed
- **Better performance** - Scripts run natively
- **Reusability** - Scripts work without Claude

#### For Development
- **Maintainability** - Logic in one place
- **Testability** - Scripts testable independently
- **Version control** - Smaller diffs
- **Cross-platform** - NPM works everywhere

## Usage Patterns

### Direct NPM Script Execution

Users can run scripts directly without Claude:
```bash
npm run hygiene
npm run lint:check
npm run maintain:debt
```

### Command Templates

Commands become simple script invocations:
```bash
/hygiene        # → npm run hygiene
/commit feat    # → npm run quality:pre-commit && git commit
/todo list      # → npm run todo:list
```

## Migration Strategy

### Phase 1: High-Value Commands
Migrate commands with most lines first:
1. /maintainability (458 → 42 lines)
2. /issue (442 → ~40 lines)
3. /version-tag (437 → ~40 lines)

### Phase 2: Core Workflow
Migrate frequently-used commands:
1. /hygiene (264 → 30 lines)
2. /commit (296 → 33 lines)
3. /todo (305 → 43 lines)

### Phase 3: Remaining Commands
Complete migration for all commands.

## NPM Script Categories

### Core Workflow
```json
"hygiene": "Full health check",
"todo:list": "Show tasks",
"commit:check": "Pre-commit validation"
```

### Quality Checks
```json
"lint:check": "Code style validation",
"test:check": "Run test suite",
"build:check": "Build verification"
```

### Git Operations
```json
"git:status:summary": "Quick git status",
"git:check:staged": "Verify staged files",
"git:unpushed": "Count unpushed commits"
```

### Maintainability
```json
"maintain:files": "Count code files",
"maintain:debt": "Find TODO/FIXME",
"maintain:largest": "Identify large files"
```

## Best Practices

### 1. Script Naming Convention
- Use colons for namespacing: `category:action`
- Keep names descriptive but concise
- Group related scripts together

### 2. Error Handling
- Use `|| echo 'message'` for graceful failures
- Provide helpful error messages
- Return appropriate exit codes

### 3. Silent Flags
- Use `--silent` to reduce noise
- Pipe to `/dev/null` when appropriate
- Keep output focused and relevant

### 4. Composition
- Build complex scripts from simple ones
- Use `&&` for sequential execution
- Create `:quick` and `:full` variants

## Examples

### Minimal Hygiene Command
```markdown
---
allowed-tools: [Bash]
description: Project health check
---

# Project Hygiene Check

\`\`\`bash
npm run hygiene:full --silent
\`\`\`
```

### Minimal Commit Command
```markdown
---
allowed-tools: [Bash]
description: Quality-checked commit
---

# Quality Commit

\`\`\`bash
npm run quality:pre-commit --silent || exit 1
git commit -m "$1: $2"
\`\`\`
```

## Measuring Success

### Token Metrics
- Original: ~5,700 lines total
- Optimized: ~700 lines total
- **Savings: 87% reduction**

### Performance Metrics
- Faster command execution
- Reduced Claude response time
- Lower API costs

### Developer Experience
- Scripts work standalone
- Easy to test and debug
- Familiar npm ecosystem

## Future Optimizations

### 1. Node.js Scripts
For complex logic, use JavaScript:
```javascript
// scripts/maintainability.js
#!/usr/bin/env node
const score = calculateMaintainability();
console.log(`Score: ${score}/100`);
```

### 2. Configuration Files
Move thresholds to config:
```json
// .claude-config.json
{
  "lint": { "maxWarnings": 10 },
  "test": { "minCoverage": 80 }
}
```

### 3. Command Aliases
Create ultra-minimal aliases:
```markdown
# h.md (alias for hygiene)
\`\`\`bash
npm run hygiene
\`\`\`
```

## Conclusion

By delegating to npm scripts, we achieve:
- **87% token reduction** on average
- **Better performance** through native execution
- **Improved maintainability** with centralized logic
- **Cross-platform compatibility** via npm

This architecture represents best practices for token-efficient Claude Code command development.