/**
 * Simplified code analysis using lightweight text patterns
 *
 * Replaces complex AST parsing with fast, reliable text analysis
 */
export class CodeAnalyzer {
    constructor(projectRoot?: string);
    analyzer: LightweightAnalyzer;
    /**
     * Analyze the entire codebase and return structured insights
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
     * Generate development insights from analysis
     */
    generateInsights(analysis: any): {
        architecture: never[];
        quality: never[];
        testing: never[];
        maintenance: never[];
    };
}
export default CodeAnalyzer;
import { LightweightAnalyzer } from './lightweight-analysis.js';
//# sourceMappingURL=code-analysis.d.ts.map