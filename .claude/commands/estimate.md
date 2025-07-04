---
allowed-tools: [Read]
description: Development cost estimation for tasks
---

# Development Cost Estimation

## Context
- Project codebase: @bin/ @templates/ @docs/
- Recent development velocity: !`git log --oneline --since="2 weeks ago" | wc -l`
- Current complexity: @package.json

## Your task
Provide a development cost estimate for the specified task using structured analysis:

**Estimation Framework**:

1. **Complexity Analysis**:
   - **Simple**: Configuration changes, documentation updates
   - **Moderate**: New features with existing patterns
   - **Complex**: New architecture, external integrations
   - **Very Complex**: Major refactoring, new paradigms

2. **Size Categories**:
   - **Small**: 1-2 hours (bug fixes, minor updates)
   - **Medium**: 2-8 hours (new features, moderate changes)
   - **Large**: 1-3 days (significant features, refactoring)
   - **X-Large**: 3+ days (major features, architecture changes)

3. **Risk Factors**:
   - Unknown dependencies
   - External API integrations
   - Breaking changes required
   - Testing complexity

**Output Format**:
```
📊 COST ESTIMATE: {Task Description}

Size: {Small/Medium/Large/X-Large}
Effort: {time range}
Confidence: {High/Medium/Low}

🔍 ANALYSIS:
• Complexity: {reasoning}
• Dependencies: {what's needed}
• Risk Factors: {potential issues}

💡 RECOMMENDATIONS:
• {approach suggestions}
• {ways to reduce risk/effort}
```