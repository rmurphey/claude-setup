---
allowed-tools: [Bash, Edit]
description: Semantic version management and tagging
---

# Version Management

## Context
- Current version: @package.json
- Recent changes: !`git log --oneline $(git describe --tags --abbrev=0)..HEAD`
- Git status: !`git status --porcelain`

## Your task
Manage semantic versioning with proper git tagging:

**Semantic Versioning**:
- **Patch** (x.x.X): Bug fixes, small improvements
- **Minor** (x.X.x): New features, backwards compatible
- **Major** (X.x.x): Breaking changes

**Process**:
1. **Determine Version Type**: Analyze changes to suggest version bump
2. **Update package.json**: Increment version number
3. **Create Commit**: Version bump commit
4. **Create Tag**: Git tag with version
5. **Provide Instructions**: How to push tags

**Interactive Prompts**:
- Analyze recent commits to suggest version type
- Confirm version bump with user
- Ask for release notes if significant changes

**Commands to Execute**:
```bash
# Update package.json version
npm version {patch|minor|major} --no-git-tag-version

# Create commit
git add package.json
git commit -m "Bump version to v{new_version}"

# Create tag
git tag -a v{new_version} -m "Release v{new_version}"
```

**Output**:
```
🏷️  VERSION UPDATED
Version: v{old} → v{new}
Tag: v{new_version} created

📤 Next steps:
git push origin main
git push origin v{new_version}
```