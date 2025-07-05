import fs from 'fs-extra';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
// import { PythonParser } from './ast-parsers/python-parser.js';
// import { GoParser } from './ast-parsers/go-parser.js';
// import { RustParser } from './ast-parsers/rust-parser.js';

/**
 * AST-based code analysis for multiple languages
 */
export class CodeAnalyzer {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    // this.pythonParser = new PythonParser();
    // this.goParser = new GoParser();
    // this.rustParser = new RustParser();
  }

  /**
   * Analyze the entire codebase and return structured insights
   */
  async analyzeCodebase() {
    const analysis = {
      files: [],
      summary: {
        totalFiles: 0,
        totalLines: 0,
        languages: new Set(),
        complexity: {
          functions: [],
          classes: [],
          files: []
        },
        patterns: {
          exports: [],
          imports: [],
          apis: [],
          tests: []
        },
        architecture: {
          directories: [],
          modules: [],
          dependencies: []
        }
      }
    };

    // Get all code files
    const codeFiles = await this.findCodeFiles();
    
    for (const filePath of codeFiles) {
      try {
        const fileAnalysis = await this.analyzeFile(filePath);
        analysis.files.push(fileAnalysis);
        
        // Update summary
        analysis.summary.totalFiles++;
        analysis.summary.totalLines += fileAnalysis.lines;
        analysis.summary.languages.add(fileAnalysis.language);
        
        // Aggregate complexity
        analysis.summary.complexity.functions.push(...fileAnalysis.functions);
        analysis.summary.complexity.classes.push(...fileAnalysis.classes);
        analysis.summary.complexity.files.push({
          path: fileAnalysis.path,
          complexity: fileAnalysis.complexity,
          lines: fileAnalysis.lines
        });
        
        // Aggregate patterns
        analysis.summary.patterns.exports.push(...fileAnalysis.exports);
        analysis.summary.patterns.imports.push(...fileAnalysis.imports);
        analysis.summary.patterns.apis.push(...fileAnalysis.apis);
        analysis.summary.patterns.tests.push(...fileAnalysis.tests);
        
      } catch (error) {
        console.warn(`Skipping ${filePath}: ${error.message}`);
      }
    }

    // Convert Set to Array
    analysis.summary.languages = Array.from(analysis.summary.languages);
    
    return analysis;
  }

  /**
   * Find all code files in the project
   */
  async findCodeFiles() {
    const files = [];
    const extensions = [
      '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', // JavaScript/TypeScript
      '.py', '.pyx', '.pyi', // Python
      '.go', // Go
      '.rs', // Rust
      '.java', '.kt', // Java/Kotlin
      '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp' // C/C++
    ];
    
    async function walkDir(dir) {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          // Skip common directories
          if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage', 'target', '__pycache__'].includes(item)) {
            continue;
          }
          await walkDir(fullPath);
        } else if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    
    await walkDir(this.projectRoot);
    return files;
  }

  /**
   * Analyze a single file using appropriate language parser
   */
  async analyzeFile(filePath) {
    const content = await fs.readFile(filePath, 'utf-8');
    const relativePath = path.relative(this.projectRoot, filePath);
    const language = this.detectLanguage(filePath);

    try {
      // Route to appropriate language parser
      switch (language) {
        case 'javascript':
        case 'typescript':
          return await this.analyzeJavaScriptFile(content, relativePath, language);
        case 'python':
          return this.createBasicAnalysis(content, relativePath, language);
        case 'go':
          return this.createBasicAnalysis(content, relativePath, language);
        case 'rust':
          return this.createBasicAnalysis(content, relativePath, language);
        default:
          // Fallback for unsupported languages
          return this.createBasicAnalysis(content, relativePath, language);
      }
    } catch (parseError) {
      console.warn(`AST parsing failed for ${relativePath}: ${parseError.message}`);
      return this.createBasicAnalysis(content, relativePath, language);
    }
  }

  /**
   * Analyze JavaScript/TypeScript files
   */
  async analyzeJavaScriptFile(content, relativePath, language) {
    const analysis = {
      path: relativePath,
      language: language,
      lines: content.split('\n').length,
      complexity: 0,
      functions: [],
      classes: [],
      exports: [],
      imports: [],
      apis: [],
      tests: []
    };

    const ast = parse(content, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'asyncGenerators',
        'classProperties',
        'dynamicImport',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'functionBind',
        'objectRestSpread',
        'optionalCatchBinding',
        'optionalChaining',
        'nullishCoalescingOperator'
      ]
    });

    traverse.default(ast, {
      // Function analysis
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (path) => {
        const func = {
          name: this.getFunctionName(path.node),
          complexity: this.calculateComplexity(path),
          lines: path.node.loc ? path.node.loc.end.line - path.node.loc.start.line : 0,
          async: path.node.async,
          parameters: path.node.params.length
        };
        analysis.functions.push(func);
        analysis.complexity += func.complexity;
      },

      // Class analysis
      ClassDeclaration: (path) => {
        const cls = {
          name: path.node.id ? path.node.id.name : 'anonymous',
          methods: [],
          properties: [],
          complexity: 0
        };
        
        path.node.body.body.forEach(member => {
          if (t.isMethodDefinition(member)) {
            cls.methods.push({
              name: member.key.name || 'computed',
              kind: member.kind,
              static: member.static
            });
          } else if (t.isClassProperty(member)) {
            cls.properties.push({
              name: member.key.name || 'computed',
              static: member.static
            });
          }
        });
        
        analysis.classes.push(cls);
      },

      // Import analysis
      ImportDeclaration: (path) => {
        analysis.imports.push({
          source: path.node.source.value,
          specifiers: path.node.specifiers.map(spec => ({
            type: spec.type,
            imported: spec.imported ? spec.imported.name : null,
            local: spec.local.name
          }))
        });
      },

      // Export analysis
      'ExportDefaultDeclaration|ExportNamedDeclaration': (path) => {
        const exp = {
          type: path.node.type,
          source: path.node.source ? path.node.source.value : null
        };
        
        if (path.node.declaration) {
          exp.declaration = this.getDeclarationInfo(path.node.declaration);
        }
        
        analysis.exports.push(exp);
      },

      // API endpoint detection (Express-like patterns)
      CallExpression: (path) => {
        const callee = path.node.callee;
        if (t.isMemberExpression(callee)) {
          const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];
          if (httpMethods.includes(callee.property.name)) {
            const route = path.node.arguments[0];
            if (t.isStringLiteral(route)) {
              analysis.apis.push({
                method: callee.property.name.toUpperCase(),
                path: route.value,
                line: path.node.loc ? path.node.loc.start.line : 0
              });
            }
          }
        }

        // Test detection
        if (t.isIdentifier(callee)) {
          const testFrameworks = ['describe', 'it', 'test', 'expect'];
          if (testFrameworks.includes(callee.name)) {
            const description = path.node.arguments[0];
            if (t.isStringLiteral(description)) {
              analysis.tests.push({
                type: callee.name,
                description: description.value,
                line: path.node.loc ? path.node.loc.start.line : 0
              });
            }
          }
        }
      }
    });

    return analysis;
  }

  /**
   * Create basic analysis for unsupported languages
   */
  createBasicAnalysis(content, relativePath, language) {
    return {
      path: relativePath,
      language: language,
      lines: content.split('\n').length,
      complexity: 1, // Default complexity
      functions: [],
      classes: [],
      exports: [],
      imports: [],
      apis: [],
      tests: []
    };
  }

  /**
   * Calculate cyclomatic complexity for a function
   */
  calculateComplexity(path) {
    let complexity = 1; // Base complexity
    
    traverse.default(path.node, {
      'IfStatement|ConditionalExpression': () => complexity++,
      'WhileStatement|DoWhileStatement|ForStatement|ForInStatement|ForOfStatement': () => complexity++,
      'SwitchCase': () => complexity++,
      'CatchClause': () => complexity++,
      'LogicalExpression': (innerPath) => {
        if (innerPath.node.operator === '||' || innerPath.node.operator === '&&') {
          complexity++;
        }
      }
    });
    
    return complexity;
  }

  /**
   * Get function name from AST node
   */
  getFunctionName(node) {
    if (node.id) return node.id.name;
    if (node.key) return node.key.name;
    return 'anonymous';
  }

  /**
   * Get declaration information
   */
  getDeclarationInfo(declaration) {
    if (t.isFunctionDeclaration(declaration)) {
      return { type: 'function', name: declaration.id.name };
    } else if (t.isClassDeclaration(declaration)) {
      return { type: 'class', name: declaration.id.name };
    } else if (t.isVariableDeclaration(declaration)) {
      return { type: 'variable', names: declaration.declarations.map(d => d.id.name) };
    }
    return { type: 'unknown' };
  }

  /**
   * Detect file language
   */
  detectLanguage(filePath) {
    const ext = path.extname(filePath);
    const map = {
      '.js': 'javascript',
      '.jsx': 'javascript', 
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.mjs': 'javascript',
      '.cjs': 'javascript',
      '.py': 'python',
      '.pyx': 'python',
      '.pyi': 'python',
      '.go': 'go',
      '.rs': 'rust',
      '.java': 'java',
      '.kt': 'kotlin',
      '.c': 'c',
      '.cpp': 'cpp',
      '.cc': 'cpp',
      '.cxx': 'cpp',
      '.h': 'c',
      '.hpp': 'cpp'
    };
    return map[ext] || 'unknown';
  }

  /**
   * Check if file is JavaScript family
   */
  isJavaScriptFamily(filePath) {
    const ext = path.extname(filePath);
    return ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext);
  }

  /**
   * Generate development insights based on analysis
   */
  generateInsights(analysis) {
    const insights = {
      architecture: [],
      quality: [],
      maintenance: [],
      features: [],
      testing: []
    };

    // Architecture insights
    if (analysis.summary.languages.length > 1) {
      insights.architecture.push({
        type: 'multi-language',
        description: `Multi-language project (${analysis.summary.languages.join(', ')})`,
        suggestion: 'Consider language-specific tooling and build processes'
      });
    }

    // Quality insights
    const highComplexityFunctions = analysis.summary.complexity.functions.filter(f => f.complexity > 10);
    if (highComplexityFunctions.length > 0) {
      insights.quality.push({
        type: 'complexity',
        description: `${highComplexityFunctions.length} high-complexity functions found`,
        suggestion: 'Consider refactoring complex functions for better maintainability'
      });
    }

    // Testing insights
    const testFiles = analysis.files.filter(f => f.tests.length > 0);
    const testCoverage = testFiles.length / analysis.summary.totalFiles;
    if (testCoverage < 0.3) {
      insights.testing.push({
        type: 'coverage',
        description: `Low test coverage: ${Math.round(testCoverage * 100)}%`,
        suggestion: 'Add more unit tests to improve code reliability'
      });
    }

    // API insights
    const apiFiles = analysis.files.filter(f => f.apis.length > 0);
    if (apiFiles.length > 0) {
      insights.features.push({
        type: 'api',
        description: `API endpoints detected in ${apiFiles.length} files`,
        suggestion: 'Consider API documentation and testing strategies'
      });
    }

    return insights;
  }
}

export default CodeAnalyzer;