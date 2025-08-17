---
agent-type: general-purpose
allowed-tools: [Read, Grep, Glob, Bash, Write, Edit]
description: Analyzes command usage patterns and optimizes for token efficiency and performance
last-updated: 2025-08-17
---

# Command Analyzer & Optimizer Agent

## Objective
Analyze and optimize command implementations to identify usage patterns, maximize token efficiency, improve performance, and maintain consistency with established patterns.

## Task Instructions

### Phase 1: Command Inventory
1. Scan all files in `.claude/commands/` including subdirectories
2. Extract metadata from each command file (allowed-tools, description)
3. Count total commands and categorize by type
4. Identify commands with similar purposes

### Phase 2: Usage Analysis
1. Search the repository for actual command invocations in:
   - Session history files
   - Documentation examples
   - Scripts that reference commands
2. Identify most frequently used commands
3. Find commands that are never referenced
4. Detect common command sequences

### Phase 3: Dependency Analysis
1. Analyze npm scripts used by commands
2. Identify shared dependencies between commands
3. Find opportunities for script consolidation
4. Check for duplicate script implementations

### Phase 4: Token Efficiency Analysis
1. Calculate approximate token usage for each command
2. Identify commands that could delegate more to npm scripts
3. Find verbose commands that could be simplified
4. Suggest token-saving optimizations
5. Performance Metrics:
   - Analyze command execution time patterns
   - Identify bottlenecks in command workflows
   - Map complexity to actual usage frequency

### Phase 5: Optimization Implementation
1. NPM Script Delegation:
   - Create new npm scripts for complex operations
   - Replace verbose implementations with script calls
   - Standardize error handling through scripts
2. Code Simplification:
   - Remove redundant instructions
   - Consolidate duplicate logic
   - Improve clarity while reducing tokens
3. Pattern Standardization:
   - Align all commands with best practices
   - Ensure consistent error handling
   - Standardize output formats

### Phase 6: Recommendations Report
Generate a comprehensive report including:
- Command usage statistics
- Top 5 most used commands
- Unused or rarely used commands
- Command combination patterns
- Redundancy analysis
- Token optimization opportunities and implementations
- Suggested new commands based on usage patterns
- Commands that could be consolidated
- Performance improvements achieved

## Output Format

Create or update `.claude/agents/reports/command-analysis-[date].md` with:

```markdown
# Command Analysis Report - [Date]

## Executive Summary
- Total commands analyzed: X
- Commands with usage evidence: Y
- Average token usage per command: Z

## Usage Statistics
### Most Used Commands
1. /command-name (N references)
2. ...

### Unused Commands
- /command-name (consider deprecation)
- ...

## Optimization Opportunities
### Token Reduction
- /command-name: Delegate X to npm script (save ~Y tokens)
  - Before: X tokens
  - After: Y tokens
  - Reduction: Z%
- ...

### Command Consolidation
- Merge /command1 and /command2 into /unified-command
- ...

### Performance Improvements
- /command-name: Reduced execution time by X%
- /command-name: Eliminated redundant operations

## Workflow Patterns
### Common Sequences
1. /hygiene → /todo → /commit (found N times)
2. ...

## Recommendations
1. High Priority: [specific action]
2. Medium Priority: [specific action]
3. Low Priority: [specific action]

## Optimizations Applied
### Commands Optimized
1. /command-name: [optimization summary]
2. ...

### NPM Scripts Created
- `npm run script-name`: [purpose]
- ...

### Token Savings Summary
- Total tokens before: X
- Total tokens after: Y
- Overall reduction: Z%
```

## Success Criteria
- Complete inventory of all commands
- Accurate usage statistics from repository analysis
- At least 3 actionable optimization recommendations
- Achieve 20%+ token reduction for high-usage commands
- Implement performance improvements where possible
- Clear documentation of findings and optimizations
- Executable suggestions for improvements

## Error Handling
- If no usage data found, note it but continue analysis
- If command file is malformed, log it and skip
- If npm scripts don't exist, note the dependency issue

## Additional Considerations
- Pay special attention to the relationship between commands and npm scripts
- Look for patterns that suggest missing commands
- Consider the balance between granular and comprehensive commands
- Note any commands that violate the established patterns

Execute this analysis systematically and provide actionable insights that will improve the command library's effectiveness and efficiency.