# Session History

This directory preserves raw Claude Code session transcripts for historical analysis and learning.

## Purpose

Session history serves a different purpose than checkpoints:
- **Session History**: Raw conversation preservation for analysis and learning
- **Checkpoints**: Structured save points for resuming work

## Directory Structure

```
session-history/
├── YYYY-MM-DD/                       # Date-based organization
│   ├── session-NNN-HHMM-HHMM.txt    # Raw transcript (start-end times)
│   ├── session-NNN-description.md    # Markdown format if needed
│   └── daily-summary.md             # Optional daily summary
├── index.md                          # Master index of all sessions
└── README.md                         # This file
```

## Naming Convention

- **Directory**: `YYYY-MM-DD` (e.g., `2025-01-16`)
- **Session files**: `session-NNN-HHMM-HHMM.txt`
  - `NNN`: Session number for that day (001, 002, etc.)
  - `HHMM-HHMM`: Start and end times (optional)
  - Example: `session-001-0830-1030.txt`

## File Formats

### Raw Text Files (.txt)
- Exact conversation as it occurred
- No formatting or modifications
- Includes all messages, errors, and outputs
- Preserves for maximum fidelity

### Markdown Files (.md)
- Used for special sessions needing formatting
- Summaries and analysis
- Index files

## Usage

### Saving a Session
```bash
# Manual save
npm run session:save

# Save delta since last save
npm run session:delta

# List recent sessions
npm run session:list
```

### Retrieving Sessions
Sessions are organized by date, making it easy to find:
1. Navigate to the date directory
2. Sessions are numbered sequentially
3. Check index.md for descriptions

## Best Practices

1. **Save Regularly**: Every 30-60 minutes during long sessions
2. **Save Before Compaction**: Always preserve before context reset
3. **Use Descriptive Names**: When important, rename with description
4. **Create Summaries**: For significant sessions, add daily-summary.md

## What to Save

### Always Save
- Before context compaction
- After major accomplishments
- When discovering important patterns
- Before ending a session

### Consider Saving
- After complex problem solving
- When learning something new
- After successful implementations
- When encountering interesting errors

## Recovery

If you need to recover or reference a previous session:

1. Check session-history/YYYY-MM-DD/ for the date
2. Look for session files from that time period
3. Review the raw transcript for exact conversation
4. Check daily-summary.md if available

## Automation

The session history system includes:
- Automatic date-based organization
- Sequential numbering
- Delta tracking to avoid duplicates
- Index generation

## Storage Guidelines

- Raw text files are small and compress well
- Consider archiving sessions older than 30 days
- Keep significant sessions indefinitely
- Remove redundant delta saves after full saves

## Integration

Session history integrates with:
- `/retrospective` command for analysis
- `/session-history` command for management
- Git for version control (optional)

## Privacy Note

Session history may contain sensitive information:
- Code snippets
- File paths
- Project details
- Error messages

Consider this when sharing or backing up session files.