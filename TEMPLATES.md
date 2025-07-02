# Documentation Templates

Standard templates for Claude Code project documentation.

## 📋 CLAUDE.md Template

```markdown
# CLAUDE.md - AI Behavioral Guide

## Core Directive
[Brief description of project goals and budget philosophy]

## Communication Style
- Concise, direct responses (4 lines max unless detail requested)
- Professional peer relationship
- No preamble/postamble unless asked
- [Language-specific preferences, e.g., functional programming]

## Development Workflow

### After Any Code Changes
1. **Code quality**: Run `[lint command]`
2. **Dev server**: Monitor for compilation/runtime issues
3. **Critical paths**: Verify key features still work
4. **Proactive debugging**: Find and fix issues before user encounters them

### Before Commits
1. **Repository hygiene**: Check `git status` - no dev artifacts
2. **Selective staging**: Use `git add <specific-files>`, never `git add .`
3. **Small commits**: Max 100 lines unless unavoidable
4. **Pre-commit hooks**: Quality checks block errors/warnings

## Available Commands
- `/hygiene` - Check project health
- `/todo <task>` - Track work in ACTIVE_WORK.md
- `/design <feature>` - Create design documents
- `/commit` - Quality-checked commits
- `/next` - Analyze priorities and recommend next task

## Key Constraints
- Never commit without explicit request
- Require [project-specific constraints]
- [Quality thresholds, e.g., zero ESLint warnings]

## Version Management
[If applicable - semantic versioning guidelines]
```

## 📊 ACTIVE_WORK.md Template

```markdown
# Active Work - Current Session Focus

## 🎯 NEXT SESSION PRIORITIES

### **Current Status**
**Budget Used**: $[amount] of [budget] (excellent/good/concerning efficiency)
**Quality Status**: [X warnings/errors] ([Green/Yellow/Red] - [threshold info])

## 📋 CURRENT PRIORITIES

### **[Priority 1 Name]** ✨ **PRIORITY**
**Target**: [Specific goal]
**Approach**: [Strategy/methodology]
**Next Actions**: 
- [Specific next step]
- [Another specific step]
**Estimated Cost**: $[range]

### **[Priority 2 Name]** 
**Target**: [Specific goal]
**Dependencies**: [What needs to be completed first]
**Estimated Cost**: $[range]

## 📊 QUALITY STATUS
**Current Metrics**:
- [Linting]: [X warnings/errors] ([Green/Yellow/Red])
- [Testing]: [X%] coverage ([Above/Below] [threshold])
- [Other metrics]

## 📋 BACKLOG
*Lower priority items for future consideration*

### **[Category Name]**
- [Item 1] - [Brief description]
- [Item 2] - [Brief description]

## 📜 COMPLETED WORK
*Recent completions with impact*

### ✅ [Completed Item] - COMPLETED (~$[cost] actual, [date])
- [Key accomplishment]
- [Impact/benefit]
- [Technical details if relevant]

## 📋 Current Session Tasks
**Active Todo List** (Use `/todo` to add items):
1. [Task 1]
2. [Task 2]

## Blockers & Decisions Needed
*Items requiring user input or external resolution*

## Quick Capture
*Use /todo or /idea commands to add items here*
```

## 🧠 LEARNINGS.md Template

```markdown
# Development Learnings - Technical Insights

*Patterns and discoveries that inform future development decisions*

## [Insight Title] ([Date]) - [git SHA]
**Insight:** [What was learned - key discovery or pattern]
**Pattern:** [Reusable technique or approach]
**Impact:** [How this affects development cost/time/quality]

## [Another Insight] ([Date]) - [git SHA]
**Insight:** [Description]
**Pattern:** [Reusable pattern]
**Impact:** [Effect on development]

---
*Auto-updated when significant insights discovered during task completion*
```

## 📚 DEVELOPMENT_STANDARDS.md Template

```markdown
# Development Standards

*Quality rules and architectural guidelines*

## 🎯 Code Quality Standards

### Complexity Limits
- **Functions**: Maximum 15 complexity points
- **Files**: Maximum 400 lines
- **Classes**: Maximum 300 lines
- **Methods**: Maximum 50 lines

### Quality Thresholds
- **Linting**: [Strict: 0 warnings | Standard: <10 warnings | Relaxed: <50 warnings]
- **Test Coverage**: [70% target | 50% minimum | 30% acceptable]
- **Documentation**: All public APIs documented

## 🏗️ Architecture Guidelines

### Module Design
- Single responsibility principle
- Clear separation of concerns
- Minimal dependencies between modules
- Comprehensive error handling

### Code Organization
```
src/
├── components/     # Reusable UI components
├── services/       # Business logic and API calls
├── utils/          # Pure utility functions
├── types/          # Type definitions
└── tests/          # Test files
```

### Quality Automation
- Pre-commit hooks enforce standards
- CI/CD pipeline runs full quality checks
- Automated dependency security scanning

## 🔧 Development Workflow

### Feature Development
1. **Design First**: Create design document using `/design`
2. **Quality Setup**: Ensure quality infrastructure ready
3. **Iterative Development**: Small commits with quality checks
4. **Documentation**: Update relevant docs during implementation

### Quality Gates
- **Pre-commit**: Block errors, warn on quality degradation
- **Pre-push**: Comprehensive quality validation
- **CI/CD**: Full test suite and quality metrics

## 🎯 Success Metrics

### Green Status
- [Language-specific quality metrics]
- Test coverage above minimum
- No security vulnerabilities
- Documentation current

### Quality Drift Prevention
- Daily quality monitoring
- Weekly quality reviews
- Monthly architectural assessments
```

## 🤝 CONTRIBUTING.md Template

```markdown
# Contributing Guidelines

## 🚀 Getting Started

### Prerequisites
- [Language] [version]
- [Other tools/dependencies]

### Development Setup
```bash
# Clone repository
git clone [repository-url]
cd [project-name]

# Install dependencies
[install command]

# Verify setup
[verification command]
```

## 🔧 Development Workflow

### Making Changes
1. **Create branch**: `git checkout -b feature/your-feature-name`
2. **Quality check**: Run `[quality command]` before committing
3. **Commit**: Use `/commit` command for quality-checked commits
4. **Push**: `git push origin feature/your-feature-name`
5. **Pull Request**: Create PR with description template

### Quality Standards
- All commits must pass quality checks
- Test coverage must not decrease
- Documentation must be updated for new features

### Code Style
- Follow [linter] configuration
- Use [formatter] for consistent formatting
- Maximum [X] lines per file
- Maximum [X] complexity per function

## 📋 Pull Request Process

### Before Submitting
- [ ] Quality checks pass locally
- [ ] Tests added/updated for changes
- [ ] Documentation updated
- [ ] No merge conflicts

### PR Description Template
```
## Summary
[Brief description of changes]

## Changes Made
- [Change 1]
- [Change 2]

## Testing
- [How to test the changes]
- [Any specific test cases]

## Documentation
- [Documentation updates made]
```

## 🎯 Project Standards

### Code Quality
- [Quality metrics and thresholds]
- [Testing requirements]
- [Documentation standards]

### Architecture
- [Architectural principles]
- [Design patterns to follow]
- [Anti-patterns to avoid]

## 📞 Getting Help

- Check existing issues and documentation
- Ask questions in discussions
- Follow issue templates for bug reports
```

## 📁 Template Usage

### For New Projects
1. Copy appropriate templates to project root
2. Customize placeholders with project-specific information
3. Set up quality infrastructure
4. Create initial documentation structure

### For Existing Projects
1. Assess current documentation gaps
2. Implement templates incrementally
3. Migrate existing documentation to template structure
4. Update team on new documentation standards

### Template Customization

**Always Customize**:
- Project-specific commands and workflows
- Quality thresholds appropriate for project
- Technology stack and dependencies
- Team size and collaboration patterns

**Optional Customization**:
- Documentation structure (can use as-is)
- Quality standards (templates provide good defaults)
- Command names (standards work for most projects)

## 🎯 Success Indicators

After implementing templates:
- [ ] Project context clear to new contributors
- [ ] Quality standards documented and enforced
- [ ] Development workflow consistent
- [ ] Learning insights captured systematically
- [ ] Project health easily monitored

Templates provide the foundation for successful Claude Code collaboration by establishing clear communication patterns and quality standards.