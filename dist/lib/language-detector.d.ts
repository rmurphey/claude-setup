/**
 * Smart language detection with best-guess verification approach
 * Scans project files and makes educated guesses for user confirmation
 * Can use config file for cached detection results
 */
export class LanguageDetector {
    constructor(configPath?: string);
    configPath: string;
    config: any;
    detectionPatterns: {
        language: string;
        name: string;
        files: string[];
        extensions: string[];
        confidence: string;
    }[];
    /**
     * Detect languages in current directory
     * Returns array of detected languages with confidence scores
     */
    detectLanguages(): Promise<{
        evidence: {
            foundFiles: never[];
            foundExtensions: never[];
            fileCount: number;
            score: number;
        };
        score: number;
        language: string;
        name: string;
        files: string[];
        extensions: string[];
        confidence: string;
    }[]>;
    /**
     * Gather evidence for a specific language pattern
     */
    gatherEvidence(pattern: any): Promise<{
        foundFiles: never[];
        foundExtensions: never[];
        fileCount: number;
        score: number;
    }>;
    /**
     * Find source files with given extensions (optimized for speed)
     */
    findSourceFiles(extensions: any): Promise<{
        extensions: never[];
        count: number;
    }>;
    /**
     * Count files with given extensions in a directory (optimized)
     */
    countFilesInDirectory(dirPath: any, extensions: any, maxDepth?: number, maxFiles?: number): Promise<number>;
    /**
     * Directories to skip during detection
     */
    shouldSkipDirectory(name: any): any;
    /**
     * Load config file if it exists
     */
    loadConfig(): Promise<any>;
    /**
     * Save config file with detection results
     */
    saveConfig(detection: any, setup?: {}): Promise<boolean>;
    /**
     * Get the best guess for language detection
     * Uses cached config if available and fresh, otherwise runs detection
     */
    getBestGuess(useCache?: boolean): Promise<{
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
    } | null>;
    /**
     * Check if config is fresh (less than 24 hours old)
     */
    isConfigFresh(config: any): boolean;
    /**
     * Format evidence for display to user
     */
    formatEvidence(evidence: any): string;
}
//# sourceMappingURL=language-detector.d.ts.map