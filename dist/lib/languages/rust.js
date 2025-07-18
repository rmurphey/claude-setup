import chalk from 'chalk';
async function setup(_config, detection) {
    if (!detection.existingFiles.cargoToml) {
        console.log(chalk.yellow('   Run: cargo init .'));
    }
    else {
        console.log(chalk.gray('   Found existing Cargo.toml'));
    }
    console.log(chalk.yellow('   💡 Clippy linting is included with Rust toolchain'));
}
const rustHandler = {
    name: 'Rust',
    installCommand: 'cargo build',
    lintCommand: 'cargo clippy',
    testCommand: 'cargo test',
    setup
};
export default rustHandler;
//# sourceMappingURL=rust.js.map