# TypeScript Migration Design Document

## Overview

This design outlines the migration of the Claude Project Setup CLI tool from JavaScript to TypeScript. The migration will maintain all existing functionality while adding comprehensive type safety, improved developer experience, and better maintainability. The approach prioritizes strict typing without falling back to `any` types.

## Architecture

### Build System Design

The TypeScript migration will use a dual-output approach:
- **Source**: TypeScript files in existing directory structure
- **Output**: Compiled JavaScript files for runtime execution
- **Distribution**: NPM package continues to ship compiled JavaScript

```
Project Structure (Post-Migration):
├── src/                    # TypeScript source files (mirrors current lib/)
│   ├── cli/
│   ├── languages/
│   └── *.ts
├── dist/                   # Compiled JavaScript output
│   ├── cli/
│   ├── languages/
│   └── *.js
├── bin/cli.js             # Entry point (updated imports)
├── tsconfig.json          # TypeScript configuration
└── package.json           # Updated scripts and dependencies
```

### Module System Preservation

The current ES modules architecture will be preserved:
- TypeScript will compile to ES modules (not CommonJS)
- Import/export statements remain unchanged in structure
- Node.js 16+ requirement maintained for ES module support

## Components and Interfaces

### Core Type Definitions

#### Language Detection Types
```typescript
interface LanguagePattern {
  language: string;
  name: string;
  files: string[];
  extensions: string[];
  confidence: 'high' | 'medium' | 'low';
}

interface DetectionResult {
  language: string;
  confidence: number;
  evidence: string[];
  suggested: boolean;
}
```

#### CLI Configuration Types
```typescript
interface CLIConfig {
  projectType: string;
  qualityLevel: 'strict' | 'standard' | 'relaxed';
  teamSize: 'solo' | 'small' | 'large';
  cicd: boolean;
  language?: string;
  dryRun?: boolean;
  autoFix?: boolean;
}

interface CLIFlags {
  help: boolean;
  version: boolean;
  fix: boolean;
  dryRun: boolean;
  detectLanguage: boolean;
  // ... other flags
}
```

#### GitHub Integration Types
```typescript
interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  assignees: string[];
}

interface GitHubAPIResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}
```

### Class Architecture Updates

#### LanguageDetector Class
```typescript
export class LanguageDetector {
  private configPath: string;
  private config: CLIConfig | null;
  private detectionPatterns: LanguagePattern[];

  constructor(configPath?: string);
  async detectLanguage(directory?: string): Promise<DetectionResult>;
  private scanDirectory(dir: string): Promise<string[]>;
  private calculateConfidence(evidence: string[]): number;
}
```

#### CLIMain Class
```typescript
export class CLIMain {
  private args: string[];
  private supportedFlags: Set<string>;
  private flagConflicts: Map<string, string[]>;
  private flagDependencies: Map<string, string[]>;

  parseArgs(argv?: string[]): CLIFlags;
  async runCLI(argv?: string[]): Promise<void>;
  private validateFlags(flags: CLIFlags): void;
}
```

### External Library Type Handling

#### Inquirer.js Types
```typescript
// Custom type definitions for inquirer prompts
interface InquirerPrompt {
  type: 'list' | 'confirm' | 'input' | 'checkbox';
  name: string;
  message: string;
  choices?: string[] | { name: string; value: string }[];
  default?: unknown;
}

interface InquirerAnswers {
  [key: string]: string | boolean | string[];
}
```

#### fs-extra Types
The existing `@types/fs-extra` package will be used, but custom interfaces will be created for complex file operations:

```typescript
interface FileOperationResult {
  success: boolean;
  path: string;
  error?: Error;
}

interface DirectoryAnalysis {
  files: string[];
  directories: string[];
  totalSize: number;
  languageFiles: Map<string, string[]>;
}
```

## Data Models

### Configuration Models

#### Project Configuration
```typescript
interface ProjectConfig {
  name: string;
  version: string;
  description?: string;
  language: string;
  qualityLevel: QualityLevel;
  teamSize: TeamSize;
  features: ProjectFeature[];
  customCommands: CustomCommand[];
}

type QualityLevel = 'strict' | 'standard' | 'relaxed';
type TeamSize = 'solo' | 'small' | 'large';

interface ProjectFeature {
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}
```

#### Template Models
```typescript
interface TemplateVariable {
  name: string;
  value: string;
  required: boolean;
}

interface TemplateConfig {
  source: string;
  destination: string;
  variables: TemplateVariable[];
  conditions?: TemplateCondition[];
}

interface TemplateCondition {
  field: string;
  operator: 'equals' | 'contains' | 'exists';
  value: unknown;
}
```

### Recovery System Models

```typescript
interface RecoveryAssessment {
  issues: RecoveryIssue[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedFixTime: number;
  autoFixable: boolean;
}

interface RecoveryIssue {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  autoFixable: boolean;
  fixCommand?: string;
}

interface RecoveryPlan {
  steps: RecoveryStep[];
  estimatedTime: number;
  requiresUserInput: boolean;
}

interface RecoveryStep {
  description: string;
  command: string;
  validation: string;
  rollback?: string;
}
```

## Error Handling

### Type-Safe Error Classes

```typescript
abstract class CLIError extends Error {
  abstract readonly code: string;
  abstract readonly severity: 'warning' | 'error' | 'fatal';
  
  constructor(message: string, public readonly context?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}

class LanguageDetectionError extends CLIError {
  readonly code = 'LANGUAGE_DETECTION_FAILED';
  readonly severity = 'error';
}

class ConfigurationError extends CLIError {
  readonly code = 'INVALID_CONFIGURATION';
  readonly severity = 'error';
}

class FileSystemError extends CLIError {
  readonly code = 'FILE_SYSTEM_ERROR';
  readonly severity = 'fatal';
}
```

### Error Handling Patterns

```typescript
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Usage in functions
async function detectLanguage(dir: string): Promise<Result<DetectionResult, LanguageDetectionError>> {
  try {
    const result = await performDetection(dir);
    return { success: true, data: result };
  } catch (error) {
    return { 
      success: false, 
      error: new LanguageDetectionError('Failed to detect language', { directory: dir })
    };
  }
}
```

## Testing Strategy

### TypeScript Test Configuration

The existing Node.js test runner will be enhanced to support TypeScript:

```typescript
// test-runner.config.ts
interface TestConfig {
  testMatch: string[];
  transform: Record<string, string>;
  moduleFileExtensions: string[];
  testEnvironment: 'node';
}

const config: TestConfig = {
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'typescript'
  },
  moduleFileExtensions: ['ts', 'js'],
  testEnvironment: 'node'
};
```

### Type Testing Approach

```typescript
// Type-only tests for complex interfaces
import type { CLIConfig, LanguagePattern } from '../src/types';

// Compile-time type checking tests
const validConfig: CLIConfig = {
  projectType: 'javascript',
  qualityLevel: 'strict',
  teamSize: 'small',
  cicd: true
};

// This should cause a TypeScript error if types are wrong
// const invalidConfig: CLIConfig = {
//   projectType: 'invalid',  // Should error
//   qualityLevel: 'unknown', // Should error
// };
```

### Test Migration Strategy

1. **Preserve Existing Tests**: All current test functionality remains unchanged
2. **Add Type Assertions**: Tests will include type checking where appropriate
3. **Mock Type Safety**: Mock objects will be properly typed
4. **Integration Testing**: End-to-end tests verify TypeScript compilation works

## TypeScript Configuration

### tsconfig.json Design

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": false,
    "skipLibCheck": false
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "__tests__",
    "coverage"
  ]
}
```

### ESLint TypeScript Integration

```typescript
// eslint.config.ts
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error'
    }
  }
];
```

## Migration Implementation Strategy

### Phase 1: Infrastructure Setup
- Install TypeScript and related dependencies
- Configure tsconfig.json with strict settings
- Update build scripts and package.json
- Configure ESLint for TypeScript

### Phase 2: Core Type Definitions
- Create comprehensive interface definitions
- Define error classes and result types
- Set up utility types and generics
- Create type declaration files for external libraries

### Phase 3: File-by-File Migration
- Convert files in dependency order (utilities first, then consumers)
- Add explicit type annotations to all functions
- Replace implicit types with explicit interfaces
- Ensure no `any` types remain

### Phase 4: Testing and Validation
- Update test configuration for TypeScript
- Verify all tests pass with TypeScript compilation
- Add type-specific tests where appropriate
- Validate CLI functionality remains identical

### Phase 5: Build Integration
- Update npm scripts for TypeScript compilation
- Configure development workflow with TypeScript
- Update documentation and README
- Verify NPX distribution works correctly

This design ensures a comprehensive TypeScript migration that maintains all existing functionality while providing robust type safety and improved developer experience.