export type RuleLevel = 'off' | 'warn' | 'error' | 0 | 1 | 2;
export type RuleLevelAndOptions = [RuleLevel, ...unknown[]];
export interface ESLintRule {
    [key: string]: RuleLevel | RuleLevelAndOptions;
}
export interface ESLintConfig {
    name?: string;
    languageOptions?: {
        ecmaVersion?: 'latest' | number;
        sourceType?: 'script' | 'module';
        globals?: Record<string, boolean | 'readonly' | 'writable' | 'off'>;
        parser?: unknown;
        parserOptions?: Record<string, unknown>;
    };
    plugins?: Record<string, unknown>;
    rules?: ESLintRule;
}
export interface ImportOrderGroup {
    groups: Array<'builtin' | 'external' | 'internal' | 'parent' | 'sibling' | 'index'>;
    'newlines-between': 'always' | 'never' | 'ignore';
}
export declare const baseConfig: ESLintConfig;
declare const _default: ESLintConfig[];
export default _default;
//# sourceMappingURL=base.d.ts.map