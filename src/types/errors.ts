/**
 * Error classes and types for Claude Project Setup
 * 
 * Provides a comprehensive error handling system with proper type hierarchy
 * and structured error information for better debugging and user experience.
 */

// =============================================================================
// Base Error Classes
// =============================================================================

export abstract class CLIError extends Error {
  abstract readonly code: string;
  abstract readonly severity: 'warning' | 'error' | 'fatal';
  
  constructor(
    message: string, 
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging/debugging
   */
  toJSON(): ErrorJSON {
    const result: ErrorJSON = {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity
    };

    if (this.context !== undefined) {
      result.context = this.context;
    }
    
    if (this.stack !== undefined) {
      result.stack = this.stack;
    }
    
    if (this.cause?.message !== undefined) {
      result.cause = this.cause.message;
    }

    return result;
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    return this.message;
  }

  /**
   * Get suggested actions for resolving the error
   */
  getSuggestions(): string[] {
    return [];
  }
}

// =============================================================================
// Specific Error Classes
// =============================================================================

export class LanguageDetectionError extends CLIError {
  readonly code = 'LANGUAGE_DETECTION_FAILED' as const;
  readonly severity = 'error' as const;

  constructor(message: string, context?: { directory?: string; patterns?: string[] }) {
    super(message, context);
  }

  getUserMessage(): string {
    return `Language detection failed: ${this.message}`;
  }

  getSuggestions(): string[] {
    return [
      'Ensure you are in a project directory with source files',
      'Try using --language flag to specify language manually',
      'Check that the directory contains recognizable project files'
    ];
  }
}

export class ConfigurationError extends CLIError {
  readonly code = 'INVALID_CONFIGURATION' as const;
  readonly severity = 'error' as const;

  constructor(message: string, context?: { configPath?: string; field?: string; value?: unknown }) {
    super(message, context);
  }

  getUserMessage(): string {
    const field = this.context?.field;
    return field 
      ? `Configuration error in field '${field}': ${this.message}`
      : `Configuration error: ${this.message}`;
  }

  getSuggestions(): string[] {
    return [
      'Check your .claude-setup.json file for syntax errors',
      'Use --config --reset to reset configuration to defaults',
      'Refer to documentation for valid configuration options'
    ];
  }
}

export class FileSystemError extends CLIError {
  readonly code = 'FILE_SYSTEM_ERROR' as const;
  readonly severity = 'fatal' as const;

  constructor(message: string, context?: { path?: string; operation?: string; permissions?: boolean }) {
    super(message, context);
  }

  getUserMessage(): string {
    const path = this.context?.path;
    const operation = this.context?.operation;
    
    if (path && operation) {
      return `Failed to ${operation} file '${path}': ${this.message}`;
    }
    return `File system error: ${this.message}`;
  }

  getSuggestions(): string[] {
    const suggestions = ['Check file permissions and disk space'];
    
    if (this.context?.permissions) {
      suggestions.push('Try running with appropriate permissions (sudo if necessary)');
    }
    
    if (this.context?.path) {
      suggestions.push(`Verify the path exists: ${this.context.path}`);
    }
    
    return suggestions;
  }
}

export class GitHubAPIError extends CLIError {
  readonly code = 'GITHUB_API_ERROR' as const;
  readonly severity = 'error' as const;

  constructor(
    message: string, 
    context?: { 
      status?: number; 
      endpoint?: string; 
      repo?: string;
      rateLimited?: boolean;
    }
  ) {
    super(message, context);
  }

  getUserMessage(): string {
    const status = this.context?.status;
    const endpoint = this.context?.endpoint;
    
    if (status === 401) {
      return 'GitHub authentication failed. Please check your token.';
    }
    
    if (status === 403 && this.context?.rateLimited) {
      return 'GitHub API rate limit exceeded. Please try again later.';
    }
    
    if (status === 404) {
      return `GitHub resource not found: ${this.message}`;
    }
    
    return `GitHub API error${endpoint ? ` (${endpoint})` : ''}: ${this.message}`;
  }

  getSuggestions(): string[] {
    const suggestions: string[] = [];
    const status = this.context?.status;
    
    if (status === 401) {
      suggestions.push(
        'Run "gh auth login" to authenticate with GitHub',
        'Set GITHUB_TOKEN environment variable with a valid token',
        'Check that your token has the required permissions'
      );
    } else if (status === 403 && this.context?.rateLimited) {
      suggestions.push(
        'Wait for the rate limit to reset',
        'Use a GitHub token with higher rate limits',
        'Reduce the frequency of API calls'
      );
    } else if (status === 404) {
      suggestions.push(
        'Verify the repository name and that you have access',
        'Check that the issue/resource exists',
        'Ensure you are in the correct repository directory'
      );
    } else {
      suggestions.push(
        'Check your internet connection',
        'Verify GitHub service status',
        'Try again in a few moments'
      );
    }
    
    return suggestions;
  }
}


export class ValidationError extends CLIError {
  readonly code = 'VALIDATION_FAILED' as const;
  readonly severity = 'error' as const;

  constructor(
    message: string, 
    context?: { 
      field?: string; 
      value?: unknown; 
      expected?: string;
      validValues?: string[];
    }
  ) {
    super(message, context);
  }

  getUserMessage(): string {
    const field = this.context?.field;
    const expected = this.context?.expected;
    
    if (field && expected) {
      return `Validation failed for '${field}': expected ${expected}, ${this.message}`;
    }
    
    return `Validation error: ${this.message}`;
  }

  getSuggestions(): string[] {
    const suggestions: string[] = [];
    const validValues = this.context?.validValues;
    
    if (validValues && Array.isArray(validValues) && validValues.length > 0) {
      suggestions.push(`Valid values are: ${validValues.join(', ')}`);
    }
    
    suggestions.push('Check the documentation for valid input formats');
    
    return suggestions;
  }
}

export class NetworkError extends CLIError {
  readonly code = 'NETWORK_ERROR' as const;
  readonly severity = 'error' as const;

  constructor(
    message: string, 
    context?: { 
      url?: string; 
      timeout?: boolean; 
      offline?: boolean;
    }
  ) {
    super(message, context);
  }

  getUserMessage(): string {
    if (this.context?.timeout) {
      return `Network request timed out: ${this.message}`;
    }
    
    if (this.context?.offline) {
      return 'Network connection unavailable';
    }
    
    return `Network error: ${this.message}`;
  }

  getSuggestions(): string[] {
    const suggestions = ['Check your internet connection'];
    
    if (this.context?.timeout) {
      suggestions.push('Try again with a slower connection or later');
    }
    
    if (this.context?.url) {
      suggestions.push(`Verify the URL is accessible: ${this.context.url}`);
    }
    
    suggestions.push('Check if you are behind a firewall or proxy');
    
    return suggestions;
  }
}

// =============================================================================
// Error Utility Types
// =============================================================================

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

// =============================================================================
// Error Handler Types
// =============================================================================

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

// =============================================================================
// Result Types for Error Handling
// =============================================================================

export type Result<T, E extends Error = CLIError> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

export type AsyncResult<T, E extends Error = CLIError> = Promise<Result<T, E>>;

// =============================================================================
// Error Code Constants
// =============================================================================

export const ERROR_CODES = {
  // Language Detection
  LANGUAGE_DETECTION_FAILED: 'LANGUAGE_DETECTION_FAILED',
  LANGUAGE_NOT_SUPPORTED: 'LANGUAGE_NOT_SUPPORTED',
  
  // Configuration
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  CONFIG_FILE_NOT_FOUND: 'CONFIG_FILE_NOT_FOUND',
  CONFIG_PARSE_ERROR: 'CONFIG_PARSE_ERROR',
  
  // File System
  FILE_SYSTEM_ERROR: 'FILE_SYSTEM_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DISK_FULL: 'DISK_FULL',
  
  // GitHub API
  GITHUB_API_ERROR: 'GITHUB_API_ERROR',
  GITHUB_AUTH_FAILED: 'GITHUB_AUTH_FAILED',
  GITHUB_RATE_LIMITED: 'GITHUB_RATE_LIMITED',
  GITHUB_NOT_FOUND: 'GITHUB_NOT_FOUND',
  
  
  // Validation
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  CONNECTION_REFUSED: 'CONNECTION_REFUSED'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];