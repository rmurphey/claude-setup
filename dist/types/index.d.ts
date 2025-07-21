/**
 * Core TypeScript type definitions for Claude Project Setup
 *
 * This file contains all the fundamental interfaces and types used throughout
 * the application. It serves as the single source of truth for type definitions.
 */
export interface LanguagePattern {
    language: string;
    name: string;
    files: string[];
    extensions: string[];
    confidence: 'high' | 'medium' | 'low';
}
export interface LanguageEvidence {
    foundFiles: string[];
    foundExtensions: string[];
    fileCount: number;
    score: number;
}
export interface LanguageDetectionResult {
    language: string;
    name: string;
    confidence: 'high' | 'medium' | 'low';
    evidence: LanguageEvidence;
    score: number;
    source: 'config' | 'detection';
}
export interface MultipleLanguageDetectionResult {
    type: 'multiple';
    candidates: Array<{
        language: string;
        name: string;
        score: number;
        evidence: LanguageEvidence;
    }>;
    source: 'detection';
}
export interface SingleLanguageDetectionResult {
    type: 'single';
    language: string;
    name: string;
    confidence: 'high' | 'medium' | 'low';
    evidence: LanguageEvidence;
    source: 'config' | 'detection';
}
export type DetectionResult = SingleLanguageDetectionResult | MultipleLanguageDetectionResult | null;
export interface CLIFlags {
    help: boolean;
    version: boolean;
    fix: boolean;
    dryRun: boolean;
    autoFix: boolean;
    detectLanguage: boolean;
    config: boolean;
    syncIssues: boolean;
    devcontainer: boolean;
    force: boolean;
    noSave: boolean;
    show: boolean;
    reset: boolean;
    language: string | null;
}
export interface CLIConfig {
    projectType: string;
    qualityLevel: QualityLevel;
    teamSize: TeamSize;
    cicd: boolean;
    language?: string;
    dryRun?: boolean;
    autoFix?: boolean;
    force?: boolean;
    noSave?: boolean;
}
export type QualityLevel = 'strict' | 'standard' | 'relaxed';
export type TeamSize = 'solo' | 'small' | 'large';
export interface ProjectConfig {
    name: string;
    version: string;
    description?: string;
    language: string;
    qualityLevel: QualityLevel;
    teamSize: TeamSize;
    features: ProjectFeature[];
    customCommands: CustomCommand[];
}
export interface ProjectFeature {
    name: string;
    enabled: boolean;
    config?: Record<string, unknown>;
}
export interface CustomCommand {
    name: string;
    description: string;
    template: string;
    enabled: boolean;
}
export interface ConfigFile {
    version: string;
    language: LanguageConfig;
    detection: DetectionConfig;
    setup: SetupConfig;
}
export interface LanguageConfig {
    primary: string;
    name: string;
    confidence: 'high' | 'medium' | 'low';
    detected: string;
    evidence: LanguageEvidence;
}
export interface DetectionConfig {
    skipDirectories: string[];
    maxDepth: number;
    maxFiles: number;
    timeout: number;
}
export interface SetupConfig {
    qualityLevel: QualityLevel | null;
    teamSize: TeamSize | null;
    cicd: boolean;
    lastSetup: string | null;
}
export interface GitHubUser {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
}
export interface GitHubLabel {
    id: number;
    name: string;
    color: string;
    description: string | null;
}
export interface GitHubIssue {
    number: number;
    title: string;
    body: string | null;
    state: 'open' | 'closed';
    labels: GitHubLabel[];
    assignees: GitHubUser[];
    user: GitHubUser;
    created_at: string;
    updated_at: string;
    html_url: string;
    repository_url?: string;
}
export interface GitHubAPIResponse<T> {
    data: T;
    status: number;
    headers: Record<string, string>;
}
export interface GitHubListIssuesFilters {
    state?: 'open' | 'closed' | 'all';
    sort?: 'created' | 'updated' | 'comments';
    direction?: 'asc' | 'desc';
    assignee?: string;
    labels?: string;
    milestone?: string;
    limit?: string;
}
export interface RecoveryIssue {
    type: 'missing-file' | 'corrupted-file' | 'missing-directory' | 'missing-command' | 'missing-language-file' | 'missing-git';
    path: string;
    template: string | null;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    language: string | null;
    alternative?: string;
}
export interface RecoveryResult {
    success: boolean;
    path?: string;
    template?: string;
    error?: string;
    generated?: boolean;
    initialized?: boolean;
}
export interface RecoveryResults {
    detected: RecoveryIssue[];
    restored: RecoveryResult[];
    failed: Array<{
        issue: RecoveryIssue;
        error: string;
    }>;
    warnings: string[];
}
export interface RecoveryOptions {
    dryRun?: boolean;
    autoFix?: boolean;
    verbose?: boolean;
}
export interface RecoveryExecutionResult {
    success: boolean;
    issues: RecoveryIssue[];
    restored: RecoveryResult[];
}
export interface TemplateVariable {
    name: string;
    value: string;
    required: boolean;
}
export interface TemplateCondition {
    field: string;
    operator: 'equals' | 'contains' | 'exists';
    value: unknown;
}
export interface TemplateConfig {
    source: string;
    destination: string;
    variables: TemplateVariable[];
    conditions?: TemplateCondition[];
}
export declare abstract class CLIError extends Error {
    readonly context?: Record<string, unknown> | undefined;
    abstract readonly code: string;
    abstract readonly severity: 'warning' | 'error' | 'fatal';
    constructor(message: string, context?: Record<string, unknown> | undefined);
}
export declare class LanguageDetectionError extends CLIError {
    readonly code = "LANGUAGE_DETECTION_FAILED";
    readonly severity: "error";
}
export declare class ConfigurationError extends CLIError {
    readonly code = "INVALID_CONFIGURATION";
    readonly severity: "error";
}
export declare class FileSystemError extends CLIError {
    readonly code = "FILE_SYSTEM_ERROR";
    readonly severity: "fatal";
}
export declare class GitHubAPIError extends CLIError {
    readonly code = "GITHUB_API_ERROR";
    readonly severity: "error";
}
export declare class RecoveryError extends CLIError {
    readonly code = "RECOVERY_FAILED";
    readonly severity: "error";
}
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
};
export interface FileOperationResult {
    success: boolean;
    path: string;
    error?: Error;
}
export interface DirectoryAnalysis {
    files: string[];
    directories: string[];
    totalSize: number;
    languageFiles: Map<string, string[]>;
}
export interface InquirerPrompt {
    type: 'list' | 'confirm' | 'input' | 'checkbox';
    name: string;
    message: string;
    choices?: string[] | Array<{
        name: string;
        value: string;
    }>;
    default?: unknown;
}
export interface InquirerAnswers {
    [key: string]: string | boolean | string[];
}
export interface InteractiveSetupResult {
    mode?: 'recovery' | 'devcontainer' | 'setup';
    projectType?: string;
    qualityLevel?: QualityLevel;
    teamSize?: TeamSize;
    cicd?: boolean;
}
export interface LanguageSetupOptions {
    qualityLevel: QualityLevel;
    teamSize: TeamSize;
    setupCI: boolean;
    recoveryMode?: boolean;
}
export interface LanguageHandler {
    setup(options: LanguageSetupOptions): Promise<void>;
    validate?(): Promise<boolean>;
    getRequiredFiles?(): string[];
    getOptionalFiles?(): string[];
}
export interface FileStats {
    isFile(): boolean;
    isDirectory(): boolean;
    size: number;
    mtime: Date;
}
export interface DirectoryEntry {
    name: string;
    isFile(): boolean;
    isDirectory(): boolean;
}
export interface PerformanceMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    operation: string;
    metadata?: Record<string, unknown>;
}
export interface BenchmarkResult {
    operation: string;
    iterations: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    totalTime: number;
}
export * from './archival.js';
//# sourceMappingURL=index.d.ts.map