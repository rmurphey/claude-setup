---
allowed-tools: [Bash]
description: Push commands with git-specific options for complex scenarios
---

# Push Detailed Command

Git push operations for complex scenarios - branch management, force pushing, and upstream tracking.

## When to Use This
- Force pushing (safely)
- Pushing to different branches
- Setting upstream tracking
- Handling push rejections

## Your Task
Choose the appropriate git push operation:

### Standard Push with Upstream
```bash
# First push to new branch
git push -u origin $(git branch --show-current)
```

### Force Push (Safe)
```bash
# Use --force-with-lease for safety
git push --force-with-lease
```

### Push to Different Branch
```bash
# Push current branch to different remote branch
git push origin $(git branch --show-current):target-branch-name
```

### Push All Branches
```bash
# Push all local branches
git push --all origin
```

### Push Tags
```bash
# Push tags along with commits
git push --tags
```

## Common Scenarios

**Push was rejected due to remote changes:**
```bash
git pull --rebase
git push
```

**Need to force push but safely:**
```bash
git push --force-with-lease
```

**First push of new branch:**
```bash
git push -u origin feature-branch
```

## Notes
Quality validation happens in CI/CD (GitHub Actions), not locally. These commands focus purely on git operations.

Local commands handle git mechanics. CI/CD handles validation.