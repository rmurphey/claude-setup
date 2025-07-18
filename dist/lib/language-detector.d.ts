export interface DetectionPattern {
    language: string;
    name: string;
    files: string[];
    extensions: string[];
    confidence: 'high' | 'medium' | 'low';
}
export interface Evidence {
    foundFiles: string[];
    foundExtensions: string[];
    fileCount: number;
    score: number;
}
export interface DetectionResult extends DetectionPattern {
    evidence: Evidence;
    score: number;
}
export interface LanguageConfig {
    primary: string;
    name: string;
    confidence: string;
    detected: string;
    evidence: Evidence;
}
export interface DetectionConfig {
    skipDirectories: string[];
    maxDepth: number;
    maxFiles: number;
    timeout: number;
}
export interface SetupConfig {
    qualityLevel: string | null;
    teamSize: string | null;
    cicd: boolean;
    lastSetup: string | null;
}
export interface ProjectConfig {
    version: string;
    language: LanguageConfig;
    detection: DetectionConfig;
    setup: SetupConfig;
}
export interface SingleDetectionGuess {
    type: 'single';
    language: string;
    name: string;
    confidence: string;
    evidence: Evidence;
    source: 'config' | 'detection';
}
export interface MultipleDetectionGuess {
    type: 'multiple';
    candidates: Array<{
        language: string;
        name: string;
        score: number;
        evidence: Evidence;
    }>;
    source: 'detection';
}
export type DetectionGuess = SingleDetectionGuess | MultipleDetectionGuess | null;
export interface SourceFileResult {
    extensions: string[];
    count: number;
}
/**
 * Smart language detection with best-guess verification approach
 * Scans project files and makes educated guesses for user confirmation
 * Can use config file for cached detection results
 */
export declare class LanguageDetector {
    private configPath;
    private config;
    private detectionPatterns;
    constructor(configPath?: string);
    /**
     * Detect languages in current directory
     * Returns array of detected languages with confidence scores
     */
    detectLanguages(): Promise<DetectionResult[]>;
    /**
     * Gather evidence for a specific language pattern
     */
    gatherEvidence(pattern: DetectionPattern): Promise<Evidence>;
    /**
     * Find source files with given extensions (optimized for speed)
     */
    findSourceFiles(extensions: string[]): Promise<SourceFileResult>;
    /**
     * Count files with given extensions in a directory (optimized)
     */
    countFilesInDirectory(dirPath: string, extensions: string[], maxDepth?: number, maxFiles?: number): Promise<number>;
    /**
     * Directories to skip during detection
     */
    shouldSkipDirectory(name: string): boolean;
    /**
     * Load config file if it exists
     */
    loadConfig(): Promise<ProjectConfig>;
    /**
     * Save config file with detection results
     */
    saveConfig(detection: SingleDetectionGuess, setup?: Partial<SetupConfig>): Promise<boolean>;
    /**
     * Get the best guess for language detection
     * Uses cached config if available and fresh, otherwise runs detection
     */
    getBestGuess(useCache?: boolean): Promise<DetectionGuess>;
    /**
     * Check if config is fresh (less than 24 hours old)
     */
    isConfigFresh(config: ProjectConfig): boolean;
    /**
     * Format evidence for display to user
     */
    formatEvidence(evidence: Evidence): string;
}
//# sourceMappingURL=language-detector.d.ts.map