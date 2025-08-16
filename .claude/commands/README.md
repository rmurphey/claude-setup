# Claude Commands Structure

## Organization

Commands are organized by frequency of use and purpose:

### Root Level - Core Workflow (12 commands)
Always-useful commands for daily development:
- `atomic-commit` - Enforce atomic commit discipline
- `commit` - Git commit with quality checks
- `context-manage` - Manage Claude context window
- `docs` - Documentation maintenance
- `edit-not-create` - Enforce edit-first principle
- `hygiene` - Code quality checks
- `learn` - Capture insights and learnings
- `next` - Get workflow guidance
- `push` - Git push with validations
- `retrospective` - Session analysis
- `tdd` - Test-driven development
- `todo` - Task management

### planning/ - Pre-Development (6 commands)
Planning and ideation commands:
- `defer` - Defer tasks for later
- `design` - Feature design and planning
- `estimate` - Estimate Claude usage
- `idea` - Quick idea capture
- `ideation` - Brainstorming sessions
- `reflect` - Periodic reflection

### maintenance/ - Repository Upkeep (7 commands)
Maintenance and management commands:
- `archive` - Archive old files
- `issue` - GitHub issue management
- `maintainability` - Code quality analysis
- `session-history` - Session preservation
- `sync-issues` - Sync GitHub issues
- `update-docs` - Update documentation
- `version-tag` - Version tagging

### recovery/ - Emergency Operations (4 commands)
Recovery and troubleshooting commands:
- `find-working-equivalent` - Find alternative solutions
- `recovery-assess` - Assess system state
- `recovery-execute` - Execute recovery plan
- `recovery-plan` - Plan recovery strategy

### detailed/ - Verbose Versions
Detailed versions of minimal commands (when needed):
- Contains verbose implementations
- Used as fallback when more detail required

## Usage

All commands work the same way regardless of location:
```bash
# Root command
/commit

# Subdirectory command
/design

# Commands are discovered automatically
```

## Finding Commands

```bash
# List all available commands
ls -1 .claude/commands/**/*.md | sed 's|.*/||' | sed 's|\.md||'

# List commands by category
ls -1 .claude/commands/planning/*.md | sed 's|.*/||' | sed 's|\.md||'
```

## Command Philosophy

- **Root level**: Used in most development sessions
- **Subdirectories**: Specialized or occasional use
- **Minimal by default**: Token-efficient implementations
- **Detailed fallback**: Available when needed