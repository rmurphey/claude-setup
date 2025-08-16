---
agent-type: general-purpose
allowed-tools: [Read, Glob, Grep, LS, Write]
description: Comprehensive repository audit for completeness, conflicts, and utility assessment
---

# Repository Quality Auditor Agent

## Objective
Systematically audit the repository to identify issues with completeness, conflicting guidance, and questionably useful commands to improve overall quality and user experience.

## Task Instructions

### Phase 1: Repository Discovery
1. Map all documentation and command files
2. Identify all npm scripts and their purposes
3. Catalog all agents and their capabilities
4. Document file organization structure
5. Note any unusual patterns or structures

### Phase 2: Completeness Audit

#### Command Completeness
For each command in `.claude/commands/`:
- ✓ Has valid frontmatter with `allowed-tools` and `description`
- ✓ Contains clear usage instructions
- ✓ Provides practical examples
- ✓ Documents expected outcomes
- ✓ Includes error handling guidance

#### Documentation Coverage
- All commands listed in README
- Command count badges accurate
- COMMAND_CATALOG up to date
- Package.json scripts documented
- Test coverage meets stated standards (60%)

#### Missing Elements
Identify:
- Commands without tests
- Scripts without documentation
- Features mentioned but not implemented
- Broken internal references
- Incomplete workflows

### Phase 3: Conflict Detection

#### Duplicate Functionality Analysis
Identify commands with overlapping purposes:
```
POTENTIAL DUPLICATES:
- /reflect vs /retrospective (both for session reflection)
- /learn vs /reflect quick (both capture insights)
- /hygiene vs /hygiene:full vs /hygiene:quick (multiple variants)
- Recovery commands (4 separate files for similar workflow)
- Detailed commands vs regular commands (when to use which?)
```

#### Contradictory Guidance
Search for conflicting instructions:
- Different tone requirements (CLAUDE.md vs commands)
- Conflicting workflow recommendations
- Inconsistent tool usage patterns
- Variable quality standards
- Contradictory best practices

#### Naming Inconsistencies
- Command naming patterns
- File organization logic
- Script naming conventions
- Category assignments

### Phase 4: Utility Assessment

#### Complexity Analysis
Flag overly complex commands:
- Commands > 300 lines
- Deep nesting (> 3 levels)
- Multiple responsibility violations
- Excessive configuration requirements
- Unclear value propositions

#### Redundancy Detection
Identify potentially redundant features:
```
QUESTIONABLE UTILITY:
1. Four separate recovery commands - could be one with subcommands
2. Detailed variants - unclear when to use vs regular
3. Multiple reflection mechanisms - /reflect, /retrospective, /learn
4. Overlapping planning commands - /idea, /ideation, /design
5. Session management spread across multiple tools
```

#### Usage Pattern Analysis
Assess practical utility:
- Commands requiring extensive setup
- Features with unclear use cases
- Overly specific commands
- Commands better suited as npm scripts
- Agent overlap with commands

### Phase 5: Quality Metrics

#### Calculate Scores
```
COMPLETENESS SCORE: X/100
- Documentation coverage: X%
- Test coverage: X%
- Frontmatter completeness: X%
- Example availability: X%

CONSISTENCY SCORE: Y/100
- No conflicts: Y%
- Naming consistency: Y%
- Pattern adherence: Y%
- Style uniformity: Y%

UTILITY SCORE: Z/100
- Clear purpose: Z%
- No redundancy: Z%
- Appropriate complexity: Z%
- Practical value: Z%
```

### Phase 6: Recommendations

#### Critical Issues
Issues requiring immediate attention:
1. Broken references and missing files
2. Conflicting core guidance
3. Security or quality risks
4. Missing critical documentation

#### Consolidation Opportunities
Commands that should be merged:
```
RECOMMENDED MERGERS:
1. Combine recovery-* into single /recovery command with subcommands
2. Merge /reflect and /retrospective into unified reflection system
3. Consolidate /hygiene variants into single command with flags
4. Combine planning commands into cohesive workflow
```

#### Deprecation Candidates
Commands with questionable value:
```
CONSIDER DEPRECATING:
1. Overly complex commands with simpler alternatives
2. Rarely-used detailed variants
3. Commands better as npm scripts
4. Redundant functionality
```

#### Enhancement Suggestions
Improvements for retained commands:
1. Simplify complex commands
2. Add missing documentation
3. Improve error handling
4. Standardize patterns
5. Add practical examples

## Output Format

Create `.claude/agents/reports/repo-quality-audit-[date].md`:

```markdown
# Repository Quality Audit Report - [Date]

## Executive Summary
- **Overall Quality Score**: X/100
- **Critical Issues**: Y
- **Commands Audited**: Z
- **Recommendations**: W

## Completeness Analysis

### Missing Elements
| Category | Item | Impact | Priority |
|----------|------|--------|----------|
| Documentation | Command X lacks examples | Medium | High |
| Testing | No tests for Y.js | High | Critical |
| Frontmatter | Z.md missing allowed-tools | Low | Medium |

### Coverage Metrics
- Documentation: X% complete
- Test Coverage: Y% (target: 60%)
- Command Examples: Z% have examples

## Conflict Analysis

### Duplicate Functionality
1. **Reflection Commands**
   - `/reflect`: Session and weekly reflection
   - `/retrospective`: Session analysis
   - `/learn`: Insight capture
   - **Recommendation**: Consolidate into single reflection system

2. **Planning Commands**
   - `/idea`: Quick idea capture
   - `/ideation`: AI-powered ideation
   - `/design`: Feature planning
   - **Recommendation**: Create unified planning workflow

### Contradictory Guidance
1. **Tone Requirements**
   - CLAUDE.md: "even, unexcited tone"
   - Commands: Use emojis and enthusiasm
   - **Resolution**: Standardize tone guidelines

## Utility Assessment

### Overly Complex Commands
| Command | Lines | Complexity | Recommendation |
|---------|-------|------------|----------------|
| /reflect | 359 | High | Split into modules |
| /ideation | 250+ | High | Simplify or deprecate |

### Redundancy Analysis
| Feature | Instances | Usage | Recommendation |
|---------|-----------|-------|----------------|
| Recovery | 4 commands | Low | Merge into one |
| Hygiene | 3 variants | Medium | Single command with flags |
| Detailed | 5 commands | Low | Consider deprecating |

### Value Assessment
**High Value** (Keep and enhance):
- /commit, /hygiene, /todo, /learn, /tdd

**Medium Value** (Simplify):
- /reflect, /design, /monitor

**Low Value** (Consider removing):
- Recovery commands (overly complex)
- Detailed variants (unclear purpose)
- Some planning commands (redundant)

## Recommendations

### Immediate Actions
1. Fix broken references in README
2. Update command count badge (shows 14, actually 37)
3. Resolve tone contradiction in guidelines
4. Add missing frontmatter to 3 commands

### Short Term (1-2 weeks)
1. Consolidate recovery commands
2. Merge reflection tools
3. Simplify complex commands
4. Update COMMAND_CATALOG

### Long Term (1 month)
1. Implement unified planning workflow
2. Create command deprecation plan
3. Standardize all patterns
4. Comprehensive documentation overhaul

## Quality Improvement Plan

### Phase 1: Clean Up
- Remove or merge redundant commands
- Fix all broken references
- Standardize frontmatter

### Phase 2: Consolidate
- Combine similar functionality
- Reduce command count by 30%
- Improve organization

### Phase 3: Enhance
- Add missing tests
- Improve documentation
- Create user guides

## Metrics for Success
- Reduce command count from 37 to ~25
- Achieve 100% frontmatter compliance
- Eliminate all conflicts
- Reach 70% test coverage
- Clear purpose for every command

## Appendix: Detailed Findings
[Comprehensive list of all issues found...]
```

## Success Criteria
- Complete audit of all commands and documentation
- Identification of all conflicts and redundancies
- Clear, actionable recommendations
- Quantified quality metrics
- Prioritized improvement plan

## Notes
- Focus on user experience and practical value
- Consider maintenance burden
- Preserve core functionality while reducing complexity
- Document rationale for all recommendations