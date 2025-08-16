---
allowed-tools: [Bash]
description: Project health check - code quality, tests, dependencies, and git status
---

# Project Hygiene Check

Comprehensive project health assessment covering code quality, dependencies, tests, and repository status.

## Context
- Quality Level: !`grep "Quality Level:" CLAUDE.md 2>/dev/null | cut -d: -f2 | xargs || echo "not configured"`
- Test Coverage: !`npm test -- --coverage 2>/dev/null | grep "All files" | grep -o "[0-9.]*%" | head -1 || echo "unknown"`
- Git Status: !`git status --porcelain | wc -l | xargs`+ files changed
- Dependencies: !`npm outdated --depth=0 2>/dev/null | wc -l | xargs`+ outdated packages

## Your Task
Run a comprehensive project health check covering all critical development areas:

### 1. Code Quality Check
```bash
echo "🔍 Running code quality checks..."

# Lint check
if [ -f "package.json" ] && grep -q "lint" package.json; then
  echo "Running linter..."
  npm run lint 2>&1 | head -20
elif [ -f "eslint.config.js" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  echo "Running ESLint..."
  npx eslint . --max-warnings 10 2>&1 | head -20
else
  echo "⚠️  No linting configuration found"
fi

echo ""

# Type checking
if [ -f "tsconfig.json" ]; then
  echo "Running TypeScript check..."
  npx tsc --noEmit 2>&1 | head -10
fi
```

### 2. Test Status
```bash
echo "🧪 Checking test status..."

if [ -f "package.json" ] && grep -q "test" package.json; then
  echo "Running tests..."
  npm test 2>&1 | tail -10
else
  echo "⚠️  No test script configured"
fi

echo ""
```

### 3. Dependencies Health
```bash
echo "📦 Checking dependencies..."

# Security audit
if command -v npm >/dev/null 2>&1; then
  echo "Security audit:"
  npm audit --audit-level high 2>/dev/null | head -10 || echo "No vulnerabilities or npm not available"
  
  echo ""
  
  echo "Outdated packages:"
  npm outdated --depth=0 2>/dev/null | head -10 || echo "All packages up to date"
fi

echo ""
```

### 4. Git Repository Status
```bash
echo "🌿 Git status check..."

# Working directory status
echo "Working directory:"
git status --porcelain | head -10

echo ""

# Branch information
echo "Branch info:"
echo "  Current: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "  Commits ahead: $(git rev-list --count @{u}..HEAD 2>/dev/null || echo '0')"
echo "  Commits behind: $(git rev-list --count HEAD..@{u} 2>/dev/null || echo '0')"

echo ""

# Recent commits
echo "Recent commits:"
git log --oneline -5 2>/dev/null || echo "No git history"

echo ""
```

### 5. Project Structure Health
```bash
echo "📁 Project structure check..."

# Check for essential files
essential_files=("README.md" "CLAUDE.md" "package.json")
missing_files=()

for file in "${essential_files[@]}"; do
  if [ ! -f "$file" ]; then
    missing_files+=("$file")
  fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
  echo "⚠️  Missing essential files: ${missing_files[*]}"
else
  echo "✅ All essential files present"
fi

echo ""

# Check directory structure
echo "Directory structure:"
ls -la | head -15

echo ""
```

### 6. Development Environment
```bash
echo "🛠️  Development environment..."

# Node.js version if applicable
if command -v node >/dev/null 2>&1; then
  echo "Node.js: $(node --version)"
fi

# Package manager
if [ -f "package-lock.json" ]; then
  echo "Package manager: npm ($(npm --version))"
elif [ -f "yarn.lock" ]; then
  echo "Package manager: yarn ($(yarn --version 2>/dev/null || echo 'not available'))"
fi

# Other tooling
if [ -f "tsconfig.json" ]; then
  echo "TypeScript: configured"
fi

if [ -f "eslint.config.js" ] || [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  echo "ESLint: configured"
fi

if [ -f ".gitignore" ]; then
  echo "Git ignore: configured"
fi

echo ""
```

### 7. Build Status (if applicable)
```bash
echo "🏗️  Build check..."

if [ -f "package.json" ] && grep -q "build" package.json; then
  echo "Testing build process..."
  npm run build >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ Build successful"
  else
    echo "❌ Build failed - run 'npm run build' for details"
  fi
else
  echo "No build script configured"
fi

echo ""
```

## Health Score Summary
```bash
echo "🏥 HYGIENE REPORT SUMMARY"
echo "========================"

score=0
total=7

# Code quality (lint + types)
if npm run lint >/dev/null 2>&1 || npx eslint . --max-warnings 10 >/dev/null 2>&1; then
  echo "✅ Code quality: PASS"
  score=$((score + 1))
else
  echo "❌ Code quality: FAIL"
fi

# Tests
if npm test >/dev/null 2>&1; then
  echo "✅ Tests: PASS"
  score=$((score + 1))
else
  echo "❌ Tests: FAIL"
fi

# Dependencies
if npm audit --audit-level high >/dev/null 2>&1; then
  echo "✅ Dependencies: SECURE"
  score=$((score + 1))
else
  echo "⚠️  Dependencies: ISSUES FOUND"
fi

# Git clean
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ Git status: CLEAN"
  score=$((score + 1))
else
  echo "⚠️  Git status: UNCOMMITTED CHANGES"
fi

# Essential files
if [ -f "README.md" ] && [ -f "CLAUDE.md" ]; then
  echo "✅ Documentation: PRESENT"
  score=$((score + 1))
else
  echo "❌ Documentation: MISSING"
fi

# Build
if [ ! -f "package.json" ] || ! grep -q "build" package.json || npm run build >/dev/null 2>&1; then
  echo "✅ Build: OK"
  score=$((score + 1))
else
  echo "❌ Build: FAILING"
fi

# Environment
if command -v node >/dev/null 2>&1; then
  echo "✅ Environment: READY"
  score=$((score + 1))
else
  echo "❌ Environment: MISSING TOOLS"
fi

echo ""
echo "OVERALL HEALTH: $score/$total ($(( score * 100 / total ))%)"

if [ $score -eq $total ]; then
  echo "🎉 Excellent! Your project is in great shape."
elif [ $score -ge $((total * 3 / 4)) ]; then
  echo "👍 Good project health with minor issues to address."
elif [ $score -ge $((total / 2)) ]; then
  echo "⚠️  Project needs attention - several issues to resolve."
else
  echo "🚨 Project requires immediate attention - multiple critical issues."
fi

echo ""
echo "💡 Use other commands to address issues:"
echo "   /commit - Make quality-checked commits"
echo "   /docs - Update documentation"  
echo "   /todo - Track issues to fix"
```

## Next Steps Recommendations
Based on the health check results, the command provides specific recommendations for improving project health and suggests other commands that can help address identified issues.