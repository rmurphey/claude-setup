---
allowed-tools: [Bash]
description: Update README with current command count and descriptions
---

# Update Documentation Command

Automatically synchronize README.md with current command suite.

## Context
- Current commands: !`ls .claude/commands/*.md | wc -l`
- README commands: !`grep -c "^- \`/" README.md || echo "0"`
- Last README update: !`git log -1 --format="%cr" -- README.md 2>/dev/null || echo "never"`

## Your task
Update the README.md to reflect the current command suite:

1. **Count Commands**: Get actual command count from .claude/commands/
2. **Update README**: Use the readme-updater utility to sync the command section
3. **Verify Changes**: Ensure count and descriptions match reality

**Implementation**:
```bash
# Update README with current commands
node -e "
import { updateReadme } from './lib/readme-updater.js';
const result = await updateReadme();
console.log('README updated:');
console.log('- Command count:', result.commandCount);
console.log('- Status:', result.updated ? 'updated' : result.added ? 'added section' : result.created ? 'created README' : 'no changes');
"

# Alternative: Use npm script if available
npm run update-readme 2>/dev/null || echo "npm script not available, use node command above"

# Verify the update
echo 'Current command count in README:'
grep -c "^- \`/" README.md || echo "No commands found in README"

echo 'Actual commands in .claude/commands/:'
ls .claude/commands/*.md 2>/dev/null | wc -l || echo "No commands directory found"
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

## Notes
- If README.md doesn't exist, a basic one will be created
- If no commands section exists, it will be added automatically
- Command descriptions are read from YAML frontmatter in command files