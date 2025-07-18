/**
 * Calculate estimated cost for Claude usage
 */
export function estimateCost(messageCount: any, messageType?: string): {
    totalTokens: number;
    estimatedCost: number;
    formattedCost: string;
};
/**
 * Get usage category based on message count
 */
export function getUsageCategory(messageCount: any): "Light" | "Moderate" | "Heavy" | "Intensive";
/**
 * Generate usage breakdown for a task
 */
export function generateUsageBreakdown(taskType: any): {
    totalTokens: number;
    estimatedCost: number;
    formattedCost: string;
    breakdown: any;
    category: string;
};
/**
 * Format usage estimate for display
 */
export function formatUsageEstimate(messageCount: any, breakdown?: null): string;
export namespace USAGE_PATTERNS {
    namespace bugFix {
        let planning: number;
        let implementation: number;
        let testing: number;
        let documentation: number;
        let total: number;
    }
    namespace smallFeature {
        let planning_1: number;
        export { planning_1 as planning };
        let implementation_1: number;
        export { implementation_1 as implementation };
        let testing_1: number;
        export { testing_1 as testing };
        let documentation_1: number;
        export { documentation_1 as documentation };
        let total_1: number;
        export { total_1 as total };
    }
    namespace mediumFeature {
        let planning_2: number;
        export { planning_2 as planning };
        let implementation_2: number;
        export { implementation_2 as implementation };
        let testing_2: number;
        export { testing_2 as testing };
        let documentation_2: number;
        export { documentation_2 as documentation };
        let total_2: number;
        export { total_2 as total };
    }
    namespace largeFeature {
        let planning_3: number;
        export { planning_3 as planning };
        let implementation_3: number;
        export { implementation_3 as implementation };
        let testing_3: number;
        export { testing_3 as testing };
        let documentation_3: number;
        export { documentation_3 as documentation };
        let total_3: number;
        export { total_3 as total };
    }
    namespace architecture {
        let planning_4: number;
        export { planning_4 as planning };
        let implementation_4: number;
        export { implementation_4 as implementation };
        let testing_4: number;
        export { testing_4 as testing };
        let documentation_4: number;
        export { documentation_4 as documentation };
        let total_4: number;
        export { total_4 as total };
    }
}
declare namespace _default {
    export { USAGE_PATTERNS };
    export { estimateCost };
    export { getUsageCategory };
    export { generateUsageBreakdown };
    export { formatUsageEstimate };
}
export default _default;
//# sourceMappingURL=claude-estimator.d.ts.map