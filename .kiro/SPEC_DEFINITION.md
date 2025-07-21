# Kiro Specification Definition

## What Constitutes a Complete "Spec"

A **specification** (or "spec") in the Kiro system is a complete, self-contained description of work to be done. A spec is considered **complete** if and only if it contains all three required components with proper structure.

## Required Components

### 1. Requirements Document (`requirements.md`)
**Purpose**: Defines WHAT needs to be built and WHY

**Required Structure**:
- **Introduction**: 1-2 paragraph problem statement
- **Requirements**: 3-9 numbered requirements  
- **User Stories**: Each requirement has format "As a [user], I want [capability] so that [benefit]"
- **Acceptance Criteria**: 4-6 testable criteria per requirement using "WHEN/THEN/SHALL" format
- **Measurable Criteria**: Specific metrics where applicable (times, percentages, counts)

**Quality Standards**:
- All acceptance criteria must be objectively testable
- Must focus on user value, not implementation details  
- Language uses "SHALL" (mandatory), "SHOULD" (recommended), "MAY" (optional)
- No implementation details leak into requirements

### 2. Design Document (`design.md`)
**Purpose**: Describes HOW the solution will be implemented

**Required Structure**:
- **Overview**: 2-3 paragraph solution approach
- **Architecture**: Component relationships and system design
- **Components and Interfaces**: Key classes/interfaces with code examples
- **Implementation Strategy**: Work broken into logical phases
- **Technical Decisions**: Rationale for key choices

**Quality Standards**:
- Shows component relationships (diagrams encouraged)
- Includes code examples for key interfaces
- Implementation broken into manageable phases (typically 3)
- Documents alternatives considered and trade-offs
- Covers quality aspects (performance, security, maintainability)

### 3. Tasks Document (`tasks.md`)  
**Purpose**: Defines implementation breakdown in proper order

**Required Structure**:
- **Phases**: Work organized into logical phases (Foundation → Implementation → Polish)
- **Numbered Tasks**: Sequential numbering across all phases
- **Requirements Mapping**: Each task uses `_Requirements: X.Y_` format
- **Dependencies**: Task dependencies using `_Dependencies: #N_` format  
- **Completion Criteria**: Clear deliverables for each task

**Quality Standards**:
- All requirements from requirements.md must be covered by at least one task
- Dependencies must form logical implementation order
- Tasks must be actionable with clear completion criteria
- No circular dependencies
- Requirements traceability is complete and accurate

## Validation Requirements

A spec is **complete** when:

### ✅ Structure Requirements
- [ ] All three files exist: `requirements.md`, `design.md`, `tasks.md`
- [ ] Each file follows the required structure outlined above
- [ ] Files are properly formatted markdown with consistent terminology

### ✅ Content Requirements  
- [ ] Requirements document has 3-9 user-focused requirements with testable acceptance criteria
- [ ] Design document shows architecture and implementation approach with code examples
- [ ] Tasks document breaks work into phases with numbered, traceable tasks

### ✅ Quality Requirements
- [ ] All acceptance criteria in requirements.md are objectively testable
- [ ] All requirements are mapped to tasks using `_Requirements: X.Y_` format
- [ ] Task dependencies form logical implementation order without cycles
- [ ] No orphaned requirements (requirements not covered by tasks)
- [ ] No orphaned tasks (tasks not mapped to requirements)

### ✅ Consistency Requirements
- [ ] Terminology is consistent across all three documents
- [ ] Scope is consistent between requirements and design
- [ ] Tasks implement all requirements without gaps
- [ ] No contradictions between files

## Incomplete Specs

A directory in `.kiro/specs/` that does not meet all validation requirements is **not a complete spec**. Common incomplete states:

❌ **Missing Files**: Lacks one or more required files  
❌ **Improper Structure**: Files exist but don't follow required format  
❌ **Missing Traceability**: Tasks don't map back to requirements  
❌ **Untestable Criteria**: Acceptance criteria are vague or subjective  
❌ **Implementation Leakage**: Requirements contain implementation details  
❌ **Broken Dependencies**: Task dependencies are circular or illogical  
❌ **Incomplete Coverage**: Some requirements not covered by any tasks  

## Specification Lifecycle

1. **Planning**: Create requirements.md first (defines what/why)
2. **Design**: Create design.md second (defines how)  
3. **Implementation Planning**: Create tasks.md last (defines when/order)
4. **Validation**: Verify all requirements met using validation checklist
5. **Execution**: Work through tasks in dependency order
6. **Completion**: All tasks marked complete, all acceptance criteria validated

## Enforcement

Tools and processes should enforce this definition:

- **Spec scanners** should validate complete specs vs incomplete specs
- **Task trackers** should only operate on properly structured tasks.md files  
- **Completion detection** should require all three files with proper structure
- **Archival systems** should only archive complete, validated specs

## Examples

### Complete Specs (meet all requirements):
- `.kiro/specs/repository-improvement/` - Complex multi-phase spec
- `.kiro/specs/code-quality-hook/` - Focused technical implementation
- `.kiro/specs/typescript-migration/` - Migration/refactoring spec  
- `.kiro/specs/markdown-library-integration/` - Simple, well-scoped spec

### Incomplete Examples (missing components):
- Directory with only `requirements.md` - Missing design and tasks
- Directory with tasks but no requirements mapping - No traceability
- Files present but requirements have no acceptance criteria - Improper structure

## Template Usage

To create a complete spec:
1. Copy `.kiro/spec-template/` to your new spec directory
2. Fill out all three files following the required structure  
3. Validate using `.kiro/spec-template/CHECKLIST.md`
4. Ensure complete requirements → tasks traceability

**A spec is only complete when it passes all validation requirements.**