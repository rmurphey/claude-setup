# Plan: Session History Preservation

## Plan Overview
- **ID**: session-history-001
- **Created**: 2025-01-16
- **Status**: Active
- **Objective**: Preserve raw Claude Code session transcripts separate from checkpoints

## Problem Statement
- Session history can be lost during context compaction
- No systematic way to preserve raw conversation text
- Historical analysis requires full transcripts, not summaries
- Checkpoints serve different purpose (work resumption vs history)

## Solution Design

### 1. Directory Structure
```
session-history/
├── 2025-01-16/
│   ├── session-001-0830-1030.txt    # Raw transcript
│   ├── session-002-1145-1400.txt    # After compact
│   └── daily-summary.md             
├── index.md                          # Master index
└── README.md                         # Documentation
```

### 2. Components to Create

**A. Session History Command**
- File: `.claude/commands/session-history.md`
- Actions: save, delta, list, archive
- Wrapper around npm scripts

**B. Session History Manager**
- File: `scripts/session-history.js`
- Saves raw text (not markdown)
- Tracks deltas between saves
- Auto-organizes by date

**C. NPM Scripts**
```json
"session:save": "node scripts/session-history.js save",
"session:delta": "node scripts/session-history.js delta",
"session:list": "node scripts/session-history.js list"
```

## Implementation Steps

- [x] Create plans/ directory structure
- [x] Document this plan in plans/session-history-preservation.md
- [ ] Document previous plan in plans/completed/learnings-documentation.md
- [ ] Create session-history/ directory structure
- [ ] Move existing transcript to session-history/2025-01-16/
- [ ] Create session-history/README.md
- [ ] Create scripts/session-history.js
- [ ] Create .claude/commands/session-history.md
- [ ] Update package.json with session history npm scripts
- [ ] Test session saving functionality
- [ ] Update CLAUDE_PATTERNS.md with session preservation
- [ ] Update BEST_PRACTICES.md with session intervals
- [ ] Move plan to completed/ with after-action report

## Success Criteria
- [x] Plans directory created and documented
- [ ] Raw sessions never lost
- [ ] Delta saves minimize storage
- [ ] Clear separation from checkpoints
- [ ] Easy retrieval of historical sessions

## Risk Mitigation
- Test with small sessions first
- Backup existing transcript before moving
- Validate delta calculation logic
- Use atomic commits for each component

## Progress Log

### 2025-01-16
- Created plans/ directory structure
- Created plans/README.md
- Created this plan document
- Next: Document previous completed plan

## Notes
- User emphasized atomic commits - each file/component gets its own commit
- Session history is distinct from checkpoints (raw preservation vs work state)
- Focus on never losing conversation data