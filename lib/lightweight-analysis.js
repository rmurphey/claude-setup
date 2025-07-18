/**
 * Lightweight code analysis using simple text patterns
 * 
 * Fast, reliable, no AST parsing, no dependencies
 * Perfect for basic project insights and development recommendations
 */
import path from 'path';

import fs from 'fs-extra';

export class LightweightAnalyzer {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Analyze the entire codebase using simple text patterns
   */
  async analyzeCodebase() {
    const files = await this.findCodeFiles();
    const analysis = {
      files: [],
      summary: {
        totalFiles: 0,
        totalLines: 0,
        languages: new Set(),
        complexity: {
          functions: [],
          totalComplexity: 0
        }
      }
    };

    for (const filePath of files) {
      try {
        const fileAnalysis = await this.analyzeFile(filePath);
        analysis.files.push(fileAnalysis);
        
        // Update summary
        analysis.summary.totalFiles++;
        analysis.summary.totalLines += fileAnalysis.lines;
        analysis.summary.languages.add(fileAnalysis.language);
        
        if (fileAnalysis.functions) {
          analysis.summary.complexity.functions.push(...fileAnalysis.functions);
          analysis.summary.complexity.totalComplexity += fileAnalysis.complexity || 0;
        }
      } catch (error) {
        console.warn(`Analysis failed for ${filePath}: ${error.message}`);
      }
    }

    // Convert Set to Array for JSON serialization
    analysis.summary.languages = Array.from(analysis.summary.languages);
    
    return analysis;
  }

  /**
   * Find all code files in the project
   */
  async findCodeFiles() {
    const files = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.go', '.rs', '.java'];
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', 'target', '__pycache__', '.vscode'];

    const scanDir = async (dir) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          if (!excludeDirs.includes(entry.name) && !entry.name.startsWith('.')) {
            await scanDir(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    await scanDir(this.projectRoot);
    return files;
  }

  /**
   * Analyze a single file using simple patterns
   */
  async analyzeFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(this.projectRoot, filePath);
    const language = this.detectLanguage(filePath);

    const analysis = {
      path: relativePath,
      language,
      lines: content.split('\n').length,
      complexity: this.estimateComplexity(content),
      functions: this.countFunctions(content, language),
      classes: this.countClasses(content, language),
      imports: this.countImports(content, language),
      tests: this.findTests(content, language),
      apis: this.findAPIs(content, language)
    };

    return analysis;
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java'
    };
    return langMap[ext] || 'unknown';
  }

  /**
   * Count functions across languages
   */
  countFunctions(content, language) {
    const patterns = {
      javascript: [/function\s+(\w+)/g, /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g, /(\w+)\s*:\s*function/g],
      typescript: [/function\s+(\w+)/g, /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g, /(\w+)\s*:\s*function/g],
      python: [/^def\s+(\w+)/gm],
      go: [/^func\s+(\w+)/gm],
      rust: [/^fn\s+(\w+)/gm],
      java: [/public\s+\w+\s+(\w+)\s*\(/g, /private\s+\w+\s+(\w+)\s*\(/g, /protected\s+\w+\s+(\w+)\s*\(/g]
    };

    const langPatterns = patterns[language] || [];
    const functions = [];

    langPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        functions.push({
          name: match[1],
          complexity: 1 // Basic complexity
        });
      }
    });

    return functions;
  }

  /**
   * Count classes across languages
   */
  countClasses(content, language) {
    const patterns = {
      javascript: [/class\s+(\w+)/g],
      typescript: [/class\s+(\w+)/g, /interface\s+(\w+)/g],
      python: [/^class\s+(\w+)/gm],
      go: [/^type\s+(\w+)\s+struct/gm],
      rust: [/^struct\s+(\w+)/gm, /^enum\s+(\w+)/gm],
      java: [/class\s+(\w+)/g, /interface\s+(\w+)/g, /enum\s+(\w+)/g]
    };

    const langPatterns = patterns[language] || [];
    const classes = [];

    langPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        classes.push({ name: match[1] });
      }
    });

    return classes;
  }

  /**
   * Count imports across languages
   */
  countImports(content, language) {
    const patterns = {
      javascript: [/^import\s+.+$/gm, /^const\s+.+\s*=\s*require\(/gm],
      typescript: [/^import\s+.+$/gm],
      python: [/^import\s+.+$/gm, /^from\s+.+\s+import\s+.+$/gm],
      go: [/^import\s+/gm],
      rust: [/^use\s+.+;$/gm, /^extern\s+crate\s+.+;$/gm],
      java: [/^import\s+.+;$/gm]
    };

    const langPatterns = patterns[language] || [];
    let importCount = 0;

    langPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) importCount += matches.length;
    });

    return importCount;
  }

  /**
   * Find test code patterns
   */
  findTests(content, language) {
    const patterns = {
      javascript: [/describe\s*\(/g, /it\s*\(/g, /test\s*\(/g, /\.test\./g, /\.spec\./g],
      typescript: [/describe\s*\(/g, /it\s*\(/g, /test\s*\(/g, /\.test\./g, /\.spec\./g],
      python: [/^def\s+test_/gm, /^class\s+Test/gm, /@pytest\.mark/gm],
      go: [/^func\s+Test/gm, /^func\s+Benchmark/gm],
      rust: [/#\[test\]/gm, /#\[cfg\(test\)\]/gm],
      java: [/@Test/gm, /@Before/gm, /@After/gm]
    };

    const langPatterns = patterns[language] || [];
    let testCount = 0;

    langPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) testCount += matches.length;
    });

    return testCount;
  }

  /**
   * Find API endpoint patterns
   */
  findAPIs(content, language) {
    const patterns = {
      javascript: [/@app\.(get|post|put|delete)/g, /app\.(get|post|put|delete)/g, /router\.(get|post|put|delete)/g],
      typescript: [/@app\.(get|post|put|delete)/g, /app\.(get|post|put|delete)/g, /router\.(get|post|put|delete)/g],
      python: [/@app\.route/g, /@app\.(get|post|put|delete)/g],
      go: [/\.HandleFunc/g, /\.GET\(/g, /\.POST\(/g, /\.PUT\(/g, /\.DELETE\(/g],
      rust: [/\.route\(/g, /\.get\(/g, /\.post\(/g, /\.put\(/g, /\.delete\(/g],
      java: [/@RequestMapping/g, /@GetMapping/g, /@PostMapping/g, /@PutMapping/g, /@DeleteMapping/g]
    };

    const langPatterns = patterns[language] || [];
    let apiCount = 0;

    langPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) apiCount += matches.length;
    });

    return apiCount;
  }

  /**
   * Estimate code complexity using simple heuristics
   */
  estimateComplexity(content) {
    // Count control flow statements
    const complexityPatterns = [
      /\bif\b/g, /\belse\b/g, /\belif\b/g, /\belse\s+if\b/g,
      /\bfor\b/g, /\bwhile\b/g, /\bdo\b/g,
      /\btry\b/g, /\bcatch\b/g, /\bexcept\b/g, /\bfinally\b/g,
      /\bswitch\b/g, /\bcase\b/g, /\bmatch\b/g,
      /&&/g, /\|\|/g, /\band\b/g, /\bor\b/g,
      /\?\s*:/g // ternary operator
    ];

    let complexity = 1; // Base complexity
    complexityPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) complexity += matches.length;
    });

    return complexity;
  }

  /**
   * Generate development insights from analysis
   */
  generateInsights(analysis) {
    const insights = {
      architecture: [],
      quality: [],
      testing: [],
      maintenance: []
    };

    // Multi-language insight
    if (analysis.summary.languages.length > 1) {
      insights.architecture.push({
        type: 'multi-language',
        message: `Multi-language project: ${analysis.summary.languages.join(', ')}`
      });
    }

    // File size insights
    const largeFiles = analysis.files.filter(f => f.lines > 400);
    if (largeFiles.length > 0) {
      insights.quality.push({
        type: 'file-size',
        message: `${largeFiles.length} files exceed 400 lines - consider splitting`
      });
    }

    // Function complexity insights
    const complexFunctions = analysis.summary.complexity.functions.filter(f => f.complexity > 10);
    if (complexFunctions.length > 0) {
      insights.quality.push({
        type: 'complexity',
        message: `${complexFunctions.length} functions have high complexity - consider refactoring`
      });
    }

    // Test coverage insights
    const testFiles = analysis.files.filter(f => f.tests > 0);
    const testCoverage = testFiles.length / analysis.summary.totalFiles;
    if (testCoverage < 0.3) {
      insights.testing.push({
        type: 'coverage',
        message: `Low test coverage: ${Math.round(testCoverage * 100)}% of files have tests`
      });
    }

    // API insights
    const apiFiles = analysis.files.filter(f => f.apis > 0);
    if (apiFiles.length > 0) {
      insights.architecture.push({
        type: 'api',
        message: `${apiFiles.length} files contain API endpoints`
      });
    }

    return insights;
  }
}

export default LightweightAnalyzer;