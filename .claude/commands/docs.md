---
allowed-tools: [Bash]
description: Self-updating documentation generation and maintenance
---

# Documentation Command

Maintain and update project documentation efficiently.

## Usage

<bash>
#!/bin/bash

COMMAND="${1:-help}"
TARGET="${2:-all}"

case "$COMMAND" in
  "update")
    echo "📝 Updating documentation: $TARGET"
    npm run docs:update -- --target="$TARGET" --silent
    ;;
    
  "validate")
    echo "✅ Validating documentation..."
    npm run docs:validate --silent
    ;;
    
  "check-citations")
    echo "🔍 Checking citations..."
    npm run docs:citations --silent
    ;;
    
  *)
    echo "📚 Documentation Commands:"
    echo "  /docs update [target]     - Update documentation"
    echo "  /docs validate           - Validate all docs"
    echo "  /docs check-citations    - Verify citations"
    echo ""
    echo "Targets: all, readme, best-practices, patterns, commands"
    ;;
esac
</bash>

## Notes

This is the minimal version. For advanced documentation operations, use the detailed version in `.claude/commands/detailed/docs.md`.