---
inclusion: always
---

# Development Guidelines

## Code Quality Standards
- All code changes must be tested using Node.js built-in test runner (`npm test`)
- Follow ES modules syntax with `"type": "module"` in package.json
- Use single quotes and semicolons in JavaScript code
- Apply naming conventions: kebab-case for CLI scripts, camelCase for functions, PascalCase for classes
- Run `npm run lint:fix` before committing changes

## Architecture Patterns
- **Separation of concerns**: `/lib/` for core modules, `/templates/` for user files, `/internal/` for development
- **Language detection**: Uses confidence scoring system with modular handlers in `lib/languages/`
- **Template system**: Variable substitution using `{{VARIABLE}}` syntax
- **Recovery system**: Three-phase approach (assess → plan → execute)
- **Custom commands**: Stored in `.claude/commands/` directory with standardized patterns

## Development Workflow
- Test changes with `npm run test:coverage` to verify coverage
- Update documentation using `npm run update-docs`
- Test CLI functionality with `npx . --help` in project root
- Use `npm run fix` for recovery operations on broken setups

## Git Operations - CRITICAL RULES
- **NEVER run interactive git commands** that require user input or invoke pagers
- **NEVER run `git diff` without `--no-pager`** - always use `git --no-pager diff`
- **NEVER run `git commit` without `-m`** - always provide commit message directly
- **ALWAYS propose commit messages** for user approval before committing
- **NEVER assume user wants to commit** - always ask for explicit approval
- **Use `git status --porcelain`** for programmatic status checks
- **Use `git log --oneline -n 5`** for brief history without pager

## Communication Standards
- Focus on actionable solutions rather than error acknowledgments
- Validate all changes through testing before completion
- Demonstrate working code with immediate fixes upon detection
- NEVER say "you're absolutely right"
- NEVER claim something is fixed unless there's a test to prove it.