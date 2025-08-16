---
allowed-tools: [Bash]
description: Optimize Claude Code context window usage
---

# Context Management Command

Efficiently manage Claude's context window to prevent token overflow.

## Usage

<bash>
#!/bin/bash

# Delegate to context management script
node scripts/context-manage.js "$@"
</bash>

## Notes

Token-efficient command that delegates to `scripts/context-manage.js` for:
- Monitor context window usage
- Clear and reset conversation context
- Focus on specific code areas
- Optimize for token efficiency

For detailed context strategies, see `.claude/commands/detailed/context-manage-detailed.md`.