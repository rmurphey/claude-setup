---
allowed_tools:
  - bash
  - str_replace_editor
  - file_editor
---

# GitHub Issue Command

Streamlined workflow for working on GitHub issues with automatic branch creation and context setup.

## Usage

- `issue <number>` - Work on specific issue in current repo
- `issue <number> owner/repo` - Work on issue in different repo  
- `issue list` - List open issues
- `issue current` - Show current issue context
- `issue help` - Show help

## Process

### 1. Issue Workflow
When working on an issue:

```bash
# Fetch issue details from GitHub API
gh api repos/$(gh repo view --json owner,name --jq '.owner.login + "/" + .name')/issues/{issue_number}

# Create appropriately named branch
git checkout main && git pull
git checkout -b {username}/{type}/issue-{number}-{title}

# Set up issue context documentation
mkdir -p .claude/issues
```

### 2. Branch Naming Convention
Format: `{username}/{type}/issue-{number}-{title}`

**Issue Types** (based on labels):
- `ktlo` - Bug fixes, maintenance
- `feat` - New features, enhancements  
- `docs` - Documentation changes
- `test` - Testing improvements
- `improvement` - Refactoring, cleanup
- `productivity` - Developer experience

### 3. Issue Context Documentation
Create `.claude/issues/issue-{number}.md` with:

```markdown
# Issue #{number}: {title}

## Issue Details
- **Repository**: {repo}
- **State**: {state}
- **Author**: {author}
- **Created**: {date}
- **URL**: {url}

## Labels
{labels}

## Description
{body}

## Progress Notes
- [ ] Issue analysis completed
- [ ] Implementation plan created
- [ ] Development started
- [ ] Testing completed
- [ ] Ready for review

## Implementation Notes
*Add notes about your approach, discoveries, and decisions here*
```

### 4. Update ACTIVE_WORK.md
Add current issue focus to active work tracking:

```markdown
## Current Session Focus
Working on Issue #{number}: {title}
- **Branch**: {branch_name}
- **State**: {state}
- **URL**: {url}
- **Context**: .claude/issues/issue-{number}.md
```

## Implementation

Use the GitHub CLI and API for issue management:

```bash
# List issues
gh issue list --limit 10

# Get issue details
gh issue view {number} --json title,body,labels,state,author,url

# Create branch (manual implementation)
issue_data=$(gh issue view $1 --json title,labels,state,author,url)
title=$(echo "$issue_data" | jq -r '.title')
username=$(git config user.name | tr '[:upper:]' '[:lower:]' | tr ' ' '')
sanitized_title=$(echo "$title" | sed 's/[^a-zA-Z0-9 ]//g' | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | cut -c1-30)
branch_name="${username}/feat/issue-${1}-${sanitized_title}"

git checkout main && git pull && git checkout -b "$branch_name"
```

## Notes

- Requires GitHub CLI authentication (`gh auth login`)
- Falls back to GITHUB_TOKEN environment variable
- Automatically detects issue type from labels
- Creates clean, descriptive branch names
- Maintains issue context across sessions
- Integrates with existing ACTIVE_WORK.md workflow

## Error Handling

- Validate GitHub authentication before API calls
- Check if issue exists and is accessible
- Handle network errors gracefully
- Verify git repository state before branch creation
- Provide clear error messages for common failures