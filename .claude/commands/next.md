---
allowed-tools: [Bash, Read]
description: AI-recommended next priorities based on project state
---

# Next Priority Recommendations

## Context
- Project health: !`npm run lint 2>&1 | grep -c "warning\|error" || echo "0"`
- Test status: !`npm test > /dev/null 2>&1 && echo "passing" || echo "failing"`
- Git status: !`git status --porcelain | wc -l`
- Active work: @internal/ACTIVE_WORK.md
- Recent activity: !`git log --oneline -5`

## Your task
Analyze the current project state and provide prioritized next actions:

1. **Assess Current State**: Review quality metrics, tests, git status
2. **Identify Blockers**: Find any issues preventing development
3. **Prioritize Actions**: Rank recommendations by impact and urgency
4. **Provide Rationale**: Explain why each action is recommended

**Output Format**:
```
🎯 NEXT PRIORITIES ANALYSIS
===========================

📊 Current State:
   • Quality: [summary of lint/test status]
   • Development: [summary of current work]
   • Repository: [git status summary]

💡 Recommended Actions:
🔥 HIGH: [critical items that block development]
📋 MEDIUM: [important improvements]
✅ LOW: [nice-to-have enhancements]

💭 Rationale: [explanation of prioritization]
```