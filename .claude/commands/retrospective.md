# retrospective

Analyze session history, identify patterns, and capture learnings.

## Usage

<bash>
npm run retrospective --silent
</bash>

## What It Does

1. **Analyzes Git History**: Reviews recent commits for patterns
2. **Identifies Patterns**: Finds recurring themes and decisions  
3. **Captures Learnings**: Extracts insights from the session
4. **Updates Documentation**: Adds learnings to LEARNINGS.md
5. **Generates Report**: Creates retrospective summary

## Output

- Session metrics (commits, files, lines changed)
- Identified patterns and anti-patterns
- Key decisions and their outcomes
- Learnings captured
- Recommendations for next session

## When to Use

- After completing a major feature
- At the end of a long session
- Before context compaction
- Weekly for ongoing projects
- After encountering significant issues

## Options

The npm script supports these options:
- `--since`: Analyze from specific date
- `--commits`: Number of commits to analyze
- `--update`: Auto-update LEARNINGS.md
- `--metrics`: Include detailed metrics

## Examples

```bash
# Basic retrospective
npm run retrospective

# Analyze last 20 commits
npm run retrospective -- --commits=20

# Analyze since yesterday
npm run retrospective -- --since="1 day ago"

# Include metrics and auto-update
npm run retrospective -- --metrics --update
```