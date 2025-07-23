# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions workflows for automated releases
- NPM publishing workflow (optional)
- Release management scripts in package.json
- Enhanced package.json metadata for better NPM discoverability

### Changed
- Improved package.json description and keywords for better discoverability

## [1.0.0] - 2025-01-22

### Added
- Interactive CLI for setting up Claude Code projects
- Support for 6 programming languages (JavaScript, Python, Go, Rust, Java, Swift)
- 3 quality levels (Strict, Standard, Relaxed) with configurable linting rules
- 20+ custom Claude Code commands for structured development
- GitHub Codespaces DevContainer generator
- Documentation system with CLAUDE.md and ACTIVE_WORK.md templates
- Quality infrastructure with ESLint, pre-commit hooks, and CI/CD workflows
- NPX distribution support for easy installation

### Removed
- Recovery system implementation (was incomplete and creating broken promises)

### Fixed
- All 295 tests now pass with zero failures
- TypeScript compilation and distribution setup
- ESLint configuration for various quality levels