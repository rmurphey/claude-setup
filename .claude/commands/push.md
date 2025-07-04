---
allowed-tools: [Bash]
description: Create commits from changes and push to remote
---

# Create Commit and Push

## Context
- Current git status: !`git status`
- Recent commits: !`git log --oneline -3`

## Your task
Handle the complete commit and push workflow:

1. **Check Status**: Review current working tree state
2. **Create Commit**: Generate appropriate commit message based on changes
3. **Push Changes**: Push to remote repository

**Process**:
1. Stage all relevant changes with `git add`
2. Generate commit message describing the changes
3. Create commit with Claude co-author
4. Push to remote with appropriate branch

**Commit Message Format**:
```
Update {changed files summary}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Confirmation**:
```
✅ Changes committed and pushed successfully
📦 {commit SHA}: {commit message}
```