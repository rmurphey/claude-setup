# CLAUDE.md - Project AI Guidelines

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
- Test coverage: {{COVERAGE_TARGET}}% minimum
- Documentation: All features documented
- Error handling: Graceful failures with clear messages
- Performance: Monitor code complexity and file sizes
- ALWAYS use atomic commits
- use emojis, judiciously