import type { CLIConfig, InquirerPrompt, InquirerAnswers, InteractiveSetupResult } from '../../types/index.js';
import type { DetectionGuess } from '../language-detector.js';
/**
 * Interactive setup handler - manages user prompts and configuration
 */
export declare class InteractiveSetup {
    private readonly modeQuestion;
    private readonly baseQuestions;
    private readonly validProjectTypes;
    private readonly validQualityLevels;
    private readonly validTeamSizes;
    constructor();
    /**
     * Build smart questions with language detection and verification
     */
    buildSmartQuestions(): Promise<{
        smartQuestions: InquirerPrompt[];
        detection: DetectionGuess;
    }>;
    /**
     * Process smart question answers to normalize project type
     */
    processSmartAnswers(answers: InquirerAnswers, detection: DetectionGuess): InquirerAnswers;
    /**
     * Validate user input configuration
     */
    validateConfiguration(config: Partial<CLIConfig>): string[];
    /**
     * Sanitize and normalize configuration values
     */
    sanitizeConfiguration(config: Partial<CLIConfig>): CLIConfig;
    /**
     * Run the interactive setup process with enhanced validation
     */
    runInteractiveSetup(options?: {
        languageOverride?: string;
    }): Promise<InteractiveSetupResult>;
    /**
     * Handle setup mode with smart language detection and validation
     */
    runSetupMode(): Promise<CLIConfig & {
        detection?: DetectionGuess;
    }>;
}
//# sourceMappingURL=interactive.d.ts.map