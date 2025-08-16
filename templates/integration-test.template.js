/**
 * 🔴 Integration Test Template - Test the Full Flow!
 * 
 * Integration tests ensure your pieces work together.
 * Perfect for CLI commands, API endpoints, file operations.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('YourFeature Integration', () => {
  
  // Set up test environment
  let testDir;
  
  beforeEach(() => {
    // Create a clean test environment
    testDir = path.join(__dirname, 'test-workspace');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });
  
  afterEach(() => {
    // Clean up after tests
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });
  
  it('should complete the full workflow successfully', () => {
    // 🎯 Test the entire user journey
    
    // 1. Set up initial state
    const inputFile = path.join(testDir, 'input.txt');
    fs.writeFileSync(inputFile, 'test data');
    
    // 2. Run your feature
    // const result = execSync(`node your-script.js ${inputFile}`, {
    //   cwd: testDir,
    //   encoding: 'utf8'
    // });
    
    // 3. Verify the results
    // assert(fs.existsSync(expectedOutputFile));
    // assert(result.includes('Success'));
    
    // 💡 Claude will implement the full workflow
  });
  
  it('should handle real-world scenarios', () => {
    // Test with realistic data
    // - Large files
    // - Multiple users
    // - Network delays
    // - Whatever your users actually do
  });
  
  it('should recover from errors gracefully', () => {
    // Test error handling
    // - Missing files
    // - Invalid permissions  
    // - Network failures
    // - User mistakes
  });
});

/**
 * 🎮 Integration Test Strategy with Claude
 * 
 * 1. DESCRIBE the user journey:
 *    "User uploads a file, processes it, downloads result"
 * 
 * 2. WRITE test for happy path:
 *    - Set up realistic scenario
 *    - Execute the workflow
 *    - Verify expected outcome
 * 
 * 3. ASK Claude for edge cases:
 *    "What could go wrong in this workflow?"
 * 
 * 4. ADD tests for each edge case
 * 
 * 5. IMPLEMENT with confidence:
 *    Claude knows exactly what needs to work
 * 
 * 💪 Why Integration Tests Rock with Claude:
 * 
 * - Forces Claude to think about the full system
 * - Catches issues unit tests miss
 * - Gives confidence that features actually work
 * - Documents how components interact
 * 
 * 🚀 Pro Tips:
 * 
 * - Use real files/databases in tests (in temp directories)
 * - Test the actual CLI commands users will run
 * - Include performance assertions (should complete in < 1s)
 * - Test with production-like data volumes
 */