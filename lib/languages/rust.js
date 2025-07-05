const chalk = require('chalk');

async function setup(config, detection) {
  if (!detection.existingFiles.cargoToml) {
    console.log(chalk.yellow('   Run: cargo init .'));
  } else {
    console.log(chalk.gray('   Found existing Cargo.toml'));
  }
  console.log(chalk.yellow('   💡 Clippy linting is included with Rust toolchain'));
}

module.exports = { setup };