/**
 * Core TypeScript type definitions for Claude Project Setup
 *
 * This file contains all the fundamental interfaces and types used throughout
 * the application. It serves as the single source of truth for type definitions.
 */
// =============================================================================
// Error Handling Types
// =============================================================================
export class CLIError extends Error {
    context;
    constructor(message, context) {
        super(message);
        this.context = context;
        this.name = this.constructor.name;
    }
}
export class LanguageDetectionError extends CLIError {
    code = 'LANGUAGE_DETECTION_FAILED';
    severity = 'error';
}
export class ConfigurationError extends CLIError {
    code = 'INVALID_CONFIGURATION';
    severity = 'error';
}
export class FileSystemError extends CLIError {
    code = 'FILE_SYSTEM_ERROR';
    severity = 'fatal';
}
export class GitHubAPIError extends CLIError {
    code = 'GITHUB_API_ERROR';
    severity = 'error';
}
export class RecoveryError extends CLIError {
    code = 'RECOVERY_FAILED';
    severity = 'error';
}
//# sourceMappingURL=index.js.map