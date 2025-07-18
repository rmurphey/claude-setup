export function generateClaudeTemplate(config: any): string;
export function generateActiveWorkTemplate(config: any): string;
export function generateGitignore(projectType: any): "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n" | "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n\n# JavaScript/TypeScript\ndist/\nbuild/\n*.tsbuildinfo\n.eslintcache\n" | "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n\n# Swift\n.build/\n.swiftpm/\n*.xcodeproj/\n*.xcworkspace/\nxcuserdata/\nDerivedData/\n*.hmap\n*.ipa\n*.dSYM.zip\n*.dSYM\nCarthage/\nPods/\n" | "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n\n# Python\n*.egg-info/\n.pytest_cache/\n.coverage\nhtmlcov/\n";
export function getDevContainerConfig(projectType: any): {
    name: string;
    image: string;
    features: {};
    customizations: {
        vscode: {
            extensions: never[];
        };
    };
    forwardPorts: never[];
    postCreateCommand: string;
    remoteUser: string;
} | {
    name: string;
    image: string;
    customizations: {
        vscode: {
            extensions: string[];
        };
    };
    forwardPorts: number[];
    portsAttributes: {
        '3000': {
            label: string;
        };
        '8080': {
            label: string;
        };
        '8000'?: never;
        '5000'?: never;
    };
    onCreateCommand: string;
    remoteUser: string;
    waitFor: string;
} | {
    name: string;
    image: string;
    customizations: {
        vscode: {
            extensions: string[];
        };
    };
    forwardPorts: number[];
    portsAttributes: {
        '8000': {
            label: string;
        };
        '5000': {
            label: string;
        };
        '3000'?: never;
        '8080'?: never;
    };
    onCreateCommand: string;
    remoteUser: string;
    waitFor: string;
} | {
    name: string;
    image: string;
    customizations: {
        vscode: {
            extensions: string[];
        };
    };
    forwardPorts: number[];
    portsAttributes: {
        '8080': {
            label: string;
        };
        '3000'?: never;
        '8000'?: never;
        '5000'?: never;
    };
    onCreateCommand: string;
    remoteUser: string;
    waitFor: string;
};
/**
 * Setup orchestrator - coordinates different setup modes
 */
export class SetupOrchestrator {
    languageModules: {
        js: {
            name: string;
            installCommand: string;
            lintCommand: string;
            testCommand: string;
            setup: (config: any, detection: any) => Promise<void>;
        };
        python: {
            name: string;
            installCommand: string;
            lintCommand: string;
            testCommand: string;
            setup: (config: any, detection: any) => Promise<void>;
        };
        go: {
            name: string;
            installCommand: string;
            lintCommand: string;
            testCommand: string;
            setup: (config: any, detection: any) => Promise<void>;
        };
        rust: {
            name: string;
            installCommand: string;
            lintCommand: string;
            testCommand: string;
            setup: (config: any, detection: any) => Promise<void>;
        };
        java: {
            name: string;
            installCommand: string;
            lintCommand: string;
            testCommand: string;
            setup: (config: any, detection: any) => Promise<void>;
        };
        swift: {
            name: string;
            installCommand: string;
            lintCommand: string;
            testCommand: string;
            setup: (config: any, detection: any) => Promise<void>;
        };
    };
    /**
     * Run the main setup mode - moved from main.js
     */
    runSetupMode(config: any): Promise<void>;
    /**
     * Run recovery mode - moved from main.js
     */
    runRecoveryMode(): Promise<void>;
    /**
     * Run DevContainer mode
     */
    runDevContainerMode(): Promise<void>;
    /**
     * Main project setup orchestration
     */
    setupProject(config: any): Promise<void>;
    /**
     * Initialize git repository
     */
    initializeGitRepository(): Promise<void>;
    /**
     * Create project documentation
     */
    createDocumentation(config: any): Promise<void>;
    /**
     * Setup language-specific tools
     */
    setupLanguage(config: any): Promise<void>;
    /**
     * Copy utility libraries
     */
    copyUtilityLibraries(): Promise<void>;
    /**
     * Setup custom commands
     */
    setupCommands(): Promise<void>;
    /**
     * Setup recovery commands
     */
    setupRecoveryCommands(): Promise<void>;
    /**
     * Setup CI/CD workflows
     */
    setupCICD(config: any): Promise<void>;
    /**
     * Create initial commit
     */
    createInitialCommit(config: any): Promise<void>;
    /**
     * Generate DevContainer configuration
     */
    generateDevContainer(projectType: any): Promise<void>;
    /**
     * Generate Claude template
     */
    generateClaudeTemplate(config: any): string;
    /**
     * Generate Active Work template
     */
    generateActiveWorkTemplate(config: any): string;
    /**
     * Generate gitignore file
     */
    generateGitignore(projectType: any): "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n" | "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n\n# JavaScript/TypeScript\ndist/\nbuild/\n*.tsbuildinfo\n.eslintcache\n" | "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n\n# Swift\n.build/\n.swiftpm/\n*.xcodeproj/\n*.xcworkspace/\nxcuserdata/\nDerivedData/\n*.hmap\n*.ipa\n*.dSYM.zip\n*.dSYM\nCarthage/\nPods/\n" | "\n# Dependencies\nnode_modules/\n__pycache__/\ntarget/\n*.pyc\n*.pyo\n\n# IDE\n.vscode/\n.idea/\n*.swp\n*.swo\n\n# OS\n.DS_Store\nThumbs.db\n\n# Logs\n*.log\nlogs/\n\n# Python\n*.egg-info/\n.pytest_cache/\n.coverage\nhtmlcov/\n";
    /**
     * Generate GitHub Actions workflow
     */
    generateGitHubActions(config: any): string;
    /**
     * Get DevContainer configuration
     */
    getDevContainerConfig(projectType: any): {
        name: string;
        image: string;
        features: {};
        customizations: {
            vscode: {
                extensions: never[];
            };
        };
        forwardPorts: never[];
        postCreateCommand: string;
        remoteUser: string;
    } | {
        name: string;
        image: string;
        customizations: {
            vscode: {
                extensions: string[];
            };
        };
        forwardPorts: number[];
        portsAttributes: {
            '3000': {
                label: string;
            };
            '8080': {
                label: string;
            };
            '8000'?: never;
            '5000'?: never;
        };
        onCreateCommand: string;
        remoteUser: string;
        waitFor: string;
    } | {
        name: string;
        image: string;
        customizations: {
            vscode: {
                extensions: string[];
            };
        };
        forwardPorts: number[];
        portsAttributes: {
            '8000': {
                label: string;
            };
            '5000': {
                label: string;
            };
            '3000'?: never;
            '8080'?: never;
        };
        onCreateCommand: string;
        remoteUser: string;
        waitFor: string;
    } | {
        name: string;
        image: string;
        customizations: {
            vscode: {
                extensions: string[];
            };
        };
        forwardPorts: number[];
        portsAttributes: {
            '8080': {
                label: string;
            };
            '3000'?: never;
            '8000'?: never;
            '5000'?: never;
        };
        onCreateCommand: string;
        remoteUser: string;
        waitFor: string;
    };
}
//# sourceMappingURL=setup.d.ts.map