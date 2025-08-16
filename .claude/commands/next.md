---
allowed-tools: [Bash, Read]
description: AI-recommended next steps and development priorities
---

# Next Steps Recommendation Command

Intelligent analysis of project state to recommend the most impactful next actions and development priorities.

## Context
- Project health: !`/hygiene 2>/dev/null | grep "OVERALL HEALTH:" | cut -d: -f2 | xargs || echo "unknown"`
- Active tasks: !`grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo "0"`
- Recent commits: !`git log --oneline -5 2>/dev/null | wc -l | xargs || echo "0"`
- Git status: !`git status --porcelain | wc -l | xargs`+ changes

## Your Task
Analyze current project state and provide AI-driven recommendations for next development priorities:

```bash
#!/bin/bash

# Parse command arguments
FOCUS="${1:-all}"
DETAIL="${2:-normal}"

echo "🤖 Analyzing project state for next step recommendations..."
echo "=================================================="
echo ""

# Function to analyze git status and recent activity
analyze_git_context() {
  echo "📊 Repository Analysis"
  echo "---------------------"
  
  # Current branch and status
  CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
  UNCOMMITTED=$(git status --porcelain | wc -l | xargs)
  UNPUSHED=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
  
  echo "Branch: $CURRENT_BRANCH"
  echo "Uncommitted changes: $UNCOMMITTED files"
  echo "Unpushed commits: $UNPUSHED"
  
  if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "⚠️  PRIORITY: Commit pending changes"
    echo "   Use: /commit"
  fi
  
  if [ "$UNPUSHED" -gt 0 ]; then
    echo "📤 RECOMMENDATION: Push committed changes"
    echo "   Use: /push"
  fi
  
  # Analyze recent commit patterns
  echo ""
  echo "Recent commit activity:"
  git log --oneline -5 2>/dev/null | sed 's/^/  /' || echo "  No recent commits"
  
  echo ""
}

# Function to analyze project health
analyze_project_health() {
  echo "🏥 Project Health Analysis"
  echo "-------------------------"
  
  # Check if hygiene command exists and run it
  if [ -f ".claude/commands/hygiene.md" ] || command -v hygiene >/dev/null 2>&1; then
    echo "Running health check..."
    
    # Extract key health indicators
    if [ -f "package.json" ]; then
      # Check for common issues
      if ! npm run lint >/dev/null 2>&1 && ([ -f ".eslintrc.js" ] || [ -f "eslint.config.js" ]); then
        echo "❌ CRITICAL: Code quality issues detected"
        echo "   Use: /hygiene for details, then fix linting errors"
      fi
      
      if [ -f "tsconfig.json" ] && ! npx tsc --noEmit >/dev/null 2>&1; then
        echo "❌ CRITICAL: TypeScript compilation errors"
        echo "   Fix type errors before proceeding"
      fi
      
      if ! npm test >/dev/null 2>&1; then
        echo "⚠️  WARNING: Tests are failing"
        echo "   Investigate test failures and fix"
      fi
    fi
    
    # Check documentation completeness
    if [ ! -f "README.md" ]; then
      echo "📝 RECOMMENDATION: Create README.md"
      echo "   Use: /docs to generate documentation"
    fi
    
    if [ ! -f "CLAUDE.md" ]; then
      echo "🤖 RECOMMENDATION: Set up AI collaboration guidelines"
      echo "   Create CLAUDE.md with project guidelines"
    fi
    
  else
    echo "⚡ Install hygiene command for detailed health analysis"
  fi
  
  echo ""
}

# Function to analyze active work and tasks
analyze_active_work() {
  echo "📋 Active Work Analysis" 
  echo "----------------------"
  
  if [ -f "ACTIVE_WORK.md" ]; then
    PENDING_TASKS=$(grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo "0")
    COMPLETED_TASKS=$(grep -c "^- \[x\]" ACTIVE_WORK.md 2>/dev/null || echo "0")
    
    echo "Active tasks: $PENDING_TASKS pending, $COMPLETED_TASKS completed"
    
    if [ "$PENDING_TASKS" -gt 0 ]; then
      echo ""
      echo "🎯 Next priority tasks:"
      grep "^- \[ \]" ACTIVE_WORK.md | head -3 | sed 's/^- \[ \] /  • /'
      
      if [ "$PENDING_TASKS" -gt 5 ]; then
        echo ""
        echo "⚠️  RECOMMENDATION: Too many active tasks ($PENDING_TASKS)"
        echo "   Focus on completing current tasks before adding new ones"
        echo "   Use: /todo cleanup to organize completed tasks"
      fi
    else
      echo "✅ No active tasks found"
      echo "   Use: /todo add <task> to add next priorities"
    fi
    
    # Check for stale tasks
    if [ -f "ACTIVE_WORK.md" ]; then
      LAST_MODIFIED=$(stat -c %Y "ACTIVE_WORK.md" 2>/dev/null || stat -f %m "ACTIVE_WORK.md" 2>/dev/null || echo "0")
      DAYS_AGO=$(( ($(date +%s) - LAST_MODIFIED) / 86400 ))
      
      if [ "$DAYS_AGO" -gt 7 ]; then
        echo "⏰ RECOMMENDATION: ACTIVE_WORK.md hasn't been updated in $DAYS_AGO days"
        echo "   Review and update task priorities"
      fi
    fi
  else
    echo "📄 No ACTIVE_WORK.md found"
    echo "   RECOMMENDATION: Create task tracking"
    echo "   Use: /todo add <first-task> to get started"
  fi
  
  echo ""
}

# Function to analyze development momentum and suggest priorities
analyze_development_priorities() {
  echo "🚀 Development Priority Analysis"
  echo "--------------------------------"
  
  # Analyze file changes to understand focus areas
  RECENT_FILES=$(git log --name-only --pretty=format: -10 2>/dev/null | sort | uniq -c | sort -nr | head -5)
  
  if [ -n "$RECENT_FILES" ]; then
    echo "Recently changed files (focus areas):"
    echo "$RECENT_FILES" | sed 's/^/  /'
    echo ""
  fi
  
  # Project phase detection
  if [ ! -f "package.json" ] && [ -z "$(ls . 2>/dev/null)" ]; then
    echo "🏗️  PROJECT PHASE: Initial Setup"
    echo "   NEXT STEPS:"
    echo "   1. Choose technology stack"
    echo "   2. Initialize project structure" 
    echo "   3. Set up development environment"
    echo "   4. Create initial documentation"
    
  elif [ -f "package.json" ] && [ ! -f "src/index.js" ] && [ ! -f "src/main.ts" ] && [ ! -d "src" ]; then
    echo "🌱 PROJECT PHASE: Early Development"
    echo "   NEXT STEPS:"
    echo "   1. Create core application structure"
    echo "   2. Implement basic functionality"
    echo "   3. Set up testing framework"
    echo "   4. Add development scripts"
    
  elif [ -d "src" ] && [ -f "package.json" ]; then
    # Analyze package.json for project maturity
    HAS_TESTS=$(grep -q "test" package.json && echo "yes" || echo "no")
    HAS_BUILD=$(grep -q "build" package.json && echo "yes" || echo "no")
    HAS_DEPS=$([ -d "node_modules" ] && echo "yes" || echo "no")
    
    if [ "$HAS_TESTS" = "no" ]; then
      echo "🧪 PRIORITY: Testing Infrastructure Missing"
      echo "   NEXT STEPS:"
      echo "   1. Set up test framework (Jest, Vitest, etc.)"
      echo "   2. Write initial tests for core functionality"
      echo "   3. Add test scripts to package.json"
      echo "   4. Set up test coverage reporting"
      
    elif [ "$HAS_BUILD" = "no" ] && [ -f "tsconfig.json" ]; then
      echo "🏗️  PRIORITY: Build Process Setup"
      echo "   NEXT STEPS:"
      echo "   1. Configure build system (TypeScript, bundler)"
      echo "   2. Add build scripts to package.json"
      echo "   3. Set up development and production builds"
      echo "   4. Configure output directories"
      
    else
      echo "🚀 PROJECT PHASE: Active Development"
      echo "   FOCUS AREAS:"
      
      # Analyze TODO comments in code
      TODO_COUNT=$(find . -name "*.js" -o -name "*.ts" -o -name "*.jsx" -o -name "*.tsx" | xargs grep -l "TODO\|FIXME\|XXX" 2>/dev/null | wc -l | xargs)
      if [ "$TODO_COUNT" -gt 0 ]; then
        echo "   • Address $TODO_COUNT files with TODO comments"
      fi
      
      # Check test coverage if available
      if command -v npm >/dev/null && npm run test >/dev/null 2>&1; then
        echo "   • Maintain/improve test coverage"
      fi
      
      # Check for documentation needs
      if [ ! -f "docs/README.md" ] && [ ! -d "docs" ]; then
        echo "   • Create comprehensive documentation"
      fi
    fi
  fi
  
  echo ""
}

# Function to provide contextual recommendations
provide_contextual_recommendations() {
  echo "🎯 Contextual Recommendations"
  echo "-----------------------------"
  
  # Time-based recommendations
  HOUR=$(date +%H)
  DAY=$(date +%u)  # 1=Monday, 7=Sunday
  
  if [ "$HOUR" -lt 12 ]; then
    echo "🌅 Morning Focus: Start with high-concentration tasks"
    echo "   Recommended: Complex problem solving, architecture decisions"
  elif [ "$HOUR" -lt 17 ]; then
    echo "🌞 Afternoon Productivity: Implementation and testing"
    echo "   Recommended: Feature development, code review, testing"
  else
    echo "🌙 Evening Work: Documentation and planning"  
    echo "   Recommended: Documentation, planning, cleanup tasks"
  fi
  
  # Day-of-week considerations
  if [ "$DAY" -eq 1 ]; then  # Monday
    echo "📅 Week Start: Plan and prioritize for the week"
    echo "   Use: /design for feature planning, /todo for task organization"
  elif [ "$DAY" -eq 5 ]; then  # Friday
    echo "📅 Week End: Wrap up and document progress"
    echo "   Use: /reflect for insights, /docs for documentation updates"
  fi
  
  echo ""
}

# Function to suggest specific commands based on context
suggest_next_commands() {
  echo "⚡ Suggested Next Commands"
  echo "-------------------------"
  
  # Priority-based command suggestions
  if [ "$(git status --porcelain | wc -l)" -gt 0 ]; then
    echo "1. /commit - Commit your pending changes"
  fi
  
  if [ "$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)" -gt 0 ]; then
    echo "2. /push - Push committed changes to remote"
  fi
  
  if [ ! -f "ACTIVE_WORK.md" ] || [ "$(grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo 0)" -eq 0 ]; then
    echo "3. /todo add <task> - Add next priority task"
  fi
  
  if [ -f ".claude/commands/hygiene.md" ]; then
    echo "4. /hygiene - Check project health status"
  fi
  
  # Based on project state
  if [ -f "package.json" ] && ! grep -q "test" package.json; then
    echo "5. /design new testing-setup - Plan testing infrastructure"
  fi
  
  if [ ! -f "README.md" ] || [ "$(wc -l < README.md 2>/dev/null || echo 0)" -lt 10 ]; then
    echo "6. /docs - Update project documentation"
  fi
  
  echo "7. /learn - Document insights from current work"
  echo "8. /reflect - Review session progress and learnings"
  
  echo ""
}

# Main analysis workflow
case "$FOCUS" in
  "git"|"repo"|"repository")
    analyze_git_context
    ;;
    
  "health"|"quality")
    analyze_project_health
    ;;
    
  "tasks"|"todo"|"work")
    analyze_active_work
    ;;
    
  "dev"|"development"|"code")
    analyze_development_priorities
    ;;
    
  "commands"|"cmd")
    suggest_next_commands
    ;;
    
  "help"|"-h"|"--help")
    cat << 'EOF'
Next Steps Recommendation Command Help

USAGE:
  /next [focus] [detail-level]

FOCUS AREAS:
  all          Complete analysis and recommendations (default)
  git          Git repository status and actions
  health       Project health and quality issues
  tasks        Active work and task priorities  
  dev          Development phase and priorities
  commands     Suggested commands for current context

DETAIL LEVELS:
  normal       Standard recommendations (default)
  brief        Quick summary only
  detailed     Comprehensive analysis

EXAMPLES:
  /next                    Full project analysis
  /next git               Focus on git-related next steps
  /next health detailed   Detailed health analysis
  /next commands          Just show suggested commands

INTEGRATION:
- Analyzes ACTIVE_WORK.md for task context
- Uses /hygiene results for health assessment
- Considers git status and recent commits
- Provides time/context-aware recommendations

The command intelligently prioritizes recommendations based on:
- Critical issues (failing builds, uncommitted changes)
- Project phase (setup, development, maintenance)  
- Task backlog and priorities
- Development momentum and focus areas
EOF
    ;;
    
  "all"|""|*)
    # Full analysis (default)
    analyze_git_context
    analyze_project_health  
    analyze_active_work
    analyze_development_priorities
    provide_contextual_recommendations
    suggest_next_commands
    
    echo "🎯 Summary Priority Ranking"
    echo "---------------------------"
    echo "Focus on addressing items in this order:"
    echo "1. Critical issues (failing builds, errors)"
    echo "2. Uncommitted/unpushed work"
    echo "3. High-priority active tasks"
    echo "4. Project health improvements"
    echo "5. New feature development"
    echo "6. Documentation and maintenance"
    echo ""
    echo "💡 Use '/next <focus>' for targeted analysis of specific areas"
    ;;
esac

echo "✨ Analysis complete! Use suggested commands to maintain development momentum."
```

## Features
- **Intelligent Context Analysis**: Examines git status, project health, and active tasks
- **Priority-Based Recommendations**: Ranks suggestions by urgency and impact
- **Project Phase Detection**: Adapts recommendations to project maturity level
- **Time-Aware Suggestions**: Considers time of day and week for optimal task matching
- **Command Integration**: Suggests specific commands for identified needs
- **Multi-Faceted Analysis**: Covers repository status, code quality, task management, and development priorities

## Analysis Dimensions
- **Repository State**: Uncommitted changes, unpushed commits, branch status
- **Project Health**: Code quality, tests, build status, documentation
- **Active Work**: Task priorities, backlog management, completion rates
- **Development Phase**: Setup, early development, active development, maintenance
- **Context Factors**: Time of day, day of week, recent activity patterns