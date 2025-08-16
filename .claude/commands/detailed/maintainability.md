---
allowed-tools: [Bash, Read]
description: Code maintainability analysis and improvement recommendations
---

# Maintainability Analysis Command

Comprehensive code maintainability analysis focusing on complexity, technical debt, and long-term code health indicators.

## Context
- Code files: !`find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | wc -l | xargs`+ JS/TS files
- Average file size: !`find . -name "*.js" -o -name "*.ts" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 | awk '{print int($1/NR)}' || echo "0"`+ lines per file
- TODO comments: !`find . -name "*.js" -o -name "*.ts" | xargs grep -c "TODO\|FIXME\|XXX" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}'`+ items

## Your Task
Analyze code maintainability across multiple dimensions and provide actionable improvement recommendations:

```bash
#!/bin/bash

# Parse command arguments
ANALYSIS_TYPE="${1:-overview}"
TARGET="${2}"

# Function to analyze file complexity
analyze_file_complexity() {
  echo "📊 File Complexity Analysis"
  echo "============================"
  echo ""
  
  # Find code files
  CODE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | grep -v dist | grep -v build)
  
  if [ -z "$CODE_FILES" ]; then
    echo "No JavaScript/TypeScript files found"
    return 1
  fi
  
  TOTAL_FILES=$(echo "$CODE_FILES" | wc -l | xargs)
  echo "📁 Analyzing $TOTAL_FILES code files..."
  echo ""
  
  # File size analysis
  echo "📏 File Size Distribution:"
  echo "$CODE_FILES" | while read -r file; do
    if [ -f "$file" ]; then
      LINES=$(wc -l < "$file")
      echo "$LINES:$file"
    fi
  done | sort -nr | head -10 | while IFS=: read -r lines file; do
    if [ "$lines" -gt 500 ]; then
      echo "  🔴 $file: $lines lines (very large - consider splitting)"
    elif [ "$lines" -gt 300 ]; then
      echo "  🟡 $file: $lines lines (large - monitor growth)"
    elif [ "$lines" -gt 100 ]; then
      echo "  🟢 $file: $lines lines (good size)"
    fi
  done
  
  echo ""
  
  # Function complexity (basic heuristic)
  echo "🔧 Function Complexity Indicators:"
  COMPLEX_FUNCTIONS=$(echo "$CODE_FILES" | xargs grep -n "function\|=>" 2>/dev/null | wc -l | xargs)
  NESTED_BLOCKS=$(echo "$CODE_FILES" | xargs grep -c "if.*if\|for.*for\|while.*while" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  
  echo "  Total functions/arrows: $COMPLEX_FUNCTIONS"
  echo "  Nested control structures: $NESTED_BLOCKS"
  
  if [ "$NESTED_BLOCKS" -gt 20 ]; then
    echo "  ⚠️  High nesting detected - consider refactoring for readability"
  fi
  
  echo ""
}

# Function to analyze technical debt
analyze_technical_debt() {
  echo "🔧 Technical Debt Analysis"
  echo "=========================="
  echo ""
  
  # TODO/FIXME analysis
  echo "📝 Code Annotations:"
  TODO_COUNT=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "TODO" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  FIXME_COUNT=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "FIXME" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  XXX_COUNT=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "XXX" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  
  TOTAL_DEBT_MARKERS=$((TODO_COUNT + FIXME_COUNT + XXX_COUNT))
  
  echo "  TODO comments: $TODO_COUNT"
  echo "  FIXME comments: $FIXME_COUNT"  
  echo "  XXX comments: $XXX_COUNT"
  echo "  Total debt markers: $TOTAL_DEBT_MARKERS"
  
  if [ "$TOTAL_DEBT_MARKERS" -gt 50 ]; then
    echo "  🔴 High technical debt - prioritize cleanup"
  elif [ "$TOTAL_DEBT_MARKERS" -gt 20 ]; then
    echo "  🟡 Moderate technical debt - monitor and address"
  elif [ "$TOTAL_DEBT_MARKERS" -gt 0 ]; then
    echo "  🟢 Low technical debt - good maintenance"
  else
    echo "  ✅ No debt markers found"
  fi
  
  echo ""
  
  # Show some examples of technical debt
  if [ "$TOTAL_DEBT_MARKERS" -gt 0 ]; then
    echo "📋 Recent Technical Debt Items:"
    find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | xargs grep -n "TODO\|FIXME\|XXX" 2>/dev/null | head -5 | sed 's/^/  /'
    echo ""
  fi
  
  # Deprecated patterns/anti-patterns
  echo "⚠️  Code Pattern Analysis:"
  
  # Check for common anti-patterns
  LONG_PARAM_LISTS=$(find . -name "*.js" -o -name "*.ts" | xargs grep -c "function.*,.*,.*,.*,.*," 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  DEEP_NESTING=$(find . -name "*.js" -o -name "*.ts" | xargs grep -c "        if\|        for\|        while" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  MAGIC_NUMBERS=$(find . -name "*.js" -o -name "*.ts" | xargs grep -c "[^a-zA-Z][0-9][0-9][0-9]" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  
  echo "  Long parameter lists (5+): $LONG_PARAM_LISTS"
  echo "  Deep nesting (4+ levels): $DEEP_NESTING"  
  echo "  Potential magic numbers: $MAGIC_NUMBERS"
  
  echo ""
}

# Function to analyze dependencies and coupling
analyze_dependencies() {
  echo "📦 Dependency Analysis"
  echo "======================"
  echo ""
  
  if [ -f "package.json" ]; then
    # Dependency count
    DEPS_COUNT=$(grep -c '".*":' package.json 2>/dev/null || echo "0")
    DEV_DEPS_COUNT=$(sed -n '/devDependencies/,/}/p' package.json | grep -c '".*":' 2>/dev/null || echo "0")
    PROD_DEPS_COUNT=$(sed -n '/dependencies/,/devDependencies/p' package.json | grep -c '".*":' 2>/dev/null || echo "0")
    
    echo "📊 Package Dependencies:"
    echo "  Production dependencies: $PROD_DEPS_COUNT"
    echo "  Development dependencies: $DEV_DEPS_COUNT"
    echo "  Total dependencies: $DEPS_COUNT"
    
    if [ "$DEPS_COUNT" -gt 100 ]; then
      echo "  🔴 Very high dependency count - audit for necessity"
    elif [ "$DEPS_COUNT" -gt 50 ]; then
      echo "  🟡 High dependency count - monitor for bloat"
    else
      echo "  🟢 Reasonable dependency count"
    fi
    
    echo ""
    
    # Check for outdated dependencies
    echo "🔄 Dependency Health:"
    if command -v npm >/dev/null; then
      OUTDATED_COUNT=$(npm outdated 2>/dev/null | wc -l | xargs)
      if [ "$OUTDATED_COUNT" -gt 0 ]; then
        echo "  Outdated packages: $OUTDATED_COUNT"
        echo "  Run 'npm outdated' for details"
      else
        echo "  ✅ All dependencies up to date"
      fi
    fi
    
    # Security check
    if command -v npm >/dev/null; then
      AUDIT_ISSUES=$(npm audit 2>/dev/null | grep -c "found.*vulnerabilit" || echo "0")
      if [ "$AUDIT_ISSUES" -gt 0 ]; then
        echo "  🚨 Security vulnerabilities found"
        echo "  Run 'npm audit' for details"
      else
        echo "  ✅ No known security vulnerabilities"
      fi
    fi
  else
    echo "No package.json found"
  fi
  
  echo ""
  
  # Import/coupling analysis
  echo "🔗 Code Coupling Analysis:"
  IMPORT_COUNT=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "^import\|require(" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  RELATIVE_IMPORTS=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | xargs grep -c "from '\\.\\./\\.\\./\\.\\./'" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  
  echo "  Total imports: $IMPORT_COUNT"
  echo "  Deep relative imports (3+ levels): $RELATIVE_IMPORTS"
  
  if [ "$RELATIVE_IMPORTS" -gt 10 ]; then
    echo "  ⚠️  Many deep imports detected - consider path aliases"
  fi
  
  echo ""
}

# Function to analyze test coverage and quality
analyze_test_coverage() {
  echo "🧪 Test Coverage Analysis"
  echo "========================="
  echo ""
  
  # Test file analysis
  TEST_FILES=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l | xargs)
  CODE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | grep -v node_modules | grep -v test | grep -v spec | wc -l | xargs)
  
  echo "📊 Test File Statistics:"
  echo "  Test files: $TEST_FILES"
  echo "  Code files: $CODE_FILES"
  
  if [ "$CODE_FILES" -gt 0 ]; then
    TEST_RATIO=$(( TEST_FILES * 100 / CODE_FILES ))
    echo "  Test file ratio: ${TEST_RATIO}%"
    
    if [ "$TEST_RATIO" -lt 30 ]; then
      echo "  🔴 Low test coverage - consider adding more tests"
    elif [ "$TEST_RATIO" -lt 60 ]; then
      echo "  🟡 Moderate test coverage - room for improvement"
    else
      echo "  🟢 Good test file coverage"
    fi
  fi
  
  echo ""
  
  # Run actual test coverage if available
  if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "🎯 Running Coverage Analysis..."
    if timeout 60s npm run test -- --coverage >/dev/null 2>&1; then
      echo "  ✅ Tests executed successfully"
      echo "  Check coverage report for detailed metrics"
    else
      echo "  ⚠️  Tests failed or timed out"
    fi
  else
    echo "  No test script configured in package.json"
  fi
  
  echo ""
}

# Function to generate maintainability score
calculate_maintainability_score() {
  echo "🏆 Maintainability Score"
  echo "========================"
  echo ""
  
  local score=100
  local issues=0
  
  # File size penalty
  LARGE_FILES=$(find . -name "*.js" -o -name "*.ts" | xargs wc -l 2>/dev/null | awk '$1 > 400 {print $2}' | wc -l | xargs)
  if [ "$LARGE_FILES" -gt 5 ]; then
    score=$((score - 15))
    issues=$((issues + 1))
    echo "  ❌ File Size: Many large files detected (-15 points)"
  elif [ "$LARGE_FILES" -gt 0 ]; then
    score=$((score - 5))
    echo "  ⚠️  File Size: Some large files (-5 points)"
  else
    echo "  ✅ File Size: Good file sizes"
  fi
  
  # Technical debt penalty
  DEBT_MARKERS=$(find . -name "*.js" -o -name "*.ts" | xargs grep -c "TODO\|FIXME\|XXX" 2>/dev/null | awk -F: '{sum+=$2} END {print sum+0}')
  if [ "$DEBT_MARKERS" -gt 50 ]; then
    score=$((score - 20))
    issues=$((issues + 1))
    echo "  ❌ Technical Debt: High debt markers (-20 points)"
  elif [ "$DEBT_MARKERS" -gt 20 ]; then
    score=$((score - 10))
    echo "  ⚠️  Technical Debt: Moderate debt markers (-10 points)"
  elif [ "$DEBT_MARKERS" -gt 0 ]; then
    score=$((score - 2))
    echo "  ✅ Technical Debt: Low debt markers (-2 points)"
  else
    echo "  ✅ Technical Debt: No debt markers found"
  fi
  
  # Dependency health
  if [ -f "package.json" ]; then
    DEPS_COUNT=$(grep -c '".*":' package.json 2>/dev/null || echo "0")
    if [ "$DEPS_COUNT" -gt 100 ]; then
      score=$((score - 10))
      issues=$((issues + 1))
      echo "  ❌ Dependencies: Too many dependencies (-10 points)"
    elif [ "$DEPS_COUNT" -gt 50 ]; then
      score=$((score - 5))
      echo "  ⚠️  Dependencies: Many dependencies (-5 points)"
    else
      echo "  ✅ Dependencies: Reasonable count"
    fi
  fi
  
  # Test coverage
  TEST_FILES=$(find . -name "*.test.*" -o -name "*.spec.*" | wc -l | xargs)
  CODE_FILES=$(find . -name "*.js" -o -name "*.ts" | grep -v test | grep -v spec | wc -l | xargs)
  
  if [ "$CODE_FILES" -gt 0 ]; then
    TEST_RATIO=$(( TEST_FILES * 100 / CODE_FILES ))
    if [ "$TEST_RATIO" -lt 30 ]; then
      score=$((score - 15))
      issues=$((issues + 1))
      echo "  ❌ Test Coverage: Low test coverage (-15 points)"
    elif [ "$TEST_RATIO" -lt 60 ]; then
      score=$((score - 8))
      echo "  ⚠️  Test Coverage: Moderate coverage (-8 points)"
    else
      echo "  ✅ Test Coverage: Good coverage"
    fi
  fi
  
  echo ""
  echo "🎯 Overall Maintainability Score: $score/100"
  
  if [ "$score" -ge 90 ]; then
    echo "🏆 Excellent - Your code is highly maintainable!"
  elif [ "$score" -ge 80 ]; then
    echo "👍 Good - Minor improvements could help"  
  elif [ "$score" -ge 70 ]; then
    echo "⚠️  Fair - Several areas need attention"
  elif [ "$score" -ge 60 ]; then
    echo "🚨 Poor - Significant maintainability issues"
  else
    echo "💀 Critical - Major refactoring needed"
  fi
  
  echo ""
  echo "🎯 Priority Actions ($issues critical issues):"
  if [ "$issues" -eq 0 ]; then
    echo "  🎉 No critical issues - maintain current quality!"
  else
    echo "  📋 Focus on addressing the issues marked with ❌ above"
    echo "  📈 Use /learn to document maintainability improvements"
    echo "  🔄 Run this analysis regularly to track progress"
  fi
}

case "$ANALYSIS_TYPE" in
  "complexity"|"files")
    analyze_file_complexity
    ;;
    
  "debt"|"technical-debt")
    analyze_technical_debt
    ;;
    
  "dependencies"|"deps")
    analyze_dependencies
    ;;
    
  "tests"|"coverage")
    analyze_test_coverage
    ;;
    
  "score"|"rating")
    calculate_maintainability_score
    ;;
    
  "full"|"complete")
    analyze_file_complexity
    echo ""
    analyze_technical_debt
    echo ""
    analyze_dependencies
    echo ""
    analyze_test_coverage
    echo ""
    calculate_maintainability_score
    ;;
    
  "help"|"--help"|-h)
    cat << 'EOF'
Maintainability Analysis Command Help

USAGE:
  /maintainability [analysis-type] [target]

ANALYSIS TYPES:
  overview (default)    Complete maintainability analysis
  complexity, files     File size and complexity analysis
  debt, technical-debt  Technical debt and code annotations
  dependencies, deps    Dependency health and coupling
  tests, coverage      Test coverage and quality
  score, rating        Calculate maintainability score
  full, complete       All analyses (detailed)
  help                 Show this help

EXAMPLES:
  /maintainability              Full maintainability overview
  /maintainability complexity   Focus on file complexity
  /maintainability debt         Analyze technical debt
  /maintainability score        Get maintainability rating

ANALYSIS DIMENSIONS:
- File complexity and size distribution
- Technical debt markers (TODO, FIXME, XXX)
- Dependency health and coupling
- Test coverage and quality
- Code pattern analysis
- Overall maintainability score (0-100)

RECOMMENDATIONS:
- Files should be <400 lines for good maintainability
- Keep technical debt markers under control
- Maintain reasonable dependency counts
- Aim for good test coverage ratios
- Regular analysis helps track improvements

INTEGRATION:
  Use with /learn to document improvement strategies
  Reference in /design for architectural decisions
  Track progress over time with regular analysis
EOF
    ;;
    
  "overview"|""|*)
    echo "🔧 Code Maintainability Overview"
    echo "================================"
    echo ""
    
    # Quick overview of all dimensions
    analyze_file_complexity | head -15
    echo ""
    analyze_technical_debt | head -15  
    echo ""
    analyze_dependencies | head -15
    echo ""
    calculate_maintainability_score
    
    echo ""
    echo "💡 For detailed analysis:"
    echo "  /maintainability full      - Complete detailed analysis"
    echo "  /maintainability debt      - Focus on technical debt"
    echo "  /maintainability complexity - File complexity details"
    ;;
esac

echo ""
echo "🔄 Run maintainability analysis regularly to track code health trends"
```

## Features
- **Multi-Dimensional Analysis**: Examines complexity, technical debt, dependencies, and test coverage
- **Quantitative Scoring**: Provides 0-100 maintainability score with clear criteria
- **Technical Debt Tracking**: Identifies and quantifies TODO/FIXME/XXX markers
- **Dependency Health**: Analyzes package dependencies and coupling patterns
- **Actionable Recommendations**: Specific suggestions for improvement
- **Progress Tracking**: Regular analysis to monitor improvement trends

## Analysis Dimensions
- **File Complexity**: Size distribution, nesting levels, function complexity
- **Technical Debt**: Code annotations, anti-patterns, deprecated practices  
- **Dependencies**: Package count, outdated libraries, security vulnerabilities
- **Test Coverage**: Test-to-code ratios, coverage metrics
- **Code Patterns**: Import coupling, magic numbers, parameter complexity