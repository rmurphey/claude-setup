import js from '@eslint/js';
import importPlugin from 'eslint-plugin-import';
export const baseConfig = {
    languageOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        globals: {
            console: 'readonly',
            process: 'readonly',
            Buffer: 'readonly',
            __dirname: 'readonly',
            __filename: 'readonly',
            global: 'readonly',
            module: 'readonly',
            require: 'readonly',
            exports: 'readonly'
        }
    },
    plugins: {
        import: importPlugin
    },
    rules: {
        // Core JavaScript rules
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': 'off',
        'semi': ['error', 'always'],
        'quotes': ['error', 'single'],
        // Import/Export validation rules
        'import/no-unresolved': 'error',
        'import/named': 'error',
        'import/default': 'error',
        'import/namespace': 'error',
        'import/no-absolute-path': 'error',
        'import/no-dynamic-require': 'error',
        'import/no-self-import': 'error',
        'import/no-cycle': 'error',
        'import/no-useless-path-segments': 'error',
        // ES Module syntax validation
        'import/no-commonjs': 'error',
        'import/no-amd': 'error',
        'import/first': 'error',
        'import/exports-last': 'error',
        'import/no-duplicates': 'error',
        'import/order': ['error', {
                'groups': [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index'
                ],
                'newlines-between': 'always'
            }]
    }
};
export default [js.configs.recommended, baseConfig];
//# sourceMappingURL=base.js.map