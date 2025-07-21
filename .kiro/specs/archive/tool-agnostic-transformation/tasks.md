# Implementation Plan

- [ ] 1. Create AI tool detection system foundation
  - Implement AIToolDetector class with detection methods for each supported tool
  - Create tool registry configuration with metadata for Claude Code, GitHub Copilot, Zed, Kiro, and generic options
  - Write unit tests for detection logic and tool registry functionality
  - _Requirements: 1.1, 1.2, 5.1_

- [ ] 2. Implement tool-specific template structure
  - Create new template directory structure with base/, claude-code/, github-copilot/, zed/, kiro/, and generic/ folders
  - Move existing Claude-specific templates to claude-code/ directory
  - Create base AI_GUIDELINES.md template with tool-agnostic content and conditional blocks
  - _Requirements: 2.1, 2.3, 8.1_

- [ ] 3. Enhance template engine with conditional logic
  - Extend existing template variable substitution to support conditional blocks ({{#if}}, {{/if}})
  - Implement template inheritance system for base templates with tool-specific overrides
  - Add multi-tool template generation capability
  - Write unit tests for enhanced template engine functionality
  - _Requirements: 2.3, 8.2, 8.3_

- [ ] 4. Create GitHub Copilot specific templates and configuration
  - Implement COPILOT.md template with Copilot-specific best practices and workflows
  - Create VS Code settings template for Copilot integration
  - Add Copilot detection logic to AIToolDetector
  - Write tests for Copilot-specific functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 5. Create Zed specific templates and configuration
  - Implement ZED.md template with Zed-specific AI assistant guidelines
  - Create Zed settings template for AI features configuration
  - Add Zed detection logic to AIToolDetector
  - Write tests for Zed-specific functionality
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 6. Create Kiro specific templates and configuration
  - Implement KIRO.md template with Kiro-specific workflows and autonomous mode guidelines
  - Create Kiro configuration template for specs workflow integration
  - Add Kiro detection logic to AIToolDetector
  - Write tests for Kiro-specific functionality
  - _Requirements: 5.1, 5.2, 5.4_

- [ ] 7. Integrate AI tool selection into interactive CLI flow
  - Add AI tool detection step to InteractiveSetup class before project type selection
  - Implement smart AI tool selection logic (single detection confirmation, multiple choice, manual selection)
  - Update CLI prompts to be tool-agnostic while maintaining Claude Code as default for existing users
  - Write integration tests for new interactive flow
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

- [ ] 8. Update setup orchestrator to handle multiple AI tools
  - Modify SetupOrchestrator to accept AI tool configuration and generate appropriate templates
  - Implement tool-specific setup logic while maintaining existing Claude Code behavior
  - Add support for multi-tool configurations when users have multiple AI tools
  - Write tests for setup orchestrator with different AI tool combinations
  - _Requirements: 1.3, 3.3, 3.4, 6.1, 6.2_

- [ ] 9. Implement backward compatibility preservation
  - Ensure existing Claude Code projects continue to work identically
  - Maintain all existing CLI flags, commands, and output formats for Claude Code users
  - Add compatibility detection to automatically use Claude Code for existing projects
  - Write comprehensive backward compatibility tests
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Create generic AI assistant templates for unsupported tools
  - Implement generic AI_ASSISTANT.md template for tools not specifically supported
  - Create fallback configuration system for unknown AI tools
  - Add extensibility hooks for future AI tool additions
  - Write tests for generic template generation and fallback behavior
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 11. Update CLI branding and help text to be tool-agnostic
  - Modify CLI help text, console output, and error messages to use inclusive language
  - Update package.json name, description, and keywords to be tool-neutral
  - Change console output branding while preserving functionality
  - Ensure tool-specific features are clearly labeled when mentioned
  - _Requirements: 2.1, 2.2, 2.4, 2.5_

- [ ] 12. Implement AI tool migration utilities
  - Create migration system for switching between AI tools in existing projects
  - Implement backup and rollback mechanisms for safe migrations
  - Add migration validation to ensure successful tool transitions
  - Write tests for migration scenarios and rollback functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 13. Add team configuration support for AI tools
  - Implement team-level AI tool configuration that overrides individual preferences
  - Create team template system for standardized AI tool setups
  - Add configuration inheritance (team → project → defaults)
  - Write tests for team configuration scenarios and enforcement
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14. Create comprehensive integration tests for all AI tools
  - Write end-to-end tests for complete setup flow with each supported AI tool
  - Test multi-tool scenarios and configuration combinations
  - Add performance tests for AI tool detection and template generation
  - Create compatibility test suite for existing Claude Code projects
  - _Requirements: 1.4, 3.5, 4.5, 8.4_

- [ ] 15. Update documentation and create migration guide
  - Update README.md to reflect tool-agnostic positioning while highlighting Claude Code support
  - Create migration guide for existing Claude Code users
  - Document new AI tool configuration options and capabilities
  - Add troubleshooting guide for multi-tool scenarios
  - _Requirements: 2.1, 2.2, 7.1_