/**
 * Core interfaces and types for the Spec Archival Automation system
 */
export class ArchivalError extends Error {
    code;
    specPath;
    recoveryAction;
    constructor(message, code, specPath, recoveryAction) {
        super(message);
        this.name = 'ArchivalError';
        this.code = code;
        this.specPath = specPath;
        this.recoveryAction = recoveryAction;
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ArchivalError);
        }
    }
}
export class ValidationError extends ArchivalError {
    constructor(message, specPath, recoveryAction) {
        super(message, 'VALIDATION_FAILED', specPath, recoveryAction);
        this.name = 'ValidationError';
    }
}
export class CopyError extends ArchivalError {
    constructor(message, specPath, recoveryAction) {
        super(message, 'COPY_FAILED', specPath, recoveryAction);
        this.name = 'CopyError';
    }
}
export class ConfigurationError extends ArchivalError {
    constructor(message, specPath, recoveryAction) {
        super(message, 'CONFIG_ERROR', specPath, recoveryAction);
        this.name = 'ConfigurationError';
    }
}
//# sourceMappingURL=archival.js.map