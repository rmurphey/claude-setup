import { baseConfig } from './base.js';

export const strictConfig = {
  ...baseConfig,
  rules: {
    ...baseConfig.rules,
    
    // Stricter formatting rules
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'max-len': ['error', { 'code': 100, 'tabWidth': 2 }],
    'no-trailing-spaces': 'error',
    'eol-last': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    'keyword-spacing': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    
    // Strict import/export rules
    'import/no-default-export': 'error',
    'import/prefer-default-export': 'off',
    'import/no-namespace': 'error',
    'import/no-mutable-exports': 'error',
    'import/group-exports': 'error',
    
    // Additional strict rules
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error'
  }
};

export default [
  {
    ...strictConfig,
    name: 'strict-quality-level'
  }
];