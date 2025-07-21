/**
 * Core interfaces and types for the Spec Archival Automation system
 */
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
    parseTaskCounts(content: string): {
        totalTasks: number;
        completedTasks: number;
    };
    validateTasksFormat(content: string): {
        isValid: boolean;
        issues: string[];
    };
}
export interface SpecValidationResult {
    isValid: boolean;
    issues: string[];
    warnings: string[];
}
export interface SpecScanner {
    getAllSpecs(): Promise<string[]>;
    getCompletedSpecs(): Promise<string[]>;
    getIncompleteSpecs(): Promise<string[]>;
    validateSpec(specPath: string): Promise<SpecValidationResult>;
    scanAndValidateAllSpecs(): Promise<{
        totalSpecs: number;
        validSpecs: string[];
        invalidSpecs: string[];
        issues: Record<string, string[]>;
    }>;
}
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
    getArchivedSpecs(): Promise<ArchiveIndexEntry[]>;
    searchArchivedSpecs(searchTerm: string): Promise<ArchiveIndexEntry[]>;
    getArchiveStats(): Promise<{
        totalArchives: number;
        oldestArchive?: Date;
        newestArchive?: Date;
        totalTasks: number;
    }>;
    validateAndRepairArchiveIndex(): Promise<{
        isValid: boolean;
        repaired: boolean;
        issues: string[];
    }>;
    removeArchivedSpec(archivePath: string): Promise<boolean>;
    getConfig(): Promise<ArchivalConfig>;
    updateConfig(config: ArchivalConfig): Promise<void>;
    isArchivalEnabled(): Promise<boolean>;
    getArchivalDelay(): Promise<number>;
    shouldArchiveSpec(specPath: string): Promise<{
        shouldArchive: boolean;
        reason?: string;
    }>;
    archiveSpecWithConfig(specPath: string): Promise<ArchivalResult>;
    getAllSpecs(): Promise<string[]>;
    getCompletedSpecs(): Promise<string[]>;
    getSpecsReadyForArchival(): Promise<string[]>;
    scanAndValidateSpecs(): Promise<{
        totalSpecs: number;
        validSpecs: string[];
        invalidSpecs: string[];
        issues: Record<string, string[]>;
    }>;
    autoArchiveCompletedSpecs(): Promise<ArchivalResult[]>;
}
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
export type ArchivalErrorCode = 'VALIDATION_FAILED' | 'COPY_FAILED' | 'CLEANUP_FAILED' | 'CONFIG_ERROR' | 'SPEC_NOT_FOUND' | 'ARCHIVE_EXISTS' | 'PERMISSION_DENIED' | 'INCOMPLETE_SPEC' | 'CONCURRENT_ACCESS';
export declare class ArchivalError extends Error {
    readonly code: ArchivalErrorCode;
    readonly specPath: string;
    readonly recoveryAction: string;
    constructor(message: string, code: ArchivalErrorCode, specPath: string, recoveryAction: string);
}
export declare class ValidationError extends ArchivalError {
    constructor(message: string, specPath: string, recoveryAction: string);
}
export declare class CopyError extends ArchivalError {
    constructor(message: string, specPath: string, recoveryAction: string);
}
export declare class ConfigurationError extends ArchivalError {
    constructor(message: string, specPath: string, recoveryAction: string);
}
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
//# sourceMappingURL=archival.d.ts.map