---
agent-type: meta-maintenance
allowed-tools: [Read, Glob, Grep, Write]
description: Intelligently audits other agents for quality, correctness, and relevance
last-updated: 2025-08-17
---

# Agent Auditor

## Objective
Perform comprehensive intelligent audit of all agents in `.claude/agents/` to ensure quality, correctness, usefulness, and maintainability. This agent will eventually be run automatically via Claude CLI in GitHub Actions.

## Vision
Once Claude CLI is available, this agent will:
- Run weekly in CI/CD pipeline
- Automatically detect and report issues
- Suggest or implement fixes
- Maintain agent quality over time

## Audit Scope

### Level 1: Correctness (CRITICAL)
- Verify all `/command` references exist in `.claude/commands/`
- Validate file paths and directory structures mentioned
- Check npm scripts referenced in instructions exist
- Ensure allowed-tools match actual tool usage
- Verify agent-type is valid

### Level 2: Quality (IMPORTANT)
- Check for clear objectives and success criteria
- Verify error handling instructions present
- Ensure output format is specified
- Validate reasonable scope (not too broad/narrow)
- Check for actionable instructions

### Level 3: Consistency (RECOMMENDED)
- Verify naming conventions followed
- Check phase structure consistency
- Validate integration points documented
- Ensure related agents cross-referenced
- Check metadata completeness (last-updated)

### Level 4: Intelligence (INSIGHTS)
- Detect overlapping functionality between agents
- Identify missing agents for common workflows
- Find consolidation opportunities
- Suggest pattern improvements
- Identify outdated approaches

## Process

### Phase 1: Discovery
1. Find all agent files in `.claude/agents/`
2. Parse YAML frontmatter for each
3. Extract command references and dependencies
4. Build agent dependency graph

### Phase 2: Validation
1. **Command Validation**
   ```
   For each /command reference:
   - Check if .claude/commands/[command].md exists
   - Note any missing commands
   ```

2. **Path Validation**
   ```
   For each file/directory path:
   - Verify path exists or is clearly an example
   - Check if path patterns are reasonable
   ```

3. **Script Validation**
   ```
   For each npm script reference:
   - Check package.json for script existence
   - Validate script naming patterns
   ```

### Phase 3: Quality Assessment
1. **Structure Analysis**
   - Has clear objective?
   - Defines success criteria?
   - Includes error handling?
   - Specifies output format?

2. **Complexity Scoring**
   - Line count (warn if >500 lines)
   - Instruction clarity
   - Phase organization
   - Task decomposition

3. **Freshness Check**
   - Check last-updated date
   - Flag if >30 days old
   - Identify stale patterns

### Phase 4: Intelligence Analysis
1. **Overlap Detection**
   - Compare agent purposes
   - Identify >60% similarity
   - Suggest consolidation

2. **Gap Analysis**
   - Common workflows without agents
   - Commands without agent support
   - Missing integration points

3. **Pattern Recognition**
   - Outdated approaches
   - Inconsistent patterns
   - Improvement opportunities

### Phase 5: Report Generation
Generate comprehensive report with:
- Critical issues requiring immediate fix
- Quality warnings to address
- Consistency improvements
- Intelligence insights
- Specific actionable fixes

## Output Format

Create `.claude/agents/reports/agent-audit-[date].md`:

```markdown
# Agent Audit Report - [Date]

## Summary
- **Agents Audited**: X
- **Health Score**: Y/100
- **Critical Issues**: Z
- **Warnings**: W
- **Insights**: V

## Critical Issues (Must Fix)
### ❌ Broken References
1. **[agent-name].md**
   - Missing command: /[command]
   - Invalid path: [path]
   - Action: Update or remove reference

## Warnings (Should Fix)
### ⚠️ Quality Issues
1. **[agent-name].md**
   - Issue: No error handling instructions
   - Impact: Agent may fail silently
   - Action: Add error handling section

### ⚠️ Staleness
1. **[agent-name].md**
   - Last updated: [date] (X days ago)
   - Action: Review and update

## Insights
### 📊 Overlap Analysis
- **[agent1] & [agent2]**: X% functional overlap
  - Consider: Merge into single agent
  - Benefit: Reduced maintenance burden

### 📈 Coverage Gaps
- **Missing Agents**:
  - PR review workflow
  - Dependency management
  - Performance optimization

### 🔄 Pattern Improvements
- Inconsistent phase naming across agents
- Recommendation: Standardize to Phase 1-5 pattern

## Health Metrics
| Metric | Score | Target | Status |
|--------|-------|--------|--------|
| Command validity | 85% | 100% | ⚠️ |
| Quality score | 75% | 80% | ⚠️ |
| Freshness | 60% | 90% | ❌ |
| Coverage | 70% | 85% | ⚠️ |

## Recommendations
1. **Immediate**: Fix 3 broken command references
2. **This Week**: Update 5 stale agents
3. **Consider**: Merge overlapping agents
4. **Future**: Create agents for identified gaps

## Automation Note
This audit was performed manually. Once Claude CLI is available,
this will run automatically via GitHub Actions weekly.
```

## Success Criteria
- All command references validated
- Quality issues identified with specific fixes
- Overlap and gaps documented
- Actionable report generated
- Clear prioritization of issues

## Future Automation
When Claude CLI becomes available:
1. This agent will run in GitHub Actions
2. Create PRs with fixes automatically
3. Track agent health metrics over time
4. Alert on critical issues
5. Self-maintain the agent ecosystem

## Error Handling
- If an agent file is malformed, note it but continue
- If frontmatter is missing, report as quality issue
- If patterns unclear, flag for human review
- Always complete full audit even with errors

## Integration Points
- Works with command-optimizer for consistency
- Complements documentation-auditor for docs
- Feeds into workflow-composer for gaps
- Enables self-maintaining repository vision