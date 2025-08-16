---
allowed-tools: [Bash]
description: Version tagging and release management workflow
---

# Version Tag Command

Automated version tagging, release management, and semantic versioning workflow with quality validation.

## Context
- Current version: !`grep '"version"' package.json 2>/dev/null | cut -d'"' -f4 || echo "unknown"`
- Git tags: !`git tag -l | wc -l | xargs`+ existing tags
- Last tag: !`git describe --tags --abbrev=0 2>/dev/null || echo "no tags"`
- Commits since tag: !`git rev-list --count $(git describe --tags --abbrev=0 2>/dev/null || echo HEAD)..HEAD 2>/dev/null || echo "unknown"`

## Your Task
Create version tags with automated quality checks and release preparation:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-check}"
VERSION_TYPE="${2}"
CUSTOM_VERSION="${3}"

# Function to get current version
get_current_version() {
  if [ -f "package.json" ]; then
    grep '"version"' package.json | cut -d'"' -f4
  else
    echo "0.0.0"
  fi
}

# Function to increment version based on type
increment_version() {
  local current="$1"
  local type="$2"
  
  # Parse current version
  local major minor patch
  major=$(echo "$current" | cut -d. -f1)
  minor=$(echo "$current" | cut -d. -f2)  
  patch=$(echo "$current" | cut -d. -f3)
  
  case "$type" in
    "major")
      echo "$((major + 1)).0.0"
      ;;
    "minor")
      echo "$major.$((minor + 1)).0"
      ;;
    "patch")
      echo "$major.$minor.$((patch + 1))"
      ;;
    *)
      echo "$current"
      ;;
  esac
}

# Function to run pre-release checks
run_release_checks() {
  echo "🔍 Running pre-release quality checks..."
  echo ""
  
  local has_issues=false
  
  # 1. Git status check
  if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Uncommitted changes found"
    git status --short | head -5
    echo "   Commit all changes before creating a release tag"
    has_issues=true
  else
    echo "✅ Working directory is clean"
  fi
  
  # 2. Check if we're on main/master branch
  CURRENT_BRANCH=$(git branch --show-current)
  if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "⚠️  Not on main/master branch (currently on: $CURRENT_BRANCH)"
    echo "   Consider switching to main branch for releases"
  else
    echo "✅ On main branch: $CURRENT_BRANCH"
  fi
  
  # 3. Check if branch is up to date with remote
  git fetch >/dev/null 2>&1
  BEHIND_COUNT=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
  if [ "$BEHIND_COUNT" -gt 0 ]; then
    echo "❌ Branch is $BEHIND_COUNT commit(s) behind remote"
    echo "   Pull latest changes before creating release"
    has_issues=true
  else
    echo "✅ Branch is up to date with remote"
  fi
  
  # 4. Run quality checks\  echo "🧪 Running quality validation..."
  
  # Build check
  if [ -f "package.json" ] && grep -q "build" package.json; then
    if npm run build >/dev/null 2>&1; then
      echo "✅ Build successful"
    else
      echo "❌ Build failed - fix before release"
      has_issues=true
    fi
  fi
  
  # Test check
  if [ -f "package.json" ] && grep -q "test" package.json; then
    if timeout 120s npm test >/dev/null 2>&1; then
      echo "✅ Tests passed"
    else
      echo "❌ Tests failed - fix before release"
      has_issues=true
    fi
  fi
  
  # Lint check
  if [ -f "package.json" ] && grep -q "lint" package.json; then
    if npm run lint >/dev/null 2>&1; then
      echo "✅ Linting passed"
    else
      echo "❌ Linting failed - fix before release"
      has_issues=true
    fi
  fi
  
  # 5. Check for required files
  echo ""
  echo "📋 Release readiness check:"
  
  if [ -f "README.md" ]; then
    README_LINES=$(wc -l < README.md)
    if [ "$README_LINES" -gt 10 ]; then
      echo "✅ README.md present and substantial"
    else
      echo "⚠️  README.md is very brief ($README_LINES lines)"
    fi
  else
    echo "❌ README.md missing"
    has_issues=true
  fi
  
  if [ -f "CHANGELOG.md" ]; then
    echo "✅ CHANGELOG.md present"
    
    # Check if changelog mentions unreleased changes
    if grep -q "Unreleased" CHANGELOG.md; then
      echo "⚠️  CHANGELOG.md has unreleased changes - consider updating for release"
    fi
  else
    echo "⚠️  CHANGELOG.md missing - consider adding for release tracking"
  fi
  
  # 6. Check commit history since last tag
  LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
  if [ -n "$LAST_TAG" ]; then
    COMMITS_SINCE=$(git rev-list --count "$LAST_TAG"..HEAD)
    echo ""
    echo "📊 Release scope:"
    echo "  Last tag: $LAST_TAG"
    echo "  Commits since: $COMMITS_SINCE"
    
    if [ "$COMMITS_SINCE" -eq 0 ]; then
      echo "❌ No commits since last tag - nothing to release"
      has_issues=true
    else
      echo "✅ $COMMITS_SINCE commits ready for release"
      
      # Show recent commits
      echo ""
      echo "Recent commits for this release:"
      git log --oneline "$LAST_TAG"..HEAD | head -5 | sed 's/^/    /'
    fi
  else
    echo "📊 First release - no previous tags found"
  fi
  
  echo ""
  if [ "$has_issues" = true ]; then
    echo "❌ Pre-release checks failed"
    return 1
  else
    echo "✅ All pre-release checks passed!"
    return 0
  fi
}

# Function to create version tag
create_version_tag() {
  local new_version="$1"
  local tag_message="$2"
  
  echo "🏷️  Creating version tag: v$new_version"
  echo "======================================" 
  echo ""
  
  # Update package.json version if it exists
  if [ -f "package.json" ]; then
    echo "📝 Updating package.json version to $new_version"
    
    # Use sed to update version in package.json
    sed -i.bak "s/\"version\"[[:space:]]*:[[:space:]]*\"[^\"]*\"/\"version\": \"$new_version\"/" package.json
    
    if [ $? -eq 0 ]; then
      echo "✅ package.json updated"
      rm -f package.json.bak
    else
      echo "❌ Failed to update package.json"
      return 1
    fi
  fi
  
  # Commit version change if package.json was updated
  if [ -f "package.json" ]; then
    git add package.json
    git commit -m "chore: bump version to $new_version
    
🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>" >/dev/null 2>&1
    echo "✅ Version bump committed"
  fi
  
  # Create annotated git tag
  if [ -z "$tag_message" ]; then
    tag_message="Release v$new_version"
  fi
  
  git tag -a "v$new_version" -m "$tag_message" >/dev/null 2>&1
  
  if [ $? -eq 0 ]; then
    echo "✅ Git tag 'v$new_version' created successfully"
    echo ""
    echo "📋 Release Summary:"
    echo "  Version: $new_version"
    echo "  Tag: v$new_version" 
    echo "  Branch: $(git branch --show-current)"
    echo "  Commit: $(git rev-parse --short HEAD)"
    echo ""
    echo "🚀 Next steps:"
    echo "  • Push tag: git push origin v$new_version"
    echo "  • Push commits: git push origin $(git branch --show-current)"
    echo "  • Create release notes"
    echo "  • Deploy if automated"
    return 0
  else
    echo "❌ Failed to create git tag"
    return 1
  fi
}

case "$COMMAND" in
  "check"|"validate"|"dry-run")
    echo "🔍 Version Tag Validation"
    echo "========================"
    echo ""
    
    CURRENT_VERSION=$(get_current_version)
    echo "📊 Current version: $CURRENT_VERSION"
    
    if run_release_checks; then
      echo ""
      echo "✅ Ready for version tagging"
      echo ""
      echo "Suggested next steps:"
      echo "  /version-tag patch    # For bug fixes"
      echo "  /version-tag minor    # For new features"
      echo "  /version-tag major    # For breaking changes"
    else
      echo ""
      echo "❌ Not ready for version tagging"
      echo "Fix the issues above before creating a release"
      exit 1
    fi
    ;;
    
  "patch"|"minor"|"major")
    CURRENT_VERSION=$(get_current_version)
    NEW_VERSION=$(increment_version "$CURRENT_VERSION" "$COMMAND")
    
    echo "🏷️  $COMMAND Version Release"
    echo "============================"
    echo ""
    echo "Current version: $CURRENT_VERSION"
    echo "New version: $NEW_VERSION"
    echo ""
    
    # Run pre-release checks
    if ! run_release_checks; then
      echo ""
      echo "❌ Pre-release checks failed"
      echo "Fix issues and try again, or use --force to override"
      exit 1
    fi
    
    echo ""
    echo "Creating $COMMAND release: v$NEW_VERSION"
    
    if create_version_tag "$NEW_VERSION" "$COMMAND release v$NEW_VERSION"; then
      echo ""
      echo "🎉 $COMMAND release v$NEW_VERSION created successfully!"
    else
      echo ""
      echo "❌ Failed to create release"
      exit 1
    fi
    ;;
    
  "custom")
    if [ -z "$VERSION_TYPE" ]; then
      echo "❌ Please provide custom version number"
      echo "Usage: /version-tag custom <version> [message]"
      exit 1
    fi
    
    CUSTOM_VERSION="$VERSION_TYPE"
    MESSAGE="$CUSTOM_VERSION"
    
    echo "🏷️  Custom Version Release"
    echo "==========================="
    echo ""
    echo "Creating custom version: $CUSTOM_VERSION"
    echo ""
    
    # Run pre-release checks
    if ! run_release_checks; then
      echo ""
      echo "❌ Pre-release checks failed"
      echo "Fix issues and try again"
      exit 1
    fi
    
    if create_version_tag "$CUSTOM_VERSION" "$MESSAGE"; then
      echo ""
      echo "🎉 Custom release v$CUSTOM_VERSION created successfully!"
    else
      echo ""
      echo "❌ Failed to create custom release"
      exit 1
    fi
    ;;
    
  "list"|"history")
    echo "📋 Version History"
    echo "=================="
    echo ""
    
    if [ -z "$(git tag -l)" ]; then
      echo "No version tags found"
      echo "Create your first release with: /version-tag patch"
      exit 0
    fi
    
    echo "📊 Release History (latest first):"
    git tag -l --sort=-version:refname | head -10 | while read -r tag; do
      TAG_DATE=$(git log -1 --format="%ai" "$tag" 2>/dev/null | cut -d' ' -f1)
      COMMITS_IN_TAG=$(git rev-list --count "$tag" 2>/dev/null || echo "0")
      echo "  🏷️  $tag ($TAG_DATE) - $COMMITS_IN_TAG commits"
    done
    
    echo ""
    TOTAL_TAGS=$(git tag -l | wc -l | xargs)
    CURRENT_VERSION=$(get_current_version)
    echo "Total releases: $TOTAL_TAGS"
    echo "Current version: $CURRENT_VERSION"
    ;;
    
  "help"|"--help"|-h)
    cat << 'EOF'
Version Tag Command Help

USAGE:
  /version-tag [command] [version] [message]

COMMANDS:
  check, validate, dry-run    Validate readiness for release
  patch                      Create patch release (x.y.Z)
  minor                      Create minor release (x.Y.0)  
  major                      Create major release (X.0.0)
  custom <version> [msg]     Create custom version tag
  list, history              Show version history
  help                       Show this help

EXAMPLES:
  /version-tag check         Validate release readiness
  /version-tag patch         Create patch release (1.2.3 → 1.2.4)
  /version-tag minor         Create minor release (1.2.3 → 1.3.0)
  /version-tag major         Create major release (1.2.3 → 2.0.0)
  /version-tag custom 2.0.0-beta.1

PRE-RELEASE CHECKS:
- Clean working directory (no uncommitted changes)
- Up to date with remote branch
- Build validation (if configured)
- Test execution (if configured)
- Linting validation (if configured)
- Documentation presence (README, CHANGELOG)
- Commit history since last tag

SEMANTIC VERSIONING:
- PATCH: Bug fixes and patches
- MINOR: New features (backward compatible)
- MAJOR: Breaking changes

INTEGRATION:
- Updates package.json version automatically
- Creates annotated git tags
- Includes Claude co-authorship in version commits
- Provides deployment guidance
EOF
    ;;
    
  *)
    echo "❌ Unknown version-tag command: $COMMAND"
    echo "Use '/version-tag help' for available commands"
    exit 1
    ;;
esac
```

## Features
- **Semantic Versioning**: Automated patch, minor, and major version increments
- **Quality Validation**: Pre-release checks for build, tests, and code quality  
- **Package Integration**: Automatic package.json version updates
- **Git Integration**: Creates annotated tags with proper commit history
- **Release Readiness**: Comprehensive validation before tagging
- **Version History**: Track and display release progression

## Release Types
- **Patch**: Bug fixes and small updates (1.2.3 → 1.2.4)
- **Minor**: New features, backward compatible (1.2.3 → 1.3.0)
- **Major**: Breaking changes (1.2.3 → 2.0.0)
- **Custom**: Specific version numbers including pre-release tags