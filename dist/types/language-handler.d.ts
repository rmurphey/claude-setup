/**
 * Common interface for language-specific handlers
 */
export interface LanguageDetection {
    existingFiles: {
        packageJson?: boolean;
        pyprojectToml?: boolean;
        goMod?: boolean;
        cargoToml?: boolean;
        buildGradle?: boolean;
        pomXml?: boolean;
        packageSwift?: boolean;
        xcodeproj?: boolean;
        xcworkspace?: boolean;
        [key: string]: boolean | undefined;
    };
    language: string;
    confidence: number;
    evidence: string[];
}
export interface LanguageConfig {
    projectType: string;
    qualityLevel: 'strict' | 'standard' | 'relaxed';
    teamSize: 'solo' | 'small' | 'large';
    cicd: boolean;
    language?: string;
    dryRun?: boolean;
    autoFix?: boolean;
}
export interface LanguageHandler {
    readonly name: string;
    readonly installCommand: string;
    readonly lintCommand: string;
    readonly testCommand: string;
    setup(config: LanguageConfig, detection: LanguageDetection): Promise<void>;
}
export interface LanguageSetupResult {
    success: boolean;
    filesCreated: string[];
    warnings: string[];
    errors: string[];
}
//# sourceMappingURL=language-handler.d.ts.map