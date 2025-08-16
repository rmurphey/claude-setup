---
allowed_tools:
  - bash
  - str_replace_editor
  - file_editor
  - mcp__ide__executeCode
---

# Development Ideation Command

Generate AI-powered development ideas based on AST-driven code analysis, then interactively review and add approved ideas to ACTIVE_WORK.md.

## Process

### 1. AST-Based Code Analysis
Perform comprehensive codebase analysis using Abstract Syntax Trees:

```javascript
import { CodeAnalyzer } from '../lib/code-analysis.js';

const analyzer = new CodeAnalyzer();
const analysis = await analyzer.analyzeCodebase();
const insights = analyzer.generateInsights(analysis);

console.log('📊 Codebase Analysis Results:');
console.log(`Files: ${analysis.summary.totalFiles}`);
console.log(`Lines: ${analysis.summary.totalLines}`);
console.log(`Languages: ${analysis.summary.languages.join(', ')}`);
console.log(`Functions: ${analysis.summary.complexity.functions.length}`);
console.log(`Classes: ${analysis.summary.complexity.classes.length}`);
console.log(`High complexity functions: ${analysis.summary.complexity.functions.filter(f => f.complexity > 10).length}`);

// Display insights by category
['architecture', 'quality', 'maintenance', 'features', 'testing'].forEach(category => {
  if (insights[category].length > 0) {
    console.log(`\n${category.toUpperCase()} Insights:`);
    insights[category].forEach(insight => {
      console.log(`- ${insight.description}`);
      console.log(`  → ${insight.suggestion}`);
    });
  }
});
```

### 2. Project Context Analysis
Supplement AST analysis with project metadata:

```bash
# Check recent development activity
git log --oneline -10

# Review current todos and active work
cat internal/ACTIVE_WORK.md

# Review package.json for dependencies and scripts
cat package.json
```

### 3. Generate Development Ideas

Based on AST analysis results and project context, generate 3-5 development ideas. Use the code analysis data to inform suggestions:

**Analysis-Driven Idea Generation**:
- **Complexity Issues**: If high-complexity functions detected, suggest refactoring patterns
- **Architecture Patterns**: Based on detected imports/exports, suggest architectural improvements
- **Testing Gaps**: If low test coverage, suggest testing strategies
- **API Patterns**: If API endpoints detected, suggest documentation/testing tools
- **Language Support**: Based on detected languages, suggest tooling improvements

**Project Context**: Node.js CLI tool for setting up professional development environments
**Current Features**: Setup mode, Recovery mode, DevContainer generation, 14 custom commands
**Target Users**: Developers, teams, organizations wanting standardized development practices

**Idea Categories**:
- **Feature**: New functionality that adds user value
- **Quality**: Code quality, testing, maintainability improvements (based on AST analysis)
- **DX**: Developer experience enhancements for CLI users
- **Maintenance**: Technical debt, refactoring, optimization (based on complexity analysis)
- **Documentation**: Guides, examples, API documentation

**Format each idea as**:
```
💡 [Category/Claude Usage/Impact] Brief description
   Analysis: What AST analysis revealed that supports this idea
   Details: Specific implementation notes
   Claude Cost: Estimated messages and interaction pattern
   Value: Why this would benefit users
```

**Claude Usage Levels**: Light (10-50 messages), Moderate (50-150), Heavy (150-400), Intensive (400+)
**Impact Levels**: Low, Medium, High (based on user benefit)

### 4. Interactive Review Process

Present each generated idea and ask:
```
Accept this idea? 
(y) Yes - add to ACTIVE_WORK.md
(n) No - skip this idea  
(m) Modify - let me edit before adding
(s) Stop - end ideation session
```

### 5. Document Accepted Ideas

For each accepted idea, add to `internal/ACTIVE_WORK.md` under "## Quick Capture" section:

```markdown
- [ ] [YYYY-MM-DD HH:MM] [AI-Generated] {idea description}
```

Use current timestamp and clearly mark as AI-generated.

### 6. Summary

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

## Example AST-Driven Ideas for Reference

Examples of analysis-driven development ideas:

**High Complexity Functions Detected**:
- 💡 [Quality/Moderate/High] Refactor complex CLI setup logic into composable functions
  Analysis: AST found 3 functions with complexity > 15 in cli.js
  Details: Extract language setup, command generation, and git operations into separate modules
  Claude Cost: ~80 messages (analysis, refactoring, testing)
  Value: Improves maintainability and testability

**Limited Test Coverage**:
- 💡 [Quality/Heavy/High] Add comprehensive unit tests for language modules
  Analysis: AST found 0 test files for lib/languages/* modules
  Details: Create Jest tests for each language setup function with mocked file operations
  Claude Cost: ~200 messages (test design, implementation, debugging)
  Value: Prevents regressions and improves confidence in refactoring

**Architectural Patterns**:
- 💡 [Feature/Intensive/High] Plugin architecture for extensible language support
  Analysis: AST analysis shows repeated patterns in language modules
  Details: Create plugin interface allowing third-party language support
  Claude Cost: ~350 messages (architecture design, implementation, documentation)
  Value: Community can add support for new languages without core changes

**API Pattern Detection**:
- 💡 [Feature/Moderate/Medium] CLI progress reporting with structured output
  Analysis: AST shows multiple console.log calls without structured logging
  Details: Implement progress reporting system with JSON output mode
  Claude Cost: ~120 messages (design, implementation, testing)
  Value: Better integration with CI/CD and programmatic usage