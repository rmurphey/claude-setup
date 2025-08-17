---
agent-type: general-purpose
allowed-tools: [Read, Glob, Bash, Grep, Write]
description: Analyzes session history to extract patterns, learnings, development insights, and productivity recommendations
last-updated: 2025-08-17
---

# Session Insights Agent

## Objective
Process captured session transcripts and development history to identify patterns, extract insights, and provide actionable recommendations for improving development workflows and productivity.

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
4. Git History Correlation:
   - Analyze git commits corresponding to session periods
   - Map session activities to actual code changes
   - Identify productivity patterns and completion rates
   - Assess code quality trends over time

### Phase 3: Pattern Recognition
1. Find common workflow sequences across sessions
2. Identify productivity patterns (time of day, session length)
3. Detect evolution of development practices over time
4. Recognize problem-solving patterns
5. Technical Skill Evolution:
   - Track learning progression across sessions
   - Identify areas of growing expertise
   - Recognize persistent knowledge gaps
   - Map technology adoption patterns
6. Decision Pattern Analysis:
   - Extract architectural and technical decisions
   - Identify decision criteria and reasoning patterns
   - Track decision outcomes and lessons learned

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

### Phase 6: Strategic Insights and Recommendations
1. Workflow Optimization:
   - Recommend timing optimizations for different task types
   - Suggest batch processing opportunities
   - Identify automation candidates
   - Propose focus and energy management strategies
2. Learning Path Recommendations:
   - Prioritize knowledge gaps by impact and frequency
   - Suggest learning resources and approaches
   - Recommend practice projects for skill development
3. Tool and Process Improvements:
   - Recommend command and agent usage optimizations
   - Suggest workflow automation opportunities
   - Identify missing tools or capabilities

### Phase 7: Insights Report Generation
Generate comprehensive insights report with:
- Session statistics and trends
- Common workflow patterns
- Recurring challenges and solutions
- Productivity insights
- Recommendations for workflow improvement
- Suggested command combinations
- Training/documentation needs
- Environmental factors and optimal conditions
- Session quality improvements

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
   - /hygiene → /todo → /tdd → /commit
   - Used in X% of sessions
   - Average completion time: Y hours

2. **Bug Fix Pattern**
   - /hygiene → /atomic-commit
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
- Peak productivity time: [time of day]
- Environmental factors: [conditions affecting performance]

## Technical Skill Evolution
### Areas of Growth
- **[Skill Area]**: Evidence of improvement from [examples]
- **[Skill Area]**: Increased independence in [specific areas]

### Persistent Challenges
- **[Challenge Area]**: Recurring issues with [specific examples]
- **[Challenge Area]**: Continued assistance needed for [situations]

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

## Session Quality Improvements
### For Better Sessions
1. **Preparation**: [Based on successful session patterns]
2. **Focus Techniques**: [Approaches that worked well]
3. **Energy Management**: [Optimal timing and task matching]

### To Avoid
1. **Patterns to Break**: [Behaviors reducing effectiveness]
2. **Timing Mistakes**: [Suboptimal scheduling patterns]
3. **Context Issues**: [Environmental factors to address]

## Action Items
### This Week
- [ ] [Specific action based on analysis]
- [ ] [Implementation of immediate recommendation]

### This Month
- [ ] [Strategic improvement to implement]
- [ ] [Learning goal to pursue]
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