export interface CLIFlags {
    help: boolean;
    version: boolean;
    fix: boolean;
    dryRun: boolean;
    autoFix: boolean;
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
export type PrimaryMode = 'setup' | 'recovery' | 'language-detection' | 'configuration' | 'sync-issues' | 'devcontainer';
/**
 * Main CLI orchestrator class
 */
export declare class CLIMain {
    private supportedFlags;
    private flagConflicts;
    private flagDependencies;
    /**
     * Parse command line arguments into configuration object
     */
    parseArgs(argv?: string[]): CLIFlags;
    /**
     * Main CLI execution method
     */
    runCLI(argv?: string[]): Promise<void>;
    /**
     * Extract flag value from argument array (last occurrence wins)
     */
    extractFlagValue(argv: string[], flagName: string): string | null;
    /**
     * Validate flag combinations
     */
    private validateFlagCombinations;
    /**
     * Convert config key to flag name
     */
    private configKeyToFlag;
    /**
     * Determine primary mode based on flags
     */
    private determinePrimaryMode;
    /**
     * Check if language is valid
     */
    private isValidLanguage;
    /**
     * Show help information
     */
    private showHelp;
    /**
     * Show version information
     */
    private showVersion;
    /**
     * Handle recovery mode
     */
    private handleRecoveryMode;
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