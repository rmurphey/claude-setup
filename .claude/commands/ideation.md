---
allowed_tools:
  - bash
  - str_replace_editor
  - file_editor
---

# Development Ideation Command

Generate AI-powered development ideas based on current project context, then interactively review and add approved ideas to ACTIVE_WORK.md.

## Process

### 1. Project Context Analysis
Analyze the current state of this claude-setup CLI project:

```bash
# Check recent development activity
git log --oneline -10

# Review current project structure
find . -name "*.js" -o -name "*.md" | head -20

# Check current todos and active work
cat internal/ACTIVE_WORK.md

# Review package.json for dependencies and scripts
cat package.json
```

### 2. Generate Development Ideas

Based on the project analysis, generate 3-5 development ideas that would be valuable for this CLI tool project. Consider:

**Project Context**: Node.js CLI tool for setting up professional development environments
**Current Features**: Setup mode, Recovery mode, DevContainer generation, 14 custom commands
**Target Users**: Developers, teams, organizations wanting standardized development practices

**Idea Categories**:
- **Feature**: New functionality that adds user value
- **Quality**: Code quality, testing, maintainability improvements
- **DX**: Developer experience enhancements for CLI users
- **Maintenance**: Technical debt, refactoring, optimization
- **Documentation**: Guides, examples, API documentation

**Format each idea as**:
```
💡 [Category/Effort/Impact] Brief description
   Details: Specific implementation notes
   Value: Why this would benefit users
```

**Effort Levels**: Small (1-2 hours), Medium (1-2 days), Large (1+ weeks)
**Impact Levels**: Low, Medium, High (based on user benefit)

### 3. Interactive Review Process

Present each generated idea and ask:
```
Accept this idea? 
(y) Yes - add to ACTIVE_WORK.md
(n) No - skip this idea  
(m) Modify - let me edit before adding
(s) Stop - end ideation session
```

### 4. Document Accepted Ideas

For each accepted idea, add to `internal/ACTIVE_WORK.md` under "## Quick Capture" section:

```markdown
- [ ] [YYYY-MM-DD HH:MM] [AI-Generated] {idea description}
```

Use current timestamp and clearly mark as AI-generated.

### 5. Summary

After the session, provide a summary:
```
💡 Ideation Session Complete
   Generated: X ideas
   Accepted: Y ideas  
   Added to: internal/ACTIVE_WORK.md
   
Next: Review accepted ideas and prioritize in your development workflow
```

## Notes

- Focus on realistic, actionable ideas that align with the project's mission
- Consider the current codebase maturity and architecture
- Prioritize ideas that would benefit the CLI's users (developers setting up projects)
- Avoid ideas that would dramatically change the core purpose or architecture
- Consider integration with existing features rather than completely new domains

## Example Ideas for Reference

Examples of good development ideas for this project:
- Add support for additional programming languages (Kotlin, Swift, C#)
- Create project health dashboard with visual metrics
- Implement project template marketplace/sharing
- Add automated dependency update notifications
- Create VS Code extension for easier command access
- Add project migration tools between quality levels
- Implement custom quality rule configuration
- Add integration with popular CI/CD platforms beyond GitHub Actions