---
allowed-tools: [Bash, Read, Write]
description: Session reflection and insights capture
---

# Reflect Command

Capture session insights, learnings, and progress for continuous improvement and knowledge retention.

## Context  
- Session duration: !`ps -o etime= $$`+ (current shell)
- Files changed: !`git status --porcelain | wc -l | xargs`+ uncommitted
- Active work: !`grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo "0"`+ tasks pending

## Your Task
Facilitate session reflection and insight capture:

```bash
#!/bin/bash

COMMAND="${1:-session}"
shift
ARGS="$*"

mkdir -p .claude/reflections

case "$COMMAND" in
  "session"|"today"|"")
    DATE=$(date '+%Y-%m-%d')
    TIME=$(date '+%H:%M')
    REFLECTION_FILE=".claude/reflections/session-$DATE-$(date +%H%M).md"
    
    echo "🤔 Session Reflection: $(date '+%Y-%m-%d %H:%M')"
    echo "================================="
    
    cat > "$REFLECTION_FILE" << EOF
# Session Reflection - $DATE at $TIME

## Session Overview
**Duration**: Started around [TIME]
**Focus Areas**: 
- Primary focus: 
- Secondary activities:

## Accomplishments
- [x] Major achievement 1
- [x] Minor wins
- [x] Progress made

## Challenges Encountered
1. **Challenge**: Description
   - **Approach**: How you tackled it
   - **Outcome**: Result
   - **Learning**: Key insight

## Key Learnings
- **Technical**: What you learned about code/technology
- **Process**: What you learned about workflow/methods
- **Tools**: New tools or better ways to use existing ones

## Code Quality & Health
- **Quality checks**: Run /hygiene? Results?
- **Tests**: Test coverage improved? New tests added?
- **Documentation**: What documentation was created/updated?

## Claude Interaction Insights
- **Most helpful**: Which Claude interactions were most valuable?
- **Efficiency**: What patterns worked well?
- **Improvements**: How could Claude interactions be more effective?

## Tomorrow's Priorities
Based on today's work:
1. **High Priority**: 
2. **Medium Priority**: 
3. **Low Priority**: 

## Questions & Research Items
- Question 1: 
- Research topic:
- Investigation needed:

## Session Rating
**Productivity** (1-5): ⭐⭐⭐⭐⭐
**Learning** (1-5): ⭐⭐⭐⭐⭐  
**Code Quality** (1-5): ⭐⭐⭐⭐⭐

**Overall Satisfaction**: 
**What made today successful**: 
**What could be improved**: 

---
*Reflection captured with /reflect command*
EOF

    echo "📝 Reflection template created: $REFLECTION_FILE"
    echo "📖 Edit the file to add your insights and learnings"
    ;;
    
  "quick"|"brief")
    echo "⚡ Quick Reflection Capture"
    echo "=========================="
    
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a quick reflection"
      echo "Usage: /reflect quick <brief insight or learning>"
      exit 1
    fi
    
    DATE=$(date '+%Y-%m-%d %H:%M')
    INSIGHT="$ARGS"
    
    # Add to main reflections log
    echo "[$DATE] $INSIGHT" >> .claude/reflections/quick-insights.log
    
    echo "✅ Quick insight captured: $INSIGHT"
    ;;
    
  "week"|"weekly")
    echo "📅 Weekly Reflection"
    echo "==================="
    
    WEEK_START=$(date -d 'last monday' '+%Y-%m-%d' 2>/dev/null || date -v -1w -v +1d '+%Y-%m-%d' 2>/dev/null)
    WEEK_FILE=".claude/reflections/week-$WEEK_START.md"
    
    cat > "$WEEK_FILE" << EOF
# Weekly Reflection - Week of $WEEK_START

## Week Overview
**Main Projects**: 
**Key Objectives**: 
**Achievement Level**: [High/Medium/Low]

## Major Accomplishments
1. **Significant Win**: 
2. **Progress Made**: 
3. **Problems Solved**: 

## Challenges & Obstacles
- **Technical Challenge**: How resolved?
- **Process Issue**: What was learned?
- **Resource Constraint**: How managed?

## Skill Development
**New Skills Acquired**: 
**Skills Improved**: 
**Tools Mastered**: 

## Process Improvements
**Workflow Changes**: 
**Efficiency Gains**: 
**Quality Enhancements**: 

## Team & Collaboration
**Collaboration Highlights**: 
**Communication Improvements**: 
**Knowledge Sharing**: 

## Metrics & Data
- **Commits Made**: $(git log --since="1 week ago" --oneline | wc -l | xargs)
- **Files Changed**: 
- **Test Coverage**: 
- **Documentation Updated**: 

## Next Week Planning
**Priority 1**: 
**Priority 2**: 
**Priority 3**: 

**Experiments to Try**: 
**Skills to Develop**: 

## Reflection Questions
1. What was the most valuable thing learned this week?
2. What would you do differently?
3. What patterns are emerging in your work?
4. How has your approach evolved?

---
*Weekly reflection for continuous improvement*
EOF

    echo "📊 Weekly reflection template created: $WEEK_FILE"
    ;;
    
  "review"|"list"|"history")
    echo "📚 Reflection History"
    echo "===================="
    
    if [ ! -d ".claude/reflections" ] || [ -z "$(ls .claude/reflections/ 2>/dev/null)" ]; then
      echo "No reflections found yet"
      echo "Use '/reflect' to start capturing session insights"
      exit 0
    fi
    
    # Show recent session reflections
    echo "📝 Recent Session Reflections:"
    ls .claude/reflections/session-*.md 2>/dev/null | tail -5 | while read -r file; do
      if [ -f "$file" ]; then
        BASENAME=$(basename "$file" .md)
        DATE_TIME=$(echo "$BASENAME" | sed 's/session-//' | sed 's/-/ at /')
        echo "  📄 $DATE_TIME"
      fi
    done
    
    # Show weekly reflections
    echo ""
    echo "📅 Weekly Reflections:"
    ls .claude/reflections/week-*.md 2>/dev/null | while read -r file; do
      if [ -f "$file" ]; then
        BASENAME=$(basename "$file" .md)
        WEEK=$(echo "$BASENAME" | sed 's/week-//')
        echo "  📊 Week of $WEEK"
      fi
    done
    
    # Show quick insights
    if [ -f ".claude/reflections/quick-insights.log" ]; then
      echo ""
      echo "⚡ Recent Quick Insights:"
      tail -3 .claude/reflections/quick-insights.log | sed 's/^/  /'
    fi
    
    echo ""
    TOTAL_REFLECTIONS=$(ls .claude/reflections/*.md 2>/dev/null | wc -l | xargs)
    QUICK_INSIGHTS=$([ -f ".claude/reflections/quick-insights.log" ] && wc -l < .claude/reflections/quick-insights.log || echo "0")
    echo "📊 Total: $TOTAL_REFLECTIONS detailed reflections, $QUICK_INSIGHTS quick insights"
    ;;
    
  "search"|"find")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide search term"
      echo "Usage: /reflect search <term>"
      exit 1
    fi
    
    SEARCH_TERM="$ARGS"
    echo "🔍 Searching reflections for: $SEARCH_TERM"
    echo "====================================="
    
    FOUND=false
    
    # Search in reflection files
    for reflection in .claude/reflections/*.md; do
      if [ -f "$reflection" ] && grep -qi "$SEARCH_TERM" "$reflection"; then
        BASENAME=$(basename "$reflection" .md)
        echo "📄 Found in $BASENAME:"
        grep -i "$SEARCH_TERM" "$reflection" | head -2 | sed 's/^/    /'
        echo ""
        FOUND=true
      fi
    done
    
    # Search quick insights
    if [ -f ".claude/reflections/quick-insights.log" ]; then
      QUICK_MATCHES=$(grep -i "$SEARCH_TERM" .claude/reflections/quick-insights.log)
      if [ -n "$QUICK_MATCHES" ]; then
        echo "⚡ Found in quick insights:"
        echo "$QUICK_MATCHES" | sed 's/^/    /'
        echo ""
        FOUND=true
      fi
    fi
    
    if [ "$FOUND" = false ]; then
      echo "No reflections found matching: $SEARCH_TERM"
    fi
    ;;
    
  "stats"|"analytics")
    echo "📊 Reflection Analytics"
    echo "======================="
    
    if [ ! -d ".claude/reflections" ]; then
      echo "No reflections data available"
      exit 0
    fi
    
    SESSION_COUNT=$(ls .claude/reflections/session-*.md 2>/dev/null | wc -l | xargs)
    WEEKLY_COUNT=$(ls .claude/reflections/week-*.md 2>/dev/null | wc -l | xargs)
    QUICK_COUNT=$([ -f ".claude/reflections/quick-insights.log" ] && wc -l < .claude/reflections/quick-insights.log || echo "0")
    
    echo "Reflection Statistics:"
    echo "  Session reflections: $SESSION_COUNT"
    echo "  Weekly reflections: $WEEKLY_COUNT"
    echo "  Quick insights: $QUICK_COUNT"
    echo ""
    
    # Recent activity
    if [ "$SESSION_COUNT" -gt 0 ]; then
      RECENT_SESSIONS=$(find .claude/reflections -name "session-*.md" -mtime -7 | wc -l | xargs)
      echo "Recent activity (7 days):"
      echo "  Session reflections: $RECENT_SESSIONS"
      
      if [ "$RECENT_SESSIONS" -gt 0 ]; then
        echo "  Average per week: $RECENT_SESSIONS"
      fi
    fi
    ;;
    
  "help"|"--help"|-h)
    cat << 'EOF'
Reflect Command Help

USAGE:
  /reflect [command] [arguments]

COMMANDS:
  session, today (default)    Create detailed session reflection
  quick, brief <insight>      Capture quick insight or learning
  week, weekly               Create weekly reflection template
  review, list, history      Show reflection history
  search, find <term>        Search through reflections
  stats, analytics           Show reflection statistics
  help                       Show this help

EXAMPLES:
  /reflect                            Start session reflection
  /reflect quick "Learned about React hooks cleanup"
  /reflect week                       Create weekly reflection
  /reflect search "performance"       Find performance-related insights
  /reflect review                     See all reflections

FILES CREATED:
  .claude/reflections/session-*.md    Daily session reflections
  .claude/reflections/week-*.md       Weekly reflections  
  .claude/reflections/quick-insights.log  Quick insights log

PURPOSE:
- Capture learning and insights for retention
- Identify patterns in development work
- Improve processes based on reflection
- Build knowledge base of experiences
- Track personal and project growth

INTEGRATION:
  Use with /learn to build comprehensive knowledge base
  Reference insights in /design and /next commands
  Inform /estimate accuracy with actual experience data
EOF
    ;;
    
  *)
    echo "❌ Unknown reflect command: $COMMAND"
    echo "Use '/reflect help' for available commands"
    exit 1
    ;;
esac

echo ""
echo "🔄 Regular reflection improves learning and development effectiveness"
```

## Features
- **Structured Reflection**: Templates for session, weekly, and quick insights
- **Knowledge Retention**: Searchable history of learnings and experiences
- **Progress Tracking**: Analytics on reflection patterns and frequency
- **Multiple Formats**: Detailed templates and quick capture options
- **Integration**: Links with `/learn` for comprehensive knowledge building
- **Continuous Improvement**: Identifies patterns and areas for growth