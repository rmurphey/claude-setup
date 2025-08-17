# Claude Code Agent Patterns and Best Practices

## Overview

This guide documents patterns for creating and using Claude Code agents effectively, based on the implementations in this repository.

## Core Agent Patterns

### 1. The Analysis Agent Pattern

**Purpose**: Process large datasets to extract insights and patterns

**Structure**:
```markdown
---
agent-type: general-purpose
allowed-tools: [Read, Glob, Grep, Bash, Write]
description: [Specific analysis purpose]
---

# Agent Name

## Objective
Clear statement of what analysis will be performed

## Task Instructions
### Phase 1: Data Discovery
### Phase 2: Analysis
### Phase 3: Pattern Recognition
### Phase 4: Report Generation

## Output Format
Specific format for results

## Success Criteria
Measurable outcomes
```

**Examples**: `session-insights`, `command-analyzer`

**When to use**: When you need to understand patterns across multiple files or time periods

### 2. The Optimization Agent Pattern

**Purpose**: Identify improvement opportunities and provide actionable recommendations

**Key characteristics**:
- Analyzes current state vs optimal state
- Provides specific, measurable improvements
- Includes implementation roadmap
- Quantifies benefits (token savings, time improvements)

**Example**: `command-optimizer`

**When to use**: When you want to improve efficiency of existing systems

### 3. The Audit Agent Pattern  

**Purpose**: Systematically check quality and completeness

**Key characteristics**:
- Comprehensive checking across multiple dimensions
- Categorized findings by severity
- Clear success/failure criteria
- Actionable remediation steps

**Example**: `documentation-auditor`

**When to use**: When you need to ensure standards compliance

### 4. The Composer Agent Pattern

**Purpose**: Create new artifacts based on analysis and requirements

**Key characteristics**:
- Takes high-level goals and creates detailed implementations
- Combines multiple existing patterns
- Provides usage examples and documentation
- Considers integration with existing systems


**When to use**: When you need to create custom solutions for complex problems

## Design Principles

### 1. Clear Objective Definition
Every agent must have a specific, measurable objective:

```markdown
## Objective
Perform comprehensive analysis of X to identify Y and provide Z recommendations
```

**Good**: "Analyze command usage patterns to identify optimization opportunities"
**Bad**: "Make commands better"

### 2. Phased Execution
Break complex tasks into logical phases:

1. **Discovery Phase**: Find and catalog relevant data
2. **Analysis Phase**: Process data to extract insights  
3. **Synthesis Phase**: Combine insights into recommendations
4. **Reporting Phase**: Generate actionable outputs

### 3. Structured Output
Define specific output formats that provide value:

```markdown
## Output Format
Create `.claude/agents/reports/[agent-name]-[date].md` with:
- Executive summary
- Detailed findings
- Prioritized recommendations
- Success metrics
```

### 4. Error Resilience
Agents should handle incomplete or missing data gracefully:

```markdown
## Error Handling
- Skip corrupted files but log them
- Continue analysis with partial data
- Note ambiguities for manual review
```

## Implementation Patterns

### Frontmatter Standards
```yaml
---
agent-type: general-purpose | specialized
allowed-tools: [List of required tools]
description: One-line description of agent purpose
---
```

### Task Instruction Structure
1. **Clear phases** with specific deliverables
2. **Success criteria** that are measurable
3. **Error handling** for common failure modes
4. **Integration points** with existing tools

### Report Generation
All agents should create structured reports in `.claude/agents/reports/`:

```
.claude/agents/reports/
├── command-analysis-2025-01-20.md
├── session-insights-2025-01-20.md
├── documentation-audit-2025-01-20.md
└── ...
```

## Agent Categories

### Meta-Repository Agents
Agents that analyze and improve the repository itself:
- `command-analyzer` - Optimizes the command library
- `documentation-auditor` - Ensures documentation quality
- `command-optimizer` - Improves command efficiency

### Development Insight Agents  
Agents that provide insights about development practices:
- `session-insights` - Analyzes development patterns
- Future: `productivity-analyzer`, `learning-tracker`


## Usage Patterns

### One-Time Analysis
```bash
# Use when you need deep insights infrequently
"Use the session-insights agent to analyze my development patterns from Q4"
```

### Periodic Optimization
```bash
# Use monthly/quarterly for system improvements
"Use the command-analyzer agent to identify optimization opportunities"
```

### Quality Assurance
```bash
# Use before releases or major changes
"Use the documentation-auditor agent to ensure all docs are complete"
```


## Performance Considerations

### Token Efficiency
- Agents use 200-800 tokens vs 30-100 for commands
- This is justified for complex analysis that would require many command iterations
- Use agents when the alternative is multiple manual steps

### Execution Time
- Agents take minutes vs seconds for commands
- Appropriate for tasks requiring analysis and decision-making
- Not suitable for routine operations

### Value Proposition
- **High value**: Strategic insights, optimization recommendations
- **Medium value**: Quality assurance, pattern recognition  
- **Low value**: Simple data retrieval, routine checks

## Integration with Commands

### Complementary Usage
```bash
# Commands execute plans
/design "feature-name"
/estimate feature medium
/todo add "implement core logic"
/commit feat "add feature implementation"
```

### Data Flow
```
Commands generate data → Agents analyze data → Agents provide insights → Commands act on insights
```

### Feedback Loop
1. Use agents to optimize command library
2. Improved commands generate better data
3. Better data enables more sophisticated agent analysis
4. Cycle continues for continuous improvement

## Best Practices

### When to Create New Agents

**Create an agent when:**
- Task requires analysis across multiple files/sessions
- Decision-making depends on discovered patterns
- Output varies significantly based on input data
- One-time or infrequent complex analysis is needed

**Don't create an agent for:**
- Routine, predictable tasks
- Simple file operations
- Tasks with standard, unchanging steps

### Agent Naming Conventions
- Use descriptive names ending in purpose: `session-insights`, `command-analyzer`
- Avoid generic names: `analyzer`, `optimizer`
- Be specific about what is being analyzed: `documentation-auditor`

### Documentation Requirements
Every agent needs:
1. Clear purpose statement
2. When/why to use it vs alternatives
3. Expected input/output examples
4. Integration instructions
5. Performance/cost considerations

### Quality Assurance
- Test agents with real repository data
- Validate output formats and usefulness
- Ensure error handling works correctly
- Document any limitations or assumptions

## Anti-Patterns

### Avoid These Common Mistakes

1. **Agent for Simple Tasks**
   ```bash
   # Bad: Agent to check git status
   # Good: Command /hygiene includes git status
   ```

2. **Overly Generic Agents**
   ```bash
   # Bad: "general-analyzer" that does everything
   # Good: Specific agents for specific analysis types
   ```

3. **Agents that Don't Generate Value**
   ```bash
   # Bad: Agent that just lists files
   # Good: Agent that analyzes patterns in files
   ```

4. **Missing Success Criteria**
   ```markdown
   # Bad: "Analyze the codebase"
   # Good: "Identify 3+ optimization opportunities with quantified benefits"
   ```

## Future Patterns

### Emerging Patterns
As agent usage grows, watch for these emerging patterns:

1. **Collaborative Agents**: Agents that use outputs from other agents
2. **Incremental Agents**: Agents that update previous analysis
3. **Predictive Agents**: Agents that forecast based on patterns
4. **Learning Agents**: Agents that improve recommendations over time

### Extension Points
The current architecture supports:
- Custom report formats
- Integration with external tools
- Chained agent execution
- Conditional agent triggering

## Conclusion

Agents provide powerful analysis capabilities that complement the routine efficiency of commands. Use this pattern guide to create agents that deliver real value through intelligent analysis and actionable insights.

Remember: **Commands for routine execution, agents for intelligent analysis.**