import inquirer from 'inquirer';
import chalk from 'chalk';

import { QualityLevelManager } from '../quality-levels.js';
import type { QualityLevel } from '../../types/index.js';

interface QualityLevelOption {
  name: string;
  value: QualityLevel;
  description: string;
}

interface QualityConfigurationAnswers {
  selectedLevel: QualityLevel;
}

export class QualitySetup {
  private readonly manager: QualityLevelManager;

  constructor() {
    this.manager = new QualityLevelManager();
  }

  async configure(): Promise<boolean> {
    console.log(chalk.blue('\n🎯 Code Quality Hook Configuration\n'));
    
    const currentLevel = await this.manager.getCurrentLevel();
    const availableLevels = await this.manager.getAvailableLevels();
    
    console.log(chalk.gray(`Current quality level: ${chalk.yellow(currentLevel)}\n`));
    
    const { selectedLevel } = await inquirer.prompt<QualityConfigurationAnswers>([
      {
        type: 'list',
        name: 'selectedLevel',
        message: 'Select code quality level:',
        choices: availableLevels.map((level: QualityLevelOption) => ({
          name: `${level.name} - ${level.description}`,
          value: level.value
        })),
        default: currentLevel
      }
    ]);

    if (selectedLevel !== currentLevel) {
      console.log(chalk.blue('\n⚙️  Updating configuration...'));
      
      try {
        await this.manager.setQualityLevel(selectedLevel);
        console.log(chalk.green(`✅ Quality level set to: ${chalk.bold(selectedLevel)}`));
        console.log(chalk.gray('ESLint configuration updated automatically.'));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(chalk.red(`❌ Failed to update quality level: ${errorMessage}`));
        return false;
      }
    } else {
      console.log(chalk.gray('No changes made.'));
    }

    return true;
  }

  async showStatus(): Promise<void> {
    const currentLevel = await this.manager.getCurrentLevel();
    const availableLevels = await this.manager.getAvailableLevels();
    const levelConfig = availableLevels.find((l: QualityLevelOption) => l.value === currentLevel);
    
    console.log(chalk.blue('\n📊 Code Quality Status\n'));
    console.log(`Current Level: ${chalk.yellow(levelConfig?.name || currentLevel)}`);
    console.log(`Description: ${chalk.gray(levelConfig?.description || 'No description available')}`);
    console.log(`Config File: ${chalk.gray('.git-quality-config.json')}`);
  }
}

export default QualitySetup;