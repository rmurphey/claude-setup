# Project Structure

## Root Directory Organization

### Core Application
- `bin/cli.js` - Executable CLI entry point with shebang
- `lib/` - Core application modules and language handlers
- `package.json` - NPM package configuration with ES modules

### Templates & Distribution
- `templates/` - User-facing templates for project setup
  - `CLAUDE.md` - AI collaboration guidelines template
  - `ACTIVE_WORK.md` - Session management template
  - `commands/` - Custom Claude command templates
  - `lib/` - Language-specific template files
- `docs/` - User documentation and setup guides

### Development & Internal
- `internal/` - Internal development records (not distributed)
  - `ACTIVE_WORK.md` - Current development session
  - `ARCHITECTURE_DECISIONS.md` - Design decisions log
  - `LEARNINGS.md` - Development insights
- `__tests__/` - Test files using Node.js test runner
- `coverage/` - Test coverage reports (generated)

### Configuration
- `.claude/` - Claude Code integration
  - `commands/` - Custom development commands
  - `settings.local.json` - Local Claude settings
- `.github/` - GitHub workflows and templates
- `.devcontainer/` - Development container configuration

## Key Architectural Patterns

### Separation of Concerns
- **Internal vs Templates**: `/internal/` for development, `/templates/` for users
- **Language Modules**: Each language has dedicated handler in `lib/languages/`
- **Recovery System**: Separate modules for assess/plan/execute phases

### File Naming Conventions
- **Kebab-case**: For CLI scripts and configuration files
- **PascalCase**: For ES module classes (LanguageDetector)
- **camelCase**: For JavaScript functions and variables
- **UPPERCASE**: For markdown documentation files

### Module Organization
```
lib/
├── language-detector.js     # Smart language detection
├── recovery-system.js       # Codebase recovery logic
├── github-api.js           # GitHub integration
├── code-analysis.js        # Static analysis tools
└── languages/              # Language-specific handlers
    ├── javascript.js
    ├── python.js
    ├── go.js
    └── ...
```

### Template Structure
- Variable substitution using `{{VARIABLE}}` syntax
- Consistent command patterns across all languages
- Quality level configuration (strict/standard/relaxed)
- Team size adaptations (solo/small/large)

## Distribution Files
Files included in NPM package (defined in `package.json` files array):
- `bin/` - CLI executable
- `lib/` - Core modules
- `templates/` - User templates
- `docs/` - Documentation
- `README.md` - Main documentation
- `LICENSE` - MIT license

## Ignored Files
- `node_modules/` - Dependencies
- `coverage/` - Generated test reports
- `internal/` - Development records
- `.git/` - Version control
- Test directories and temporary files