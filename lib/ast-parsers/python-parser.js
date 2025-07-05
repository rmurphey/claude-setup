import Parser from 'tree-sitter';
import Python from 'tree-sitter-python';

/**
 * Python AST Parser using Tree-sitter
 */
export class PythonParser {
  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Python);
  }

  /**
   * Parse Python code and extract analysis data
   */
  analyze(content, filePath) {
    const tree = this.parser.parse(content);
    const analysis = {
      path: filePath,
      language: 'python',
      lines: content.split('\n').length,
      complexity: 0,
      functions: [],
      classes: [],
      imports: [],
      exports: [],
      apis: [],
      tests: []
    };

    this.traverseNode(tree.rootNode, analysis, content);
    return analysis;
  }

  /**
   * Traverse AST nodes and extract information
   */
  traverseNode(node, analysis, content) {
    switch (node.type) {
      case 'function_definition':
        this.analyzeFunctionDefinition(node, analysis, content);
        break;
      case 'class_definition':
        this.analyzeClassDefinition(node, analysis, content);
        break;
      case 'import_statement':
      case 'import_from_statement':
        this.analyzeImport(node, analysis, content);
        break;
      case 'decorated_definition':
        this.analyzeDecorator(node, analysis, content);
        break;
      case 'call':
        this.analyzeCall(node, analysis, content);
        break;
    }

    // Recursively traverse children
    for (let i = 0; i < node.childCount; i++) {
      this.traverseNode(node.child(i), analysis, content);
    }
  }

  /**
   * Analyze function definitions
   */
  analyzeFunctionDefinition(node, analysis, content) {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    const bodyNode = node.childForFieldName('body');

    const func = {
      name: nameNode ? this.getNodeText(nameNode, content) : 'anonymous',
      complexity: this.calculateComplexity(bodyNode),
      lines: node.endPosition.row - node.startPosition.row + 1,
      parameters: parametersNode ? this.getParameterCount(parametersNode) : 0,
      async: this.isAsyncFunction(node),
      decorators: this.getDecorators(node)
    };

    analysis.functions.push(func);
    analysis.complexity += func.complexity;
  }

  /**
   * Analyze class definitions
   */
  analyzeClassDefinition(node, analysis, content) {
    const nameNode = node.childForFieldName('name');
    const bodyNode = node.childForFieldName('body');

    const cls = {
      name: nameNode ? this.getNodeText(nameNode, content) : 'anonymous',
      methods: [],
      properties: [],
      baseClasses: this.getBaseClasses(node, content),
      decorators: this.getDecorators(node)
    };

    // Find methods and properties in class body
    if (bodyNode) {
      for (let i = 0; i < bodyNode.childCount; i++) {
        const child = bodyNode.child(i);
        if (child.type === 'function_definition') {
          const methodName = child.childForFieldName('name');
          cls.methods.push({
            name: methodName ? this.getNodeText(methodName, content) : 'anonymous',
            static: this.isStaticMethod(child),
            decorators: this.getDecorators(child)
          });
        }
      }
    }

    analysis.classes.push(cls);
  }

  /**
   * Analyze import statements
   */
  analyzeImport(node, analysis, content) {
    const imp = {
      type: node.type,
      modules: [],
      from: null
    };

    if (node.type === 'import_from_statement') {
      const moduleNode = node.childForFieldName('module_name');
      if (moduleNode) {
        imp.from = this.getNodeText(moduleNode, content);
      }
    }

    // Get imported names
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child.type === 'dotted_name' || child.type === 'identifier') {
        imp.modules.push(this.getNodeText(child, content));
      }
    }

    analysis.imports.push(imp);
  }

  /**
   * Analyze decorators (potential APIs, tests, etc.)
   */
  analyzeDecorator(node, analysis, content) {
    const decorators = this.getDecorators(node);
    
    // Check for web framework decorators (Flask, FastAPI, etc.)
    decorators.forEach(decorator => {
      if (this.isWebFrameworkDecorator(decorator)) {
        analysis.apis.push({
          framework: this.getFrameworkType(decorator),
          decorator: decorator,
          line: node.startPosition.row + 1
        });
      }
      
      // Check for test decorators
      if (this.isTestDecorator(decorator)) {
        analysis.tests.push({
          type: 'decorator',
          framework: this.getTestFramework(decorator),
          line: node.startPosition.row + 1
        });
      }
    });
  }

  /**
   * Analyze function calls (for test frameworks, etc.)
   */
  analyzeCall(node, analysis, content) {
    const functionNode = node.childForFieldName('function');
    if (functionNode) {
      const funcName = this.getNodeText(functionNode, content);
      
      // Check for test framework calls
      if (this.isTestFunctionCall(funcName)) {
        analysis.tests.push({
          type: 'function_call',
          framework: this.getTestFrameworkFromCall(funcName),
          name: funcName,
          line: node.startPosition.row + 1
        });
      }
    }
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateComplexity(node) {
    if (!node) return 1;
    
    let complexity = 1;
    const complexityNodes = [
      'if_statement', 'elif_clause', 'else_clause',
      'while_statement', 'for_statement',
      'try_statement', 'except_clause',
      'and', 'or',
      'conditional_expression'
    ];

    this.traverseForComplexity(node, complexity, complexityNodes);
    return complexity;
  }

  /**
   * Traverse nodes for complexity calculation
   */
  traverseForComplexity(node, complexity, complexityNodes) {
    if (complexityNodes.includes(node.type)) {
      complexity++;
    }

    for (let i = 0; i < node.childCount; i++) {
      complexity = this.traverseForComplexity(node.child(i), complexity, complexityNodes);
    }

    return complexity;
  }

  /**
   * Helper methods
   */
  getNodeText(node, content) {
    return content.slice(node.startIndex, node.endIndex);
  }

  getParameterCount(parametersNode) {
    let count = 0;
    for (let i = 0; i < parametersNode.childCount; i++) {
      const child = parametersNode.child(i);
      if (child.type === 'identifier' || child.type === 'default_parameter') {
        count++;
      }
    }
    return count;
  }

  isAsyncFunction(node) {
    // Check for async keyword
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child.type === 'async') {
        return true;
      }
    }
    return false;
  }

  getDecorators(node) {
    const decorators = [];
    let current = node.previousSibling;
    
    while (current && current.type === 'decorator') {
      decorators.push(this.getNodeText(current, content));
      current = current.previousSibling;
    }
    
    return decorators.reverse();
  }

  getBaseClasses(node, content) {
    const argumentListNode = node.childForFieldName('superclasses');
    const baseClasses = [];
    
    if (argumentListNode) {
      for (let i = 0; i < argumentListNode.childCount; i++) {
        const child = argumentListNode.child(i);
        if (child.type === 'identifier' || child.type === 'attribute') {
          baseClasses.push(this.getNodeText(child, content));
        }
      }
    }
    
    return baseClasses;
  }

  isStaticMethod(node) {
    const decorators = this.getDecorators(node);
    return decorators.some(dec => dec.includes('staticmethod'));
  }

  isWebFrameworkDecorator(decorator) {
    const webDecorators = ['@app.route', '@app.get', '@app.post', '@app.put', '@app.delete', '@route'];
    return webDecorators.some(wd => decorator.includes(wd));
  }

  getFrameworkType(decorator) {
    if (decorator.includes('@app.')) return 'flask';
    if (decorator.includes('@route')) return 'fastapi';
    return 'unknown';
  }

  isTestDecorator(decorator) {
    const testDecorators = ['@pytest.mark', '@unittest'];
    return testDecorators.some(td => decorator.includes(td));
  }

  getTestFramework(decorator) {
    if (decorator.includes('pytest')) return 'pytest';
    if (decorator.includes('unittest')) return 'unittest';
    return 'unknown';
  }

  isTestFunctionCall(funcName) {
    const testFunctions = ['test_', 'assert', 'assertEqual', 'assertTrue', 'assertFalse'];
    return testFunctions.some(tf => funcName.includes(tf));
  }

  getTestFrameworkFromCall(funcName) {
    if (funcName.startsWith('test_')) return 'pytest';
    if (funcName.startsWith('assert')) return 'unittest';
    return 'unknown';
  }
}

export default PythonParser;