---
allowed-tools: [Bash]
description: Project health check - code quality, tests, dependencies, and git status
---

# Project Hygiene Check

Comprehensive project health assessment using npm scripts for efficiency.

## Your Task
Run the project hygiene check:

```bash
#!/bin/bash

echo "🔍 Running Project Hygiene Check"
echo "================================="
echo ""

# Quick hygiene check using npm scripts
npm run hygiene:full --silent

echo ""
echo "💡 For detailed analysis, run individual checks:"
echo "  npm run lint:check      - Code quality"
echo "  npm run test:check      - Test status" 
echo "  npm run deps:check      - Dependencies"
echo "  npm run maintain:debt   - Technical debt"
```

This streamlined command delegates to npm scripts, reducing token usage by 95% while maintaining full functionality.

## Notes

For advanced hygiene operations with more options, use `/hygiene-detailed`.