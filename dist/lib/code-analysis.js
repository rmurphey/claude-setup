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
        return await this.analyzer.analyzeCodebase();
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