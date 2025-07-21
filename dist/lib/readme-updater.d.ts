interface CommandDescription {
    cmd: string;
    desc: string;
}
interface CommandCategories {
    [categoryName: string]: CommandDescription[];
}
interface UpdateResult {
    commandCount?: number;
    updated: boolean;
    error?: string;
}
interface AllDocsUpdateResult {
    readme: UpdateResult;
    estimates: UpdateResult;
}
/**
 * Get list of commands by scanning .claude/commands directory
 */
export declare function getCommandList(): Promise<string[]>;
/**
 * Get command descriptions from actual command files
 */
export declare function getCommandDescriptions(): Promise<Record<string, string>>;
/**
 * Categorize commands for README display
 */
export declare function categorizeCommands(): CommandCategories;
/**
 * Generate README command section
 */
export declare function generateCommandSection(): Promise<string>;
/**
 * Update README with current command information
 */
export declare function updateReadme(): Promise<UpdateResult>;
/**
 * Update internal ESTIMATES.md with current command count
 */
export declare function updateEstimates(): Promise<UpdateResult>;
/**
 * Update all documentation files
 */
export declare function updateAllDocs(): Promise<AllDocsUpdateResult>;
declare const _default: {
    getCommandList: typeof getCommandList;
    getCommandDescriptions: typeof getCommandDescriptions;
    categorizeCommands: typeof categorizeCommands;
    generateCommandSection: typeof generateCommandSection;
    updateReadme: typeof updateReadme;
    updateEstimates: typeof updateEstimates;
    updateAllDocs: typeof updateAllDocs;
};
export default _default;
//# sourceMappingURL=readme-updater.d.ts.map