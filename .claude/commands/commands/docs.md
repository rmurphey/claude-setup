---
allowed-tools: [Bash]
description: Documentation maintenance and validation
---

# Documentation Command

Efficiently manage documentation using the dedicated docs script.

## Usage

<bash>
#!/bin/bash

# Delegate to the documentation script
node scripts/docs.js "$@"
</bash>

## Notes

Token-efficient command that delegates to `scripts/docs.js` for:
- Update README badges and stats
- Validate internal links
- Show documentation statistics
- List available commands

For advanced operations, see `.claude/commands/detailed/docs-detailed.md`.