import Parser from 'tree-sitter';
import Rust from 'tree-sitter-rust';

/**
 * Rust AST Parser using Tree-sitter
 */
export class RustParser {
  constructor() {
    this.parser = new Parser();
    this.parser.setLanguage(Rust);
  }

  /**
   * Parse Rust code and extract analysis data
   */
  analyze(content, filePath) {
    const tree = this.parser.parse(content);
    const analysis = {
      path: filePath,
      language: 'rust',
      lines: content.split('\n').length,
      complexity: 0,
      functions: [],
      classes: [], // Rust structs/enums/traits
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
      case 'function_item':
        this.analyzeFunctionItem(node, analysis, content);
        break;
      case 'impl_item':
        this.analyzeImplItem(node, analysis, content);
        break;
      case 'struct_item':
      case 'enum_item':
      case 'trait_item':
        this.analyzeTypeItem(node, analysis, content);
        break;
      case 'use_declaration':
        this.analyzeUseDeclaration(node, analysis, content);
        break;
      case 'mod_item':
        this.analyzeModItem(node, analysis, content);
        break;
      case 'call_expression':
        this.analyzeCall(node, analysis, content);
        break;
      case 'macro_invocation':
        this.analyzeMacroInvocation(node, analysis, content);
        break;
    }

    // Recursively traverse children
    for (let i = 0; i < node.childCount; i++) {
      this.traverseNode(node.child(i), analysis, content);
    }
  }

  /**
   * Analyze function items
   */
  analyzeFunctionItem(node, analysis, content) {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    const bodyNode = node.childForFieldName('body');

    const func = {
      name: nameNode ? this.getNodeText(nameNode, content) : 'anonymous',
      complexity: this.calculateComplexity(bodyNode),
      lines: node.endPosition.row - node.startPosition.row + 1,
      parameters: parametersNode ? this.getParameterCount(parametersNode) : 0,
      visibility: this.getVisibility(node, content),
      async: this.isAsync(node),
      unsafe: this.isUnsafe(node)
    };

    analysis.functions.push(func);
    analysis.complexity += func.complexity;

    // Check if this is a public function
    if (func.visibility === 'pub') {
      analysis.exports.push({
        type: 'function',
        name: func.name,
        line: node.startPosition.row + 1
      });
    }

    // Check for test functions
    if (this.isTestFunction(node, content)) {
      analysis.tests.push({
        type: 'function',
        name: func.name,
        framework: 'rust_test',
        line: node.startPosition.row + 1
      });
    }

    // Check for HTTP handler patterns (Actix, Warp, etc.)
    if (this.isHTTPHandler(func.name, parametersNode, content)) {
      analysis.apis.push({
        type: 'http_handler',
        name: func.name,
        line: node.startPosition.row + 1
      });
    }
  }

  /**
   * Analyze impl blocks
   */
  analyzeImplItem(node, analysis, content) {
    const typeNode = node.childForFieldName('type');
    const traitNode = node.childForFieldName('trait');
    const bodyNode = node.childForFieldName('body');

    const impl = {
      type: typeNode ? this.getNodeText(typeNode, content) : 'unknown',
      trait: traitNode ? this.getNodeText(traitNode, content) : null,
      methods: []
    };

    // Find methods in impl block
    if (bodyNode) {
      for (let i = 0; i < bodyNode.childCount; i++) {
        const child = bodyNode.child(i);
        if (child.type === 'function_item') {
          const methodName = child.childForFieldName('name');
          if (methodName) {
            impl.methods.push({
              name: this.getNodeText(methodName, content),
              visibility: this.getVisibility(child, content),
              async: this.isAsync(child),
              unsafe: this.isUnsafe(child)
            });
          }
        }
      }
    }

    // Add to classes array (treating impl as method container)
    analysis.classes.push(impl);
  }

  /**
   * Analyze type items (struct, enum, trait)
   */
  analyzeTypeItem(node, analysis, content) {
    const nameNode = node.childForFieldName('name');
    const bodyNode = node.childForFieldName('body');

    const typeItem = {
      name: nameNode ? this.getNodeText(nameNode, content) : 'anonymous',
      type: node.type.replace('_item', ''),
      visibility: this.getVisibility(node, content),
      fields: [],
      variants: [],
      methods: []
    };

    // Handle struct fields
    if (node.type === 'struct_item' && bodyNode) {
      typeItem.fields = this.getStructFields(bodyNode, content);
    }

    // Handle enum variants
    if (node.type === 'enum_item' && bodyNode) {
      typeItem.variants = this.getEnumVariants(bodyNode, content);
    }

    // Handle trait methods
    if (node.type === 'trait_item' && bodyNode) {
      typeItem.methods = this.getTraitMethods(bodyNode, content);
    }

    analysis.classes.push(typeItem);

    // Add to exports if public
    if (typeItem.visibility === 'pub') {
      analysis.exports.push({
        type: typeItem.type,
        name: typeItem.name,
        line: node.startPosition.row + 1
      });
    }
  }

  /**
   * Analyze use declarations
   */
  analyzeUseDeclaration(node, analysis, content) {
    const useClauseNode = node.childForFieldName('argument');
    if (useClauseNode) {
      const imp = {
        path: this.getNodeText(useClauseNode, content),
        visibility: this.getVisibility(node, content)
      };
      analysis.imports.push(imp);
    }
  }

  /**
   * Analyze module items
   */
  analyzeModItem(node, analysis, content) {
    const nameNode = node.childForFieldName('name');
    if (nameNode) {
      const mod = {
        name: this.getNodeText(nameNode, content),
        visibility: this.getVisibility(node, content)
      };
      
      if (mod.visibility === 'pub') {
        analysis.exports.push({
          type: 'module',
          name: mod.name,
          line: node.startPosition.row + 1
        });
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
      
      // Check for HTTP client calls
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
   * Analyze macro invocations
   */
  analyzeMacroInvocation(node, analysis, content) {
    const macroNode = node.childForFieldName('macro');
    if (macroNode) {
      const macroName = this.getNodeText(macroNode, content);
      
      // Check for test macros
      if (this.isTestMacro(macroName)) {
        analysis.tests.push({
          type: 'macro',
          name: macroName,
          framework: 'rust_test',
          line: node.startPosition.row + 1
        });
      }

      // Check for assertion macros
      if (this.isAssertionMacro(macroName)) {
        analysis.tests.push({
          type: 'assertion',
          name: macroName,
          framework: 'rust_test',
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
      'if_expression', 'match_expression', 'match_arm',
      'while_expression', 'for_expression', 'loop_expression',
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
      } else if (node.type === 'match_expression') {
        // Count match arms
        const bodyNode = node.childForFieldName('body');
        if (bodyNode) {
          let armCount = 0;
          for (let i = 0; i < bodyNode.childCount; i++) {
            if (bodyNode.child(i).type === 'match_arm') {
              armCount++;
            }
          }
          complexity += Math.max(1, armCount - 1); // -1 because base is already counted
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
      if (child.type === 'parameter' || child.type === 'self_parameter') {
        count++;
      }
    }
    return count;
  }

  getVisibility(node, content) {
    // Check for visibility modifiers
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child.type === 'visibility_modifier') {
        return this.getNodeText(child, content);
      }
    }
    return 'private';
  }

  isAsync(node) {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child.type === 'async') {
        return true;
      }
    }
    return false;
  }

  isUnsafe(node) {
    for (let i = 0; i < node.childCount; i++) {
      const child = node.child(i);
      if (child.type === 'unsafe') {
        return true;
      }
    }
    return false;
  }

  isTestFunction(node, content) {
    // Check for #[test] attribute
    let current = node.previousSibling;
    while (current && current.type === 'attribute_item') {
      const attrText = this.getNodeText(current, content);
      if (attrText.includes('#[test]') || attrText.includes('#[cfg(test)]')) {
        return true;
      }
      current = current.previousSibling;
    }
    return false;
  }

  isHTTPHandler(name, parametersNode, content) {
    // Check for common HTTP handler patterns
    const httpPatterns = ['handler', 'route', 'endpoint'];
    if (httpPatterns.some(pattern => name.toLowerCase().includes(pattern))) {
      return true;
    }

    // Check for HTTP framework parameters
    if (parametersNode) {
      const paramText = this.getNodeText(parametersNode, content);
      return paramText.includes('HttpRequest') || paramText.includes('Request') || paramText.includes('Response');
    }

    return false;
  }

  isHTTPCall(funcName) {
    const httpCalls = ['get', 'post', 'put', 'delete', 'patch', 'Client::new', 'request'];
    return httpCalls.some(call => funcName.includes(call));
  }

  isTestMacro(macroName) {
    const testMacros = ['test', 'cfg(test)', 'should_panic'];
    return testMacros.some(macro => macroName.includes(macro));
  }

  isAssertionMacro(macroName) {
    const assertionMacros = ['assert!', 'assert_eq!', 'assert_ne!', 'debug_assert!'];
    return assertionMacros.some(macro => macroName.includes(macro));
  }

  getStructFields(bodyNode, content) {
    const fields = [];
    for (let i = 0; i < bodyNode.childCount; i++) {
      const child = bodyNode.child(i);
      if (child.type === 'field_declaration') {
        const nameNode = child.childForFieldName('name');
        const typeNode = child.childForFieldName('type');
        if (nameNode && typeNode) {
          fields.push({
            name: this.getNodeText(nameNode, content),
            type: this.getNodeText(typeNode, content),
            visibility: this.getVisibility(child, content)
          });
        }
      }
    }
    return fields;
  }

  getEnumVariants(bodyNode, content) {
    const variants = [];
    for (let i = 0; i < bodyNode.childCount; i++) {
      const child = bodyNode.child(i);
      if (child.type === 'enum_variant') {
        const nameNode = child.childForFieldName('name');
        if (nameNode) {
          variants.push({
            name: this.getNodeText(nameNode, content)
          });
        }
      }
    }
    return variants;
  }

  getTraitMethods(bodyNode, content) {
    const methods = [];
    for (let i = 0; i < bodyNode.childCount; i++) {
      const child = bodyNode.child(i);
      if (child.type === 'function_signature_item') {
        const nameNode = child.childForFieldName('name');
        if (nameNode) {
          methods.push({
            name: this.getNodeText(nameNode, content),
            signature: true
          });
        }
      }
    }
    return methods;
  }
}

export default RustParser;