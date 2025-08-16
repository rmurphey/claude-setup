# Command Templates Catalog

Complete reference for all 19 Claude Code command templates with usage examples and customization options.

## Table of Contents

### Core Workflow (4)
- [/hygiene](#hygiene) - Project health check
- [/todo](#todo) - Task management
- [/commit](#commit) - Quality-checked commits
- [/next](#next) - AI-recommended priorities

### Planning & Design (4)
- [/design](#design) - Feature planning
- [/estimate](#estimate) - Claude usage estimation
- [/defer](#defer) - Task deferral
- [/issue](#issue) - GitHub issue workflow

### Documentation & Learning (4)
- [/docs](#docs) - Documentation generation
- [/learn](#learn) - Capture insights
- [/reflect](#reflect) - Session reflection
- [/update-docs](#update-docs) - Documentation updates

### Release & Quality (4)
- [/push](#push) - Push with quality checks
- [/version-tag](#version-tag) - Version management
- [/maintainability](#maintainability) - Code analysis
- [/atomic-commit](#atomic-commit) - Small commit discipline

### Development Utilities (3)
- [/archive](#archive) - Archive completed work
- [/edit-not-create](#edit-not-create) - Prefer editing
- [/find-working-equivalent](#find-working-equivalent) - Find examples

---

## Core Workflow Commands

### /hygiene

**Purpose**: Comprehensive project health check covering code quality, tests, dependencies, and git status.

**Allowed Tools**: `[Bash]`

**Usage**:
```bash
/hygiene
```

**What It Does**:
1. Runs code quality checks (lint, type checking)
2. Executes test suite
3. Checks dependency health and security
4. Reviews git repository status
5. Analyzes project structure
6. Verifies development environment
7. Tests build process
8. Provides overall health score

**Example Output**:
```
🔍 Running code quality checks...
✅ Lint check passed
✅ TypeScript check passed

🧪 Checking test status...
✅ Tests passed (15/15)

📦 Checking dependencies...
✅ No security vulnerabilities
⚠️ 3 outdated packages

🌿 Git status check...
✅ Working directory clean
Current branch: main

🏥 HYGIENE REPORT SUMMARY
========================
✅ Code quality: PASS
✅ Tests: PASS
✅ Dependencies: SECURE
✅ Git status: CLEAN

OVERALL HEALTH: 7/7 (100%)
🎉 Excellent! Your project is in great shape.
```

**Customization**:
- Adjust warning thresholds in the command file
- Add project-specific checks
- Modify scoring criteria

---

### /todo

**Purpose**: Task management system integrated with ACTIVE_WORK.md for tracking development tasks.

**Allowed Tools**: `[Bash, Read, Write]`

**Usage**:
```bash
/todo                      # List tasks
/todo add "Fix login bug"  # Add task
/todo done 1              # Complete task #1
/todo done "login"        # Complete by text match
/todo remove 3            # Remove task
/todo priority "Critical fix"  # Add priority task
/todo cleanup             # Archive completed tasks
```

**Commands**:
- `list/show/status` - Display current tasks
- `add/create/new` - Add new task
- `done/complete/check` - Mark as completed
- `remove/delete/rm` - Remove task
- `priority/urgent` - Manage high priority
- `cleanup/clean` - Archive completed

**Integration**:
- Tasks stored in `ACTIVE_WORK.md`
- Checkbox format: `- [ ]` and `- [x]`
- Priority marked with ⭐
- Supports task numbering and text matching

**Example Session**:
```bash
/todo add "Implement user authentication"
# ✅ Task added to ACTIVE_WORK.md

/todo list
# ⏳ Pending Tasks:
#   1. Implement user authentication
#   2. Add password validation
#   3. Create session handling

/todo done 1
# ✅ Task #1 completed

/todo priority add "Fix security vulnerability"
# ✅ Priority task added
```

---

### /commit

**Purpose**: Quality-checked commit workflow with automatic pre-commit validation and conventional commit formatting.

**Allowed Tools**: `[Bash]`

**Usage**:
```bash
/commit                              # Auto-detect type and message
/commit feat "add user auth"        # Specific type and message
/commit fix                          # Specific type, auto message
/commit --skip-checks                # Skip quality validation (not recommended)
```

**Commit Types**:
- `feat/feature` - New functionality
- `fix` - Bug fixes
- `docs` - Documentation
- `test` - Test additions
- `refactor` - Code restructuring
- `chore` - Maintenance
- `style` - Formatting
- `perf` - Performance

**Quality Checks**:
1. Linting (ESLint or configured linter)
2. Type checking (TypeScript if present)
3. Test execution
4. Build validation
5. File size warnings (>1MB)
6. Security scan for secrets

**Features**:
- Automatic type detection based on changes
- Conventional commit format
- Claude co-authorship added
- Pre-commit quality gates
- Smart commit message generation

**Example**:
```bash
# Stage changes
git add src/auth.js

# Quality-checked commit
/commit feat "add JWT authentication"

# Output:
🔍 Running pre-commit quality checks...
  ✅ Lint check passed
  ✅ TypeScript check passed
  ✅ Tests passed
  ✅ Build check passed

💬 Commit message: feat: add JWT authentication

✅ Quality-checked commit created successfully!
```

---

### /next

**Purpose**: AI-powered task prioritization analyzing project state to recommend next actions.

**Allowed Tools**: `[Bash, Read]`

**Usage**:
```bash
/next            # Get recommendations
/next detailed   # Verbose analysis
/next quick      # Brief suggestions
```

**Analysis Factors**:
- Current git status and uncommitted changes
- Test failures or quality issues
- TODO/FIXME comments in code
- Open tasks in ACTIVE_WORK.md
- Recent commit patterns
- Project health metrics

**Example Output**:
```
🎯 Next Step Recommendations
=============================

Based on project analysis:
- 3 uncommitted files
- 2 failing tests
- 5 TODO comments
- Clean dependencies

PRIORITY RECOMMENDATIONS:

1. 🔴 Fix failing tests (2 failures)
   - auth.test.js: "login validation"
   - session.test.js: "token expiry"
   Impact: Blocking deployment

2. 🟡 Commit staged changes
   - 3 files ready to commit
   - Use: /commit feat

3. 🟢 Address TODO in auth.js:45
   - "TODO: Add rate limiting"
   Impact: Security improvement

Use /todo to track these tasks
```

---

## Planning & Design Commands

### /design

**Purpose**: Create structured feature design documents for planning implementation.

**Allowed Tools**: `[Write, Read]`

**Usage**:
```bash
/design "user authentication"     # Create design doc
/design list                      # List existing designs
/design review "authentication"   # Review specific design
```

**Creates**: `.claude/designs/[feature-name].md`

**Design Template Includes**:
- Feature overview and goals
- User stories and requirements
- Technical approach
- API design
- Data models
- Security considerations
- Testing strategy
- Implementation phases
- Success metrics

**Example Design Structure**:
```markdown
# Feature Design: User Authentication

## Overview
Secure authentication system with JWT tokens...

## User Stories
- As a user, I want to log in securely
- As an admin, I want to manage user sessions

## Technical Approach
### Architecture
- JWT-based authentication
- Redis session storage
- bcrypt password hashing

### API Endpoints
POST /auth/login
POST /auth/logout
GET /auth/verify

## Implementation Phases
1. Basic login/logout
2. Session management
3. Password reset
4. 2FA integration
```

---

### /estimate

**Purpose**: Estimate Claude usage and interaction costs for development tasks.

**Allowed Tools**: `[Bash, Read]`

**Usage**:
```bash
/estimate bug              # Bug fix estimates
/estimate feature large    # Large feature estimate
/estimate session          # Daily usage patterns
/estimate project          # Full project scope
/estimate cost             # Cost optimization tips
```

**Task Types**:
- `bug/fix/debug` - Bug fixing patterns
- `feature/feat` - Feature development
- `refactor/cleanup` - Code refactoring
- `test/testing` - Test creation
- `docs/documentation` - Documentation
- `session/daily` - Daily patterns
- `project/total` - Project totals

**Provides**:
- Message count estimates
- Time estimates
- Complexity factors
- Cost optimization tips
- Efficiency recommendations

**Example Output**:
```
✨ Feature Development Estimation
==================================

Medium feature (multiple components):
  • Messages: 50-120 (avg: 85)
  • Time: 1-2 days
  • Examples: User profile, search

Your specific feature factors:
  • Complexity: Medium
  • Integration points: 3
  • Testing required: Yes

Adjusted estimate: 90-110 messages

💡 Tips:
  • Break into smaller tasks
  • Use /design first
  • Batch related questions
```

---

### /defer

**Purpose**: Manage deferred tasks and technical debt in a structured backlog.

**Allowed Tools**: `[Read, Write]`

**Usage**:
```bash
/defer "Optimize database queries"  # Defer a task
/defer list                         # Show deferred items
/defer promote 3                    # Move to active
/defer cleanup                      # Archive old items
```

**Features**:
- Captures tasks with context
- Tracks deferral reasons
- Maintains priority levels
- Links to code locations
- Periodic review reminders

**Backlog Structure**:
```markdown
## Deferred Tasks

### Performance Optimizations
- [ ] Database query optimization (deferred: 2024-01-15)
  - Reason: Not critical path
  - Impact: 20% speed improvement
  - Location: src/db/queries.js

### Technical Debt
- [ ] Refactor authentication module
  - Reason: Working but complex
  - Files: 5 files affected
  - Estimate: 2 days
```

---

### /issue

**Purpose**: Streamline GitHub issue workflow with branch creation and context setup.

**Allowed Tools**: `[Node.js executable]`

**Usage**:
```bash
/issue 123                    # Work on issue #123
/issue 456 owner/repo        # Different repository
/issue list                  # List open issues
/issue list --state closed   # List closed issues
/issue current               # Show current issue
```

**Workflow**:
1. Fetches issue details from GitHub
2. Creates appropriately named branch
3. Generates issue context document
4. Updates ACTIVE_WORK.md
5. Sets up development environment

**Branch Naming**:
```
username/type/issue-number-title
Example: john/feat/issue-123-add-authentication
```

**Creates**:
- Branch: Based on issue type and title
- Context: `.claude/issues/issue-123.md`
- Updates: `ACTIVE_WORK.md` with issue focus

**Requirements**:
- GitHub authentication (`gh auth login` or `GITHUB_TOKEN`)
- Git repository with GitHub remote

---

## Documentation & Learning Commands

### /docs

**Purpose**: Generate and maintain project documentation systematically.

**Allowed Tools**: `[Read, Write, Bash]`

**Usage**:
```bash
/docs api              # Generate API documentation
/docs readme           # Update README
/docs architecture     # Create architecture docs
/docs all              # Full documentation update
```

**Documentation Types**:
- API reference
- README updates
- Architecture diagrams
- Setup guides
- Contributing guidelines
- Change logs

**Features**:
- Auto-generates from code
- Maintains consistent format
- Updates existing docs
- Links related documents
- Includes examples

---

### /learn

**Purpose**: Capture development insights and patterns for future reference.

**Allowed Tools**: `[Read, Write]`

**Usage**:
```bash
/learn "Middleware pattern works better than decorators for auth"
/learn pattern "Repository pattern for data access"
/learn mistake "Don't use global state for user sessions"
```

**Captures**:
- Technical insights
- Design patterns
- Performance discoveries
- Bug solutions
- Architecture decisions

**Storage**: `LEARNINGS.md`

**Format**:
```markdown
## Authentication Middleware (2024-01-20) - abc123f
**Insight:** Middleware pattern cleaner than decorators
**Pattern:** Use Express middleware for cross-cutting concerns
**Impact:** 50% less code, easier testing
```

---

### /reflect

**Purpose**: End-of-session reflection to capture progress and insights.

**Allowed Tools**: `[Read, Write]`

**Usage**:
```bash
/reflect                  # Interactive reflection
/reflect quick            # Brief summary
/reflect detailed         # Comprehensive review
```

**Captures**:
- Session accomplishments
- Challenges faced
- Solutions found
- Time estimates vs actual
- Key decisions made
- Next session setup

**Creates Session Summary**:
```markdown
## Session Reflection - 2024-01-20

### Accomplished
- ✅ Implemented user authentication
- ✅ Added test coverage (85%)
- ✅ Fixed 3 critical bugs

### Challenges & Solutions
- Challenge: Session management complexity
  Solution: Redis for centralized storage

### Time Analysis
- Estimated: 4 hours
- Actual: 5.5 hours
- Difference: Underestimated testing

### Next Session
- Priority: Password reset flow
- Blocked: Need email service decision
```

---

### /update-docs

**Purpose**: Automated documentation maintenance workflow.

**Allowed Tools**: `[Read, Write, Bash]`

**Usage**:
```bash
/update-docs              # Update all documentation
/update-docs api          # Update API docs only
/update-docs changelog    # Update CHANGELOG
```

**Updates**:
- API documentation from code
- README with new features
- CHANGELOG from commits
- Architecture diagrams
- Setup instructions

**Smart Features**:
- Detects undocumented code
- Maintains existing structure
- Preserves custom sections
- Generates examples
- Updates cross-references

---

## Release & Quality Commands

### /push

**Purpose**: Push commits to remote with quality validation.

**Allowed Tools**: `[Bash]`

**Usage**:
```bash
/push                    # Push to current branch
/push --force           # Force push (with confirmation)
/push origin feature    # Push to specific branch
```

**Pre-Push Checks**:
1. Quality validation (`/hygiene`)
2. Test execution
3. Build verification
4. Uncommitted changes check
5. Branch protection rules
6. Merge conflict detection

**Safety Features**:
- Prevents pushing to main/master directly
- Warns about force push
- Checks remote status
- Validates CI requirements

---

### /version-tag

**Purpose**: Semantic version management and release tagging.

**Allowed Tools**: `[Bash, Read, Write]`

**Usage**:
```bash
/version-tag patch        # 1.0.0 -> 1.0.1
/version-tag minor        # 1.0.0 -> 1.1.0
/version-tag major        # 1.0.0 -> 2.0.0
/version-tag release      # Create release
```

**Features**:
- Semantic versioning compliance
- Automatic CHANGELOG update
- Git tag creation
- GitHub release draft
- Version file updates
- NPM publication ready

**Release Process**:
1. Update version in package.json
2. Generate CHANGELOG entry
3. Create git tag
4. Push tag to remote
5. Draft GitHub release
6. Prepare NPM publication

---

### /maintainability

**Purpose**: Comprehensive code maintainability analysis and recommendations.

**Allowed Tools**: `[Bash, Read]`

**Usage**:
```bash
/maintainability              # Full analysis
/maintainability complexity   # File complexity only
/maintainability debt         # Technical debt focus
/maintainability score        # Get numeric score
```

**Analysis Dimensions**:
- File size and complexity
- Function complexity
- Technical debt (TODO/FIXME)
- Dependency health
- Test coverage ratios
- Code coupling
- Anti-pattern detection

**Scoring System** (0-100):
- 90-100: Excellent
- 80-89: Good
- 70-79: Fair
- 60-69: Poor
- <60: Critical

**Example Output**:
```
🔧 Code Maintainability Overview
================================

📊 File Complexity Analysis
  🔴 src/auth/manager.js: 650 lines (very large)
  🟡 src/db/queries.js: 380 lines (large)

🔧 Technical Debt Analysis
  TODO comments: 12
  FIXME comments: 3
  Total debt markers: 15
  🟢 Low technical debt

📦 Dependency Analysis
  Production dependencies: 23
  Development dependencies: 18
  🟢 Reasonable dependency count

🎯 Overall Maintainability Score: 82/100
👍 Good - Minor improvements could help
```

---

### /atomic-commit

**Purpose**: Enforce disciplined commit practice of 1-3 file changes per commit.

**Allowed Tools**: `[Bash]`

**Usage**:
```bash
/atomic-commit            # Check and guide atomic commits
```

**Principles**:
- Commit every 1-3 file changes
- Each commit = working functionality
- Never batch logical changes
- Prefer smaller commits

**Enforcement**:
- Checks staged file count
- Validates change cohesion
- Suggests commit splitting
- Blocks large commits

**Guidelines**:
- **Ideal**: 1-3 files, <200 lines
- **Acceptable**: <500 lines
- **Never**: >1000 lines

---

## Development Utilities

### /archive

**Purpose**: Archive completed work and clean up project artifacts.

**Allowed Tools**: `[Bash, Read, Write]`

**Usage**:
```bash
/archive                  # Interactive archival
/archive tasks            # Archive completed tasks
/archive branches         # Clean up merged branches
/archive artifacts        # Remove build artifacts
```

**Archives**:
- Completed tasks from ACTIVE_WORK.md
- Merged git branches
- Old design documents
- Resolved issues
- Build artifacts
- Temporary files

**Creates**: Organized archive structure with dates and context.

---

### /edit-not-create

**Purpose**: Enforce preference for editing existing files over creating new ones.

**Allowed Tools**: `[Read, Bash]`

**Usage**:
```bash
/edit-not-create          # Check for edit opportunities
```

**Principles**:
- Always check for existing files first
- Extend rather than duplicate
- Consolidate similar functionality
- Avoid file proliferation

**Suggests**:
- Files that could be extended
- Duplicate functionality to merge
- Consolidation opportunities
- Refactoring targets

---

### /find-working-equivalent

**Purpose**: Find similar working code examples in the codebase.

**Allowed Tools**: `[Bash, Read]`

**Usage**:
```bash
/find-working-equivalent "authentication"
/find-working-equivalent "database connection"
```

**Searches For**:
- Similar implementations
- Pattern matches
- Working examples
- Test cases
- Configuration samples

**Helps With**:
- Consistency across codebase
- Learning from existing code
- Avoiding reinvention
- Following established patterns

---

## Customization Guide

### Modifying Commands

All commands are markdown files in `.claude/commands/`. To customize:

1. **Edit command file directly**
   ```bash
   vim .claude/commands/hygiene.md
   ```

2. **Adjust allowed tools**
   ```markdown
   ---
   allowed-tools: [Bash, Read, Write, YourTool]
   ---
   ```

3. **Modify thresholds and checks**
   ```bash
   # Change from default
   npm run lint --max-warnings 10
   # To strict
   npm run lint --max-warnings 0
   ```

### Creating New Commands

1. **Copy existing template**
   ```bash
   cp .claude/commands/hygiene.md .claude/commands/deploy.md
   ```

2. **Update metadata**
   ```markdown
   ---
   allowed-tools: [Bash]
   description: Deployment workflow
   ---
   ```

3. **Define workflow**
   ```markdown
   # Deployment Command
   
   Execute deployment pipeline...
   ```

### Team Customization

For team-specific workflows:

1. Create team command namespace:
   ```bash
   mkdir .claude/commands/team
   ```

2. Add team-specific commands:
   - `/team-review` - Code review process
   - `/team-standup` - Daily standup prep
   - `/team-metrics` - Team metrics

3. Document in team wiki/docs

## Best Practices

### Command Usage

1. **Start sessions with `/hygiene`** - Know project state
2. **Use `/todo` continuously** - Track all work
3. **Regular `/commit`** - Small, quality commits
4. **End with `/reflect`** - Capture learnings

### Workflow Integration

```bash
# Morning routine
/hygiene && /todo list && /next

# Before coding
/design "feature-name"
/estimate feature medium

# During development
/todo add "implement X"
/atomic-commit
/learn "insight about Y"

# Before break
/commit
/reflect quick
```

### Team Patterns

- Standardize command modifications
- Document team-specific workflows
- Share learnings via `/learn`
- Regular `/maintainability` reviews

## Troubleshooting

### Common Issues

**Command not found**
- Ensure file exists in `.claude/commands/`
- Check file has `.md` extension
- Verify metadata format

**Command fails**
- Check allowed-tools includes required tools
- Verify dependencies installed
- Review command syntax

**Customization not working**
- Ensure proper markdown format
- Check for syntax errors in bash
- Test commands individually

### Getting Help

1. Check command help:
   ```bash
   /command help
   ```

2. Review this catalog

3. Check GitHub issues

4. Ask in discussions

---

*This catalog documents all 19 command templates available in the Claude Code command templates repository.*