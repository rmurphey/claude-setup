// @ts-ignore - importing from JavaScript file that hasn't been migrated yet
import { LightweightAnalyzer } from '../../lib/lightweight-analysis.js';
/**
 * Simplified code analysis using lightweight text patterns
 *
 * Replaces complex AST parsing with fast, reliable text analysis
 */
export class CodeAnalyzer {
    analyzer;
    constructor(projectRoot = process.cwd()) {
        this.analyzer = new LightweightAnalyzer(projectRoot);
    }
    /**
     * Analyze the entire codebase and return structured insights
     */
    async analyzeCodebase() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await this.analyzer.analyzeCodebase();
        // Convert Set to array for TypeScript compatibility
        const analysis = {
            files: result.files || [],
            summary: {
                totalFiles: result.summary?.totalFiles || 0,
                totalLines: result.summary?.totalLines || 0,
                languages: result.summary?.languages instanceof Set
                    ? Array.from(result.summary.languages)
                    : result.summary?.languages || [],
                complexity: result.summary?.complexity || { functions: [], totalComplexity: 0 }
            }
        };
        return analysis;
    }
    /**
     * Generate development insights from analysis
     */
    generateInsights(analysis) {
        return this.analyzer.generateInsights(analysis);
    }
}
export default CodeAnalyzer;
//# sourceMappingURL=code-analysis.js.map