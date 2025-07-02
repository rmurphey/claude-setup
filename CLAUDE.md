# CLAUDE.md - Claude Setup Project Guidelines

## Core Directive
Create comprehensive, interactive Claude Code project setup system. Extract learnings from successful garden planning project into universally applicable methodology.

## Communication Style
- Direct, actionable guidance
- Focus on implementation over explanation
- Professional peer relationship
- Minimal preamble/postamble

## Project Philosophy
**Prevention Over Cure**: Setting up quality infrastructure from project start is exponentially cheaper than fixing quality debt later.

**Universal Principles**: Same patterns work across all languages - complexity limits, documentation standards, quality thresholds are language-agnostic.

**Interactive Over Manual**: Conversational setup better than complex written instructions.

## Setup System Requirements

### Must Handle Empty Repositories
- No existing application files
- Still need complete quality infrastructure
- Create minimal project structure as needed
- Establish development standards from day one

### Language Detection Priority
1. Check for existing config files (package.json, Cargo.toml, etc.)
2. Ask user if ambiguous or missing
3. Create appropriate project structure
4. Install language-specific quality tools

### Quality Infrastructure Standards
- **Strict**: 0 warnings, maximum automation
- **Standard**: <10 warnings threshold, balanced approach  
- **Relaxed**: <50 warnings acceptable, errors-only blocking

### Documentation Templates
Always create:
- CLAUDE.md (project-specific AI guidelines)
- ACTIVE_WORK.md (session management)
- DEVELOPMENT_STANDARDS.md (quality rules)
- README.md (project overview)

### Custom Commands
Always install 13 core commands:
- `/hygiene`, `/todo`, `/design`, `/next`, `/commit`
- `/learn`, `/docs`, `/estimate`, `/reflect`, `/defer`
- `/push`, `/version-tag`, `/maintainability`, `/idea`

## Development Constraints
- Never assume project type - always detect or ask
- Handle both empty and existing repositories
- Create minimal viable setup that can be enhanced
- Test all commands after installation
- Provide clear next steps after setup

## Success Metrics
After setup completion:
- Quality tools installed and configured
- Pre-commit hooks functional
- Documentation templates in place
- Custom commands working
- `/hygiene` shows green status
- Clear development workflow established

## Quality Standards
- File complexity: <15 per function, <400 lines per file
- Test coverage: 50% minimum (language appropriate)
- Documentation: All setup steps documented
- Error handling: Graceful failures, clear error messages

## Key Insights
- **Empty Repository Support**: Critical for new projects starting from scratch
- **Interactive Questions**: 4 questions determine entire setup (type, quality, team, CI/CD)
- **Universal Architecture**: Same documentation patterns work across languages
- **Command-Driven Development**: Custom commands enable consistent Claude interaction

## Memory
- Setup system must work for completely empty repositories
- Quality infrastructure needed before any application code
- Interactive approach scales better than complex instructions
- Prevention architecture exponentially cheaper than reactive fixes