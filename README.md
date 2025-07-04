# Claude Code Project Setup

Interactive CLI tool to set up professional development projects with Claude Code integration, quality infrastructure, and ongoing development record system.

## Quick Start

**Prerequisites**: Node.js 16+ and Git ([beginner setup guide](#beginner-setup-guide))

```bash
# Run in your project directory
npx github:rmurphey/claude-setup
```

Answer 4 questions and get a complete professional development environment with:
- ✅ Quality tools (linters, formatters, tests) configured for your language
- ✅ Documentation templates that maintain project memory across sessions
- ✅ 14 custom Claude Code commands for structured development workflow
- ✅ Git repository initialization with professional setup committed
- ✅ Ongoing development record system that learns from your project

## What It Does

This tool sets up a complete professional development environment through 4 simple questions:

1. **Project Type** - JavaScript, Python, Go, Rust, Java, or Mixed
2. **Quality Level** - Strict (0 warnings), Standard (<10 warnings), or Relaxed (<50 warnings)  
3. **Team Size** - Solo, Small team, or Large team
4. **CI/CD** - Whether to create GitHub Actions workflows

## Features

### 📁 Project Structure
- **Git repository initialization** - Always sets up version control
- Creates appropriate project files for your language
- Sets up quality tools (linters, formatters, test frameworks)
- Configures pre-commit hooks and scripts
- **Initial commit** - Professional setup committed automatically

### 📋 Documentation Templates

Creates an **ongoing development record system** that maintains project memory across sessions:

#### **CLAUDE.md** - AI Collaboration Guidelines
- **Quality Standards**: Configurable thresholds (0 warnings for strict, <10 for standard)
- **Development Workflow**: Pre-commit quality checks, command usage patterns
- **Architecture Principles**: Code complexity limits (<15 per function, <400 lines per code file)
- **Collaboration Guidelines**: Co-author commits, hygiene checks before AI assistance
- **Project Standards**: Coverage targets, documentation requirements, error handling

#### **ACTIVE_WORK.md** - Session Management & Continuity
- **Next Session Priorities**: Immediate tasks with checkboxes
- **Current Sprint Goals**: Broader iteration objectives
- **Quality Status**: Real-time lint/test/coverage/build metrics
- **Quick Capture**: Rapid task entry via `/todo` command with timestamps
- **Deferred Items**: Postponed work via `/defer` command with reasons
- **Learning Log**: Development insights captured via `/learn` command
- **Session History**: Chronological record of all development activities

#### **COMMANDS.md** - Custom Command Documentation
- **Implementation Details**: How each command works and what it does
- **Usage Examples**: Practical examples for all 14 custom commands
- **Integration Patterns**: How commands update documentation files
- **Command Philosophy**: Structured interaction, quality automation, learning capture

#### **README.md** - Project Overview
- Created for new projects only (preserves existing README)
- Professional project description template
- Setup and usage instructions
- Contributing guidelines

### ⚡ Custom Commands
Creates 14 custom Claude Code commands in `.claude/commands/`:

- `/hygiene` - Project health check
- `/todo` - Quick task capture
- `/design` - Feature planning
- `/commit` - Quality-checked commits
- `/next` - AI-recommended priorities
- `/learn` - Capture insights
- `/docs` - Update documentation
- `/estimate` - Development cost estimation
- `/reflect` - Weekly development review
- `/defer` - Move items to later
- `/push` - Create commits and push
- `/version-tag` - Semantic versioning
- `/maintainability` - Code quality assessment
- `/idea` - Quick idea capture

### 🔧 Language Support

#### JavaScript/TypeScript
- Creates `package.json` with quality scripts
- Sets up ESLint, Prettier, Jest configuration
- GitHub Actions workflow for Node.js

#### Python
- Creates `pyproject.toml` with Ruff and Pytest config
- Sets up comprehensive linting rules
- GitHub Actions workflow for Python

#### Go
- Provides setup instructions for `go mod` and `golangci-lint`
- Creates basic project structure

#### Rust
- Provides setup instructions for `cargo init`
- Creates Clippy configuration

#### Java
- Provides setup instructions for Gradle/Maven
- Creates Checkstyle configuration

## Installation

### NPX Usage (Recommended)
```bash
# Run once in any project directory
npx github:rmurphey/claude-setup
```

**Why NPX?**
- ✅ Always runs the latest version
- ✅ No global installation clutter  
- ✅ Perfect for one-time project setup
- ✅ Works in any directory immediately

### Alternative Methods

#### Global Installation
```bash
npm install -g github:rmurphey/claude-setup
claude-setup
```

#### Local Development
```bash
git clone https://github.com/rmurphey/claude-setup.git
cd claude-setup
npm install
npm link
claude-setup
```

## Usage Examples

### New JavaScript Project
```bash
mkdir my-new-project
cd my-new-project
npx github:rmurphey/claude-setup
# Select: JavaScript/TypeScript → Standard → Solo → No CI/CD
# Git repo initialized automatically with initial commit
git remote add origin <your-repo-url>
git push -u origin main
```

### Existing Python Project
```bash
cd existing-python-project
npx github:rmurphey/claude-setup
# Select: Python → Strict → Team → Yes CI/CD
```

### Enterprise Setup
```bash
cd enterprise-project
npx github:rmurphey/claude-setup
# Select: Java → Strict → Team → Yes CI/CD
```

## Quality Levels

### Strict
- **0 warnings allowed**
- 70% test coverage target
- All commits must pass quality gates
- Maximum automation and enforcement

### Standard
- **<10 warnings** (Green), 10-25 (Yellow), 25+ (Red)
- 50% test coverage minimum
- Errors block commits, warnings allowed
- Balanced approach for most teams

### Relaxed
- **<50 warnings** acceptable
- 30% test coverage minimum
- Only errors block commits
- Suitable for rapid prototyping

## Ongoing Development Record System

### How It Works Together

The documentation templates and custom commands create a **persistent development intelligence system**:

1. **Session Continuity**: `ACTIVE_WORK.md` maintains state between Claude Code sessions
2. **Progressive Intelligence**: Commands update documentation files, building project knowledge over time
3. **Quality Automation**: `/hygiene` provides real-time project health based on accumulated metrics
4. **Learning Capture**: `/learn` and `/reflect` commands document insights and patterns
5. **Adaptive Recommendations**: `/next` suggests priorities based on project history and current state

### Development Flow Example

```bash
# Start development session
/hygiene                    # Check current project health
/todo "implement user auth" # Add task to ACTIVE_WORK.md

# During development
/learn "API mocking reduces test complexity"  # Capture insight
/commit                     # Quality-checked commit with co-author

# End of session
/reflect                    # Weekly development review
/defer "mobile optimization" # Move non-critical items
```

### Intelligence Accumulation

Over time, your project builds:
- **Pattern Recognition**: What causes issues in your specific project
- **Quality Trends**: How metrics change over development cycles
- **Collaboration Insights**: How AI assistance patterns evolve
- **Technical Debt Tracking**: Deferred items and their impact on velocity

This transforms Claude Code from a one-time conversation tool into a **persistent development partner** that maintains context, learns from your project's evolution, and provides increasingly intelligent recommendations.

## After Setup

### Verify Installation
```bash
# Check project health
/hygiene

# View available commands
cat COMMANDS.md

# Review AI guidelines
cat CLAUDE.md
```

### Next Steps
1. Install language-specific dependencies as instructed
2. Run initial quality checks
3. Review and customize CLAUDE.md for your project
4. Start development with `/todo "first task"`

## Development

### Running Tests
```bash
npm test                 # Run test suite
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

### Linting
```bash
npm run lint             # Check all files
npm run lint:fix         # Fix auto-fixable issues
npm run lint:changed     # Check only changed files
npm run lint:changed:fix # Fix only changed files
```

### Project Structure
```
claude-project-setup/
├── bin/cli.js           # Main CLI script
├── docs/                # System documentation
│   ├── ARCHITECTURE.md  # System design and principles
│   └── SETUP_GUIDE.md   # Detailed setup instructions
├── templates/           # Template files for generated projects
│   ├── CLAUDE.md        # AI collaboration guidelines template
│   ├── ACTIVE_WORK.md   # Session management template
│   └── COMMANDS.md      # Custom commands documentation template
├── __tests__/           # Test suite
├── CLAUDE.md            # This project's AI guidelines
└── README.md            # This file
```

## Philosophy

**Prevention Over Cure**: Setting up quality infrastructure from project start is exponentially cheaper than fixing quality debt later.

**Universal Principles**: The same patterns work across all languages - complexity limits, documentation standards, and quality thresholds are language-agnostic.

**Interactive Over Manual**: Conversational setup is better than complex written instructions.

**Command-Driven Development**: Custom commands enable consistent Claude Code interaction patterns.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Troubleshooting

**Common issues?** See the [Beginner Setup Guide](#beginner-setup-guide) for detailed solutions.

**Still having trouble?**
1. Clear NPX cache: `npx clear-npx-cache`
2. Try the local installation method (see Installation section)
3. Check internet connection and verify you're in the correct directory

## Beginner Setup Guide

### Prerequisites Installation

**Required Programs:**
- **Node.js** (version 16+) - Download from https://nodejs.org (choose LTS version)
- **Git** - Download from https://git-scm.com

**Check if installed:**
```bash
node --version    # Should show v16.0.0 or higher
npm --version     # Should show some version number  
git --version     # Should show some version number
```

**Additional tools** (install after setup based on your project type):
- **Python**: https://python.org (3.8+)
- **Go**: https://golang.org  
- **Rust**: https://rustup.rs
- **Java**: https://adoptium.net (JDK 11+)

### Using the Terminal

**Open terminal/command prompt:**
- **Windows**: Search for "Command Prompt" or "PowerShell"
- **Mac**: Search for "Terminal" in Spotlight (Cmd+Space)
- **Linux**: Look for "Terminal" in applications

**Navigate to your project location:**
```bash
cd Desktop                    # Go to Desktop
mkdir my-new-project         # Create new folder
cd my-new-project           # Enter that folder
npx github:rmurphey/claude-setup  # Run setup
```

### Common Issues

**"npx: command not found"**
- Install Node.js from https://nodejs.org

**"git: command not found"**  
- Install Git from https://git-scm.com
- Mac: Try `xcode-select --install` first

**"Permission denied"**
- Windows: Run as Administrator
- Mac/Linux: Try `sudo` before command

**"Failed to create initial commit"**
- Configure git first:
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

## Support

- GitHub Issues: Report bugs and request features
- Documentation: See `docs/SETUP_GUIDE.md` for advanced usage
- Architecture: See `docs/ARCHITECTURE.md` for system design
- Commands: See `templates/COMMANDS.md` for custom command details