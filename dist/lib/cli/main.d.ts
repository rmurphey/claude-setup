/**
 * Main CLI orchestrator - handles argument parsing and routing
 */
export class CLIMain {
    args: any[];
    supportedFlags: Set<string>;
    flagConflicts: Map<string, string[]>;
    flagDependencies: Map<string, string[]>;
    /**
     * Parse command line arguments and return structured configuration
     */
    parseArgs(argv?: string[]): {
        help: boolean;
        version: boolean;
        fix: boolean;
        dryRun: boolean;
        autoFix: boolean;
        detectLanguage: boolean;
        config: boolean;
        syncIssues: boolean;
        devcontainer: boolean;
        force: boolean;
        noSave: boolean;
        show: boolean;
        reset: boolean;
        language: any;
    };
    /**
     * Extract value for flags that take parameters (e.g., --language=js or --language js)
     */
    extractFlagValue(argv: any, flag: any): any;
    /**
     * Validate command line arguments for unknown flags and basic syntax
     */
    validateArgs(argv: any): void;
    /**
     * Validate flag combinations for conflicts and dependencies
     */
    validateFlagCombinations(config: any): void;
    /**
     * Convert config key back to flag name for validation
     */
    configKeyToFlag(key: any): any;
    /**
     * Check if language value is valid
     */
    isValidLanguage(language: any): boolean;
    /**
     * Main CLI entry point - routes to appropriate mode
     */
    runCLI(argv: any): Promise<void>;
    /**
     * Route to the appropriate mode based on parsed configuration
     */
    routeToMode(config: any): Promise<void>;
    /**
     * Determine the primary mode from configuration
     */
    determinePrimaryMode(config: any): "setup" | "recovery" | "devcontainer" | "language-detection" | "configuration" | "sync-issues";
    /**
     * Run recovery mode
     */
    runRecoveryMode(): Promise<void>;
    /**
     * Run language detection mode
     */
    runLanguageDetectionMode(): Promise<void>;
    /**
     * Run configuration management mode
     */
    runConfigurationMode(): Promise<void>;
    /**
     * Run GitHub issues sync mode
     */
    runSyncIssuesMode(): Promise<void>;
    /**
     * Run DevContainer mode - delegated to SetupOrchestrator
     */
    runDevContainerMode(config: any): Promise<void>;
    /**
     * Run interactive setup mode (default) - delegated to SetupOrchestrator
     */
    runSetupMode(config: any): Promise<void>;
    /**
     * Show help information
     */
    showHelp(): void;
    /**
     * Show version information
     */
    showVersion(): Promise<void>;
}
//# sourceMappingURL=main.d.ts.map