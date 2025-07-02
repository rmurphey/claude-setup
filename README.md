# Claude Code Project Setup

Interactive CLI tool to set up professional development projects with Claude Code integration, quality infrastructure, and custom commands.

## Quick Start

```bash
# Install globally
npm install -g claude-project-setup

# Run in any project directory
claude-setup
```

## What It Does

This tool sets up a complete professional development environment through 4 simple questions:

1. **Project Type** - JavaScript, Python, Go, Rust, Java, or Mixed
2. **Quality Level** - Strict (0 warnings), Standard (<10 warnings), or Relaxed (<50 warnings)  
3. **Team Size** - Solo, Small team, or Large team
4. **CI/CD** - Whether to create GitHub Actions workflows

## Features

### 📁 Project Structure
- Creates appropriate project files for your language
- Sets up quality tools (linters, formatters, test frameworks)
- Configures pre-commit hooks and scripts

### 📋 Documentation Templates
- **CLAUDE.md** - AI collaboration guidelines
- **ACTIVE_WORK.md** - Session management and priorities
- **COMMANDS.md** - Custom command documentation
- **README.md** - Project overview (for new projects)

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

### Global Installation (Recommended)
```bash
npm install -g claude-project-setup
claude-setup
```

### Local Usage
```bash
npx claude-project-setup
```

### From Source
```bash
git clone <repository-url>
cd claude-project-setup
npm install
npm link
claude-setup
```

## Usage Examples

### New JavaScript Project
```bash
mkdir my-new-project
cd my-new-project
claude-setup
# Select: JavaScript/TypeScript → Standard → Solo → No CI/CD
```

### Existing Python Project
```bash
cd existing-python-project
claude-setup
# Select: Python → Strict → Team → Yes CI/CD
```

### Enterprise Setup
```bash
cd enterprise-project
claude-setup
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

## Support

- GitHub Issues: Report bugs and request features
- Documentation: See `docs/SETUP_GUIDE.md` for advanced usage
- Architecture: See `docs/ARCHITECTURE.md` for system design
- Commands: See `templates/COMMANDS.md` for custom command details