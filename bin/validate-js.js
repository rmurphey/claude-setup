#!/usr/bin/env node

/**
 * CLI tool for validating JavaScript files
 * Usage: node bin/validate-js.js <file1> <file2> ...
 */

import { validateFiles } from '../lib/js-file-validator.js';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node bin/validate-js.js <file1> <file2> ...');
    console.log('       node bin/validate-js.js --help');
    process.exit(1);
  }
  
  if (args[0] === '--help' || args[0] === '-h') {
    console.log(`
JavaScript File Validator

Usage: node bin/validate-js.js [options] <files...>

Options:
  --no-autofix     Disable automatic fixing of issues
  --no-syntax      Skip syntax validation
  --no-eslint      Skip ESLint validation
  --no-imports     Skip import validation
  --check-tests    Enable test coverage checking
  --help, -h       Show this help message

Examples:
  node bin/validate-js.js lib/main.js
  node bin/validate-js.js --no-autofix src/**/*.js
  node bin/validate-js.js --check-tests lib/*.js
`);
    process.exit(0);
  }
  
  // Parse options
  const options = {
    autoFix: !args.includes('--no-autofix'),
    checkSyntax: !args.includes('--no-syntax'),
    checkESLint: !args.includes('--no-eslint'),
    checkImports: !args.includes('--no-imports'),
    checkTests: args.includes('--check-tests')
  };
  
  // Get file paths (filter out options)
  const filePaths = args.filter(arg => !arg.startsWith('--'));
  
  if (filePaths.length === 0) {
    console.error('Error: No files specified');
    process.exit(1);
  }
  
  console.log('🔍 Validating JavaScript files...\n');
  
  try {
    const allValid = await validateFiles(filePaths, options);
    
    if (allValid) {
      console.log('\n✅ All files passed validation');
      process.exit(0);
    } else {
      console.log('\n❌ Some files failed validation');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});