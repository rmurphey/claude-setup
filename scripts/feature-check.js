#!/usr/bin/env node

/**
 * Feature check quality script
 * Ensures new features have corresponding tests and documentation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Detect features from git changes
 */
function detectFeatures(changes) {
  const features = [];
  const featureExtensions = ['.js', '.ts', '.jsx', '.tsx', '.mjs'];
  const excludeDirs = ['test', 'tests', '__tests__', 'spec', 'docs', '.github', 'node_modules'];
  const excludeFiles = ['package.json', 'package-lock.json', 'tsconfig.json', '.eslintrc.js', 'eslint.config.js', '.babelrc', 'webpack.config.js'];
  
  for (const change of changes) {
    const { status, file, additions = 0 } = change;
    
    // Skip deleted files
    if (status === 'D') continue;
    
    // Skip excluded directories
    const parts = file.split('/');
    if (parts.some(part => excludeDirs.includes(part))) continue;
    
    // Skip excluded files
    const basename = path.basename(file);
    if (excludeFiles.includes(basename)) continue;
    
    // Skip non-code files
    const ext = path.extname(file);
    if (!featureExtensions.includes(ext)) continue;
    
    // Skip test files
    if (basename.includes('.test.') || basename.includes('.spec.')) continue;
    
    // Include new files
    if (status === 'A') {
      features.push(file);
      continue;
    }
    
    // Include significantly modified files (>50 lines added)
    if (status === 'M' && additions > 50) {
      features.push(file);
    }
  }
  
  return features;
}

/**
 * Find tests for a feature file
 */
function findTestsForFeature(feature, testFiles) {
  const basename = path.basename(feature, path.extname(feature));
  const dirname = path.dirname(feature);
  
  // Possible test file patterns
  const testPatterns = [
    `${basename}.test`,
    `${basename}.spec`,
    `${basename}.unit.test`,
    `${basename}.integration.test`
  ];
  
  for (const testFile of testFiles) {
    const testBasename = path.basename(testFile, path.extname(testFile));
    
    // Direct match
    if (testPatterns.some(pattern => testBasename === pattern)) {
      return true;
    }
    
    // Check if test is in similar directory structure
    if (testFile.includes(basename) && testFile.includes('.test')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Find documentation for a feature
 */
function findDocsForFeature(feature, docContent) {
  const basename = path.basename(feature, path.extname(feature));
  const featureName = basename.replace(/[-_]/g, ' ');
  
  // Check each doc file for mentions
  for (const [file, content] of Object.entries(docContent)) {
    // Check if the doc file name matches the feature name
    const docBasename = path.basename(file, path.extname(file));
    if (docBasename === basename) {
      return true;
    }
    
    const lowerContent = content.toLowerCase();
    const lowerBasename = basename.toLowerCase();
    const lowerFeatureName = featureName.toLowerCase();
    
    // Check for various mentions in content
    if (lowerContent.includes(lowerBasename) || 
        lowerContent.includes(lowerFeatureName) ||
        lowerContent.includes(basename.replace(/-/g, '')) ||
        lowerContent.includes(basename.replace(/_/g, ''))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if we should run the feature check
 */
function shouldRunCheck(changes) {
  const codeChanges = changes.filter(c => {
    const ext = path.extname(c.file);
    return ['.js', '.ts', '.jsx', '.tsx', '.mjs'].includes(ext);
  });
  
  const testOnlyChanges = codeChanges.every(c => 
    c.file.includes('test') || c.file.includes('spec')
  );
  
  const docsOnlyChanges = changes.every(c => 
    c.file.endsWith('.md') || c.file.includes('docs/')
  );
  
  const configOnlyChanges = changes.every(c => {
    const basename = path.basename(c.file);
    return basename === 'package.json' || 
           basename === 'package-lock.json' ||
           c.file.includes('.github/') ||
           basename.startsWith('.');
  });
  
  // Skip if only tests, docs, or config
  if (testOnlyChanges || docsOnlyChanges || configOnlyChanges) {
    return false;
  }
  
  return true;
}

/**
 * Check if a file is ignored
 */
function isIgnored(file, ignorePatterns) {
  for (const pattern of ignorePatterns) {
    // Simple glob pattern matching
    const regex = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    if (new RegExp(regex).test(file)) {
      return true;
    }
  }
  return false;
}

/**
 * Run the main feature check
 */
function runCheck(options) {
  const { features, testFiles, docFiles } = options;
  const errors = [];
  
  for (const feature of features) {
    // Check for tests
    if (!findTestsForFeature(feature, testFiles)) {
      errors.push(`❌ Feature missing test coverage: ${feature}`);
    }
    
    // Check for documentation
    if (!findDocsForFeature(feature, docFiles)) {
      errors.push(`❌ Feature missing documentation: ${feature}`);
    }
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Get changes from git
 */
function getGitChanges() {
  try {
    // Get changes between HEAD and base branch (usually main)
    const baseBranch = process.env.GITHUB_BASE_REF || 'main';
    const diffOutput = execSync(`git diff --name-status ${baseBranch}...HEAD`, { encoding: 'utf8' });
    return parseGitDiff(diffOutput);
  } catch (error) {
    // Fallback to last commit
    try {
      const diffOutput = execSync('git diff --name-status HEAD~1 HEAD', { encoding: 'utf8' });
      return parseGitDiff(diffOutput);
    } catch {
      return [];
    }
  }
}

/**
 * Parse git diff output
 */
function parseGitDiff(output) {
  const lines = output.trim().split('\n').filter(l => l);
  const changes = [];
  
  for (const line of lines) {
    const [status, ...fileParts] = line.split('\t');
    const file = fileParts.join('\t');
    if (file) {
      changes.push({ status, file });
    }
  }
  
  // Get line additions for modified files
  for (const change of changes) {
    if (change.status === 'M') {
      try {
        const statsOutput = execSync(`git diff --stat HEAD~1 HEAD -- "${change.file}"`, { encoding: 'utf8' });
        const additions = parseGitStats(statsOutput);
        change.additions = additions[change.file] || 0;
      } catch {
        change.additions = 0;
      }
    }
  }
  
  return changes;
}

/**
 * Parse git stats output to get line additions
 */
function parseGitStats(output) {
  const additions = {};
  const lines = output.trim().split('\n');
  
  for (const line of lines) {
    const match = line.match(/^\s*(.+?)\s*\|\s*(\d+)\s*([\+\-]+)/);
    if (match) {
      const [, file, , changes] = match;
      const plusCount = (changes.match(/\+/g) || []).length;
      additions[file.trim()] = plusCount * 10; // Approximate
    }
  }
  
  return additions;
}

/**
 * Main CLI function
 */
function main(args = process.argv.slice(2), testOptions = null) {
  // Check for skip flag
  if (args.includes('--skip-feature-check')) {
    console.log('⏭️  Feature check skipped');
    return { skipped: true, exitCode: 0 };
  }
  
  // Use test options if provided (for testing)
  let features, testFiles, docFiles;
  
  if (testOptions) {
    features = testOptions.features;
    testFiles = testOptions.testFiles;
    docFiles = testOptions.docFiles;
  } else {
    // Get actual git changes
    const changes = getGitChanges();
    
    // Check if we should run
    if (!shouldRunCheck(changes)) {
      console.log('✅ No feature changes detected - skipping check');
      return { skipped: true, exitCode: 0 };
    }
    
    // Detect features
    features = detectFeatures(changes);
    
    // Get test files
    testFiles = [];
    if (fs.existsSync('test')) {
      testFiles = execSync('find test -name "*.test.js" -o -name "*.spec.js"', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(f => f);
    }
    
    // Get documentation files
    docFiles = {};
    const docPaths = ['README.md', 'CLAUDE.md'];
    if (fs.existsSync('docs')) {
      const docsInDir = fs.readdirSync('docs').filter(f => f.endsWith('.md'));
      docPaths.push(...docsInDir.map(f => `docs/${f}`));
    }
    if (fs.existsSync('.claude/commands')) {
      const commands = fs.readdirSync('.claude/commands').filter(f => f.endsWith('.md'));
      docPaths.push(...commands.map(f => `.claude/commands/${f}`));
    }
    
    for (const docPath of docPaths) {
      if (fs.existsSync(docPath)) {
        docFiles[docPath] = fs.readFileSync(docPath, 'utf8');
      }
    }
  }
  
  // Run the check
  const result = runCheck({ features, testFiles, docFiles });
  
  if (!result.success) {
    console.log('\n❌ Feature Check Failed\n');
    console.log('New features must have tests and documentation:\n');
    result.errors.forEach(error => console.log(`  ${error}`));
    console.log('\nTo fix:');
    console.log('  1. Add test files for new features in test/');
    console.log('  2. Update documentation in README.md or docs/');
    console.log('  3. Or use --skip-feature-check if this is not a feature');
    return { success: false, exitCode: 1, errors: result.errors };
  }
  
  if (features.length > 0) {
    console.log('✅ Feature check passed - all features have tests and docs');
  }
  
  return { success: true, exitCode: 0, errors: [] };
}

// Export for testing
module.exports = {
  detectFeatures,
  findTestsForFeature,
  findDocsForFeature,
  shouldRunCheck,
  isIgnored,
  runCheck,
  getGitChanges,
  parseGitDiff,
  parseGitStats,
  main
};

// Run if called directly
if (require.main === module) {
  const result = main();
  process.exit(result.exitCode);
}