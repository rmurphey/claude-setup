import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

interface QualityLevelConfig {
  name: string;
  description: string;
  configFile: string;
  enforceAllRules?: boolean;
  allowExceptions?: boolean;
  allowMinorVariations?: boolean;
  allowVariations?: boolean;
  enforceCriticalOnly?: boolean;
  autoFix: boolean;
}

interface QualityLevelsMap {
  strict: QualityLevelConfig;
  standard: QualityLevelConfig;
  relaxed: QualityLevelConfig;
}

type QualityLevelName = keyof QualityLevelsMap;

interface QualityConfig {
  qualityLevel: QualityLevelName;
  updatedAt: string;
  description: string;
}

interface AvailableLevel {
  value: QualityLevelName;
  name: string;
  description: string;
}

export const QualityLevels: QualityLevelsMap = {
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
  private configPath: string;

  constructor() {
    this.configPath = '.git-quality-config.json';
  }

  async getCurrentLevel(): Promise<QualityLevelName> {
    try {
      if (existsSync(this.configPath)) {
        const config: QualityConfig = JSON.parse(await readFile(this.configPath, 'utf8'));
        return config.qualityLevel || 'standard';
      }
    } catch {
      console.warn('Warning: Could not read quality config, using standard level');
    }
    return 'standard';
  }

  async setQualityLevel(level: QualityLevelName): Promise<QualityConfig> {
    if (!QualityLevels[level]) {
      throw new Error(`Invalid quality level: ${level}. Available: ${Object.keys(QualityLevels).join(', ')}`);
    }

    const config: QualityConfig = {
      qualityLevel: level,
      updatedAt: new Date().toISOString(),
      description: QualityLevels[level].description
    };

    await writeFile(this.configPath, JSON.stringify(config, null, 2));
    await this.updateESLintConfig(level);
    
    return config;
  }

  private async updateESLintConfig(level: QualityLevelName): Promise<void> {
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

  async getAvailableLevels(): Promise<AvailableLevel[]> {
    return Object.entries(QualityLevels).map(([key, config]) => ({
      value: key as QualityLevelName,
      name: config.name,
      description: config.description
    }));
  }
}

export default QualityLevelManager;