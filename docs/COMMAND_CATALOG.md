# Command Catalog

Complete list of all available Claude Code commands organized by category.

Last updated: 2025-08-16  
Total Commands: 26

## Core Workflow Commands (6)

### /commit
Quality-checked commit workflow with automatic pre-commit validation  
Location: `.claude/commands/commit.md`

### /push
Push commits to remote repository  
Location: `.claude/commands/push.md`

### /hygiene
Project health check - code quality, tests, dependencies, and git status  
Location: `.claude/commands/hygiene.md`

### /todo
Task management and tracking system with ACTIVE_WORK.md integration  
Location: `.claude/commands/todo.md`

### /monitor
Monitor GitHub repository for test failures and pull requests  
Location: `.claude/commands/monitor.md`

### /tdd
Your new best friend - TDD workflow that makes Claude amazing  
Location: `.claude/commands/tdd.md`

## Documentation Commands (3)

### /docs
Documentation maintenance and validation  
Location: `.claude/commands/docs.md`

### /learn
Capture insights and learnings from development work  
Location: `.claude/commands/learn.md`

### /update-docs
Update README with current command count and descriptions  
Location: `.claude/commands/maintenance/update-docs.md`

## Planning Commands (6)

### /design
Feature planning and design documentation system  
Location: `.claude/commands/planning/design.md`

### /estimate
Get intelligent Claude usage estimates for development tasks  
Location: `.claude/commands/planning/estimate.md`

### /idea
Quick capture of ideas for future consideration  
Location: `.claude/commands/planning/idea.md`

### /ideation
AI-powered development ideation and brainstorming  
Location: `.claude/commands/planning/ideation.md`

### /defer
Task deferral and backlog management system  
Location: `.claude/commands/planning/defer.md`

### /next
Get AI-recommended next steps and development priorities  
Location: `.claude/commands/next.md`

## Reflection Commands (2)

### /reflect
Pause and reflect on current work  
Location: `.claude/commands/reflect.md`

### /retrospective
Capture current session with metadata for future analysis  
Location: `.claude/commands/retrospective.md`

## Maintenance Commands (7)

### /archive
Archive old files and directories  
Location: `.claude/commands/maintenance/archive.md`

### /issue
Create and manage GitHub issues  
Location: `.claude/commands/maintenance/issue.md`

### /maintainability
Code maintainability analysis and improvement recommendations  
Location: `.claude/commands/maintenance/maintainability.md`

### /session-history
Manage and analyze session history  
Location: `.claude/commands/maintenance/session-history.md`

### /sync-issues
Sync open GitHub issues into ACTIVE_WORK.md for unified task tracking  
Location: `.claude/commands/maintenance/sync-issues.md`

### /version-tag
Version tagging and release management workflow  
Location: `.claude/commands/maintenance/version-tag.md`

### /context-manage
Optimize Claude Code context window usage  
Location: `.claude/commands/context-manage.md`

## Special Purpose Commands (2)

### /atomic-commit
Enforce atomic commit discipline for 1-3 file changes  
Location: `.claude/commands/atomic-commit.md`

### /edit-not-create
Smart file decision process - prefer editing existing files over creating new ones  
Location: `.claude/commands/edit-not-create.md`

---

## Command Categories Summary

| Category | Count | Purpose |
|----------|-------|---------|
| Core Workflow | 6 | Daily development tasks |
| Documentation | 3 | Docs and learning capture |
| Planning | 6 | Planning and ideation |
| Reflection | 2 | Session analysis |
| Maintenance | 7 | Repository maintenance |
| Special Purpose | 2 | Specific workflows |

## Notes

- **Completed Consolidation**: Reduced from 37 to 26 commands
- Removed: 4 recovery commands (overly complex)
- Removed: 6 detailed variants (saved 1919 lines!)
- Removed: 1 duplicate reflect command
- **Token Efficiency**: Commands now delegate to npm scripts
- Some large commands remain (issue, version-tag, design) for future simplification