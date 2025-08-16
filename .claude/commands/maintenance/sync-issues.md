---
title: Sync GitHub Issues
description: Sync open GitHub issues into ACTIVE_WORK.md for unified task tracking
---

# GitHub Issues Sync Command

## Overview
Automatically pulls open GitHub issues from this repository and integrates them into `internal/ACTIVE_WORK.md` for unified task tracking.

## Usage
```bash
claude-setup --sync-issues
```

## What It Does
- Fetches all open GitHub issues using `gh` CLI
- Formats them for integration with ACTIVE_WORK.md
- Includes issue number, title, labels, assignees, and URLs
- Creates/updates GitHub Issues section in ACTIVE_WORK.md
- Maintains separation between internal todos and external GitHub issues

## Prerequisites
- GitHub CLI (`gh`) must be installed and authenticated
- Repository must be a GitHub repository
- User must have read access to repository issues

## Output Format
Issues are formatted as:
```markdown
## GitHub Issues

<!-- GITHUB_ISSUES_START -->
- [ ] **#123** [bug] Fix authentication error (@username)
  - **URL**: https://github.com/owner/repo/issues/123
  - **Created**: 12/6/2025

- [ ] **#124** [feature] Add dark mode support
  - **URL**: https://github.com/owner/repo/issues/124
  - **Created**: 12/5/2025
<!-- GITHUB_ISSUES_END -->
```

## Integration with Development Workflow
- **Session Planning**: See both internal tasks and external issues in one place
- **Priority Management**: Easily review all work items during session focus
- **Status Tracking**: Check off completed GitHub issues in ACTIVE_WORK.md
- **Context Switching**: Quick access to issue URLs for detailed discussion

## Automation
The sync happens automatically when:
- Running `claude-setup --sync-issues` manually
- ACTIVE_WORK.md is accessed (if GitHub CLI is available)

## Error Handling
- Gracefully handles missing GitHub CLI
- Shows clear message when no issues exist
- Creates placeholder section for future issues
- Continues setup operations if sync fails