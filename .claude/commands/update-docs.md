---
allowed_tools:
  - bash
  - str_replace_editor
  - file_editor
---

# Update Documentation Command

Systematically update all project documentation to ensure accuracy and consistency.

## Context
- Current commands: !`ls .claude/commands/ | grep -E '\.(md|$)' | wc -l`
- README command count: !`grep -o '20 specialized commands' README.md || echo 'Not found'`
- Package.json repo URL: !`grep '"url"' package.json`
- Last README update: !`git log -1 --format="%cr" -- README.md`

## Process

### 1. Validate Current State
```bash
# Run validation to check for issues
npm run update-docs 2>/dev/null || echo "Update needed"

# Check actual command count (should be 20)
find .claude/commands/ -type f \( -name "*.md" -o ! -name ".*" \) | wc -l

# Verify naming convention compliance
ls .claude/commands/ | grep -v '\.md$' | grep -v '^$' || echo "All commands follow .md convention"
```

### 2. Update All Documentation
```bash
# Run comprehensive documentation update
npm run update-docs

# Verify README command count updated
grep "20 specialized commands" README.md

# Check that repository URLs are correct
grep "rmurphey/claude-setup" package.json README.md
```

### 3. Systematic Validation

**Command Inventory**:
- Verify all 20 commands exist in `.claude/commands/`
- Ensure consistent `.md` file naming
- Check YAML frontmatter in command files
- Validate command descriptions match COMMANDS.md

**Repository References**:
- Package.json repository URL
- README npx examples
- Documentation cross-references
- GitHub Actions workflow references

**Documentation Consistency**:
- Command count accuracy across all files
- Version requirements (Node.js 16+)
- Installation instructions
- Usage examples

### 4. Establish Update Process

**Automated Updates**:
Add npm script to package.json for regular maintenance:
```json
"scripts": {
  "docs:validate": "node lib/readme-updater.js validate",
  "docs:update": "npm run update-docs && echo 'Documentation updated successfully'"
}
```

**Integration Points**:
- Run before version releases
- Include in pre-commit hooks
- Add to CI/CD validation
- Schedule monthly maintenance

## Implementation

```bash
# Full documentation update with validation
npm run update-docs

# Manual validation if needed
node lib/readme-updater.js validate

# Check for any drift since last commit
git status --porcelain "*.md" package.json

# Verify command naming convention
echo "Commands not following .md convention:"
find .claude/commands/ -type f ! -name "*.md" ! -name ".*" || echo "All commands properly named"
```

## Success Criteria

Documentation is current when:
- ✅ All 20 commands have consistent `.md` naming
- ✅ README shows correct "20 specialized commands"
- ✅ Package.json has correct repository URL
- ✅ All npx examples use correct repo name
- ✅ COMMANDS.md matches actual command files
- ✅ No broken references or outdated information

## Maintenance Schedule

Run `/update-docs` command:
- **Before releases**: Ensure docs are current
- **After command changes**: Add/remove/modify commands
- **Monthly**: Regular maintenance check
- **Before PRs**: Validate documentation state
- **After major changes**: Architecture or workflow updates

## Output

The command should provide status like:
```
✅ Documentation Update Complete
   - README: 20 commands (updated)
   - Package.json: repository URL corrected
   - Commands: all following .md convention
   - Validation: all checks passed
   - Last updated: 2025-07-06

Next: Documentation is now current and accurate
```