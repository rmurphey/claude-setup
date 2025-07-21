# Kiro Spec Template Guide

This directory contains templates for creating new specifications in the `.kiro/specs/` directory. These templates are based on analysis of the earliest and most successful specs in this project.

**Important**: A "spec" is only complete when it has all three required files with proper structure. See `../.kiro/SPEC_DEFINITION.md` for the complete definition.

## Template Structure

Each spec consists of three core files:

### 1. requirements.md - The "What" and "Why"
- **Purpose**: Defines what needs to be built and why
- **Format**: User stories with acceptance criteria
- **Key Elements**:
  - Brief introduction explaining the problem/need
  - Requirements organized by functional area (typically 3-9 requirements)
  - Each requirement has a user story and 5-6 specific acceptance criteria
  - Uses "SHALL/SHOULD/MAY" language for clarity
  - Includes measurable criteria where possible

### 2. design.md - The "How"
- **Purpose**: Describes the solution approach and architecture
- **Format**: Technical design with components and interfaces
- **Key Elements**:
  - Overview explaining the solution approach
  - Architecture section with current state analysis and target design
  - Components and interfaces with code examples
  - Implementation strategy broken into phases
  - Technical decisions with rationale
  - Quality considerations (performance, security, maintainability)

### 3. tasks.md - The "When" and "What Order"
- **Purpose**: Breaks down implementation into concrete, actionable tasks
- **Format**: Numbered task list organized by phases
- **Key Elements**:
  - Tasks organized into logical phases (typically 3 phases)
  - Each task has clear deliverables and acceptance criteria
  - Requirements traceability using `_Requirements: X.Y_` format
  - Dependencies using `_Dependencies: #N_` format
  - Checkbox format for tracking progress

## Usage Instructions

### Creating a New Spec

1. **Create spec directory**: 
   ```bash
   mkdir .kiro/specs/your-spec-name
   ```

2. **Copy templates**:
   ```bash
   cp .kiro/spec-template/* .kiro/specs/your-spec-name/
   ```

3. **Fill out requirements.md first**:
   - Start with a clear problem statement in the introduction
   - Define 3-9 main requirements
   - Write user stories focusing on user value
   - Create specific, testable acceptance criteria
   - Include measurable criteria (times, percentages, counts)

4. **Design the solution in design.md**:
   - Describe the solution approach in the overview
   - Analyze current state and identify problems
   - Design the target architecture with components
   - Plan implementation in phases
   - Document key technical decisions
   - Consider quality aspects

5. **Break down into tasks in tasks.md**:
   - Create concrete, actionable tasks
   - Organize into logical phases (foundation → implementation → polish)
   - Map each task to requirements using `_Requirements:_`
   - Add dependencies using `_Dependencies:_`
   - Ensure all requirements are covered

### Quality Guidelines

#### Requirements Quality
- **Testable**: Each acceptance criterion should be objectively verifiable
- **Measurable**: Include specific metrics where possible (< 2 seconds, 90% coverage, etc.)
- **User-focused**: Written from user perspective, not implementation perspective
- **Complete**: Cover all aspects of the feature/change

#### Design Quality  
- **Architecture-focused**: Describe components and their relationships
- **Phased approach**: Break complex changes into manageable phases
- **Decision rationale**: Explain why choices were made
- **Integration-aware**: Consider how it fits with existing systems

#### Task Quality
- **Actionable**: Each task should have clear deliverables
- **Traceable**: Map back to specific requirements
- **Ordered**: Dependencies should create logical implementation sequence
- **Completable**: Each task should be finishable in reasonable time

## Common Patterns

### Requirements Patterns
- **User Story Format**: "As a [user], I want [capability] so that [benefit]"
- **Acceptance Criteria**: "WHEN [condition] THEN [system] SHALL [behavior]"
- **Measurable Criteria**: Include numbers, times, percentages where relevant
- **Error Handling**: Cover what happens when things go wrong

### Design Patterns
- **Current → Target**: Analyze existing state, design improved state
- **Component Interface**: Show key classes/interfaces with code examples
- **Phase Planning**: Break implementation into manageable chunks
- **Integration Points**: Explain how it works with existing systems

### Task Patterns
- **Phase Organization**: Foundation → Core Implementation → Integration/Polish
- **Task Numbering**: Sequential across all phases
- **Requirements Mapping**: `_Requirements: 1.1, 2.3_`
- **Dependencies**: `_Dependencies: #3, #5_`

## Examples

See these existing specs as examples of good structure:
- `.kiro/specs/repository-improvement/` - Comprehensive example with all elements
- `.kiro/specs/code-quality-hook/` - Focused technical implementation
- `.kiro/specs/typescript-migration/` - Migration/refactoring example
- `.kiro/specs/markdown-library-integration/` - Simple, scoped example (after rescoping)

## Anti-Patterns to Avoid

### Requirements Anti-Patterns
- ❌ Implementation details in requirements ("use React hooks")
- ❌ Vague criteria ("should be fast", "should be user-friendly")
- ❌ Too many requirements (>10 becomes unwieldy)
- ❌ Missing user perspective (technical requirements without user value)

### Design Anti-Patterns
- ❌ No architecture diagrams or component relationships
- ❌ Implementation details without explaining decisions
- ❌ Monolithic approach (everything in one phase)
- ❌ No consideration of existing systems

### Task Anti-Patterns
- ❌ Vague tasks ("implement feature X")
- ❌ No requirements mapping
- ❌ Missing dependencies leading to wrong order
- ❌ Tasks that can't be verified as complete

## Template Maintenance

These templates are derived from analysis of successful specs in this project. If you notice patterns that work well or anti-patterns that cause problems, update these templates to reflect lessons learned.