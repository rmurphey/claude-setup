---
allowed-tools: [Bash, Read]
description: Project health check and quality metrics
---

# Project Health Check

## Context
- Current lint status: !`npm run lint`
- Test results: !`npm test`
- Git status: !`git status --porcelain`
- Documentation status: @internal/ACTIVE_WORK.md

## Your task
Analyze the project's current health and provide recommendations:

1. **Quality Metrics**: Review lint and test results
2. **Git Status**: Check for uncommitted changes
3. **Documentation**: Verify ACTIVE_WORK.md is current
4. **Recommendations**: Suggest next actions based on findings

Provide output in this format:
```
🔍 PROJECT HEALTH: [GOOD/NEEDS ATTENTION/POOR]
• ESLint: [status and count]
• Tests: [pass/fail status with coverage if available]
• Git: [clean/uncommitted changes count]
• Docs: [current/outdated status]

RECOMMENDATIONS:
→ [specific actionable items]
```