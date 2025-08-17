---
allowed-tools: [Bash, Read, Edit, Grep]
description: Educational command showing how documentation works
approach: direct-implementation
token-cost: ~2000 (educational value over efficiency)
best-for: Learning documentation patterns
---

# Documentation Explained: Direct vs Delegated Approaches

This command demonstrates HOW documentation updates work, showing both approaches for educational purposes.

## Approach 1: Direct Implementation (What Claude Would Do)

This is how Claude would naturally approach documentation updates without scripts:

<bash>
# Step 1: Count commands by scanning the directory
echo "📊 Counting commands..."
find .claude/commands -name "*.md" -type f | wc -l
</bash>

<bash>
# Step 2: Get recent commits for examples
echo "📝 Finding exemplary commits..."
git log --oneline -20 | head -10
</bash>

<read>
# Step 3: Read current README to understand structure
.claude/README.md
</read>

<edit>
# Step 4: Update badge count in README
# Find: [![Commands](https://img.shields.io/badge/commands-X-green)]
# Replace with actual count
</edit>

<grep>
# Step 5: Find all documentation files needing updates
pattern: "Last updated:|Generated on:"
path: docs/
</grep>

### Token Cost Analysis
- Reading files: ~500 tokens
- Git commands: ~200 tokens  
- Grep searches: ~300 tokens
- Edit operations: ~500 tokens
- Claude's reasoning: ~500 tokens
**Total: ~2000 tokens**

## Approach 2: Script Delegation (Current Implementation)

<bash>
# Delegate everything to the optimized script
node scripts/docs.js
</bash>

### Token Cost Analysis
- Single command: ~50 tokens
- Script output: ~50 tokens
**Total: ~100 tokens**

## Approach 3: Hybrid (Best of Both Worlds)

<bash>
# Use script for data collection
node scripts/docs.js collect-only
</bash>

Then Claude can:
- Intelligently select best examples
- Write custom descriptions
- Make context-aware decisions
- Handle edge cases

### Token Cost Analysis
- Script execution: ~100 tokens
- Claude's intelligent processing: ~400 tokens
**Total: ~500 tokens**

## Key Lessons

1. **Direct approach** shows Claude's problem-solving process
2. **Script delegation** saves tokens for repetitive tasks
3. **Hybrid approach** balances efficiency with intelligence

## When to Use Each

| Scenario | Best Approach | Why |
|----------|--------------|-----|
| First time setup | Direct | Need to understand the problem |
| Daily updates | Script | Same task, predictable outcome |
| Complex changes | Hybrid | Need both efficiency and judgment |
| Teaching someone | Direct | Show the thinking process |
| Production work | Script | Optimize for speed/cost |

## Try It Yourself

To see the direct approach in action:
1. Comment out the script delegation in `/docs`
2. Implement the steps shown above
3. Track token usage manually

## The Philosophy

This command exists to teach, not to execute efficiently. By showing multiple approaches, we help users understand:
- How Claude naturally solves problems
- Where scripts provide value
- When to use each approach
- The real token costs involved

Remember: **"Teach thinking, not just tricks."**