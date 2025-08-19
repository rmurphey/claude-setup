# CLAUDE.md - Project AI Guidelines

## Development Method: TDD

**RECOMMENDED: Use Test-Driven Development for new features**

TDD helps Claude produce more focused, correct code by clarifying requirements upfront and reducing wildly wrong approaches.

### Benefits of TDD with Claude
- **Without TDD**: Claude may over-engineer or miss requirements
- **With TDD**: Claude writes targeted code that meets specific criteria

### TDD Workflow
1. 🔴 **RED**: Write a failing test to define requirements
2. 🟢 **GREEN**: Write minimal code to pass the test
3. 🔄 **REFACTOR**: Improve code with test safety net
4. ✓ **COMMIT**: Ship working, tested code

### The TDD Command
```bash
/tdd start "your feature"  # Guides through the TDD cycle
```

Consider TDD especially for complex features or when requirements are unclear.

## Critical Instructions

**ALWAYS use `date` command for dates** - Never assume or guess dates. Always run `date "+%Y-%m-%d"` when you need the current date for documentation, commits, or any other purpose.

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

## Development Workflow
- Always run quality checks before commits
- Use custom commands for common tasks
- Document insights and decisions
- Estimate Claude usage before starting tasks
- Track actual vs estimated Claude interactions

## Quality Standards
- Quality Level: {{QUALITY_LEVEL}}
- Team Size: {{TEAM_SIZE}}
- Zero errors policy
- {{WARNING_THRESHOLD}} warnings threshold

## Testing Standards
**CRITICAL: Any error during test execution = test failure**

- **Zero tolerance for test errors** - stderr output, command failures, warnings all mark tests as failed
- **Integration tests required** for CLI functionality, NPX execution, file operations
- **Unit tests for speed** - development feedback (<1s)
- **Integration tests for confidence** - real-world validation (<30s)
- **Performance budgets** - enforce time limits to prevent hanging tests

## Markdown Standards
**All markdown files must pass validation before commit**

- **Syntax validation** - Uses remark-lint to ensure valid markdown syntax
- **Consistent formatting** - Enforces consistent list markers, emphasis, and code blocks
- **Link validation** - Checks that internal links point to existing files
- **Auto-fix available** - Run `npm run markdown:fix` to auto-correct formatting issues

### Markdown Quality Checks
- `npm run markdown:lint` - Validate all markdown files
- `npm run markdown:fix` - Auto-fix formatting issues
- Included in `hygiene:quick` and `commit:check` scripts
- CI validates markdown on every push/PR

### Markdown Style Guidelines
- Use `-` for unordered lists
- Use `*` for emphasis, `**` for strong emphasis
- Use fenced code blocks with language tags
- Use `.` for ordered list markers
- Ensure all internal links are valid

## Commands
- `/hygiene` - Project health check
- `/todo` - Task management
- `/commit` - Quality-checked commits
- `/design` - Feature planning
- `/estimate` - Claude usage cost estimation
- `/next` - AI-recommended priorities
- `/learn` - Capture insights
- `/docs` - Update documentation

## Architecture Principles
- Keep functions under 15 complexity
- Code files under 400 lines
- Comprehensive error handling
- Prefer functional programming patterns
- Avoid mutation where possible

## Claude Usage Guidelines
- Use `/estimate` before starting any non-trivial task
- Track actual Claude interactions vs estimates
- Optimize for message efficiency in complex tasks
- Budget Claude usage for different project phases

**Typical Usage Patterns**:
- **Bug Fix**: 10-30 messages
- **Small Feature**: 30-80 messages  
- **Major Feature**: 100-300 messages
- **Architecture Change**: 200-500 messages

## Collaboration Guidelines
- Always add Claude as co-author on commits
- Run `/hygiene` before asking for help
- Use `/todo` for quick task capture
- Document learnings with `/learn`
- Regular `/reflect` sessions for insights

## Project Standards
- Test coverage: 60% minimum
- Documentation: All features documented
- Error handling: Graceful failures with clear messages
- Performance: Monitor code complexity and file sizes
- ALWAYS use atomic commits
- use emojis, judiciously
- NEVER Update() a file before you Read() the file.

### TDD Examples

- [🔴 test: add failing test for updateCommandCatalog isolation (TDD RED)](../../commit/00e7a22)
- [🔴 test: add failing tests for tdd.js framework detection (TDD RED)](../../commit/2ce43d1)
- [🔴 test: add failing tests for learn.js functions (TDD RED)](../../commit/8b90d58)
- [🔴 test: add failing tests for formatBytes and estimateTokens (TDD RED)](../../commit/1fdac58)
- [🔴 test: add failing tests for findBrokenLinks (TDD RED phase)](../../commit/8ec6319)
