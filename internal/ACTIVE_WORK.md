# Active Work - Internal Development

## Current Session Focus
**Repository Improvement Implementation Plan** - Systematic enhancement of code quality, architecture, and user experience based on comprehensive analysis

### Phase 1: Foundation (Priority 1-2 weeks)
- [ ] **CLI Architecture Refactor** - Split large bin/cli.js into focused modules
- [ ] **Enhanced Testing** - Add unit tests for lib/ modules and template generation
- [ ] **Error Handling** - Improve user-friendly error messages with actionable guidance

### Phase 2: User Experience (Priority 2-3 weeks)  
- [ ] **Documentation Optimization** - Restructure README for better scannability
- [ ] **Configuration System** - Add project-specific configuration file support
- [ ] **Performance Optimization** - Implement lazy loading and caching improvements

### Phase 3: Advanced Features (Priority 4-6 weeks)
- [ ] **Extended Language Support** - Add TypeScript, C++, C# language handlers
- [ ] **Template System Enhancement** - Add conditional blocks and template inheritance
- [ ] **Plugin Architecture** - Design extensible system for custom handlers

---

## Detailed Implementation Plan

### Phase 1: Foundation (Weeks 1-2)

#### 1.1 CLI Architecture Refactor
**Goal**: Split bin/cli.js (200+ lines) into focused, maintainable modules

**Tasks**:
- [ ] Create `lib/cli/` directory structure
- [ ] Extract `lib/cli/main.js` - Entry point and argument parsing
- [ ] Extract `lib/cli/interactive.js` - Question handling and user interaction
- [ ] Extract `lib/cli/setup.js` - Setup orchestration and workflow
- [ ] Extract `lib/cli/utils.js` - Shared utilities and helpers
- [ ] Update bin/cli.js to import and delegate to new modules
- [ ] Add unit tests for each new module

**Technical Specs**:
```javascript
// lib/cli/main.js - Entry point
export async function parseArgs(argv)
export async function runCLI(args)

// lib/cli/interactive.js - User interaction
export async function buildSmartQuestions()
export async function runInteractiveSetup()

// lib/cli/setup.js - Setup orchestration  
export async function runSetupMode(config)
export async function runRecoveryMode()
export async function runDevContainerMode(config)
```

**Success Criteria**: bin/cli.js < 50 lines, each module < 150 lines, 90%+ test coverage

#### 1.2 Enhanced Testing
**Goal**: Comprehensive test coverage for lib/ modules and template generation

**Tasks**:
- [ ] Add unit tests for `lib/language-detector.js`
- [ ] Add unit tests for each language handler in `lib/languages/`
- [ ] Add template generation tests with property-based testing
- [ ] Add performance benchmarks for language detection
- [ ] Create test utilities for mocking file system operations
- [ ] Add snapshot testing for generated templates

**Technical Specs**:
```javascript
// __tests__/lib/language-detector.test.js
describe('LanguageDetector', () => {
  test('detects JavaScript from package.json')
  test('handles multiple language candidates')
  test('caches detection results properly')
  test('performance: detects language in <100ms for typical project')
})

// __tests__/templates/template-generation.test.js  
describe('Template Generation', () => {
  test('generates valid CLAUDE.md for all configurations')
  test('substitutes variables correctly')
  test('handles edge cases in variable substitution')
})
```

**Success Criteria**: 85%+ code coverage, all lib/ modules tested, performance benchmarks established

#### 1.3 Error Handling Enhancement
**Goal**: User-friendly error messages with actionable guidance

**Tasks**:
- [ ] Create `lib/errors.js` - Centralized error handling
- [ ] Add specific error types for common failure scenarios
- [ ] Implement error recovery suggestions
- [ ] Add progress indicators for long-running operations
- [ ] Create error reporting utilities
- [ ] Update all modules to use centralized error handling

**Technical Specs**:
```javascript
// lib/errors.js
export class SetupError extends Error {
  constructor(message, code, suggestions = []) {
    super(message)
    this.code = code
    this.suggestions = suggestions
  }
}

export const ERROR_CODES = {
  LANGUAGE_DETECTION_FAILED: 'LANG_001',
  FILE_PERMISSION_DENIED: 'FILE_001',
  GIT_NOT_INITIALIZED: 'GIT_001'
}

export function handleError(error, context)
```

**Success Criteria**: All errors include actionable suggestions, user testing shows improved error resolution

### Phase 2: User Experience (Weeks 3-4)

#### 2.1 Documentation Optimization
**Goal**: Restructure README for better scannability and user onboarding

**Tasks**:
- [ ] Create 30-second decision section at top of README
- [ ] Add visual hierarchy with consistent formatting
- [ ] Create separate GETTING_STARTED.md for beginners
- [ ] Add interactive examples with copy-paste commands
- [ ] Create troubleshooting decision tree
- [ ] Add FAQ section for common questions

**Technical Specs**:
```markdown
# README.md structure
## 30-Second Decision ⚡
## Quick Start 🚀  
## When to Use / When NOT to Use ✅❌
## Core Features 🎯
## Detailed Documentation 📚
```

**Success Criteria**: User testing shows 50% faster decision-making, reduced support questions

#### 2.2 Configuration System
**Goal**: Project-specific configuration file support for team consistency

**Tasks**:
- [ ] Design `.claude-setup.json` schema
- [ ] Create `lib/config.js` - Configuration management
- [ ] Add configuration validation and migration
- [ ] Implement configuration inheritance (user → project → defaults)
- [ ] Add CLI commands for configuration management
- [ ] Create configuration templates for common scenarios

**Technical Specs**:
```javascript
// .claude-setup.json schema
{
  "version": "1.0",
  "defaults": {
    "qualityLevel": "standard",
    "teamSize": "small"
  },
  "overrides": {
    "javascript": { "qualityLevel": "strict" }
  },
  "templates": {
    "customCommands": ["./custom-commands/"]
  }
}

// lib/config.js
export class ConfigManager {
  async loadConfig(projectPath)
  async saveConfig(config, projectPath)  
  async validateConfig(config)
  async migrateConfig(oldConfig)
}
```

**Success Criteria**: Teams can standardize setup across projects, configuration validation prevents errors

#### 2.3 Performance Optimization
**Goal**: Faster execution through lazy loading and caching

**Tasks**:
- [ ] Implement lazy loading for heavy dependencies
- [ ] Add caching for language detection results
- [ ] Optimize file system operations with streaming
- [ ] Add parallel execution for independent setup tasks
- [ ] Implement incremental processing for recovery mode
- [ ] Add performance monitoring and metrics

**Technical Specs**:
```javascript
// lib/performance.js
export class LazyLoader {
  async loadModule(moduleName)
  getCachedModule(moduleName)
}

export class CacheManager {
  async get(key, ttl = 3600000) // 1 hour default
  async set(key, value, ttl)
  async invalidate(pattern)
}
```

**Success Criteria**: 50% faster execution for repeat runs, <2s startup time

### Phase 3: Advanced Features (Weeks 5-6)

#### 3.1 Extended Language Support
**Goal**: Add TypeScript, C++, C# language handlers

**Tasks**:
- [ ] Create `lib/languages/typescript.js`
- [ ] Create `lib/languages/cpp.js`  
- [ ] Create `lib/languages/csharp.js`
- [ ] Add detection patterns for new languages
- [ ] Create language-specific templates
- [ ] Add DevContainer configurations
- [ ] Update documentation and tests

**Technical Specs**:
```javascript
// lib/languages/typescript.js
export default {
  name: 'TypeScript',
  extensions: ['.ts', '.tsx'],
  configFiles: ['tsconfig.json', 'package.json'],
  async setup(config) {
    // TypeScript-specific setup logic
  }
}
```

**Success Criteria**: Full feature parity with existing languages, comprehensive testing

#### 3.2 Template System Enhancement  
**Goal**: Add conditional blocks and template inheritance

**Tasks**:
- [ ] Design template syntax for conditionals
- [ ] Implement template parser with conditional support
- [ ] Add template inheritance system
- [ ] Create template composition utilities
- [ ] Add template validation and testing
- [ ] Update existing templates to use new features

**Technical Specs**:
```javascript
// Enhanced template syntax
{{#if qualityLevel === 'strict'}}
Strict quality rules enabled
{{/if}}

{{#include base-template.md}}

// lib/templates.js
export class TemplateEngine {
  async render(template, variables)
  async parseConditionals(template)
  async resolveInheritance(template)
}
```

**Success Criteria**: Templates support complex logic, inheritance reduces duplication

#### 3.3 Plugin Architecture
**Goal**: Extensible system for custom handlers and rules

**Tasks**:
- [ ] Design plugin interface specification
- [ ] Create plugin discovery and loading system
- [ ] Add plugin validation and sandboxing
- [ ] Create plugin development documentation
- [ ] Build example plugins for common use cases
- [ ] Add plugin management CLI commands

**Technical Specs**:
```javascript
// Plugin interface
export interface Plugin {
  name: string
  version: string
  setup(config: SetupConfig): Promise<void>
  validate?(config: SetupConfig): ValidationResult
}

// lib/plugins.js
export class PluginManager {
  async loadPlugin(pluginPath)
  async validatePlugin(plugin)
  async executePlugin(plugin, config)
}
```

**Success Criteria**: Third-party plugins can extend functionality, secure plugin execution

---

## Implementation Guidelines

### Code Quality Standards
- **Function Complexity**: Max 15 lines per function
- **File Size**: Max 400 lines per file  
- **Test Coverage**: Min 85% for new code
- **Documentation**: JSDoc for all public functions
- **Performance**: <2s startup time, <100ms for cached operations

### Testing Strategy
- **Unit Tests**: Fast feedback (<1s total)
- **Integration Tests**: Real-world validation (<30s total)
- **Performance Tests**: Benchmark critical paths
- **User Acceptance Tests**: Manual testing with real projects

### Risk Mitigation
- **Backward Compatibility**: Maintain existing CLI interface
- **Incremental Rollout**: Feature flags for new functionality
- **Rollback Plan**: Git tags for stable versions
- **User Communication**: Clear migration guides for breaking changes

### Success Metrics
- **Performance**: 50% faster execution for repeat operations
- **Maintainability**: 90% reduction in large file count
- **User Experience**: 50% reduction in setup time for new users
- **Extensibility**: 3+ community plugins within 6 months

## Development Insights
*For development learnings and technical insights, see [internal/LEARNINGS.md](LEARNINGS.md)*

## Architecture Decisions
*Document decisions about the setup tool itself*

### Language Support Architecture
- Each language in separate module (lib/languages/)
- Consistent interface: export default { setup }
- Detection logic remains in main CLI
- Allows easy addition of new languages

## Active Ideas

Quick capture of pending ideas for future consideration:

- [ ] [2025-07-11 07:15] consider to what extent templates/CLAUDE.md should mimic CLAUDE.md.
- [x] [2025-07-11 07:17] add OS detection -- fixes like changing `timeout` to `gtimeout` mean this won't work on other systems 
- [ ] [2025-07-11 07:19] add the option to create an OSS project -- multiple potential contributors, a small number of approvers
- [ ] [2025-07-12 23:25] add a readme header to each .md file in .claude/commands/





---

## GitHub Issues

<!-- GITHUB_ISSUES_START -->
- [ ] **#2** Active work file not found: internal/ACTIVE_WORK.md
  - **URL**: https://github.com/rmurphey/claude-setup/issues/2
  - **Created**: 7/7/2025
<!-- GITHUB_ISSUES_END -->

---

## Deferred Items

- **[2025-07-06]** Multi-language project support with conflict resolution - Detect all languages, resolve tool conflicts (ESLint vs Prettier), create unified config for real-world polyglot projects
  - **Reason**: Complex architectural change requiring significant refactoring of existing single-language assumption
  - **Revisit**: After current architecture stabilizes and user feedback validates need

- **[2025-07-06]** Team workspace templates with role-based configurations - Frontend/backend/DevOps specific setups, shared configs, team onboarding guides to reduce onboarding time from days to hours
  - **Reason**: Focus on core Jest migration and test infrastructure stability before expanding feature scope
  - **Revisit**: After test infrastructure is fully stable and current quality tools are proven

- **[2025-07-06]** Structured logging with progress indicators - Replace console.log with structured logger, add progress bars, JSON output mode for better CI/CD integration
  - **Reason**: Basic console output is sufficient for current needs; prioritizing core functionality over polish features
  - **Revisit**: When user feedback indicates need for better CI/CD integration or progress visibility becomes a pain point

- **[2025-07-06]** Workspace multiplexing for parallel task development - Enable working on multiple tasks simultaneously with isolated workspaces (`claude-setup --workspace feature-auth --from main`). Each workspace gets separate git branch, full dev environment, independent Claude context (ACTIVE_WORK.md), and quality tools. Eliminates context switching overhead and enables parallel development streams when blocked on tasks.
  - **Reason**: Complex feature requiring significant architectural changes; current single-workspace model is sufficient for most users
  - **Revisit**: When multiple users request parallel workspace functionality or when working on large, long-running projects with frequent blocking issues

---

## Completed Work

### Recent Session Focus
- [x] Implement dual directory structure for internal vs external documentation
- [x] Separate development records from user-facing templates
- [x] Ensure clean npm package distribution
- [x] Fix ERR_REQUIRE_ESM error by converting to ES modules
- [x] Refactor CLI to modular architecture
- [x] Add support for GitHub Codespaces
- [x] Implement GitHub issue command

### Completed Quick Capture Items
- [x] [2025-01-04 22:15] add support for github codespaces - COMPLETED
- [x] [2025-01-04 22:16] create a command for working on a specific github issue - PLANNED
- [x] [2025-01-05 14:30] fix ERR_REQUIRE_ESM error - COMPLETED
- [x] [2025-01-05 14:45] refactor CLI to modular architecture - COMPLETED
- [x] [2025-01-05 16:35] implement devcontainer generation for all languages - COMPLETED
- [x] [2025-07-05 21:30] [AI-Generated] Add integration tests for CLI modes - Create end-to-end tests for setup, recovery, and DevContainer modes in temp directories to prevent regressions in user-facing workflows
- [x] [2025-07-05 22:00] Fix ES module test infrastructure - Jest configuration, CLI side effects, basic unit tests working
- [x] [2025-07-05 22:30] Systematic test suite fix - Replaced 6 broken test files with 1 comprehensive working test using proper ES module patterns
- [x] [2025-07-05 22:45] GitHub issue command Phase 1 - Implemented dual-architecture GitHub issue command (internal + template) with API wrapper, branch creation, and context documentation
- [x] [2025-07-05 23:00] GitHub issue command complete - Phase 1 delivered 80% of planned value with comprehensive workflow. Phase 2+ deferred as incremental polish vs high-impact alternatives
- [x] [2025-07-05 23:15] Smart language detection implemented - Best-guess with verification approach reduces friction for all users. Handles single detection, multiple candidates, and graceful fallbacks
- [x] [2025-07-06 00:00] Swift language support added - Complete Swift project setup with Package.swift generation, SwiftLint configuration, DevContainer support, and smart detection
- [x] [2025-07-06 16:45] [AI-Generated] One-command project recovery for broken setups - Add `claude-setup --fix` command that detects missing files and restores them to save hours of manual re-setup
- [x] [2025-07-06 17:35] [User-Requested] GitHub Issues integration into ACTIVE_WORK.md - Sync open GitHub issues into active work tracking with `claude-setup --sync-issues`. Automatic integration when accessing ACTIVE_WORK.md for unified task management.
- [x] [2025-07-10 15:30] Fix CLI execution detection for npx usage - Original ES module check failed when run via npx because execution path differs from file path. Simplified to always run main() since this is a CLI script. Supports direct execution, npx, global install, and package.json bin methods.
- [x] [2025-07-10 21:30] Optimize test performance and document NPX behavior - Fixed test suite performance (reduced from hanging to <1 second), optimized LanguageDetector file scanning, added comprehensive NPX behavior documentation and integration tests. Test suite now includes 75 tests covering all execution modes.

### Session History
- **2025-01-04**: Implemented dual directory structure to separate internal development records from user templates
- **2025-01-05**: Fixed ES module conversion and refactored CLI architecture
- **2025-07-05**: GitHub issue command, systematic test recovery, smart language detection
- **2025-07-06**: Swift language support implementation
