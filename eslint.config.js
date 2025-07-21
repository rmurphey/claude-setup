import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

import baseConfig from './dist/lib/eslint-configs/base.js';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'dist-test/**', 'lib/**', 'coverage/**', 'node_modules/**']
  },
  {
    files: ['eslint.config.js'],
    rules: {
      'import/no-unresolved': 'off' // Allow TypeScript ESLint imports in config
    }
  },
  {
    files: ['templates/**/*.js', 'lib/cli/setup.js'],
    rules: {
      'import/exports-last': 'off'
    }
  },
  {
    files: ['src/**/*.ts'],
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
      // Disable base rules that are covered by TypeScript equivalents
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      
      // Disable import/no-unresolved for TypeScript files since TypeScript handles this
      'import/no-unresolved': 'off',
      
      // TypeScript rules that don't require type information
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      
      // TypeScript rules that require type information (disabled for now)
      // '@typescript-eslint/prefer-optional-chain': 'error'
    }
  },
  {
    files: ['__tests__/**/*.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.test.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    rules: {
      // Disable base rules that are covered by TypeScript equivalents
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      
      // Disable import/no-unresolved for TypeScript files since TypeScript handles this
      'import/no-unresolved': 'off',
      
      // TypeScript rules that don't require type information
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error'
    }
  },
  {
    files: ['src/types/**/*.ts'],
    rules: {
      // Allow 'any' in utility type definitions where it's necessary for advanced TypeScript patterns
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/*.test.ts', '**/*.spec.ts'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  }
];