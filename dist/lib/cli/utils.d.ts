export interface ProjectStructureChecks {
    isDirectory: boolean;
    isWritable: boolean;
    hasGit: boolean;
}
export interface LanguageCommands {
    installCmd: string;
    lintCmd: string;
}
export type OutputType = 'success' | 'warning' | 'error' | 'info';
/**
 * CLI utilities - shared functions for CLI operations
 */
export declare class CLIUtils {
    /**
     * Format output with consistent styling
     */
    static formatOutput(message: string, type?: OutputType): string;
    /**
     * Validate basic project structure
     */
    static validateProjectStructure(projectPath?: string): Promise<ProjectStructureChecks>;
}
/**
 * Handle language detection command
 */
export declare function handleLanguageDetection(args: string[]): Promise<void>;
/**
 * Handle configuration management command
 */
export declare function handleConfigManagement(args: string[]): Promise<void>;
/**
 * Handle GitHub issues sync command
 */
export declare function handleSyncIssues(): Promise<void>;
/**
 * Get language-specific commands
 */
export declare function getLanguageCommands(projectType: string): Promise<LanguageCommands>;
//# sourceMappingURL=utils.d.ts.map