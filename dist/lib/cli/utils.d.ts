/**
 * Handle language detection command
 */
export function handleLanguageDetection(args: any): Promise<void>;
/**
 * Handle configuration management command
 */
export function handleConfigManagement(args: any): Promise<void>;
/**
 * Handle GitHub issues sync command
 */
export function handleSyncIssues(): Promise<void>;
/**
 * Get language-specific commands
 */
export function getLanguageCommands(projectType: any): Promise<{
    installCmd: any;
    lintCmd: any;
}>;
/**
 * CLI utilities - shared functions for CLI operations
 */
export class CLIUtils {
    /**
     * Format output with consistent styling
     */
    static formatOutput(message: any, type?: string): string;
    /**
     * Validate basic project structure
     */
    static validateProjectStructure(projectPath?: string): Promise<{
        isDirectory: boolean;
        isWritable: boolean;
        hasGit: boolean;
    }>;
}
//# sourceMappingURL=utils.d.ts.map