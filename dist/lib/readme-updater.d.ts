/**
 * Get list of commands by scanning .claude/commands directory
 */
export function getCommandList(): Promise<string[]>;
/**
 * Get command descriptions from actual command files
 */
export function getCommandDescriptions(): Promise<{}>;
/**
 * Categorize commands for README display
 */
export function categorizeCommands(): {
    'Core Workflow': {
        cmd: string;
        desc: string;
    }[];
    'Planning & Design': {
        cmd: string;
        desc: string;
    }[];
    'Codebase Analysis & Recovery': {
        cmd: string;
        desc: string;
    }[];
    'Learning & Growth': {
        cmd: string;
        desc: string;
    }[];
    Maintenance: {
        cmd: string;
        desc: string;
    }[];
};
/**
 * Generate README command section
 */
export function generateCommandSection(): Promise<string>;
/**
 * Update README with current command information
 */
export function updateReadme(): Promise<{
    commandCount: number;
    updated: boolean;
}>;
/**
 * Update internal ESTIMATES.md with current command count
 */
export function updateEstimates(): Promise<{
    updated: boolean;
    commandCount?: never;
} | {
    commandCount: number;
    updated: boolean;
}>;
/**
 * Update all documentation files
 */
export function updateAllDocs(): Promise<{
    readme: {
        commandCount: number;
        updated: boolean;
    } | {
        error: any;
    };
    estimates: {
        updated: boolean;
        commandCount?: never;
    } | {
        commandCount: number;
        updated: boolean;
    } | {
        error: any;
    };
}>;
declare namespace _default {
    export { getCommandList };
    export { getCommandDescriptions };
    export { categorizeCommands };
    export { generateCommandSection };
    export { updateReadme };
    export { updateEstimates };
    export { updateAllDocs };
}
export default _default;
//# sourceMappingURL=readme-updater.d.ts.map