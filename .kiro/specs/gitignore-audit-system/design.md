# GitIgnore Audit System - Design

## Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   CLI Interface     │    │   Rule Library      │    │   Pattern Engine    │
│                     │    │                     │    │                     │
│ • audit command     │────│ • Language rules    │────│ • Pattern matching  │
│ • fix command       │    │ • Tool rules        │    │ • Syntax validation │
│ • interactive mode  │    │ • Custom rules      │    │ • Conflict detection│
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
           │                                                      │
           │                                                      │
           ▼                                                      ▼
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│   Project Scanner   │    │   GitIgnore Parser  │    │   Report Generator  │
│                     │    │                     │    │                     │
│ • File detection    │────│ • Parse existing    │────│ • Audit results     │
│ • Tech stack ID     │    │ • Validate patterns │    │ • Fix suggestions   │
│ • Tool discovery    │    │ • Preserve format   │    │ • Diff preview      │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## Core Components

### 1. Project Scanner
**Purpose**: Analyze project structure to determine technology stack and tools

**🔄 LEVERAGE EXISTING**: Extend `LanguageDetector` from `src/lib/language-detector.ts`

```typescript
interface ProjectAnalysis {
  technologies: Technology[];
  buildTools: BuildTool[];
  editors: Editor[];
  frameworks: Framework[];
  customPatterns: string[];
}

class GitIgnoreProjectScanner extends LanguageDetector {
  async analyzeProject(rootPath: string): Promise<ProjectAnalysis>
  detectBuildTools(): BuildTool[]      // NEW: npm, cargo, maven, etc.
  detectEditors(): Editor[]            // NEW: .vscode/, .idea/, etc.
  detectFrameworks(): Framework[]      // NEW: React, Django, etc.
  // inheritTechnologies(): from parent LanguageDetector
}
```

**Detection Methods**:
- **File patterns**: `package.json`, `Cargo.toml`, `pom.xml`, etc.
- **Directory structure**: `src/`, `lib/`, `target/`, `node_modules/`, etc.
- **Config files**: `.eslintrc`, `tsconfig.json`, `.vscode/`, etc.
- **Lock files**: `package-lock.json`, `Cargo.lock`, `yarn.lock`, etc.

### 2. Rule Library
**Purpose**: Maintain comprehensive ignore patterns for different technologies

```typescript
interface IgnoreRule {
  pattern: string;
  description: string;
  category: 'build' | 'cache' | 'editor' | 'test' | 'log' | 'temp';
  priority: 'critical' | 'recommended' | 'optional';
  technologies: Technology[];
  examples?: string[];
}

interface RuleSet {
  technology: Technology;
  rules: IgnoreRule[];
  conflicts?: string[];
  alternatives?: Map<string, string>;
}
```

**Rule Categories**:
- **Build Artifacts**: `dist/`, `target/`, `*.o`, `*.exe`
- **Package Caches**: `node_modules/`, `.cargo/`, `.ivy2/`
- **Test Output**: `coverage/`, `.nyc_output/`, `target/surefire-reports/`
- **Editor Files**: `.vscode/`, `.idea/`, `*.swp`
- **OS Files**: `.DS_Store`, `Thumbs.db`, `desktop.ini`
- **Logs**: `*.log`, `npm-debug.log*`, `yarn-error.log*`
- **Temporary**: `*.tmp`, `*~`, `.#*`

### 3. GitIgnore Parser
**Purpose**: Parse, validate, and manipulate .gitignore files

```typescript
interface GitIgnoreEntry {
  pattern: string;
  comment?: string;
  lineNumber: number;
  isNegation: boolean;
  isValid: boolean;
}

class GitIgnoreParser {
  parse(content: string): GitIgnoreEntry[]
  validate(entry: GitIgnoreEntry): ValidationResult
  format(entries: GitIgnoreEntry[]): string
  addRules(rules: IgnoreRule[], preserveStructure: boolean): string
  detectConflicts(entries: GitIgnoreEntry[]): Conflict[]
}
```

### 4. Pattern Engine
**Purpose**: Match files against patterns and validate effectiveness

```typescript
class PatternEngine {
  testPattern(pattern: string, filePath: string): boolean
  validateSyntax(pattern: string): ValidationResult
  findConflicts(patterns: string[]): Conflict[]
  optimizePatterns(patterns: string[]): string[]
  suggestAlternatives(pattern: string): string[]
}
```

### 5. Audit Engine
**Purpose**: Compare existing .gitignore against recommended patterns

```typescript
interface AuditResult {
  missing: IgnoreRule[];
  invalid: GitIgnoreEntry[];
  conflicts: Conflict[];
  redundant: GitIgnoreEntry[];
  suggestions: Suggestion[];
  score: number; // 0-100
}

class AuditEngine {
  async audit(projectPath: string): Promise<AuditResult>
  calculateScore(result: AuditResult): number
  generateReport(result: AuditResult): string
  createFixPlan(result: AuditResult): FixPlan
}
```

## CLI Interface Design

### Commands

**🔄 LEVERAGE EXISTING**: Integrate with existing CLI in `src/cli/main.ts`

```bash
# Main command integration
claude-setup --gitignore-audit           # Add to existing setup flow

# New subcommand structure  
claude-setup gitignore audit             # Standalone audit
claude-setup gitignore audit --verbose   # Detailed report
claude-setup gitignore fix --dry-run     # Preview fixes
claude-setup gitignore fix --interactive # Selective fixes
claude-setup gitignore fix --auto        # Apply all fixes
claude-setup gitignore test <file>       # Test pattern matching
```

**CLI Integration Points**:
- Add `--gitignore-audit` flag to existing `CLIFlags` interface
- Extend `PrimaryMode` type with `'gitignore'`
- Hook into `SetupOrchestrator` workflow

### Output Format

```
🔍 GitIgnore Audit Results

Project Analysis:
✓ JavaScript/TypeScript detected
✓ Node.js build tools found
✓ VS Code workspace detected

Current Score: 75/100

Missing Patterns (5):
❌ *.tgz                 - NPM package artifacts
❌ npm-debug.log*        - NPM debug logs  
❌ .vscode/             - VS Code settings
❌ *.swp                - Vim temporary files
❌ coverage/tmp/        - Test coverage temp files

Invalid Patterns (1):
⚠️  Line 15: '*.log*'   - Redundant wildcard

Conflicts (0):
✓ No pattern conflicts detected

Recommendations:
1. Add missing critical patterns (4)
2. Fix invalid pattern syntax (1)
3. Consider organizing by category

Run 'claude-setup gitignore fix' to apply recommended changes.
```

## Rule Library Structure

### File Organization
```
src/lib/gitignore/
├── rules/
│   ├── javascript.ts
│   ├── python.ts
│   ├── golang.ts
│   ├── rust.ts
│   ├── java.ts
│   ├── swift.ts
│   ├── editors.ts
│   ├── build-tools.ts
│   └── operating-systems.ts
├── engine/
│   ├── scanner.ts
│   ├── parser.ts
│   ├── auditor.ts
│   └── fixer.ts
└── cli/
    └── gitignore-commands.ts
```

### Example Rule Definition
```typescript
// rules/javascript.ts
export const JavaScriptRules: RuleSet = {
  technology: 'javascript',
  rules: [
    {
      pattern: 'node_modules/',
      description: 'NPM dependencies',
      category: 'cache',
      priority: 'critical',
      technologies: ['javascript', 'typescript']
    },
    {
      pattern: '*.tgz',
      description: 'NPM package archives',
      category: 'build',
      priority: 'recommended',
      technologies: ['javascript']
    },
    {
      pattern: 'npm-debug.log*',
      description: 'NPM debug logs',
      category: 'log',
      priority: 'recommended',
      technologies: ['javascript']
    }
  ],
  conflicts: ['!node_modules/some-needed-file'],
  alternatives: new Map([
    ['*.log', 'npm-debug.log*'] // More specific pattern
  ])
};
```

## Integration Points

### 1. Main Setup Workflow
```typescript
// Integrate into main setup process
class SetupOrchestrator {
  async setupProject(config: CLIConfig): Promise<void> {
    // ... existing setup
    
    // Add gitignore audit
    if (config.auditGitignore !== false) {
      const auditor = new GitIgnoreAuditor();
      const result = await auditor.audit('.');
      
      if (result.score < 80) {
        await this.promptGitIgnoreFixes(result);
      }
    }
  }
}
```

### 2. Pre-commit Hook
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Check gitignore completeness
npx claude-setup gitignore audit --threshold 80 --quiet
```

### 3. Custom Commands
```typescript
// Add to .claude/commands/gitignore.md
export const gitignoreCommand = {
  name: 'gitignore',
  description: 'Audit and fix .gitignore patterns',
  examples: [
    'claude-setup gitignore audit',
    'claude-setup gitignore fix --interactive'
  ]
};
```

## Error Handling & Edge Cases

### 1. Missing .gitignore
- Create new file with recommended patterns
- Use technology-specific templates
- Prompt user for confirmation

### 2. Permission Issues
- Graceful degradation to read-only audit
- Clear error messages with suggested fixes
- Fallback to user directory patterns

### 3. Unknown Technologies
- Fallback to common patterns (OS, editors)
- Prompt user to specify technology manually
- Allow custom rule definitions

### 4. Large Repositories
- Configurable scan depth and file limits
- Progress reporting for long operations
- Intelligent exclusion of obvious directories

## Testing Strategy

### 1. Unit Tests
- Rule validation and pattern matching
- Parser accuracy with various .gitignore formats
- Scanner detection reliability

### 2. Integration Tests
- End-to-end audit and fix workflows
- CLI command functionality
- File system operations

### 3. Fixture Tests
- Real-world project samples
- Technology-specific test repositories
- Edge case scenarios

### 4. Performance Tests
- Large repository handling
- Pattern matching efficiency
- Memory usage validation

## Future Enhancements

### 1. Advanced Features
- Git history analysis for ignored files
- Custom rule sharing and templates
- IDE integration and live validation

### 2. Reporting
- Team-wide gitignore consistency reports
- Trend analysis and recommendations
- Integration with code quality metrics

### 3. Cloud Integration
- Shared rule repositories
- Community-maintained patterns
- Automatic rule updates