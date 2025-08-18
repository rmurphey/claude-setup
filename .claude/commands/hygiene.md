---
allowed-tools: [Bash]
description: Project health check - code quality, tests, dependencies, and git status
approach: script-delegation
token-cost: ~150 (vs ~2000 for direct implementation)
best-for: Quick daily health checks
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

# Check CI status
echo "📊 GitHub Actions Status:"
node scripts/check-ci.js
echo ""

# Quick hygiene check using npm scripts
npm run hygiene:full --silent

echo ""
echo "💡 For detailed analysis, run individual checks:"
echo "  npm run lint:check      - Code quality"
echo "  npm run test:check      - Test status" 
echo "  npm run deps:check      - Dependencies"
echo "  npm run maintain:debt   - Technical debt"
echo "  gh run list            - Full CI history"
```

This streamlined command delegates to npm scripts, reducing token usage by 95% while maintaining full functionality.

## Notes

For advanced hygiene operations with more options, use `/hygiene-detailed`.