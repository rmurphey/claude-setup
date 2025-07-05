import Parser from 'tree-sitter';
import Go from 'tree-sitter-go';

/**
 * Go AST Parser using Tree-sitter
 */
export class GoParser {
  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Go);
  }

  /**
   * Parse Go code and extract analysis data
   */
  analyze(content, filePath) {
    const tree = this.parser.parse(content);
    const analysis = {
      path: filePath,
      language: 'go',
      lines: content.split('\n').length,
      complexity: 0,
      functions: [],
      classes: [], // Go doesn't have classes, but we'll track structs
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
      case 'function_declaration':
      case 'method_declaration':
        this.analyzeFunctionDeclaration(node, analysis, content);
        break;
      case 'type_declaration':
        this.analyzeTypeDeclaration(node, analysis, content);
        break;
      case 'import_declaration':
        this.analyzeImport(node, analysis, content);
        break;
      case 'call_expression':
        this.analyzeCall(node, analysis, content);
        break;
    }

    // Recursively traverse children
    for (let i = 0; i < node.childCount; i++) {
      this.traverseNode(node.child(i), analysis, content);
    }
  }

  /**
   * Analyze function and method declarations
   */
  analyzeFunctionDeclaration(node, analysis, content) {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    const bodyNode = node.childForFieldName('body');

    const func = {
      name: nameNode ? this.getNodeText(nameNode, content) : 'anonymous',
      complexity: this.calculateComplexity(bodyNode),
      lines: node.endPosition.row - node.startPosition.row + 1,
      parameters: parametersNode ? this.getParameterCount(parametersNode) : 0,
      exported: this.isExported(nameNode, content),
      receiver: node.type === 'method_declaration' ? this.getReceiver(node, content) : null
    };

    analysis.functions.push(func);
    analysis.complexity += func.complexity;

    // Check if this is an exported function
    if (func.exported) {
      analysis.exports.push({
        type: 'function',
        name: func.name,
        line: node.startPosition.row + 1
      });
    }

    // Check for HTTP handler patterns
    if (this.isHTTPHandler(func.name, parametersNode, content)) {
      analysis.apis.push({
        type: 'http_handler',
        name: func.name,
        line: node.startPosition.row + 1
      });
    }

    // Check for test functions
    if (this.isTestFunction(func.name)) {
      analysis.tests.push({
        type: 'function',
        name: func.name,
        framework: 'testing',
        line: node.startPosition.row + 1
      });
    }
  }

  /**
   * Analyze type declarations (structs, interfaces, etc.)
   */
  analyzeTypeDeclaration(node, analysis, content) {
    const typeSpecNode = node.childForFieldName('type_spec');
    if (!typeSpecNode) return;

    const nameNode = typeSpecNode.childForFieldName('name');
    const typeNode = typeSpecNode.childForFieldName('type');

    if (nameNode && typeNode) {
      const typeName = this.getNodeText(nameNode, content);
      
      if (typeNode.type === 'struct_type') {
        const struct = {
          name: typeName,
          type: 'struct',
          fields: this.getStructFields(typeNode, content),
          exported: this.isExported(nameNode, content)
        };
        analysis.classes.push(struct);

        if (struct.exported) {
          analysis.exports.push({
            type: 'struct',
            name: struct.name,
            line: node.startPosition.row + 1
          });
        }
      } else if (typeNode.type === 'interface_type') {
        const iface = {
          name: typeName,
          type: 'interface',
          methods: this.getInterfaceMethods(typeNode, content),
          exported: this.isExported(nameNode, content)
        };
        analysis.classes.push(iface);

        if (iface.exported) {
          analysis.exports.push({
            type: 'interface',
            name: iface.name,
            line: node.startPosition.row + 1
          });
        }
      }
    }
  }

  /**
   * Analyze import declarations
   */
  analyzeImport(node, analysis, content) {
    const importSpecList = node.childForFieldName('import_spec_list');
    if (!importSpecList) return;

    for (let i = 0; i < importSpecList.childCount; i++) {
      const importSpec = importSpecList.child(i);
      if (importSpec.type === 'import_spec') {
        const pathNode = importSpec.childForFieldName('path');
        const nameNode = importSpec.childForFieldName('name');
        
        if (pathNode) {
          const imp = {
            path: this.getNodeText(pathNode, content).replace(/"/g, ''),
            alias: nameNode ? this.getNodeText(nameNode, content) : null
          };
          analysis.imports.push(imp);
        }
      }
    }
  }

  /**
   * Analyze function calls
   */
  analyzeCall(node, analysis, content) {
    const functionNode = node.childForFieldName('function');
    if (functionNode) {
      const funcName = this.getNodeText(functionNode, content);
      
      // Check for test assertions
      if (this.isTestAssertion(funcName)) {
        analysis.tests.push({
          type: 'assertion',
          name: funcName,
          framework: 'testing',
          line: node.startPosition.row + 1
        });
      }

      // Check for HTTP patterns
      if (this.isHTTPCall(funcName)) {
        analysis.apis.push({
          type: 'http_call',
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
      'if_statement', 'expression_switch_statement', 'type_switch_statement',
      'for_statement', 'range_clause',
      'select_statement', 'communication_case',
      'binary_expression' // for && and ||
    ];

    return this.traverseForComplexity(node, complexity, complexityNodes);
  }

  /**
   * Traverse nodes for complexity calculation
   */
  traverseForComplexity(node, complexity, complexityNodes) {
    if (complexityNodes.includes(node.type)) {
      // Special handling for binary expressions (logical operators)
      if (node.type === 'binary_expression') {
        const operator = node.childForFieldName('operator');
        if (operator) {
          const op = this.getNodeText(operator, content);
          if (op === '&&' || op === '||') {
            complexity++;
          }
        }
      } else {
        complexity++;
      }
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
      if (child.type === 'parameter_declaration') {
        count++;
      }
    }
    return count;
  }

  isExported(nameNode, content) {
    if (!nameNode) return false;
    const name = this.getNodeText(nameNode, content);
    return name.length > 0 && name[0] === name[0].toUpperCase();
  }

  getReceiver(node, content) {
    const receiverNode = node.childForFieldName('receiver');
    if (receiverNode) {
      return this.getNodeText(receiverNode, content);
    }
    return null;
  }

  isHTTPHandler(name, parametersNode, content) {
    // Check for common HTTP handler patterns
    const httpPatterns = ['Handler', 'ServeHTTP', 'HandleFunc'];
    if (httpPatterns.some(pattern => name.includes(pattern))) {
      return true;
    }

    // Check for http.ResponseWriter parameter
    if (parametersNode) {
      const paramText = this.getNodeText(parametersNode, content);
      return paramText.includes('ResponseWriter') || paramText.includes('http.Request');
    }

    return false;
  }

  isTestFunction(name) {
    return name.startsWith('Test') || name.startsWith('Benchmark') || name.startsWith('Example');
  }

  isTestAssertion(funcName) {
    const testAssertions = ['t.Error', 't.Fatal', 't.Fail', 't.Assert', 't.Equal'];
    return testAssertions.some(assertion => funcName.includes(assertion));
  }

  isHTTPCall(funcName) {
    const httpCalls = ['http.Get', 'http.Post', 'http.Put', 'http.Delete', 'http.ListenAndServe'];
    return httpCalls.some(call => funcName.includes(call));
  }

  getStructFields(structNode, content) {
    const fields = [];
    for (let i = 0; i < structNode.childCount; i++) {
      const child = structNode.child(i);
      if (child.type === 'field_declaration') {
        const nameNode = child.childForFieldName('name');
        const typeNode = child.childForFieldName('type');
        if (nameNode && typeNode) {
          fields.push({
            name: this.getNodeText(nameNode, content),
            type: this.getNodeText(typeNode, content)
          });
        }
      }
    }
    return fields;
  }

  getInterfaceMethods(interfaceNode, content) {
    const methods = [];
    for (let i = 0; i < interfaceNode.childCount; i++) {
      const child = interfaceNode.child(i);
      if (child.type === 'method_spec') {
        const nameNode = child.childForFieldName('name');
        if (nameNode) {
          methods.push({
            name: this.getNodeText(nameNode, content)
          });
        }
      }
    }
    return methods;
  }
}

export default GoParser;