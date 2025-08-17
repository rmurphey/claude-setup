/**
 * 🔴 RED Phase - Write this test FIRST!
 * 
 * Pro tip: If Claude tries to implement before the test,
 * just say "test first" and watch the magic happen.
 * 
 * This test should FAIL initially. That's the point!
 */

// const assert = require('assert'); // Uncomment when using assertions
// const { YourFunction } = require('../src/your-module');  // Uncomment when implementing

describe('YourFeature', () => {
  
  // Start with the happy path
  it('should do exactly what you need', () => {
    // 1. Arrange - Set up your test data
    // const input = 'your test input'; // Uncomment and update when implementing
    // const expected = 'expected output'; // Uncomment and update when implementing
    
    // 2. Act - Call the function (this will fail at first!)
    // const result = YourFunction(input);
    
    // 3. Assert - Check the result
    // assert.strictEqual(result, expected);
    
    // 💡 Claude will make this pass with minimal code
  });
  
  // Then add edge cases
  it('should handle edge case gracefully', () => {
    // Claude is great at finding edge cases you missed
    // Let Claude suggest what to test here!
  });
  
  // Error cases are important too
  it('should throw error for invalid input', () => {
    // assert.throws(() => {
    //   YourFunction(invalidInput);
    // }, /expected error message/);
  });
});

/**
 * 🟢 GREEN Phase - Make it pass!
 * 
 * After writing this test:
 * 1. Run: npm test (see it fail - that's good!)
 * 2. Say: "Make this test pass with minimal implementation"
 * 3. Claude writes ONLY what's needed
 * 4. Run: npm test (see it pass - celebrate!)
 * 
 * 🔄 REFACTOR Phase - Make it beautiful!
 * 
 * Once green:
 * 1. Say: "Can we improve this while keeping tests green?"
 * 2. Claude refactors safely
 * 3. Tests still pass = ship it!
 * 
 * 🎉 COMMIT - You're done!
 * 
 * Use atomic commits:
 * - First commit: "🔴 test: add failing test for [feature]"
 * - Second commit: "🟢 feat: implement [feature] to pass tests"
 * - Third commit (optional): "♻️ refactor: improve [feature] implementation"
 */