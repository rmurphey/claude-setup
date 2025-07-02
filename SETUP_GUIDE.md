# Interactive Claude Code Setup Guide

This guide enables Claude Code to set up any project with professional development standards through a simple conversational interface.

## 🎯 Core Setup Process

### 1. Project Detection

**For Empty Repositories:**
- Check for existing files (package.json, Cargo.toml, pyproject.toml, go.mod)
- If none found, ask user to specify project type
- Create appropriate project structure

**For Existing Projects:**
- Analyze existing structure to determine language/framework
- Assess current quality infrastructure
- Plan incremental improvements

### 2. Interactive Questions

Ask user these 4 questions:

#### Project Type
- JavaScript/TypeScript
- Python
- Go
- Rust
- Java
- Mixed/Other

#### Quality Level
- **Strict** - Zero warnings allowed, maximum automation
- **Standard** - Reasonable thresholds, balanced approach
- **Relaxed** - Warnings okay, errors blocked only

#### Team Size
- **Solo** - Individual developer workflow
- **Small** - 2-5 people, basic collaboration
- **Team** - 6+ people, full CI/CD and review processes

#### CI/CD Preference
- **Yes** - Set up GitHub Actions workflows
- **No** - Local tools only

### 3. Language-Specific Setup

#### JavaScript/TypeScript
```bash
# Initialize if needed
npm init -y

# Install quality tools
npm install --save-dev eslint prettier jest

# Configuration files
.eslintrc.js
.prettierrc
jest.config.js
```

#### Python
```bash
# Project structure
touch requirements.txt
touch pyproject.toml

# Configuration
pyproject.toml (with ruff, black config)
pytest.ini
```

#### Go
```bash
# Initialize if needed
go mod init project-name

# Tools installed globally
golangci-lint
```

#### Rust
```bash
# Initialize if needed
cargo init .

# Configuration
Cargo.toml
clippy.toml
```

#### Java
```bash
# Initialize if needed (Gradle)
gradle init

# Configuration
build.gradle
checkstyle.xml
```

### 4. Quality Infrastructure

#### Always Install:
- Language-appropriate linter
- Code formatter
- Testing framework
- Pre-commit hooks
- Basic scripts (lint, test, format)

#### Standard/Strict Adds:
- Documentation templates
- Custom Claude commands
- Quality thresholds
- Automated monitoring

#### Team Adds:
- GitHub Actions workflows
- Code review templates
- Collaboration guidelines

### 5. Documentation System

Create these files:

#### CLAUDE.md
```markdown
# Project AI Guidelines

## Development Workflow
- Always run quality checks before commits
- Use /todo for task tracking
- Document insights in LEARNINGS.md

## Quality Standards
- [Language]: Zero errors, <10 warnings
- Test coverage: 50% minimum
- File size limit: 400 lines
```

#### ACTIVE_WORK.md
```markdown
# Active Work - Current Session Focus

## Next Session Priorities
[Template for session management]

## Quality Status
[Current metrics and thresholds]
```

#### docs/DEVELOPMENT_STANDARDS.md
```markdown
# Development Standards

## Code Quality
- Complexity: <15 per function
- File size: <400 lines
- Test coverage: 50% minimum

## Architecture
- Modular design
- Clear separation of concerns
- Comprehensive error handling
```

### 6. Custom Commands Setup

Create `.claude/commands/` directory with:

- `hygiene` - Project health check
- `todo` - Task management
- `design` - Feature planning
- `commit` - Quality-checked commits
- `next` - Priority recommendations
- `learn` - Capture insights
- `docs` - Documentation updates

### 7. CI/CD Configuration (if requested)

#### GitHub Actions
```yaml
name: Quality Check
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup [Language]
      - name: Install dependencies
      - name: Run linting
      - name: Run tests
```

## 🔧 Implementation Guidelines

### For Claude Code:

1. **Always ask the 4 questions first** - don't assume project preferences
2. **Detect language automatically when possible** - but confirm with user
3. **Create minimal viable setup** - can be enhanced later
4. **Test commands after setup** - ensure everything works
5. **Provide next steps** - clear guidance for first development session

### Quality Thresholds by Level:

#### Strict
- 0 warnings allowed
- 70% test coverage target
- All commits must pass quality gates

#### Standard  
- <10 warnings (green), 10-25 warnings (yellow), 25+ warnings (red)
- 50% test coverage minimum
- Errors block commits, warnings allowed

#### Relaxed
- <50 warnings acceptable
- 30% test coverage minimum
- Only errors block commits

### Project Structure Examples:

#### Empty JavaScript Project
```
project-name/
├── package.json
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── .gitignore
├── README.md
├── CLAUDE.md
├── ACTIVE_WORK.md
├── src/
│   └── index.js
├── tests/
│   └── index.test.js
└── .claude/
    └── commands/
```

#### Empty Python Project
```
project-name/
├── pyproject.toml
├── requirements.txt
├── pytest.ini
├── .gitignore
├── README.md
├── CLAUDE.md
├── ACTIVE_WORK.md
├── src/
│   └── main.py
├── tests/
│   └── test_main.py
└── .claude/
    └── commands/
```

## 🎯 Success Indicators

After setup, verify:
- [ ] Quality tools installed and configured
- [ ] Pre-commit hooks working
- [ ] Basic project structure created
- [ ] Documentation templates in place
- [ ] Custom commands functional
- [ ] CI/CD configured (if requested)
- [ ] `/hygiene` command shows green status

## 🔄 Maintenance

Set up automated quality monitoring:
- Daily warning count checks
- Dependency security scanning
- Documentation freshness verification
- Test coverage tracking

The setup creates a foundation that prevents quality debt accumulation rather than requiring reactive cleanup.