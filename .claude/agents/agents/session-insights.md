---
agent-type: general-purpose
allowed-tools: [Read, Glob, Bash, Write]
description: Analyzes session history to extract patterns, learnings, and development insights
---

# Session Insights Agent

## Objective
Process session history files to identify development patterns, extract aggregate learnings, and generate actionable insights about development workflows.

## Task Instructions

### Phase 1: Session Discovery
1. Scan `session-history/` directory for all session files
2. Read metadata from session headers (Claude version, timestamps, descriptions)
3. Group sessions by date and type (full vs delta)
4. Calculate session frequency and duration patterns

### Phase 2: Content Analysis
1. Extract key activities from each session:
   - Commands used
   - Files modified
   - Errors encountered and resolved
   - Features implemented
   - Refactoring performed
2. Use the retrospective.js script to gather commit patterns
3. Identify recurring challenges and solutions

### Phase 3: Pattern Recognition
1. Find common workflow sequences across sessions
2. Identify productivity patterns (time of day, session length)
3. Detect evolution of development practices over time
4. Recognize problem-solving patterns

### Phase 4: Learning Extraction
1. Aggregate insights from LEARNINGS.md
2. Cross-reference with session activities
3. Identify knowledge gaps based on repeated issues
4. Extract best practices that emerged

### Phase 5: Metrics Calculation
1. Average session length
2. Commands per session
3. Success rate (sessions with completed objectives)
4. Error frequency and resolution time
5. Feature velocity trends

### Phase 6: Insights Report Generation
Generate comprehensive insights report with:
- Session statistics and trends
- Common workflow patterns
- Recurring challenges and solutions
- Productivity insights
- Recommendations for workflow improvement
- Suggested command combinations
- Training/documentation needs

## Output Format

Create `.claude/agents/reports/session-insights-[date].md`:

```markdown
# Session Insights Report - [Date]

## Session Statistics
- Total sessions analyzed: X
- Date range: [start] to [end]
- Average session duration: Y hours
- Most productive day: [day]
- Peak productivity time: [time range]

## Workflow Patterns
### Most Common Workflows
1. **Feature Development Pattern**
   - /hygiene → /design → /todo → /commit
   - Used in X% of sessions
   - Average completion time: Y hours

2. **Bug Fix Pattern**
   - /hygiene → /find-working-equivalent → /atomic-commit
   - Used in X% of sessions

## Development Insights
### Recurring Challenges
1. **Challenge**: [description]
   - Frequency: X times
   - Typical resolution: [approach]
   - Recommended solution: [action]

### Successful Patterns
1. **Pattern**: Using /todo before starting work
   - Success rate: X% higher completion
   - Time saved: Y minutes average

## Learning Themes
### Technical Discoveries
1. [Key learning with session reference]
2. ...

### Process Improvements
1. [Process insight with evidence]
2. ...

## Productivity Analysis
- Most productive sessions: [characteristics]
- Least productive patterns: [anti-patterns]
- Optimal session length: X hours

## Recommendations
### Immediate Actions
1. Adopt workflow: [specific pattern]
2. Avoid practice: [specific anti-pattern]

### Long-term Improvements
1. Create command: /[suggested-command] for [use case]
2. Document pattern: [recurring solution]

## Command Usage Insights
### Top Commands by Session Type
- Feature development: [command list]
- Bug fixes: [command list]
- Refactoring: [command list]

### Underutilized Commands
- /[command]: Could have helped in X situations
```

## Data Sources
1. `session-history/*/session-*.txt` files
2. `LEARNINGS.md`
3. `scripts/retrospective.js` output
4. Git commit history
5. `.claude/metrics.json`

## Success Criteria
- Process at least 80% of available sessions
- Identify at least 5 workflow patterns
- Extract at least 10 actionable insights
- Generate quantitative metrics
- Provide specific recommendations

## Error Handling
- Skip corrupted session files but log them
- Handle missing metadata gracefully
- If patterns are unclear, note the ambiguity
- Continue analysis even with partial data

## Additional Analysis
- Look for correlation between session length and productivity
- Identify command combinations that lead to successful outcomes
- Note any evolution in development practices over time
- Flag sessions with exceptional productivity for deeper analysis
- Identify knowledge that was learned but not documented

Execute this analysis to provide deep insights into development patterns and opportunities for workflow optimization.