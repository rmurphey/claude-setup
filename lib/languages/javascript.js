import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

async function setup(config, detection) {
  // Check if package.json exists, create if not
  if (!detection.existingFiles.packageJson) {
    const packageJson = {
      name: path.basename(process.cwd()),
      version: '1.0.0',
      scripts: {
        lint: 'eslint .',
        'lint:fix': 'eslint . --fix',
        format: 'prettier --write .',
        test: 'jest'
      }
    };
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log(chalk.gray('   Created package.json'));
    console.log(chalk.yellow('   Run: npm install --save-dev eslint prettier jest'));
  } else {
    console.log(chalk.gray('   Found existing package.json'));
    // Check if quality scripts exist, suggest additions if missing
    try {
      const existingPackage = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const missingScripts = [];
      
      if (!existingPackage.scripts?.lint) missingScripts.push('lint: "eslint ."');
      if (!existingPackage.scripts?.['lint:fix']) missingScripts.push('"lint:fix": "eslint . --fix"');
      if (!existingPackage.scripts?.format) missingScripts.push('format: "prettier --write ."');
      if (!existingPackage.scripts?.test && !existingPackage.scripts?.test) missingScripts.push('test: "jest"');
      
      if (missingScripts.length > 0) {
        console.log(chalk.yellow('   💡 Consider adding these scripts to package.json:'));
        missingScripts.forEach(script => console.log(chalk.gray(`      ${script}`)));
      }
      
      console.log(chalk.yellow('   💡 Recommended dev dependencies: eslint prettier jest'));
    } catch (error) {
      console.log(chalk.yellow('   Run: npm install --save-dev eslint prettier jest'));
    }
  }
}

export default { setup };