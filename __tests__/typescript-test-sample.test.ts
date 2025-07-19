import { describe, test } from 'node:test';
import assert from 'node:assert';

// Sample TypeScript test to verify test configuration
describe('TypeScript Test Configuration', () => {
  test('should support TypeScript test files', () => {
    // Test basic TypeScript features
    const config: { name: string; version: number } = {
      name: 'test-config',
      version: 1
    };
    
    assert.strictEqual(config.name, 'test-config');
    assert.strictEqual(config.version, 1);
  });

  test('should support type assertions and interfaces', () => {
    interface TestInterface {
      id: number;
      name: string;
      active: boolean;
    }

    const testData: TestInterface = {
      id: 123,
      name: 'test-item',
      active: true
    };

    assert.strictEqual(typeof testData.id, 'number');
    assert.strictEqual(typeof testData.name, 'string');
    assert.strictEqual(typeof testData.active, 'boolean');
  });

  test('should support generic types', () => {
    function identity<T>(arg: T): T {
      return arg;
    }

    const stringResult = identity<string>('hello');
    const numberResult = identity<number>(42);

    assert.strictEqual(stringResult, 'hello');
    assert.strictEqual(numberResult, 42);
  });
});