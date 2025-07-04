---
allowed-tools: [Edit, Bash]
description: Capture development insights in LEARNINGS.md
---

# Capture Development Insight

## Context
- Current learnings file: @internal/LEARNINGS.md
- Current git commit: !`git rev-parse --short HEAD`

## Your task
Add the user's insight to internal/LEARNINGS.md under a new heading with:

1. **Timestamp and summary**: `### YYYY-MM-DD HH:MM - {brief description}`
2. **Full insight**: `**Insight**: {user's insight}`
3. **Context**: `**Context**: Commit {SHA}`
4. **Pattern identification**: If applicable, note if this relates to existing patterns

**Template**:
```markdown
### 2025-01-04 14:30 - {Brief Summary}
**Insight**: {Full insight description}
**Context**: Commit {git SHA}
**Pattern**: {If this relates to existing patterns or represents new learning}
```

Confirm completion with:
```
✅ Added insight to internal/LEARNINGS.md:
   {insight summary}
```