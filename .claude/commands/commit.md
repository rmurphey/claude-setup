---
allowed-tools: [Bash]
description: Quality-checked commit with proper formatting
---

# Quality-Checked Commit

## Context
- Current git status: !`git status`
- Lint check: !`npm run lint:changed`
- Test status: !`npm test`

## Your task
Create a quality-checked commit following this process:

1. **Quality Gates**: Ensure these pass before committing:
   - No lint errors (warnings acceptable for this project)
   - All tests passing
   - No critical issues

2. **Stage Changes**: Add relevant files to staging area

3. **Commit Message Format**:
   ```
   {Descriptive summary of changes}
   
   {Optional detailed description}
   
   🤖 Generated with [Claude Code](https://claude.ai/code)
   
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```

4. **Validation**: Confirm commit was created successfully

If quality gates fail, provide specific guidance on how to fix issues before proceeding.