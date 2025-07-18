/**
 * Interactive setup handler - manages user prompts and configuration
 */
export class InteractiveSetup {
    modeQuestion: {
        type: string;
        name: string;
        message: string;
        choices: {
            name: string;
            value: string;
        }[];
    };
    baseQuestions: ({
        type: string;
        name: string;
        message: string;
        choices: {
            name: string;
            value: string;
        }[];
        default?: never;
    } | {
        type: string;
        name: string;
        message: string;
        default: boolean;
        choices?: never;
    })[];
    validProjectTypes: string[];
    validQualityLevels: string[];
    validTeamSizes: string[];
    /**
     * Build smart questions with language detection and verification
     */
    buildSmartQuestions(): Promise<{
        smartQuestions: ({
            type: string;
            name: string;
            message: string;
            default: boolean;
            choices?: never;
        } | {
            type: string;
            name: string;
            message: string;
            choices: any[];
        } | undefined)[];
        detection: {
            type: string;
            language: any;
            name: any;
            confidence: any;
            evidence: any;
            source: string;
            candidates?: never;
        } | {
            type: string;
            candidates: {
                language: string;
                name: string;
                score: number;
                evidence: {
                    foundFiles: never[];
                    foundExtensions: never[];
                    fileCount: number;
                    score: number;
                };
            }[];
            source: string;
            language?: never;
            name?: never;
            confidence?: never;
            evidence?: never;
        } | null;
    }>;
    /**
     * Process smart question answers to normalize project type
     */
    processSmartAnswers(answers: any, detection: any): any;
    /**
     * Validate user input configuration
     */
    validateConfiguration(config: any): string[];
    /**
     * Sanitize and normalize configuration values
     */
    sanitizeConfiguration(config: any): any;
    /**
     * Run the interactive setup process with enhanced validation
     */
    runInteractiveSetup(options?: {}): Promise<void>;
    /**
     * Handle setup mode with smart language detection and validation
     */
    runSetupMode(): Promise<void>;
}
//# sourceMappingURL=interactive.d.ts.map