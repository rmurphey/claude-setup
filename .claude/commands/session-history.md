# session-history

**⚠️ OPTIONAL**: This feature is entirely optional. You do not need to save sessions to use Claude Code effectively.

> **Note for this repository**: As a living reference, we demonstrate session saving by using it ourselves. You'll find saved sessions in `session-history/` showing real development work. This is to provide examples, not because it's required.

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

## When to Use (All Optional)

**Remember: Session saving is entirely optional.** These are suggestions if you choose to use this feature:

### You Might Save
- Before context compaction (if you want to preserve the conversation)
- After solving a complex problem (if you want to reference it later)
- When discovering interesting patterns (for your own learning)
- Before ending a long productive session (for your records)

### It's Perfectly Fine To
- Never save any sessions
- Only save occasionally when something is particularly valuable
- Use Claude Code for months without saving a single session
- Ignore this feature completely

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