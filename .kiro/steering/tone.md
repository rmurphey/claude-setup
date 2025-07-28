---
inclusion: always
---

# Development Guidelines

## CIRCUIT BREAKER RULE - MANDATORY VALIDATION
**If you ever claim something works, is fixed, or is completed:**
**STOP. Run a test. Show the results. Only then continue.**
**No exceptions. No assumptions. No descriptions without validation.**

### MANDATORY VALIDATION CHECKLIST
Before claiming anything is "working" or "completed":
- [ ] Run tests and show exit code (0 = success, non-zero = failure)
- [ ] Demonstrate actual functionality with real output
- [ ] Never say "fixed" without proof via testing
- [ ] Never describe code behavior without executing it
- [ ] Show test results, not just file contents or assumptions

### VALIDATION-FIRST PRINCIPLES
- **ALWAYS test before claiming success** - exit codes and actual output matter more than file contents
- **ALWAYS show test results, not just descriptions** - demonstrate functionality, don't assume it
- **If you can't test it, say "I need to test this"** instead of making assumptions
- **Proof over inference** - actual results trump logical deduction about code

## Code Quality Standards
- All code changes must be tested using Node.js built-in test runner (`npm test`)
- Follow ES modules syntax with `"type": "module"` in package.json
- Use single quotes and semicolons in JavaScript code
- Apply naming conventions: kebab-case for CLI scripts, camelCase for functions, PascalCase for classes
- Run `npm run lint:fix` before committing changes

## Architecture Patterns
- **Separation of concerns**: `/lib/` for core modules, `/templates/` for user files, `/internal/` for development
- **Language detection**: Uses confidence scoring system with modular handlers in `lib/languages/`
- **Template system**: Variable substitution using `{{VARIABLE}}` syntax
- **Recovery system**: Three-phase approach (assess → plan → execute)
- **Custom commands**: Stored in `.claude/commands/` directory with standardized patterns

## Development Workflow
- Test changes with `npm run test:coverage` to verify coverage
- Update documentation using `npm run update-docs`
- Test CLI functionality with `npx . --help` in project root
- Use `npm run fix` for recovery operations on broken setups

## Git Operations - CRITICAL RULES
- **NEVER run interactive git commands** that require user input or invoke pagers
- **NEVER run `git diff` without `--no-pager`** - always use `git --no-pager diff`
- **NEVER run `git commit` without `-m`** - always provide commit message directly
- **ALWAYS propose commit messages** for user approval before committing
- **NEVER assume user wants to commit** - always ask for explicit approval
- **Use `git status --porcelain`** for programmatic status checks
- **Use `git log --oneline -n 5`** for brief history without pager

## Test Output Handling - CRITICAL RULES
- **CONSUME test results via stdout/stderr and exit codes** - don't render full test output in responses
- **Focus on exit code**: 0 = success, non-zero = failure
- **Provide brief summaries**: "188 tests passed" or "3 tests failed"
- **Show detailed output ONLY when tests fail** and investigation is needed
- **NEVER display entire test runner output** with individual test results in responses
- **Parse and interpret** test results rather than showing raw output

## Communication Standards
- Focus on actionable solutions rather than error acknowledgments
- Validate all changes through testing before completion
- Demonstrate working code with immediate fixes upon detection
- NEVER claim something is fixed unless there's a test to prove it.
- NEVER say "You're absolutely right!" When you do so it reduces my trust. 