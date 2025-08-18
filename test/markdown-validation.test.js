const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Tests for markdown validation functionality
 */

describe('Markdown Validation', () => {
  
  describe('remark-lint configuration', () => {
    it('should have .remarkrc.js configuration file', () => {
      const configPath = path.join(process.cwd(), '.remarkrc.js');
      assert.ok(fs.existsSync(configPath), '.remarkrc.js should exist');
    });
    
    it('should load valid remark configuration', () => {
      const config = require('../.remarkrc.js');
      assert.ok(config.plugins, 'Config should have plugins');
      assert.ok(Array.isArray(config.plugins), 'Plugins should be an array');
      assert.ok(config.settings, 'Config should have settings');
    });
  });
  
  describe('npm scripts', () => {
    it('should have markdown:lint script', () => {
      const packageJson = require('../package.json');
      assert.ok(packageJson.scripts['markdown:lint'], 'markdown:lint script should exist');
    });
    
    it('should have markdown:fix script', () => {
      const packageJson = require('../package.json');
      assert.ok(packageJson.scripts['markdown:fix'], 'markdown:fix script should exist');
    });
    
    it('should include markdown:lint in hygiene:quick', () => {
      const packageJson = require('../package.json');
      const hygieneScript = packageJson.scripts['hygiene:quick'];
      assert.ok(hygieneScript.includes('markdown:lint'), 'hygiene:quick should include markdown:lint');
    });
    
    it('should include markdown:lint in commit:check', () => {
      const packageJson = require('../package.json');
      const commitScript = packageJson.scripts['commit:check'];
      assert.ok(commitScript.includes('markdown:lint'), 'commit:check should include markdown:lint');
    });
  });
  
  describe('markdown validation functionality', () => {
    it('should validate markdown files without errors', () => {
      // Test that remark can process markdown files
      const tempFile = path.join(process.cwd(), 'test-markdown.md');
      const markdown = `# Test File

This is a test markdown file.

## Features

- Item 1
- Item 2

\`\`\`javascript
const x = 1;
\`\`\`

Some **bold** and *italic* text.
`;
      
      fs.writeFileSync(tempFile, markdown);
      
      try {
        // Run remark - it should process the file without throwing
        const output = execSync(`npx remark ${tempFile} --quiet`, { 
          encoding: 'utf8',
          stdio: 'pipe' 
        });
        // remark outputs the processed markdown
        assert.ok(output.includes('# Test File'), 'Should output processed markdown');
        assert.ok(typeof output === 'string', 'Should return string output');
      } catch (error) {
        assert.fail('Remark should process valid markdown without errors: ' + error.message);
      } finally {
        // Clean up
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    });
  });
  
  describe('CI workflow integration', () => {
    it('should have markdown validation in quality.yml', () => {
      const workflowPath = path.join(process.cwd(), '.github/workflows/quality.yml');
      const workflowContent = fs.readFileSync(workflowPath, 'utf8');
      
      assert.ok(workflowContent.includes('markdown:lint'), 'quality.yml should include markdown:lint');
      assert.ok(workflowContent.includes('Validating markdown syntax'), 'quality.yml should have markdown validation step');
    });
  });
  
  describe('remark dependencies', () => {
    it('should have remark dependencies installed', () => {
      const packageJson = require('../package.json');
      const devDeps = packageJson.devDependencies;
      
      assert.ok(devDeps['remark'], 'remark should be installed');
      assert.ok(devDeps['remark-cli'], 'remark-cli should be installed');
      assert.ok(devDeps['remark-preset-lint-recommended'], 'remark-preset-lint-recommended should be installed');
      assert.ok(devDeps['remark-preset-lint-consistent'], 'remark-preset-lint-consistent should be installed');
      assert.ok(devDeps['remark-validate-links'], 'remark-validate-links should be installed');
    });
  });
});