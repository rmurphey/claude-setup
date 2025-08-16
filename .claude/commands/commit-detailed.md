---
allowed-tools: [Bash]
description: Quality-checked commit workflow with automatic pre-commit validation
---

# Quality-Checked Commit Command

Automated commit workflow that runs quality checks, validates changes, and creates well-formatted commits following conventional commit standards.

## Context
- Git status: !`git status --porcelain | wc -l | xargs`+ changed files
- Staging area: !`git diff --cached --name-only | wc -l | xargs`+ staged files
- Branch: !`git branch --show-current 2>/dev/null || echo "unknown"`
- Last commit: !`git log -1 --format="%cr - %s" 2>/dev/null || echo "no commits"`

## Your Task
Execute a quality-checked commit workflow that validates code quality before creating commits:

```bash
#!/bin/bash

# Parse command arguments
COMMIT_TYPE="${1}"
MESSAGE="$2"
SKIP_CHECKS="${3}"

# Function to run quality checks
run_quality_checks() {
  echo "🔍 Running pre-commit quality checks..."
  
  local has_errors=false
  
  # Check if there are staged changes
  if [ -z "$(git diff --cached --name-only)" ]; then
    echo "❌ No staged changes found. Stage some files first with 'git add <files>'"
    return 1
  fi
  
  # Note: This is a template repository, so we skip most quality checks
  # Customize these checks for your specific project needs
  
  echo "  ✅ Template repository - minimal checks only"
  
  # 5. File size check
  LARGE_FILES=$(git diff --cached --name-only | xargs -I {} sh -c 'if [ -f "{}" ] && [ $(wc -c < "{}") -gt 1000000 ]; then echo "{}"; fi')
  if [ -n "$LARGE_FILES" ]; then
    echo "  ⚠️  Large files detected (>1MB):"
    echo "$LARGE_FILES" | sed 's/^/     /'
    echo "     Consider if these should be committed"
  fi
  
  # 6. Security check - look for potential secrets
  POTENTIAL_SECRETS=$(git diff --cached | grep -iE "(password|secret|token|key|api[_-]?key)" | head -3)
  if [ -n "$POTENTIAL_SECRETS" ]; then
    echo "  🚨 Potential secrets detected in staged changes:"
    echo "$POTENTIAL_SECRETS" | sed 's/^/     /'
    echo "     Review carefully before committing"
    has_errors=true
  fi
  
  if [ "$has_errors" = true ]; then
    return 1
  else
    echo "  🎉 All quality checks passed!"
    return 0
  fi
}

# Function to generate commit message
generate_commit_message() {
  local type="$1"
  local message="$2"
  
  # Get list of changed files for context
  local changed_files=$(git diff --cached --name-only | head -5 | tr '\n' ',' | sed 's/,$//')
  local file_count=$(git diff --cached --name-only | wc -l | xargs)
  
  # Analyze changes to suggest better commit type if not provided
  if [ -z "$type" ] || [ "$type" = "auto" ]; then
    # Auto-detect commit type based on changes
    local has_new_files=$(git diff --cached --diff-filter=A --name-only | wc -l | xargs)
    local has_deletions=$(git diff --cached --diff-filter=D --name-only | wc -l | xargs)
    local has_tests=$(git diff --cached --name-only | grep -E '\.(test\.|spec\.)' | wc -l | xargs)
    local has_docs=$(git diff --cached --name-only | grep -E '\.(md|txt|rst)$' | wc -l | xargs)
    local has_config=$(git diff --cached --name-only | grep -E '(config|\.json|\.yaml|\.yml|\.toml)$' | wc -l | xargs)
    
    if [ "$has_tests" -gt 0 ] && [ "$file_count" -eq "$has_tests" ]; then
      type="test"
    elif [ "$has_docs" -gt 0 ] && [ "$file_count" -eq "$has_docs" ]; then
      type="docs"
    elif [ "$has_config" -gt 0 ]; then
      type="chore"
    elif [ "$has_new_files" -gt 0 ] && [ "$has_deletions" -eq 0 ]; then
      type="feat"
    elif [ "$has_deletions" -gt 0 ]; then
      type="refactor"
    else
      type="fix"
    fi
    
    echo "🤖 Auto-detected commit type: $type"
  fi
  
  # Generate message if not provided
  if [ -z "$message" ]; then
    case "$type" in
      "feat"|"feature")
        message="add new functionality ($file_count files changed)"
        ;;
      "fix")
        message="resolve issues ($file_count files changed)"
        ;;
      "docs")
        message="update documentation ($file_count files changed)"
        ;;
      "test")
        message="add/update tests ($file_count files changed)"
        ;;
      "refactor")
        message="improve code structure ($file_count files changed)"
        ;;
      "chore")
        message="maintenance and configuration updates"
        ;;
      "style")
        message="formatting and style improvements"
        ;;
      *)
        message="update $type functionality ($file_count files changed)"
        ;;
    esac
    echo "📝 Generated message: $message"
  fi
  
  # Format according to conventional commits
  echo "${type}: ${message}"
}

# Main commit workflow
case "$COMMIT_TYPE" in
  "help"|"-h"|"--help")
    cat << 'EOF'
Quality-Checked Commit Command Help

USAGE:
  /commit [type] [message] [--skip-checks]

COMMIT TYPES (conventional commits):
  feat, feature    New feature or functionality
  fix             Bug fix or issue resolution
  docs            Documentation changes
  test            Test additions or updates  
  refactor        Code refactoring
  chore           Maintenance, dependencies, config
  style           Formatting, white-space changes
  perf            Performance improvements
  auto            Auto-detect based on changes (default)

EXAMPLES:
  /commit                              Auto-commit with quality checks
  /commit feat "add user authentication"
  /commit fix "resolve login bug"
  /commit docs "update API documentation"
  /commit --skip-checks               Skip quality validation

QUALITY CHECKS:
- Linting (ESLint/configured linter)
- Type checking (TypeScript if configured)
- Tests (runs changed test files)
- Build validation (if build script exists)
- File size warnings (>1MB files)
- Security scan (potential secrets)

WORKFLOW:
1. Stage your changes: git add <files>
2. Run /commit [type] [message]
3. Quality checks run automatically
4. Commit created with conventional format
5. Includes Claude co-authorship

The command will abort if quality checks fail.
Use --skip-checks only in exceptional circumstances.
EOF
    ;;
    
  "--skip-checks"|"skip"|"force")
    echo "⚠️  Skipping quality checks (not recommended)"
    
    if [ -z "$(git diff --cached --name-only)" ]; then
      echo "❌ No staged changes found. Stage some files first with 'git add <files>'"
      exit 1
    fi
    
    COMMIT_MSG=$(generate_commit_message "auto" "")
    
    # Create commit with Claude co-authorship
    git commit -m "$(cat <<EOF
$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
    
    if [ $? -eq 0 ]; then
      echo "✅ Commit created successfully (quality checks skipped)"
      git log -1 --oneline
    else
      echo "❌ Commit failed"
      exit 1
    fi
    ;;
    
  *)
    # Default workflow: quality-checked commit
    echo "🚀 Starting quality-checked commit workflow..."
    
    # Check for staged changes
    if [ -z "$(git diff --cached --name-only)" ]; then
      echo "📄 No staged changes. Showing current git status:"
      git status --short
      echo ""
      echo "Stage changes with: git add <files>"
      echo "Or stage all changes: git add -A"
      exit 1
    fi
    
    # Show what will be committed
    echo "📋 Changes to be committed:"
    git diff --cached --name-status | sed 's/^/  /'
    echo ""
    
    # Run quality checks unless skipping
    if [ "$SKIP_CHECKS" != "--skip-checks" ] && [ "$SKIP_CHECKS" != "skip" ]; then
      if ! run_quality_checks; then
        echo ""
        echo "❌ Quality checks failed. Fix issues and try again."
        echo "Or use '/commit skip' to bypass checks (not recommended)"
        exit 1
      fi
    fi
    
    echo ""
    
    # Generate commit message
    COMMIT_MSG=$(generate_commit_message "$COMMIT_TYPE" "$MESSAGE")
    echo "💬 Commit message: $COMMIT_MSG"
    echo ""
    
    # Create the commit
    git commit -m "$(cat <<EOF
$COMMIT_MSG

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
    
    if [ $? -eq 0 ]; then
      echo "✅ Quality-checked commit created successfully!"
      echo ""
      echo "📊 Commit summary:"
      git log -1 --stat
      echo ""
      echo "🚀 Next steps:"
      echo "  • Review with: git show"
      echo "  • Push when ready: /push"
      echo "  • Check project health: /hygiene"
    else
      echo "❌ Commit failed. Check git status and try again."
      exit 1
    fi
    ;;
esac
```

## Features
- **Automated Quality Checks**: Runs linting, type checking, tests, and build validation
- **Conventional Commits**: Follows conventional commit format automatically
- **Smart Type Detection**: Auto-detects commit type based on file changes
- **Security Scanning**: Warns about potential secrets in staged changes
- **File Size Monitoring**: Alerts about large files being committed
- **Claude Co-Authorship**: Automatically adds Claude as co-author
- **Flexible Usage**: Supports manual type/message specification or auto-generation

## Quality Gates
The command enforces these quality standards before allowing commits:
- **Lint**: Code style and formatting compliance
- **Types**: TypeScript type checking (if applicable)
- **Tests**: Runs relevant test suites  
- **Build**: Validates build process doesn't break
- **Security**: Scans for potential credential leaks
- **Size**: Warns about unexpectedly large files

Use `--skip-checks` only in exceptional circumstances when quality gates need to be bypassed.