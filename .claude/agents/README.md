# Claude Code Agents

This directory contains specialized agent templates that demonstrate advanced Claude Code capabilities while providing real utility for this repository.

## What Are Agents?

Agents are autonomous, multi-step task handlers that can:
- Perform complex analysis across multiple files
- Execute sophisticated workflows
- Make intelligent decisions based on context
- Coordinate multiple tools to achieve goals

## Available Agents

### Meta-Repository Agents
- **command-analyzer** - Analyzes command usage patterns and suggests optimizations
- **session-insights** - Extracts patterns from session history
- **workflow-composer** - Creates custom command sequences for complex tasks
- **documentation-auditor** - Ensures documentation completeness and consistency
- **command-optimizer** - Optimizes commands for token efficiency

## Agent Structure

Each agent file contains:
```yaml
---
agent-type: general-purpose | specialized
allowed-tools: [List of tools the agent can use]
description: Brief description of the agent's purpose
---
```

Followed by detailed instructions for the agent's task execution.

## Usage

Agents are invoked using the Task tool in Claude Code:
```
Use the command-analyzer agent to analyze our command usage patterns
```

## Creating Custom Agents

1. Copy an existing agent template
2. Modify the frontmatter metadata
3. Define clear objectives and steps
4. Test with real repository data
5. Document usage examples

## Best Practices

- Keep agents focused on specific, well-defined tasks
- Leverage existing npm scripts and commands
- Provide clear success criteria
- Include error handling instructions
- Document expected outputs

## Integration with Commands

Agents complement commands by:
- Analyzing command effectiveness
- Suggesting command combinations
- Automating multi-command workflows
- Providing insights from command usage

See individual agent files for specific capabilities and usage instructions.