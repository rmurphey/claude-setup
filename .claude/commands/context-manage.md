---
allowed-tools: [Bash, Read]
description: Optimize Claude Code context window usage and manage conversation memory
---

# Context Management Command

<!-- 
This command is self-updating. To regenerate:
In Claude Code: /docs update context-manage-command
Last updated: 2025-01-16
Git SHA: 9af0fdc7e42e3e0fff960e73cf8520a9c32e7dcb
-->

Helps manage Claude's context window efficiently, preventing token overflow and maintaining conversation coherence.

## Context
- Current session files: !`find . -name "*.md" -newer /tmp 2>/dev/null | wc -l | xargs`+ recently accessed
- Git changes: !`git status --porcelain 2>/dev/null | wc -l | xargs`+ files modified
- Active work items: !`grep -c "^- \\[ \\]" ACTIVE_WORK.md 2>/dev/null || echo "0"`+ tasks
- Documentation size: !`find docs -name "*.md" 2>/dev/null | xargs wc -l | tail -1 | awk '{print $1}' || echo "0"`+ lines

## Your Task

Execute context management strategies to optimize Claude Code usage:

```bash
#!/bin/bash

# Parse command arguments
ACTION="${1:-status}"
TARGET="${2}"
OPTIONS="${*:3}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

case "$ACTION" in
  "status"|"check")
    echo "📊 Context Window Status"
    echo "========================"
    echo ""
    
    # Estimate current context usage
    echo "Current Context Usage Estimates:"
    echo ""
    
    # Count recent file operations
    RECENT_FILES=$(find . -type f -mmin -60 2>/dev/null | grep -v node_modules | wc -l | xargs)
    echo "  📁 Files accessed (last hour): $RECENT_FILES"
    
    # Check conversation markers
    if [ -f "ACTIVE_WORK.md" ]; then
      TASKS=$(grep -c "^- \\[" ACTIVE_WORK.md)
      echo "  ✅ Active tasks tracked: $TASKS"
    fi
    
    # Estimate token usage
    echo ""
    echo "Token Usage Indicators:"
    
    # Large files that might consume tokens
    LARGE_FILES=$(find . -name "*.md" -o -name "*.js" -o -name "*.ts" 2>/dev/null | xargs wc -l 2>/dev/null | awk '$1 > 500 {print $2}' | head -5)
    
    if [ -n "$LARGE_FILES" ]; then
      echo -e "  ${YELLOW}⚠️  Large files in context:${NC}"
      echo "$LARGE_FILES" | while read -r file; do
        LINES=$(wc -l < "$file" 2>/dev/null)
        echo "    • $file ($LINES lines)"
      done
    else
      echo -e "  ${GREEN}✅ No large files detected${NC}"
    fi
    
    echo ""
    echo "💡 Context Health:"
    
    if [ "$RECENT_FILES" -lt 20 ]; then
      echo -e "  ${GREEN}Good${NC} - Low file access count"
    elif [ "$RECENT_FILES" -lt 50 ]; then
      echo -e "  ${YELLOW}Moderate${NC} - Consider compacting soon"
    else
      echo -e "  ${RED}High${NC} - Recommend immediate compaction"
    fi
    
    echo ""
    echo "Next: /context-manage compact (if needed)"
    ;;
    
  "compact"|"reset")
    echo "🗜️ Compacting Context Window"
    echo "============================"
    echo ""
    
    echo "Preparing to compact conversation context..."
    echo ""
    
    # Create checkpoint
    CHECKPOINT_FILE=".claude/checkpoints/checkpoint-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p .claude/checkpoints
    
    cat > "$CHECKPOINT_FILE" << EOF
# Context Checkpoint - $(date '+%Y-%m-%d %H:%M')

## Summary of Work Completed
$([ -f ACTIVE_WORK.md ] && grep "^- \\[x\\]" ACTIVE_WORK.md || echo "No completed tasks recorded")

## Current State
- Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
- Modified files: $(git status --porcelain 2>/dev/null | wc -l | xargs)
- Last commit: $(git log -1 --oneline 2>/dev/null || echo "no commits")

## Key Decisions Made
[Preserve important decisions here before compacting]

## Next Steps
$([ -f ACTIVE_WORK.md ] && grep "^- \\[ \\]" ACTIVE_WORK.md | head -3 || echo "No pending tasks recorded")
EOF
    
    echo "✅ Checkpoint created: $CHECKPOINT_FILE"
    echo ""
    echo "Recommended compaction strategy:"
    echo ""
    echo -e "${BLUE}For Claude Code CLI:${NC}"
    echo "  1. Type: /compact"
    echo "  2. Claude will summarize conversation"
    echo "  3. Continue with fresh context"
    echo ""
    echo -e "${BLUE}Manual compaction:${NC}"
    echo "  1. Summarize completed work"
    echo "  2. Note key decisions and context"
    echo "  3. Start new conversation with summary"
    echo ""
    echo "✅ Checkpoint saved for reference"
    ;;
    
  "optimize"|"tips")
    echo "⚡ Context Optimization Tips"
    echo "============================"
    echo ""
    
    echo -e "${GREEN}Best Practices for Context Management:${NC}"
    echo ""
    echo "1. Proactive Compaction:"
    echo "   • Compact after completing major features"
    echo "   • Compact before starting new work streams"
    echo "   • Watch for context window warnings"
    echo ""
    echo "2. Efficient File References:"
    echo "   • Reference specific files rather than entire directories"
    echo "   • Use grep/search instead of reading large files"
    echo "   • Clear file context when no longer needed"
    echo ""
    echo "3. Conversation Structure:"
    echo "   • Keep prompts focused and specific"
    echo "   • Break complex tasks into smaller chunks"
    echo "   • Use checkpoints between major tasks"
    echo ""
    echo "4. Token-Efficient Commands:"
    echo "   • Use minimal command variants when available"
    echo "   • Delegate to npm scripts (87% token savings)"
    echo "   • Avoid repeating large outputs"
    echo ""
    echo "5. Regular Cleanup:"
    echo "   • Close unused file contexts"
    echo "   • Summarize rather than preserve full history"
    echo "   • Use ACTIVE_WORK.md for task continuity"
    ;;
    
  "checkpoint"|"save")
    echo "💾 Creating Context Checkpoint"
    echo "=============================="
    echo ""
    
    CHECKPOINT_NAME="${TARGET:-manual}"
    CHECKPOINT_FILE=".claude/checkpoints/${CHECKPOINT_NAME}-$(date +%Y%m%d-%H%M%S).md"
    mkdir -p .claude/checkpoints
    
    echo "Creating checkpoint: $CHECKPOINT_NAME"
    echo ""
    
    # Gather context information
    cat > "$CHECKPOINT_FILE" << EOF
# Context Checkpoint: $CHECKPOINT_NAME
**Created**: $(date '+%Y-%m-%d %H:%M:%S')

## Current Focus
${TARGET:-"Manual checkpoint created by user"}

## Repository State
- **Branch**: $(git branch --show-current 2>/dev/null || echo "unknown")
- **Uncommitted changes**: $(git status --porcelain 2>/dev/null | wc -l | xargs) files
- **Last commit**: $(git log -1 --oneline 2>/dev/null || echo "no commits")

## Active Work
### Completed Tasks
$([ -f ACTIVE_WORK.md ] && grep "^- \\[x\\]" ACTIVE_WORK.md || echo "- No completed tasks recorded")

### Pending Tasks
$([ -f ACTIVE_WORK.md ] && grep "^- \\[ \\]" ACTIVE_WORK.md || echo "- No pending tasks recorded")

## Recent Files Modified
$(git status --porcelain 2>/dev/null | head -10 | sed 's/^/- /')

## Key Context to Preserve
- [Add important decisions made]
- [Add critical implementation details]
- [Add dependencies or constraints discovered]

## Resume Instructions
To resume from this checkpoint:
1. Review this checkpoint file
2. Check git status for uncommitted work
3. Review ACTIVE_WORK.md for pending tasks
4. Continue with: /next

---
*Checkpoint created by /context-manage checkpoint*
EOF
    
    echo "✅ Checkpoint saved: $CHECKPOINT_FILE"
    echo ""
    echo "This checkpoint preserves:"
    echo "  • Current work state"
    echo "  • Active tasks"
    echo "  • Repository status"
    echo "  • Key decisions"
    echo ""
    echo "Use this to resume work after context reset"
    ;;
    
  "history"|"checkpoints")
    echo "📜 Context History"
    echo "=================="
    echo ""
    
    if [ -d ".claude/checkpoints" ]; then
      CHECKPOINT_COUNT=$(ls .claude/checkpoints/*.md 2>/dev/null | wc -l | xargs)
      
      if [ "$CHECKPOINT_COUNT" -gt 0 ]; then
        echo "Found $CHECKPOINT_COUNT checkpoint(s):"
        echo ""
        
        ls -lt .claude/checkpoints/*.md 2>/dev/null | head -10 | while read -r line; do
          FILE=$(echo "$line" | awk '{print $NF}')
          SIZE=$(echo "$line" | awk '{print $5}')
          DATE=$(echo "$line" | awk '{print $6, $7, $8}')
          NAME=$(basename "$FILE" .md)
          
          echo "  📌 $NAME"
          echo "     Date: $DATE"
          echo "     Size: $SIZE bytes"
          
          # Extract summary if available
          if [ -f "$FILE" ]; then
            FOCUS=$(grep "^## Current Focus" -A 1 "$FILE" | tail -1)
            [ -n "$FOCUS" ] && echo "     Focus: $FOCUS"
          fi
          echo ""
        done
      else
        echo "No checkpoints found"
      fi
    else
      echo "No checkpoint directory found"
      echo "Checkpoints will be created in .claude/checkpoints/"
    fi
    
    echo "Create new: /context-manage checkpoint <name>"
    ;;
    
  "estimate")
    echo "📏 Token Usage Estimation"
    echo "========================="
    echo ""
    
    echo "Estimating token usage for current context..."
    echo ""
    
    # Rough token estimation (1 token ≈ 4 characters)
    
    # Recently modified files
    if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
      MODIFIED_CHARS=$(git diff 2>/dev/null | wc -c)
      MODIFIED_TOKENS=$((MODIFIED_CHARS / 4))
      echo "Modified files: ~$MODIFIED_TOKENS tokens"
    fi
    
    # Open documentation
    if [ -d "docs" ]; then
      DOCS_CHARS=$(find docs -name "*.md" -exec cat {} \; 2>/dev/null | wc -c)
      DOCS_TOKENS=$((DOCS_CHARS / 4))
      echo "Documentation: ~$DOCS_TOKENS tokens"
    fi
    
    # Active work items
    if [ -f "ACTIVE_WORK.md" ]; then
      WORK_CHARS=$(wc -c < ACTIVE_WORK.md)
      WORK_TOKENS=$((WORK_CHARS / 4))
      echo "Active work: ~$WORK_TOKENS tokens"
    fi
    
    # Commands
    COMMAND_CHARS=$(find .claude/commands -name "*.md" -exec cat {} \; 2>/dev/null | wc -c)
    COMMAND_TOKENS=$((COMMAND_CHARS / 4))
    echo "Commands loaded: ~$COMMAND_TOKENS tokens"
    
    echo ""
    echo "💡 Token Optimization Tips:"
    echo "  • Use /compact when approaching limits"
    echo "  • Reference files instead of reading fully"
    echo "  • Clear unneeded file contexts"
    echo "  • Use minimal command variants"
    ;;
    
  "help"|"--help"|"-h")
    cat << 'EOF'
Context Management Command

USAGE:
  /context-manage [action] [options]

ACTIONS:
  status, check      Show current context usage
  compact, reset     Prepare for context compaction
  optimize, tips     Show optimization strategies
  checkpoint, save   Create a context checkpoint
  history           View checkpoint history
  estimate          Estimate token usage

FEATURES:
- Context window monitoring
- Checkpoint creation for continuity
- Token usage estimation
- Optimization recommendations
- Conversation compaction guidance

BEST PRACTICES:
1. Check status regularly: /context-manage status
2. Create checkpoints before major work
3. Compact proactively at natural breaks
4. Use efficient file referencing
5. Keep conversations focused

EXAMPLES:
  /context-manage status       # Check context health
  /context-manage compact      # Prepare for compaction
  /context-manage checkpoint   # Save current state
  /context-manage optimize     # Get optimization tips

Based on Claude Code best practices for context management.
EOF
    ;;
    
  *)
    echo "❌ Unknown action: $ACTION"
    echo "Valid actions: status, compact, optimize, checkpoint, history, estimate"
    echo "Use '/context-manage help' for more information"
    exit 1
    ;;
esac

# Add contextual recommendations
if [ "$ACTION" != "help" ] && [ "$ACTION" != "optimize" ]; then
  echo ""
  echo "💡 Quick Tips:"
  echo "  • Monitor: /context-manage status"
  echo "  • Save work: /context-manage checkpoint"
  echo "  • Optimize: /context-manage optimize"
fi
```

## Features

### Context Monitoring
- Real-time context usage estimation
- File access tracking
- Token consumption indicators
- Health status reporting

### Checkpoint System
- Save conversation state before compaction
- Preserve key decisions and context
- Easy work resumption after reset
- Checkpoint history tracking

### Optimization Guidance
- Token-efficient practices
- Proactive compaction strategies
- File reference optimization
- Conversation structure tips

### Integration
- Works with `/compact` command
- Preserves ACTIVE_WORK.md continuity
- Git state tracking
- Checkpoint management

## Why Context Management Matters

Based on Claude Code best practices:
- Prevents context window overflow
- Maintains conversation coherence
- Reduces token costs
- Improves response quality
- Enables longer working sessions

## Usage Patterns

### Before Major Work
```bash
/context-manage checkpoint feature-start
```

### Regular Monitoring
```bash
/context-manage status
```

### At Natural Breaks
```bash
/context-manage compact
```

### Work Resumption
```bash
/context-manage history
# Review checkpoint
# Continue with /next
```