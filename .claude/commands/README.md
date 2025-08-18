# Claude Commands Structure

## Organization

Commands are organized by frequency of use and purpose:

### Root Level - Core Workflow (12 commands)
Always-useful commands for daily development:
- `commit` - Atomic commits with quality checks (1-3 files)
- `docs` - Documentation maintenance
- `docs-explain` - Educational documentation walkthrough
- `hygiene` - Code quality checks
- `learn` - Capture insights and learnings
- `monitor` - GitHub repository monitoring
- `next` - Get workflow guidance
- `push` - Git push with validations
- `reflect` - Periodic reflection
- `retrospective` - Session analysis
- `tdd` - Test-driven development
- `todo` - Task management

### maintenance/ - Repository Upkeep (2 commands)
Maintenance and management commands:
- `maintainability` - Code quality analysis
- `session-history` - Session preservation

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