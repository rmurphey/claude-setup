import chalk from 'chalk';

import type { LanguageHandler, LanguageConfig, LanguageDetection } from '../../types/language-handler.js';

async function setup(_config: LanguageConfig, detection: LanguageDetection): Promise<void> {
  if (detection.existingFiles.buildGradle) {
    console.log(chalk.gray('   Found existing Gradle project'));
    console.log(chalk.yellow('   💡 Consider adding Spotless and Checkstyle plugins'));
  } else if (detection.existingFiles.pomXml) {
    console.log(chalk.gray('   Found existing Maven project'));
    console.log(chalk.yellow('   💡 Consider adding Spotless and Checkstyle plugins'));
  } else {
    console.log(chalk.yellow('   Run: gradle init (or maven setup)'));
    console.log(chalk.yellow('   💡 Consider using Gradle with Kotlin DSL for better tooling'));
  }
}

const javaHandler: LanguageHandler = {
  name: 'Java',
  installCommand: 'mvn install',
  lintCommand: 'mvn checkstyle:check',
  testCommand: 'mvn test',
  setup
};

export default javaHandler;