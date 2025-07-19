# TypeScript Testing Configuration

This document describes the TypeScript testing setup for the Claude Project Setup CLI tool.

## Overview

The project supports both JavaScript and TypeScript test files through a dual-compilation approach:

- **JavaScript tests**: Located in `__tests__/**/*.js` - run directly by Node.js test runner
- **TypeScript tests**: Located in `__tests__/**/*.ts` - compiled to `dist-test/` then run by Node.js test runner

## Configuration Files

### tsconfig.test.json
Extends the main `tsconfig.json` with test-specific settings:
- Includes both `__tests__/` and `src/` directories
- Compiles to `dist-test/` directory
- Preserves source maps for debugging

### Package.json Scripts

- `npm run build:test` - Compile TypeScript test files
- `npm run test:type-check` - Type check test files without compilation
- `npm test` - Run all tests (JS and compiled TS)
- `npm run test:coverage` - Run tests with coverage reporting

## Writing TypeScript Tests

TypeScript test files should:

1. Use `.test.ts` extension
2. Import from Node.js test framework: `import { describe, test } from 'node:test'`
3. Import assertions: `import assert from 'node:assert'`
4. Use proper TypeScript types and interfaces

### Example TypeScript Test

```typescript
import { describe, test } from 'node:test';
import assert from 'node:assert';

describe('TypeScript Feature', () => {
  test('should support typed interfaces', () => {
    interface TestConfig {
      name: string;
      version: number;
    }

    const config: TestConfig = {
      name: 'test',
      version: 1
    };

    assert.strictEqual(config.name, 'test');
    assert.strictEqual(typeof config.version, 'number');
  });
});
```

## Build Process

1. **Pre-test**: `npm run build && npm run build:test`
   - Compiles TypeScript source files to `dist/`
   - Compiles TypeScript test files to `dist-test/`

2. **Test execution**: Node.js test runner processes:
   - `__tests__/**/*.js` (JavaScript tests)
   - `dist-test/__tests__/**/*.js` (compiled TypeScript tests)

3. **Coverage**: c8 covers both original and compiled files

## Import Patterns

- **Testing compiled TypeScript modules**: Import from `../dist/lib/module.js`
- **Testing original JavaScript modules**: Import from `../lib/module.js`
- **Node.js built-ins**: Import from `node:test`, `node:assert`, etc.

## Directory Structure

```
__tests__/
├── *.test.js          # JavaScript tests (run directly)
├── *.test.ts          # TypeScript tests (compiled first)
└── test-helpers.js    # Shared test utilities

dist-test/             # Compiled TypeScript tests (generated)
├── __tests__/
│   └── *.test.js      # Compiled from *.test.ts
└── src/               # Compiled source (for test imports)
```

## Type Checking

Run `npm run test:type-check` to verify TypeScript test files without compilation:
- Catches type errors early
- Validates test code against TypeScript strict mode
- Ensures proper typing of test utilities and mocks