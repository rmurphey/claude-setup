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
 * Main CLI orchestrator class
 */
export declare class CLIMain {
    /**
     * Parse command line arguments into configuration object
     */
    parseArgs(argv?: string[]): CLIFlags;
    /**
     * Custom validation layer for complex business rules that yargs built-in validation cannot handle
     */
    private validateComplexBusinessRules;
    /**
     * Main CLI execution method
     */
    runCLI(argv?: string[]): Promise<void>;
    /**
     * Determine primary mode based on flags
     */
    determinePrimaryMode(flags: CLIFlags): PrimaryMode;
    /**
     * Handle setup mode
     */
    private handleSetupMode;
    /**
     * Handle DevContainer mode
     */
    private handleDevContainerMode;
}
//# sourceMappingURL=main.d.ts.map