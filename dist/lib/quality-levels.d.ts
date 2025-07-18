export namespace QualityLevels {
    namespace strict {
        let name: string;
        let description: string;
        let configFile: string;
        let enforceAllRules: boolean;
        let allowExceptions: boolean;
        let autoFix: boolean;
    }
    namespace standard {
        let name_1: string;
        export { name_1 as name };
        let description_1: string;
        export { description_1 as description };
        let configFile_1: string;
        export { configFile_1 as configFile };
        let enforceAllRules_1: boolean;
        export { enforceAllRules_1 as enforceAllRules };
        export let allowMinorVariations: boolean;
        let autoFix_1: boolean;
        export { autoFix_1 as autoFix };
    }
    namespace relaxed {
        let name_2: string;
        export { name_2 as name };
        let description_2: string;
        export { description_2 as description };
        let configFile_2: string;
        export { configFile_2 as configFile };
        export let enforceCriticalOnly: boolean;
        export let allowVariations: boolean;
        let autoFix_2: boolean;
        export { autoFix_2 as autoFix };
    }
}
export class QualityLevelManager {
    configPath: string;
    getCurrentLevel(): Promise<any>;
    setQualityLevel(level: any): Promise<{
        qualityLevel: any;
        updatedAt: string;
        description: any;
    }>;
    updateESLintConfig(level: any): Promise<void>;
    getAvailableLevels(): Promise<{
        value: string;
        name: string;
        description: string;
    }[]>;
}
export default QualityLevelManager;
//# sourceMappingURL=quality-levels.d.ts.map