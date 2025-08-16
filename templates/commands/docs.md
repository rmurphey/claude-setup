---
allowed-tools: [Bash, Read, Write]
description: Documentation generation and maintenance system
---

# Documentation Command

Automated documentation generation, maintenance, and synchronization system for keeping project documentation current.

## Context
- Documentation files: !`find . -name "*.md" | grep -v node_modules | wc -l | xargs`+ markdown files
- README status: !`[ -f "README.md" ] && echo "exists ($(wc -l < README.md) lines)" || echo "missing"`
- Last doc update: !`git log -1 --format="%cr" -- "*.md" 2>/dev/null || echo "unknown"`
- Commands documented: !`grep -c "^- \`/" README.md 2>/dev/null || echo "0"`+ commands

## Your Task
Generate and maintain project documentation automatically:

```bash
#!/bin/bash

# Parse command arguments
COMMAND="${1:-update}"
TARGET="${2}"
ARGS="${*:3}"

case "$COMMAND" in
  "readme"|"update-readme")
    echo "📝 Updating README.md"
    echo "====================="
    
    # Check if README exists
    if [ ! -f "README.md" ]; then
      echo "📄 Creating new README.md..."
      
      # Extract project info
      PROJECT_NAME=$(basename "$PWD")
      PROJECT_DESC="Project description here"
      
      if [ -f "package.json" ]; then
        PROJECT_DESC=$(grep -o '"description"[^,]*' package.json | cut -d'"' -f4 2>/dev/null || echo "Node.js project")
      fi
      
      cat > README.md << EOF
# $PROJECT_NAME

$PROJECT_DESC

## Quick Start

\`\`\`bash
# Installation
npm install

# Development
npm start

# Testing
npm test

# Build
npm run build
\`\`\`

## Development Workflow

This project uses Claude Code for development assistance with custom commands:

EOF
    else
      echo "📝 README.md exists, updating sections..."
    fi
    
    # Update commands section
    if [ -d ".claude/commands" ]; then
      COMMAND_COUNT=$(ls .claude/commands/*.md 2>/dev/null | wc -l | xargs)
      echo "🔧 Found $COMMAND_COUNT custom commands"
      
      # Create commands section content
      COMMANDS_SECTION="## Available Commands\n\nThis project includes $COMMAND_COUNT custom Claude commands for streamlined development:\n\n"
      
      for cmd_file in .claude/commands/*.md; do
        if [ -f "$cmd_file\" ]; then
          CMD_NAME=$(basename "$cmd_file" .md)
          CMD_DESC=$(grep \"^description:\" \"$cmd_file\" | cut -d: -f2- | sed 's/^ *//' || echo \"No description\")\n          COMMANDS_SECTION=\"$COMMANDS_SECTION- \`/$CMD_NAME\` - $CMD_DESC\\n\"\n        fi\n      done\n      \n      COMMANDS_SECTION=\"$COMMANDS_SECTION\\n### Command Usage\\n\\n\`\`\`bash\\n# Example usage\\n/hygiene    # Check project health\\n/todo       # Manage tasks\\n/commit     # Quality-checked commits\\n/push       # Safe push with validation\\n\`\`\`\\n\"\n      \n      # Update or add commands section to README\n      if grep -q \"## Available Commands\" README.md; then\n        # Replace existing section\n        awk '\n          /^## Available Commands/ { \n            print \"## Available Commands\"\n            print \"\"\n            print \"This project includes '$COMMAND_COUNT' custom Claude commands for streamlined development:\"\n            print \"\"\n            while ((getline line < \"'temp_commands.txt'\") > 0) {\n              print line\n            }\n            # Skip until next section\n            while (getline && !/^## /) continue\n            if (NF) print\n          }\n          !/^## Available Commands/ { print }\n        ' README.md > README.tmp\n        \n        # Create temp file with commands\n        printf \"$COMMANDS_SECTION\" | sed 's/\\\\n/\\n/g' > temp_commands.txt\n        mv README.tmp README.md\n        rm -f temp_commands.txt\n      else\n        # Append commands section\n        printf \"\\n$COMMANDS_SECTION\" | sed 's/\\\\n/\\n/g' >> README.md\n      fi\n      \n      echo \"✅ Updated commands section with $COMMAND_COUNT commands\"\n    fi\n    \n    # Update project info if package.json exists\n    if [ -f \"package.json\" ]; then\n      VERSION=$(grep '\"version\"' package.json | cut -d'\"' -f4)\n      if [ -n \"$VERSION\" ]; then\n        echo \"📊 Project version: $VERSION\"\n      fi\n    fi\n    \n    echo \"✅ README.md updated successfully\"\n    ;;\n    \n  \"api\"|\"api-docs\")\n    echo \"📚 Generating API Documentation\"\n    echo \"==============================\"\n    \n    if [ ! -d \"src\" ] && [ ! -d \"lib\" ]; then\n      echo \"❌ No source directory found (src/ or lib/)\"\n      exit 1\n    fi\n    \n    mkdir -p docs/api\n    \n    # Find main entry points\n    ENTRY_FILES=$(find src lib -name \"index.*\" -o -name \"main.*\" -o -name \"app.*\" 2>/dev/null | head -3)\n    \n    if [ -z \"$ENTRY_FILES\" ]; then\n      ENTRY_FILES=$(find src lib -name \"*.js\" -o -name \"*.ts\" 2>/dev/null | head -5)\n    fi\n    \n    echo \"📄 Documenting entry points:\"\n    echo \"$ENTRY_FILES\" | sed 's/^/  /'\n    echo \"\"\n    \n    # Generate API documentation template\n    cat > docs/api/README.md << EOF\n# API Documentation\n\nGenerated: $(date '+%Y-%m-%d %H:%M')\n\n## Overview\n\nThis document describes the API surface and key functions of the project.\n\n## Entry Points\n\nEOF\n    \n    # Analyze each entry file\n    echo \"$ENTRY_FILES\" | while read -r file; do\n      if [ -f \"$file\" ]; then\n        echo \"### $(basename \"$file\")\" >> docs/api/README.md\n        echo \"\" >> docs/api/README.md\n        echo \"**Path**: \\`$file\\`\" >> docs/api/README.md\n        echo \"\" >> docs/api/README.md\n        \n        # Extract exports (basic detection)\n        EXPORTS=$(grep -E \"^(export|module\\.exports)\" \"$file\" | head -5 | sed 's/^/- /')\n        if [ -n \"$EXPORTS\" ]; then\n          echo \"**Exports**:\" >> docs/api/README.md\n          echo \"$EXPORTS\" >> docs/api/README.md\n        fi\n        echo \"\" >> docs/api/README.md\n      fi\n    done\n    \n    echo \"✅ API documentation generated in docs/api/README.md\"\n    ;;\n    \n  \"architecture\"|\"arch\")\n    echo \"🏗️ Generating Architecture Documentation\"\n    echo \"=======================================\"\n    \n    mkdir -p docs\n    \n    cat > docs/ARCHITECTURE.md << EOF\n# Architecture Documentation\n\n**Generated**: $(date '+%Y-%m-%d %H:%M')\n**Project**: $(basename \"$PWD\")\n\n## Overview\n\nHigh-level architecture and design decisions for this project.\n\n## Project Structure\n\n\\`\\`\\`\n$(tree -I 'node_modules|dist|build|coverage' -L 3 2>/dev/null || find . -type d -not -path './node_modules*' -not -path './dist*' -not -path './build*' | head -20 | sort)\n\\`\\`\\`\n\n## Technology Stack\n\nEOF\n    \n    # Detect technologies\n    if [ -f \"package.json\" ]; then\n      echo \"### Runtime\" >> docs/ARCHITECTURE.md\n      echo \"- **Node.js**: $(node --version 2>/dev/null || echo \"version unknown\")\" >> docs/ARCHITECTURE.md\n      \n      # Extract key dependencies\n      if grep -q \"react\" package.json; then\n        echo \"- **React**: Frontend framework\" >> docs/ARCHITECTURE.md\n      fi\n      if grep -q \"express\" package.json; then\n        echo \"- **Express**: Web server framework\" >> docs/ARCHITECTURE.md\n      fi\n      if grep -q \"typescript\" package.json; then\n        echo \"- **TypeScript**: Static typing\" >> docs/ARCHITECTURE.md\n      fi\n    fi\n    \n    cat >> docs/ARCHITECTURE.md << EOF\n\n## Key Components\n\n### Core Modules\n*Document main modules and their responsibilities*\n\n### Data Flow\n*Describe how data flows through the system*\n\n### External Dependencies\n*List and justify external service dependencies*\n\n## Design Decisions\n\n### Decision 1: [Title]\n**Context**: Why this decision was needed\n**Decision**: What was decided\n**Consequences**: Impact of this decision\n\n## Development Workflow\n\n### Quality Gates\n- Linting: ESLint configuration\n- Testing: Test framework and coverage requirements  \n- Build: Build process and output\n\n### Custom Commands\nThis project uses custom Claude commands for development:\n- \\`/hygiene\\` - Project health checks\n- \\`/commit\\` - Quality-checked commits\n- \\`/push\\` - Safe push with validation\n\n## Deployment\n\n*Document deployment process and infrastructure*\n\n---\n*Architecture documentation generated by /docs architecture*\nEOF\n\n    echo \"✅ Architecture documentation generated in docs/ARCHITECTURE.md\"\n    ;;\n    \n  \"changelog\"|\"changes\")\n    echo \"📝 Generating CHANGELOG.md\"\n    echo \"===========================\"\n    \n    if [ ! -f \"CHANGELOG.md\" ]; then\n      cat > CHANGELOG.md << EOF\n# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n\n## [Unreleased]\n\n### Added\n- Initial project setup\n- Claude Code integration with custom commands\n\nEOF\n    else\n      echo \"📄 CHANGELOG.md exists, updating with recent changes...\"\n    fi\n    \n    # Get recent commits for changelog\n    RECENT_COMMITS=$(git log --since=\"1 week ago\" --pretty=format:\"- %s\" | head -10)\n    \n    if [ -n \"$RECENT_COMMITS\" ]; then\n      echo \"📊 Recent changes (from git history):\"\n      echo \"$RECENT_COMMITS\" | sed 's/^/  /'\n      echo \"\"\n      echo \"💡 Consider adding these to CHANGELOG.md under [Unreleased]\"\n    fi\n    \n    echo \"✅ CHANGELOG.md ready for updates\"\n    ;;\n    \n  \"check\"|\"validate\")\n    echo \"🔍 Documentation Health Check\"\n    echo \"=============================\"\n    echo \"\"\n    \n    local issues_found=0\n    \n    # Check essential documentation\n    echo \"📋 Essential Documentation:\"\n    \n    if [ -f \"README.md\" ]; then\n      README_LINES=$(wc -l < README.md)\n      if [ \"$README_LINES\" -lt 20 ]; then\n        echo \"  ⚠️  README.md is very short ($README_LINES lines) - consider expanding\"\n        issues_found=$((issues_found + 1))\n      else\n        echo \"  ✅ README.md present and substantial ($README_LINES lines)\"\n      fi\n    else\n      echo \"  ❌ README.md missing\"\n      issues_found=$((issues_found + 1))\n    fi\n    \n    if [ -f \"CLAUDE.md\" ]; then\n      echo \"  ✅ CLAUDE.md present (AI collaboration guidelines)\"\n    else\n      echo \"  ⚠️  CLAUDE.md missing - recommended for AI-assisted development\"\n    fi\n    \n    if [ -f \"CHANGELOG.md\" ]; then\n      echo \"  ✅ CHANGELOG.md present\"\n    else\n      echo \"  ⚠️  CHANGELOG.md missing - good practice for tracking changes\"\n    fi\n    \n    echo \"\"\n    echo \"🔧 Command Documentation:\"\n    \n    if [ -d \".claude/commands\" ]; then\n      COMMAND_COUNT=$(ls .claude/commands/*.md 2>/dev/null | wc -l | xargs)\n      README_COMMANDS=$(grep -c \"^- \\`/\" README.md 2>/dev/null || echo \"0\")\n      \n      echo \"  📁 Custom commands: $COMMAND_COUNT files\"\n      echo \"  📖 Commands in README: $README_COMMANDS\"\n      \n      if [ \"$COMMAND_COUNT\" -ne \"$README_COMMANDS\" ]; then\n        echo \"  ⚠️  Command count mismatch - README may need updating\"\n        echo \"      Run: /docs readme\"\n        issues_found=$((issues_found + 1))\n      else\n        echo \"  ✅ README commands documentation is current\"\n      fi\n    fi\n    \n    echo \"\"\n    echo \"📊 Documentation Statistics:\"\n    TOTAL_MD_FILES=$(find . -name \"*.md\" | grep -v node_modules | wc -l | xargs)\n    TOTAL_MD_LINES=$(find . -name \"*.md\" | grep -v node_modules | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo \"0\")\n    echo \"  Total markdown files: $TOTAL_MD_FILES\"\n    echo \"  Total documentation lines: $TOTAL_MD_LINES\"\n    \n    echo \"\"\n    if [ $issues_found -eq 0 ]; then\n      echo \"🎉 Documentation health: Excellent!\"\n    elif [ $issues_found -le 2 ]; then\n      echo \"👍 Documentation health: Good with minor issues\"\n    else\n      echo \"⚠️  Documentation health: Needs attention ($issues_found issues)\"\n    fi\n    ;;\n    \n  \"help\"|\"--help\"|\"-h\")\n    cat << 'EOF'\nDocumentation Command Help\n\nUSAGE:\n  /docs [command] [target] [options]\n\nCOMMANDS:\n  readme, update-readme       Update README.md with current project info\n  api, api-docs              Generate API documentation\n  architecture, arch         Create architecture documentation  \n  changelog, changes         Update CHANGELOG.md\n  check, validate           Validate documentation completeness\n  help                       Show this help\n\nEXAMPLES:\n  /docs readme               Update README with commands\n  /docs api                  Generate API documentation\n  /docs architecture         Create architecture docs\n  /docs check                Validate all documentation\n\nFEATURES:\n- Automatic README.md generation and updates\n- Command documentation synchronization\n- API documentation from source analysis\n- Architecture documentation templates\n- Documentation health validation\n\nINTEGRATION:\n- Works with existing project structure\n- Detects technology stack automatically\n- Synchronizes with .claude/commands/\n- Updates based on git history and package.json\nEOF\n    ;;\n    \n  *)\n    echo \"❌ Unknown docs command: $COMMAND\"\n    echo \"Use '/docs help' for available commands\"\n    exit 1\n    ;;\nesac\n\necho \"\"\necho \"📚 Use '/docs check' to validate all documentation\"\n```\n\n## Features\n- **Automated README Updates**: Syncs command documentation with actual commands\n- **API Documentation**: Generates API docs from source code analysis\n- **Architecture Documentation**: Creates structured architecture templates\n- **Health Validation**: Checks documentation completeness and consistency\n- **Technology Detection**: Automatically detects stack and dependencies\n- **Git Integration**: Uses git history for changelog and change detection\n\n## Documentation Types\n- **README.md**: Project overview, setup, and command reference\n- **API Documentation**: Technical API surface and usage\n- **Architecture**: High-level design and technology decisions\n- **CHANGELOG.md**: Version history and notable changes