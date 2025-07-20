import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
async function setup(_config, detection) {
    // Create modern ESLint configuration
    await createEslintConfig();
    // Check if package.json exists, create if not
    if (!detection.existingFiles.packageJson) {
        const packageJson = {
            name: path.basename(process.cwd()),
            version: '1.0.0',
            scripts: {
                lint: 'eslint .',
                'lint:fix': 'eslint . --fix',
                format: 'prettier --write .',
                test: 'jest',
                'update-readme': 'node -e "import(\'./lib/readme-updater.js\').then(m => m.updateReadme().then(r => console.log(\'README updated:\', r)))"'
            }
        };
        await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
        console.log(chalk.gray('   Created package.json'));
        console.log(chalk.yellow('   Run: npm install --save-dev eslint prettier jest'));
    }
    else {
        console.log(chalk.gray('   Found existing package.json'));
        // Check if quality scripts exist, suggest additions if missing
        try {
            const existingPackage = JSON.parse(await fs.readFile('package.json', 'utf8'));
            const missingScripts = [];
            if (!existingPackage.scripts?.lint)
                missingScripts.push('lint: "eslint ."');
            if (!existingPackage.scripts?.['lint:fix'])
                missingScripts.push('"lint:fix": "eslint . --fix"');
            if (!existingPackage.scripts?.format)
                missingScripts.push('format: "prettier --write ."');
            if (!existingPackage.scripts?.test && !existingPackage.scripts?.test)
                missingScripts.push('test: "jest"');
            if (!existingPackage.scripts?.['update-readme'])
                missingScripts.push('"update-readme": "node -e \\"import(\'./lib/readme-updater.js\').then(m => m.updateReadme().then(r => console.log(\'README updated:\', r)))\\"');
            if (missingScripts.length > 0) {
                console.log(chalk.yellow('   💡 Consider adding these scripts to package.json:'));
                missingScripts.forEach(script => console.log(chalk.gray(`      ${script}`)));
            }
            console.log(chalk.yellow('   💡 Recommended dev dependencies: eslint prettier jest'));
        }
        catch {
            console.log(chalk.yellow('   Run: npm install --save-dev eslint prettier jest'));
        }
    }
}
async function createEslintConfig() {
    try {
        const templatePath = path.join(__dirname, '..', '..', '..', 'templates', 'eslint.config.js');
        const targetPath = 'eslint.config.js';
        if (await fs.pathExists(templatePath)) {
            await fs.copy(templatePath, targetPath);
            console.log(chalk.gray('   Created modern eslint.config.js'));
        }
        else {
            console.log(chalk.yellow('   Warning: Could not find ESLint template'));
        }
    }
    catch {
        console.log(chalk.yellow('   Warning: Could not create ESLint config'));
    }
}
const javascriptHandler = {
    name: 'JavaScript/TypeScript',
    installCommand: 'npm install',
    lintCommand: 'npm run lint',
    testCommand: 'npm test',
    setup
};
export default javascriptHandler;
//# sourceMappingURL=javascript.js.map