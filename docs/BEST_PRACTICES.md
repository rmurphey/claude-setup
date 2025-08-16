# Claude Code Best Practices Guide

<!-- 
This document is self-updating. To regenerate:
In Claude Code: /docs update best-practices
Last updated: 2025-01-16
Git SHA: 9af0fdc7e42e3e0fff960e73cf8520a9c32e7dcb
-->

## Table of Contents
1. [Claude Code Specific Best Practices](#claude-code-specific-best-practices)
2. [Test-Driven Development with Claude](#test-driven-development-with-claude)
3. [Token Efficiency Strategies](#token-efficiency-strategies)
4. [Workflow Automation](#workflow-automation)
5. [Team Collaboration](#team-collaboration)
6. [Security and Quality](#security-and-quality)
7. [Documentation Standards](#documentation-standards)
8. [Conventional Commits](#conventional-commits)
9. [Context Management](#context-management)
10. [Command Development](#command-development)

---

## Claude Code Specific Best Practices

### 1. Structured Workflow Approach

**Source**: [Anthropic Internal Teams Usage Patterns](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)

The most successful Claude Code workflows follow this pattern:
1. **Research and exploration** - Let Claude understand the codebase first
2. **Planning and documentation** - Create a plan before implementation
3. **Implementation** - Execute the plan with clear steps
4. **Testing and validation** - Verify all changes work correctly
5. **Commit and PR creation** - Use Claude's git integration

> "Steps #1-#2 are crucial—without them, Claude tends to jump straight to coding a solution. While sometimes that's what you want, asking Claude to research and plan first significantly improves performance for problems requiring deeper thinking upfront."

### 2. Permission Management

**Source**: [Community Best Practices (Builder.io)](https://www.builder.io/blog/claude-code)

The default permission prompts can interrupt flow. Two approaches:

**Safe Approach** (Recommended for production):
```bash
# Allow specific safe operations
claude --allow "npm run lint:*,npm test,git status"
```

**Development Approach** (Use with caution):
```bash
# Skip all permissions (similar to Cursor's yolo mode)
claude --dangerously-skip-permissions
```

> "Every time I open Claude Code, I hit Command+C and run `claude --dangerously-skip-permissions`. It's not as dangerous as it sounds — think of it as Cursor's old yolo mode."

### 3. Custom Commands Best Practice

**Source**: [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/slash-commands)

Store reusable workflows as markdown files in `.claude/commands/`:
- Commands become available via slash menu (type `/`)
- Check into git for team sharing
- Reduce repetitive prompting
- Ensure consistent execution

### 4. CLAUDE.md Configuration

**Source**: [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)

Every project should have a `CLAUDE.md` file documenting:
- Repository etiquette (branch naming, merge vs. rebase)
- Developer environment setup (pyenv, compiler versions)
- Unexpected behaviors or warnings
- Project-specific conventions
- Quality standards and thresholds

---

## Test-Driven Development with Claude

### The TDD Advantage with AI

**Source**: [Community Testing Patterns](https://pragmaticengineer.com/p/two-years-of-using-ai)

> "Test-driven development (TDD) becomes even more powerful when using Claude Code. The robots LOVE TDD. Seriously. They eat it up. With TDD you have the robot friend build out the test, and the mock. Then your next prompt you build the mock to be real. And the robot just loves this. It is the most effective counter to hallucination and LLM scope drift I have found."

### TDD Best Practices for 2025

**Source**: [BrowserStack TDD Guide](https://www.browserstack.com/guide/what-is-test-driven-development)

1. **Follow Red-Green-Refactor**
   - Write failing test first (Red)
   - Write minimal code to pass (Green)
   - Refactor for clarity (Refactor)

2. **Keep Tests Atomic**
   - Each test focuses on one behavior
   - Avoid testing multiple functionalities
   - Improves debugging and maintenance

3. **Start Simple**
   - Begin with the simplest test case
   - Test fundamental features first
   - Progress to complex interactions

4. **Comprehensive Coverage**
   - Include negative tests (failure conditions)
   - Test boundary values (edge cases)
   - Use equivalence partitioning

---

## Token Efficiency Strategies

### NPM Script Delegation Pattern

**Source**: This Repository's Measured Results ([docs/TOKEN_EFFICIENCY.md](TOKEN_EFFICIENCY.md))

Achieve 87% token reduction through npm script delegation:

**Before** (264 lines in command):
```markdown
# Project Hygiene Check
[... 250+ lines of bash logic ...]
```

**After** (30 lines in command):
```markdown
# Project Hygiene Check
\`\`\`bash
npm run hygiene:full --silent
\`\`\`
```

**Measured Results**:
- Average reduction: 89%
- Hygiene command: 264 → 30 lines (88% reduction)
- Commit command: 296 → 33 lines (88% reduction)
- Maintainability: 458 → 42 lines (90% reduction)

### Token Optimization Techniques

1. **Delegate to scripts** - Move logic to npm/shell scripts
2. **Use references** - Link to files rather than embedding
3. **Batch operations** - Combine multiple tool calls
4. **Context management** - Proactively compact at checkpoints

---

## Workflow Automation

### AI-Powered Development Practices

**Source**: [2025 Industry Report](https://www.leanware.co/insights/best-practices-ai-software-development)

1. **Supervised AI Agents**
   - Human oversight for code generation
   - Review agent reasoning and outputs
   - Approve terminal command execution
   - Rollback capability when needed

2. **CI/CD Integration**
   - Automate TDD-driven testing in pipelines
   - Make testing integral to deployment
   - Use AI for test generation
   - Monitor code quality metrics

3. **Strategic Implementation**
   - Start with pilot projects
   - Focus on high-impact use cases
   - Integrate seamlessly with existing tools
   - Measure and iterate on results

---

## Team Collaboration

### Patterns from Anthropic Teams

**Source**: [How Anthropic Teams Use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)

> "The pattern became clear: agentic coding isn't just accelerating traditional development. It's dissolving the boundary between technical and non-technical work, turning anyone who can describe a problem into someone who can build a solution."

### Collaboration Best Practices

1. **Shared Commands**
   - Check `.claude/commands/` into version control
   - Document team-specific workflows
   - Create command templates for common tasks

2. **Code Review Integration**
   ```bash
   /install-github-app  # Automated PR reviews
   ```
   > "Claude often finds bugs that humans miss. Humans nitpick variable names. Claude finds actual logic errors and security issues."

3. **Knowledge Sharing**
   - Use `/learn` to capture insights
   - Document patterns in CLAUDE.md
   - Share effective prompts as commands

---

## Security and Quality

### Security Best Practices

**Source**: [IBM AI Development Guide](https://www.ibm.com/think/topics/ai-in-software-development)

1. **Data Access Control**
   - Know which data an agent can access
   - Understand where data is sent
   - Manage software supply chain risks

2. **Code Review Requirements**
   - All AI-generated code needs review
   - Annotate AI changes in commits
   - Track AI-assisted changes

3. **Quality Assurance**
   - Automated testing for all changes
   - Version control for rollback
   - Comprehensive test coverage

### Quality Gates

Implement these checks before allowing commits:
- Linting and formatting compliance
- Type checking (if applicable)
- Test suite execution
- Build validation
- Security scanning for secrets
- File size monitoring

---

## Documentation Standards

### Self-Documenting Code

**Source**: [Software Development Best Practices 2025](https://codewave.com/insights/ai-automation-software-development/)

1. **AI-Generated Documentation**
   - Document the "why" not just the "what"
   - Include context for AI decisions
   - Link to relevant issues/PRs

2. **Living Documentation**
   - Update docs with code changes
   - Use `/update-docs` command regularly
   - Track documentation metrics

3. **Citation Requirements**
   - Cite sources for best practices
   - Reference official documentation
   - Include community patterns with attribution

---

## Conventional Commits

### Specification Compliance

**Source**: [Conventional Commits v1.0.0](https://www.conventionalcommits.org/)

**Structure**:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Essential Types**:
- `feat`: New features (MINOR version)
- `fix`: Bug fixes (PATCH version)
- `docs`: Documentation changes
- `test`: Test additions/corrections
- `refactor`: Code restructuring
- `chore`: Maintenance tasks

**Breaking Changes**:
- Add `!` after type/scope: `feat!: breaking change`
- Or include in footer: `BREAKING CHANGE: description`
- Results in MAJOR version bump

### 2025 Best Practices

**Source**: [Conventional Commits Guide](https://www.enlume.com/blogs/mastering-commit-messages-a-guide-to-conventional-commits-and-best-practices)

1. **Automation Integration**
   - Use with semantic versioning
   - Auto-generate changelogs
   - Integrate with CI/CD

2. **Team Standards**
   - Enforce via commitlint
   - Use git hooks (husky)
   - Regular team reviews

3. **Message Quality**
   - Present tense, lowercase
   - No period at end
   - Focus on single concern
   - Explain "why" in body

---

## Context Management

### Managing Claude's Context Window

**Source**: [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/memory)

1. **Proactive Compaction**
   ```bash
   /compact  # Manually compact at checkpoints
   ```
   - Compact after feature completion
   - Compact before starting new work
   - Monitor context indicator

2. **Context Optimization**
   - Keep prompts focused
   - Reference files vs embedding
   - Use batch operations
   - Clear context between major tasks

3. **Cost Management**
   - Track token usage per session
   - Use `/estimate` before tasks
   - Monitor actual vs estimated usage
   - Optimize expensive operations

---

## Command Development

### Creating Effective Commands

**Source**: This Repository's Experience

1. **Command Structure**
   ```markdown
   ---
   allowed-tools: [Bash, Read, Write]
   description: Brief command description
   ---
   
   # Command Name
   
   Instructions for Claude...
   ```

2. **Token Efficiency**
   - Delegate to npm scripts
   - Keep commands under 50 lines
   - Use references not embedding
   - Provide clear, concise instructions

3. **Testing Commands**
   - Test on multiple project types
   - Validate cross-platform
   - Measure token usage
   - Document edge cases

4. **Documentation**
   - Include usage examples
   - Document prerequisites
   - Explain configuration options
   - Provide troubleshooting guide

---

## Lessons from Production Sessions

### Real-World Session Management

**Source**: Actual 2.5-hour transformation session (2025-01-16)

Production sessions with Claude Code require different strategies than demo or learning sessions:

#### 1. Directory Discipline
**Learning**: Always return to repository root after operations

```bash
# Anti-pattern - Getting lost in subdirectories
cd .claude/commands/
# ... operations ...
# Forget to return, next operations fail

# Best Practice - Always return home
REPO_ROOT=$(pwd)
cd .claude/commands/
# ... operations ...
cd "$REPO_ROOT"
```

#### 2. Atomic Commit Discipline
**Learning**: Plan commits before making changes, not after

```markdown
# Anti-pattern - Retroactive splitting
- Make 1000+ line changes
- Try to split into logical commits
- Lose context and grouping

# Best Practice - Plan first
1. Define commit boundaries (<200 lines)
2. Make focused changes
3. Commit immediately
4. Move to next atomic unit
```

#### 3. Test-As-You-Go Principle
**Learning**: Test immediately after each implementation

```bash
# Anti-pattern
for script in scripts/*; do
  npm_script_name=$(basename "$script")
  # Create npm script
done
# Test everything at end - cascading failures

# Best Practice
for script in scripts/*; do
  npm_script_name=$(basename "$script")
  # Create npm script
  npm run "$npm_script_name" --silent || echo "Failed: $npm_script_name"
done
```

#### 4. Context Management Strategy
**Learning**: Proactive context management prevents confusion

| Checkpoint Trigger | Action Required |
|-------------------|-----------------|
| 30 minutes elapsed | Save checkpoint, assess progress |
| 30 interactions | Consider compaction |
| Major decision made | Document rationale immediately |
| Error encountered | Capture state before fixing |

#### 5. Real-Time Documentation
**Learning**: Document decisions as they're made, not retrospectively

```markdown
# ACTIVE_WORK.md - Update in real-time
## Decision: Use NPM Script Delegation
- Time: 14:32
- Rationale: 87% token reduction measured
- Tradeoff: Slight indirection vs massive efficiency
- Result: Implemented across all commands
```

### Production Patterns That Work

#### 1. Living Reference Architecture
**Proven**: Repository that uses its own tools validates patterns

Benefits discovered:
- Immediate feedback on command usability
- Real-world testing of patterns
- Credibility through actual use
- Natural evolution through practice

#### 2. Token Efficiency First
**Proven**: 87-91% reduction transforms development velocity

Real metrics from session:
- Before: 264 lines per command (~3000 tokens)
- After: 30 lines per command (~300 tokens)
- Impact: 10x more iterations possible

#### 3. Subdirectory Organization
**Proven**: `.claude/commands/detailed/` pattern scales cleanly

Advantages realized:
- No namespace pollution
- Clear variant hierarchy
- Future-proof structure
- Easy discovery

### Session Anti-patterns to Avoid

1. **Assumption Cascade**
   - Making changes based on unverified assumptions
   - Solution: Verify state before each operation

2. **Context Tunnel Vision**
   - Losing sight of original goals
   - Solution: Regular goal alignment checks

3. **Documentation Debt**
   - "I'll document later" never happens
   - Solution: Document inline with implementation

4. **Test Skipping**
   - Moving forward without validation
   - Solution: Test before marking complete

### Production Session Checklist

Before starting:
- [ ] Read CLAUDE.md and ACTIVE_WORK.md
- [ ] Check recent git history
- [ ] Create session plan with checkpoints
- [ ] Estimate token budget

During session:
- [ ] Update todo list continuously
- [ ] Test after each implementation
- [ ] Document decisions real-time
- [ ] Return to root after operations
- [ ] Checkpoint every 30 minutes

After session:
- [ ] Save session transcript (optional)
- [ ] Document learnings
- [ ] Update metrics
- [ ] Plan next session

### Session Preservation (Optional)

If you choose to save sessions, consider:
- **Before context compaction**: Preserve conversation before reset
- **After major features**: Capture successful implementations
- **Pattern discoveries**: Save when finding reusable solutions
- **Every 30-60 minutes**: For long sessions you want to preserve

Remember: Session saving is optional. Use it when it provides value to you.

---

## Metrics and Validation

### Tracking Success

**Source**: Industry Best Practices

Key metrics to track:
- **Token usage** per command
- **Execution time** statistics
- **Error rates** and recovery
- **User satisfaction** scores
- **Cost per feature** delivered

### Continuous Improvement

1. Regular reviews of command effectiveness
2. Update based on user feedback
3. Monitor Claude API changes
4. Incorporate new best practices
5. Share learnings with community

---

## References

1. [Anthropic Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
2. [How Anthropic Teams Use Claude Code](https://www.anthropic.com/news/how-anthropic-teams-use-claude-code)
3. [Conventional Commits v1.0.0 Specification](https://www.conventionalcommits.org/)
4. [Test-Driven Development Guide (BrowserStack)](https://www.browserstack.com/guide/what-is-test-driven-development)
5. [AI in Software Development (IBM)](https://www.ibm.com/think/topics/ai-in-software-development)
6. [Community Patterns (Builder.io)](https://www.builder.io/blog/claude-code)
7. [Awesome Claude Code Repository](https://github.com/hesreallyhim/awesome-claude-code)
8. [Two Years of Using AI Tools (Pragmatic Engineer)](https://newsletter.pragmaticengineer.com/p/two-years-of-using-ai)

---

*Last updated: 2025-01-16 (SHA: 9af0fdc7)*
*For updates, run `/docs update best-practices` in Claude Code.*