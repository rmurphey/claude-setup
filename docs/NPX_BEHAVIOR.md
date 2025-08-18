# NPX Execution Behavior

## Overview

When users run `npx github:rmurphey/claude-setup` in any directory, they should get an interactive project setup experience that works regardless of the directory state.

## Expected Behavior in Empty Directory

### Initial Execution
```bash
npx github:rmurphey/claude-setup
```

**Should display:**
1. **Welcome message**: `🤖 Claude Code Project Setup`
2. **Mode selection prompt**: Interactive menu with 2 options:
   - `🚀 Set up new project infrastructure`
   - `🏥 Assess and recover existing codebase`

### Setup Mode (Default Flow)

When user selects "Set up new project infrastructure":

1. **Language Detection**: 
   - Scans directory for config files and source code
   - In empty directory: Shows "No specific language detected, showing all options"
   - Presents language selection menu

2. **Configuration Questions**:
   - Project type (JavaScript/TypeScript, Python, Go, Rust, Java, Swift, Mixed/Other)
   - Quality level (Strict, Standard, Relaxed)
   - Team size (Solo, Small, Team)
   - CI/CD setup (Yes/No)

3. **Project Creation**:
   - Initializes git repository if not present
   - Creates documentation files:
     - `CLAUDE.md` (AI collaboration guidelines)
     - `ACTIVE_WORK.md` (session management)
     - `.gitignore` (language-specific)
   - Sets up language-specific tooling
   - Creates `.claude/commands/` directory with 15+ custom commands
   - Installs quality tools (linting, testing, etc.)
   - Creates initial git commit
   - Shows next steps

### Recovery Mode

When user selects "Assess and recover existing codebase":

1. **Analysis**: Examines existing project structure
2. **Installation**: Adds recovery commands to `.claude/commands/`
3. **Guidance**: Provides commands for assessment and improvement


## Command Line Arguments

### --sync-issues
```bash
npx github:rmurphey/claude-setup --sync-issues
```

**Behavior:**
- Detects `ACTIVE_WORK.md` or `internal/ACTIVE_WORK.md`
- Syncs GitHub issues into the file
- Requires GitHub CLI (`gh`) to be installed
- Fails gracefully if no ACTIVE_WORK.md exists

### --fix
```bash
npx github:rmurphey/claude-setup --fix
```

**Behavior:**
- Runs recovery system
- Detects missing project files
- Restores them from templates
- Works in both empty and existing directories

## Error Handling

### Empty Directory Scenarios

1. **No git repository**: Initializes one automatically
2. **No package manager files**: Creates appropriate ones based on language selection
3. **No existing tooling**: Installs from scratch

### Existing Directory Scenarios

1. **Conflicting files**: Asks before overwriting
2. **Existing git repo**: Works with existing history
3. **Partial setup**: Fills in missing pieces

## Success Criteria

After successful npx execution in empty directory:

✅ **Files Created:**
- `CLAUDE.md`, `ACTIVE_WORK.md`, `.gitignore`
- `.claude/commands/` with 15+ command files
- Language-specific config files (package.json, requirements.txt, etc.)

✅ **Git State:**
- Repository initialized
- Initial commit created with descriptive message
- All files staged and committed

✅ **Tooling:**
- Language-specific linting/testing tools configured
- Quality standards enforced
- Commands available for development workflow

✅ **Documentation:**
- Clear next steps displayed
- Instructions for connecting to remote repository
- Guidance on running quality checks

## Performance Requirements

- **Total execution time**: < 30 seconds for setup mode
- **Interactive responses**: < 2 seconds between prompts
- **File operations**: Minimal I/O, optimized for speed
- **Network requests**: Only for package downloads

## Platform Support

- **macOS**: Full support
- **Linux**: Full support  
- **Windows**: Basic support (some commands may differ)
- **GitHub Codespaces**: Optimized for cloud development

## Error Recovery

- **Network failures**: Graceful fallback to local templates
- **Permission errors**: Clear error messages with solutions
- **Interrupted execution**: Can be re-run safely
- **Missing dependencies**: Automatic installation where possible