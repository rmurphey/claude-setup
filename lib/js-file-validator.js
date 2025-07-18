/**
 * JavaScript File Validation Utility
 * 
 * Provides comprehensive validation for JavaScript/TypeScript files to ensure
 * they meet basic quality expectations before being saved.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

/**
 * Validation result structure
 */
class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
    this.fixedIssues = [];
  }

  addError(message, fixable = false) {
    this.errors.push({ message, fixable });
    this.isValid = false;
  }

  addWarning(message) {
    this.warnings.push(message);
  }

  addFixedIssue(message) {
    this.fixedIssues.push(message);
  }
}

/**
 * JavaScript File Validator
 */
export class JSFileValidator {
  constructor(options = {}) {
    this.options = {
      autoFix: true,
      checkSyntax: true,
      checkESLint: true,
      checkImports: true,
      checkTests: false, // Set to true if you want to enforce test coverage
      ...options
    };
  }

  /**
   * Validate a JavaScript/TypeScript file
   */
  async validateFile(filePath) {
    const result = new ValidationResult();
    
    if (!existsSync(filePath)) {
      result.addError(`File does not exist: ${filePath}`);
      return result;
    }

    try {
      // 1. Syntax validation
      if (this.options.checkSyntax) {
        await this.validateSyntax(filePath, result);
      }

      // 2. ESLint validation and auto-fix
      if (this.options.checkESLint) {
        await this.validateESLint(filePath, result);
      }

      // 3. Import/Export validation
      if (this.options.checkImports) {
        await this.validateImports(filePath, result);
      }

      // 4. Test coverage check (optional)
      if (this.options.checkTests) {
        await this.validateTestCoverage(filePath, result);
      }

    } catch (error) {
      result.addError(`Validation failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate JavaScript/TypeScript syntax
   */
  async validateSyntax(filePath, result) {
    try {
      const ext = path.extname(filePath);
      
      if (ext === '.ts' || ext === '.tsx') {
        // TypeScript syntax check
        try {
          execSync(`npx tsc --noEmit --skipLibCheck "${filePath}"`, { 
            stdio: 'pipe',
            encoding: 'utf8'
          });
        } catch (error) {
          result.addError(`TypeScript syntax error: ${error.stdout || error.message}`, false);
        }
      } else {
        // JavaScript syntax check using Node.js
        try {
          // Use Node.js to parse the file for syntax errors
          execSync(`node --check "${filePath}"`, { 
            stdio: 'pipe',
            encoding: 'utf8'
          });
        } catch (error) {
          result.addError(`JavaScript syntax error: ${error.stderr || error.message}`, false);
        }
      }
    } catch (error) {
      result.addError(`Could not read file for syntax validation: ${error.message}`);
    }
  }

  /**
   * Validate with ESLint and auto-fix issues
   */
  async validateESLint(filePath, result) {
    try {
      // First, try to auto-fix issues
      if (this.options.autoFix) {
        try {
          execSync(`npx eslint --fix "${filePath}"`, { 
            stdio: 'pipe',
            encoding: 'utf8'
          });
          result.addFixedIssue('Auto-fixed ESLint issues');
        } catch (fixError) {
          // Auto-fix failed or there are remaining issues
        }
      }

      // Then check for remaining issues
      try {
        execSync(`npx eslint "${filePath}"`, { 
          stdio: 'pipe',
          encoding: 'utf8'
        });
      } catch (error) {
        const output = error.stdout || error.stderr || '';
        if (output.includes('error')) {
          result.addError(`ESLint errors found:\n${output}`, true);
        } else if (output.includes('warning')) {
          result.addWarning(`ESLint warnings found:\n${output}`);
        }
      }
    } catch (error) {
      result.addWarning(`Could not run ESLint: ${error.message}`);
    }
  }

  /**
   * Validate imports and exports
   */
  async validateImports(filePath, result) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const dir = path.dirname(filePath);
      
      // Check for common import issues
      const importRegex = /import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Skip node modules and built-in modules
        if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
          continue;
        }
        
        // Resolve relative imports
        const resolvedPath = path.resolve(dir, importPath);
        const possibleExtensions = ['', '.js', '.mjs', '.cjs', '.ts', '.tsx'];
        
        let found = false;
        for (const ext of possibleExtensions) {
          if (existsSync(resolvedPath + ext)) {
            found = true;
            break;
          }
        }
        
        if (!found && existsSync(resolvedPath) && require('fs').statSync(resolvedPath).isDirectory()) {
          // Check for index files
          for (const ext of possibleExtensions) {
            if (existsSync(path.join(resolvedPath, 'index' + ext))) {
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          result.addError(`Import not found: ${importPath} (resolved to ${resolvedPath})`, false);
        }
      }
    } catch (error) {
      result.addWarning(`Could not validate imports: ${error.message}`);
    }
  }

  /**
   * Validate test coverage (optional)
   */
  async validateTestCoverage(filePath, result) {
    // Skip test files themselves
    if (filePath.includes('test') || filePath.includes('spec')) {
      return;
    }

    // Skip files in certain directories
    if (filePath.includes('node_modules') || filePath.includes('dist') || filePath.includes('build')) {
      return;
    }

    const testPatterns = [
      filePath.replace(/\.js$/, '.test.js'),
      filePath.replace(/\.js$/, '.spec.js'),
      filePath.replace(/src\//, '__tests__/').replace(/\.js$/, '.test.js'),
      filePath.replace(/lib\//, '__tests__/').replace(/\.js$/, '.test.js')
    ];

    let hasTest = false;
    for (const testPath of testPatterns) {
      if (existsSync(testPath)) {
        hasTest = true;
        break;
      }
    }

    if (!hasTest) {
      result.addWarning(`No test file found for ${filePath}. Consider adding tests.`);
    }
  }

  /**
   * Get validation summary
   */
  getValidationSummary(result) {
    const summary = [];
    
    if (result.fixedIssues.length > 0) {
      summary.push(`✅ Fixed ${result.fixedIssues.length} issue(s) automatically`);
    }
    
    if (result.errors.length > 0) {
      summary.push(`❌ ${result.errors.length} error(s) found`);
      result.errors.forEach(error => {
        summary.push(`   • ${error.message}`);
      });
    }
    
    if (result.warnings.length > 0) {
      summary.push(`⚠️  ${result.warnings.length} warning(s) found`);
      result.warnings.forEach(warning => {
        summary.push(`   • ${warning}`);
      });
    }
    
    if (result.isValid && result.errors.length === 0) {
      summary.push('✅ File validation passed');
    }
    
    return summary.join('\n');
  }
}

/**
 * Validate a single file (CLI usage)
 */
export async function validateFile(filePath, options = {}) {
  const validator = new JSFileValidator(options);
  const result = await validator.validateFile(filePath);
  
  console.log(validator.getValidationSummary(result));
  
  return result.isValid;
}

/**
 * Validate multiple files
 */
export async function validateFiles(filePaths, options = {}) {
  const validator = new JSFileValidator(options);
  const results = [];
  
  for (const filePath of filePaths) {
    const result = await validator.validateFile(filePath);
    results.push({ filePath, result });
    
    console.log(`\n--- ${filePath} ---`);
    console.log(validator.getValidationSummary(result));
  }
  
  const allValid = results.every(({ result }) => result.isValid);
  
  console.log('\n--- Summary ---');
  console.log(`${results.length} file(s) validated`);
  console.log(`${results.filter(({ result }) => result.isValid).length} passed`);
  console.log(`${results.filter(({ result }) => !result.isValid).length} failed`);
  
  return allValid;
}