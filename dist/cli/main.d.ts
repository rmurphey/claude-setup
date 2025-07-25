export interface CLIFlags {
    detectLanguage: boolean;
    config: boolean;
    show: boolean;
    reset: boolean;
    syncIssues: boolean;
    devcontainer: boolean;
    language?: string;
    force: boolean;
    noSave: boolean;
}
export type PrimaryMode = 'setup' | 'language-detection' | 'configuration' | 'sync-issues' | 'devcontainer';
/**
 * CLI orchestrator using yargs for argument parsing and validation
 */
export declare class CLIMain {
    parseArgs(argv?: string[]): CLIFlags;
    /**
     * Custom validation for complex business rules that yargs cannot handle
     */
    private validateComplexBusinessRules;
    runCLI(argv?: string[]): Promise<void>;
    determinePrimaryMode(flags: CLIFlags): PrimaryMode;
    private handleSetupMode;
    private handleDevContainerMode;
}
//# sourceMappingURL=main.d.ts.map