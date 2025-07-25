# Interactive Command Failures - NEVER REPEAT

## Critical Rule: NO INTERACTIVE COMMANDS IN AUTOMATED CONTEXTS

### The Problem
Commands that open pagers, editors, or require user input will hang indefinitely when run by AI agents, wasting massive amounts of tokens and user time.

### FORBIDDEN COMMANDS (use alternatives instead)

#### GitHub CLI Commands
- ❌ `gh issue list` - opens pager
- ❌ `gh pr list` - opens pager  
- ❌ `gh repo view` - opens pager
- ❌ `gh issue view <number>` - opens pager

#### Git Commands
- ❌ `git diff` - opens pager (use `git --no-pager diff`)
- ❌ `git log` - opens pager (use `git log --oneline -n 5`)
- ❌ `git show` - opens pager (use `git --no-pager show`)

#### File Viewing Commands
- ❌ `less file.txt` - interactive pager
- ❌ `more file.txt` - interactive pager
- ❌ `vi file.txt` - opens editor
- ❌ `nano file.txt` - opens editor

### SAFE ALTERNATIVES

#### GitHub API Queries
```bash
# List open issues
curl -s "https://api.github.com/repos/owner/repo/issues?state=open"

# Get specific issue
curl -s "https://api.github.com/repos/owner/repo/issues/123"

# List pull requests
curl -s "https://api.github.com/repos/owner/repo/pulls?state=open"
```

#### Git Commands (Non-Interactive)
```bash
# Safe git commands
git --no-pager diff
git log --oneline -n 5
git status --porcelain
git --no-pager show HEAD
```

#### File Operations
```bash
# Use these instead of pagers/editors
cat file.txt
head -20 file.txt
tail -20 file.txt
grep "pattern" file.txt
```

### The Specific Failure Case
**Date:** 2025-01-25
**Command:** `gh issue list`
**Result:** Hung waiting for user to page through results
**Tokens Wasted:** 20+ function calls repeating the same broken command
**Fix:** Used `curl -s "https://api.github.com/repos/rmurphey/claude-setup/issues?state=open"`

### Prevention Rules
1. **Test commands first** - if unsure, try with a simple test
2. **Use --no-pager flags** when available
3. **Prefer API calls over CLI tools** for programmatic access
4. **Never retry the same failing command** - switch approaches immediately
5. **Always output to stdout** - never open editors or pagers

### Emergency Detection
If you see these symptoms, STOP and use alternatives:
- Command hangs without output
- User complains about waiting for input
- Terminal shows pager indicators (`:`, `(END)`, `--More--`)
- Commands that normally return quickly are taking forever