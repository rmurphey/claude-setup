const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

describe('setup.js package.json merging', () => {
  let testDir;
  const setupScript = path.join(__dirname, '../scripts/setup.js');
  
  beforeEach(() => {
    // Create a unique temp directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-setup-test-'));
    process.chdir(testDir);
    // Initialize git repo (required for setup)
    execSync('git init', { stdio: 'ignore' });
  });
  
  afterEach(() => {
    // Clean up and restore original directory
    process.chdir(__dirname);
    fs.rmSync(testDir, { recursive: true, force: true });
  });
  
  describe('package.json creation', () => {
    it('should create package.json when none exists', () => {
      // Run setup with --skip-scripts should not create package.json
      execSync(`node ${setupScript} --skip-scripts`, { stdio: 'ignore' });
      assert.strictEqual(fs.existsSync('package.json'), false, 'Should not create package.json with --skip-scripts');
      
      // Run setup without --skip-scripts should create package.json
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      assert.strictEqual(fs.existsSync('package.json'), true, 'Should create package.json');
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts, 'Should have scripts section');
      assert.ok(pkg.scripts.hygiene, 'Should have hygiene script');
      assert.ok(pkg.scripts.commit, 'Should have commit script');
      assert.ok(pkg.scripts.learn, 'Should have learn script');
    });
    
    it('should include essential scripts in new package.json', () => {
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const essentialScripts = ['hygiene', 'hygiene:quick', 'todo:list', 'commit', 'learn', 'tdd', 'docs'];
      
      essentialScripts.forEach(script => {
        assert.ok(pkg.scripts[script], `Should have ${script} script`);
      });
    });
  });
  
  describe('package.json merging with existing file', () => {
    it('should preserve existing scripts with --skip option', () => {
      // Create existing package.json with custom script
      const existingPkg = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          test: 'echo "custom test"',
          hygiene: 'echo "custom hygiene"'
        }
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --skip`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.strictEqual(pkg.scripts.test, 'echo "custom test"', 'Should preserve custom test script');
      assert.strictEqual(pkg.scripts.hygiene, 'echo "custom hygiene"', 'Should preserve custom hygiene script');
      
      // Non-conflicting scripts should be added
      assert.ok(pkg.scripts.learn, 'Should add non-conflicting learn script');
      assert.ok(pkg.scripts.tdd, 'Should add non-conflicting tdd script');
    });
    
    it('should replace scripts with --force option', () => {
      // Create existing package.json
      const existingPkg = {
        name: 'test-project',
        version: '1.0.0',
        scripts: {
          hygiene: 'echo "old hygiene"'
        }
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.notStrictEqual(pkg.scripts.hygiene, 'echo "old hygiene"', 'Should replace old hygiene script');
      assert.strictEqual(pkg.scripts.hygiene, 'npm run hygiene:quick --silent', 'Should have new hygiene script');
    });
    
    it('should create backup before modifying package.json', () => {
      const existingPkg = {
        name: 'test-backup',
        version: '1.0.0',
        scripts: { test: 'echo test' }
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      
      // Check for backup file
      const backupFiles = fs.readdirSync('.').filter(f => f.startsWith('package.json.backup-'));
      assert.strictEqual(backupFiles.length, 1, 'Should create exactly one backup file');
      
      const backup = JSON.parse(fs.readFileSync(backupFiles[0], 'utf8'));
      assert.deepStrictEqual(backup, existingPkg, 'Backup should match original package.json');
    });
  });
  
  describe('script file copying', () => {
    it('should copy required script files', () => {
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      
      // Check that script files referenced in package.json are copied
      const expectedScripts = [
        'scripts/todo-github.js',
        'scripts/learn.js',
        'scripts/tdd.js',
        'scripts/docs.js'
      ];
      
      expectedScripts.forEach(script => {
        assert.ok(fs.existsSync(script), `Should copy ${script}`);
        // Check that file is executable
        const stats = fs.statSync(script);
        const isExecutable = (stats.mode & parseInt('100', 8)) !== 0;
        assert.ok(isExecutable, `${script} should be executable`);
      });
    });
    
    it('should not overwrite existing script files', () => {
      // Create scripts directory with existing file
      fs.mkdirSync('scripts', { recursive: true });
      fs.writeFileSync('scripts/learn.js', '// custom learn script');
      
      execSync(`node ${setupScript} --skip`, { stdio: 'ignore' });
      
      const content = fs.readFileSync('scripts/learn.js', 'utf8');
      assert.strictEqual(content, '// custom learn script', 'Should not overwrite existing script file');
    });
  });
  
  describe('--skip-scripts option', () => {
    it('should not modify package.json with --skip-scripts', () => {
      const existingPkg = {
        name: 'unchanged',
        version: '1.0.0',
        scripts: { test: 'original' }
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --skip-scripts`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.deepStrictEqual(pkg, existingPkg, 'package.json should remain unchanged');
    });
    
    it('should not create package.json with --skip-scripts when none exists', () => {
      execSync(`node ${setupScript} --skip-scripts`, { stdio: 'ignore' });
      assert.strictEqual(fs.existsSync('package.json'), false, 'Should not create package.json');
    });
    
    it('should still copy .claude directory with --skip-scripts', () => {
      execSync(`node ${setupScript} --skip-scripts`, { stdio: 'ignore' });
      assert.ok(fs.existsSync('.claude/commands'), 'Should create .claude/commands directory');
      assert.ok(fs.existsSync('CLAUDE.md'), 'Should create CLAUDE.md');
    });
  });
  
  describe('validation and error handling', () => {
    it('should validate JSON syntax after merge', () => {
      const existingPkg = {
        name: 'test-validation',
        version: '1.0.0',
        scripts: {}
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      
      // Should not throw when parsing
      assert.doesNotThrow(() => {
        JSON.parse(fs.readFileSync('package.json', 'utf8'));
      }, 'Merged package.json should be valid JSON');
    });
    
    it('should handle package.json with no scripts section', () => {
      const existingPkg = {
        name: 'no-scripts',
        version: '1.0.0'
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --force`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.scripts, 'Should create scripts section');
      assert.ok(Object.keys(pkg.scripts).length > 0, 'Should add scripts');
    });
  });
  
  describe('conflict detection', () => {
    it('should detect conflicting scripts', () => {
      const existingPkg = {
        name: 'conflicts',
        version: '1.0.0',
        scripts: {
          hygiene: 'custom hygiene',
          commit: 'custom commit',
          learn: 'custom learn'
        }
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      // With skip option, should preserve all existing
      execSync(`node ${setupScript} --skip`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.strictEqual(pkg.scripts.hygiene, 'custom hygiene', 'Should keep custom hygiene');
      assert.strictEqual(pkg.scripts.commit, 'custom commit', 'Should keep custom commit');
      assert.strictEqual(pkg.scripts.learn, 'custom learn', 'Should keep custom learn');
    });
    
    it('should add non-conflicting scripts even with conflicts present', () => {
      const existingPkg = {
        name: 'partial-conflicts',
        version: '1.0.0',
        scripts: {
          hygiene: 'custom hygiene',
          build: 'npm run build:prod'
        }
      };
      fs.writeFileSync('package.json', JSON.stringify(existingPkg, null, 2));
      
      execSync(`node ${setupScript} --skip`, { stdio: 'ignore' });
      
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.strictEqual(pkg.scripts.hygiene, 'custom hygiene', 'Should preserve conflicting script');
      assert.strictEqual(pkg.scripts.build, 'npm run build:prod', 'Should preserve non-Claude script');
      assert.ok(pkg.scripts.learn, 'Should add non-conflicting learn script');
      assert.ok(pkg.scripts.tdd, 'Should add non-conflicting tdd script');
    });
  });
});