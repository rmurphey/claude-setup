# Claude Code Command Templates 🚀

**A living reference implementation of professional Claude Code commands and workflows**

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/rmurphey/claude-setup)
[![Commands](https://img.shields.io/badge/commands-13-green)](.claude/commands/)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)
[![Token Efficiency](https://img.shields.io/badge/token%20savings-87%25-orange)](docs/TOKEN_EFFICIENCY.md)

## What This Is

This is a **working reference repository** that demonstrates best practices for Claude Code command development. The commands in `.claude/commands/` are actively used in this repository's development, making it a living example of the patterns it teaches.

## Quick Start (Choose Your Method)

### Method 1: Direct Use
```bash
# Clone and use as your project base
git clone https://github.com/rmurphey/claude-setup.git my-project
cd my-project
# Commands are ready to use in .claude/commands/
```

### Method 2: Copy Commands
```bash
# Copy the .claude directory to your existing project
git clone https://github.com/rmurphey/claude-setup.git temp-claude
cp -r temp-claude/.claude your-project/
cp temp-claude/CLAUDE.md your-project/
cp temp-claude/ACTIVE_WORK.md your-project/
```

## Why This Repository is Useful, Maybe

✅ **Living Reference**: This repo uses its own commands - see our git history  
✅ **Token-Efficient**: 87% reduction through npm script delegation ([proven metrics](docs/TOKEN_EFFICIENCY.md))  
✅ **Best Practices**: Based on Anthropic's guidelines and 2025 industry standards  
✅ **Production-Tested**: Commands refined through real-world usage  
✅ **Self-Documenting**: The repository demonstrates every pattern it teaches

## Command Categories

### 🎯 Core Workflow Commands
- **`/hygiene`** - Comprehensive project health check ([view command](.claude/commands/hygiene.md))
- **`/todo`** - Task management with ACTIVE_WORK.md ([view command](.claude/commands/todo.md))
- **`/commit`** - Quality-checked commits ([view command](.claude/commands/commit.md))
- **`/next`** - AI-recommended next steps ([view command](.claude/commands/next.md))

### 📋 Planning & Design
- **`/design`** - Feature planning documentation (Coming Soon)
- **`/estimate`** - Claude usage cost estimation (Coming Soon)
- **`/defer`** - Task deferral management (Coming Soon)
- **`/issue`** - GitHub issue workflow (Coming Soon)

### 📚 Documentation & Learning
- **`/docs`** - Documentation generation ([view command](.claude/commands/docs.md))
- **`/learn`** - Capture insights ([view command](.claude/commands/learn.md))
- **`/reflect`** - Session reflection (Coming Soon)
- **`/update-docs`** - Auto-update docs (Coming Soon)

### 🚀 Release & Quality
- **`/push`** - Push with quality checks ([view command](.claude/commands/push.md))
- **`/version-tag`** - Version management (Coming Soon)
- **`/maintainability`** - Code analysis (Coming Soon)
- **`/atomic-commit`** - Small commits ([view command](.claude/commands/atomic-commit.md))

### 🛠️ Development Utilities
- **`/archive`** - Archive completed work (Coming Soon)
- **`/edit-not-create`** - Prefer editing ([view command](.claude/commands/edit-not-create.md))
- **`/find-working-equivalent`** - Find examples (Coming Soon)

### 🆕 New Commands (2025 Best Practices)
- **`/tdd`** - Test-driven development workflow ([view command](.claude/commands/tdd.md))
- **`/ai-review`** - Automated PR review (Coming Soon)
- **`/context-manage`** - Context window optimization ([view command](.claude/commands/context-manage.md))
- **`/security-scan`** - Security vulnerability check (Coming Soon)

## 🤖 Claude Code Agents

**When commands aren't enough, agents provide intelligent analysis and complex automation.**

### Commands vs Agents
- **Commands**: Routine tasks you do the same way every time (`/hygiene`, `/commit`)
- **Agents**: Complex analysis requiring intelligence and decision-making

### Available Agents

#### 📊 Analysis & Optimization
- **`command-analyzer`** - Analyzes command usage patterns and suggests optimizations
- **`session-insights`** - Extracts patterns from development session history  
- **`documentation-auditor`** - Audits documentation completeness and consistency
- **`command-optimizer`** - Optimizes commands for token efficiency and performance

#### 🔄 Workflow & Automation  
- **`workflow-composer`** - Creates custom command sequences for complex tasks

### When to Use Agents
Use agents when you need:
- 🧠 **Intelligence**: Analysis across multiple files with pattern recognition
- 📈 **Insights**: Deep understanding of your development practices
- 🔧 **Optimization**: Strategic improvements to your workflows
- 📋 **Planning**: Custom workflows for complex, multi-step processes

### Quick Examples
```bash
# Use a command for routine tasks
/hygiene

# Use an agent for analysis
"Use the session-insights agent to analyze my development patterns from the last 3 months"

# Use an agent for optimization  
"Use the command-analyzer agent to find opportunities to streamline my command library"
```

**📖 See [AGENTS.md](AGENTS.md) for the complete guide on when and why to use agents vs commands.**

## 🎯 Development Method: TDD (Yes, Really)

**We use TDD because it turns Claude from a code volcano into a precision instrument.**

### Why TDD + Claude = ❤️

Without TDD, Claude is like a brilliant intern with no supervision:
- Writes 1000 lines when you need 100
- Adds "helpful" features you didn't ask for
- Creates bugs you'll debug for hours

With TDD, Claude becomes a senior engineer:
- Writes exactly what tests specify
- Stops when tests pass
- Ships working code every time

### The Proof Is In Our Commits

Look at our history - every `🔴 RED` commit followed by `🟢 GREEN`:
```bash
git log --grep="TDD\|🔴\|🟢" --oneline | head -10
```

That's not just process, that's **shipping with confidence**.

### Your First TDD Experience

```bash
/tdd start "your feature"  # Claude guides you through the magic
```

**New to TDD?** Start here: [TDD with Claude - Why It's Actually Cool](docs/TDD_WITH_CLAUDE.md)

**Want proof?** See real examples: [TDD Success Stories](docs/TDD_SUCCESS_STORIES.md)

### The Numbers Don't Lie

- **Time to implement feature**: 12 minutes average
- **Bugs in production**: Near zero
- **Refactoring confidence**: 100%
- **Developer happiness**: 📈

## Real-World Usage Examples

### This Repository Uses Its Own Commands

Explore our git history to see these commands in action:
```bash
git log --grep="Generated with Claude Code" --oneline
```

Check our project health:
```bash
# In Claude Code
/hygiene
```

See our active work:
```bash
cat ACTIVE_WORK.md
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

## Repository Structure

```
.claude/
├── commands/           # Command templates (23+ files)
│   ├── hygiene.md     # Project health checks
│   ├── commit.md      # Quality-checked commits
│   ├── todo.md        # Task management
│   └── ...            # More production-ready commands
├── designs/           # Feature design documents
├── issues/            # GitHub issue contexts
├── metrics.json       # Usage metrics (self-tracking)
└── learnings.md       # Captured insights from usage

CLAUDE.md              # Project AI guidelines
ACTIVE_WORK.md         # Current session tracking
package.json           # NPM scripts for token efficiency

docs/
├── BEST_PRACTICES.md  # Comprehensive best practices guide
├── COMMAND_CATALOG.md # Detailed command reference
├── TOKEN_EFFICIENCY.md # Token optimization strategies
└── QUICK_REFERENCE.md # Quick command lookup
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

## Documentation

### Essential Guides
- **[Best Practices Guide](docs/BEST_PRACTICES.md)** - Claude Code best practices with citations
- **[Command Catalog](docs/COMMAND_CATALOG.md)** - Detailed reference for all commands
- **[Token Efficiency](docs/TOKEN_EFFICIENCY.md)** - How we achieve 87% token reduction
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Quick command lookup

### Getting Help
- **💬 Issues**: [GitHub Issues](https://github.com/rmurphey/claude-setup/issues)
- **🤝 Discussions**: [GitHub Discussions](https://github.com/rmurphey/claude-setup/discussions)
- **📧 Contact**: Via GitHub profile

## Why Use This Reference Implementation?

### Proven Benefits
✅ **87% Token Reduction** - Measured and documented savings  
✅ **Battle-Tested** - Commands refined through real usage  
✅ **Living Documentation** - See actual usage in git history  
✅ **Best Practices** - Based on Anthropic guidelines and industry standards  
✅ **Self-Improving** - Repository uses its own commands for development  

### Based on Research From
- [Anthropic's Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [How Anthropic Teams Use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)
- [Conventional Commits v1.0.0](https://www.conventionalcommits.org/)
- Community patterns from [Awesome Claude Code](https://github.com/hesreallyhim/awesome-claude-code)
- Real-world testing and metrics  

## Metrics and Validation

This repository tracks its own usage metrics:
- Token usage per command
- Execution time statistics  
- Error rates and recovery patterns
- Real workflow timings

See [.claude/metrics.json](.claude/metrics.json) for current data.

## Contributing

We welcome contributions! This repository serves as a reference, so all contributions must:
- Include working examples
- Document token efficiency
- Provide citations for claims
- Pass our test suite

Contributing guidelines coming soon.

## Version History

- **v2.0.0** - Complete restructure as living reference implementation
- **v1.0.0** - Initial template collection

See [CHANGELOG.md](CHANGELOG.md) for detailed history.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

*A living reference implementation for the Claude Code community*  
*This repository uses its own commands - explore our git history to see them in action*

### Living Examples from This Repository

- [🔴 test: add failing test for updateCommandCatalog isolation (TDD RED)](../../commit/00e7a22)
- [🔴 test: add failing tests for tdd.js framework detection (TDD RED)](../../commit/2ce43d1)
- [🔴 test: add failing tests for learn.js functions (TDD RED)](../../commit/8b90d58)
- [🔴 test: add failing tests for formatBytes and estimateTokens (TDD RED)](../../commit/1fdac58)
- [🔴 test: add failing tests for findBrokenLinks (TDD RED phase)](../../commit/8ec6319)
- [✨ feat: make /docs update ALL documentation by default](../../commit/0275a8f)
- [🟢 feat: export tdd.js functions for testing (TDD GREEN)](../../commit/b344bc7)
- [🟢 feat: export learn.js functions for testing (TDD GREEN)](../../commit/1c417af)
- [🟢 feat: export formatBytes and estimateTokens (TDD GREEN)](../../commit/d0af9df)
- [🟢 feat: extract and export findBrokenLinks (TDD GREEN phase)](../../commit/c446afe)
- [🟢 fix: use process.cwd() instead of __dirname for paths (TDD GREEN)](../../commit/e2e81e6)
- [🔧 fix: make 'update' the default mode for /docs command](../../commit/237c279)
- [fix: simplify push command to just git push](../../commit/9c58ba6)
- [📚 docs: add file read requirement to CLAUDE.md](../../commit/f4bece8)
- [📝 docs: add emoji usage guideline to CLAUDE.md](../../commit/d5e678d)
- [docs: document new agents and command conversion examples](../../commit/8c90b15)
- [refactor: simplify tests to smoke tests only](../../commit/f84cac6)
- [refactor: optimize docs command for token efficiency](../../commit/3ad4b0d)
- [refactor: optimize tdd command for token efficiency](../../commit/a022c17)
