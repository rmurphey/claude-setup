import chalk from 'chalk';

async function setup(config, detection) {
  if (!detection.existingFiles.goMod) {
    console.log(chalk.yellow('   Run: go mod init <module-name>'));
  } else {
    console.log(chalk.gray('   Found existing go.mod'));
  }
  console.log(chalk.yellow('   Install: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest'));
}

export default { setup };