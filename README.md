# Claude Code Command Templates 🚀

**Professional command templates for structured AI-assisted development with Claude Code**

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/rmurphey/claude-setup)
[![Commands](https://img.shields.io/badge/commands-19-green)](templates/commands/)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

## Quick Start (3 Steps)

```bash
# 1. Clone templates to a temporary location
git clone https://github.com/rmurphey/claude-setup.git /tmp/claude-templates

# 2. Copy command templates to your project
mkdir -p .claude/commands
cp /tmp/claude-templates/templates/commands/*.md .claude/commands/

# 3. Start using commands in Claude Code
# Type /hygiene, /todo, /commit, etc.
```

That's it! You now have 19 professional development commands ready to use.

## What You Get

**🚀 Token-Efficient Architecture**: Commands use npm script delegation for 87% reduction in AI token usage. See [Token Efficiency Guide](docs/TOKEN_EFFICIENCY.md) for details.

### 🎯 Core Workflow Commands
- **`/hygiene`** - Comprehensive project health check (lint, tests, deps, git status)
- **`/todo`** - Task management with ACTIVE_WORK.md integration
- **`/commit`** - Quality-checked commits with pre-commit validation
- **`/next`** - AI-recommended next steps based on project state

### 📋 Planning & Design
- **`/design`** - Feature planning and design documentation
- **`/estimate`** - Claude usage cost estimation for tasks
- **`/defer`** - Task deferral and backlog management
- **`/issue`** - GitHub issue workflow integration

### 📚 Documentation & Learning
- **`/docs`** - Documentation generation and maintenance
- **`/learn`** - Capture development insights and patterns
- **`/reflect`** - Session reflection and knowledge capture
- **`/update-docs`** - Automated documentation updates

### 🚀 Release & Quality
- **`/push`** - Push commits with quality checks
- **`/version-tag`** - Version tagging and release workflow
- **`/maintainability`** - Code maintainability analysis
- **`/atomic-commit`** - Enforce 1-3 file commit discipline

### 🛠️ Development Utilities
- **`/archive`** - Archive completed work and cleanup
- **`/edit-not-create`** - Prioritize editing over creating files
- **`/find-working-equivalent`** - Find similar working code examples

## Common Usage Patterns

### 🆕 Starting a New Project

```bash
# 1. Initialize your project
npm init -y  # or your language's equivalent

# 2. Copy all templates
cp -r /tmp/claude-templates/templates/* .

# 3. Customize CLAUDE.md for your project
# Edit quality levels, team size, specific constraints

# 4. Start with hygiene check
# In Claude Code: /hygiene
```

### 📦 Adding to Existing Project

```bash
# 1. Copy just the command templates
cp -r /tmp/claude-templates/templates/commands .claude/

# 2. Add key documentation files
cp /tmp/claude-templates/templates/CLAUDE.md .
cp /tmp/claude-templates/templates/ACTIVE_WORK.md .

# 3. Run initial health check
# In Claude Code: /hygiene
```

### 👥 Team Adoption

```bash
# 1. Review and customize templates as a team
# 2. Add to your repository
git add .claude/
git commit -m "feat: add Claude Code command templates"

# 3. Document team-specific workflows in CLAUDE.md
# 4. Share command usage patterns in team docs
```

## Real-World Example Workflow

### Feature Development Flow

```bash
# 1. Check project health
/hygiene
# Output: ✅ All checks passing

# 2. Create design for new feature
/design user authentication
# Creates: .claude/designs/user-authentication.md

# 3. Estimate Claude usage
/estimate feature medium
# Output: 50-120 messages estimated

# 4. Track your work
/todo add "Implement login endpoint"
/todo add "Add password validation"
/todo add "Create user session handling"

# 5. Make quality-checked commits
/commit feat "add user authentication endpoint"
# Runs: lint, tests, security checks before committing

# 6. Check maintainability
/maintainability
# Output: Score: 85/100 - Good maintainability

# 7. Push when ready
/push
# Validates and pushes to remote
```

### Daily Development Flow

```bash
# Morning: Check status and priorities
/next
# Output: Recommends highest priority task

/todo list
# Shows current task list

# During work: Atomic commits
/atomic-commit
# Enforces small, focused commits

# Capture insights
/learn "Using middleware for auth is cleaner than decorators"

# End of day: Reflect
/reflect
# Captures session learnings
```

## Customization Guide

### Adapting Commands to Your Needs

All commands are customizable markdown files in `.claude/commands/`. Common customizations:

#### Adjust Quality Thresholds
Edit `/hygiene` command to match your standards:
```bash
# In .claude/commands/hygiene.md
# Change from "max-warnings 10" to your preference
npx eslint . --max-warnings 0  # Strict: no warnings
```

#### Add Project-Specific Checks
Extend commands with your tools:
```bash
# In .claude/commands/commit.md
# Add your specific checks
npm run typecheck
npm run security-scan
npm run your-custom-check
```

#### Create Custom Commands
Copy any template as a starting point:
```bash
cp .claude/commands/hygiene.md .claude/commands/deploy.md
# Edit to create deployment workflow
```

## Command Categories

### 🏃 Quick Actions (< 1 min)
`/todo`, `/next`, `/defer`, `/archive`

### 🔍 Analysis Commands (1-5 min)
`/hygiene`, `/maintainability`, `/estimate`

### 📝 Documentation (5-15 min)
`/design`, `/docs`, `/learn`, `/reflect`

### 🔧 Development Workflow
`/commit`, `/push`, `/atomic-commit`, `/issue`

### 🎯 Code Quality
`/edit-not-create`, `/find-working-equivalent`, `/update-docs`

## Understanding Command Templates

Each command is a structured markdown file that guides Claude through specific workflows:

```markdown
---
allowed-tools: [Bash, Read, Write]  # Tools Claude can use
description: Brief command description
---

# Command Name

Detailed instructions for Claude to execute...
```

When you type `/command` in Claude Code:
1. Claude reads the template from `.claude/commands/command.md`
2. Executes the workflow described in the template
3. Uses only the allowed tools specified
4. Provides consistent, professional assistance

## Project Structure

```
.claude/
├── commands/           # Your command templates (19 files)
│   ├── hygiene.md     # Project health checks
│   ├── commit.md      # Quality-checked commits
│   ├── todo.md        # Task management
│   └── ...            # 16 more commands
├── designs/           # Feature design documents
├── issues/            # GitHub issue contexts
└── usage.log          # Claude usage tracking

CLAUDE.md              # Project AI guidelines
ACTIVE_WORK.md         # Current session tracking
```

## Tips for Success

### 🎯 Start Small
Begin with core commands: `/hygiene`, `/todo`, `/commit`

### 📊 Track Progress
Use `/todo` and `/next` to maintain focus

### 🔄 Regular Health Checks
Run `/hygiene` before and after major changes

### 💡 Capture Learnings
Use `/learn` to build project knowledge base

### 🎨 Customize Gradually
Adapt templates as you learn what works for your team

## Advanced Usage

### Chaining Commands
```bash
/hygiene && /todo list && /next
# Full status check → task list → recommendations
```

### Command Aliases
Create shortcuts for common workflows:
```bash
# In .claude/commands/status.md
# Combine hygiene + todo + next into one command
```

### CI/CD Integration
Use command patterns in your automation:
```bash
# In .github/workflows/ci.yml
# Implement same checks as /hygiene command
```

## Getting Help

- **📚 Full Command Reference**: See [docs/COMMAND_CATALOG.md](docs/COMMAND_CATALOG.md)
- **⚡ Quick Reference**: See [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)
- **💰 Token Efficiency**: See [docs/TOKEN_EFFICIENCY.md](docs/TOKEN_EFFICIENCY.md)
- **🔧 Customization**: See [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md)
- **💬 Issues**: [GitHub Issues](https://github.com/rmurphey/claude-setup/issues)

## Why Use These Templates?

✅ **Token Efficient** - 87% reduction in AI token usage through npm script delegation  
✅ **Consistent Workflows** - Same commands across all projects  
✅ **Quality Built-in** - Automated checks prevent issues  
✅ **Time Savings** - No need to explain workflows to Claude  
✅ **Team Alignment** - Everyone uses same development patterns  
✅ **Best Practices** - Incorporates proven development workflows  

## Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the Claude Code community*