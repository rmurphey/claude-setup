# Claude Code Custom Commands

Standard command set for professional project management with Claude Code.

## 📋 Project Management Commands

### `/hygiene`
**Purpose**: Check overall project health and quality metrics

**Implementation**: Creates `.claude/commands/hygiene` script that:
- Runs quality checks (linting, testing)
- Checks git status and recent commits
- Reviews documentation freshness
- Monitors dependency security
- Reports quality thresholds (Green/Yellow/Red)

**Output Example**:
```
🟢 PROJECT HEALTH: GOOD
• ESLint: 3 warnings (Green - <10 threshold)
• Tests: 67% coverage (Above 50% minimum)
• Git: Clean working tree, 2 commits ahead
• Dependencies: No security issues
• Docs: ACTIVE_WORK.md updated today

RECOMMENDATIONS:
→ Consider fixing remaining ESLint warnings
→ Ready for new feature development
```

### `/todo <task>`
**Purpose**: Quick task capture to ACTIVE_WORK.md

**Usage**: 
```
/todo "implement user authentication"
/todo "fix navigation bug on mobile"
```

**Implementation**: Appends to ACTIVE_WORK.md quick capture section with timestamp

### `/design <feature>`
**Purpose**: Create comprehensive feature design document

**Usage**: `/design authentication system`

**Implementation**: Creates `designDocs/FEATURE_NAME.md` with template:
- Problem statement
- Requirements
- Technical approach
- Implementation phases
- Cost estimate
- Testing strategy

### `/next`
**Purpose**: AI-recommended next priorities based on project state

**Implementation**: Analyzes:
- Current quality metrics
- ACTIVE_WORK.md priorities  
- Recent development history
- Technical debt indicators

**Output**: Ranked list of next actions with rationale

### `/commit`
**Purpose**: Quality-checked commit with proper formatting

**Implementation**: 
- Runs quality checks on staged files
- Generates commit message from changes
- Includes co-author attribution for Claude
- Blocks commit if quality gates fail

### `/learn <insight>`
**Purpose**: Capture development insights in LEARNINGS.md

**Usage**: `/learn "API mocking reduces test complexity significantly"`

**Implementation**: Adds structured entry to LEARNINGS.md with:
- Timestamp and commit SHA
- Insight description
- Pattern identification
- Impact assessment

## 🔧 Development Commands

### `/docs [scope]`
**Purpose**: Update project documentation

**Usage**: 
```
/docs          # Update all documentation
/docs api      # Update API documentation only
/docs readme   # Update README only
```

**Implementation**: Reviews and updates:
- README.md functionality descriptions
- API documentation
- CONTRIBUTING.md guidelines
- Documentation cross-references

### `/estimate <task>`
**Purpose**: Cost estimate for development tasks

**Usage**: `/estimate "add payment processing"`

**Implementation**: Analyzes task complexity against historical patterns and provides cost estimate with confidence level

### `/version-tag`
**Purpose**: Semantic version management

**Implementation**:
- Updates package.json version
- Creates git commit: "Bump version to vX.Y.Z"
- Creates git tag
- Provides push instructions

### `/reflect`
**Purpose**: Weekly development insights capture

**Implementation**: Prompts structured reflection questions:
- Key accomplishments this week
- Technical challenges overcome
- AI collaboration insights
- Architectural decisions made
- Next week priorities

Updates DEVELOPMENT_LOG.md with structured entry

## 🎯 Quality Commands

### `/defer <item>`
**Purpose**: Move current priority to deferred section

**Usage**: `/defer "mobile responsiveness improvements"`

**Implementation**: Moves item from active to deferred section in ACTIVE_WORK.md with reason and timestamp

### `/push`
**Purpose**: Create commits from changes and push to remote

**Implementation**:
- Checks git status
- Creates commit from staged/unstaged changes
- Generates appropriate commit message
- Pushes to remote branch
- Does NOT make code changes

### `/maintainability`
**Purpose**: Comprehensive maintainability assessment

**Implementation**: Analyzes:
- Code complexity metrics
- Test coverage
- Documentation completeness
- Dependency health
- Architectural quality

**Output**: Scored assessment (0-100) with specific improvement recommendations

### `/idea <concept>`
**Purpose**: Quick capture of ideas for future consideration

**Usage**: `/idea "implement dark mode theme"`

**Implementation**: Adds to quick capture section in ACTIVE_WORK.md with "idea" tag

## 🏥 Codebase Recovery Commands

### `/recovery-assess`
**Purpose**: Comprehensive codebase health assessment

**Implementation**: Analyzes code quality, test coverage, architecture, and documentation. Generates scored report (0-100) with critical issues, quick wins, and recovery recommendations.

**Output Example**:
```
🏥 CODEBASE HEALTH ASSESSMENT
📊 OVERALL SCORE: 65/100 - NEEDS IMPROVEMENT
🚨 CRITICAL ISSUES: No test coverage, 45 lint warnings
💡 QUICK WINS: Setup linting, add pre-commit hooks
```

### `/recovery-plan`
**Purpose**: Generate prioritized improvement roadmap

**Implementation**: Creates `RECOVERY_PLAN.md` with phased approach:
- Phase 1: Quick wins (0-2 weeks)
- Phase 2: Foundation (2-8 weeks) 
- Phase 3: Structural (2-6 months)
- Phase 4: Evolution (6+ months)

### `/recovery-execute`
**Purpose**: Execute automated recovery improvements safely

**Implementation**: 
- Creates backup branch automatically
- Executes improvements incrementally with validation
- Provides rollback capability if issues arise
- Updates progress in RECOVERY_PLAN.md

## 📁 Command Structure

Commands are stored in `.claude/commands/` directory:

```
.claude/
└── commands/
    ├── hygiene
    ├── todo
    ├── design
    ├── next
    ├── commit
    ├── learn
    ├── docs
    ├── estimate
    ├── version-tag
    ├── reflect
    ├── defer
    ├── push
    ├── maintainability
    └── idea
```

Each command is a shell script that Claude Code can execute directly.

## 🛠️ Implementation Template

### Basic Command Structure
```bash
#!/bin/bash
# Command: [name]
# Purpose: [description]

# Validation
if [ $# -eq 0 ]; then
    echo "Usage: /[command] <arguments>"
    exit 1
fi

# Main logic
[command-specific implementation]

# Output formatting
echo "✅ [Command] completed successfully"
```

### Integration with Claude Code
Commands should:
- Provide clear success/failure feedback
- Update appropriate documentation files
- Follow project conventions
- Handle edge cases gracefully
- Include help text for incorrect usage

## 🎯 Command Philosophy

**Structured Interaction**: Commands provide consistent ways for humans and Claude to interact with project state.

**Documentation as Architecture**: Commands maintain project memory through structured documentation updates.

**Quality Automation**: Commands embed quality checks into routine workflows.

**Learning Capture**: Commands make insight documentation effortless and consistent.

**Prevention Focus**: Commands prevent common project management problems through automation.