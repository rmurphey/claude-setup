/**
 * Claude Code usage estimation utilities
 */

// Current Claude pricing (approximate, as of 2024)
interface ClaudePricing {
  input: number;  // per 1K tokens
  output: number; // per 1K tokens
}

interface PricingTiers {
  sonnet: ClaudePricing;
}

const CLAUDE_PRICING: PricingTiers = {
  sonnet: {
    input: 0.003,  // per 1K tokens
    output: 0.015  // per 1K tokens
  }
};

// Average tokens per message (rough estimates)
interface TokenAverages {
  userMessage: number;      // Short user prompts
  claudeResponse: number;   // Typical Claude responses
  codeMessage: number;      // Messages with code
  planningMessage: number;  // Planning/design messages
}

const AVERAGE_TOKENS: TokenAverages = {
  userMessage: 50,      // Short user prompts
  claudeResponse: 300,  // Typical Claude responses
  codeMessage: 150,     // Messages with code
  planningMessage: 200  // Planning/design messages
};

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
const USAGE_PATTERNS: UsagePatterns = {
  bugFix: {
    planning: 2,
    implementation: 8,
    testing: 3,
    documentation: 1,
    total: 14
  },
  smallFeature: {
    planning: 5,
    implementation: 25,
    testing: 8,
    documentation: 4,
    total: 42
  },
  mediumFeature: {
    planning: 10,
    implementation: 60,
    testing: 15,
    documentation: 10,
    total: 95
  },
  largeFeature: {
    planning: 20,
    implementation: 120,
    testing: 30,
    documentation: 20,
    total: 190
  },
  architecture: {
    planning: 40,
    implementation: 200,
    testing: 40,
    documentation: 30,
    total: 310
  }
};

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
function estimateCost(messageCount: number, messageType: MessageType = 'mixed'): CostEstimate {
  const tokensPerMessage = messageType === 'code' ? AVERAGE_TOKENS.codeMessage : 
                          messageType === 'planning' ? AVERAGE_TOKENS.planningMessage :
                          (AVERAGE_TOKENS.userMessage + AVERAGE_TOKENS.claudeResponse) / 2;
  
  const totalTokens = messageCount * tokensPerMessage;
  const inputTokens = totalTokens * 0.4;  // Rough split
  const outputTokens = totalTokens * 0.6;
  
  const cost = (inputTokens / 1000 * CLAUDE_PRICING.sonnet.input) + 
               (outputTokens / 1000 * CLAUDE_PRICING.sonnet.output);
  
  return {
    totalTokens,
    estimatedCost: cost,
    formattedCost: `$${cost.toFixed(2)}`
  };
}

/**
 * Get usage category based on message count
 */
function getUsageCategory(messageCount: number): UsageCategory {
  if (messageCount < 50) return 'Light';
  if (messageCount < 150) return 'Moderate';
  if (messageCount < 400) return 'Heavy';
  return 'Intensive';
}

/**
 * Generate usage breakdown for a task
 */
function generateUsageBreakdown(taskType: TaskType): UsageBreakdown {
  const pattern = USAGE_PATTERNS[taskType];
  if (!pattern) {
    throw new Error(`Unknown task type: ${taskType}`);
  }
  
  const cost = estimateCost(pattern.total);
  
  return {
    breakdown: pattern,
    category: getUsageCategory(pattern.total),
    ...cost
  };
}

/**
 * Format usage estimate for display
 */
function formatUsageEstimate(messageCount: number, breakdown: TaskPattern | null = null): string {
  const category = getUsageCategory(messageCount);
  const cost = estimateCost(messageCount);
  
  let output = `💬 Claude Usage: ${category} (~${messageCount} messages)\n`;
  output += `💰 Estimated Cost: ${cost.formattedCost}\n`;
  
  if (breakdown) {
    output += '🔍 BREAKDOWN:\n';
    output += `• Planning: ${breakdown.planning} messages\n`;
    output += `• Implementation: ${breakdown.implementation} messages\n`;
    output += `• Testing: ${breakdown.testing} messages\n`;
    output += `• Documentation: ${breakdown.documentation} messages\n`;
  }
  
  return output;
}

export {
  USAGE_PATTERNS,
  estimateCost,
  getUsageCategory,
  generateUsageBreakdown,
  formatUsageEstimate
};

export default {
  USAGE_PATTERNS,
  estimateCost,
  getUsageCategory,
  generateUsageBreakdown,
  formatUsageEstimate
};