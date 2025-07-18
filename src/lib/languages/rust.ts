import chalk from 'chalk';

import type { LanguageHandler, LanguageConfig, LanguageDetection } from '../../types/language-handler.js';

async function setup(_config: LanguageConfig, detection: LanguageDetection): Promise<void> {
  if (!detection.existingFiles.cargoToml) {
    console.log(chalk.yellow('   Run: cargo init .'));
  } else {
    console.log(chalk.gray('   Found existing Cargo.toml'));
  }
  console.log(chalk.yellow('   💡 Clippy linting is included with Rust toolchain'));
}

const rustHandler: LanguageHandler = {
  name: 'Rust',
  installCommand: 'cargo build',
  lintCommand: 'cargo clippy',
  testCommand: 'cargo test',
  setup
};

export default rustHandler;