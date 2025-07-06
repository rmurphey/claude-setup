# Claude Setup System Architecture

## Core Design Principles

### Prevention Over Cure
Setting up quality infrastructure from project start is exponentially cheaper than fixing quality debt later. The system front-loads all quality tooling.

### Universal Patterns
Same documentation and command patterns work across all programming languages. Quality thresholds and complexity limits are language-agnostic.

### Interactive Configuration
Four simple questions determine the entire setup:
1. **Project Type** - Determines tooling and templates
2. **Quality Level** - Sets warning thresholds and automation
3. **Team Size** - Influences collaboration features and CI/CD
4. **CI/CD Preference** - Adds GitHub Actions workflows

### Command-Driven Development
Custom commands in `.claude/commands/` provide consistent interaction patterns between humans and Claude Code.

## System Components

### 1. CLI Interface (`bin/cli.js`)
- Interactive questionnaire using Inquirer
- Orchestrates setup process
- Provides user feedback and error handling

### 2. Documentation Templates (`templates/`)
- **CLAUDE.md** - AI collaboration guidelines
- **ACTIVE_WORK.md** - Session management template
- **README.md** - Includes comprehensive command system documentation

### 3. Language Handlers
- **JavaScript/TypeScript** - package.json, ESLint, Prettier, Jest
- **Python** - pyproject.toml, Ruff, Pytest
- **Go** - go.mod instructions, golangci-lint
- **Rust** - Cargo.toml instructions, Clippy
- **Java** - Gradle/Maven instructions, Checkstyle

### 4. Quality Infrastructure
- Pre-commit hooks
- Linting and formatting rules
- Test framework configuration
- Coverage reporting
- CI/CD workflow generation

### 5. Custom Commands System
14 standardized commands for project management:
- **Project Health**: `hygiene`, `maintainability`  
- **Task Management**: `todo`, `next`, `defer`
- **Development**: `design`, `estimate`, `commit`, `push`
- **Documentation**: `docs`, `learn`, `reflect`
- **Utilities**: `version-tag`, `idea`

## Data Flow

```
User Input (4 questions)
    ↓
Configuration Object
    ↓
Language-Specific Setup
    ↓
Template Generation (with variable substitution)
    ↓
File Creation
    ↓
Command Installation
    ↓
CI/CD Setup (if requested)
    ↓
Success Feedback
```

## Quality Levels

### Strict (Zero Tolerance)
- 0 warnings allowed
- 70% test coverage minimum
- All commits blocked on quality failures
- Maximum automation

### Standard (Balanced)
- <10 warnings (Green), 10-25 (Yellow), 25+ (Red)
- 50% test coverage minimum
- Errors block commits, warnings allowed
- Practical for most teams

### Relaxed (Flexible)
- <50 warnings acceptable
- 30% test coverage minimum
- Only errors block commits
- Suitable for rapid prototyping

## Template System

Templates use `{{VARIABLE}}` substitution:
- `{{QUALITY_LEVEL}}` - strict/standard/relaxed
- `{{TEAM_SIZE}}` - solo/small/team
- `{{PROJECT_TYPE}}` - js/python/go/rust/java/other
- `{{WARNING_THRESHOLD}}` - 0/<10/<50
- `{{COVERAGE_TARGET}}` - 70/50/30
- `{{DATE}}` - Current date

## Extension Points

### Adding New Languages
1. Add choice to `questions` array
2. Create `setup{Language}()` function
3. Add case to `setupLanguage()` switch
4. Create language-specific templates

### Adding New Commands
1. Add command name to `commands` array
2. Document in README.md "Custom Commands Suite" section
3. Create implementation template

### Adding New Quality Levels
1. Add choice to quality level question
2. Update template substitution logic
3. Update documentation

## Error Handling Strategy

- **Graceful Degradation**: Continue setup even if some steps fail
- **Clear Error Messages**: User-friendly error descriptions
- **Recovery Instructions**: Tell users how to fix issues
- **Exit Codes**: Proper exit codes for CI/CD integration

## Testing Strategy

- **Unit Tests**: Individual function testing
- **Integration Tests**: Full workflow testing
- **Template Tests**: Verify correct template generation
- **Language Tests**: Each language setup path
- **Error Tests**: Failure scenario handling

## File Organization

```
claude-project-setup/
├── bin/cli.js              # Main CLI entry point
├── docs/                   # System documentation
│   ├── ARCHITECTURE.md     # This file
│   └── SETUP_GUIDE.md      # User setup instructions
├── templates/              # Template files for generated projects
│   ├── CLAUDE.md           # AI guidelines template
│   ├── ACTIVE_WORK.md      # Session management template
│   └── (Commands documented in README.md)
├── __tests__/              # Test suite
└── README.md               # Public documentation
```

## Memory and State Management

The system is **stateless** - each run is independent. Project state is maintained through:
- Generated documentation files (CLAUDE.md, ACTIVE_WORK.md)
- Custom commands that read/write project files
- Git history and project structure analysis

This design enables the system to work with both empty repositories and existing projects without complex state tracking.