#!/usr/bin/env node
/**
 * One-Command Project Recovery System
 *
 * Detects missing or broken setup files and restores them from templates.
 * Saves hours of manual re-setup when projects get corrupted.
 */
import type { RecoveryIssue, RecoveryResults, RecoveryOptions, RecoveryExecutionResult, Result } from '../types/index.js';
import { RecoveryError } from '../types/index.js';
interface RecoveryAssessment {
    issues: RecoveryIssue[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    estimatedFixTime: number;
    autoFixable: boolean;
}
interface RecoveryPlan {
    steps: RecoveryStep[];
    estimatedTime: number;
    requiresUserInput: boolean;
}
interface RecoveryStep {
    description: string;
    command: string;
    validation: string;
    rollback?: string | undefined;
}
export declare class RecoverySystem {
    private templateDir;
    private results;
    constructor();
    /**
     * Main recovery command - detect and fix all issues
     */
    executeRecovery(options?: RecoveryOptions): Promise<RecoveryExecutionResult>;
    /**
     * Assess recovery needs and create assessment
     */
    assessRecovery(): Promise<RecoveryAssessment>;
    /**
     * Create a recovery plan for the detected issues
     */
    createRecoveryPlan(issues: RecoveryIssue[]): Promise<RecoveryPlan>;
    /**
     * Create a recovery step for a specific issue
     */
    private createRecoveryStep;
    /**
     * Check if an issue can be automatically fixed
     */
    private isAutoFixable;
    /**
     * Detect missing or broken setup files
     */
    detectIssues(): Promise<RecoveryIssue[]>;
    /**
     * Detect language-specific setup issues
     */
    private detectLanguageIssues;
    /**
     * Fix detected issues by restoring from templates
     */
    private fixIssues;
    /**
     * Fix a single issue
     */
    private fixSingleIssue;
    /**
     * Restore a file from template
     */
    private restoreFileFromTemplate;
    /**
     * Restore entire command directory
     */
    private restoreDirectoryFromTemplate;
    /**
     * Restore a single command file
     */
    private restoreCommandFromTemplate;
    /**
     * Restore language-specific configuration file
     */
    private restoreLanguageFileFromTemplate;
    /**
     * Initialize git repository
     */
    private initializeGitRepository;
    /**
     * Process template variables in restored files
     */
    private processTemplateVariables;
    /**
     * Generate recovery report
     */
    generateReport(): {
        summary: {
            detected: number;
            restored: number;
            failed: number;
            warnings: number;
        };
        details: RecoveryResults;
    };
    /**
     * Validate recovery operations with comprehensive error handling
     */
    validateRecovery(issues: RecoveryIssue[]): Promise<Result<boolean, RecoveryError>>;
    /**
     * Validate a single recovery issue
     */
    private validateSingleIssue;
}
export declare function runRecovery(args?: string[]): Promise<RecoveryExecutionResult>;
export default RecoverySystem;
export type { RecoveryAssessment, RecoveryPlan, RecoveryStep };
//# sourceMappingURL=recovery-system.d.ts.map