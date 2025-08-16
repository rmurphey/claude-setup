# Self-Updating Documentation Guide

<!-- 
This document is self-updating. To regenerate:
In Claude Code: /docs update self-updating
Last updated: 2025-01-16
-->

## Overview

This repository implements a self-documenting system where all documentation can be regenerated and updated using Claude Code commands. This ensures documentation stays current with the codebase and best practices.

## Quick Reference

```bash
# Update all documentation
/docs update all

# Update specific documentation
/docs update best-practices
/docs update catalog
/docs update readme

# Validate documentation
/docs check-citations
/docs validate-links
/docs check-examples
```

## How Self-Documentation Works

### 1. Documentation Headers

Every documentation file includes a self-update header:

```markdown
<!-- 
This document is self-updating. To regenerate:
In Claude Code: /docs update [document-name]
Last updated: YYYY-MM-DD
-->
```

This header:
- Tells users how to update the document
- Tracks when it was last updated
- Provides the exact command to run

### 2. The `/docs` Command

The enhanced `/docs` command ([view command](.claude/commands/docs.md)) supports:

#### Updating Documentation
```bash
/docs update all              # Regenerate all documentation
/docs update best-practices   # Update BEST_PRACTICES.md
/docs update catalog         # Update COMMAND_CATALOG.md
/docs update readme          # Update README.md
/docs update metrics         # Update metrics and statistics
```

#### Validation
```bash
/docs check-citations        # Validate all citations are current
/docs validate-links         # Check all internal links work
/docs check-examples         # Verify code examples run
/docs check-counts          # Verify command counts are accurate
```

#### Adding Content
```bash
/docs add-example hygiene    # Add real usage example for /hygiene
/docs add-citation "source"  # Add new citation to references
/docs generate-metrics       # Generate usage metrics report
```

### 3. Automatic Updates

Documentation updates automatically when:
- **Pre-commit**: Command counts in README
- **Post-commit**: Usage metrics logged
- **On PR**: Documentation consistency validated
- **Weekly**: Citation validity checked (via GitHub Actions)
- **Monthly**: Full documentation regeneration

## Documentation Structure

### Core Documents

| Document | Purpose | Update Command |
|----------|---------|----------------|
| `README.md` | Repository overview | `/docs update readme` |
| `docs/BEST_PRACTICES.md` | Claude Code best practices | `/docs update best-practices` |
| `docs/COMMAND_CATALOG.md` | All commands reference | `/docs update catalog` |
| `docs/TOKEN_EFFICIENCY.md` | Token optimization guide | `/docs update token-efficiency` |
| `docs/SELF_UPDATING.md` | This guide | `/docs update self-updating` |

### Self-Tracking Files

| File | Purpose | Auto-Updates |
|------|---------|--------------|
| `.claude/metrics.json` | Usage statistics | On each command use |
| `.claude/learnings.md` | Captured insights | Via `/learn` command |
| `.claude/documentation-log.json` | Update history | On each doc update |
| `ACTIVE_WORK.md` | Current tasks | Via `/todo` command |

## Updating Specific Sections

### Updating Command Catalog

The command catalog auto-generates from:
1. Command files in `.claude/commands/`
2. Usage examples from git history
3. Metrics from `.claude/metrics.json`

```bash
# Full catalog regeneration
/docs update catalog

# Add new command documentation
/docs add-command new-command-name

# Update specific command section
/docs update-command hygiene
```

### Updating Best Practices

Best practices update from:
1. Latest Anthropic documentation
2. Community patterns
3. Measured metrics from this repo

```bash
# Update all best practices
/docs update best-practices

# Update specific section
/docs update best-practices --section "Token Efficiency"

# Add new best practice
/docs add-practice "New Pattern" --citation "source"
```

### Updating Metrics

Metrics auto-generate from:
1. Git commit history
2. Command usage logs
3. Token consumption tracking

```bash
# Generate metrics report
/docs generate-metrics

# Update specific metric
/docs update-metric token-savings

# Generate comparison report
/docs compare-metrics --before "2025-01-01"
```

## Adding New Documentation

### Step 1: Create Document with Header

```markdown
<!-- 
This document is self-updating. To regenerate:
In Claude Code: /docs update [your-doc-name]
Last updated: 2025-01-16
-->

# Your Document Title

Content...
```

### Step 2: Register in `/docs` Command

Add to `.claude/commands/docs.md`:
```bash
case "your-doc-name":
  regenerate_your_doc
  ;;
```

### Step 3: Add to Update Cycle

Include in `/docs update all`:
```bash
/docs update your-doc-name
```

## Validation System

### Citation Validation

All citations must be:
- Current (checked weekly)
- Accessible (valid URLs)
- Properly formatted
- Attributed correctly

```bash
# Check all citations
/docs check-citations

# Update broken citations
/docs fix-citations

# Add citation
/docs add-citation "Author, Title, URL, Date"
```

### Link Validation

Internal links are validated for:
- File existence
- Anchor validity
- Correct paths
- No orphaned documents

```bash
# Check all links
/docs validate-links

# Fix broken links
/docs fix-links

# Generate link map
/docs link-map
```

### Example Validation

Code examples must:
- Run without errors
- Match current API
- Include expected output
- Have proper formatting

```bash
# Test all examples
/docs check-examples

# Update example
/docs update-example "example-name"

# Extract example from git history
/docs extract-example "commit-hash"
```

## Real-World Examples

### Example 1: After Adding New Command

```bash
# 1. Create new command
echo "# New Command" > .claude/commands/new-command.md

# 2. Update documentation
/docs update catalog        # Add to catalog
/docs update readme         # Update command count
/docs generate-metrics      # Include in metrics

# 3. Validate
/docs validate-all
```

### Example 2: Weekly Maintenance

```bash
# Run weekly maintenance
/docs maintenance

# This automatically:
# - Checks all citations
# - Validates all links
# - Updates metrics
# - Regenerates stale docs
# - Creates maintenance report
```

### Example 3: Before Release

```bash
# Pre-release documentation update
/docs prepare-release v2.1.0

# This automatically:
# - Updates all documentation
# - Generates changelog
# - Updates version numbers
# - Creates release notes
# - Validates everything
```

## GitHub Actions Integration

### Weekly Documentation Check

`.github/workflows/docs-check.yml`:
```yaml
name: Documentation Check
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Check Documentation
        run: |
          npx claude-code --command "/docs check-citations"
          npx claude-code --command "/docs validate-links"
```

### On Pull Request

`.github/workflows/pr-docs.yml`:
```yaml
name: PR Documentation Validation
on: pull_request
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Validate Documentation
        run: |
          npx claude-code --command "/docs validate-all"
```

## Best Practices for Self-Documentation

### 1. Always Include Update Headers

Every document should start with:
```markdown
<!-- 
This document is self-updating. To regenerate:
In Claude Code: /docs update [name]
Last updated: [date]
-->
```

### 2. Use Structured Data

Store metrics and data in JSON:
```json
{
  "lastUpdated": "2025-01-16",
  "commandCount": 23,
  "tokenSavings": 0.87,
  "source": "automatic"
}
```

### 3. Track Documentation Changes

Log all updates:
```json
{
  "timestamp": "2025-01-16T10:00:00Z",
  "document": "BEST_PRACTICES.md",
  "action": "update",
  "sections": ["Token Efficiency"],
  "citations": ["added": 2, "updated": 1]
}
```

### 4. Provide Fallbacks

Always include manual update instructions:
```markdown
To update manually:
1. Review current content
2. Check citations
3. Update examples
4. Validate links
5. Update timestamp
```

### 5. Version Documentation

Track documentation versions:
```markdown
<!-- Version: 2.1.0 -->
<!-- Schema: v1 -->
<!-- Format: CommonMark -->
```

## Troubleshooting

### Common Issues

**Documentation won't update**
```bash
# Check permissions
ls -la docs/

# Force regeneration
/docs update [name] --force

# Check for errors
/docs validate [name]
```

**Citations are broken**
```bash
# List broken citations
/docs check-citations --verbose

# Update citation URL
/docs fix-citation "old-url" "new-url"

# Remove invalid citation
/docs remove-citation "citation-id"
```

**Metrics not generating**
```bash
# Check metrics file
cat .claude/metrics.json

# Regenerate from git history
/docs rebuild-metrics

# Reset metrics
/docs reset-metrics --confirm
```

## Advanced Features

### Custom Documentation Generators

Create custom generators in `.claude/generators/`:

```javascript
// .claude/generators/custom-doc.js
module.exports = {
  name: 'custom-doc',
  generate: async () => {
    // Custom generation logic
    return documentContent;
  },
  validate: async (content) => {
    // Validation logic
    return isValid;
  }
};
```

### Documentation Templates

Use templates for consistency:

```markdown
<!-- .claude/templates/guide-template.md -->
<!-- 
This document is self-updating. To regenerate:
In Claude Code: /docs update {{name}}
Last updated: {{date}}
-->

# {{title}}

## Overview
{{overview}}

## Usage
{{usage}}

## Examples
{{examples}}

## References
{{references}}
```

### Metrics Dashboard

Generate visual metrics:

```bash
# Generate dashboard
/docs dashboard

# Export metrics
/docs export-metrics --format csv

# Compare periods
/docs compare --from "2025-01-01" --to "2025-01-16"
```

## Contributing to Documentation

### Adding New Self-Updating Features

1. **Identify repetitive updates** - What changes frequently?
2. **Create generator** - Automate the update process
3. **Add validation** - Ensure quality
4. **Document the process** - Update this guide
5. **Test thoroughly** - Verify automation works

### Documentation Standards

- All documentation must be self-updating
- Include clear update instructions
- Validate before committing
- Track all changes
- Maintain citation accuracy

## Future Enhancements

Planned improvements:
- AI-powered documentation suggestions
- Automatic example extraction from usage
- Real-time documentation updates
- Cross-reference validation
- Multi-language support
- Documentation versioning

## References

1. [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
2. [CommonMark Specification](https://commonmark.org/)
3. [Semantic Versioning](https://semver.org/)
4. [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

*Last updated: 2025-01-16*
*Run `/docs update self-updating` to regenerate.*