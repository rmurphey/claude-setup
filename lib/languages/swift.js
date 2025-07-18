import path from 'path';

import fs from 'fs-extra';
import chalk from 'chalk';

async function setup(config, detection) {
  // Create SwiftLint configuration
  await createSwiftLintConfig();
  
  // Check if Package.swift exists, create if not
  if (!detection.existingFiles.packageSwift) {
    const packageSwift = `// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "${path.basename(process.cwd())}",
    platforms: [
        .macOS(.v10_15),
        .iOS(.v13),
        .watchOS(.v6),
        .tvOS(.v13)
    ],
    products: [
        .library(
            name: "${path.basename(process.cwd())}",
            targets: ["${path.basename(process.cwd())}"]),
    ],
    dependencies: [
        // Add package dependencies here
    ],
    targets: [
        .target(
            name: "${path.basename(process.cwd())}",
            dependencies: []),
        .testTarget(
            name: "${path.basename(process.cwd())}Tests",
            dependencies: ["${path.basename(process.cwd())}"]),
    ]
)
`;
    await fs.writeFile('Package.swift', packageSwift);
    console.log(chalk.gray('   Created Package.swift'));
    
    // Create basic source structure
    await fs.ensureDir('Sources');
    await fs.ensureDir(`Sources/${path.basename(process.cwd())}`);
    await fs.ensureDir('Tests');
    await fs.ensureDir(`Tests/${path.basename(process.cwd())}Tests`);
    
    // Create a basic Swift file
    const mainSwift = `// ${path.basename(process.cwd())} - Main module

public struct ${path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '')} {
    public init() {}
    
    public func hello() -> String {
        "Hello, World!"
    }
}
`;
    await fs.writeFile(`Sources/${path.basename(process.cwd())}/${path.basename(process.cwd())}.swift`, mainSwift);
    
    // Create a basic test file
    const testSwift = `@testable import ${path.basename(process.cwd())}
import XCTest

final class ${path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '')}Tests: XCTestCase {
    func testHello() throws {
        let instance = ${path.basename(process.cwd()).replace(/[^a-zA-Z0-9]/g, '')}()
        XCTAssertEqual(instance.hello(), "Hello, World!")
    }
}
`;
    await fs.writeFile(`Tests/${path.basename(process.cwd())}Tests/${path.basename(process.cwd())}Tests.swift`, testSwift);
    
    console.log(chalk.gray('   Created basic Swift package structure'));
    console.log(chalk.yellow('   Run: swift build && swift test'));
  } else {
    console.log(chalk.gray('   Found existing Package.swift'));
    console.log(chalk.yellow('   💡 Recommended: swift build && swift test'));
  }
  
  // Check for Xcode project
  if (!detection.existingFiles.xcodeproj && !detection.existingFiles.xcworkspace) {
    console.log(chalk.yellow('   💡 To create Xcode project: swift package generate-xcodeproj'));
  }
}

async function createSwiftLintConfig() {
  try {
    const templatePath = path.join(__dirname, '..', '..', 'templates', '.swiftlint.yml');
    const targetPath = '.swiftlint.yml';
    
    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, targetPath);
      console.log(chalk.gray('   Created .swiftlint.yml'));
    } else {
      // Create a basic SwiftLint config if template doesn't exist
      const swiftlintConfig = `# SwiftLint Configuration
disabled_rules:
  - line_length
  - trailing_whitespace

opt_in_rules:
  - empty_count
  - force_unwrapping
  - implicitly_unwrapped_optional

included:
  - Sources
  - Tests

excluded:
  - .build
  - .swiftpm

# Rule configurations
type_body_length:
  - 300 # warning
  - 400 # error

function_body_length:
  - 50 # warning
  - 100 # error

file_length:
  warning: 500
  error: 1200

identifier_name:
  min_length: 1
  max_length: 40

cyclomatic_complexity:
  warning: 10
  error: 20

nesting:
  type_level:
    warning: 3
    error: 6
  statement_level:
    warning: 5
    error: 10
`;
      await fs.writeFile(targetPath, swiftlintConfig);
      console.log(chalk.gray('   Created basic .swiftlint.yml'));
    }
  } catch (error) {
    console.log(chalk.yellow('   Warning: Could not create SwiftLint config'));
  }
}

export default {
  name: 'Swift',
  installCommand: 'swift package resolve',
  lintCommand: 'swiftlint',
  testCommand: 'swift test',
  setup
};