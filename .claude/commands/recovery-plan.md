---
allowed-tools: [Write, Read, Edit]
description: Generate prioritized improvement roadmap
---

# Codebase Recovery Planning

## Context
- Previous assessment: @internal/RECOVERY_ASSESSMENT.md (if exists)
- Current project state: @CLAUDE.md @package.json
- Active work: @internal/ACTIVE_WORK.md
- Recent development: !`git log --oneline -20`

## Your task
Generate a comprehensive, prioritized recovery plan based on the assessment results:

### 1. Impact vs Effort Analysis
Create a priority matrix for all identified issues:
- **High Impact, Low Effort**: Quick wins (do first)
- **High Impact, High Effort**: Strategic investments (plan carefully)
- **Low Impact, Low Effort**: Nice-to-haves (do when time allows)
- **Low Impact, High Effort**: Avoid or defer

### 2. Recovery Phases
Break improvements into manageable phases:

**Phase 1: Quick Wins (0-2 weeks)**
- Automated fixes (formatting, linting setup)
- Documentation gaps
- Basic test infrastructure
- CI/CD improvements

**Phase 2: Foundation (2-8 weeks)**
- Quality gate implementation
- Test coverage improvements
- Architecture documentation
- Development workflow optimization

**Phase 3: Structural (2-6 months)**
- Code refactoring and modularization
- Architecture improvements
- Performance optimizations
- Advanced testing strategies

**Phase 4: Evolution (6+ months)**
- Long-term architecture evolution
- Technology stack modernization
- Advanced patterns implementation
- Team process optimization

### 3. Risk Assessment
For each improvement:
- **Risk Level**: Low/Medium/High
- **Mitigation Strategy**: How to reduce risk
- **Rollback Plan**: How to undo if problems occur
- **Testing Requirements**: Validation approach

### 4. Success Metrics
Define measurable outcomes:
- Quality metrics improvements
- Development velocity increases
- Bug reduction targets
- Team satisfaction goals

## File Creation
Create `internal/RECOVERY_PLAN.md` with the following structure:

```markdown
# Codebase Recovery Plan

## Executive Summary
- **Current Health Score**: {score}/100
- **Target Health Score**: {target}/100
- **Estimated Timeline**: {total_time}
- **Key Focus Areas**: {primary_concerns}

## Phase 1: Quick Wins (0-2 weeks)
### Priority Actions
- [ ] {Action 1} - Impact: {High/Med/Low}, Effort: {hours}, Risk: {Low/Med/High}
- [ ] {Action 2} - Impact: {High/Med/Low}, Effort: {hours}, Risk: {Low/Med/High}

### Success Criteria
- {Measurable outcome 1}
- {Measurable outcome 2}

## Phase 2: Foundation (2-8 weeks)
### Priority Actions
- [ ] {Action 1} - Impact: {High/Med/Low}, Effort: {days}, Risk: {Low/Med/High}

### Success Criteria
- {Measurable outcome 1}

## Phase 3: Structural (2-6 months)
### Priority Actions
- [ ] {Action 1} - Impact: {High/Med/Low}, Effort: {weeks}, Risk: {Low/Med/High}

### Success Criteria
- {Measurable outcome 1}

## Phase 4: Evolution (6+ months)
### Priority Actions
- [ ] {Action 1} - Impact: {High/Med/Low}, Effort: {months}, Risk: {Low/Med/High}

### Success Criteria
- {Measurable outcome 1}

## Risk Management
### High Risk Items
- {Risk description} - Mitigation: {strategy}

### Rollback Procedures
- {Procedure for undoing changes if needed}

## Progress Tracking
- **Weekly Check-ins**: Review completed actions
- **Monthly Metrics**: Measure improvement indicators
- **Quarterly Assessment**: Re-run recovery assessment
```

## Output Confirmation
```
📋 RECOVERY PLAN GENERATED

✅ Created: internal/RECOVERY_PLAN.md
📊 {X} actions identified across {Y} phases
⏱️  Estimated timeline: {total_time}
🎯 Target improvement: {current_score} → {target_score}

🚀 NEXT STEPS:
1. Review the generated plan
2. Adjust priorities based on team capacity
3. Use `/recovery-execute` to begin automated improvements
4. Schedule regular progress reviews

💡 TIP: Start with Phase 1 quick wins to build momentum
```