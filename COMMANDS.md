# Claude Code Custom Commands

This project includes a complete set of Claude Code commands for structured development workflow.

## 📋 Project Management Commands

### `/hygiene`
**Purpose**: Check overall project health and quality metrics  
**Output**: Color-coded status report with recommendations

### `/todo <task>`
**Purpose**: Quick task capture to ACTIVE_WORK.md  
**Usage**: `/todo "implement user authentication"`

### `/next`
**Purpose**: AI-recommended next priorities based on project state  
**Output**: Prioritized action list with rationale

### `/issue <number>`
**Purpose**: Streamlined GitHub issue workflow  
**Features**: 
- Fetches issue details from GitHub API
- Creates appropriately named branches (username/type/issue-123-title)
- Sets up issue context documentation in `.claude/issues/`
- Updates ACTIVE_WORK.md with current issue focus
- Supports cross-repository issues

**Usage**: 
- `/issue 123` - Work on issue #123 in current repo
- `/issue 456 owner/repo` - Work on issue #456 in different repo
- `/issue list` - List open issues
- `/issue current` - Show current issue context

### `/reflect`
**Purpose**: Weekly development review and insights capture  
**Process**: Guided reflection with documentation updates

## 🔧 Development Commands

### `/design <feature>`
**Purpose**: Create comprehensive feature design document  
**Output**: Structured design doc in `docs/designs/`

### `/estimate <task>`
**Purpose**: Development cost estimation  
**Output**: Size, effort, and confidence assessment

### `/learn <insight>`
**Purpose**: Capture development insights in LEARNINGS.md  
**Usage**: `/learn "API mocking reduces test complexity"`

### `/docs [scope]`
**Purpose**: Update project documentation  
**Scopes**: all, readme, api, internal

## 🎯 Quality Commands

### `/commit`
**Purpose**: Quality-checked commit with proper formatting  
**Process**: Lint check → Test check → Commit with co-author

### `/push`
**Purpose**: Create commits from changes and push to remote  
**Process**: Stage → Commit → Push with generated message

### `/defer <item>`
**Purpose**: Move current priority to deferred section  
**Usage**: `/defer "mobile responsiveness improvements"`

### `/version-tag`
**Purpose**: Semantic version management  
**Process**: Interactive version bump with git tagging

### `/maintainability`
**Purpose**: Comprehensive maintainability assessment  
**Output**: Scored assessment (0-100) with improvement recommendations

### `/idea <concept>`
**Purpose**: Quick capture of ideas for future consideration  
**Usage**: `/idea "implement dark mode theme"`

## 🏥 Recovery Commands

### `/recovery-assess`
**Purpose**: Comprehensive codebase health assessment  
**Output**: Scored analysis across code quality, tests, architecture, documentation

### `/recovery-plan`
**Purpose**: Generate prioritized improvement roadmap  
**Output**: Phased recovery plan with timelines and risk assessment

### `/recovery-execute`
**Purpose**: Execute automated recovery improvements safely  
**Process**: Safe, incremental improvements with rollback capability

## 📁 Command Structure

Commands are stored in `.claude/commands/` as Markdown files with YAML frontmatter:

```
.claude/
└── commands/
    ├── hygiene.md
    ├── todo.md
    ├── design.md
    ├── next.md
    ├── commit.md
    ├── learn.md
    ├── docs.md
    ├── estimate.md
    ├── version-tag.md
    ├── reflect.md
    ├── defer.md
    ├── push.md
    ├── maintainability.md
    └── idea.md
```

Each command follows Claude Code conventions with:
- YAML frontmatter specifying allowed tools
- Structured guidance for Claude
- Context references using `@` (files) and `!` (bash commands)
- Clear task descriptions and output formats

## 🎯 Command Philosophy

**Structured Interaction**: Commands provide consistent ways for humans and Claude to interact with project state.

**Documentation as Architecture**: Commands maintain project memory through structured documentation updates.

**Quality Automation**: Commands embed quality checks into routine workflows.

**Learning Capture**: Commands make insight documentation effortless and consistent.

**Prevention Focus**: Commands prevent common project management problems through automation.