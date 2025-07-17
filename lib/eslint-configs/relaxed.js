import { baseConfig } from './base.js';

export const relaxedConfig = {
  ...baseConfig,
  rules: {
    // Only critical rules - focus on syntax errors and major issues
    'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    'no-console': 'off',
    'semi': ['warn', 'always'],
    'quotes': ['warn', 'single'],
    
    // Essential import/export rules only
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/no-self-import': 'error',
    'import/no-cycle': 'warn',
    'import/no-duplicates': 'warn',
    
    // Allow flexibility in formatting
    'indent': 'off',
    'max-len': 'off',
    'no-trailing-spaces': 'warn',
    'eol-last': 'off',
    'comma-dangle': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off'
  }
};

export default [
  {
    ...relaxedConfig,
    name: 'relaxed-quality-level'
  }
];