---
allowed-tools: [Bash]
description: Code maintainability analysis and improvement recommendations
---

# Maintainability Analysis Command

Analyze code health and maintainability metrics using npm scripts.

## Your Task
Run maintainability analysis:

```bash
#!/bin/bash

echo "🔧 Code Maintainability Analysis"
echo "================================="
echo ""

# Overview metrics
echo "📊 Project Overview:"
npm run stats:project --silent
echo ""

# File analysis
echo "📁 Largest Files:"
npm run maintain:largest --silent
echo ""

# Technical debt
echo "🔧 Technical Debt:"
npm run maintain:debt --silent
echo ""

# Dependencies
echo "📦 Dependencies:"
npm run deps:count --silent
echo ""

# Summary
echo "📈 Maintainability Summary:"
npm run maintain:summary --silent
```

## Notes

For advanced maintainability analysis with more options, use `/maintainability-detailed`.