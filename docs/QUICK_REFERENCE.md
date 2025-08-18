# Claude Code Commands - Quick Reference

## Essential Commands (Use Daily)

| Command | Purpose | Example |
|---------|---------|---------|
| `/hygiene` | Project health check | `/hygiene` |
| `/todo` | Task management | `/todo add "Fix bug"` |
| `/commit` | Quality-checked commits | `/commit` |
| `/next` | Get AI recommendations | `/next` |

## All Commands by Category

### 🎯 Core Workflow
```bash
/hygiene              # Check project health (lint, tests, deps)
/todo [add|done|list] # Manage tasks in ACTIVE_WORK.md
/commit               # Commit with quality checks
/next                 # AI-recommended next actions
/push                 # Push with quality checks
```

### 📋 Development & Testing
```bash
/tdd start "feature"  # Start Test-Driven Development workflow
/retrospective        # Analyze git history and patterns
/monitor              # Check GitHub CI status
```

### 📚 Documentation & Learning
```bash
/docs                 # Analyze and update documentation
/docs-explain         # Explain documentation structure
/learn "insight"      # Capture development insights
/reflect              # End-of-session reflection
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
/tdd start "feature"  # TDD for new features
/learn "insight"      # Capture discoveries
```

### 🌙 End of Session
```bash
/commit               # Commit changes
/reflect              # Capture session learnings
/push                 # Push to remote
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

The `/commit` command will guide you through creating quality-checked commits with proper formatting.

| Type | Use For | Example |
|------|---------|---------|
| `feat` | New features | `feat: add authentication` |
| `fix` | Bug fixes | `fix: resolve login crash` |
| `docs` | Documentation | `docs: update README` |
| `test` | Adding tests | `test: add unit tests` |
| `refactor` | Code restructuring | `refactor: simplify logic` |
| `chore` | Maintenance | `chore: update dependencies` |
| `style` | Formatting | `style: fix indentation` |

## Quick Decision Tree

```
Need to know project status?
  → /hygiene

Starting new feature?
  → /tdd start "feature name"

Ready to commit?
  → /commit

Not sure what to do?
  → /next

Found a bug?
  → /todo add "fix bug" → fix it → /commit

Need to understand project?
  → /docs-explain

Want to check CI?
  → /monitor

End of session?
  → /reflect → /commit → /push
```

## Command Details

### `/hygiene` - Project Health Check
- Runs linting checks
- Executes test suite
- Checks for outdated dependencies
- Shows git status summary
- Quick way to ensure everything is working

### `/todo` - Task Management
- Maintains tasks in ACTIVE_WORK.md
- Supports add, done, remove, list operations
- Tracks task completion
- Archives completed tasks

### `/commit` - Quality Commits
- Runs quality checks before committing
- Enforces atomic commits (1-3 files recommended)
- Adds co-author attribution for Claude
- Follows conventional commit format

### `/next` - AI Recommendations
- Analyzes project state
- Suggests next logical steps
- Considers pending tasks and recent changes
- Helps when you're unsure what to do

### `/tdd` - Test-Driven Development
- Guides through RED-GREEN-REFACTOR cycle
- Creates failing tests first
- Implements minimal code to pass
- Refactors with test safety net

### `/monitor` - CI Monitoring
- Checks GitHub Actions status
- Shows recent workflow runs
- Identifies test failures
- Tracks pull request status

### `/docs` - Documentation Management
- Updates command catalog
- Checks for broken links
- Maintains documentation consistency
- Auto-generates documentation

### `/learn` - Knowledge Capture
- Records development insights
- Maintains LEARNINGS.md
- Archives learnings by date
- Searchable knowledge base

### `/reflect` - Session Reflection
- Captures end-of-session insights
- Reviews accomplishments
- Identifies patterns
- Builds learning history

### `/retrospective` - Git Analysis
- Analyzes commit patterns
- Shows productivity metrics
- Identifies improvement areas
- Historical code analysis

### `/push` - Safe Push
- Runs quality checks
- Validates before pushing
- Ensures CI readiness
- Prevents breaking builds

## File Locations

```
.claude/
├── commands/         # Command templates (customize here)
│   ├── hygiene.md
│   ├── todo.md
│   ├── commit.md
│   ├── tdd.md
│   └── ...
└── learnings/       # Archived insights (/learn)

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
# Adjust quality thresholds
```

### Create Command Aliases
```bash
# Create short aliases
cp .claude/commands/hygiene.md .claude/commands/h.md
cp .claude/commands/todo.md .claude/commands/t.md
```

## Best Practices

1. **Start with `/hygiene`** - Know your project state
2. **Use `/todo` continuously** - Never lose track of work
3. **Commit frequently** - Use `/commit` for quality checks
4. **Document insights** - Use `/learn` regularly
5. **Use TDD** - `/tdd start` for new features
6. **Check CI** - `/monitor` before pushing
7. **Reflect regularly** - `/reflect` at session end

---

*This reference covers all actual commands available in the claude-setup project.*