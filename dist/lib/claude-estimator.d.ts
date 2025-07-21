/**
 * Claude Code usage estimation utilities
 */
interface TaskPattern {
    planning: number;
    implementation: number;
    testing: number;
    documentation: number;
    total: number;
}
interface UsagePatterns {
    bugFix: TaskPattern;
    smallFeature: TaskPattern;
    mediumFeature: TaskPattern;
    largeFeature: TaskPattern;
    architecture: TaskPattern;
}
/**
 * Estimate Claude usage for different task types
 */
declare const USAGE_PATTERNS: UsagePatterns;
type MessageType = 'code' | 'planning' | 'mixed';
type UsageCategory = 'Light' | 'Moderate' | 'Heavy' | 'Intensive';
type TaskType = keyof UsagePatterns;
interface CostEstimate {
    totalTokens: number;
    estimatedCost: number;
    formattedCost: string;
}
interface UsageBreakdown extends CostEstimate {
    breakdown: TaskPattern;
    category: UsageCategory;
}
/**
 * Calculate estimated cost for Claude usage
 */
declare function estimateCost(messageCount: number, messageType?: MessageType): CostEstimate;
/**
 * Get usage category based on message count
 */
declare function getUsageCategory(messageCount: number): UsageCategory;
/**
 * Generate usage breakdown for a task
 */
declare function generateUsageBreakdown(taskType: TaskType): UsageBreakdown;
/**
 * Format usage estimate for display
 */
declare function formatUsageEstimate(messageCount: number, breakdown?: TaskPattern | null): string;
export { USAGE_PATTERNS, estimateCost, getUsageCategory, generateUsageBreakdown, formatUsageEstimate };
declare const _default: {
    USAGE_PATTERNS: UsagePatterns;
    estimateCost: typeof estimateCost;
    getUsageCategory: typeof getUsageCategory;
    generateUsageBreakdown: typeof generateUsageBreakdown;
    formatUsageEstimate: typeof formatUsageEstimate;
};
export default _default;
//# sourceMappingURL=claude-estimator.d.ts.map