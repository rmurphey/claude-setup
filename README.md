# Claude Code Project Setup

Interactive CLI tool to set up professional development projects with Claude Code integration, quality infrastructure, and ongoing development record system.

## Quick Start

**Prerequisites**: Node.js 16+ and Git 

- [Beginner setup guide](#beginner-setup-guide)

```bash
# Run in your project directory
npx github:rmurphey/claude-setup
```

Choose from 2 main modes plus DevContainer generation:
- **🚀 Set up new project infrastructure** - Complete development environment setup
- **🏥 Assess and recover existing codebase** - Analysis and improvement system
- **📦 Generate DevContainer configuration** - Quick utility for GitHub Codespaces

## Overview

Claude Setup transforms any directory into a professional development environment with quality tools, documentation systems, and structured workflows. Perfect for new projects, legacy codebases, or teams establishing consistent standards.

**Key Benefits:**
- ✅ **Zero Configuration** - Works out of the box for 5+ languages
- ✅ **Professional Standards** - Industry-grade quality tools and workflows
- ✅ **Team Consistency** - Standardized development practices across projects
- ✅ **AI Integration** - 14 custom Claude Code commands for structured collaboration
- ✅ **Memory System** - Documentation that maintains project knowledge across sessions

**Who Should Use This:**
- Developers starting new projects
- Teams inheriting legacy codebases
- Organizations standardizing development practices
- Solo developers wanting professional-grade infrastructure

## Setup Mode

Creates complete professional development environments through 4 simple questions:

1. **Project Type** - JavaScript, Python, Go, Rust, Java, or Mixed
2. **Quality Level** - Strict (0 warnings), Standard (<10 warnings), or Relaxed (<50 warnings)  
3. **Team Size** - Solo, Small team, or Large team
4. **CI/CD** - Whether to create GitHub Actions workflows

### What You Get
- **Quality Infrastructure** - Linters, formatters, tests configured for your language
- **Documentation System** - CLAUDE.md, ACTIVE_WORK.md, and project templates
- **14 Custom Commands** - `/hygiene`, `/todo`, `/commit`, `/learn`, etc.
- **Git Repository** - Initialized with professional setup committed
- **CI/CD Workflows** - GitHub Actions for quality checks (optional)

### Use Cases
- New projects starting from scratch
- Existing projects needing professional infrastructure
- Teams establishing consistent development standards
- Solo developers wanting professional-grade setup

## Recovery Mode

Comprehensive analysis and improvement system for projects with technical debt or maintenance challenges.

### The 3-Command Workflow

**`/recovery-assess`** - Analyze codebase health (0-100 score)  
**`/recovery-plan`** - Generate prioritized improvement roadmap  
**`/recovery-execute`** - Apply automated improvements  

### Use Cases
- Legacy codebases with accumulated technical debt
- Inherited projects without clear standards
- Rapid prototypes that need production-ready infrastructure
- Team transitions requiring consistent development practices

## DevContainer Generation

Quick utility to generate optimized `.devcontainer/devcontainer.json` configurations for GitHub Codespaces and VS Code dev containers.

**Features:**
- Language-specific base images and extensions
- Optimized package manager configurations
- Performance optimizations (parallel execution, caching)
- Error-resilient setup commands

**Supported Languages:** JavaScript/TypeScript, Python, Go, Rust, Java

## Usage Examples

### New JavaScript Project
```bash
mkdir my-new-project
cd my-new-project
npx github:rmurphey/claude-setup
# Select: JavaScript → Standard → Solo → No CI/CD
```

### Legacy Codebase Recovery
```bash
cd inherited-legacy-project
npx github:rmurphey/claude-setup
# Select: 🏥 Assess and recover existing codebase
# Then run: /recovery-assess → /recovery-plan → /recovery-execute
```

### DevContainer for GitHub Codespaces
```bash
cd any-project
npx github:rmurphey/claude-setup
# Select: 📦 Generate DevContainer configuration → Python
# Creates .devcontainer/devcontainer.json ready for Codespaces
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

## Language Support

### JavaScript/TypeScript
- **Setup**: Creates `package.json` with quality scripts
- **Tools**: ESLint, Prettier, Jest configuration
- **DevContainer**: Node.js 18, npm ci with caching
- **CI/CD**: GitHub Actions workflow for Node.js

### Python
- **Setup**: Creates `pyproject.toml` with Ruff and Pytest config
- **Tools**: Comprehensive linting rules, type checking
- **DevContainer**: Python 3.11, pip with caching
- **CI/CD**: GitHub Actions workflow for Python

### Go
- **Setup**: Instructions for `go mod` and `golangci-lint`
- **Tools**: Basic project structure, linting config
- **DevContainer**: Go 1.21, mod download optimization
- **CI/CD**: GitHub Actions workflow for Go

### Rust
- **Setup**: Instructions for `cargo init`
- **Tools**: Clippy configuration, Cargo integration
- **DevContainer**: Latest Rust, cargo fetch optimization
- **CI/CD**: GitHub Actions workflow for Rust

### Java
- **Setup**: Instructions for Gradle/Maven
- **Tools**: Checkstyle configuration, build integration
- **DevContainer**: Java 17, dependency caching
- **CI/CD**: GitHub Actions workflow for Java

## Installation & Setup

### NPX Usage (Recommended)
```bash
# Run once in any project directory
npx github:rmurphey/claude-setup
```

### Global Installation
```bash
npm install -g github:rmurphey/claude-setup
claude-setup
```

### Local Development
```bash
git clone https://github.com/rmurphey/claude-setup.git
cd claude-setup
npm install
npm link
claude-setup
```

### After Setup
1. **Install dependencies** as shown by the tool
2. **Connect to remote repository** (if desired)
3. **Run quality check**: `npm run lint` (or equivalent)
4. **Review CLAUDE.md** for AI collaboration guidelines
5. **Start coding** with professional standards in place

## Advanced Features

### Ongoing Development Record System

The tool creates a **persistent memory system** that maintains project knowledge across sessions:

**CLAUDE.md** - AI collaboration guidelines with quality standards, architecture principles, and project-specific development workflows.

**ACTIVE_WORK.md** - Session management with current priorities, quality metrics, quick task capture, and chronological development history.

**COMMANDS.md** - Custom command documentation with implementation details, usage examples, and integration patterns.

### Custom Commands Suite

14 specialized commands for structured development:

**Core Workflow**
- `/hygiene` - Project health check
- `/todo` - Quick task capture
- `/commit` - Quality-checked commits
- `/next` - AI-recommended priorities

**Planning & Design**
- `/design` - Feature planning
- `/estimate` - Work estimation
- `/defer` - Postpone tasks with reasons

**Learning & Growth**
- `/learn` - Capture insights
- `/reflect` - Session reflection
- `/docs` - Documentation updates

**Maintenance**
- `/push` - Reviewed pushes
- `/version-tag` - Release management
- `/maintainability` - Code health analysis
- `/idea` - Idea capture

### CI/CD Integration

Optional GitHub Actions workflows with:
- Quality checks on every push/PR
- Language-specific testing and linting
- Coverage reporting
- Dependency security scanning

## Contributing & Support

### Contributing
1. Fork the repository
2. Create a feature branch
3. Run the setup tool on your branch: `npx github:rmurphey/claude-setup`
4. Make your changes
5. Submit a pull request

### Getting Help
- **Documentation Issues**: Open an issue with the "documentation" label
- **Feature Requests**: Open an issue with the "enhancement" label
- **Bug Reports**: Include your platform, Node.js version, and error output

## Troubleshooting

### Common Issues

**Command not found after installation**
```bash
# Try refreshing your shell or using full path
source ~/.bashrc  # or ~/.zshrc
npx github:rmurphey/claude-setup
```

**Permission errors on npm link**
```bash
# Fix npm permissions or use npx
npm config set prefix ~/.npm
export PATH=~/.npm/bin:$PATH
```

**Git initialization fails**
```bash
# Ensure git is configured
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

## Beginner Setup Guide

### Prerequisites Installation

**Node.js Installation:**
- **macOS**: `brew install node` or download from [nodejs.org](https://nodejs.org)
- **Windows**: Download installer from [nodejs.org](https://nodejs.org)
- **Linux**: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`

**Git Installation:**
- **macOS**: `brew install git` or download from [git-scm.com](https://git-scm.com)
- **Windows**: Download installer from [git-scm.com](https://git-scm.com)
- **Linux**: `sudo apt-get install git`

**Verify Installation:**
```bash
node --version  # Should show v16.0.0 or higher
git --version   # Should show git version info
```

### First Run
1. Create or navigate to your project directory
2. Run `npx github:rmurphey/claude-setup`
3. Follow the interactive prompts
4. Review generated files and run suggested commands

## License

MIT License - see LICENSE file for details.