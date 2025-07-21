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

### 1. CLI Interface (Modular Architecture)
- **Entry Point** (`bin/cli.js`) - Lightweight entry point that delegates to main CLI
- **CLI Main** (`lib/cli/main.js`) - Argument parsing, routing, and error handling
- **Interactive Setup** (`lib/cli/interactive.js`) - User prompts, validation, and configuration
- **Setup Orchestration** (`lib/cli/setup.js`) - Project setup execution and file generation

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
- **ESLint-based Pre-commit Hooks** - Configurable quality levels with lint-staged integration
- **Quality Level Management** - Strict/Standard/Relaxed configurations with dynamic switching
- **Import/Export Validation** - Custom ESLint rules for ES module syntax checking
- **Auto-fix Integration** - Automatic code formatting on commit with fallback handling
- Test framework configuration
- Coverage reporting
- CI/CD workflow generation

### 5. Interactive Setup System
The `InteractiveSetup` class provides robust user interaction with:
- **Smart Language Detection** - Automatically detects project language and offers confirmation
- **Input Validation** - Comprehensive validation of all user inputs with clear error messages
- **Configuration Sanitization** - Normalizes user input (case, aliases, type conversion)
- **Language Override Support** - CLI flag support for non-interactive language selection
- **Error Recovery** - Graceful handling of invalid configurations with helpful feedback

### 6. Custom Commands System
14 standardized commands for project management:
- **Project Health**: `hygiene`, `maintainability`  
- **Task Management**: `todo`, `next`, `defer`
- **Development**: `design`, `estimate`, `commit`, `push`
- **Documentation**: `docs`, `learn`, `reflect`
- **Utilities**: `version-tag`, `idea`

## Data Flow

```
CLI Entry Point (bin/cli.js)
    ↓
CLI Main (argument parsing & routing)
    ↓
Interactive Setup (user prompts & validation)
    ↓
Smart Language Detection
    ↓
Configuration Validation & Sanitization
    ↓
Setup Orchestration
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
- **ESLint Config**: `lib/eslint-configs/strict.js` - All formatting rules enforced
- **Pre-commit**: Auto-fix enabled, no-default-export rule, strict import ordering

### Standard (Balanced)
- <10 warnings (Green), 10-25 (Yellow), 25+ (Red)
- 50% test coverage minimum
- Errors block commits, warnings allowed
- Practical for most teams
- **ESLint Config**: `lib/eslint-configs/base.js` - Balanced rule set
- **Pre-commit**: Import/export validation, reasonable formatting requirements

### Relaxed (Flexible)
- <50 warnings acceptable
- 30% test coverage minimum
- Only errors block commits
- Suitable for rapid prototyping
- **ESLint Config**: `lib/eslint-configs/relaxed.js` - Critical issues only
- **Pre-commit**: Essential syntax validation, warnings allowed

## ESLint-based Pre-commit Hook System

### Architecture Components

**QualityLevelManager** (`lib/quality-levels.js`)
- Dynamic quality level switching
- Configuration persistence in `.git-quality-config.json`
- Automatic ESLint config generation based on selected level

**ESLint Configurations** (`lib/eslint-configs/`)
- **base.js**: Standard configuration with import/export validation
- **strict.js**: Maximum enforcement with auto-fix and formatting rules
- **relaxed.js**: Minimal rules focusing on critical syntax errors

**Pre-commit Integration**
- Enhanced existing `.git/hooks/pre-commit` to use lint-staged
- Fallback to basic linting if lint-staged unavailable
- Cross-platform timeout handling for test execution

**Lint-staged Configuration**
- Processes only staged files for performance
- Automatic ESLint --fix application
- Integration with existing git workflow

### Custom ESLint Rules

**Import/Export Validation**
- ES module syntax enforcement (`import/no-commonjs`, `import/no-amd`)
- Circular dependency detection (`import/no-cycle`)
- Import ordering and grouping (`import/order`)
- Unused import detection with auto-removal

**Code Quality Rules**
- Consistent semicolon usage
- Single quote enforcement
- Proper indentation and spacing
- Variable naming conventions

### Quality Level Switching

Users can dynamically change quality levels using the `QualitySetup` class:
```javascript
import { QualitySetup } from './lib/cli/quality-setup.js';
const setup = new QualitySetup();
await setup.configure(); // Interactive quality level selection
```

### Integration Points

**Husky Integration**
- Automatic husky initialization
- Pre-commit hook enhancement (not replacement)
- Maintains existing hook functionality

**Package.json Scripts**
- `lint-staged` configuration for staged file processing
- Enhanced lint scripts for changed files only
- Prepare script for husky setup

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
├── bin/cli.js              # CLI entry point (delegates to lib/cli/main.js)
├── lib/                    # Core application modules
│   ├── cli/                # CLI-specific modules
│   │   ├── main.js         # CLI orchestration and argument parsing
│   │   ├── interactive.js  # Interactive setup with validation
│   │   ├── setup.js        # Setup orchestration and file generation
│   │   ├── quality-setup.js # Quality level configuration interface
│   │   └── utils.js        # CLI utility functions
│   ├── eslint-configs/     # ESLint configuration modules
│   │   ├── base.js         # Standard quality level configuration
│   │   ├── strict.js       # Strict quality level configuration
│   │   └── relaxed.js      # Relaxed quality level configuration
│   ├── quality-levels.js   # Quality level management system
│   ├── language-detector.js # Smart language detection
│   ├── recovery-system.js  # Codebase recovery logic
│   └── ...                 # Other core modules
├── .kiro/                  # Kiro project management system
│   ├── hooks/              # Automated workflow hooks
│   ├── specs/              # Project specifications (requirements, design, tasks)
│   ├── steering/           # Project steering documents
│   └── kiro-hook-executor.js # Hook execution engine
├── docs/                   # System documentation
│   ├── ARCHITECTURE.md     # This file
│   ├── VALUE_PROPOSITION.md # ROI analysis and user value
│   └── SETUP_GUIDE.md      # User setup instructions
├── templates/              # Template files for generated projects
│   ├── CLAUDE.md           # AI guidelines template
│   ├── ACTIVE_WORK.md      # Session management template
│   └── (Commands documented in README.md)
├── __tests__/              # Test suite
│   ├── cli-main.test.js    # CLI main module tests
│   ├── cli-interactive.test.js # Interactive setup tests
│   ├── code-quality-hook.test.js # ESLint pre-commit hook tests
│   ├── integration-runner.js # Integration test runner
│   └── ...                 # Other test files
├── .git/hooks/pre-commit   # Enhanced pre-commit hook with lint-staged
├── eslint.config.js        # Main ESLint configuration (uses quality levels)
└── README.md               # Public documentation
```

## Memory and State Management

The system is **stateless** - each run is independent. Project state is maintained through:
- Generated documentation files (CLAUDE.md, ACTIVE_WORK.md)
- Custom commands that read/write project files
- Git history and project structure analysis

This design enables the system to work with both empty repositories and existing projects without complex state tracking.