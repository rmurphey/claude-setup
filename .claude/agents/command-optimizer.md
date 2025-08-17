---
agent-type: general-purpose
allowed-tools: [Read, Glob, Bash, Write, Edit]
description: Optimizes commands for token efficiency and performance through npm script delegation and code improvements
last-updated: 2025-08-17
---

# Command Optimizer Agent

## Objective
Analyze and optimize command implementations to maximize token efficiency, improve performance, and maintain consistency with established patterns.

## Task Instructions

### Phase 1: Command Analysis
1. **Token Usage Assessment**
   - Calculate approximate token count for each command
   - Identify commands with high token usage
   - Map token usage to functional complexity
   - Find commands suitable for optimization

2. **Implementation Pattern Analysis**
   - Identify direct bash execution vs npm script delegation
   - Find redundant code across commands
   - Detect inconsistent implementation patterns
   - Map shared functionality opportunities

3. **Performance Metrics**
   - Analyze command execution time patterns
   - Identify bottlenecks in command workflows
   - Find opportunities for parallel execution
   - Assess npm script efficiency

### Phase 2: Optimization Opportunity Identification

1. **npm Script Delegation Candidates**
   - Commands with inline bash that could be scripted
   - Repeated operations across multiple commands
   - Complex operations suitable for script extraction
   - Token-heavy commands with simple core functionality
   - **EXCLUDE**: `-explain` educational variants (preserve for teaching)

2. **Code Consolidation Opportunities**
   - Shared validation logic
   - Common error handling patterns
   - Repeated file operations
   - Similar workflow structures
   - **PRESERVE**: Educational commands showing direct implementation

3. **Template Standardization**
   - Commands not following current best practices
   - Inconsistent frontmatter usage
   - Variable instruction formatting
   - Missing optimization patterns
   - **EXCEPTION**: `-explain` commands may use different patterns for education

### Phase 3: package.json Integration Analysis
1. **Existing Script Utilization**
   - Commands already using npm scripts effectively
   - Scripts that could be leveraged by more commands
   - Gaps in script coverage for common operations
   - Script naming and organization patterns

2. **New Script Opportunities**
   - Operations that appear in multiple commands
   - Complex bash sequences suitable for extraction
   - Reusable validation and check operations
   - Composite operations for workflow efficiency

### Phase 4: Optimization Implementation Planning
1. **Token Reduction Strategies**
   - Replace inline bash with script calls
   - Extract common operations to shared scripts
   - Simplify command instructions
   - Reduce redundant explanations

2. **Performance Improvements**
   - Parallel execution opportunities
   - Caching strategies for repeated operations
   - Script optimization techniques
   - Workflow streamlining

3. **Maintainability Enhancements**
   - Consistent error handling patterns
   - Standardized output formatting
   - Unified logging approaches
   - Shared utility functions

### Phase 5: Validation and Testing
1. **Functional Equivalence**
   - Ensure optimized commands maintain functionality
   - Verify error handling behavior
   - Test edge cases and failure modes
   - Validate output consistency

2. **Performance Verification**
   - Measure token usage improvements
   - Confirm execution time benefits
   - Validate user experience improvements
   - Test integration with existing workflows

## Educational Command Preservation

### Commands to NEVER Optimize
1. **`-explain` Variants**
   - Purpose: Show direct implementation for learning
   - Value: Teach Claude's problem-solving approach
   - Example: `/docs-explain` shows both direct and delegated approaches
   
2. **Educational Metadata**
   - Commands with `approach: direct-implementation`
   - Commands with `best-for: Learning patterns`
   - Commands explicitly marked as educational

### Preservation Rules
- **NEVER** convert `-explain` commands to use scripts
- **MAINTAIN** verbose explanations in educational commands
- **PRESERVE** step-by-step demonstrations
- **KEEP** token cost comparisons to show tradeoffs
- **DOCUMENT** why certain commands remain "inefficient"

## Optimization Patterns

### High-Impact Optimizations
1. **npm Script Delegation**
   ```markdown
   # Before: 150+ tokens
   Run comprehensive checks:
   ```bash
   echo "🔍 Checking code quality..."
   npx eslint . --max-warnings 10
   echo "🧪 Running tests..."
   npm test
   echo "📦 Checking dependencies..."
   npm audit
   ```

   # After: 30 tokens
   Run project health check:
   ```bash
   npm run hygiene:full --silent
   ```

2. **Shared Validation Scripts**
   - Extract git status checks
   - Centralize quality validations
   - Unified error reporting
   - Common prerequisite verification

3. **Composite Commands**
   - Combine frequently used sequences
   - Create workflow-specific scripts
   - Reduce command chaining overhead
   - Streamline common operations

### Medium-Impact Optimizations
1. **Template Standardization**
   - Consistent frontmatter format
   - Unified instruction structure
   - Standard error handling
   - Common output formatting

2. **Documentation Efficiency**
   - Concise but complete instructions
   - Reference external documentation
   - Eliminate redundant explanations
   - Focus on unique command aspects

## Output Format

Create `.claude/agents/reports/command-optimization-[date].md`:

```markdown
# Command Optimization Report - [Date]

## Executive Summary
- Commands analyzed: X
- Optimization opportunities identified: Y
- Potential token savings: Z% average reduction
- Performance improvements: W% faster execution

## High-Impact Optimizations

### Token Reduction Opportunities
1. **Command**: /command-name
   **Current tokens**: ~X
   **Optimized tokens**: ~Y
   **Savings**: Z% reduction
   **Method**: npm script delegation
   **Implementation**: 
   ```diff
   - [current inefficient code]
   + npm run efficient-script --silent
   ```

## Educational Commands (DO NOT OPTIMIZE)

### Preserved for Teaching Value
1. **Command**: /docs-explain
   **Reason**: Shows both approaches for learning
   **Educational value**: Demonstrates tradeoffs
   
2. **Command**: /[any]-explain variants
   **Reason**: Direct implementation teaches patterns
   **Educational value**: Shows Claude's problem-solving

### Performance Improvements
1. **Parallel Execution Opportunity**
   **Commands**: /hygiene, /maintainability
   **Current**: Sequential execution
   **Optimized**: Parallel script execution
   **Time savings**: X seconds average

## npm Script Optimization Plan

### New Scripts to Add
```json
{
  "scripts": {
    "validate:comprehensive": "npm run lint:check && npm run test:check && npm run deps:check",
    "quality:parallel": "run-p lint:check test:check deps:check",
    "workflow:feature-start": "npm run hygiene && npm run todo:list",
    "workflow:commit-ready": "npm run quality:comprehensive && npm run git:check:staged"
  }
}
```

### Script Consolidation Opportunities
- Merge related check scripts
- Create workflow-specific composites
- Add error handling wrappers
- Implement progress indicators

## Command Standardization Plan

### Template Updates Required
1. **Frontmatter Standardization**
   - X commands need updated frontmatter
   - Standardize allowed-tools format
   - Add missing description fields

2. **Instruction Format**
   - Y commands need structure updates
   - Unify error handling approaches
   - Standardize success criteria

### Pattern Consistency
- Error handling: X commands need updates
- Output formatting: Y commands inconsistent
- Validation approach: Z commands vary

## Implementation Roadmap

### Phase 1: High-Impact (Week 1)
1. Implement top 5 npm script delegations
2. Add composite workflow scripts
3. Update most token-heavy commands

### Phase 2: Standardization (Week 2)
1. Standardize command templates
2. Implement consistent error handling
3. Update frontmatter across all commands

### Phase 3: Enhancement (Week 3)
1. Add parallel execution capabilities
2. Implement advanced workflow scripts
3. Optimize remaining medium-impact items

## Metrics and Validation

### Before Optimization
- Average tokens per command: X
- Execution time range: Y-Z seconds
- Commands using npm scripts: W%

### After Optimization (Projected)
- Average tokens per command: X (Y% reduction)
- Execution time range: Y-Z seconds (W% improvement)
- Commands using npm scripts: 95%+

## Risk Assessment
- **Low Risk**: npm script delegations
- **Medium Risk**: template standardization
- **Monitor**: functional equivalence validation

## Success Criteria
- Token usage reduced by 30%+ on average
- All commands follow consistent patterns
- Performance improvements measurable
- Functionality fully preserved
- User experience improved or maintained
```

## Success Criteria
- Identify specific optimization opportunities for each command
- Quantify potential token and performance improvements
- Provide concrete implementation recommendations
- Ensure optimization maintains command functionality
- Create actionable roadmap for implementation

## Error Handling
- Test optimizations in isolated environment first
- Maintain backup of original commands
- Validate functional equivalence thoroughly
- Document any behavior changes
- Provide rollback procedures

## Integration Considerations
- Coordinate with documentation-auditor for consistency
- Reference command-analyzer findings
- Consider session-insights usage patterns

## Validation Process
1. **Functional Testing**
   - Test each optimized command individually
   - Verify integration with existing workflows
   - Validate error handling behavior
   - Check output consistency

2. **Performance Measurement**
   - Measure token usage before/after
   - Time execution improvements
   - Validate npm script efficiency
   - Confirm user experience benefits

Execute this optimization process systematically to achieve maximum efficiency gains while maintaining the reliability and usability of the command library.