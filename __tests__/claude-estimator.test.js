import { jest, expect, describe, test } from '@jest/globals';
import { 
  estimateCost, 
  getUsageCategory, 
  generateUsageBreakdown,
  formatUsageEstimate,
  USAGE_PATTERNS
} from '../lib/claude-estimator.js';

describe('Claude Cost Estimation', () => {
  describe('getUsageCategory', () => {
    test('should categorize Light usage correctly', () => {
      expect(getUsageCategory(10)).toBe('Light');
      expect(getUsageCategory(25)).toBe('Light');
      expect(getUsageCategory(49)).toBe('Light');
    });

    test('should categorize Moderate usage correctly', () => {
      expect(getUsageCategory(50)).toBe('Moderate');
      expect(getUsageCategory(100)).toBe('Moderate');
      expect(getUsageCategory(149)).toBe('Moderate');
    });

    test('should categorize Heavy usage correctly', () => {
      expect(getUsageCategory(150)).toBe('Heavy');
      expect(getUsageCategory(250)).toBe('Heavy');
      expect(getUsageCategory(399)).toBe('Heavy');
    });

    test('should categorize Intensive usage correctly', () => {
      expect(getUsageCategory(400)).toBe('Intensive');
      expect(getUsageCategory(500)).toBe('Intensive');
      expect(getUsageCategory(1000)).toBe('Intensive');
    });

    test('should handle edge cases', () => {
      expect(getUsageCategory(0)).toBe('Light');
      expect(getUsageCategory(1)).toBe('Light');
    });
  });

  describe('estimateCost', () => {
    test('should calculate reasonable costs for different message counts', () => {
      const lightCost = estimateCost(25);
      const moderateCost = estimateCost(100);
      const heavyCost = estimateCost(300);

      // Costs should increase with message count
      expect(lightCost.estimatedCost).toBeLessThan(moderateCost.estimatedCost);
      expect(moderateCost.estimatedCost).toBeLessThan(heavyCost.estimatedCost);

      // All costs should be positive
      expect(lightCost.estimatedCost).toBeGreaterThan(0);
      expect(moderateCost.estimatedCost).toBeGreaterThan(0);
      expect(heavyCost.estimatedCost).toBeGreaterThan(0);
    });

    test('should format costs correctly', () => {
      const result = estimateCost(100);
      
      expect(result.formattedCost).toMatch(/^\$\d+\.\d{2}$/);
      expect(result.totalTokens).toBeGreaterThan(0);
      expect(typeof result.estimatedCost).toBe('number');
    });

    test('should handle different message types', () => {
      const mixedCost = estimateCost(50, 'mixed');
      const codeCost = estimateCost(50, 'code');
      const planningCost = estimateCost(50, 'planning');

      expect(mixedCost.estimatedCost).toBeGreaterThan(0);
      expect(codeCost.estimatedCost).toBeGreaterThan(0);
      expect(planningCost.estimatedCost).toBeGreaterThan(0);

      // Different message types should have different costs
      expect(codeCost.estimatedCost).not.toBe(mixedCost.estimatedCost);
      expect(planningCost.estimatedCost).not.toBe(mixedCost.estimatedCost);
    });

    test('should handle zero messages gracefully', () => {
      const result = estimateCost(0);
      
      expect(result.estimatedCost).toBe(0);
      expect(result.totalTokens).toBe(0);
      expect(result.formattedCost).toBe('$0.00');
    });
  });

  describe('USAGE_PATTERNS', () => {
    test('should have consistent structure for all patterns', () => {
      const requiredKeys = ['planning', 'implementation', 'testing', 'documentation', 'total'];
      
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        
        requiredKeys.forEach(key => {
          expect(pattern).toHaveProperty(key);
          expect(typeof pattern[key]).toBe('number');
          expect(pattern[key]).toBeGreaterThanOrEqual(0);
        });
      });
    });

    test('should have totals that match sum of components', () => {
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        const calculatedTotal = pattern.planning + pattern.implementation + 
                               pattern.testing + pattern.documentation;
        
        expect(pattern.total).toBe(calculatedTotal);
      });
    });

    test('should have realistic patterns that increase with complexity', () => {
      expect(USAGE_PATTERNS.bugFix.total).toBeLessThan(USAGE_PATTERNS.smallFeature.total);
      expect(USAGE_PATTERNS.smallFeature.total).toBeLessThan(USAGE_PATTERNS.mediumFeature.total);
      expect(USAGE_PATTERNS.mediumFeature.total).toBeLessThan(USAGE_PATTERNS.largeFeature.total);
      expect(USAGE_PATTERNS.largeFeature.total).toBeLessThan(USAGE_PATTERNS.architecture.total);
    });

    test('should have implementation as largest component for most patterns', () => {
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        
        // Implementation should typically be the largest component
        expect(pattern.implementation).toBeGreaterThanOrEqual(pattern.planning);
        expect(pattern.implementation).toBeGreaterThanOrEqual(pattern.testing);
        expect(pattern.implementation).toBeGreaterThanOrEqual(pattern.documentation);
      });
    });
  });

  describe('generateUsageBreakdown', () => {
    test('should generate valid breakdown for known task types', () => {
      const validTaskTypes = ['bugFix', 'smallFeature', 'mediumFeature', 'largeFeature', 'architecture'];
      
      validTaskTypes.forEach(taskType => {
        const breakdown = generateUsageBreakdown(taskType);
        
        expect(breakdown).toHaveProperty('breakdown');
        expect(breakdown).toHaveProperty('category');
        expect(breakdown).toHaveProperty('totalTokens');
        expect(breakdown).toHaveProperty('estimatedCost');
        expect(breakdown).toHaveProperty('formattedCost');
        
        expect(breakdown.breakdown).toEqual(USAGE_PATTERNS[taskType]);
        expect(['Light', 'Moderate', 'Heavy', 'Intensive']).toContain(breakdown.category);
      });
    });

    test('should throw error for unknown task type', () => {
      expect(() => {
        generateUsageBreakdown('unknownTaskType');
      }).toThrow('Unknown task type: unknownTaskType');
    });

    test('should have consistent categories based on total messages', () => {
      const bugFixBreakdown = generateUsageBreakdown('bugFix');
      const architectureBreakdown = generateUsageBreakdown('architecture');
      
      // Bug fix should be lighter category than architecture
      const bugFixCategory = getUsageCategory(USAGE_PATTERNS.bugFix.total);
      const architectureCategory = getUsageCategory(USAGE_PATTERNS.architecture.total);
      
      expect(bugFixBreakdown.category).toBe(bugFixCategory);
      expect(architectureBreakdown.category).toBe(architectureCategory);
    });
  });

  describe('formatUsageEstimate', () => {
    test('should format estimate without breakdown', () => {
      const result = formatUsageEstimate(100);
      
      expect(result).toContain('Claude Usage: Moderate (~100 messages)');
      expect(result).toContain('Estimated Cost: $');
      expect(result).not.toContain('BREAKDOWN:');
    });

    test('should format estimate with breakdown', () => {
      const breakdown = USAGE_PATTERNS.mediumFeature;
      const result = formatUsageEstimate(breakdown.total, breakdown);
      
      expect(result).toContain('Claude Usage:');
      expect(result).toContain('Estimated Cost: $');
      expect(result).toContain('BREAKDOWN:');
      expect(result).toContain(`Planning: ${breakdown.planning} messages`);
      expect(result).toContain(`Implementation: ${breakdown.implementation} messages`);
      expect(result).toContain(`Testing: ${breakdown.testing} messages`);
      expect(result).toContain(`Documentation: ${breakdown.documentation} messages`);
    });

    test('should handle edge cases', () => {
      const zeroResult = formatUsageEstimate(0);
      expect(zeroResult).toContain('Light (~0 messages)');
      expect(zeroResult).toContain('$0.00');

      const largeResult = formatUsageEstimate(1000);
      expect(largeResult).toContain('Intensive (~1000 messages)');
    });
  });

  describe('Real-world validation', () => {
    test('should produce reasonable estimates for known historical tasks', () => {
      // Based on internal/ESTIMATES.md: Test Infrastructure Fix
      // Estimated: Moderate (80 messages), Actual: ~60 messages
      
      const testInfraEstimate = estimateCost(80);
      const testInfraActual = estimateCost(60);
      
      // Both should be in reasonable range ($0.10-5.00 for moderate tasks)
      expect(testInfraEstimate.estimatedCost).toBeGreaterThan(0.10);
      expect(testInfraEstimate.estimatedCost).toBeLessThan(5.00);
      expect(testInfraActual.estimatedCost).toBeLessThan(testInfraEstimate.estimatedCost);
    });

    test('should categorize historical estimates correctly', () => {
      // Test Infrastructure Fix should be Moderate
      expect(getUsageCategory(80)).toBe('Moderate');
      expect(getUsageCategory(60)).toBe('Moderate');
      
      // User authentication system (from ESTIMATES.md) should be Heavy
      expect(getUsageCategory(250)).toBe('Heavy');
    });

    test('should have patterns that match real development ratios', () => {
      // Implementation should typically be 50-70% of total effort
      Object.keys(USAGE_PATTERNS).forEach(patternName => {
        const pattern = USAGE_PATTERNS[patternName];
        const implementationRatio = pattern.implementation / pattern.total;
        
        expect(implementationRatio).toBeGreaterThan(0.4); // At least 40%
        expect(implementationRatio).toBeLessThan(0.8);    // At most 80%
      });
    });
  });
});