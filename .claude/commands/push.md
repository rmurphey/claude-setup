---
allowed-tools: [Bash]
description: Push commits with quality checks and branch management
---

# Push Command

Safe push workflow with pre-push quality validation, branch management, and remote synchronization.

## Context
- Current branch: !`git branch --show-current 2>/dev/null || echo "unknown"`
- Unpushed commits: !`git rev-list --count @{u}..HEAD 2>/dev/null || echo "0"`
- Check git status for uncommitted changes
- Run 'git fetch' to check remote status

## Your Task
Execute safe push workflow with quality validation:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-push}"
TARGET_BRANCH="$2"
FORCE_PUSH="$3"

# Function to run pre-push checks
run_pre_push_checks() {
  echo "🔍 Running pre-push quality checks..."
  
  local has_issues=false
  
  # 1. Check for uncommitted changes
  if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  WARNING: You have uncommitted changes"
    git status --short | head -5
    echo ""
    echo "Consider committing these changes first with /commit"
    echo "Or use 'git stash' to temporarily save them"
    has_issues=true
  fi
  
  # 2. Verify we have commits to push
  UNPUSHED_COUNT=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")
  if [ "$UNPUSHED_COUNT" -eq 0 ]; then
    echo "✅ No commits to push - already up to date"
    return 2  # Special return code for "nothing to do"
  fi
  
  echo "📤 Found $UNPUSHED_COUNT commit(s) to push:"
  git log --oneline @{u}..HEAD | sed 's/^/  /'
  echo ""
  
  # 3. Check if remote has new commits (might need pull)
  git fetch >/dev/null 2>&1
  BEHIND_COUNT=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
  if [ "$BEHIND_COUNT" -gt 0 ]; then
    echo "⚠️  WARNING: Your branch is $BEHIND_COUNT commit(s) behind remote"
    echo "You may need to pull/rebase before pushing"
    echo "Recent remote commits:"
    git log --oneline HEAD..@{u} | head -3 | sed 's/^/    /'
    echo ""
    echo "Consider: git pull --rebase origin $(git branch --show-current)"
    has_issues=true
  fi
  
  # 4. Run basic quality checks on commits to be pushed
  echo "🧪 Validating commits to be pushed..."
  
  # Check if build succeeds (if build script exists)
  if [ -f "package.json" ] && grep -q "build" package.json; then
    echo "  Building project..."
    if ! npm run build >/dev/null 2>&1; then
      echo "  ❌ Build failed - fix before pushing"
      has_issues=true
    else
      echo "  ✅ Build successful"
    fi
  fi
  
  # Check if tests pass (if test script exists)
  if [ -f "package.json" ] && grep -q "test" package.json; then
    echo "  Running tests..."
    if ! timeout 60s npm test >/dev/null 2>&1; then
      echo "  ❌ Tests failed or timed out - review before pushing"
      has_issues=true
    else
      echo "  ✅ Tests passed"
    fi
  fi
  
  # 5. Check commit message quality
  echo "  Validating commit messages..."
  POOR_MESSAGES=$(git log --oneline @{u}..HEAD | grep -E "^[a-f0-9]+ (wip|fix|update|change)$" | wc -l | xargs)
  if [ "$POOR_MESSAGES" -gt 0 ]; then
    echo "  ⚠️  Found $POOR_MESSAGES commit(s) with generic messages"
    echo "  Consider improving commit messages for better history"
  else
    echo "  ✅ Commit messages look good"
  fi
  
  # 6. Check file size (warn about large files)
  LARGE_FILES=$(git diff-tree --no-commit-id --name-only -r @{u}..HEAD | xargs -I {} sh -c 'if [ -f "{}" ] && [ $(wc -c < "{}") -gt 1000000 ]; then echo "{}"; fi')
  if [ -n "$LARGE_FILES" ]; then
    echo "  ⚠️  Large files in commits (>1MB):"
    echo "$LARGE_FILES" | sed 's/^/      /'
    echo "    Consider if these should be in version control"
  fi
  
  if [ "$has_issues" = true ]; then
    return 1
  else
    echo "  🎉 Pre-push checks passed!"
    return 0
  fi
}

# Function to execute push
execute_push() {
  local target_branch="$1"
  local force_flag="$2"
  
  CURRENT_BRANCH=$(git branch --show-current)
  REMOTE_BRANCH="${target_branch:-$CURRENT_BRANCH}"
  
  echo "🚀 Pushing to remote..."
  echo "  From: $CURRENT_BRANCH"
  echo "  To: origin/$REMOTE_BRANCH"
  
  # Construct push command
  PUSH_CMD="git push origin $CURRENT_BRANCH"
  
  if [ "$target_branch" != "" ] && [ "$target_branch" != "$CURRENT_BRANCH" ]; then
    PUSH_CMD="git push origin $CURRENT_BRANCH:$target_branch"
  fi
  
  if [ "$force_flag" = "--force" ] || [ "$force_flag" = "-f" ]; then
    PUSH_CMD="$PUSH_CMD --force-with-lease"
    echo "  ⚠️  Using force push (with lease for safety)"
  fi
  
  echo "  Command: $PUSH_CMD"
  echo ""
  
  # Execute the push
  if eval $PUSH_CMD; then
    echo "✅ Successfully pushed to origin/$REMOTE_BRANCH"
    
    # Show push summary
    PUSHED_COUNT=$(git rev-list --count @{u}..HEAD^ 2>/dev/null || echo "0")
    echo ""
    echo "📊 Push Summary:"
    echo "  Commits pushed: $(git rev-list --count @{u}^..HEAD 2>/dev/null || echo "unknown")"
    echo "  Branch: $CURRENT_BRANCH → origin/$REMOTE_BRANCH"
    
    # Show recent commits on remote
    echo ""
    echo "📝 Recent commits on remote:"
    git log --oneline -3 @{u} 2>/dev/null | sed 's/^/  /' || echo "  Unable to show remote commits"
    
    return 0
  else
    echo "❌ Push failed"
    echo ""
    echo "Common solutions:"
    echo "  • Check network connection"
    echo "  • Verify repository permissions"
    echo "  • Try: git pull --rebase origin $CURRENT_BRANCH"
    echo "  • For force push: /push force (use carefully)"
    return 1
  fi
}

case "$COMMAND" in
  "check"|"dry-run"|"validate")
    echo "🔍 Pre-push Validation (Dry Run)"
    echo "================================="
    echo ""
    
    if run_pre_push_checks; then
      echo "✅ All checks passed - ready to push"
      echo "Run '/push' to execute the push"
    else
      echo "❌ Pre-push checks failed"
      echo "Fix issues before pushing"
      exit 1
    fi
    ;;
    
  "force"|"--force"|"-f")
    echo "⚠️  Force Push (Use with Caution)"
    echo "=================================="
    echo ""
    echo "Force pushing can overwrite remote history."
    echo "This uses --force-with-lease for safety."
    echo ""
    
    # Still run some basic checks
    if [ -n "$(git status --porcelain)" ]; then
      echo "❌ Cannot force push with uncommitted changes"
      echo "Commit or stash changes first"
      exit 1
    fi
    
    execute_push "$TARGET_BRANCH" "--force"
    ;;
    
  "branch")
    if [ -z "$TARGET_BRANCH" ]; then
      echo "❌ Please specify target branch"
      echo "Usage: /push branch <branch-name>"
      exit 1
    fi
    
    echo "🌿 Pushing to specific branch: $TARGET_BRANCH"
    echo "==========================================="
    echo ""
    
    # Run pre-push checks
    CHECK_RESULT=0
    run_pre_push_checks || CHECK_RESULT=$?
    
    if [ $CHECK_RESULT -eq 1 ]; then
      echo "❌ Pre-push checks failed"
      echo "Use '/push force branch $TARGET_BRANCH' to override (not recommended)"
      exit 1
    elif [ $CHECK_RESULT -eq 2 ]; then
      echo "✅ Nothing to push"
      exit 0
    fi
    
    execute_push "$TARGET_BRANCH"
    ;;
    
  "help"|"--help"|"-h")
    cat << 'EOF'
Push Command Help

USAGE:
  /push [command] [target-branch] [--force]

COMMANDS:
  push (default)              Standard push with quality checks
  check, dry-run, validate    Run pre-push checks without pushing
  force, --force, -f          Force push (uses --force-with-lease)
  branch <name>              Push to specific branch
  help                        Show this help

EXAMPLES:
  /push                       Push current branch
  /push check                 Validate without pushing
  /push branch main          Push to main branch
  /push force                Force push current branch

PRE-PUSH CHECKS:
- Uncommitted changes warning
- Build validation (if configured)
- Test execution (if configured)  
- Commit message quality
- Large file detection
- Remote synchronization status

SAFETY FEATURES:
- Uses --force-with-lease for force pushes
- Warns about uncommitted changes
- Validates build and tests before push
- Checks for conflicts with remote

WORKFLOW:
1. /commit to create quality commits
2. /push check to validate readiness
3. /push to execute safe push
4. /hygiene to verify project health
EOF
    ;;
    
  "push"|"")
    echo "📤 Safe Push Workflow"
    echo "====================="
    echo ""
    
    # Run pre-push checks
    CHECK_RESULT=0
    run_pre_push_checks || CHECK_RESULT=$?
    
    if [ $CHECK_RESULT -eq 1 ]; then
      echo "❌ Pre-push checks failed"
      echo ""
      echo "Options:"
      echo "  • Fix the issues and try again"
      echo "  • Use '/push force' to override (not recommended)"
      echo "  • Use '/push check' to re-run validation only"
      exit 1
    elif [ $CHECK_RESULT -eq 2 ]; then
      echo "✅ Repository is already up to date"
      exit 0
    fi
    
    echo ""
    execute_push "$TARGET_BRANCH"
    
    if [ $? -eq 0 ]; then
      echo ""
      echo "🎉 Push completed successfully!"
      echo ""
      echo "Next steps:"
      echo "  • Check CI/CD pipeline if configured"
      echo "  • Create pull request if needed"
      echo "  • Use /hygiene to verify project health"
      echo "  • Use /next for recommended next actions"
    fi
    ;;
    
  *)
    echo "❌ Unknown push command: $COMMAND"
    echo "Use '/push help' for available commands"
    exit 1
    ;;
esac
```

## Features
- **Quality Validation**: Pre-push checks for build, tests, and code quality
- **Safe Force Push**: Uses `--force-with-lease` for safer force operations
- **Branch Management**: Support for pushing to specific branches
- **Conflict Detection**: Warns about remote conflicts before pushing
- **Comprehensive Feedback**: Detailed push summaries and next steps
- **Error Recovery**: Suggests solutions for common push failures

## Safety Measures
- **Pre-push Validation**: Runs build and test checks before pushing
- **Uncommitted Changes**: Warns about uncommitted work
- **Remote Sync Check**: Detects if pull/rebase is needed first
- **Force Push Safety**: Uses `--force-with-lease` instead of `--force`
- **Large File Detection**: Warns about accidentally committing large files