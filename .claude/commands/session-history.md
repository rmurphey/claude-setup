# session-history

Preserve raw Claude Code conversation transcripts for historical analysis.

## Usage

<bash>
npm run session:save --silent
</bash>

## What It Does

Manages raw session history separate from checkpoints:
- **save**: Capture full conversation transcript
- **delta**: Save only changes since last save
- **list**: Show recent session files
- **archive**: Move old sessions to archive

## Output

Session files are saved in `session-history/YYYY-MM-DD/` with format:
- `session-NNN-HHMM.txt` for full saves
- `session-NNN-HHMM-delta.txt` for delta saves

## When to Use

### Always Save
- Before context compaction
- After major accomplishments  
- When discovering patterns
- Before ending session

### Consider Saving
- Every 30-60 minutes
- After complex problem solving
- When learning something new
- After successful implementations

## Options

```bash
# Save with description
npm run session:save -- "feature-complete"

# Save delta only
npm run session:delta

# List recent sessions
npm run session:list

# Archive old sessions (default: 30 days)
npm run session:archive -- 60
```

## Important Notes

- This preserves raw conversation text, not formatted markdown
- Different from checkpoints (which save work state)
- Manual copy-paste required (Claude API limitation)
- Delta saves minimize storage by only saving new content

## Best Practices

1. Save before any context reset
2. Use descriptive names for important sessions
3. Archive old sessions periodically
4. Review saved sessions for patterns