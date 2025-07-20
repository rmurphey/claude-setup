/**
 * Core interfaces and types for the Spec Archival Automation system
 */

// ============================================================================
// Core Completion Detection Types
// ============================================================================

export interface CompletionStatus {
  isComplete: boolean;
  totalTasks: number;
  completedTasks: number;
  lastModified: Date;
}

export interface SpecCompletionDetector {
  checkSpecCompletion(specPath: string): Promise<CompletionStatus>;
  getAllCompletedSpecs(): Promise<string[]>;
  isTasksFileComplete(tasksContent: string): boolean;
}

// ============================================================================
// Archival Engine Types
// ============================================================================

export interface ArchivalResult {
  success: boolean;
  originalPath: string;
  archivePath: string;
  timestamp: Date;
  error?: string;
}

export interface SafetyCheck {
  isSafe: boolean;
  issues: string[];
  canProceed: boolean;
}

export interface SpecInfo {
  name: string;
  path: string;
  completionDate: Date;
  totalTasks: number;
  completedTasks: number;
}

export interface ArchivalEngine {
  archiveSpec(specPath: string): Promise<ArchivalResult>;
  createArchiveMetadata(spec: SpecInfo): ArchiveMetadata;
  validateArchivalSafety(specPath: string): Promise<SafetyCheck>;
}

// ============================================================================
// Archive Metadata Types
// ============================================================================

export interface ArchiveMetadata {
  specName: string;
  originalPath: string;
  archivePath: string;
  completionDate: Date;
  archivalDate: Date;
  totalTasks: number;
  completedTasks: number;
  version: string;
}

export interface ArchiveIndex {
  version: string;
  lastUpdated: Date;
  archives: ArchiveIndexEntry[];
}

export interface ArchiveIndexEntry {
  specName: string;
  archivePath: string;
  completionDate: Date;
  archivalDate: Date;
  totalTasks: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

export type NotificationLevel = 'none' | 'minimal' | 'verbose';

export interface ArchivalConfig {
  enabled: boolean;
  delayMinutes: number;
  archiveLocation: string;
  notificationLevel: NotificationLevel;
  backupEnabled: boolean;
}

export interface ConfigurationManager {
  loadConfig(): Promise<ArchivalConfig>;
  saveConfig(config: ArchivalConfig): Promise<void>;
  getDefaultConfig(): ArchivalConfig;
  validateConfig(config: ArchivalConfig): boolean;
  migrateConfig(oldConfig: any): ArchivalConfig;
}

// ============================================================================
// Error Types and Classes
// ============================================================================

export type ArchivalErrorCode = 
  | 'VALIDATION_FAILED'
  | 'COPY_FAILED'
  | 'CLEANUP_FAILED'
  | 'CONFIG_ERROR'
  | 'SPEC_NOT_FOUND'
  | 'ARCHIVE_EXISTS'
  | 'PERMISSION_DENIED'
  | 'INCOMPLETE_SPEC'
  | 'CONCURRENT_ACCESS';

export class ArchivalError extends Error {
  public readonly code: ArchivalErrorCode;
  public readonly specPath: string;
  public readonly recoveryAction: string;

  constructor(
    message: string,
    code: ArchivalErrorCode,
    specPath: string,
    recoveryAction: string
  ) {
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
  constructor(message: string, specPath: string, recoveryAction: string) {
    super(message, 'VALIDATION_FAILED', specPath, recoveryAction);
    this.name = 'ValidationError';
  }
}

export class CopyError extends ArchivalError {
  constructor(message: string, specPath: string, recoveryAction: string) {
    super(message, 'COPY_FAILED', specPath, recoveryAction);
    this.name = 'CopyError';
  }
}

export class ConfigurationError extends ArchivalError {
  constructor(message: string, specPath: string, recoveryAction: string) {
    super(message, 'CONFIG_ERROR', specPath, recoveryAction);
    this.name = 'ConfigurationError';
  }
}

// ============================================================================
// Hook Integration Types
// ============================================================================

export interface HookConfig {
  enabled: boolean;
  name: string;
  description: string;
  version: string;
  when: {
    type: 'fileEdited';
    patterns: string[];
  };
  then: {
    type: 'askAgent';
    prompt: string;
  };
}

// ============================================================================
// Utility Types
// ============================================================================

export interface FileSystemEntry {
  path: string;
  isDirectory: boolean;
  size: number;
  modified: Date;
}

export interface ArchivalOperation {
  id: string;
  specPath: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: ArchivalError;
}

export interface ArchivalStats {
  totalSpecs: number;
  archivedSpecs: number;
  failedArchives: number;
  lastArchivalDate?: Date;
}