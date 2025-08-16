# Claude Code Command Templates

Reference collection of 13 professional Claude Code command templates for structured development workflows.

## Quick Start

Browse the [command templates](templates/commands/) and copy the ones you want into your project's `.claude/commands/` directory.

## Overview

This repository provides **13 professional Claude Code command templates** for structured development workflows that you can copy and customize for your projects.

**Key Benefits:**
- ✅ **Professional Command Templates** - Curated Claude Code workflows for common development tasks
- ✅ **Copy-and-Customize** - Templates you can adapt to your team's needs
- ✅ **Structured Workflows** - Consistent patterns for commits, hygiene checks, documentation
- ✅ **Project Memory** - Templates that help maintain context across sessions

**Who Should Use This:**
- Developers wanting consistent Claude Code workflows
- Teams standardizing development practices with AI assistance
- Solo developers seeking professional command patterns

## Usage

1. **Browse Templates**: Review [command templates](templates/commands/) to see available workflows
2. **Copy Commands**: Copy desired templates to your project's `.claude/commands/` directory
3. **Customize**: Edit the templates to match your project's needs and standards

### Manual Setup
```bash
# Create commands directory in your project
mkdir -p .claude/commands

# Copy desired command templates
cp templates/commands/hygiene.md .claude/commands/
cp templates/commands/commit.md .claude/commands/
cp templates/commands/todo.md .claude/commands/
```

## Command Templates Reference

### How Command Templates Work

The commands created by this tool are **Claude Code command templates** - structured markdown files that guide Claude through common development workflows. They're not standalone executables, but rather curated prompts that help Claude provide consistent, professional assistance.

**Example: `/hygiene` command**
```markdown
---
allowed-tools: [Bash]  
description: Project health check
---

# Project Hygiene Check
Run comprehensive quality checks covering code, tests, dependencies...
```

When you use `/hygiene` in Claude Code, it reads this template and executes the described workflow.

### Command Template Usage

**In Claude Code:**
1. Type `/hygiene` (or any command)
2. Claude reads the template from `.claude/commands/hygiene.md`
3. Claude executes the workflow described in the template
4. You get consistent, professional development assistance

**Customization:**
- Edit `.claude/commands/*.md` files to adapt workflows to your needs
- Modify `allowed-tools` to restrict/expand Claude's capabilities
- Update descriptions and workflows for your team's processes

### 13 Core Command Templates

**Core Workflow**
- `/hygiene` - Project health check and quality validation
- `/todo` - Task management with ACTIVE_WORK.md integration
- `/commit` - Quality-checked commit workflow with pre-commit validation
- `/next` - AI-recommended next steps and development priorities

**Planning & Design**
- `/design` - Feature planning and design documentation system
- `/estimate` - Claude usage cost estimation for development tasks
- `/defer` - Task deferral and backlog management

**Learning & Growth**
- `/learn` - Capture insights and learnings from development work
- `/reflect` - Session reflection and insights capture
- `/docs` - Documentation generation and maintenance system

**Release & Maintenance**
- `/push` - Push commits with quality checks and branch management
- `/version-tag` - Version tagging and release management workflow
- `/maintainability` - Code maintainability analysis and improvement recommendations

## Contributing & Support

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes to command templates in `templates/commands/`
4. Test templates work correctly with Claude Code
5. Submit a pull request

### Getting Help
- **Template Issues**: Open an issue with the "template" label
- **Feature Requests**: Open an issue with the "enhancement" label
- **Documentation**: Open an issue with the "documentation" label

## License

MIT License - see LICENSE file for details.