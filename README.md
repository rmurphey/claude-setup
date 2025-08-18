# Claude Code Command Templates 🚀

**A living reference implementation of professional Claude Code commands and workflows**

[![Version](https://img.shields.io/badge/version-2.0.0-blue)](https://github.com/rmurphey/claude-setup)
[![Commands](https://img.shields.io/badge/commands-17-green)](.claude/commands/)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)
[![Token Efficiency](https://img.shields.io/badge/token%20savings-87%25-orange)](docs/TOKEN_EFFICIENCY.md)
[![Agent Audit](https://github.com/rmurphey/claude-setup/workflows/Agent%20Audit%20with%20Claude%20Code/badge.svg)](https://github.com/rmurphey/claude-setup/actions/workflows/agent-audit.yml)

## What This Is

This is a **working reference repository** that demonstrates best practices for Claude Code command development. The commands in `.claude/commands/` are actively used in this repository's development, making it a living example of the patterns it teaches.

## Quick Start (Choose Your Method)

### Method 1: Direct Use via NPX (No Installation)
```bash
# Try the tools without installing anything
npx claude-setup                     # Initialize in current project
npx claude-setup learn add "insight" # Capture a learning
npx claude-setup tdd start           # Start TDD workflow
npx claude-setup docs                # Analyze documentation
npx claude-setup monitor status      # Check repo health
```

### Method 2: Global Installation
```bash
# Install globally for frequent use
npm install -g claude-setup
claude-setup          # Initialize commands
claude-learn add "insight"
claude-tdd start
claude-docs
claude-monitor status
```

### Method 3: Clone Repository
```bash
# Clone and use as your project base
git clone https://github.com/rmurphey/claude-setup.git my-project
cd my-project
# Commands are ready to use in .claude/commands/
```

## Why This Repository is Useful, Maybe

✅ **Living Reference**: This repo uses its own commands - see our git history  
✅ **Token-Efficient**: 87% reduction through npm script delegation ([proven metrics](docs/TOKEN_EFFICIENCY.md))  
✅ **Best Practices**: Based on Anthropic's guidelines and 2025 industry standards  
✅ **Production-Tested**: Commands refined through real-world usage  
✅ **Self-Documenting**: The repository demonstrates every pattern it teaches

## 🤖 Automated Intelligence Features

This repository includes agents that can use the Claude API for advanced automation:
- **Automated agent quality audits** via GitHub Actions
- **Intelligent code analysis** beyond simple pattern matching
- **Deep project insights** using Claude's reasoning capabilities

👉 **[See API Setup Guide](docs/API_SETUP.md)** for configuration instructions

## 🎯 Repository Philosophy: Teaching Through Balance

This repository demonstrates various ways of setting up Claude Code commands, including methods that limit token usage. You'll see these three methods:

| Approach | Token Cost | Best For | Example |
|----------|------------|----------|---------|
| **Direct Implementation** | ~2000 tokens | Learning patterns, one-off tasks, custom logic | Claude analyzes and formats commits directly |
| **Script Delegation** | ~100 tokens | Repetitive tasks, stable operations | `npm run lint` instead of manual checks |
| **Hybrid Approach** | ~500 tokens | Complex orchestration, intelligent automation | Script collects data, Claude makes decisions |

### When to Use Each Approach

**Use Direct Implementation when:**
- Teaching or learning new patterns
- Solving unique, one-time problems
- Customization is more valuable than efficiency
- You need to see Claude's problem-solving process

**Use Script Delegation when:**
- The task is repetitive and well-defined
- The logic rarely changes
- Speed and consistency matter more than flexibility
- You're doing the same thing multiple times per session

**Use Hybrid Approach when:**
- You need both efficiency and intelligence
- The task has stable parts and variable parts
- You want to leverage existing tools with AI judgment
- Real-world complexity requires both patterns

Each command in this repository includes metadata showing its approach and typical token usage, helping you understand the real costs and benefits of different patterns.

## Command Categories

### 🎯 Core Workflow Commands
- **`/hygiene`** - Comprehensive project health check ([view command](.claude/commands/hygiene.md))
- **`/todo`** - Task management with ACTIVE_WORK.md ([view command](.claude/commands/todo.md))
- **`/commit`** - Quality-checked commits ([view command](.claude/commands/commit.md))
- **`/next`** - AI-recommended next steps ([view command](.claude/commands/next.md))


### 📚 Documentation & Learning
- **`/docs`** - Documentation generation ([view command](.claude/commands/docs.md))
- **`/learn`** - Capture insights ([view command](.claude/commands/learn.md))

### 🚀 Release & Quality
- **`/push`** - Push with quality checks ([view command](.claude/commands/push.md))
- **`/tdd`** - Test-driven development workflow ([view command](.claude/commands/tdd.md))

## 🤖 Claude Code Agents

**When commands aren't enough, agents provide intelligent analysis and complex automation.**

### Commands vs Agents
- **Commands**: Routine tasks you do the same way every time (`/hygiene`, `/commit`)
- **Agents**: Complex analysis requiring "intelligence" and decision-making

### Available Agents

#### 📊 Analysis & Optimization
- **`command-analyzer`** - Analyzes command usage patterns and suggests optimizations
- **`session-insights`** - Extracts patterns from development session history  
- **`documentation-auditor`** - Audits documentation completeness and consistency
- **`repo-quality-auditor`** - Comprehensive repository audit for completeness and conflicts

#### 🎯 Planning & Guidance
- **`next-priorities`** - Analyzes project state to recommend next development priorities
- **`usage-estimator`** - Provides intelligent Claude usage estimates for development tasks

#### 🧪 Testing & Quality
- **`test-coverage-advisor`** - Identifies untested code and recommends testing opportunities
- **`agent-auditor`** - Audits other agents for quality, correctness, and relevance

### When to Use Agents
Use agents when you need:
- 🧠 **Analysis**: Analysis across multiple files with pattern recognition
- 📈 **Insights**: Deep understanding of your development practices
- 🔧 **Optimization**: Strategic improvements to your workflows
- 📋 **Planning**: Custom workflows for complex, multi-step processes
- 🤖 **Self-Maintenance**: Automated quality audits via GitHub Actions

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

## Development Method

This repository uses Test-Driven Development (TDD) which helps Claude write focused, correct code. 
See [TDD with Claude Guide](docs/TDD_WITH_CLAUDE.md) for why it works so well with AI assistance.

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

## Real-World Example Workflow

### Feature Development Flow

```bash
# 1. Check project health
/hygiene
# Output: ✅ All checks passing

# 2. Start with TDD
/tdd start "new feature"
# Creates test file and guides through red-green-refactor

# 3. Track your work
/todo add "Write failing tests"
/todo add "Implement feature"
/todo add "Refactor and optimize"

# 4. Capture learnings
/learn "TDD helps clarify requirements before coding"

# 5. Make quality-checked commits
/commit feat "add new feature with tests"
# Runs: lint, tests before committing

# 6. Push when ready
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
/commit
# Enforces small, focused commits (1-3 files)

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
`/todo`, `/next`, `/hygiene`

### 📝 Documentation & Learning
`/docs`, `/learn`, `/retrospective`

### 🔧 Development Workflow
`/commit`, `/push`, `/tdd`

## Understanding Command Templates

Each command is a structured markdown file that guides Claude through specific workflows:

```markdown
---
allowed-tools: [Bash, Read, Write]  # Tools Claude can use
description: Brief command description
---

# Command Name

Detailed instructions for Claude to execute...

When you type `/<command>` in Claude Code:
1. Claude reads the template from `.claude/commands/<command>.md`
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
├── learnings/         # Monthly learning archives
├── agents/            # Claude Code agents
└── session-history/   # Development session archives

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

### Continuous Testing
Run tests automatically as you code:
```bash
npm run test:watch    # Node.js watch mode - reruns on file changes
```

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

### Informed By ... 
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

## 🤖 Automated Agent Audits

This repository uses Claude Code CLI to automatically audit agents via GitHub Actions.

**Quick Setup**: Add `ANTHROPIC_API_KEY` to GitHub Secrets → Actions

👉 **[Complete API Setup Guide](docs/API_SETUP.md)** - Detailed configuration, security, and troubleshooting

The audit runs weekly and validates agent quality using Claude's intelligence, not just pattern matching. See `.claude/agents/agent-auditor.md` for the audit logic.

## Contributing

This repository serves as a reference, so all contributions must:

- Include working examples
- Document token efficiency
- Provide citations for claims
- Pass our test suite
- Include tests as appropriate

## Version History

- **v2.0.0** - Complete restructure as living reference implementation
- **v1.0.0** - Initial template collection

See [CHANGELOG.md](CHANGELOG.md) for detailed history.

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

*A living reference implementation for the Claude Code community*  
*This repository uses its own commands - explore our git history to see them in action*

### 📚 Living Examples: Learning from Our History

Explore how we use our own tools in practice. Each example demonstrates a key principle:

#### Simplification & Token Efficiency  
- [feat: remove all detailed command variants for token efficiency](../../commit/0e46070) — Less is more
- [feat: remove 3 more complex maintenance commands](../../commit/993dd82) — Ruthless simplification
- [refactor: remove script tests in favor of utility testing](../../commit/18f164d) — Focus testing effort

#### Architecture & Design
- [feat: rewrite setup.js with intelligent conflict handling](../../commit/3adfa17) — Smart automation
- [feat: add repo-quality-auditor agent for comprehensive quality analysis](../../commit/e498add) — Agent vs command pattern
- [refactor: reorganize ACTIVE_WORK.md with simplified planning structure](../../commit/870aede) — Evolving workflow

#### Continuous Improvement
- [fix: update docs script to count all commands recursively](../../commit/30f57e8) — Iterative refinement
- [docs: add critical instruction to always use date command](../../commit/33b2c2f) — Learning from mistakes
