---
allowed-tools: [Bash]
description: Push commits to remote repository
---

# Push Command

Simple, fast push for routine development workflow.

## Your Task
Push commits to remote:

```bash
git push
```

That's it! For routine pushing, this is all you need.

## Advanced Options
For complex git scenarios, use `/push-detailed` which includes:
- Force push with `--force-with-lease`
- Push to different branches
- Upstream tracking setup
- Handling push rejections

## Philosophy
- **Local commands**: Handle git operations
- **CI/CD (GitHub Actions)**: Handle quality validation
- **Clear separation**: Don't duplicate CI/CD validation locally

When you say "push", you want to push. Let CI/CD handle the quality checks.