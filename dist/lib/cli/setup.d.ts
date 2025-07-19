import type { CLIConfig } from '../../types/index.js';
import type { DetectionGuess } from '../language-detector.js';
interface DevContainerConfig {
    name: string;
    image: string;
    features?: Record<string, unknown>;
    customizations?: {
        vscode?: {
            extensions?: string[];
        };
    };
    forwardPorts?: number[];
    portsAttributes?: Record<string, {
        label: string;
    }>;
    onCreateCommand?: string;
    postCreateCommand?: string;
    remoteUser?: string;
    waitFor?: string;
}
/**
 * Setup orchestrator - coordinates different setup modes
 */
export declare class SetupOrchestrator {
    private readonly languageModules;
    constructor();
    /**
     * Run the main setup mode - moved from main.js
     */
    runSetupMode(config: CLIConfig, detection?: DetectionGuess): Promise<void>;
    /**
     * Run recovery mode - moved from main.js
     */
    runRecoveryMode(): Promise<void>;
    /**
     * Run DevContainer mode
     */
    runDevContainerMode(): Promise<void>;
    /**
     * Main project setup orchestration
     */
    setupProject(config: CLIConfig): Promise<void>;
    /**
     * Initialize git repository
     */
    initializeGitRepository(): Promise<void>;
    /**
     * Create project documentation
     */
    createDocumentation(config: CLIConfig): Promise<void>;
    /**
     * Setup language-specific tools
     */
    setupLanguage(config: CLIConfig): Promise<void>;
    /**
     * Copy utility libraries
     */
    copyUtilityLibraries(): Promise<void>;
    /**
     * Setup custom commands
     */
    setupCommands(): Promise<void>;
    /**
     * Setup CI/CD workflows
     */
    setupCICD(config: CLIConfig): Promise<void>;
    /**
     * Create initial commit
     */
    createInitialCommit(config: CLIConfig): Promise<void>;
    /**
     * Generate DevContainer configuration
     */
    generateDevContainer(projectType: string): Promise<void>;
    /**
     * Generate Claude template
     */
    generateClaudeTemplate(config: CLIConfig): string;
    /**
     * Generate Active Work template
     */
    generateActiveWorkTemplate(config: CLIConfig): string;
    /**
     * Generate gitignore file
     */
    generateGitignore(projectType: string): string;
    /**
     * Generate GitHub Actions workflow
     */
    generateGitHubActions(config: CLIConfig): string;
    /**
     * Get DevContainer configuration
     */
    getDevContainerConfig(projectType: string): DevContainerConfig;
}
export declare function generateClaudeTemplate(config: CLIConfig): string;
export declare function generateActiveWorkTemplate(config: CLIConfig): string;
export declare function generateGitignore(projectType: string): string;
export declare function getDevContainerConfig(projectType: string): DevContainerConfig;
export {};
//# sourceMappingURL=setup.d.ts.map