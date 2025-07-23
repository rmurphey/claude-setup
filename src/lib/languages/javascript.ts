import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

import type { LanguageHandler, LanguageConfig, LanguageDetection } from '../../types/language-handler.js';

async function setup(_config: LanguageConfig, detection: LanguageDetection): Promise<void> {
  // Detect framework if package.json exists
  const framework = await detectFramework(detection);
  
  // Create modern ESLint configuration
  await createEslintConfig(framework);
  
  // Check if package.json exists, create if not
  if (!detection.existingFiles.packageJson) {
    const packageJson = createFrameworkPackageJson(framework);
    await fs.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    console.log(chalk.gray('   Created package.json'));
    console.log(chalk.yellow(`   Run: npm install --save-dev ${getFrameworkDevDeps(framework)}`));
  } else {
    console.log(chalk.gray('   Found existing package.json'));
    // Check if quality scripts exist, suggest additions if missing
    try {
      const existingPackage = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const missingScripts: string[] = [];
      
      if (!existingPackage.scripts?.lint) missingScripts.push('lint: "eslint ."');
      if (!existingPackage.scripts?.['lint:fix']) missingScripts.push('"lint:fix": "eslint . --fix"');
      if (!existingPackage.scripts?.format) missingScripts.push('format: "prettier --write ."');
      if (!existingPackage.scripts?.test && !existingPackage.scripts?.test) missingScripts.push('test: "jest"');
      if (!existingPackage.scripts?.['update-readme']) missingScripts.push('"update-readme": "node -e \\"import(\'./lib/readme-updater.js\').then(m => m.updateReadme().then(r => console.log(\'README updated:\', r)))\\"');
      
      if (missingScripts.length > 0) {
        console.log(chalk.yellow('   💡 Consider adding these scripts to package.json:'));
        missingScripts.forEach(script => console.log(chalk.gray(`      ${script}`)));
      }
      
      console.log(chalk.yellow('   💡 Recommended dev dependencies: eslint prettier jest'));
    } catch {
      console.log(chalk.yellow('   Run: npm install --save-dev eslint prettier jest'));
    }
  }
}

type JSFramework = 'react' | 'vue' | 'angular' | 'next' | 'nuxt' | 'vite' | 'vanilla';

async function detectFramework(detection: LanguageDetection): Promise<JSFramework> {
  if (!detection.existingFiles.packageJson) {
    return 'vanilla';
  }
  
  try {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    if (deps.next) return 'next';
    if (deps.nuxt) return 'nuxt';
    if (deps.react) return 'react';
    if (deps.vue) return 'vue';
    if (deps['@angular/core']) return 'angular';
    if (deps.vite) return 'vite';
    
    return 'vanilla';
  } catch {
    return 'vanilla';
  }
}

async function createEslintConfig(framework: JSFramework): Promise<void> {
  try {
    const templatePath = path.join(__dirname, '..', '..', '..', 'templates', 'eslint.config.js');
    const targetPath = 'eslint.config.js';
    
    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, targetPath);
      console.log(chalk.gray('   Created modern eslint.config.js'));
    } else {
      // Create framework-specific ESLint config
      await createFrameworkEslintConfig(framework);
    }
  } catch {
    console.log(chalk.yellow('   Warning: Could not create ESLint config'));
  }
}

async function createFrameworkEslintConfig(framework: JSFramework): Promise<void> {
  const baseConfig = `import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }`;

  let frameworkConfig = '';
  
  switch (framework) {
    case 'react':
    case 'next':
      frameworkConfig = `,
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react: require('eslint-plugin-react')
    },
    rules: {
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'warn'
    }
  }`;
      console.log(chalk.yellow('   💡 Install: npm install --save-dev eslint-plugin-react'));
      break;
      
    case 'vue':
    case 'nuxt':
      frameworkConfig = `,
  {
    files: ['**/*.vue'],
    plugins: {
      vue: require('eslint-plugin-vue')
    },
    rules: {
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-vars': 'error'
    }
  }`;
      console.log(chalk.yellow('   💡 Install: npm install --save-dev eslint-plugin-vue'));
      break;
      
    case 'angular':
      frameworkConfig = `,
  {
    files: ['**/*.ts'],
    plugins: {
      '@angular-eslint': require('@angular-eslint/eslint-plugin')
    },
    rules: {
      '@angular-eslint/component-class-suffix': 'error',
      '@angular-eslint/directive-class-suffix': 'error'
    }
  }`;
      console.log(chalk.yellow('   💡 Install: npm install --save-dev @angular-eslint/eslint-plugin'));
      break;
  }

  const config = `${baseConfig}${frameworkConfig}
];`;

  await fs.writeFile('eslint.config.js', config);
  console.log(chalk.gray(`   Created ${framework}-optimized eslint.config.js`));
}

function createFrameworkPackageJson(framework: JSFramework) {
  const baseName = path.basename(process.cwd());
  const basePackage = {
    name: baseName,
    version: '1.0.0',
    scripts: {
      lint: 'eslint .',
      'lint:fix': 'eslint . --fix',
      format: 'prettier --write .',
      'update-readme': 'node -e "import(\'./lib/readme-updater.js\').then(m => m.updateReadme().then(r => console.log(\'README updated:\', r)))"'
    }
  };

  switch (framework) {
    case 'react':
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          start: 'react-scripts start',
          build: 'react-scripts build',
          test: 'react-scripts test',
          eject: 'react-scripts eject'
        }
      };
      
    case 'next':
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          test: 'jest'
        }
      };
      
    case 'vue':
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          serve: 'vue-cli-service serve',
          build: 'vue-cli-service build',
          test: 'vue-cli-service test:unit'
        }
      };
      
    case 'nuxt':
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          dev: 'nuxt dev',
          build: 'nuxt build',
          generate: 'nuxt generate',
          preview: 'nuxt preview',
          test: 'jest'
        }
      };
      
    case 'angular':
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          serve: 'ng serve',
          build: 'ng build',
          test: 'ng test',
          e2e: 'ng e2e'
        }
      };
      
    case 'vite':
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
          test: 'vitest'
        }
      };
      
    default:
      return {
        ...basePackage,
        scripts: {
          ...basePackage.scripts,
          test: 'jest'
        }
      };
  }
}

function getFrameworkDevDeps(framework: JSFramework): string {
  const base = 'eslint prettier jest';
  
  switch (framework) {
    case 'react':
      return `${base} eslint-plugin-react`;
    case 'next':
      return `${base} eslint-plugin-react @types/node`;
    case 'vue':
      return `${base} eslint-plugin-vue`;
    case 'nuxt':
      return `${base} eslint-plugin-vue @nuxt/types`;
    case 'angular':
      return `${base} @angular-eslint/eslint-plugin @types/node`;
    case 'vite':
      return `${base} vitest`;
    default:
      return base;
  }
}

const javascriptHandler: LanguageHandler = {
  name: 'JavaScript/TypeScript',
  installCommand: 'npm install',
  lintCommand: 'npm run lint',
  testCommand: 'npm test',
  setup
};

export default javascriptHandler;