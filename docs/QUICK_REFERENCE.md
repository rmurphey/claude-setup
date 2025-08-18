# Claude Code Commands - Quick Reference

## Essential Commands (Use Daily)

| Command | Purpose | Example |
|---------|---------|---------|
| `/hygiene` | Project health check | `/hygiene` |
| `/todo` | Task management | `/todo add "Fix bug"` |
| `/commit` | Quality-checked commits | `/commit feat "add feature"` |
| `/next` | Get AI recommendations | `/next` |

## All Commands by Category

### 🎯 Core Workflow
```bash
/hygiene              # Check project health (lint, tests, deps)
/todo [add|done|list] # Manage tasks in ACTIVE_WORK.md
/commit [type] [msg]  # Commit with quality checks
/next                 # AI-recommended next actions
```

### 📋 Planning & Monitoring
```bash
/monitor              # Check GitHub CI status
/next                 # Get AI recommendations
/retrospective        # Analyze git history
```

### 📚 Documentation & Learning
```bash
/docs [type]          # Generate/update documentation
/learn "insight"      # Capture development insights
/reflect              # End-of-session reflection
/update-docs          # Update all documentation
```

### 🚀 Release & Quality
```bash
/push                 # Push with quality checks
```


## Common Workflows

### 🌅 Start of Day
```bash
/hygiene              # Check project status
/todo list            # Review tasks
/next                 # Get recommendations
```

### 💻 During Development
```bash
/todo add "task"      # Track new work
/find-working-equivalent "auth"  # Find examples
/atomic-commit        # Keep commits small
/learn "insight"      # Capture discoveries
```

### 🌙 End of Session
```bash
/commit              # Commit changes
/reflect             # Capture session learnings
/todo cleanup        # Archive completed tasks
```

## Task Management (`/todo`)

```bash
# Basic Operations
/todo                      # List all tasks
/todo add "Fix login"      # Add new task
/todo done 1              # Complete task #1
/todo done "login"        # Complete by text match
/todo remove 2            # Delete task

# Advanced
/todo priority "Critical"  # Add high-priority task
/todo cleanup             # Archive completed tasks
/todo list --all          # Show including completed
```

## Commit Types (`/commit`)

| Type | Use For | Example |
|------|---------|---------|
| `feat` | New features | `/commit feat "add auth"` |
| `fix` | Bug fixes | `/commit fix "resolve crash"` |
| `docs` | Documentation | `/commit docs "update README"` |
| `test` | Adding tests | `/commit test "add unit tests"` |
| `refactor` | Code restructuring | `/commit refactor "simplify logic"` |
| `chore` | Maintenance | `/commit chore "update deps"` |
| `style` | Formatting | `/commit style "fix indentation"` |

## Quick Decision Tree

```
Need to know project status?
  → /hygiene

Starting new feature?
  → /design → /estimate → /todo add

Ready to commit?
  → /commit (auto-detects type)

Not sure what to do?
  → /next

Found a bug?
  → /todo add → fix it → /commit fix

Code getting messy?
  → /maintainability → /refactor

Working on GitHub issue?
  → /issue 123

End of session?
  → /reflect → /commit → /push
```

## Command Shortcuts & Tips

### Combine Commands
```bash
# Full status check
/hygiene && /todo list && /next

# Complete development cycle
/design "feature" && /estimate feature && /todo add "implement"
```

### Smart Defaults
- `/commit` - Auto-detects type and generates message
- `/todo done 1` - Complete by number
- `/todo done "partial text"` - Complete by match
- `/next` - Analyzes everything automatically

### Quality Gates
- `/commit` - Runs lint, tests, build before committing
- `/push` - Validates before pushing
- `/hygiene` - Comprehensive health check

## File Locations

```
.claude/
├── commands/         # Command templates (customize here)
│   ├── hygiene.md
│   ├── todo.md
│   └── ...
├── designs/         # Feature designs (/design)
├── issues/          # Issue contexts (/issue)
└── usage.log        # Usage tracking (/estimate)

ACTIVE_WORK.md       # Current tasks (/todo)
LEARNINGS.md         # Captured insights (/learn)
CLAUDE.md            # AI guidelines
```

## Customization

### Modify Commands
Edit files in `.claude/commands/`:
```bash
# Make hygiene stricter
vim .claude/commands/hygiene.md
# Change: --max-warnings 10 → --max-warnings 0
```

### Add Project Checks
Extend existing commands:
```bash
# In .claude/commands/commit.md
# Add: npm run security-check
```

### Create New Commands
```bash
cp .claude/commands/hygiene.md .claude/commands/deploy.md
# Edit for your deployment workflow
```

## Keyboard Shortcuts

While not keyboard shortcuts, these are the fastest ways to work:

- `/h` → Could alias to `/hygiene`
- `/t` → Could alias to `/todo`
- `/c` → Could alias to `/commit`
- `/n` → Could alias to `/next`

Create aliases by copying command files:
```bash
cp .claude/commands/hygiene.md .claude/commands/h.md
```

## Emergency Commands

```bash
# Something's broken?
/hygiene              # Full diagnostic

# Lost track of work?
/todo list            # See all tasks
/next                 # Get guidance

# Need to understand code?
/find-working-equivalent "pattern"

# Commit too large?
/atomic-commit        # Split it up

# Project getting messy?
/maintainability      # Get health score
```

## Best Practices

1. **Start with `/hygiene`** - Know your project state
2. **Use `/todo` continuously** - Never lose track
3. **Keep commits small** - Use `/atomic-commit`
4. **Document insights** - Use `/learn` regularly
5. **Review regularly** - `/maintainability` weekly
6. **Plan features** - `/design` before coding
7. **Estimate work** - `/estimate` for planning

---

*Keep this reference handy for efficient Claude Code development!*