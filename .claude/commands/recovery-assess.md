---
allowed-tools: [Bash, Read, Glob]
description: Comprehensive codebase health assessment
---

# Codebase Recovery Assessment

## Context
- Project files: !`find . -type f -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" | head -20`
- Package configuration: @package.json @pyproject.toml @go.mod @Cargo.toml @pom.xml
- Test coverage: !`npm run test:coverage 2>/dev/null || echo "No coverage available"`
- Lint status: !`npm run lint 2>/dev/null || eslint . 2>/dev/null || echo "No linting configured"`
- Git history: !`git log --oneline -10`
- File sizes: !`find . -name "*.js" -o -name "*.ts" -o -name "*.py" | xargs wc -l | sort -nr | head -10`

## Your task
Perform a comprehensive codebase health assessment across these dimensions:

### 1. Code Quality Analysis (25 points)
**Analyze**:
- Complexity metrics (functions >15 complexity, files >400 lines)
- Code smell detection (duplicate code, long methods, large classes)
- Dependency violations and circular dependencies
- Error handling consistency

**Scoring**:
- 20-25: Excellent (minimal debt)
- 15-19: Good (manageable debt) 
- 10-14: Needs Improvement (significant debt)
- 0-9: Poor (major refactoring needed)

### 2. Test Coverage & Quality (25 points)
**Analyze**:
- Test coverage percentage and gaps
- Test quality (unit vs integration vs e2e)
- Test maintainability and readability
- CI/CD test integration

### 3. Architecture & Structure (25 points)
**Analyze**:
- Module organization and coupling
- Separation of concerns
- Consistent patterns usage
- API design quality

### 4. Documentation & Maintainability (25 points)
**Analyze**:
- Code comments and documentation
- README and setup instructions
- API documentation completeness
- Development guides and contributing docs

## Output Format
```
🏥 CODEBASE HEALTH ASSESSMENT

📊 OVERALL SCORE: {total}/100 - {EXCELLENT/GOOD/NEEDS_IMPROVEMENT/POOR}

🔍 DETAILED ANALYSIS:
• Code Quality: {score}/25 - {status}
  - {specific findings}
• Test Coverage: {score}/25 - {status}  
  - {specific findings}
• Architecture: {score}/25 - {status}
  - {specific findings}
• Documentation: {score}/25 - {status}
  - {specific findings}

🚨 CRITICAL ISSUES:
• {high-priority problems that block development}

⚠️  SIGNIFICANT ISSUES:
• {medium-priority problems affecting productivity}

💡 QUICK WINS:
• {easy fixes that provide immediate value}

🎯 RECOVERY RECOMMENDATIONS:
• {prioritized list of improvement actions}

📈 ESTIMATED RECOVERY EFFORT:
• Quick Wins: {timeframe}
• Foundation: {timeframe}  
• Structural: {timeframe}
• Total: {timeframe}
```

**Next Steps**: After assessment, use `/recovery-plan` to generate detailed improvement roadmap.