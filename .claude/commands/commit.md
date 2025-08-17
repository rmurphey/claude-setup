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
Check staged files and execute quality-checked commit:

```bash
#!/bin/bash

# Check staged file count for atomic commits
STAGED_COUNT=$(git diff --cached --name-only | wc -l)
echo "📊 Staged files: $STAGED_COUNT"

if [ "$STAGED_COUNT" -gt 3 ]; then
  echo "⚠️  Warning: $STAGED_COUNT files staged (recommended: 1-3)"
  echo "   Consider splitting into smaller commits"
  read -p "   Continue anyway? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Use 'git reset HEAD <file>' to unstage files"
    exit 1
  fi
fi

COMMIT_TYPE="${1:-feat}"
MESSAGE="${2:-update}"

# Quality gates
echo "🔍 Running pre-commit checks..."
npm run quality:pre-commit --silent || {
  echo "❌ Quality checks failed. Fix issues and try again."
  echo "   Use 'npm run quality:all' for detailed report"
  exit 1
}

# Create commit
echo "✅ Quality checks passed. Creating commit..."
git commit -m "${COMMIT_TYPE}: ${MESSAGE}

Co-Authored-By: Claude <noreply@anthropic.com>"

echo "💡 Use 'npm run git:status:summary' to verify"
```

## Notes

- Script warns if more than 3 files are staged
- Quality checks run automatically before commit
- Each commit should represent one logical change
- Split large changes into multiple atomic commits