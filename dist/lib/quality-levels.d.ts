interface QualityLevelConfig {
    name: string;
    description: string;
    configFile: string;
    enforceAllRules?: boolean;
    allowExceptions?: boolean;
    allowMinorVariations?: boolean;
    allowVariations?: boolean;
    enforceCriticalOnly?: boolean;
    autoFix: boolean;
}
interface QualityLevelsMap {
    strict: QualityLevelConfig;
    standard: QualityLevelConfig;
    relaxed: QualityLevelConfig;
}
type QualityLevelName = keyof QualityLevelsMap;
interface QualityConfig {
    qualityLevel: QualityLevelName;
    updatedAt: string;
    description: string;
}
interface AvailableLevel {
    value: QualityLevelName;
    name: string;
    description: string;
}
export declare const QualityLevels: QualityLevelsMap;
export declare class QualityLevelManager {
    private configPath;
    constructor();
    getCurrentLevel(): Promise<QualityLevelName>;
    setQualityLevel(level: QualityLevelName): Promise<QualityConfig>;
    private updateESLintConfig;
    getAvailableLevels(): Promise<AvailableLevel[]>;
}
export default QualityLevelManager;
//# sourceMappingURL=quality-levels.d.ts.map