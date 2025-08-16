---
allowed-tools: [Bash, Read, Write]
description: Task management and tracking system with ACTIVE_WORK.md integration
---

# Todo Management Command

Comprehensive task management system that integrates with ACTIVE_WORK.md and supports interactive task tracking.

## Context
- Active tasks: !`grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo "0"`
- Completed tasks: !`grep -c "^- \[x\]" ACTIVE_WORK.md 2>/dev/null || echo "0"`
- Last updated: !`stat -c %y ACTIVE_WORK.md 2>/dev/null | cut -d' ' -f1 || echo "never"`

## Your Task
Manage project tasks through an interactive todo system. Parse command arguments to handle different operations:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-list}"
shift
ARGS="$*"

case "$COMMAND" in
  "add"|"create"|"new")
    echo "➕ Adding new task: $ARGS"
    
    if [ -z "$ARGS" ]; then
      echo "❌ Please provide a task description"
      echo "Usage: /todo add <task description>"
      exit 1
    fi
    
    # Add to ACTIVE_WORK.md
    if [ ! -f "ACTIVE_WORK.md" ]; then
      echo "⚠️  ACTIVE_WORK.md not found, creating..."
      cat > ACTIVE_WORK.md << 'EOF'
# Active Work Session

## Current Tasks
EOF
    fi
    
    # Add task to current tasks section
    sed -i.bak '/## Current Tasks/a\
- [ ] '"$ARGS"'' ACTIVE_WORK.md
    
    echo "✅ Task added to ACTIVE_WORK.md"
    ;;
    
  "done"|"complete"|"check")
    echo "✅ Marking task as complete..."
    
    if [ -z "$ARGS" ]; then
      echo "Available tasks to complete:"
      grep -n "^- \[ \]" ACTIVE_WORK.md 2>/dev/null | head -10 | sed 's/^/  /'
      echo ""
      echo "Usage: /todo done <task number or partial text>"
      exit 1
    fi
    
    # If argument is a number, complete that line number
    if [[ "$ARGS" =~ ^[0-9]+$ ]]; then
      TASK_LINE=$(grep -n "^- \[ \]" ACTIVE_WORK.md | sed -n "${ARGS}p" | cut -d: -f1)
      if [ -n "$TASK_LINE" ]; then
        sed -i.bak "${TASK_LINE}s/^- \[ \]/- [x]/" ACTIVE_WORK.md
        echo "✅ Task #$ARGS completed"
      else
        echo "❌ Task #$ARGS not found"
        exit 1
      fi
    else
      # Find and complete task by partial text match
      MATCHING_LINE=$(grep -n "^- \[ \].*$ARGS" ACTIVE_WORK.md | head -1 | cut -d: -f1)
      if [ -n "$MATCHING_LINE" ]; then
        TASK_TEXT=$(sed -n "${MATCHING_LINE}p" ACTIVE_WORK.md)
        sed -i.bak "${MATCHING_LINE}s/^- \[ \]/- [x]/" ACTIVE_WORK.md
        echo "✅ Task completed: $(echo "$TASK_TEXT" | sed 's/^- \[ \] //')"
      else
        echo "❌ No task found matching: $ARGS"
        echo "Available tasks:"
        grep -n "^- \[ \]" ACTIVE_WORK.md 2>/dev/null | head -5 | sed 's/^/  /'
        exit 1
      fi
    fi
    ;;
    
  "remove"|"delete"|"rm")
    echo "🗑️  Removing task..."
    
    if [ -z "$ARGS" ]; then
      echo "Available tasks to remove:"
      grep -n "^- \[.\]" ACTIVE_WORK.md 2>/dev/null | head -10 | sed 's/^/  /'
      echo ""
      echo "Usage: /todo remove <task number or partial text>"
      exit 1
    fi
    
    # If argument is a number, remove that line number
    if [[ "$ARGS" =~ ^[0-9]+$ ]]; then
      TASK_LINE=$(grep -n "^- \[.\]" ACTIVE_WORK.md | sed -n "${ARGS}p" | cut -d: -f1)
      if [ -n "$TASK_LINE" ]; then
        TASK_TEXT=$(sed -n "${TASK_LINE}p" ACTIVE_WORK.md)
        sed -i.bak "${TASK_LINE}d" ACTIVE_WORK.md
        echo "🗑️  Removed: $(echo "$TASK_TEXT" | sed 's/^- \[.\] //')"
      else
        echo "❌ Task #$ARGS not found"
        exit 1
      fi
    else
      # Find and remove task by partial text match
      MATCHING_LINE=$(grep -n "^- \[.\].*$ARGS" ACTIVE_WORK.md | head -1 | cut -d: -f1)
      if [ -n "$MATCHING_LINE" ]; then
        TASK_TEXT=$(sed -n "${MATCHING_LINE}p" ACTIVE_WORK.md)
        sed -i.bak "${MATCHING_LINE}d" ACTIVE_WORK.md
        echo "🗑️  Removed: $(echo "$TASK_TEXT" | sed 's/^- \[.\] //')"
      else
        echo "❌ No task found matching: $ARGS"
        exit 1
      fi
    fi
    ;;
    
  "list"|"show"|"status")
    echo "📋 Current Task Status"
    echo "======================"
    
    if [ ! -f "ACTIVE_WORK.md" ]; then
      echo "No ACTIVE_WORK.md file found"
      echo "Use '/todo add <task>' to create your first task"
      exit 0
    fi
    
    # Count tasks
    PENDING_COUNT=$(grep -c "^- \[ \]" ACTIVE_WORK.md 2>/dev/null || echo "0")
    COMPLETED_COUNT=$(grep -c "^- \[x\]" ACTIVE_WORK.md 2>/dev/null || echo "0")
    TOTAL_COUNT=$((PENDING_COUNT + COMPLETED_COUNT))
    
    echo "Tasks: $PENDING_COUNT pending, $COMPLETED_COUNT completed ($TOTAL_COUNT total)"
    echo ""
    
    if [ "$PENDING_COUNT" -gt 0 ]; then
      echo "⏳ Pending Tasks:"
      grep -n "^- \[ \]" ACTIVE_WORK.md | head -10 | while IFS=: read -r line_num task; do
        task_num=$(echo "$task" | grep -o "^- \[ \]" | wc -l | xargs)
        clean_task=$(echo "$task" | sed 's/^- \[ \] //')
        echo "  $line_num. $clean_task"
      done
      echo ""
    fi
    
    if [ "$COMPLETED_COUNT" -gt 0 ] && [ "$ARGS" = "--all" ]; then
      echo "✅ Completed Tasks:"
      grep -n "^- \[x\]" ACTIVE_WORK.md | head -10 | while IFS=: read -r line_num task; do
        clean_task=$(echo "$task" | sed 's/^- \[x\] //')
        echo "  $line_num. $clean_task"
      done
      echo ""
    fi
    
    if [ "$PENDING_COUNT" -eq 0 ]; then
      echo "🎉 No pending tasks! Great job!"
    fi
    ;;
    
  "cleanup"|"clean")
    echo "🧹 Cleaning up completed tasks..."
    
    if [ ! -f "ACTIVE_WORK.md" ]; then
      echo "No ACTIVE_WORK.md file found"
      exit 0
    fi
    
    COMPLETED_COUNT=$(grep -c "^- \[x\]" ACTIVE_WORK.md 2>/dev/null || echo "0")
    
    if [ "$COMPLETED_COUNT" -eq 0 ]; then
      echo "No completed tasks to clean up"
      exit 0
    fi
    
    # Archive completed tasks to bottom of file or separate section
    if grep -q "## Completed Tasks" ACTIVE_WORK.md; then
      # Move completed tasks to existing completed section
      grep "^- \[x\]" ACTIVE_WORK.md >> temp_completed.txt
      sed -i.bak '/^- \[x\]/d' ACTIVE_WORK.md
      sed -i '/## Completed Tasks/r temp_completed.txt' ACTIVE_WORK.md
      rm temp_completed.txt
    else
      # Create completed section and move tasks there
      echo "" >> ACTIVE_WORK.md
      echo "## Completed Tasks" >> ACTIVE_WORK.md
      grep "^- \[x\]" ACTIVE_WORK.md >> ACTIVE_WORK.md
      sed -i.bak '/^- \[x\]/d' ACTIVE_WORK.md
    fi
    
    echo "✅ Moved $COMPLETED_COUNT completed tasks to archive section"
    ;;
    
  "priority"|"urgent"|"important")
    echo "⭐ Managing high priority tasks..."
    
    if [ -z "$ARGS" ]; then
      echo "High priority tasks (marked with ⭐):"
      grep -n "^- \[ \] ⭐" ACTIVE_WORK.md 2>/dev/null | sed 's/^/  /' || echo "  No priority tasks found"
      echo ""
      echo "Usage:"
      echo "  /todo priority add <task>     - Add high priority task"
      echo "  /todo priority <task text>    - Mark existing task as priority"
      exit 0
    fi
    
    if [ "$1" = "add" ]; then
      shift
      TASK_DESC="$*"
      echo "➕ Adding high priority task: $TASK_DESC"
      
      if [ ! -f "ACTIVE_WORK.md" ]; then
        cat > ACTIVE_WORK.md << 'EOF'
# Active Work Session

## Current Tasks
EOF
      fi
      
      # Add priority task at top of current tasks
      sed -i.bak '/## Current Tasks/a\
- [ ] ⭐ '"$TASK_DESC"'' ACTIVE_WORK.md
      echo "✅ Priority task added"
    else
      # Mark existing task as priority
      MATCHING_LINE=$(grep -n "^- \[ \].*$ARGS" ACTIVE_WORK.md | head -1 | cut -d: -f1)
      if [ -n "$MATCHING_LINE" ]; then
        sed -i.bak "${MATCHING_LINE}s/^- \[ \]/- [ ] ⭐/" ACTIVE_WORK.md
        echo "⭐ Task marked as priority"
      else
        echo "❌ No task found matching: $ARGS"
      fi
    fi
    ;;
    
  "help"|"-h"|"--help")
    cat << 'EOF'
Todo Management Command Help

USAGE:
  /todo [command] [arguments]

COMMANDS:
  list, show, status         Show current tasks (default)
    --all                    Include completed tasks in list
    
  add, create, new <task>    Add new task
  done, complete, check <#>  Mark task as completed (by number or text)
  remove, delete, rm <#>     Remove task (by number or text)
  
  priority [add] <task>      Manage high priority tasks
  cleanup, clean             Archive completed tasks
  
  help                       Show this help

EXAMPLES:
  /todo                      List current tasks
  /todo add "Fix login bug"  Add new task
  /todo done 1               Complete task #1
  /todo done "login bug"     Complete task containing "login bug"
  /todo priority add "Critical security fix"
  /todo cleanup              Archive completed tasks

INTEGRATION:
- Tasks are stored in ACTIVE_WORK.md
- Supports checkbox format: - [ ] task and - [x] completed
- High priority tasks marked with ⭐
- Completed tasks can be archived to separate section
EOF
    ;;
    
  *)
    echo "❌ Unknown command: $COMMAND"
    echo "Use '/todo help' for available commands"
    exit 1
    ;;
esac

# Clean up backup files
rm -f ACTIVE_WORK.md.bak

echo ""
echo "💡 Use '/todo list' to see all tasks, '/todo help' for more commands"
```

## Features
- **Task Management**: Add, complete, remove, and list tasks
- **Priority Support**: Mark and manage high-priority tasks with ⭐
- **Cleanup**: Archive completed tasks to keep active list focused
- **Smart Matching**: Complete/remove tasks by number or partial text
- **ACTIVE_WORK.md Integration**: Seamlessly works with existing workflow
- **Interactive**: Shows available options when commands need arguments

## Usage Examples
- `/todo` - Show current task status
- `/todo add "Implement user authentication"`
- `/todo done 1` - Complete task #1
- `/todo priority add "Fix critical security bug"`
- `/todo cleanup` - Archive all completed tasks