# Spec Quality Checklist

Use this checklist to validate spec quality before considering it complete.

**Definition**: A spec is complete if and only if it meets all requirements in `.kiro/SPEC_DEFINITION.md`. This checklist implements those validation requirements.

## Requirements.md Checklist

### Structure
- [ ] Has clear introduction explaining problem/need (1-2 paragraphs)
- [ ] Contains 3-9 requirements (not too few, not too many)
- [ ] Each requirement has user story format
- [ ] Each requirement has 4-6 specific acceptance criteria

### Content Quality
- [ ] User stories focus on user value, not implementation
- [ ] Acceptance criteria use "WHEN/THEN/SHALL" format
- [ ] Includes measurable criteria where possible (times, percentages, counts)
- [ ] Covers error handling and edge cases
- [ ] All criteria are testable/verifiable
- [ ] No implementation details leaked into requirements

### Language
- [ ] Uses "SHALL" for mandatory, "SHOULD" for recommended, "MAY" for optional
- [ ] Clear, unambiguous language
- [ ] Avoids technical jargon where possible
- [ ] Consistent terminology throughout

## Design.md Checklist

### Structure
- [ ] Has overview explaining solution approach (2-3 paragraphs)
- [ ] Includes current state analysis (if applicable)
- [ ] Describes target architecture with components
- [ ] Shows implementation phases
- [ ] Documents key technical decisions

### Technical Content
- [ ] Includes architecture diagrams or component relationships
- [ ] Shows key interfaces/classes with code examples
- [ ] Explains integration with existing systems
- [ ] Covers performance, security, maintainability considerations
- [ ] Documents alternatives considered and why choices were made

### Implementation Strategy
- [ ] Phases are logical and buildable
- [ ] Each phase has clear goals and deliverables
- [ ] Risk mitigation strategies included
- [ ] Backward compatibility considered

## Tasks.md Checklist

### Structure
- [ ] Tasks organized into logical phases (typically 3)
- [ ] Sequential numbering across all phases
- [ ] Each task has clear title and description
- [ ] All tasks have requirements mapping
- [ ] Dependencies clearly indicated

### Content Quality
- [ ] Tasks are concrete and actionable
- [ ] Each task has verifiable completion criteria
- [ ] Tasks can be completed in reasonable timeframes
- [ ] Dependencies form logical implementation order
- [ ] All requirements from requirements.md are covered by tasks

### Traceability
- [ ] `_Requirements: X.Y_` format used correctly
- [ ] `_Dependencies: #N_` format used correctly
- [ ] No orphaned requirements (requirements not covered by any task)
- [ ] No orphaned tasks (tasks not mapped to requirements)

## Overall Spec Checklist

### Completeness
- [ ] All three files present (requirements.md, design.md, tasks.md)
- [ ] Introduction clearly explains the problem
- [ ] Solution approach is well-defined
- [ ] Implementation is broken into manageable pieces
- [ ] Success criteria are defined

### Consistency
- [ ] Terminology consistent across all three files
- [ ] Requirements and design align
- [ ] Tasks implement all requirements
- [ ] No contradictions between files

### Quality
- [ ] Spec is focused and scoped appropriately
- [ ] Not too ambitious (can be completed in reasonable time)
- [ ] Not too simple (represents meaningful work)
- [ ] Follows established patterns from successful specs

### Maintainability
- [ ] Clear enough for someone else to understand
- [ ] Structured for easy updates as work progresses
- [ ] Requirements are stable (won't need frequent changes)
- [ ] Tasks can be reordered if needed

## Red Flags

Watch out for these warning signs:

❌ **Requirements Issues**
- More than 10 requirements (probably too complex)
- Vague acceptance criteria ("should be good", "user-friendly")
- Implementation details in requirements ("use library X")
- No measurable criteria anywhere

❌ **Design Issues**
- No architecture description
- No code examples or interfaces
- Everything in one phase (no incremental approach)
- No consideration of existing systems

❌ **Task Issues**
- Vague tasks ("implement the feature")
- No requirements traceability
- Circular dependencies
- Tasks that take >1 week each

❌ **Overall Issues**
- Spec tries to do too much
- No clear success criteria
- Inconsistent between files
- Implementation details everywhere instead of focusing on requirements

## Final Completeness Validation

Before considering a spec complete, verify it meets the formal definition:

### ✅ Complete Spec Requirements (from SPEC_DEFINITION.md)
- [ ] All three files exist: `requirements.md`, `design.md`, `tasks.md`
- [ ] Each file follows required structure (see templates)
- [ ] Requirements document has 3-9 user-focused requirements with testable acceptance criteria
- [ ] Design document shows architecture and implementation approach with code examples
- [ ] Tasks document breaks work into phases with numbered, traceable tasks
- [ ] All requirements mapped to tasks using `_Requirements: X.Y_` format
- [ ] Task dependencies form logical implementation order without cycles
- [ ] No orphaned requirements or orphaned tasks
- [ ] Terminology consistent across all documents
- [ ] No contradictions between files

### ✅ Spec Completeness Declaration
- [ ] **This spec meets the complete definition in `.kiro/SPEC_DEFINITION.md`**
- [ ] **All validation requirements have been verified**
- [ ] **Spec is ready for implementation**

## Spec Review Process

1. **Self-review**: Use this checklist before considering spec complete
2. **Technical review**: Have another developer review for technical soundness
3. **User perspective**: Validate that requirements focus on user value
4. **Implementation review**: Verify tasks are actionable and well-ordered
5. **Completeness verification**: Confirm spec meets formal definition

**A spec is only complete when it passes ALL checklist items including final validation AND avoids all red flags.**