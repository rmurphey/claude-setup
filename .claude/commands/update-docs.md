---
allowed-tools: [Bash]
description: Update README and documentation with current command count
---

# Update Documentation Command

Automatically synchronize README.md and internal documentation with current command suite.

## Context
- Current commands: !`ls .claude/commands/*.md | wc -l`
- README commands: !`grep -c "^- \`/" README.md`
- Last README update: !`git log -1 --format="%cr" -- README.md`

## Your task
Update all documentation files to reflect the current command suite:

1. **Count Commands**: Get actual command count from .claude/commands/
2. **Update All Docs**: Use the readme-updater utility to sync README and internal docs
3. **Verify Changes**: Ensure counts and descriptions match reality across all files

**Implementation**:
```bash
# Update all documentation with current commands
node -e "
import { updateAllDocs } from './lib/readme-updater.js';
const results = await updateAllDocs();
console.log('Documentation updated:');
console.log('README:', results.readme.commandCount, 'commands');
console.log('ESTIMATES:', results.estimates.updated ? 'updated' : 'no changes');
"

# Alternative: Update just README
npm run update-readme

# Verify the updates
echo 'Current command count in README:'
grep -c "^- \`/" README.md

echo 'Actual commands in .claude/commands/:'
ls .claude/commands/*.md | wc -l
```

**Validation**:
- README command count matches actual .claude/commands/ count
- All command descriptions are current and accurate
- Section formatting is consistent

## Output
Provide a summary of:
- Commands added/removed since last update
- Current total command count
- Any discrepancies found and resolved