---
allowed-tools: [Bash]
description: Capture current session with metadata for future analysis
---

# Session Retrospective Capture

Capture the current development session with metadata for pattern analysis and learning extraction.

## Your Task
Save the current session with comprehensive metadata:

```bash
#!/bin/bash

echo "📝 Capturing session for retrospective analysis..."

# Use session history script to capture with metadata
npm run session:save "retrospective-$(date +%Y%m%d-%H%M)" --silent

echo "✅ Session captured with metadata"
echo ""
echo "📊 For deep analysis and insights:"
echo "Use the session-retrospective agent to analyze your captured sessions and extract development patterns."
echo ""
echo "📁 Session files saved to session-history/$(date +%Y-%m-%d)/"
```

## What This Captures
- **Session Transcript**: Complete conversation history
- **Metadata**: Claude version, timestamp, environment
- **Context**: Current project state and session focus
- **File Structure**: Organized by date for easy retrieval

## When to Use
- End of productive development sessions
- After completing major features or fixes
- Before taking breaks or switching contexts
- Weekly to maintain session history

## For Analysis
After capturing sessions, use the **session-retrospective agent** for:
- Pattern analysis across multiple sessions
- Learning extraction and documentation
- Development workflow insights
- Productivity optimization recommendations

## Philosophy
This command handles the **routine task** of session capture. The **intelligence work** of analyzing patterns and extracting insights is handled by the session-retrospective agent.