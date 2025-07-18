#!/usr/bin/env node
export function runRecovery(args?: any[]): Promise<{
    success: boolean;
    issues: any[];
    restored: ({
        success: boolean;
        error: string;
        path?: never;
        template?: never;
    } | {
        success: boolean;
        path: any;
        template: any;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        generated?: never;
    } | {
        success: boolean;
        path: any;
        generated: boolean;
        error?: never;
    } | {
        success: boolean;
        path: string;
        initialized: boolean;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        initialized?: never;
    })[];
}>;
export class RecoverySystem {
    templateDir: string;
    results: {
        detected: never[];
        restored: never[];
        failed: never[];
        warnings: never[];
    };
    /**
     * Main recovery command - detect and fix all issues
     */
    executeRecovery(options?: {}): Promise<{
        success: boolean;
        issues: any[];
        restored: ({
            success: boolean;
            error: string;
            path?: never;
            template?: never;
        } | {
            success: boolean;
            path: any;
            template: any;
            error?: never;
        } | {
            success: boolean;
            error: string;
            path?: never;
            generated?: never;
        } | {
            success: boolean;
            path: any;
            generated: boolean;
            error?: never;
        } | {
            success: boolean;
            path: string;
            initialized: boolean;
            error?: never;
        } | {
            success: boolean;
            error: string;
            path?: never;
            initialized?: never;
        })[];
    }>;
    /**
     * Detect missing or broken setup files
     */
    detectIssues(): Promise<any[]>;
    /**
     * Detect language-specific setup issues
     */
    detectLanguageIssues(language: any): Promise<any[]>;
    /**
     * Fix detected issues by restoring from templates
     */
    fixIssues(issues: any): Promise<({
        success: boolean;
        error: string;
        path?: never;
        template?: never;
    } | {
        success: boolean;
        path: any;
        template: any;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        generated?: never;
    } | {
        success: boolean;
        path: any;
        generated: boolean;
        error?: never;
    } | {
        success: boolean;
        path: string;
        initialized: boolean;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        initialized?: never;
    })[]>;
    /**
     * Fix a single issue
     */
    fixSingleIssue(issue: any): Promise<{
        success: boolean;
        error: string;
        path?: never;
        template?: never;
    } | {
        success: boolean;
        path: any;
        template: any;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        generated?: never;
    } | {
        success: boolean;
        path: any;
        generated: boolean;
        error?: never;
    } | {
        success: boolean;
        path: string;
        initialized: boolean;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        initialized?: never;
    }>;
    /**
     * Restore a file from template
     */
    restoreFileFromTemplate(issue: any): Promise<{
        success: boolean;
        error: string;
        path?: never;
        template?: never;
    } | {
        success: boolean;
        path: any;
        template: any;
        error?: never;
    }>;
    /**
     * Restore entire command directory
     */
    restoreDirectoryFromTemplate(issue: any): Promise<{
        success: boolean;
        error: string;
        path?: never;
        template?: never;
    } | {
        success: boolean;
        path: any;
        template: any;
        error?: never;
    }>;
    /**
     * Restore a single command file
     */
    restoreCommandFromTemplate(issue: any): Promise<{
        success: boolean;
        error: string;
        path?: never;
        template?: never;
    } | {
        success: boolean;
        path: any;
        template: any;
        error?: never;
    }>;
    /**
     * Restore language-specific configuration file
     */
    restoreLanguageFileFromTemplate(issue: any): Promise<{
        success: boolean;
        error: string;
        path?: never;
        generated?: never;
    } | {
        success: boolean;
        path: any;
        generated: boolean;
        error?: never;
    }>;
    /**
     * Initialize git repository
     */
    initializeGitRepository(): Promise<{
        success: boolean;
        path: string;
        initialized: boolean;
        error?: never;
    } | {
        success: boolean;
        error: string;
        path?: never;
        initialized?: never;
    }>;
    /**
     * Process template variables in restored files
     */
    processTemplateVariables(filePath: any, _language: any): Promise<void>;
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
        details: {
            detected: never[];
            restored: never[];
            failed: never[];
            warnings: never[];
        };
    };
}
export default RecoverySystem;
//# sourceMappingURL=recovery-system.d.ts.map