---
allowed-tools: [Bash, Read, Write]
description: Task deferral and backlog management system
---

# Defer Command

Intelligent task deferral system for managing backlog, postponing non-critical work, and maintaining focus on current priorities.

## Context
- Active tasks: !`grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo "0"`+ pending
- Deferred tasks: !`[ -f ".claude/deferred.md" ] && grep -c "^- \[ \]" .claude/deferred.md || echo "0"`+ backlog
- Last review: !`stat -c %y .claude/deferred.md 2>/dev/null | cut -d' ' -f1 || echo "never"`

## Your Task
Manage task deferral and backlog with intelligent priority management:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-list}"
shift
ARGS="$*"

# Ensure deferred tasks directory exists
mkdir -p .claude

case "$COMMAND" in
  "add"|"defer"|"postpone")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a task to defer"
      echo "Usage: /defer add <task description>"
      exit 1
    fi
    
    TASK="$ARGS"
    DATE=$(date '+%Y-%m-%d')
    
    # Create deferred tasks file if it doesn't exist
    if [ ! -f ".claude/deferred.md" ]; then
      cat > .claude/deferred.md << 'EOF'
# Deferred Tasks

Tasks that are postponed for future consideration, organized by priority and category.

## High Priority (Deferred)

## Medium Priority (Deferred) 

## Low Priority (Ideas/Someday)

## Blocked Tasks

---
*Managed with /defer command*
EOF
    fi
    
    # Add task to medium priority section by default
    sed -i.bak '/## Medium Priority (Deferred)/a\
- [ ] '"$TASK"' *(deferred: '"$DATE"')*' .claude/deferred.md
    
    echo "⏸️ Task deferred: $TASK"
    echo "📅 Deferred on: $DATE"
    echo "📝 Added to .claude/deferred.md under Medium Priority"
    ;;
    
  "promote"|"priority"|"urgent")
    if [ -z "$ARGS" ]; then
      echo "Available deferred tasks to promote:"
      grep -n "^- \[ \]" .claude/deferred.md 2>/dev/null | head -5 | sed 's/^/  /' || echo "  No deferred tasks found"
      echo ""
      echo "Usage: /defer promote <task number or text>"
      exit 1
    fi
    
    # Find and promote task to high priority
    if [[ "$ARGS" =~ ^[0-9]+$ ]]; then
      TASK_LINE=$(grep -n "^- \[ \]" .claude/deferred.md | sed -n "${ARGS}p" | cut -d: -f1)
    else
      TASK_LINE=$(grep -n "^- \[ \].*$ARGS" .claude/deferred.md | head -1 | cut -d: -f1)
    fi
    
    if [ -n "$TASK_LINE" ]; then
      TASK_TEXT=$(sed -n "${TASK_LINE}p" .claude/deferred.md)
      # Remove from current location
      sed -i.bak "${TASK_LINE}d" .claude/deferred.md
      # Add to high priority section
      sed -i "/## High Priority (Deferred)/a\\$TASK_TEXT" .claude/deferred.md
      
      echo "⬆️ Task promoted to high priority"
      echo "📝 Task: $(echo "$TASK_TEXT" | sed 's/^- \[ \] //')"
    else
      echo "❌ Task not found: $ARGS"
    fi
    ;;
    
  "activate"|"undefer"|"restore")
    if [ -z "$ARGS" ]; then
      echo "Available deferred tasks to activate:"
      grep -n "^- \[ \]" .claude/deferred.md 2>/dev/null | head -10 | sed 's/^/  /' || echo "  No deferred tasks found"
      echo ""
      echo "Usage: /defer activate <task number or text>"
      exit 1
    fi
    
    # Find and move task back to active work
    if [[ "$ARGS" =~ ^[0-9]+$ ]]; then
      TASK_LINE=$(grep -n "^- \[ \]" .claude/deferred.md | sed -n "${ARGS}p" | cut -d: -f1)
    else
      TASK_LINE=$(grep -n "^- \[ \].*$ARGS" .claude/deferred.md | head -1 | cut -d: -f1)
    fi
    
    if [ -n "$TASK_LINE" ]; then
      TASK_TEXT=$(sed -n "${TASK_LINE}p" .claude/deferred.md | sed 's/ *(deferred: [0-9-]*)//')
      
      # Remove from deferred list
      sed -i.bak "${TASK_LINE}d" .claude/deferred.md
      
      # Add to ACTIVE_WORK.md
      if [ ! -f "ACTIVE_WORK.md" ]; then
        echo "⚠️ ACTIVE_WORK.md not found, creating..."
        echo "# Active Work Session\n\n## Current Tasks\n" > ACTIVE_WORK.md
      fi
      
      sed -i.bak '/## Current Tasks/a\
'"$TASK_TEXT"'' ACTIVE_WORK.md
      
      echo "🔄 Task activated and moved to ACTIVE_WORK.md"
      echo "📝 Task: $(echo "$TASK_TEXT" | sed 's/^- \[ \] //')"
    else
      echo "❌ Task not found: $ARGS"
    fi
    ;;
    
  "block"|"blocked")
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide task and blocking reason"
      echo "Usage: /defer block <task> - <blocking reason>"
      exit 1
    fi
    
    TASK_AND_REASON="$ARGS"
    DATE=$(date '+%Y-%m-%d')
    
    # Add to blocked section
    if [ ! -f ".claude/deferred.md" ]; then
      cat > .claude/deferred.md << 'EOF'
# Deferred Tasks

## Blocked Tasks

EOF
    fi
    
    sed -i.bak '/## Blocked Tasks/a\
- [ ] '"$TASK_AND_REASON"' *(blocked: '"$DATE"')*' .claude/deferred.md
    
    echo "🚧 Task blocked: $TASK_AND_REASON"
    echo "📅 Blocked on: $DATE"
    ;;
    
  "review"|"audit")
    echo "🔍 Deferred Tasks Review"
    echo "======================="
    echo ""
    
    if [ ! -f ".claude/deferred.md" ]; then
      echo "No deferred tasks found"
      echo "Use '/defer add <task>' to start deferring tasks"
      exit 0
    fi
    
    # Count tasks by priority
    HIGH_COUNT=$(sed -n '/## High Priority/,/## /p' .claude/deferred.md | grep -c "^- \[ \]" || echo "0")
    MEDIUM_COUNT=$(sed -n '/## Medium Priority/,/## /p' .claude/deferred.md | grep -c "^- \[ \]" || echo "0")
    LOW_COUNT=$(sed -n '/## Low Priority/,/## /p' .claude/deferred.md | grep -c "^- \[ \]" || echo "0")
    BLOCKED_COUNT=$(sed -n '/## Blocked Tasks/,/## /p' .claude/deferred.md | grep -c "^- \[ \]" || echo "0")
    
    TOTAL_DEFERRED=$((HIGH_COUNT + MEDIUM_COUNT + LOW_COUNT + BLOCKED_COUNT))
    
    echo "📊 Deferred Tasks Summary:"
    echo "  High Priority: $HIGH_COUNT"
    echo "  Medium Priority: $MEDIUM_COUNT"
    echo "  Low Priority: $LOW_COUNT"
    echo "  Blocked: $BLOCKED_COUNT"
    echo "  Total Deferred: $TOTAL_DEFERRED"
    echo ""
    
    # Show high priority deferred tasks
    if [ "$HIGH_COUNT" -gt 0 ]; then
      echo "⚠️ High Priority Deferred Tasks (consider activating):"
      sed -n '/## High Priority/,/## /p' .claude/deferred.md | grep "^- \[ \]" | head -3 | sed 's/^/  /'
      echo ""
    fi
    
    # Check for stale deferred tasks
    STALE_TASKS=$(grep "deferred: [0-9-]*" .claude/deferred.md | while read -r line; do
      DEFER_DATE=$(echo "$line" | grep -o 'deferred: [0-9-]*' | cut -d' ' -f2)
      DAYS_AGO=$(( ($(date +%s) - $(date -d "$DEFER_DATE" +%s 2>/dev/null || echo $(date +%s))) / 86400 ))
      if [ "$DAYS_AGO" -gt 30 ]; then
        echo "$line (${DAYS_AGO} days ago)"
      fi
    done)
    
    if [ -n "$STALE_TASKS" ]; then
      echo "⏰ Stale Deferred Tasks (>30 days):"
      echo "$STALE_TASKS" | head -3 | sed 's/^/  /'
      echo ""
      echo "💡 Consider reviewing these tasks - activate, delete, or re-prioritize"
    fi
    ;;
    
  "clean"|"cleanup"|"purge")
    echo "🧹 Deferred Tasks Cleanup"
    echo "========================"
    
    if [ ! -f ".claude/deferred.md" ]; then
      echo "No deferred tasks to clean up"
      exit 0
    fi
    
    echo "Cleanup options:"
    echo "1. Remove tasks deferred >90 days ago"
    echo "2. Archive low priority tasks to separate file"
    echo "3. Remove completed tasks from deferred list"
    echo ""
    echo "Run these operations manually or implement based on needs"
    
    # Show candidates for cleanup
    VERY_OLD=$(grep "deferred: [0-9-]*" .claude/deferred.md | while read -r line; do
      DEFER_DATE=$(echo "$line" | grep -o 'deferred: [0-9-]*' | cut -d' ' -f2)
      DAYS_AGO=$(( ($(date +%s) - $(date -d "$DEFER_DATE" +%s 2>/dev/null || echo $(date +%s))) / 86400 ))
      if [ "$DAYS_AGO" -gt 90 ]; then
        echo "  $line (${DAYS_AGO} days old)"
      fi
    done)
    
    if [ -n "$VERY_OLD" ]; then
      echo "📅 Tasks deferred >90 days ago (cleanup candidates):"
      echo "$VERY_OLD" | head -5
    else
      echo "✅ No very old deferred tasks found"
    fi
    ;;
    
  "list"|"show"|"")
    echo "📋 Deferred Tasks"
    echo "================="
    echo ""
    
    if [ ! -f ".claude/deferred.md" ]; then
      echo "No deferred tasks yet"
      echo "Use '/defer add <task>' to defer a task for later"
      exit 0
    fi
    
    # Show each priority section
    echo "🔴 High Priority (Deferred):"
    sed -n '/## High Priority/,/## /p' .claude/deferred.md | grep "^- \[ \]" | head -5 | sed 's/^/  /' || echo "  None"
    echo ""
    
    echo "🟡 Medium Priority (Deferred):"
    sed -n '/## Medium Priority/,/## /p' .claude/deferred.md | grep "^- \[ \]" | head -5 | sed 's/^/  /' || echo "  None"
    echo ""
    
    echo "⚪ Low Priority (Ideas/Someday):"
    sed -n '/## Low Priority/,/## /p' .claude/deferred.md | grep "^- \[ \]" | head -3 | sed 's/^/  /' || echo "  None"
    echo ""
    
    echo "🚧 Blocked Tasks:"
    sed -n '/## Blocked Tasks/,/## /p' .claude/deferred.md | grep "^- \[ \]" | head -3 | sed 's/^/  /' || echo "  None"
    ;;
    
  "help"|"--help"|"-h")
    cat << 'EOF'
Defer Command Help

USAGE:
  /defer [command] [arguments]

COMMANDS:
  add, defer, postpone <task>     Defer a task for later
  promote, priority <task>        Promote deferred task to high priority
  activate, undefer <task>        Move deferred task back to active work
  block, blocked <task - reason>  Mark task as blocked with reason
  review, audit                   Review all deferred tasks
  clean, cleanup                  Clean up old/stale deferred tasks
  list, show (default)           Show all deferred tasks by priority
  help                           Show this help

EXAMPLES:
  /defer add "Implement advanced search"    Defer a task
  /defer promote 1                         Promote task #1 to high priority
  /defer activate "search"                 Activate task containing "search"
  /defer block "API migration - waiting for v3"
  /defer review                           Review all deferred tasks

PRIORITY LEVELS:
  High Priority    - Important but deferred tasks
  Medium Priority  - Standard deferred tasks  
  Low Priority     - Ideas and someday items
  Blocked         - Tasks waiting on external factors

INTEGRATION:
  Works with ACTIVE_WORK.md for task activation
  Use with /todo for active task management
  Reference in /next for priority recommendations
EOF
    ;;
    
  *)
    echo "❌ Unknown defer command: $COMMAND"
    echo "Use '/defer help' for available commands"
    exit 1
    ;;
esac

# Clean up backup files
rm -f .claude/deferred.md.bak ACTIVE_WORK.md.bak

echo ""
echo "💡 Use '/defer review' to audit deferred tasks, '/todo' for active work"
```

## Features
- **Priority-Based Deferral**: Organize deferred tasks by priority levels
- **Task Activation**: Move deferred tasks back to active work when ready
- **Blocked Task Tracking**: Special handling for tasks waiting on external factors
- **Stale Task Detection**: Identify tasks deferred for extended periods
- **Integration**: Seamless workflow with `/todo` and `ACTIVE_WORK.md`
- **Review System**: Regular audit capabilities for backlog management

## Deferral Categories
- **High Priority**: Important tasks deferred due to timing
- **Medium Priority**: Standard deferred work
- **Low Priority**: Ideas and someday/maybe items
- **Blocked**: Tasks waiting on external dependencies