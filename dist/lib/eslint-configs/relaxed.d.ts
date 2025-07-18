export const relaxedConfig: {
    rules: {
        'no-unused-vars': (string | {
            argsIgnorePattern: string;
        })[];
        'no-console': string;
        semi: string[];
        quotes: string[];
        'import/no-unresolved': string;
        'import/named': string;
        'import/no-self-import': string;
        'import/no-cycle': string;
        'import/no-duplicates': string;
        indent: string;
        'max-len': string;
        'no-trailing-spaces': string;
        'eol-last': string;
        'comma-dangle': string;
        'object-curly-spacing': string;
        'array-bracket-spacing': string;
    };
    languageOptions: {
        ecmaVersion: string;
        sourceType: string;
        globals: {
            console: string;
            process: string;
            Buffer: string;
            __dirname: string;
            __filename: string;
            global: string;
            module: string;
            require: string;
            exports: string;
        };
    };
    plugins: {
        import: any;
    };
};
declare const _default: {
    name: string;
    rules: {
        'no-unused-vars': (string | {
            argsIgnorePattern: string;
        })[];
        'no-console': string;
        semi: string[];
        quotes: string[];
        'import/no-unresolved': string;
        'import/named': string;
        'import/no-self-import': string;
        'import/no-cycle': string;
        'import/no-duplicates': string;
        indent: string;
        'max-len': string;
        'no-trailing-spaces': string;
        'eol-last': string;
        'comma-dangle': string;
        'object-curly-spacing': string;
        'array-bracket-spacing': string;
    };
    languageOptions: {
        ecmaVersion: string;
        sourceType: string;
        globals: {
            console: string;
            process: string;
            Buffer: string;
            __dirname: string;
            __filename: string;
            global: string;
            module: string;
            require: string;
            exports: string;
        };
    };
    plugins: {
        import: any;
    };
}[];
export default _default;
//# sourceMappingURL=relaxed.d.ts.map