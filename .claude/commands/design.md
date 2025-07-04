---
allowed-tools: [Write, Read]
description: Create comprehensive feature design document
---

# Feature Design Planning

## Context
- Current project structure: @README.md
- Existing documentation: @docs/
- Active work: @internal/ACTIVE_WORK.md

## Your task
Create a comprehensive design document for the specified feature in `docs/designs/` directory:

**Design Document Structure**:
1. **Problem Statement**: What problem does this solve?
2. **Requirements**: Functional and non-functional requirements
3. **Technical Approach**: Architecture and implementation strategy
4. **Implementation Phases**: Breakdown into manageable steps
5. **Cost Estimate**: Development effort assessment
6. **Testing Strategy**: How to validate the solution
7. **Dependencies**: External requirements or blockers
8. **Success Metrics**: How to measure completion

**File Location**: `docs/designs/{FEATURE_NAME}.md`

**Template**:
```markdown
# {Feature Name} Design

## Problem Statement
{What problem this solves}

## Requirements
- {Functional requirement 1}
- {Non-functional requirement 1}

## Technical Approach
{High-level implementation strategy}

## Implementation Phases
1. Phase 1: {description}
2. Phase 2: {description}

## Cost Estimate
- Size: {Small/Medium/Large/X-Large}
- Effort: {time estimate}
- Confidence: {High/Medium/Low}

## Testing Strategy
{How to validate the implementation}

## Dependencies
{External requirements}

## Success Metrics
{How to measure completion}
```