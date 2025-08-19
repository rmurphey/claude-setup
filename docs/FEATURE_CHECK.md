# Feature Check Quality System

## Overview

The Feature Check system automatically ensures that new features added to the codebase have corresponding tests and documentation. This quality check runs in CI/CD pipelines and can be run locally to catch missing tests or documentation early in the development process.

## How It Works

### Feature Detection

The system detects new features by analyzing git changes:

- **New files**: Any new JavaScript/TypeScript files in `scripts/`, `src/`, `lib/` directories
- **Significant changes**: Existing files with more than 50 lines added
- **Excluded**: Test files, documentation files, configuration files

### Test Coverage Verification

For each detected feature, the system looks for corresponding test files:

- `test/{feature}.test.js`
- `test/{feature}.unit.test.js`
- `test/{feature}.spec.js`
- Tests that import or reference the feature

### Documentation Verification

Features must be documented in at least one of:

- `README.md` - Main project documentation
- `docs/` directory - Detailed documentation
- `.claude/commands/` - Command documentation
- File with matching name (e.g., `scripts/monitor.js` → `docs/monitor.md`)

## Usage

### Local Testing

```bash
# Run feature check manually
npm run feature:check

# Run as part of quality checks
npm run quality:all

# Run before committing
npm run commit:check
```

### CI/CD Integration

The feature check runs automatically in GitHub Actions:

- On push to main/develop branches
- On pull requests
- Can be triggered manually

### Bypass Options

#### Skip for Non-Feature Changes

The check automatically skips when changes are:
- Test files only
- Documentation only
- Configuration files only

#### Manual Skip

```bash
# Skip feature check for special cases
node scripts/feature-check.js --skip-feature-check
```

#### Ignore Patterns

Create a `.featurecheckignore` file to exclude specific patterns:

```
scripts/experimental-*.js
lib/vendor/*
*.generated.js
```

## Error Messages

When features lack tests or documentation, you'll see clear error messages:

```
❌ Feature Check Failed

New features must have tests and documentation:

  ❌ Feature missing test coverage: scripts/new-analyzer.js
  ❌ Feature missing documentation: scripts/new-analyzer.js

To fix:
  1. Add test files for new features in test/
  2. Update documentation in README.md or docs/
  3. Or use --skip-feature-check if this is not a feature
```

## Examples

### Valid Feature Addition

```bash
# 1. Add new feature
echo "module.exports = { analyze: () => {} }" > scripts/analyzer.js

# 2. Add test
echo "const analyzer = require('../scripts/analyzer');" > test/analyzer.test.js

# 3. Add documentation
echo "## Analyzer\nAnalyzes code quality..." >> README.md

# 4. Check passes
npm run feature:check
✅ Feature check passed - all features have tests and docs
```

### Fixing Missing Tests

```bash
# Feature without test
git add scripts/reporter.js

# Check fails
npm run feature:check
❌ Feature missing test coverage: scripts/reporter.js

# Add test
cat > test/reporter.test.js << EOF
const { describe, it } = require('node:test');
const reporter = require('../scripts/reporter');

describe('Reporter', () => {
  it('should generate reports', () => {
    // Test implementation
  });
});
EOF

# Now check passes
npm run feature:check
✅ Feature check passed
```

## Configuration

### Thresholds

- **New file threshold**: Any new code file is considered a feature
- **Modification threshold**: 50+ lines added to existing file
- **Test patterns**: `.test.js`, `.spec.js`, `.unit.test.js`
- **Doc locations**: README.md, docs/, .claude/commands/

### Environment Variables

- `GITHUB_BASE_REF`: Base branch for comparison in PRs (auto-set by GitHub Actions)
- `SKIP_FEATURE_CHECK`: Set to skip checks entirely

## Integration with Development Workflow

### TDD Workflow

1. Write failing test first (TDD RED)
2. Implement feature (TDD GREEN)
3. Documentation already required - no additional step
4. Feature check passes automatically

### Regular Development

1. Implement feature
2. Run `npm run feature:check` locally
3. Add missing tests/docs if needed
4. Commit with confidence

## Troubleshooting

### False Positives

If the system incorrectly identifies a file as a feature:

1. Check if it matches exclusion patterns
2. Add to `.featurecheckignore` if needed
3. Use `--skip-feature-check` for one-off cases

### Missing Detection

If a feature isn't detected:

1. Ensure file has correct extension (.js, .ts, etc.)
2. Check that changes meet threshold (50+ lines for modifications)
3. Verify file isn't in excluded directory

### Test Not Found

If tests exist but aren't detected:

1. Follow naming convention: `{feature}.test.js`
2. Place tests in `test/` directory
3. Ensure test file imports the feature

### Documentation Not Found

If documentation exists but isn't detected:

1. Include feature name in documentation
2. Use recognizable variants (kebab-case, snake_case)
3. Add to README.md for guaranteed detection

## Benefits

- **Quality Assurance**: Ensures all features are tested
- **Documentation**: Maintains up-to-date documentation
- **Early Detection**: Catches issues before merge
- **Developer Friendly**: Clear messages and bypass options
- **Automated**: No manual review needed

## Related Commands

- `npm run test` - Run all tests
- `npm run docs` - Update documentation
- `npm run quality:all` - Run all quality checks
- `npm run commit:check` - Pre-commit validation