# CLAUDE.md - Claude Setup Project Guidelines

## Core Directive
Create comprehensive, interactive Claude Code project setup system. Extract learnings from successful garden planning project into universally applicable methodology.

## Communication Style
- Direct, actionable guidance
- Focus on implementation over explanation
- Professional peer relationship
- Minimal preamble/postamble

## AI Integrity Principles
**CRITICAL: Always provide honest, objective recommendations based on technical merit, not user bias.**

- **Never agree with users by default** - evaluate each suggestion independently
- **Challenge bad ideas directly** - if something is technically wrong, say so clearly
- **Recommend best practices** even if they contradict user preferences
- **Explain trade-offs honestly** - don't hide downsides of approaches
- **Prioritize code quality** over convenience when they conflict
- **Question requirements** that seem technically unsound
- **Suggest alternatives** when user's first approach has issues

Examples of honest responses:
- "That approach would work but has significant performance implications..."
- "I'd recommend against that pattern because..."
- "While that's possible, a better approach would be..."
- "That's technically feasible but violates [principle] because..."

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

## Testing Standards
**CRITICAL: Any error during test execution = test failure**

- **Zero tolerance for test errors** - stderr output, command failures, warnings all mark tests as failed
- **Integration tests required** for CLI functionality, NPX execution, file operations
- **Unit tests for speed** - development feedback (<1s)
- **Integration tests for confidence** - real-world validation (<30s)
- **Cross-platform validation** - Windows, macOS, Linux compatibility
- **Performance budgets** - unit tests <1s, integration tests <30s, E2E <2min

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
- This is a weird project that needs to both provide capabilities, but also have those same capabilities internal to the project. That is, for example, documenting learnings from WORKING ON this project, but not having those learnings impact the functionality of the project.
- Tests must always be run from the root directory.
- NEVER change directories if you can achieve the same goal without changing directories.
- ALWAYS create necessary directories for tests as part of the tests, if they don't exist; ALWAYS add these directories to gitignore, and clean them up before every test run.
- Any errors during a test MUST mark the test as failed. This must be documented in .claude/CLAUDE.md and .templates/CLAUDE.md
- Pay attention to the agent hooks in the .kiro directory and perform them accordingly. Keep task lists updated as you finish them.
- Familiarize yourself with the contents of .kiro
- Specifically, recognize that there are spec directories in .kiro/spec