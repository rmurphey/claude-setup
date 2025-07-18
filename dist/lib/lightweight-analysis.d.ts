export class LightweightAnalyzer {
    constructor(projectRoot?: string);
    projectRoot: string;
    /**
     * Analyze the entire codebase using simple text patterns
     */
    analyzeCodebase(): Promise<{
        files: never[];
        summary: {
            totalFiles: number;
            totalLines: number;
            languages: Set<any>;
            complexity: {
                functions: never[];
                totalComplexity: number;
            };
        };
    }>;
    /**
     * Find all code files in the project
     */
    findCodeFiles(): Promise<any[]>;
    /**
     * Analyze a single file using simple patterns
     */
    analyzeFile(filePath: any): Promise<{
        path: string;
        language: any;
        lines: number;
        complexity: number;
        functions: any[];
        classes: any[];
        imports: number;
        tests: number;
        apis: number;
    }>;
    /**
     * Detect programming language from file extension
     */
    detectLanguage(filePath: any): any;
    /**
     * Count functions across languages
     */
    countFunctions(content: any, language: any): any[];
    /**
     * Count classes across languages
     */
    countClasses(content: any, language: any): any[];
    /**
     * Count imports across languages
     */
    countImports(content: any, language: any): number;
    /**
     * Find test code patterns
     */
    findTests(content: any, language: any): number;
    /**
     * Find API endpoint patterns
     */
    findAPIs(content: any, language: any): number;
    /**
     * Estimate code complexity using simple heuristics
     */
    estimateComplexity(content: any): number;
    /**
     * Generate development insights from analysis
     */
    generateInsights(analysis: any): {
        architecture: never[];
        quality: never[];
        testing: never[];
        maintenance: never[];
    };
}
export default LightweightAnalyzer;
//# sourceMappingURL=lightweight-analysis.d.ts.map