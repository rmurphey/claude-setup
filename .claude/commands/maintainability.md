---
allowed-tools: [Bash, Read]
description: Comprehensive maintainability assessment
---

# Maintainability Assessment

## Context
- Code quality: !`npm run lint`
- Test coverage: !`npm run test:coverage`
- Dependencies: @package.json
- Documentation: @README.md @docs/
- Git history: !`git log --oneline -20`

## Your task
Conduct a comprehensive maintainability assessment with scoring:

**Assessment Categories** (25 points each):

1. **Code Quality** (25 pts):
   - Lint warnings/errors
   - Code complexity
   - Consistent patterns
   - Error handling

2. **Test Coverage** (25 pts):
   - Test percentage
   - Test quality
   - Coverage gaps
   - Test maintainability

3. **Documentation** (25 pts):
   - README completeness
   - Code comments
   - API documentation
   - Setup instructions

4. **Repository Health** (25 pts):
   - Commit message quality
   - Branch organization
   - Issue tracking
   - Dependency freshness

**Scoring Scale**:
- 90-100: Excellent
- 80-89: Good
- 70-79: Needs Improvement
- <70: Poor

**Output Format**:
```
🔍 MAINTAINABILITY ASSESSMENT

📊 SCORES:
• Code Quality: {score}/25 - {status}
• Test Coverage: {score}/25 - {status}
• Documentation: {score}/25 - {status}
• Repository Health: {score}/25 - {status}

🎯 OVERALL: {total}/100 - {grade}

🔧 IMPROVEMENT RECOMMENDATIONS:
• {specific actionable items}
• {priority order}

📈 NEXT STEPS:
• {immediate actions}
• {long-term goals}
```