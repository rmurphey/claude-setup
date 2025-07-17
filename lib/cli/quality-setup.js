import inquirer from 'inquirer';
import chalk from 'chalk';
import { QualityLevelManager } from '../quality-levels.js';

export class QualitySetup {
  constructor() {
    this.manager = new QualityLevelManager();
  }

  async configure() {
    console.log(chalk.blue('\n🎯 Code Quality Hook Configuration\n'));
    
    const currentLevel = await this.manager.getCurrentLevel();
    const availableLevels = await this.manager.getAvailableLevels();
    
    console.log(chalk.gray(`Current quality level: ${chalk.yellow(currentLevel)}\n`));
    
    const { selectedLevel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedLevel',
        message: 'Select code quality level:',
        choices: availableLevels.map(level => ({
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
        console.error(chalk.red(`❌ Failed to update quality level: ${error.message}`));
        return false;
      }
    } else {
      console.log(chalk.gray('No changes made.'));
    }

    return true;
  }

  async showStatus() {
    const currentLevel = await this.manager.getCurrentLevel();
    const availableLevels = await this.manager.getAvailableLevels();
    const levelConfig = availableLevels.find(l => l.value === currentLevel);
    
    console.log(chalk.blue('\n📊 Code Quality Status\n'));
    console.log(`Current Level: ${chalk.yellow(levelConfig.name)}`);
    console.log(`Description: ${chalk.gray(levelConfig.description)}`);
    console.log(`Config File: ${chalk.gray('.git-quality-config.json')}`);
  }
}

export default QualitySetup;