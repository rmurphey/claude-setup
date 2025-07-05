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

1. **Claude Code Usage Categories**:
   - **Light**: 10-50 messages (simple config, docs, bug fixes)
   - **Moderate**: 50-150 messages (new features, refactoring)
   - **Heavy**: 150-400 messages (complex features, architecture)
   - **Intensive**: 400+ messages (major projects, deep analysis)

2. **Developer Effort (Secondary)**:
   - **Small**: 1-2 hours active coding
   - **Medium**: 2-8 hours active coding
   - **Large**: 1-3 days active coding
   - **X-Large**: 3+ days active coding

3. **Claude Interaction Patterns**:
   - **Planning**: 5-15 messages (design, architecture planning)
   - **Implementation**: 20-100 messages (coding, debugging, iteration)
   - **Testing**: 10-30 messages (test creation, validation)
   - **Documentation**: 5-20 messages (README, comments, guides)
   - **Debugging**: 10-50 messages (troubleshooting, fixes)

4. **Cost Factors**:
   - Code complexity and size
   - Required research/learning
   - Testing requirements
   - Documentation needs

**Output Format**:
```
📊 COST ESTIMATE: {Task Description}

💬 Claude Usage: {Light/Moderate/Heavy/Intensive} (~X messages)
⏰ Dev Effort: {Small/Medium/Large/X-Large} (~X hours)
🎯 Confidence: {High/Medium/Low}

🔍 BREAKDOWN:
• Planning: X messages (design, architecture)
• Implementation: X messages (coding, debugging)
• Testing: X messages (test creation, validation)
• Documentation: X messages (README, guides)

⚠️ RISK FACTORS:
• {potential issues affecting Claude usage}
• {complexity factors}

💡 OPTIMIZATION:
• {ways to reduce Claude message usage}
• {efficiency recommendations}

💰 ESTIMATED COST: ~$X (based on Claude pricing)
```