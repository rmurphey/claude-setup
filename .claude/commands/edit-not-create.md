---
allowed-tools: [Read, Glob, Grep]
description: Smart file decision process - prefer editing existing files over creating new ones
---

# Edit Not Create - Smart File Decision Process

Enforce intelligent file management: understand existing patterns and prefer editing over creating new files.

## Context
- Project structure: !`find . -type d -name src -o -name lib -o -name components | head -5`
- Recent files: !`ls -lt | head -5`
- Current directory: !`pwd`

## Your Task

### 📋 Smart File Decision Process
1. **Understand existing patterns**
2. **Check if functionality fits existing files**
3. **Consider modularity benefits**
4. **Follow established patterns**
5. **Create new files only if it improves organization**

### 🏗️ Good Reasons for New Files
- **Separation of concerns** - Distinct, unrelated responsibilities
- **Modularity** - Reusable component or utility
- **Architectural patterns** - Following established project structure
- **Testability** - Isolating functionality for easier testing
- **Reusability** - Component will be used in multiple places

### ❌ Anti-Patterns to Avoid
- **Duplicating functionality** that already exists
- **Creating unnecessary single-use files**
- **Breaking existing architectural patterns**
- **Creating files without clear purpose**

## Decision Matrix

```bash
# Check existing functionality
echo "🔍 Checking for existing similar functionality..."
grep -r "your_function_name" src/ || echo "No similar functionality found"

# Check file sizes
echo "📏 Current file sizes:"
find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | xargs wc -l | sort -n | tail -10

# Analyze project structure
echo "🏗️ Project structure patterns:"
ls -la src/ 2>/dev/null || ls -la lib/ 2>/dev/null || echo "No standard src structure"
```

## Guidelines
- **If adding related functionality**: Edit existing file
- **If functionality is distinct**: Consider new file
- **If file becomes too large (>400 lines)**: Split logically
- **If breaking patterns**: Follow established conventions

## Final Check
Ask yourself:
1. Does this functionality belong with existing code?
2. Will a new file improve code organization?
3. Am I following project patterns?
4. Is this the minimal change needed?

**Default: Edit existing files. Create new files only when it clearly improves organization.**

Work with existing patterns, create new files when modularity benefits.