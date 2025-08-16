# GitHub Actions Workflows

This repository uses GitHub Actions for continuous integration.

## Active Workflows

### 1. Test Suite (`test.yml`)
- **Triggers**: Push to main/develop, Pull requests
- **Purpose**: Run tests across multiple Node versions
- **Matrix**: Node 16.x, 18.x, 20.x
- **Features**:
  - Full test suite
  - Quality checks
  - Documentation validation
  - Coverage reporting (Node 20.x only)

### 2. Quality Checks (`quality.yml`)
- **Triggers**: Push to main/develop, Pull requests, Manual
- **Purpose**: Comprehensive quality validation
- **Checks**:
  - ESLint with max warnings threshold
  - Full test suite
  - Project hygiene check
  - Documentation validation
  - Command count verification
  - Broken link detection
  - Commit reference validation

## Removed Workflows (Available in Git History)

The following workflows were removed to prevent false positive failures on push events:

### ~~Scheduled Documentation Update (`docs-update.yml`)~~ 
- **Status**: Removed - not needed yet
- **Would trigger**: Weekly schedule or manual
- **To restore**: `git checkout 76eb3b7 -- .github/workflows/docs-update.yml`

### ~~Release (`release.yml`)~~
- **Status**: Removed - not doing releases yet  
- **Would trigger**: Version tags
- **To restore**: `git checkout 76eb3b7 -- .github/workflows/release.yml`

### ~~Publish (`publish.yml`)~~
- **Status**: Removed - not publishing to NPM yet
- **Would trigger**: Release creation
- **To restore**: `git checkout 76eb3b7 -- .github/workflows/publish.yml`

**Why removed?** GitHub evaluates all workflow files on every push, marking them as "failed" when their trigger conditions don't match. This created noise in monitoring and CI status.

## Local Testing

### Using npm scripts
```bash
# Run quality checks locally
npm run quality:ci

# Test CI behavior
npm run ci:pre-push

# Validate documentation
npm run docs validate
```

### Using act (GitHub Actions locally)
```bash
# Install act
brew install act  # macOS
# or see https://github.com/nektos/act

# Test quality workflow
act -j quality

# Test with specific event
act pull_request -j quality

# Test scheduled job
act schedule -j update-docs
```

## Required Secrets

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `NPM_TOKEN`: For package publishing (if applicable)

## Maintenance

### Adding new quality checks
1. Add check to `quality.yml`
2. Add corresponding npm script
3. Test locally with `npm run quality:ci`

### Updating documentation schedule
Edit the cron expression in `docs-update.yml`:
```yaml
- cron: '0 2 * * 1'  # Weekly on Monday
- cron: '0 2 * * *'  # Daily
- cron: '0 2 1 * *'  # Monthly
```

## Troubleshooting

### Workflow not triggering
- Check branch protection rules
- Verify workflow file syntax
- Check GitHub Actions status

### Documentation update failing
- Ensure full git history is fetched
- Check commit references are valid
- Verify npm scripts work locally

### Quality checks failing
- Run `npm run quality:ci` locally
- Fix issues before pushing
- Check Node version compatibility