---
allowed-tools: [Bash]
description: Quality-checked commit workflow with automatic pre-commit validation
---

# Quality-Checked Commit Command

Create commits with quality validation using npm scripts.

## Your Task
Execute quality-checked commit:

```bash
#!/bin/bash

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