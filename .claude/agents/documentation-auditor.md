---
agent-type: general-purpose
allowed-tools: [Read, Glob, Grep, Write]
description: Audits documentation completeness and consistency across the command library
last-updated: 2025-08-17---

# Documentation Auditor Agent

## Objective
Perform comprehensive audit of documentation quality, completeness, and consistency across commands, agents, and project documentation to ensure professional standards.

## Task Instructions

### Phase 1: Documentation Discovery
1. Scan all documentation files:
   - `.claude/commands/*.md` and subdirectories
   - `.claude/agents/*.md`
   - `docs/*.md`
   - Root level `*.md` files
   - `package.json` documentation fields
2. Identify documentation types and categories
3. Map relationships between documentation files

### Phase 2: Command Documentation Audit
For each command file, verify:
1. **Frontmatter Completeness**
   - `allowed-tools` field exists and is valid
   - `description` field exists and is descriptive
   - YAML formatting is correct
2. **Content Structure**
   - Clear purpose statement
   - Usage examples
   - Expected outcomes
   - Error handling information
3. **Consistency Checks**
   - Follows established format patterns
   - Uses consistent terminology
   - Command naming follows conventions

### Phase 3: Cross-Reference Validation
1. **README Accuracy**
   - All commands listed in README exist
   - Command counts match actual count
   - Links to command files work
   - Examples are current and correct
2. **COMMAND_CATALOG Accuracy**
   - All commands documented in catalog
   - Descriptions match command files
   - Usage examples are consistent
   - Categories are properly assigned
3. **Internal Links**
   - All markdown links work
   - Referenced files exist
   - Anchors and fragments are valid

### Phase 4: Content Quality Assessment
1. **Clarity and Completeness**
   - Instructions are actionable
   - Examples are realistic and helpful
   - Prerequisites are clearly stated
   - Success criteria are defined
2. **Technical Accuracy**
   - npm script references are correct
   - Tool usage is appropriate
   - Command syntax is valid
   - File paths are accurate
3. **User Experience**
   - Documentation supports different skill levels
   - Common use cases are covered
   - Troubleshooting information is adequate
   - Learning path is clear

### Phase 5: Standards Compliance
1. **Format Consistency**
   - Heading hierarchy is consistent
   - Code block formatting is uniform
   - List formatting follows patterns
   - Table formatting is standard
2. **Style Guide Adherence**
   - Voice and tone are consistent
   - Terminology is standardized
   - Writing quality is professional
   - Grammar and spelling are correct
3. **Template Compliance**
   - Files follow established templates
   - Required sections are present
   - Optional sections are used appropriately

## Audit Categories

### Critical Issues (Must Fix)
- Missing frontmatter
- Broken internal links
- Incorrect npm script references
- Invalid command syntax
- Missing critical documentation

### Quality Issues (Should Fix)
- Inconsistent formatting
- Unclear instructions
- Missing examples
- Outdated information
- Poor organization

### Enhancement Opportunities (Could Improve)
- Additional examples needed
- More comprehensive troubleshooting
- Better cross-references
- Enhanced user guidance
- Improved accessibility

## Output Format

Create `.claude/agents/reports/documentation-audit-[date].md`:

```markdown
# Documentation Audit Report - [Date]

## Executive Summary
- Files audited: X
- Critical issues: Y
- Quality issues: Z
- Overall quality score: W/100

## Critical Issues Requiring Immediate Attention

### Broken References
1. **File**: path/to/file.md
   **Issue**: Link to non-existent file
   **Line**: 42
   **Action**: Update link to correct path

### Missing Required Elements
1. **File**: command-name.md
   **Issue**: Missing allowed-tools frontmatter
   **Action**: Add frontmatter with tool list

## Quality Issues for Improvement

### Format Inconsistencies
1. **Pattern**: Inconsistent heading levels
   **Files**: [list of affected files]
   **Recommendation**: Standardize to H1 for title, H2 for sections

### Content Gaps
1. **Command**: /command-name
   **Issue**: Missing usage examples
   **Impact**: Users cannot understand practical application
   **Recommendation**: Add 2-3 realistic examples

## Documentation Completeness Matrix

| Category | Commands | Complete | Partial | Missing |
|----------|----------|----------|---------|---------|
| Core Workflow | 4 | 4 | 0 | 0 |
| Planning | 4 | 3 | 1 | 0 |
| Documentation | 4 | 2 | 2 | 0 |
| Release | 4 | 4 | 0 | 0 |
| Utilities | 3 | 2 | 1 | 0 |

## Cross-Reference Validation

### README Accuracy
- ✅ Command count matches actual
- ❌ 3 commands missing from list
- ✅ All listed commands exist
- ⚠️ 2 examples need updating

### Command Catalog Sync
- ✅ All commands documented
- ❌ 5 descriptions don't match source
- ✅ Categories properly assigned
- ⚠️ Usage examples inconsistent with source

## Recommendations by Priority

### High Priority (Complete Within 1 Week)
1. Fix broken links in README.md
2. Add missing frontmatter to 3 command files
3. Update outdated npm script references
4. Correct command syntax errors

### Medium Priority (Complete Within 2 Weeks)
1. Standardize heading hierarchy across all files
2. Add missing usage examples to 5 commands
3. Update COMMAND_CATALOG descriptions
4. Improve error handling documentation

### Low Priority (Complete Within 1 Month)
1. Enhance troubleshooting sections
2. Add more comprehensive examples
3. Improve cross-references
4. Create quick reference guide

## Quality Metrics
- Average examples per command: X
- Commands with complete documentation: Y%
- Cross-reference accuracy: Z%
- Format consistency score: W%

## Automated Checks Recommendations
1. Create linter for frontmatter validation
2. Add link checker to CI/CD
3. Implement spell-check automation
4. Set up documentation sync validation

## Template Compliance
- Commands following current template: X/Y
- Agents following established format: X/Y
- Documentation using standard structure: X/Y

## Next Steps
1. Address critical issues immediately
2. Create documentation improvement plan
3. Establish ongoing quality processes
4. Schedule regular audit cycles
```

## Success Criteria
- Complete audit of all documentation files
- Identification of all critical issues
- Clear prioritization of improvements
- Actionable recommendations with specific steps
- Quality metrics for tracking progress
- Process recommendations for ongoing maintenance

## Error Handling
- Skip unreadable files but log them
- Continue audit even with partial failures
- Note ambiguous issues for manual review
- Provide alternative solutions when possible

## Quality Standards Reference
- Frontmatter: Required fields present and valid
- Links: All internal links functional
- Examples: At least one realistic example per command
- Structure: Consistent heading hierarchy
- Clarity: Instructions are actionable
- Completeness: All usage scenarios covered

## Integration Points
- Reference existing style guides
- Use command-analyzer results for accuracy checks
- Coordinate with workflow-composer for example validation
- Align with session-insights for real-world usage patterns

Execute this audit systematically to ensure the documentation maintains professional quality and serves users effectively.