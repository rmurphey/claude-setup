// @ts-ignore - importing from JavaScript file that hasn't been migrated yet
import { LightweightAnalyzer } from '../../lib/lightweight-analysis.js';

export interface FunctionInfo {
  name: string;
  complexity: number;
}

export interface ClassInfo {
  name: string;
}

export interface FileAnalysis {
  path: string;
  language: string;
  lines: number;
  complexity: number;
  functions: FunctionInfo[];
  classes: ClassInfo[];
  imports: number;
  tests: number;
  apis: number;
}

export interface CodebaseComplexity {
  functions: FunctionInfo[];
  totalComplexity: number;
}

export interface CodebaseSummary {
  totalFiles: number;
  totalLines: number;
  languages: string[];
  complexity: CodebaseComplexity;
}

export interface CodebaseAnalysis {
  files: FileAnalysis[];
  summary: CodebaseSummary;
}

export interface Insight {
  type: string;
  message: string;
}

export interface DevelopmentInsights {
  architecture: Insight[];
  quality: Insight[];
  testing: Insight[];
  maintenance: Insight[];
}

/**
 * Simplified code analysis using lightweight text patterns
 * 
 * Replaces complex AST parsing with fast, reliable text analysis
 */
export class CodeAnalyzer {
  private analyzer: LightweightAnalyzer;

  constructor(projectRoot: string = process.cwd()) {
    this.analyzer = new LightweightAnalyzer(projectRoot);
  }

  /**
   * Analyze the entire codebase and return structured insights
   */
  async analyzeCodebase(): Promise<CodebaseAnalysis> {
    return await this.analyzer.analyzeCodebase();
  }

  /**
   * Generate development insights from analysis
   */
  generateInsights(analysis: CodebaseAnalysis): DevelopmentInsights {
    return this.analyzer.generateInsights(analysis);
  }
}

export default CodeAnalyzer;