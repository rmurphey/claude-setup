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

## Memory & Project Context

### Core Project Identity
- **Mission**: Interactive CLI tool transforming directories into professional development environments
- **Target**: Supports 6+ languages (JS/TS, Python, Go, Rust, Java, Swift) with universal quality standards
- **Distribution**: NPX package `npx github:rmurphey/claude-setup` with global npm installation option

### Critical Implementation Rules

#### Repository Support Requirements
- **MUST work with completely empty repositories** - this is a foundational requirement
- **Quality infrastructure before application code** - infrastructure-first approach
- **Interactive setup via 4 questions** - project type, quality level, team size, CI/CD

#### Test Execution Standards
- **Tests ALWAYS run from root directory** - never change directories unless absolutely necessary
- **Zero tolerance for test errors** - any stderr output, command failures, or warnings = test failure
- **Create test directories within tests** - add to gitignore, clean up before each run
- **All 297 tests must pass** before any commit

#### Development Workflow
- **Never commit without green tests** - pre-commit hooks must pass
- **Never bypass pre-commit hooks** without detailed explanation
- **Incomplete tasks cost money** - mark tasks completed only when fully finished
- **Update task lists** as work progresses using TodoWrite tool

#### File Organization & Structure
- **Build output**: `dist/` directory (NOT `lib/lib/` nesting)
- **Kiro infrastructure**: Located in `.kiro/` directory
  - Hook executor: `.kiro/kiro-hook-executor.js`
  - Specs: `.kiro/specs/` with requirements, design, tasks
  - Steering docs: `.kiro/steering/` (product, structure, tech, tone, validation)
- **Templates**: `templates/` for user-facing files, separate from internal development

#### Meta-Project Complexity
- **Dual nature**: Project provides setup capabilities AND uses those same capabilities internally
- **Internal vs External**: Document learnings from working ON project without affecting project functionality
- **Self-hosting**: This project must exemplify the quality standards it helps others achieve

#### Documentation Maintenance
- **Steering documents**: Keep `.kiro/steering/` updated alongside other docs
- **Architecture**: Update structure.md when file organization changes
- **Product**: Update product.md when features/capabilities change
- **Technology**: Update tech.md when dependencies or tools change

#### Quality Enforcement
- **Prevention over cure**: Exponentially cheaper to establish quality from start
- **Universal patterns**: Same documentation/quality patterns work across all languages  
- **Custom commands**: 13 core commands must be installed and functional
- **Recovery system**: Must handle legacy codebases with `--fix` functionality