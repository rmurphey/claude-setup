---
allowed-tools: [Bash]
description: Atomic commits with quality checks - 1-3 files at a time
approach: hybrid
token-cost: ~200 (script runs checks, Claude formats message)
best-for: Small, focused commits with quality validation
---

# Atomic Commit Command

Create small, focused commits with quality validation.

## Atomic Commit Principles
- ✅ **COMMIT EVERY 1-3 file changes** that create working functionality
- ✅ **NEVER batch multiple logical changes** into one commit
- ✅ **If you're unsure, commit** - smaller commits are ALWAYS better

## Size Guidelines
- **Ideal**: 1-3 files, <200 lines
- **Acceptable**: <500 lines for complex features
- **NEVER**: >1000 lines (break into smaller commits)

## Your Task
Check staged files and create an atomic commit:

```bash
#!/bin/bash

# Check staged file count
STAGED_COUNT=$(git diff --cached --name-only | wc -l)
echo "📊 Staged files: $STAGED_COUNT"

if [ "$STAGED_COUNT" -eq 0 ]; then
  echo "❌ No files staged for commit"
  echo "   Use 'git add <file>' to stage files"
  exit 1
fi

COMMIT_TYPE="${1:-feat}"
MESSAGE="${2:-update}"

# Create commit (pre-commit hook will run quality checks)
echo "📝 Creating commit..."
git commit -m "${COMMIT_TYPE}: ${MESSAGE}

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "💡 Use 'npm run git:status:summary' to verify"
```

## Notes

- Pre-commit hook automatically runs quality checks (lint + tests)
- Pre-commit hook warns if more than 3 files are staged
- Each commit should represent one logical change
- Split large changes into multiple atomic commits
- Use `git commit --no-verify` to skip hooks if absolutely necessary