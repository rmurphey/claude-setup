---
allowed-tools: [Bash, Read]
description: Claude usage cost estimation for development tasks
---

# Claude Usage Estimation Command

Estimate Claude interaction costs and usage patterns for better project planning and budget management.

## Context
- Project phase: !`grep -q "package.json" . && echo "development" || echo "setup"`
- Complexity: !`find . -name "*.js" -o -name "*.ts" | wc -l | xargs`+ code files
- Recent activity: !`git log --since="1 week ago" --oneline | wc -l | xargs`+ commits this week

## Your Task
Provide Claude usage estimates for different types of development tasks:

```bash
#!/bin/bash

# Parse command arguments
TASK_TYPE="${1:-interactive}"
COMPLEXITY="${2:-medium}"
ARGS="${*:3}"

# Base cost estimates (messages)
declare -A BASE_COSTS
BASE_COSTS["bug-fix-simple"]=8
BASE_COSTS["bug-fix-medium"]=25
BASE_COSTS["bug-fix-complex"]=60
BASE_COSTS["feature-small"]=35
BASE_COSTS["feature-medium"]=85
BASE_COSTS["feature-large"]=200
BASE_COSTS["refactor-small"]=20
BASE_COSTS["refactor-medium"]=65
BASE_COSTS["refactor-large"]=150
BASE_COSTS["testing-setup"]=40
BASE_COSTS["testing-coverage"]=60
BASE_COSTS["documentation"]=25
BASE_COSTS["architecture"]=120
BASE_COSTS["debugging-session"]=45
BASE_COSTS["code-review"]=15
BASE_COSTS["learning-research"]=30

case "$TASK_TYPE" in
  "bug"|"fix"|"debug")
    echo "🐛 Bug Fix Estimation"
    echo "====================="
    echo ""
    echo "Estimated Claude usage for bug fixes:"
    echo ""
    echo "Simple bug (obvious cause, 1-2 files):"
    echo "  • Messages: 5-15 (avg: ${BASE_COSTS["bug-fix-simple"]})"
    echo "  • Time: 30-60 minutes"
    echo "  • Examples: Typo fix, missing import, simple logic error"
    echo ""
    echo "Medium bug (investigation needed, 3-5 files):"
    echo "  • Messages: 15-40 (avg: ${BASE_COSTS["bug-fix-medium"]})"
    echo "  • Time: 1-2 hours"
    echo "  • Examples: State management issue, API integration bug"
    echo ""
    echo "Complex bug (deep investigation, multiple systems):"
    echo "  • Messages: 40-100 (avg: ${BASE_COSTS["bug-fix-complex"]})"
    echo "  • Time: 3-6 hours"
    echo "  • Examples: Race condition, memory leak, performance issue"
    ;;
    
  "feature"|"feat")
    echo "✨ Feature Development Estimation"
    echo "=================================="
    echo ""
    echo "Estimated Claude usage for feature development:"
    echo ""
    echo "Small feature (single component/function):"
    echo "  • Messages: 20-50 (avg: ${BASE_COSTS["feature-small"]})"
    echo "  • Time: 2-4 hours"
    echo "  • Examples: New button, form field, utility function"
    echo ""
    echo "Medium feature (multiple components, basic logic):"
    echo "  • Messages: 50-120 (avg: ${BASE_COSTS["feature-medium"]})"
    echo "  • Time: 1-2 days"
    echo "  • Examples: User profile page, search functionality"
    echo ""
    echo "Large feature (complex system, multiple integrations):"
    echo "  • Messages: 120-300 (avg: ${BASE_COSTS["feature-large"]})"
    echo "  • Time: 3-7 days"
    echo "  • Examples: Authentication system, payment integration"
    ;;
    
  "refactor"|"cleanup")
    echo "🔧 Refactoring Estimation"
    echo "========================="
    echo ""
    echo "Estimated Claude usage for refactoring:"
    echo ""
    echo "Small refactor (single file/function):"
    echo "  • Messages: 10-30 (avg: ${BASE_COSTS["refactor-small"]})"
    echo "  • Time: 1-2 hours"
    echo "  • Examples: Extract function, rename variables"
    echo ""
    echo "Medium refactor (module restructure):"
    echo "  • Messages: 40-90 (avg: ${BASE_COSTS["refactor-medium"]})"
    echo "  • Time: 4-8 hours"
    echo "  • Examples: Component split, API reorganization"
    echo ""
    echo "Large refactor (architectural changes):"
    echo "  • Messages: 100-200 (avg: ${BASE_COSTS["refactor-large"]})"
    echo "  • Time: 2-4 days"
    echo "  • Examples: State management migration, framework update"
    ;;
    
  "test"|"testing")
    echo "🧪 Testing Estimation"
    echo "====================="
    echo ""
    echo "Estimated Claude usage for testing:"
    echo ""
    echo "Test setup (framework configuration):"
    echo "  • Messages: 25-55 (avg: ${BASE_COSTS["testing-setup"]})"
    echo "  • Time: 2-3 hours"
    echo "  • Examples: Jest setup, test utilities, mocking"
    echo ""
    echo "Test coverage (writing tests for existing code):"
    echo "  • Messages: 30-90 (avg: ${BASE_COSTS["testing-coverage"]})"
    echo "  • Time: 1-2 days"
    echo "  • Examples: Unit tests, integration tests"
    ;;
    
  "docs"|"documentation")
    echo "📚 Documentation Estimation"
    echo "============================"
    echo ""
    echo "Estimated Claude usage for documentation:"
    echo ""
    echo "API documentation:"
    echo "  • Messages: 15-35 (avg: ${BASE_COSTS["documentation"]})"
    echo "  • Time: 2-4 hours"
    echo ""
    echo "README updates:"
    echo "  • Messages: 10-20"
    echo "  • Time: 1-2 hours"
    echo ""
    echo "Architecture documentation:"
    echo "  • Messages: 60-180 (avg: ${BASE_COSTS["architecture"]})"
    echo "  • Time: 1-3 days"
    ;;
    
  "session"|"daily")
    echo "📅 Session Estimation"
    echo "===================="
    echo ""
    echo "Typical daily Claude usage patterns:"
    echo ""
    echo "Light development day:"
    echo "  • Messages: 20-50"
    echo "  • Focus: Bug fixes, small features, maintenance"
    echo ""
    echo "Active development day:"
    echo "  • Messages: 50-120"
    echo "  • Focus: Feature development, refactoring"
    echo ""
    echo "Intensive development day:"
    echo "  • Messages: 120-250"
    echo "  • Focus: Complex features, architectural changes"
    echo ""
    echo "Learning/Research day:"
    echo "  • Messages: 30-80"
    echo "  • Focus: New technologies, debugging complex issues"
    ;;
    
  "project"|"total")
    echo "🎯 Project Estimation"
    echo "====================="
    echo ""
    echo "Full project Claude usage estimates:"
    echo ""
    echo "Small project (1-2 weeks):"
    echo "  • Total messages: 200-600"
    echo "  • Daily average: 30-60"
    echo "  • Examples: Simple web app, utility tool"
    echo ""
    echo "Medium project (1-2 months):"
    echo "  • Total messages: 800-2000"
    echo "  • Daily average: 40-80"
    echo "  • Examples: Full-stack application, API service"
    echo ""
    echo "Large project (3-6 months):"
    echo "  • Total messages: 2000-5000"
    echo "  • Daily average: 50-100"
    echo "  • Examples: Enterprise application, platform"
    ;;
    
  "cost"|"pricing")
    echo "💰 Cost Analysis"
    echo "================="
    echo ""
    echo "Claude usage cost factors:"
    echo ""
    echo "Message complexity impact:"
    echo "  • Simple queries: Lower token usage"
    echo "  • Code generation: Medium token usage"
    echo "  • Complex debugging: Higher token usage"
    echo "  • Architecture discussions: Highest token usage"
    echo ""
    echo "Efficiency tips:"
    echo "  • Use specific, focused questions"
    echo "  • Provide context upfront"
    echo "  • Break large tasks into smaller ones"
    echo "  • Use /hygiene and /next for quick checks"
    echo ""
    echo "Cost optimization:"
    echo "  • Batch related questions"
    echo "  • Use templates and patterns"
    echo "  • Learn common patterns to reduce repetition"
    ;;
    
  "track"|"actual")
    echo "📊 Usage Tracking"
    echo "=================="
    echo ""
    echo "Track your actual Claude usage:"
    echo ""
    
    # Try to find usage tracking in project files
    if [ -f ".claude/usage.log" ]; then
      echo "📈 Your usage statistics:"
      TOTAL_MESSAGES=$(wc -l < .claude/usage.log)
      RECENT_MESSAGES=$(tail -7 .claude/usage.log | wc -l)
      echo "  Total messages: $TOTAL_MESSAGES"
      echo "  Recent messages (7 days): $RECENT_MESSAGES"
      echo ""
    else
      echo "💡 Usage tracking not set up yet."
      echo ""
      echo "To start tracking:"
      echo "  mkdir -p .claude"
      echo "  echo \"$(date): estimate command\" >> .claude/usage.log"
      echo ""
    fi
    
    echo "Estimation vs Reality:"
    echo "  • Track estimates vs actual usage"
    echo "  • Adjust future estimates based on patterns"
    echo "  • Identify high-usage task types"
    ;;
    
  "help"|"--help"|"-h")
    cat << 'EOF'
Claude Usage Estimation Command Help

USAGE:
  /estimate [task-type] [complexity]

TASK TYPES:
  bug, fix, debug          Bug fixing estimates
  feature, feat           Feature development estimates
  refactor, cleanup       Refactoring estimates
  test, testing           Testing-related estimates
  docs, documentation     Documentation estimates
  session, daily          Daily usage patterns
  project, total          Full project estimates
  cost, pricing           Cost analysis and tips
  track, actual           Usage tracking

COMPLEXITY LEVELS:
  simple, small, low      Lower end of estimates
  medium, normal          Average estimates (default)
  complex, large, high    Higher end of estimates

EXAMPLES:
  /estimate bug medium           Estimate bug fix usage
  /estimate feature large        Estimate complex feature
  /estimate session             Daily usage patterns
  /estimate project             Full project estimates
  /estimate cost                Cost optimization tips

PURPOSE:
- Budget Claude usage for projects
- Plan development timelines
- Optimize interaction efficiency
- Track actual vs estimated usage
EOF
    ;;
    
  "interactive"|"")
    echo "📊 Claude Usage Estimation"
    echo "==========================="
    echo ""
    echo "What would you like to estimate?"
    echo ""
    echo "🎯 Common Estimates:"
    echo "  /estimate bug            Bug fixing patterns"
    echo "  /estimate feature        Feature development"
    echo "  /estimate session        Daily usage patterns"
    echo "  /estimate project        Full project estimates"
    echo ""
    echo "💰 Cost Analysis:"
    echo "  /estimate cost           Cost factors and optimization"
    echo "  /estimate track          Usage tracking setup"
    echo ""
    echo "📚 All Options:"
    echo "  /estimate help           Complete command reference"
    ;;
    
  *)
    echo "❌ Unknown task type: $TASK_TYPE"
    echo "Use '/estimate help' for available options"
    exit 1
    ;;
esac

echo ""
echo "💡 Tips:"
echo "  • Start with lower estimates and adjust based on experience"
echo "  • Complex tasks often need 1.5-2x initial estimates"
echo "  • Use /next to optimize task order and efficiency"
```

## Features
- **Task-Based Estimates**: Specific estimates for different development activities
- **Complexity Scaling**: Adjusts estimates based on task complexity
- **Usage Patterns**: Daily and project-level usage guidance
- **Cost Optimization**: Tips for efficient Claude interaction
- **Reality Tracking**: Compare estimates with actual usage

## Estimation Categories
- **Development Tasks**: Features, bug fixes, refactoring
- **Quality Assurance**: Testing, documentation, code review
- **Research & Learning**: Architecture, new technologies
- **Project Planning**: Daily patterns, total project scope