import { describe, test } from 'node:test';
import assert from 'node:assert';

import { 
  estimateCost, 
  getUsageCategory, 
  generateUsageBreakdown,
  formatUsageEstimate,
  USAGE_PATTERNS
} from '../dist/lib/claude-estimator.js';

describe('Claude Cost Estimation', () => {
  describe('getUsageCategory', () => {
    test('should categorize Light usage correctly', () => {
      assert.strictEqual(getUsageCategory(10), 'Light');
      assert.strictEqual(getUsageCategory(25), 'Light');
      assert.strictEqual(getUsageCategory(49), 'Light');
    });

    test('should categorize Moderate usage correctly', () => {
      assert.strictEqual(getUsageCategory(50), 'Moderate');
      assert.strictEqual(getUsageCategory(100), 'Moderate');
      assert.strictEqual(getUsageCategory(149), 'Moderate');
    });

    test('should categorize Heavy usage correctly', () => {
      assert.strictEqual(getUsageCategory(150), 'Heavy');
      assert.strictEqual(getUsageCategory(250), 'Heavy');
      assert.strictEqual(getUsageCategory(399), 'Heavy');
    });

    test('should categorize Intensive usage correctly', () => {
      assert.strictEqual(getUsageCategory(400), 'Intensive');
      assert.strictEqual(getUsageCategory(500), 'Intensive');
      assert.strictEqual(getUsageCategory(1000), 'Intensive');
    });

    test('should handle edge cases', () => {
      assert.strictEqual(getUsageCategory(0), 'Light');
      assert.strictEqual(getUsageCategory(1), 'Light');
    });
  });

  describe('estimateCost', () => {
    test('should calculate reasonable costs for different message counts', () => {
      const lightCost = estimateCost(25);
      const moderateCost = estimateCost(100);
      const heavyCost = estimateCost(300);

      // Costs should increase with message count
      assert(lightCost.estimatedCost < moderateCost.estimatedCost);
      assert(moderateCost.estimatedCost < heavyCost.estimatedCost);

      // All costs should be positive
      assert(lightCost.estimatedCost > 0);
      assert(moderateCost.estimatedCost > 0);
      assert(heavyCost.estimatedCost > 0);
    });

    test('should format costs correctly', () => {
      const result = estimateCost(100);
      
      assert(/^\$\d+\.\d{2}$/.test(result.formattedCost));
      assert(result.totalTokens > 0);
      assert.strictEqual(typeof result.estimatedCost, 'number');
    });

    test('should handle different message types', () => {
      const mixedCost = estimateCost(50, 'mixed');
      const codeCost = estimateCost(50, 'code');
      const planningCost = estimateCost(50, 'planning');

      assert(mixedCost.estimatedCost > 0);
      assert(codeCost.estimatedCost > 0);
      assert(planningCost.estimatedCost > 0);

      // Different message types should have different costs
      assert.notStrictEqual(codeCost.estimatedCost, mixedCost.estimatedCost);
      assert.notStrictEqual(planningCost.estimatedCost, mixedCost.estimatedCost);
    });

    test('should handle zero messages gracefully', () => {
      const result = estimateCost(0);
      
      assert.strictEqual(result.estimatedCost, 0);
      assert.strictEqual(result.totalTokens, 0);
      assert.strictEqual(result.formattedCost, '$0.00');
    });
  });

  describe('USAGE_PATTERNS', () => {
    test('should have consistent structure for all patterns', () => {
      const requiredKeys = ['planning', 'implementation', 'testing', 'documentation', 'total'];
      
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        
        requiredKeys.forEach(key => {
          assert(Object.hasOwn(pattern, key));
          assert.strictEqual(typeof pattern[key], 'number');
          assert(pattern[key] >= 0);
        });
      });
    });

    test('should have totals that match sum of components', () => {
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        const calculatedTotal = pattern.planning + pattern.implementation + 
                               pattern.testing + pattern.documentation;
        
        assert.strictEqual(pattern.total, calculatedTotal);
      });
    });

    test('should have realistic patterns that increase with complexity', () => {
      assert(USAGE_PATTERNS.bugFix.total < USAGE_PATTERNS.smallFeature.total);
      assert(USAGE_PATTERNS.smallFeature.total < USAGE_PATTERNS.mediumFeature.total);
      assert(USAGE_PATTERNS.mediumFeature.total < USAGE_PATTERNS.largeFeature.total);
      assert(USAGE_PATTERNS.largeFeature.total < USAGE_PATTERNS.architecture.total);
    });

    test('should have implementation as largest component for most patterns', () => {
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        
        // Implementation should typically be the largest component
        assert(pattern.implementation >= pattern.planning);
        assert(pattern.implementation >= pattern.testing);
        assert(pattern.implementation >= pattern.documentation);
      });
    });
  });

  describe('generateUsageBreakdown', () => {
    test('should generate valid breakdown for known task types', () => {
      const validTaskTypes = ['bugFix', 'smallFeature', 'mediumFeature', 'largeFeature', 'architecture'];
      
      validTaskTypes.forEach(taskType => {
        const breakdown = generateUsageBreakdown(taskType);
        
        assert(Object.hasOwn(breakdown, 'breakdown'));
        assert(Object.hasOwn(breakdown, 'category'));
        assert(Object.hasOwn(breakdown, 'totalTokens'));
        assert(Object.hasOwn(breakdown, 'estimatedCost'));
        assert(Object.hasOwn(breakdown, 'formattedCost'));
        
        assert.deepStrictEqual(breakdown.breakdown, USAGE_PATTERNS[taskType]);
        assert(['Light', 'Moderate', 'Heavy', 'Intensive'].includes(breakdown.category));
      });
    });

    test('should throw error for unknown task type', () => {
      assert.throws(() => {
        generateUsageBreakdown('unknownTaskType');
      }, /Unknown task type: unknownTaskType/);
    });

    test('should have consistent categories based on total messages', () => {
      const bugFixBreakdown = generateUsageBreakdown('bugFix');
      const architectureBreakdown = generateUsageBreakdown('architecture');
      
      // Bug fix should be lighter category than architecture
      const bugFixCategory = getUsageCategory(USAGE_PATTERNS.bugFix.total);
      const architectureCategory = getUsageCategory(USAGE_PATTERNS.architecture.total);
      
      assert.strictEqual(bugFixBreakdown.category, bugFixCategory);
      assert.strictEqual(architectureBreakdown.category, architectureCategory);
    });
  });

  describe('formatUsageEstimate', () => {
    test('should format estimate without breakdown', () => {
      const result = formatUsageEstimate(100);
      
      assert(result.includes('Claude Usage: Moderate (~100 messages)'));
      assert(result.includes('Estimated Cost: $'));
      assert(!result.includes('BREAKDOWN:'));
    });

    test('should format estimate with breakdown', () => {
      const breakdown = USAGE_PATTERNS.mediumFeature;
      const result = formatUsageEstimate(breakdown.total, breakdown);
      
      assert(result.includes('Claude Usage:'));
      assert(result.includes('Estimated Cost: $'));
      assert(result.includes('BREAKDOWN:'));
      assert(result.includes(`Planning: ${breakdown.planning} messages`));
      assert(result.includes(`Implementation: ${breakdown.implementation} messages`));
      assert(result.includes(`Testing: ${breakdown.testing} messages`));
      assert(result.includes(`Documentation: ${breakdown.documentation} messages`));
    });

    test('should handle edge cases', () => {
      const zeroResult = formatUsageEstimate(0);
      assert(zeroResult.includes('Light (~0 messages)'));
      assert(zeroResult.includes('$0.00'));

      const largeResult = formatUsageEstimate(1000);
      assert(largeResult.includes('Intensive (~1000 messages)'));
    });
  });

  describe('Real-world validation', () => {
    test('should produce reasonable estimates for known historical tasks', () => {
      // Based on internal/ESTIMATES.md: Test Infrastructure Fix
      // Estimated: Moderate (80 messages), Actual: ~60 messages
      
      const testInfraEstimate = estimateCost(80);
      const testInfraActual = estimateCost(60);
      
      // Both should be in reasonable range ($0.10-5.00 for moderate tasks)
      assert(testInfraEstimate.estimatedCost > 0.10);
      assert(testInfraEstimate.estimatedCost < 5.00);
      assert(testInfraActual.estimatedCost < testInfraEstimate.estimatedCost);
    });

    test('should categorize historical estimates correctly', () => {
      // Test Infrastructure Fix should be Moderate
      assert.strictEqual(getUsageCategory(80), 'Moderate');
      assert.strictEqual(getUsageCategory(60), 'Moderate');
      
      // User authentication system (from ESTIMATES.md) should be Heavy
      assert.strictEqual(getUsageCategory(250), 'Heavy');
    });

    test('should have patterns that match real development ratios', () => {
      // Implementation should typically be 50-70% of total effort
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        const implementationRatio = pattern.implementation / pattern.total;
        
        assert(implementationRatio > 0.4); // At least 40%
        assert(implementationRatio < 0.8);    // At most 80%
      });
    });
  });
});