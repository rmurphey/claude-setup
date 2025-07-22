/**
 * Core interfaces and types for the Spec Archival Automation system
 */
export class ArchivalError extends Error {
    code;
    specPath;
    constructor(message, code, specPath) {
        super(message);
        this.name = 'ArchivalError';
        this.code = code;
        this.specPath = specPath;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ArchivalError);
        }
    }
}
export class ValidationError extends ArchivalError {
    constructor(message, specPath) {
        super(message, 'VALIDATION_FAILED', specPath);
        this.name = 'ValidationError';
    }
}
export class CopyError extends ArchivalError {
    constructor(message, specPath) {
        super(message, 'COPY_FAILED', specPath);
        this.name = 'CopyError';
    }
}
export class ConfigurationError extends ArchivalError {
    constructor(message, specPath) {
        super(message, 'CONFIG_ERROR', specPath);
        this.name = 'ConfigurationError';
    }
}
//# sourceMappingURL=archival.js.map