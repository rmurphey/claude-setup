# Technology Stack

## Core Technologies
- **Runtime**: Node.js 16+ (ES modules)
- **Package Manager**: npm
- **CLI Framework**: Inquirer.js for interactive prompts
- **File Operations**: fs-extra for enhanced file system operations
- **Styling**: Chalk for terminal colors and formatting

## Build System
- **Module System**: ES modules (`"type": "module"` in package.json)
- **Entry Point**: `bin/cli.js` (executable CLI script)
- **Distribution**: NPX-compatible package with GitHub repository source

## Quality Tools
- **Linting**: ESLint with modern flat config format
- **Testing**: Node.js built-in test runner (`node --test`)
- **Coverage**: c8 for test coverage reporting
- **Code Style**: Single quotes, semicolons required

## Common Commands

### Development
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for tests
npm run test:watch

# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

### Documentation
```bash
# Update README with command documentation
npm run update-readme

# Update all documentation
npm run update-docs

# Validate documentation
npm run docs:validate
```

### Recovery Operations
```bash
# Fix broken project setup
npm run fix

# Preview fix operations without applying
npm run fix:dry-run
```

## Architecture Patterns
- **Language Detection**: Modular detection system with confidence scoring
- **Template System**: Variable substitution using `{{VARIABLE}}` syntax
- **Command Pattern**: Standardized custom commands in `.claude/commands/`
- **Recovery System**: Three-phase approach (assess → plan → execute)

## Dependencies
- **Production**: chalk, fs-extra, inquirer (minimal runtime dependencies)
- **Development**: c8, eslint (quality tooling only)
- **Engines**: Node.js 16+ required for ES modules and modern features