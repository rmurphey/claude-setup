---
allowed-tools: [Read, Write, Bash]
description: Capture insights and learnings from development work
---

# Learn Command

Capture and organize insights, learnings, and knowledge gained during development work for future reference and team sharing.

## Context
- Learning entries: !`find . -name "LEARNINGS.md" -o -name ".claude/learnings/*" | wc -l | xargs`+ files
- Recent insights: !`grep -c "^##" LEARNINGS.md 2>/dev/null || echo "0"`+ topics
- Last entry: !`tail -1 LEARNINGS.md 2>/dev/null | grep "Date:" | cut -d: -f2 | xargs || echo "none"`

## Your Task
Document insights, discoveries, and learnings for knowledge retention and sharing:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-interactive}"
shift
ARGS="$*"

# Ensure learnings directory exists
mkdir -p .claude/learnings

case "$COMMAND" in
  "add"|"new"|"capture")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a learning topic or insight"
      echo "Usage: /learn add <insight or topic>"
      exit 1
    fi
    
    INSIGHT="$ARGS"
    DATE=$(date '+%Y-%m-%d')
    TIME=$(date '+%H:%M')
    
    echo "📝 Capturing learning: $INSIGHT"
    
    # Create or update LEARNINGS.md
    if [ ! -f "LEARNINGS.md" ]; then
      cat > LEARNINGS.md << 'EOF'
# Project Learnings

Captured insights, discoveries, and knowledge gained during development.

## Table of Contents
- [Recent Learnings](#recent-learnings)
- [Technical Insights](#technical-insights)
- [Process Improvements](#process-improvements)
- [Architecture Decisions](#architecture-decisions)
- [Debugging Solutions](#debugging-solutions)
- [Performance Optimizations](#performance-optimizations)

---

## Recent Learnings

EOF
    fi
    
    # Add new learning entry
    sed -i.bak '/## Recent Learnings/a\
### '"$INSIGHT"'\\n**Date**: '"$DATE"' at '"$TIME"'\\n\\n**Context**: \\n*Add context about what you were working on*\\n\\n**Discovery**: \\n*Describe what you learned or discovered*\\n\\n**Impact**: \\n*How this affects future work or decisions*\\n\\n**Action Items**: \\n- [ ] Apply this learning to similar situations\\n- [ ] Share with team if applicable\\n- [ ] Update documentation if needed\\n\\n---\\n' LEARNINGS.md
    
    echo "✅ Learning entry added to LEARNINGS.md"
    echo "📍 Edit the entry to add context, discovery details, and impact"
    ;;
    
  "bug"|"debug"|"solution")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a bug description or solution"
      echo "Usage: /learn bug <bug description and solution>"
      exit 1
    fi
    
    BUG_SOLUTION="$ARGS"
    DATE=$(date '+%Y-%m-%d')
    FILENAME=".claude/learnings/debug-$(date +%Y%m%d-%H%M).md"
    
    echo "🐛 Documenting debug solution: $BUG_SOLUTION"
    
    cat > "$FILENAME" << EOF
# Debug Solution: $BUG_SOLUTION

**Date**: $DATE
**Category**: Debugging

## Problem
Describe the bug or issue you encountered:

## Root Cause
What was causing the problem:

## Solution
How you solved it:

## Prevention
How to prevent this issue in the future:

## Related Files
Files that were modified:
- 

## Commands Used
\`\`\`bash
# Commands that helped solve the issue
\`\`\`

## References
- Links to documentation
- Stack Overflow answers
- GitHub issues

---
*Captured with /learn debug command*
EOF
    
    echo "✅ Debug solution template created: $FILENAME"
    echo "📝 Fill in the details about the problem and solution"
    ;;
    
  "performance"|"perf"|"optimization")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a performance insight"
      echo "Usage: /learn performance <optimization description>"
      exit 1
    fi
    
    PERF_INSIGHT="$ARGS"
    DATE=$(date '+%Y-%m-%d')
    FILENAME=".claude/learnings/performance-$(date +%Y%m%d-%H%M).md"
    
    echo "⚡ Documenting performance insight: $PERF_INSIGHT"
    
    cat > "$FILENAME" << EOF
# Performance Optimization: $PERF_INSIGHT

**Date**: $DATE
**Category**: Performance

## Baseline Metrics
*Before optimization measurements*
- Metric 1: 
- Metric 2: 

## Optimization Applied
Describe what you changed:

## Results
*After optimization measurements*
- Metric 1: 
- Metric 2: 
- Improvement: 

## Code Changes
\`\`\`
// Show key code changes
\`\`\`

## Lessons Learned
- Key insight 1
- Key insight 2

## Applicability
Where else this optimization could be applied:

---
*Captured with /learn performance command*
EOF
    
    echo "✅ Performance learning template created: $FILENAME"
    ;;
    
  "process"|"workflow"|"method")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a process improvement"
      echo "Usage: /learn process <process improvement description>"
      exit 1
    fi
    
    PROCESS_INSIGHT="$ARGS"
    DATE=$(date '+%Y-%m-%d')
    FILENAME=".claude/learnings/process-$(date +%Y%m%d-%H%M).md"
    
    echo "🔄 Documenting process insight: $PROCESS_INSIGHT"
    
    cat > "$FILENAME" << EOF
# Process Improvement: $PROCESS_INSIGHT

**Date**: $DATE
**Category**: Process/Workflow

## Previous Approach
How things were done before:

## New Approach
What changed and why:

## Benefits
- Benefit 1
- Benefit 2

## Implementation
Steps to implement this improvement:
1. Step 1
2. Step 2

## Tools/Commands
\`\`\`bash
# Useful commands for this process
\`\`\`

## Metrics
How to measure success:

---
*Captured with /learn process command*
EOF
    
    echo "✅ Process learning template created: $FILENAME"
    ;;
    
  "review"|"list"|"show")
    echo "📚 Learning Review"
    echo "================="
    
    if [ ! -f "LEARNINGS.md" ] && [ -z "$(ls .claude/learnings/*.md 2>/dev/null)" ]; then
      echo "No learnings captured yet"
      echo "Use '/learn add <insight>' to start capturing knowledge"
      exit 0
    fi
    
    # Show summary from main learnings file
    if [ -f "LEARNINGS.md" ]; then
      echo "📖 Main Learnings (LEARNINGS.md):"
      grep "^###" LEARNINGS.md | head -5 | sed 's/^###/  •/' || echo "  No entries yet"
      echo ""
    fi
    
    # Show detailed learning files
    if [ -n "$(ls .claude/learnings/*.md 2>/dev/null)" ]; then
      echo "📂 Detailed Learning Files:"
      for learning in .claude/learnings/*.md; do
        if [ -f "$learning" ]; then
          BASENAME=$(basename "$learning" .md)
          TITLE=$(grep "^# " "$learning" | head -1 | sed 's/^# //')
          CATEGORY=$(grep "^\*\*Category\*\*:" "$learning" | cut -d: -f2 | xargs)
          echo "  📄 $BASENAME ($CATEGORY)"
          echo "      $TITLE"
        fi
      done
      echo ""
    fi
    
    # Learning statistics
    TOTAL_LEARNINGS=$([ -f "LEARNINGS.md" ] && grep -c "^###" LEARNINGS.md || echo "0")
    DETAILED_LEARNINGS=$(ls .claude/learnings/*.md 2>/dev/null | wc -l | xargs)
    TOTAL=$((TOTAL_LEARNINGS + DETAILED_LEARNINGS))
    
    echo "📊 Learning Statistics:"
    echo "  Total learnings captured: $TOTAL"
    echo "  Main entries: $TOTAL_LEARNINGS"
    echo "  Detailed files: $DETAILED_LEARNINGS"
    ;;
    
  "search"|"find")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide search term"
      echo "Usage: /learn search <term or topic>"
      exit 1
    fi
    
    SEARCH_TERM="$ARGS"
    echo "🔍 Searching learnings for: $SEARCH_TERM"
    echo "======================================"
    
    FOUND=false
    
    # Search in main learnings
    if [ -f "LEARNINGS.md" ]; then
      MATCHES=$(grep -i "$SEARCH_TERM" LEARNINGS.md | head -3)
      if [ -n "$MATCHES" ]; then
        echo "📖 Found in LEARNINGS.md:"
        echo "$MATCHES" | sed 's/^/  /'
        echo ""
        FOUND=true
      fi
    fi
    
    # Search in detailed files
    for learning in .claude/learnings/*.md; do
      if [ -f "$learning" ] && grep -qi "$SEARCH_TERM" "$learning"; then
        BASENAME=$(basename "$learning" .md)
        TITLE=$(grep "^# " "$learning" | head -1 | sed 's/^# //')
        echo "📄 Found in $BASENAME:"
        echo "    $TITLE"
        grep -i "$SEARCH_TERM" "$learning" | head -2 | sed 's/^/    /'
        echo ""
        FOUND=true
      fi
    done
    
    if [ "$FOUND" = false ]; then
      echo "No learnings found matching: $SEARCH_TERM"
    fi
    ;;
    
  "help"|"--help"|"-h")
    cat << 'EOF'
Learn Command Help

USAGE:
  /learn [command] [arguments]

COMMANDS:
  add, new, capture <insight>     Add general learning or insight
  bug, debug, solution <desc>     Document debugging solution
  performance, perf <insight>     Capture performance optimization
  process, workflow <improvement> Document process improvement
  review, list, show             Review captured learnings
  search, find <term>            Search through learnings
  help                           Show this help

EXAMPLES:
  /learn add "React hooks cleanup prevents memory leaks"
  /learn bug "Fixed infinite loop in useEffect dependency array"
  /learn performance "Memoization reduced render time by 60%"
  /learn process "Using /commit command improved code quality"
  /learn search "memory leak"

FILES CREATED:
  LEARNINGS.md                   Main learning log
  .claude/learnings/*.md         Detailed learning files

INTEGRATION:
  Use with /reflect for session summaries
  Reference in /design for architecture decisions
  Link from /todo for learning-based tasks
EOF
    ;;
    
  "interactive"|"")
    echo "🎓 Learning Capture Assistant"
    echo "============================="
    echo ""
    echo "What type of learning would you like to capture?"
    echo ""
    echo "📝 Quick Options:"
    echo "  /learn add \"insight\"        General insight or discovery"
    echo "  /learn bug \"description\"    Debugging solution"
    echo "  /learn performance \"desc\"   Performance optimization"
    echo "  /learn process \"improvement\" Workflow improvement"
    echo ""
    echo "📚 Review Options:"
    echo "  /learn review               See all captured learnings"
    echo "  /learn search \"term\"        Find specific learnings"
    echo ""
    echo "💡 Tip: Regular learning capture builds valuable knowledge base"
    ;;
    
  *)
    echo "❌ Unknown learn command: $COMMAND"
    echo "Use '/learn help' for available commands"
    exit 1
    ;;
esac

# Clean up backup files
rm -f LEARNINGS.md.bak

echo ""
echo "💡 Use '/learn review' to see all learnings, '/reflect' for session insights"
```

## Features
- **Multiple Learning Types**: General insights, debugging solutions, performance optimizations, process improvements
- **Structured Templates**: Pre-formatted templates for different learning categories
- **Search Functionality**: Find specific learnings by keyword
- **Knowledge Organization**: Main log file plus detailed individual files
- **Integration Ready**: Links with `/reflect`, `/design`, and `/todo` commands
- **Progress Tracking**: Statistics on learning capture over time

## Learning Categories
- **General Insights**: Broad discoveries and realizations
- **Debug Solutions**: Specific bug fixes and troubleshooting approaches
- **Performance**: Optimization techniques and results
- **Process Improvements**: Workflow and methodology enhancements