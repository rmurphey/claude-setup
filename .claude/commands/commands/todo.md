---
allowed-tools: [Bash, Read, Write]
description: Task management and tracking system with ACTIVE_WORK.md integration
---

# Todo Management Command

Manage tasks efficiently using ACTIVE_WORK.md.

## Your Task
Handle todo operations:

**IMPORTANT**: If adding dates, always use `date "+%Y-%m-%d"` to get the current date. Never guess or assume dates.

```bash
#!/bin/bash

COMMAND="${1:-list}"
shift
ARGS="$*"

case "$COMMAND" in
  "list"|"show")
    echo "📋 Current Tasks:"
    npm run todo:list --silent
    echo ""
    npm run todo:count --silent
    ;;
    
  "add")
    echo "➕ Adding task: $ARGS"
    echo "- [ ] $ARGS" >> ACTIVE_WORK.md
    echo "✅ Task added"
    ;;
    
  "done")
    LINE_NUM="$1"
    echo "✅ Completing task #$LINE_NUM"
    sed -i.bak "${LINE_NUM}s/\\[ \\]/[x]/" ACTIVE_WORK.md && rm ACTIVE_WORK.md.bak
    ;;
    
  *)
    echo "Usage: /todo [list|add|done] [args]"
    ;;
esac
```

## Notes

This command delegates to npm scripts for token efficiency.