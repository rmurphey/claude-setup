---
allowed-tools: [Bash]
description: Capture insights and learnings from development work
approach: script-delegation
token-cost: ~80 (vs ~500 for direct file management)
best-for: Quick knowledge capture
---

# Learn Command

Efficiently capture and organize development insights.

## Usage

<bash>
#!/bin/bash

# Delegate to learning capture script
node scripts/learn.js "$@"
</bash>

## Notes

Token-efficient command that delegates to `scripts/learn.js` for:
- Capture new insights and learnings
- List and review captured knowledge
- Search through past learnings
- Organize by categories and dates

For advanced learning workflows, see `.claude/commands/detailed/learn-detailed.md`.