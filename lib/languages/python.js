import fs from 'fs-extra';
import chalk from 'chalk';

async function setup(config, detection) {
  if (!detection.existingFiles.pyprojectToml) {
    const pyprojectToml = `[tool.ruff]
line-length = 88
target-version = "py38"

[tool.ruff.lint]
select = ["E", "F", "W", "C90", "I", "N", "UP", "YTT", "S", "BLE", "FBT", "B", "A", "COM", "C4", "DTZ", "T10", "EM", "EXE", "ISC", "ICN", "G", "INP", "PIE", "T20", "PYI", "PT", "Q", "RSE", "RET", "SLF", "SIM", "TID", "TCH", "ARG", "PTH", "ERA", "PD", "PGH", "PL", "TRY", "NPY", "RUF"]
ignore = []

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
`;
    
    await fs.writeFile('pyproject.toml', pyprojectToml);
    console.log(chalk.gray('   Created pyproject.toml'));
    console.log(chalk.yellow('   Run: pip install ruff pytest'));
  } else {
    console.log(chalk.gray('   Found existing pyproject.toml'));
    console.log(chalk.yellow('   💡 Recommended dependencies: ruff pytest'));
  }
}

export default {
  name: 'Python',
  installCommand: 'pip install -e .',
  lintCommand: 'ruff check',
  testCommand: 'pytest',
  setup
};