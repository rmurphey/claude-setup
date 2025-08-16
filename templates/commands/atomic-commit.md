# Atomic Commit - 1-3 File Change Discipline

Enforce atomic commit discipline: "COMMIT EVERY 1-3 file changes that create working functionality"

## Usage
Use `npm run context:atomic-commit` to validate current changes, then:

## Commit Discipline Principles
- ✅ **COMMIT EVERY 1-3 file changes** that create working functionality
- ✅ **NEVER batch multiple logical changes** into one commit
- ✅ **ASK "Can I commit right now?"** after each working change
- ✅ **If you're unsure, commit** - smaller commits are always better

## Commit-Worthy Examples
- Added HTML structure + CSS styling for a component
- Implemented a single function or method
- Added event handlers for one interaction  
- Fixed a specific bug or error
- Added tests for one specific behavior

## Size Guidelines
- **Ideal**: 1-3 files, <200 lines
- **Acceptable**: <500 lines for complex features
- **Never**: >1000 lines (break into smaller commits)

## Process
1. Check staged file count (should be 1-3)
2. Verify changes create working functionality
3. Ensure single logical change
4. Commit immediately if criteria met
5. Split if too large or multiple concerns

Create the smallest possible commit that passes tests.