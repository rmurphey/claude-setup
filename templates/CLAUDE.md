# CLAUDE.md - Project AI Guidelines

## Development Workflow
- Always run quality checks before commits
- Use custom commands for common tasks
- Document insights and decisions

## Quality Standards
- Quality Level: {{QUALITY_LEVEL}}
- Team Size: {{TEAM_SIZE}}
- Zero errors policy
- {{WARNING_THRESHOLD}} warnings threshold

## Commands
- `/hygiene` - Project health check
- `/todo` - Task management
- `/commit` - Quality-checked commits
- `/design` - Feature planning
- `/next` - AI-recommended priorities
- `/learn` - Capture insights
- `/docs` - Update documentation

## Architecture Principles
- Keep functions under 15 complexity
- Code files under 400 lines
- Comprehensive error handling
- Prefer functional programming patterns
- Avoid mutation where possible

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