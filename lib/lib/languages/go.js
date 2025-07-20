import chalk from 'chalk';
async function setup(_config, detection) {
    if (!detection.existingFiles.goMod) {
        console.log(chalk.yellow('   Run: go mod init <module-name>'));
    }
    else {
        console.log(chalk.gray('   Found existing go.mod'));
    }
    console.log(chalk.yellow('   Install: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest'));
}
const goHandler = {
    name: 'Go',
    installCommand: 'go mod download',
    lintCommand: 'golangci-lint run',
    testCommand: 'go test ./...',
    setup
};
export default goHandler;
//# sourceMappingURL=go.js.map