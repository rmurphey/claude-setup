# Claude Code Agents Guide

## What Are Agents and When Should You Use Them?

### Commands vs Agents: The Key Distinction

**Commands** are for routine, predictable tasks you do the same way every time. **Agents** are for complex analysis and intelligence-requiring tasks.

## Decision Framework

### Use a Command When:
- ✅ The task is routine and predictable
- ✅ You know exactly what steps to take
- ✅ You do it frequently the same way
- ✅ It's a quick, focused action
- ✅ The outcome is standardized

**Examples:**
- "Check my code quality" → `/hygiene` command
- "Commit my changes" → `/commit` command
- "Add a task to my todo list" → `/todo add` command
- "Push my code" → `/push` command

### Use an Agent When:
- 🧠 The task requires analysis across multiple files
- 🧠 You need intelligent decision-making
- 🧠 The outcome depends on what the analysis finds
- 🧠 It's a one-time or infrequent deep-dive
- 🧠 You need pattern recognition and insights

**Examples:**
- "Analyze my development patterns over 6 months" → `session-insights` agent
- "Find optimization opportunities in my commands" → `command-optimizer` agent
- "Audit my documentation for completeness" → `documentation-auditor` agent
- "Create a workflow for feature development" → `workflow-composer` agent

## Quick Decision Tree

```
Is this something you do routinely?
├─ Yes → Use a Command
└─ No → Does it require analysis or intelligence?
   ├─ Yes → Use an Agent
   └─ No → Consider creating a new Command
```

## Real-World Scenarios

### Scenario 1: Daily Development
**Situation:** Starting your workday, checking project health
**Solution:** `/hygiene` command (routine, predictable, same every time)
**Why not agent:** No analysis needed, just standard checks

### Scenario 2: Quarterly Review
**Situation:** Understanding your development patterns over 3 months
**Solution:** `session-insights` agent (requires analysis, pattern recognition)
**Why not command:** Each quarter's data is different, requires intelligent analysis

### Scenario 3: Bug Fix
**Situation:** Need to commit a simple bug fix
**Solution:** `/commit fix` command (standard process, quick action)
**Why not agent:** Straightforward task with known steps

### Scenario 4: Repository Optimization
**Situation:** Want to optimize your entire command library for efficiency
**Solution:** `command-optimizer` agent (complex analysis across many files)
**Why not command:** Requires intelligence to identify patterns and opportunities

### Scenario 5: Real Example - The Push Command Problem
**Situation:** We had a 320-line "safe push workflow" command that did quality validation
**Problem:** Users just wanted `git push`, not a QA audit
**Solution:** Simplified `/push` to `git push`, moved git complexities to `/push-detailed`
**Lesson:** Commands should handle routine operations, CI/CD should handle validation

### Scenario 6: Major Command → Agent Conversions
**Problem:** Several commands were doing analysis work instead of routine tasks
**Examples:**
- `/next` (400+ lines) → `next-priorities` agent
- `/estimate` (330+ lines) → `usage-estimator` agent  
- `/retrospective` → Split into session capture (command) + analysis (agent)
**Result:** Massive token reduction while improving intelligence capabilities

## Cost-Benefit Analysis

### Commands
- **Cost:** Low tokens (30-100 per execution)
- **Speed:** Fast execution (seconds)
- **Benefit:** Consistent, reliable results
- **Best for:** Daily workflows, routine tasks

### Agents
- **Cost:** Higher tokens (200-800 per execution)
- **Speed:** Longer execution (minutes)
- **Benefit:** Deep insights, intelligent analysis
- **Best for:** Optimization, analysis, strategic decisions

## Available Agents in This Repository

### `command-analyzer`
**When to use:** You want to optimize your command library
**What it does:** Analyzes usage patterns, finds redundancies, suggests improvements
**Example situation:** "I have 20+ commands and want to streamline them"

### `session-insights`
**When to use:** You want to understand your development patterns
**What it does:** Processes session history to extract learning patterns
**Example situation:** "I want to see how my productivity has changed over time"

### `workflow-composer`
**When to use:** You need a custom workflow for a complex task
**What it does:** Creates optimized command sequences for specific goals
**Example situation:** "I need a workflow for feature development that includes design, implementation, and testing"

### `documentation-auditor`
**When to use:** You want to ensure documentation quality
**What it does:** Audits all documentation for completeness and consistency
**Example situation:** "I want to make sure my project documentation is professional"

### `documentation-tone`
**When to use:** You want to ensure friendly, professional tone across all docs
**What it does:** Analyzes documentation for tone issues, detects condescending language, and suggests improvements
**Example situation:** "Make sure our documentation is welcoming and not condescending"

### `command-optimizer`
**When to use:** You want to make your commands more efficient
**What it does:** Finds token-saving and performance optimization opportunities
**Example situation:** "My commands feel slow and verbose, how can I improve them?"

### `next-priorities`
**When to use:** You want intelligent analysis of what to work on next
**What it does:** Analyzes project state, git status, tasks, and context to recommend actions
**Example situation:** "I'm not sure what to prioritize next in my development work"

### `usage-estimator`
**When to use:** You want accurate estimates for Claude usage on tasks
**What it does:** Analyzes your project and patterns to provide personalized estimates
**Example situation:** "How much will it cost to add authentication to my app?"

### `session-retrospective`
**When to use:** You want insights from your development session history
**What it does:** Analyzes captured sessions to extract productivity and learning patterns
**Example situation:** "I want to understand my development patterns and optimize my workflow"

## When to Create a New Agent

Create a new agent when you have a task that:

1. **Requires Intelligence:** The task needs to make decisions based on what it finds
2. **Processes Large Data Sets:** You need to analyze many files or large amounts of information
3. **Extracts Patterns:** You want to identify trends, patterns, or insights
4. **Adapts to Context:** The approach changes based on what the analysis reveals
5. **One-Time Analysis:** It's not something you'll do routinely

### Don't Create an Agent For:
- Simple file operations
- Routine checks that are always the same
- Tasks with predictable, standard steps
- Quick actions you do frequently

## Usage Examples

### Using an Agent
```
I want to understand how my development practices have evolved. Use the session-insights agent to analyze my session history from the last 3 months.
```

### Using a Command
```
/hygiene
```

### Creating a Custom Workflow with an Agent
```
I'm implementing user authentication for my app. Use the workflow-composer agent to create a comprehensive workflow that includes design, implementation, testing, and deployment phases.
```

## Best Practices

### For Commands
- Use for routine, repeatable tasks
- Keep commands focused and simple
- Optimize for frequent use
- Provide quick feedback

### For Agents
- Use for analysis and intelligence
- Expect longer execution times
- Focus on insights and recommendations
- Document findings thoroughly

## Performance Considerations

### Commands
- Optimized for frequent use
- Minimal token usage
- Fast execution
- Immediate results

### Agents
- Higher resource usage justified by value
- Deep analysis capabilities
- Comprehensive reporting
- Strategic insights

## Integration Strategy

### Daily Workflow: Commands
```bash
# Morning routine - all commands
/hygiene           # Check project health
/todo list         # See current tasks
/next             # Get AI recommendations
```

### Monthly Analysis: Agents
```bash
# Use agents for deeper insights
# session-insights agent: Analyze development patterns
# command-analyzer agent: Optimize command usage
# documentation-auditor agent: Ensure quality
```

### Project Planning: Mixed
```bash
# Start with agent for planning
# workflow-composer agent: Create feature workflow
# Then use commands for execution
/design "feature-name"
/estimate feature
/commit feat "implement feature"
```

## Summary

**Choose Commands for routine execution, choose Agents for intelligent analysis.** Commands are your daily tools, agents are your strategic consultants.

The key question: "Am I doing this the same way every time (command) or do I need analysis and insights (agent)?"