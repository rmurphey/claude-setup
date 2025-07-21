/**
 * Error classes and types for Claude Project Setup
 *
 * Provides a comprehensive error handling system with proper type hierarchy
 * and structured error information for better debugging and user experience.
 */
export declare abstract class CLIError extends Error {
    readonly context?: Record<string, unknown> | undefined;
    readonly cause?: Error | undefined;
    abstract readonly code: string;
    abstract readonly severity: 'warning' | 'error' | 'fatal';
    constructor(message: string, context?: Record<string, unknown> | undefined, cause?: Error | undefined);
    /**
     * Convert error to JSON for logging/debugging
     */
    toJSON(): ErrorJSON;
    /**
     * Get user-friendly error message
     */
    getUserMessage(): string;
    /**
     * Get suggested actions for resolving the error
     */
    getSuggestions(): string[];
}
export declare class LanguageDetectionError extends CLIError {
    readonly code: "LANGUAGE_DETECTION_FAILED";
    readonly severity: "error";
    constructor(message: string, context?: {
        directory?: string;
        patterns?: string[];
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export declare class ConfigurationError extends CLIError {
    readonly code: "INVALID_CONFIGURATION";
    readonly severity: "error";
    constructor(message: string, context?: {
        configPath?: string;
        field?: string;
        value?: unknown;
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export declare class FileSystemError extends CLIError {
    readonly code: "FILE_SYSTEM_ERROR";
    readonly severity: "fatal";
    constructor(message: string, context?: {
        path?: string;
        operation?: string;
        permissions?: boolean;
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export declare class GitHubAPIError extends CLIError {
    readonly code: "GITHUB_API_ERROR";
    readonly severity: "error";
    constructor(message: string, context?: {
        status?: number;
        endpoint?: string;
        repo?: string;
        rateLimited?: boolean;
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export declare class RecoveryError extends CLIError {
    readonly code: "RECOVERY_FAILED";
    readonly severity: "error";
    constructor(message: string, context?: {
        issueType?: string;
        filePath?: string;
        templatePath?: string;
        partialSuccess?: boolean;
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export declare class ValidationError extends CLIError {
    readonly code: "VALIDATION_FAILED";
    readonly severity: "error";
    constructor(message: string, context?: {
        field?: string;
        value?: unknown;
        expected?: string;
        validValues?: string[];
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export declare class NetworkError extends CLIError {
    readonly code: "NETWORK_ERROR";
    readonly severity: "error";
    constructor(message: string, context?: {
        url?: string;
        timeout?: boolean;
        offline?: boolean;
    });
    getUserMessage(): string;
    getSuggestions(): string[];
}
export interface ErrorJSON {
    name: string;
    message: string;
    code: string;
    severity: 'warning' | 'error' | 'fatal';
    context?: Record<string, unknown>;
    stack?: string;
    cause?: string;
}
export interface ErrorContext {
    operation?: string;
    component?: string;
    timestamp?: string;
    userId?: string;
    sessionId?: string;
    metadata?: Record<string, unknown>;
}
export type ErrorSeverity = 'warning' | 'error' | 'fatal';
export interface ErrorReport {
    error: CLIError;
    context: ErrorContext;
    suggestions: string[];
    recoverable: boolean;
}
export interface ErrorHandlerOptions {
    logErrors?: boolean;
    showStackTrace?: boolean;
    exitOnFatal?: boolean;
    colorOutput?: boolean;
}
export interface ErrorHandlingStrategy {
    canHandle(error: Error): boolean;
    handle(error: Error, context?: ErrorContext): Promise<ErrorReport>;
    getSuggestions(error: Error): string[];
}
export type Result<T, E extends Error = CLIError> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export type AsyncResult<T, E extends Error = CLIError> = Promise<Result<T, E>>;
export declare const ERROR_CODES: {
    readonly LANGUAGE_DETECTION_FAILED: "LANGUAGE_DETECTION_FAILED";
    readonly LANGUAGE_NOT_SUPPORTED: "LANGUAGE_NOT_SUPPORTED";
    readonly INVALID_CONFIGURATION: "INVALID_CONFIGURATION";
    readonly CONFIG_FILE_NOT_FOUND: "CONFIG_FILE_NOT_FOUND";
    readonly CONFIG_PARSE_ERROR: "CONFIG_PARSE_ERROR";
    readonly FILE_SYSTEM_ERROR: "FILE_SYSTEM_ERROR";
    readonly FILE_NOT_FOUND: "FILE_NOT_FOUND";
    readonly PERMISSION_DENIED: "PERMISSION_DENIED";
    readonly DISK_FULL: "DISK_FULL";
    readonly GITHUB_API_ERROR: "GITHUB_API_ERROR";
    readonly GITHUB_AUTH_FAILED: "GITHUB_AUTH_FAILED";
    readonly GITHUB_RATE_LIMITED: "GITHUB_RATE_LIMITED";
    readonly GITHUB_NOT_FOUND: "GITHUB_NOT_FOUND";
    readonly RECOVERY_FAILED: "RECOVERY_FAILED";
    readonly TEMPLATE_NOT_FOUND: "TEMPLATE_NOT_FOUND";
    readonly BACKUP_FAILED: "BACKUP_FAILED";
    readonly VALIDATION_FAILED: "VALIDATION_FAILED";
    readonly INVALID_INPUT: "INVALID_INPUT";
    readonly MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD";
    readonly NETWORK_ERROR: "NETWORK_ERROR";
    readonly CONNECTION_TIMEOUT: "CONNECTION_TIMEOUT";
    readonly CONNECTION_REFUSED: "CONNECTION_REFUSED";
};
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];
//# sourceMappingURL=errors.d.ts.map