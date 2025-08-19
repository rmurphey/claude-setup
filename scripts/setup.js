#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Parse command-line arguments
const args = process.argv.slice(2);
const options = {
  force: args.includes('--force'),
  skip: args.includes('--skip'),
  backup: args.includes('--backup'),
  help: args.includes('--help') || args.includes('-h'),
  'skip-scripts': args.includes('--skip-scripts'),
  'dry-run': args.includes('--dry-run'),
  verbose: args.includes('-v') || args.includes('--verbose'),
  interactive: !args.some(arg => ['--force', '--skip', '--backup', '--dry-run'].includes(arg))
};

// Show help if requested
if (options.help) {
  console.log('🤖 Claude Code Commands Setup');
  console.log('==============================');
  console.log('');
  console.log('Usage: npx claude-setup [options]');
  console.log('');
  console.log('Options:');
  console.log('  --dry-run      Preview changes without modifying files');
  console.log('  -v, --verbose  Show detailed information (use with --dry-run)');
  console.log('  --skip         Skip existing files (preserve customizations)');
  console.log('  --backup       Backup existing files before replacing');
  console.log('  --force        Replace all files (creates backup)');
  console.log('  --skip-scripts Skip merging npm scripts into package.json');
  console.log('  --help         Show this help message');
  console.log('');
  console.log('Default behavior is interactive - you\'ll be prompted for conflicts.');
  process.exit(0);
}

// Check git status of a file
function checkGitStatus(filepath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return 'NEW_FILE';
    }
    
    // Check if file is tracked by git
    try {
      execSync(`git ls-files --error-unmatch "${filepath}"`, { stdio: 'ignore' });
    } catch {
      return 'UNTRACKED';
    }
    
    // Check for uncommitted changes
    const diffOutput = execSync(`git diff --name-only "${filepath}"`, { encoding: 'utf8' });
    const stagedOutput = execSync(`git diff --staged --name-only "${filepath}"`, { encoding: 'utf8' });
    
    if (diffOutput.trim() || stagedOutput.trim()) {
      return 'UNCOMMITTED';
    }
    
    return 'CLEAN';
  } catch {
    // If git commands fail, assume file is safe to modify
    return 'UNKNOWN';
  }
}

// Dry run data collector
const dryRunData = {
  safetyWarnings: [],
  newFiles: [],
  modifiedFiles: [],
  skippedFiles: [],
  packageJsonChanges: null,
  totalSize: 0
};

// Initialize setup
if (!options['dry-run']) {
  console.log('🤖 Claude Code Commands Setup');
  console.log('==============================');
} else {
  console.log('🔍 DRY RUN - Analyzing impact on your repository...');
  console.log('');
}

// Check if we're in a git repository
function isGitRepo() {
  try {
    execSync('git status', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!isGitRepo()) {
  console.log('❌ Not a git repository. Run "git init" first.');
  process.exit(1);
}

// Utility function to get all files recursively
function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// Detect conflicts between source and target
function detectConflicts(sourceDir, targetDir) {
  const conflicts = [];
  if (!fs.existsSync(targetDir)) return conflicts;
  
  const sourceFiles = getAllFiles(sourceDir);
  for (const file of sourceFiles) {
    const relativePath = path.relative(sourceDir, file);
    const targetPath = path.join(targetDir, relativePath);
    if (fs.existsSync(targetPath)) {
      conflicts.push(relativePath);
    }
  }
  return conflicts;
}

// Prompt user for conflict resolution
async function promptUser(conflicts) {
  console.log('');
  console.log(`⚠️  Found ${conflicts.length} existing file(s):`);
  // Show first 5 conflicts
  conflicts.slice(0, 5).forEach(file => {
    console.log(`   • ${file}`);
  });
  if (conflicts.length > 5) {
    console.log(`   ... and ${conflicts.length - 5} more`);
  }
  
  console.log('');
  console.log('How would you like to proceed?');
  console.log('  1. Skip - Keep your existing files (recommended)');
  console.log('  2. Backup - Backup existing and install fresh');
  console.log('  3. Merge - Add only non-conflicting files');
  console.log('  4. Cancel - Exit without changes');
  console.log('');
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Choice [1-4]: ', (answer) => {
      rl.close();
      switch (answer.trim()) {
        case '1': resolve('skip'); break;
        case '2': resolve('backup'); break;
        case '3': resolve('merge'); break;
        case '4': resolve('cancel'); break;
        default: 
          console.log('Invalid choice, using "skip" as default');
          resolve('skip');
      }
    });
  });
}

// Determine resolution strategy
async function determineStrategy(conflicts, options) {
  if (conflicts.length === 0) return 'proceed';
  
  if (options.skip) return 'skip';
  if (options.backup) return 'backup';
  if (options.force) return 'backup'; // Force is like backup but less interactive
  if (options.interactive) return await promptUser(conflicts);
  
  return 'skip'; // Default safe behavior
}

// Copy directory recursively
function copyRecursive(source, target, skipExisting = false) {
  // Create target directory if it doesn't exist
  if (!options['dry-run'] && !fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const items = fs.readdirSync(source);
  let copied = 0;
  let skipped = 0;
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    if (fs.statSync(sourcePath).isDirectory()) {
      const result = copyRecursive(sourcePath, targetPath, skipExisting);
      copied += result.copied;
      skipped += result.skipped;
    } else {
      const gitStatus = checkGitStatus(targetPath);
      const fileSize = fs.statSync(sourcePath).size;
      
      if (skipExisting && fs.existsSync(targetPath)) {
        skipped++;
        if (options['dry-run']) {
          dryRunData.skippedFiles.push({ path: targetPath, reason: 'exists', gitStatus });
        }
      } else {
        if (options['dry-run']) {
          // Collect data for dry run
          if (gitStatus === 'NEW_FILE') {
            dryRunData.newFiles.push({ path: targetPath, size: fileSize });
          } else if (gitStatus === 'UNCOMMITTED') {
            dryRunData.safetyWarnings.push(`${targetPath} has uncommitted changes`);
            dryRunData.modifiedFiles.push({ path: targetPath, gitStatus, size: fileSize });
          } else if (gitStatus === 'UNTRACKED') {
            dryRunData.safetyWarnings.push(`${targetPath} exists but is not in version control`);
            dryRunData.modifiedFiles.push({ path: targetPath, gitStatus, size: fileSize });
          } else {
            dryRunData.modifiedFiles.push({ path: targetPath, gitStatus, size: fileSize });
          }
          dryRunData.totalSize += fileSize;
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
        copied++;
      }
    }
  }
  
  return { copied, skipped };
}

// Backup existing directory
function backupDirectory(dir) {
  if (!fs.existsSync(dir)) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = `${dir}.backup-${timestamp}`;
  fs.renameSync(dir, backupPath);
  return backupPath;
}

// Safe copy with conflict resolution
function safeCopy(source, target, strategy, name) {
  let result = { copied: 0, skipped: 0, backedUp: null };
  
  switch (strategy) {
    case 'proceed':
      // No conflicts, just copy
      result = copyRecursive(source, target);
      break;
      
    case 'skip':
      // Skip all conflicts
      console.log(`   ⏭️  Preserving existing ${name}`);
      result.skipped = getAllFiles(source).length;
      break;
      
    case 'backup':
      // Backup existing and copy fresh
      if (fs.existsSync(target)) {
        result.backedUp = backupDirectory(target);
        console.log(`   📦 Backed up to ${path.basename(result.backedUp)}`);
      }
      result = copyRecursive(source, target);
      break;
      
    case 'merge':
      // Only copy non-conflicting files
      result = copyRecursive(source, target, true);
      break;
      
    case 'cancel':
      console.log('❌ Setup cancelled');
      process.exit(0);
      break;
  }
  
  return result;
}

// Essential scripts that should be included
const ESSENTIAL_SCRIPTS = {
  '// Claude Core': '=== Core Claude commands ===',
  'hygiene': 'npm run hygiene:quick --silent',
  'hygiene:quick': 'npm run lint:check && npm run test:check && npm run git:status:summary',
  'todo:list': 'node scripts/todo-github.js list',
  'todo:add': 'node scripts/todo-github.js add',
  'commit': 'npm run commit:check',
  'commit:check': 'npm run lint:check --silent && npm run test:check --silent',
  'learn': 'node scripts/learn.js',
  'tdd': 'node scripts/tdd.js',
  'docs': 'node scripts/docs.js',
  'lint:check': 'if [ -f \'eslint.config.js\' ] || [ -f \'.eslintrc.js\' ]; then npx eslint . --max-warnings 10 2>/dev/null || echo \'❌ Lint issues found\'; else echo \'⚠️ No linter configured\'; fi',
  'test:check': 'if grep -q \'"test"\' package.json 2>/dev/null; then npm test 2>/dev/null || echo \'❌ Tests failing\'; else echo \'⚠️ No tests configured\'; fi',
  'git:status:summary': 'echo "Branch: $(git branch --show-current 2>/dev/null || echo \'unknown\') | Changes: $(git status --porcelain | wc -l | xargs) files"'
};

// Merge package.json scripts
async function mergePackageJson(sourcePackagePath, targetPackagePath, options) {
  // Check if source package.json exists
  if (!fs.existsSync(sourcePackagePath)) {
    return { added: 0, skipped: 0, conflicts: [] };
  }
  
  // Check if target package.json exists
  if (!fs.existsSync(targetPackagePath)) {
    // Create new package.json with essential scripts
    const newPackage = {
      name: path.basename(process.cwd()),
      version: '1.0.0',
      description: '',
      scripts: ESSENTIAL_SCRIPTS,
      devDependencies: {}
    };
    
    fs.writeFileSync(targetPackagePath, JSON.stringify(newPackage, null, 2));
    console.log('   ✅ Created package.json with Claude scripts');
    return { added: Object.keys(ESSENTIAL_SCRIPTS).length, skipped: 0, conflicts: [] };
  }
  
  // Read target package.json
  const targetPackage = JSON.parse(fs.readFileSync(targetPackagePath, 'utf8'));
  const backupPath = targetPackagePath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  
  // Check git status of package.json
  const pkgGitStatus = checkGitStatus(targetPackagePath);
  if (options['dry-run'] && pkgGitStatus === 'UNCOMMITTED') {
    dryRunData.safetyWarnings.push('package.json has uncommitted changes (would be backed up)');
  }
  
  if (!options['dry-run']) {
    fs.writeFileSync(backupPath, JSON.stringify(targetPackage, null, 2));
    console.log(`   📦 Backed up package.json to ${path.basename(backupPath)}`);
  }
  
  // Initialize scripts if not present
  if (!targetPackage.scripts) {
    targetPackage.scripts = {};
  }
  
  // Find conflicts
  const conflicts = [];
  for (const scriptName in ESSENTIAL_SCRIPTS) {
    if (targetPackage.scripts[scriptName] && 
        targetPackage.scripts[scriptName] !== ESSENTIAL_SCRIPTS[scriptName]) {
      conflicts.push(scriptName);
    }
  }
  
  // Handle conflicts based on strategy
  let strategy = 'merge';
  if (conflicts.length > 0) {
    if (options.skip) {
      strategy = 'skip';
    } else if (options.force) {
      strategy = 'replace';
    } else if (options['dry-run']) {
      // In dry-run, assume prefix strategy for conflicts
      strategy = 'prefix';
    } else if (options.interactive) {
      console.log('');
      console.log(`⚠️  Found ${conflicts.length} conflicting npm script(s):`);
      conflicts.slice(0, 5).forEach(script => {
        console.log(`   • ${script}`);
      });
      if (conflicts.length > 5) {
        console.log(`   ... and ${conflicts.length - 5} more`);
      }
      
      console.log('');
      console.log('How would you like to handle script conflicts?');
      console.log('  1. Skip - Keep your existing scripts');
      console.log('  2. Prefix - Add as claude:* scripts');
      console.log('  3. Replace - Use Claude scripts');
      console.log('  4. Cancel - Exit without changes');
      console.log('');
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      strategy = await new Promise((resolve) => {
        rl.question('Choice [1-4]: ', (answer) => {
          rl.close();
          switch (answer.trim()) {
            case '1': resolve('skip'); break;
            case '2': resolve('prefix'); break;
            case '3': resolve('replace'); break;
            case '4': resolve('cancel'); break;
            default: 
              console.log('Invalid choice, using "prefix" as default');
              resolve('prefix');
          }
        });
      });
    }
  }
  
  if (strategy === 'cancel') {
    console.log('❌ Script merge cancelled');
    return { added: 0, skipped: conflicts.length, conflicts };
  }
  
  // Apply scripts based on strategy
  let added = 0;
  let skipped = 0;
  
  for (const [scriptName, scriptContent] of Object.entries(ESSENTIAL_SCRIPTS)) {
    if (conflicts.includes(scriptName)) {
      switch (strategy) {
        case 'skip':
          skipped++;
          break;
        case 'prefix':
          targetPackage.scripts[`claude:${scriptName}`] = scriptContent;
          added++;
          break;
        case 'replace':
          targetPackage.scripts[scriptName] = scriptContent;
          added++;
          break;
      }
    } else if (!targetPackage.scripts[scriptName]) {
      targetPackage.scripts[scriptName] = scriptContent;
      added++;
    }
  }
  
  // In dry-run mode, just collect the changes
  if (options['dry-run']) {
    dryRunData.packageJsonChanges = {
      added,
      skipped,
      conflicts,
      strategy,
      wouldBackup: fs.existsSync(targetPackagePath),
      backupName: path.basename(backupPath)
    };
    return { added, skipped, conflicts, strategy };
  }
  
  // Write updated package.json
  fs.writeFileSync(targetPackagePath, JSON.stringify(targetPackage, null, 2));
  
  // Validate the merged package.json
  try {
    // Check if package.json is valid JSON
    JSON.parse(fs.readFileSync(targetPackagePath, 'utf8'));
    
    // Test a basic script if any were added
    if (added > 0 && targetPackage.scripts['git:status:summary']) {
      try {
        execSync('npm run git:status:summary', { stdio: 'ignore' });
      } catch {
        console.log('   ⚠️  Some scripts may need additional setup to work properly');
      }
    }
  } catch (error) {
    console.log(`   ❌ Error validating package.json: ${error.message}`);
    // Restore backup
    fs.copyFileSync(backupPath, targetPackagePath);
    console.log('   ↩️  Restored original package.json from backup');
    return { added: 0, skipped: conflicts.length, conflicts, error: true };
  }
  
  return { added, skipped, conflicts, strategy };
}

// Copy scripts directory
function copyScriptsDirectory(sourceDir, targetDir) {
  const scriptsNeeded = new Set();
  
  // Extract script file references from ESSENTIAL_SCRIPTS
  for (const scriptContent of Object.values(ESSENTIAL_SCRIPTS)) {
    const matches = scriptContent.match(/node scripts\/([^.\s]+\.js)/g);
    if (matches) {
      matches.forEach(match => {
        const filename = match.replace('node scripts/', '');
        scriptsNeeded.add(filename);
      });
    }
  }
  
  // Create scripts directory if it doesn't exist
  if (!options['dry-run'] && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  let copied = 0;
  let skipped = 0;
  
  // Copy needed script files
  for (const scriptFile of scriptsNeeded) {
    const sourcePath = path.join(sourceDir, scriptFile);
    const targetPath = path.join(targetDir, scriptFile);
    
    if (fs.existsSync(sourcePath)) {
      const gitStatus = checkGitStatus(targetPath);
      const fileSize = fs.statSync(sourcePath).size;
      
      if (!fs.existsSync(targetPath)) {
        if (options['dry-run']) {
          dryRunData.newFiles.push({ path: targetPath, size: fileSize });
        } else {
          fs.copyFileSync(sourcePath, targetPath);
          // Make script executable
          fs.chmodSync(targetPath, '755');
        }
        copied++;
      } else {
        if (options['dry-run']) {
          dryRunData.skippedFiles.push({ path: targetPath, reason: 'exists', gitStatus });
          if (gitStatus === 'UNTRACKED') {
            dryRunData.safetyWarnings.push(`${targetPath} exists but is not in version control`);
          }
        }
        skipped++;
      }
    }
  }
  
  return { copied, skipped };
}

// Display dry run results
function displayDryRunResults() {
  console.log('\n⚠️  SAFETY WARNINGS:');
  console.log('────────────────────');
  if (dryRunData.safetyWarnings.length > 0) {
    dryRunData.safetyWarnings.forEach(warning => {
      console.log(`• ${warning}`);
    });
  } else {
    console.log('• None - repository is clean ✅');
  }
  
  console.log('\n✅ SAFE TO ADD:');
  console.log('───────────────');
  console.log(`• ${dryRunData.newFiles.length} new files in .claude/commands/`);
  console.log(`• ${dryRunData.newFiles.filter(f => f.path.includes('.claude/agents')).length} new files in .claude/agents/`);
  console.log('• Configuration files: CLAUDE.md, AGENTS.md');
  
  if (dryRunData.packageJsonChanges) {
    console.log('\n📦 PACKAGE.JSON CHANGES:');
    console.log('───────────────────────');
    const changes = dryRunData.packageJsonChanges;
    console.log(`• Would add ${changes.added} new scripts`);
    if (changes.conflicts && changes.conflicts.length > 0) {
      console.log(`• Would conflict with ${changes.conflicts.length} existing scripts:`);
      changes.conflicts.forEach(script => {
        console.log(`  - ${script}: would ${changes.strategy === 'prefix' ? 'add claude: prefix' : changes.strategy}`);
      });
    }
    if (changes.wouldBackup) {
      console.log(`• Would create backup: ${changes.backupName}`);
    }
  }
  
  if (options.verbose) {
    console.log('\n📄 DETAILED FILE LIST:');
    console.log('──────────────────────');
    
    if (dryRunData.newFiles.length > 0) {
      console.log('\nNew files to create:');
      dryRunData.newFiles.forEach(file => {
        console.log(`  ${file.path}`);
        console.log('    Status: NEW_FILE ✅');
        console.log(`    Size: ${(file.size / 1024).toFixed(1)}KB`);
      });
    }
    
    if (dryRunData.modifiedFiles.length > 0) {
      console.log('\nFiles to modify:');
      dryRunData.modifiedFiles.forEach(file => {
        console.log(`  ${file.path}`);
        const statusIcon = file.gitStatus === 'UNCOMMITTED' ? '⚠️' : 
                          file.gitStatus === 'UNTRACKED' ? '⚠️' : '✅';
        console.log(`    Status: ${file.gitStatus} ${statusIcon}`);
        console.log(`    Size: ${(file.size / 1024).toFixed(1)}KB`);
      });
    }
    
    if (dryRunData.skippedFiles.length > 0) {
      console.log('\nFiles to skip:');
      dryRunData.skippedFiles.forEach(file => {
        console.log(`  ${file.path} (${file.reason})`);
      });
    }
  }
  
  console.log('\n📊 SUMMARY:');
  console.log('──────────');
  console.log(`Files to create: ${dryRunData.newFiles.length}`);
  console.log(`Files to modify: ${dryRunData.modifiedFiles.length}`);
  console.log(`Files to skip: ${dryRunData.skippedFiles.length}`);
  console.log(`Space required: ~${(dryRunData.totalSize / 1024).toFixed(0)}KB`);
  
  if (dryRunData.safetyWarnings.length > 0) {
    console.log('\n⚠️  Run \'git status\' to review uncommitted changes before proceeding');
  }
  
  console.log('\n✨ Run \'npx claude-setup\' without --dry-run to apply these changes.\n');
}

// Main setup function
async function main() {
  // Define source and target paths
  const sourceCommands = path.join(__dirname, '../.claude/commands');
  const targetCommands = '.claude/commands';
  const sourceAgents = path.join(__dirname, '../.claude/agents');
  const targetAgents = '.claude/agents';
  
  // Check if source files exist
  if (!fs.existsSync(sourceCommands)) {
    console.log('❌ Source commands not found. Make sure you\'re running from the correct package.');
    process.exit(1);
  }
  
  // Create .claude directory if it doesn't exist
  if (!fs.existsSync('.claude')) {
    if (!options['dry-run']) {
      fs.mkdirSync('.claude', { recursive: true });
      console.log('✅ Created .claude directory');
    }
  }
  
  // Detect conflicts
  const commandConflicts = detectConflicts(sourceCommands, targetCommands);
  const agentConflicts = detectConflicts(sourceAgents, targetAgents);
  const allConflicts = [...new Set([...commandConflicts, ...agentConflicts])];
  
  // Determine strategy
  const strategy = await determineStrategy(allConflicts, options);
  
  // Copy commands
  if (!options['dry-run']) {
    console.log('\n📦 Installing Claude commands...');
  }
  const commandResult = safeCopy(sourceCommands, targetCommands, strategy, 'commands');
  if (!options['dry-run']) {
    if (commandResult.copied > 0) {
      console.log(`   ✅ Installed ${commandResult.copied} command files`);
    }
    if (commandResult.skipped > 0) {
      console.log(`   ⏭️  Skipped ${commandResult.skipped} existing files`);
    }
  }
  
  // Copy agents
  let agentResult = { copied: 0, skipped: 0, backedUp: null };
  if (fs.existsSync(sourceAgents)) {
    if (!options['dry-run']) {
      console.log('\n📦 Installing Claude agents...');
    }
    agentResult = safeCopy(sourceAgents, targetAgents, strategy, 'agents');
    if (!options['dry-run']) {
      if (agentResult.copied > 0) {
        console.log(`   ✅ Installed ${agentResult.copied} agent files`);
      }
      if (agentResult.skipped > 0) {
        console.log(`   ⏭️  Skipped ${agentResult.skipped} existing files`);
      }
    }
  }
  
  // Copy essential root files (only if they don't exist)
  if (!options['dry-run']) {
    console.log('\n📦 Setting up configuration files...');
  }
  const filesToCopy = ['CLAUDE.md', 'AGENTS.md'];
  let configCopied = 0;
  
  filesToCopy.forEach(file => {
    const sourcePath = path.join(__dirname, '..', file);
    if (fs.existsSync(sourcePath) && !fs.existsSync(file)) {
      if (options['dry-run']) {
        const fileSize = fs.statSync(sourcePath).size;
        dryRunData.newFiles.push({ path: file, size: fileSize });
      } else {
        fs.copyFileSync(sourcePath, file);
        console.log(`   ✅ Created ${file}`);
      }
      configCopied++;
    }
  });
  
  if (!options['dry-run'] && configCopied === 0) {
    console.log('   ℹ️  Configuration files already exist');
  }
  
  // Merge package.json scripts (unless skipped)
  let packageResult = { added: 0, skipped: 0, conflicts: [] };
  let scriptsResult = { copied: 0, skipped: 0 };
  
  if (!options['skip-scripts']) {
    if (!options['dry-run']) {
      console.log('\n📦 Setting up npm scripts...');
    }
    const sourcePackagePath = path.join(__dirname, '..', 'package.json');
    const targetPackagePath = 'package.json';
    
    packageResult = await mergePackageJson(sourcePackagePath, targetPackagePath, options);
    
    if (!options['dry-run']) {
      if (packageResult.added > 0) {
        console.log(`   ✅ Added ${packageResult.added} npm scripts`);
      }
      if (packageResult.skipped > 0) {
        console.log(`   ⏭️  Skipped ${packageResult.skipped} conflicting scripts`);
      }
    }
    
    // Copy required script files
    if (packageResult.added > 0) {
      if (!options['dry-run']) {
        console.log('\n📦 Installing script files...');
      }
      const sourceScripts = path.join(__dirname, '../scripts');
      const targetScripts = 'scripts';
      
      scriptsResult = copyScriptsDirectory(sourceScripts, targetScripts);
      if (!options['dry-run']) {
        if (scriptsResult.copied > 0) {
          console.log(`   ✅ Installed ${scriptsResult.copied} script files`);
        }
        if (scriptsResult.skipped > 0) {
          console.log(`   ⏭️  Skipped ${scriptsResult.skipped} existing script files`);
        }
      }
    }
  }
  
  // Display results
  if (options['dry-run']) {
    displayDryRunResults();
    return;
  }
  
  // Final message for actual installation
  console.log('');
  console.log('🎉 Setup complete!');
  console.log('');
  
  if (strategy === 'skip' || strategy === 'merge') {
    console.log('ℹ️  Some files were preserved to keep your customizations');
    console.log('');
  }
  
  console.log('Next steps:');
  console.log('• Review .claude/commands/ for available commands');
  
  if (packageResult.added > 0) {
    console.log('• Run npm commands: npm run hygiene, npm run todo:list, etc.');
    if (packageResult.strategy === 'prefix') {
      console.log('  (Some commands may be prefixed with "claude:" to avoid conflicts)');
    }
  }
  
  console.log('• Use /hygiene to check project health');
  console.log('• Use /todo to manage tasks');
  console.log('• Customize commands for your specific needs');
  
  if (commandResult.backedUp || agentResult.backedUp) {
    console.log('');
    console.log('📝 Note: Your previous setup was backed up');
  }
}

// Run the setup
main().catch(error => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});