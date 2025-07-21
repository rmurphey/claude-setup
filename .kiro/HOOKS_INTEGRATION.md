# Kiro Hooks Integration with Claude Code

This document explains how to integrate the `.kiro.hook` system with Claude Code's native hook infrastructure.

## Overview

The `.kiro/kiro-hook-executor.js` script acts as a bridge between `.kiro.hook` files and Claude Code's existing hook system. It reads `.kiro.hook` configurations and executes their prompts via Claude CLI when file patterns match.

## Installation

### 1. Ensure Dependencies
```bash
npm install minimatch
```

### 2. Test the Hook Executor
```bash
# List all discovered hooks
node .kiro/kiro-hook-executor.js --list-hooks

# Test pattern matching
node .kiro/kiro-hook-executor.js --test ".kiro/specs/my-spec/tasks.md"
node .kiro/kiro-hook-executor.js --test "README.md"
```

### 3. Make Script Executable
```bash
chmod +x .kiro/kiro-hook-executor.js
```

## Integration with Claude Code

### Option A: User Hook Settings (Recommended)

Add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "fileChange": [
      "node /full/path/to/your/project/.kiro/kiro-hook-executor.js"
    ]
  }
}
```

Replace `/full/path/to/your/project/` with the actual absolute path to this project directory.

### Option B: Project-Local Integration

Add to your project's `.claude/settings.json`:

```json
{
  "hooks": {
    "fileChange": [
      "node .kiro/kiro-hook-executor.js"
    ]
  }
}
```

### Option C: Git Hook Integration

Add to `.git/hooks/post-commit`:

```bash
#!/bin/bash
# Get list of changed files from last commit
git diff-tree --no-commit-id --name-only -r HEAD | while read file; do
  node .kiro/kiro-hook-executor.js "$file"
done
```

## How It Works

1. **File Change Detection**: Claude Code's native hook system detects file changes
2. **Bridge Execution**: Claude calls `.kiro/kiro-hook-executor.js` with the changed file path
3. **Pattern Matching**: Script matches file against all `.kiro.hook` patterns using minimatch
4. **Hook Execution**: For matches, script executes Claude CLI with the hook's prompt
5. **Claude Interaction**: Claude receives the prompt and performs the specified actions

## Supported .kiro.hook Format

The bridge supports the existing `.kiro.hook` format:

```json
{
  "enabled": true,
  "name": "Hook Name",
  "description": "What this hook does",
  "version": "1",
  "when": {
    "type": "fileEdited",
    "patterns": [
      ".kiro/specs/*/tasks.md",
      "src/**/*.js"
    ]
  },
  "then": {
    "type": "askAgent",
    "prompt": "The prompt to send to Claude when patterns match"
  }
}
```

## Current Hooks

### Spec Archival Automation
- **Triggers**: `.kiro/specs/*/tasks.md` files
- **Action**: Scans for completed specs and archives them using the archival system
- **File**: `.kiro/hooks/spec-archival-automation.kiro.hook`

### Task Completion Auto-Commit  
- **Triggers**: Various project files (README.md, src, docs, etc.)
- **Action**: Updates documentation and creates commits when tasks are completed
- **File**: `.kiro/hooks/task-completion-commit.kiro.hook`

## Troubleshooting

### Hook Not Executing
1. Verify Claude settings.json syntax
2. Check file path permissions
3. Test manually: `node .kiro/kiro-hook-executor.js path/to/changed/file`

### Claude CLI Not Found
The executor tries multiple Claude CLI commands:
- `claude`
- `claude-code` 
- `npx claude-code`

Ensure at least one is available in your PATH.

### Pattern Matching Issues
Use the test command to verify patterns:
```bash
node .kiro/kiro-hook-executor.js --test "your/file/path"
```

## Future Enhancements

- File watching mode for real-time hook execution
- Hook execution logging and history
- Conditional hook execution based on file content changes
- Integration with more Claude Code lifecycle events

## Security Considerations

- The bridge executes prompts in Claude CLI with your credentials
- Review all `.kiro.hook` prompts before enabling
- Consider using project-local settings instead of global user settings
- Ensure hook scripts have appropriate file permissions