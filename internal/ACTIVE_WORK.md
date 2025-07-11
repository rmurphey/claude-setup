# Active Work - Internal Development

## Current Session Focus
*Currently no active tasks*

## Development Insights
*For development learnings and technical insights, see [internal/LEARNINGS.md](LEARNINGS.md)*

## Architecture Decisions
*Document decisions about the setup tool itself*

### Language Support Architecture
- Each language in separate module (lib/languages/)
- Consistent interface: export default { setup }
- Detection logic remains in main CLI
- Allows easy addition of new languages

## Active Ideas

Quick capture of pending ideas for future consideration:

- [ ] [2025-07-11 07:15] consider to what extent templates/CLAUDE.md should mimic CLAUDE.md.





---

## GitHub Issues

<!-- GITHUB_ISSUES_START -->
*No open GitHub issues*

When new issues are created, they will automatically appear here. Run `claude-setup --sync-issues` to refresh.
<!-- GITHUB_ISSUES_END -->

---

## Deferred Items

- **[2025-07-06]** Multi-language project support with conflict resolution - Detect all languages, resolve tool conflicts (ESLint vs Prettier), create unified config for real-world polyglot projects
  - **Reason**: Complex architectural change requiring significant refactoring of existing single-language assumption
  - **Revisit**: After current architecture stabilizes and user feedback validates need

- **[2025-07-06]** Team workspace templates with role-based configurations - Frontend/backend/DevOps specific setups, shared configs, team onboarding guides to reduce onboarding time from days to hours
  - **Reason**: Focus on core Jest migration and test infrastructure stability before expanding feature scope
  - **Revisit**: After test infrastructure is fully stable and current quality tools are proven

- **[2025-07-06]** Structured logging with progress indicators - Replace console.log with structured logger, add progress bars, JSON output mode for better CI/CD integration
  - **Reason**: Basic console output is sufficient for current needs; prioritizing core functionality over polish features
  - **Revisit**: When user feedback indicates need for better CI/CD integration or progress visibility becomes a pain point

- **[2025-07-06]** Workspace multiplexing for parallel task development - Enable working on multiple tasks simultaneously with isolated workspaces (`claude-setup --workspace feature-auth --from main`). Each workspace gets separate git branch, full dev environment, independent Claude context (ACTIVE_WORK.md), and quality tools. Eliminates context switching overhead and enables parallel development streams when blocked on tasks.
  - **Reason**: Complex feature requiring significant architectural changes; current single-workspace model is sufficient for most users
  - **Revisit**: When multiple users request parallel workspace functionality or when working on large, long-running projects with frequent blocking issues

---

## Completed Work

### Recent Session Focus
- [x] Implement dual directory structure for internal vs external documentation
- [x] Separate development records from user-facing templates
- [x] Ensure clean npm package distribution
- [x] Fix ERR_REQUIRE_ESM error by converting to ES modules
- [x] Refactor CLI to modular architecture
- [x] Add support for GitHub Codespaces
- [x] Implement GitHub issue command

### Completed Quick Capture Items
- [x] [2025-01-04 22:15] add support for github codespaces - COMPLETED
- [x] [2025-01-04 22:16] create a command for working on a specific github issue - PLANNED
- [x] [2025-01-05 14:30] fix ERR_REQUIRE_ESM error - COMPLETED
- [x] [2025-01-05 14:45] refactor CLI to modular architecture - COMPLETED
- [x] [2025-01-05 16:35] implement devcontainer generation for all languages - COMPLETED
- [x] [2025-07-05 21:30] [AI-Generated] Add integration tests for CLI modes - Create end-to-end tests for setup, recovery, and DevContainer modes in temp directories to prevent regressions in user-facing workflows
- [x] [2025-07-05 22:00] Fix ES module test infrastructure - Jest configuration, CLI side effects, basic unit tests working
- [x] [2025-07-05 22:30] Systematic test suite fix - Replaced 6 broken test files with 1 comprehensive working test using proper ES module patterns
- [x] [2025-07-05 22:45] GitHub issue command Phase 1 - Implemented dual-architecture GitHub issue command (internal + template) with API wrapper, branch creation, and context documentation
- [x] [2025-07-05 23:00] GitHub issue command complete - Phase 1 delivered 80% of planned value with comprehensive workflow. Phase 2+ deferred as incremental polish vs high-impact alternatives
- [x] [2025-07-05 23:15] Smart language detection implemented - Best-guess with verification approach reduces friction for all users. Handles single detection, multiple candidates, and graceful fallbacks
- [x] [2025-07-06 00:00] Swift language support added - Complete Swift project setup with Package.swift generation, SwiftLint configuration, DevContainer support, and smart detection
- [x] [2025-07-06 16:45] [AI-Generated] One-command project recovery for broken setups - Add `claude-setup --fix` command that detects missing files and restores them to save hours of manual re-setup
- [x] [2025-07-06 17:35] [User-Requested] GitHub Issues integration into ACTIVE_WORK.md - Sync open GitHub issues into active work tracking with `claude-setup --sync-issues`. Automatic integration when accessing ACTIVE_WORK.md for unified task management.
- [x] [2025-07-10 15:30] Fix CLI execution detection for npx usage - Original ES module check failed when run via npx because execution path differs from file path. Simplified to always run main() since this is a CLI script. Supports direct execution, npx, global install, and package.json bin methods.
- [x] [2025-07-10 21:30] Optimize test performance and document NPX behavior - Fixed test suite performance (reduced from hanging to <1 second), optimized LanguageDetector file scanning, added comprehensive NPX behavior documentation and integration tests. Test suite now includes 75 tests covering all execution modes.

### Session History
- **2025-01-04**: Implemented dual directory structure to separate internal development records from user templates
- **2025-01-05**: Fixed ES module conversion and refactored CLI architecture
- **2025-07-05**: GitHub issue command, systematic test recovery, smart language detection
- **2025-07-06**: Swift language support implementation
