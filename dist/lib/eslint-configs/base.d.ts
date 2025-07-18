export namespace baseConfig {
    namespace languageOptions {
        let ecmaVersion: string;
        let sourceType: string;
        namespace globals {
            let console: string;
            let process: string;
            let Buffer: string;
            let __dirname: string;
            let __filename: string;
            let global: string;
            let module: string;
            let require: string;
            let exports: string;
        }
    }
    namespace plugins {
        export { importPlugin as import };
    }
    let rules: {
        'no-unused-vars': (string | {
            argsIgnorePattern: string;
        })[];
        'no-console': string;
        semi: string[];
        quotes: string[];
        'import/no-unresolved': string;
        'import/named': string;
        'import/default': string;
        'import/namespace': string;
        'import/no-absolute-path': string;
        'import/no-dynamic-require': string;
        'import/no-self-import': string;
        'import/no-cycle': string;
        'import/no-useless-path-segments': string;
        'import/no-commonjs': string;
        'import/no-amd': string;
        'import/first': string;
        'import/exports-last': string;
        'import/no-duplicates': string;
        'import/order': (string | {
            groups: string[];
            'newlines-between': string;
        })[];
    };
}
declare const _default: any[];
export default _default;
import importPlugin from 'eslint-plugin-import';
//# sourceMappingURL=base.d.ts.map