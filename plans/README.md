# Plans Directory

This directory contains all Claude Code session plans - both active and completed.

## Structure

```
plans/
├── README.md                           # This file
├── [active-plan-name].md              # Plans currently being executed
└── completed/
    └── [completed-plan-name].md       # Completed plans with after-action reports
```

## Plan Lifecycle

1. **Creation**: Plan created when proposing significant work
2. **Active**: Plan file updated as tasks are completed  
3. **Completion**: Plan moved to `completed/` with after-action report
4. **Learning**: Insights extracted to LEARNINGS.md

## Plan Format

Each plan should include:
- **ID**: Unique identifier
- **Created**: Date created
- **Status**: Pending → Active → Completed
- **Objective**: Clear goal statement
- **Problem Statement**: What issue is being solved
- **Solution Design**: Proposed approach
- **Implementation Steps**: Checkbox list of tasks
- **Success Criteria**: How to measure completion
- **Risk Mitigation**: Potential issues and solutions

## After-Action Report Format

When moving to `completed/`, add:
- **Completed**: Date completed
- **Actual vs Planned**: What differed from plan
- **Challenges Encountered**: Problems faced
- **Solutions Applied**: How challenges were resolved
- **Learnings**: Key insights gained
- **Recommendations**: For future similar work

## Current Plans

### Active
- session-history-preservation.md - Preserve raw session transcripts

### Completed
- learnings-documentation.md - Document session learnings (2025-01-16)