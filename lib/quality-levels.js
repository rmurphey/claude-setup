import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

export const QualityLevels = {
  strict: {
    name: 'Strict',
    description: 'Enforce all formatting rules without exceptions',
    configFile: './lib/eslint-configs/strict.js',
    enforceAllRules: true,
    allowExceptions: false,
    autoFix: true
  },
  standard: {
    name: 'Standard',
    description: 'Balanced rules with minor formatting flexibility',
    configFile: './lib/eslint-configs/base.js',
    enforceAllRules: true,
    allowMinorVariations: true,
    autoFix: false
  },
  relaxed: {
    name: 'Relaxed',
    description: 'Focus on critical issues only, flexible formatting',
    configFile: './lib/eslint-configs/relaxed.js',
    enforceCriticalOnly: true,
    allowVariations: true,
    autoFix: false
  }
};

export class QualityLevelManager {
  constructor() {
    this.configPath = '.git-quality-config.json';
  }

  async getCurrentLevel() {
    try {
      if (existsSync(this.configPath)) {
        const config = JSON.parse(await readFile(this.configPath, 'utf8'));
        return config.qualityLevel || 'standard';
      }
    } catch (error) {
      console.warn('Warning: Could not read quality config, using standard level');
    }
    return 'standard';
  }

  async setQualityLevel(level) {
    if (!QualityLevels[level]) {
      throw new Error(`Invalid quality level: ${level}. Available: ${Object.keys(QualityLevels).join(', ')}`);
    }

    const config = {
      qualityLevel: level,
      updatedAt: new Date().toISOString(),
      description: QualityLevels[level].description
    };

    await writeFile(this.configPath, JSON.stringify(config, null, 2));
    await this.updateESLintConfig(level);
    
    return config;
  }

  async updateESLintConfig(level) {
    const qualityConfig = QualityLevels[level];
    const configContent = `// Auto-generated ESLint config for ${qualityConfig.name} quality level
// Updated: ${new Date().toISOString()}
import config from '${qualityConfig.configFile}';

export default [
  ...config,
  {
    files: ['**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly'
      }
    }
  }
];`;

    await writeFile('eslint.config.js', configContent);
  }

  async getAvailableLevels() {
    return Object.entries(QualityLevels).map(([key, config]) => ({
      value: key,
      name: config.name,
      description: config.description
    }));
  }
}

export default QualityLevelManager;