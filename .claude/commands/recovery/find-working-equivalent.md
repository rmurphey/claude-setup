---
allowed-tools: [Grep, Read, Bash]
description: Comparison-driven debugging - find similar working code for efficient debugging
---

# Find Working Equivalent - Comparison-Driven Debugging

Locate similar working code for comparison-driven debugging - the core principle of efficient debugging.

## Context
- Current directory: !`pwd`
- Recent changes: !`git diff --name-only HEAD~1 | head -5`
- Project structure: !`find . -type d -maxdepth 2 | grep -E "(src|lib|components)" | head -5`

## Your Task

Execute comparison-driven debugging by finding and analyzing working equivalent functionality:

### Process
1. **Identify broken functionality**
2. **Find similar working code** in same class/module  
3. **Compare approaches side-by-side**
4. **Copy working pattern** to broken location
5. **Test once to verify fix**

### Finding Working Equivalents

```bash
echo "🔍 Searching for working equivalent patterns..."

# Find similar method patterns
echo "Looking for similar methods/functions:"
grep -r "function.*similar_name\|method.*similar_name" src/ lib/ components/ 2>/dev/null | head -10

# Find similar class patterns  
echo "Looking for similar classes:"
grep -r "class.*Similar\|interface.*Similar" src/ lib/ components/ 2>/dev/null | head -5

# Find similar test patterns
echo "Looking for working test patterns:"
grep -r "describe\|it\|test" **/*test* **/*spec* 2>/dev/null | grep -i "similar_functionality" | head -5
```

### Comparison Analysis

```bash
echo "📊 Analyzing differences between working and broken code..."

# Compare file structures
echo "File structure comparison:"
ls -la broken_area/ working_area/ 2>/dev/null || echo "Manual comparison needed"

# Look for pattern differences
echo "Pattern differences to investigate:"
echo "- Method signatures"
echo "- Import statements" 
echo "- Configuration differences"
echo "- Data flow patterns"
```

## Anti-Patterns to Avoid
- ❌ Don't debug mysteries when working solutions exist
- ❌ Don't rewrite methods, just change data source  
- ❌ Don't add new methods, just fix existing ones
- ❌ Don't assume the problem is complex

## Codebase Structure Reference
```bash
echo "🏗️ Common working code locations:"
find . -type f -name "*.js" -o -name "*.ts" | grep -E "(src|lib|components)" | head -10
```

## Success Criteria
- Found working equivalent in <2 minutes
- Identified key difference in <3 minutes  
- Applied fix and tested in <5 minutes total
- Used systematic comparison, not assumption-driven debugging

Use proven patterns instead of extensive troubleshooting.