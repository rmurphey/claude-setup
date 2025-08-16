/**
 * Unit tests for documentation example management functions
 * TDD RED phase - all tests should fail initially
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

describe('docs.js example management', () => {
  
  it('should export findExemplaryCommits function', () => {
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.findExemplaryCommits, 'function');
  });
  
  it('should find commits matching TDD pattern', () => {
    const docs = require('../scripts/docs');
    const commits = docs.findExemplaryCommits('TDD');
    assert(Array.isArray(commits), 'should return an array');
    assert(commits.length > 0, 'should find at least one TDD commit');
    assert(commits[0].hash, 'each commit should have a hash');
    assert(commits[0].message, 'each commit should have a message');
    assert(commits[0].message.toLowerCase().includes('tdd'), 'commit message should contain TDD');
  });

  it('should limit results to specified count', () => {
    const docs = require('../scripts/docs');
    const commits = docs.findExemplaryCommits('feat', 3);
    assert(commits.length <= 3, 'should limit results to 3');
  });

  it('should return empty array for non-matching pattern', () => {
    const docs = require('../scripts/docs');
    const commits = docs.findExemplaryCommits('NONEXISTENTPATTERN123');
    assert(Array.isArray(commits), 'should return an array');
    assert.equal(commits.length, 0, 'should return empty array for non-matching pattern');
  });

  it('should export categorizeCommit function', () => {
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.categorizeCommit, 'function');
  });

  it('should categorize TDD RED commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('🔴 test: add failing test for feature');
    assert.equal(category, 'tdd-red', 'should categorize as TDD RED');
  });

  it('should categorize TDD GREEN commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('🟢 feat: implement feature to pass test');
    assert.equal(category, 'tdd-green', 'should categorize as TDD GREEN');
  });

  it('should categorize feature commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('feat: add new command');
    assert.equal(category, 'feature', 'should categorize as feature');
  });

  it('should categorize fix commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('fix: resolve issue with paths');
    assert.equal(category, 'fix', 'should categorize as fix');
  });

  it('should categorize documentation commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('docs: update README');
    assert.equal(category, 'docs', 'should categorize as docs');
  });

  it('should categorize refactor commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('refactor: simplify function logic');
    assert.equal(category, 'refactor', 'should categorize as refactor');
  });

  it('should categorize test commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('test: add unit tests');
    assert.equal(category, 'test', 'should categorize as test');
  });

  it('should return other for uncategorized commits', () => {
    const docs = require('../scripts/docs');
    const category = docs.categorizeCommit('random commit message');
    assert.equal(category, 'other', 'should categorize as other');
  });

  it('should export formatCommitReference function', () => {
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.formatCommitReference, 'function');
  });

  it('should format commit as markdown link', () => {
    const docs = require('../scripts/docs');
    const formatted = docs.formatCommitReference('abc123', 'feat: add feature');
    assert(formatted.includes('['), 'should contain opening bracket');
    assert(formatted.includes(']'), 'should contain closing bracket');
    assert(formatted.includes('('), 'should contain opening parenthesis');
    assert(formatted.includes(')'), 'should contain closing parenthesis');
    assert(formatted.includes('abc123'), 'should contain commit hash');
    assert(formatted.includes('feat: add feature'), 'should contain commit message');
  });

  it('should format with relative link to commit', () => {
    const docs = require('../scripts/docs');
    const formatted = docs.formatCommitReference('abc123', 'feat: add feature');
    assert(formatted.includes('../../commit/abc123'), 'should link to commit');
  });

  it('should truncate long messages', () => {
    const docs = require('../scripts/docs');
    const longMessage = 'feat: ' + 'a'.repeat(100);
    const formatted = docs.formatCommitReference('abc123', longMessage);
    assert(formatted.length < 150, 'should truncate long messages');
    assert(formatted.includes('...'), 'should include ellipsis for truncated messages');
  });

  it('should export updateExampleSection function', () => {
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.updateExampleSection, 'function');
  });

  it('should add examples to empty section', () => {
    const docs = require('../scripts/docs');
    const content = '### Examples\n\n### Next Section';
    const examples = [
      { hash: 'abc123', message: 'feat: add feature' },
      { hash: 'def456', message: 'fix: fix bug' }
    ];
    const updated = docs.updateExampleSection(content, 'Examples', examples);
    assert(updated.includes('abc123'), 'should include first commit hash');
    assert(updated.includes('def456'), 'should include second commit hash');
    assert(updated.includes('feat: add feature'), 'should include first commit message');
    assert(updated.includes('fix: fix bug'), 'should include second commit message');
  });

  it('should replace existing examples in section', () => {
    const docs = require('../scripts/docs');
    const content = '### Examples\n- old example\n### Next Section';
    const examples = [
      { hash: 'new123', message: 'feat: new feature' }
    ];
    const updated = docs.updateExampleSection(content, 'Examples', examples);
    assert(updated.includes('new123'), 'should include new commit');
    assert(!updated.includes('old example'), 'should remove old content');
  });

  it('should preserve other sections', () => {
    const docs = require('../scripts/docs');
    const content = '### Section 1\nContent 1\n### Examples\nOld\n### Section 2\nContent 2';
    const examples = [{ hash: 'abc123', message: 'feat: test' }];
    const updated = docs.updateExampleSection(content, 'Examples', examples);
    assert(updated.includes('Section 1'), 'should preserve first section');
    assert(updated.includes('Content 1'), 'should preserve first section content');
    assert(updated.includes('Section 2'), 'should preserve second section');
    assert(updated.includes('Content 2'), 'should preserve second section content');
  });

  it('should create section if it does not exist', () => {
    const docs = require('../scripts/docs');
    const content = '# Document\nSome content';
    const examples = [{ hash: 'abc123', message: 'feat: test' }];
    const updated = docs.updateExampleSection(content, 'Examples', examples);
    assert(updated.includes('### Examples'), 'should create Examples section');
    assert(updated.includes('abc123'), 'should include example');
  });

  it('should export validateCommitExists function', () => {
    const docs = require('../scripts/docs');
    assert.strictEqual(typeof docs.validateCommitExists, 'function');
  });

  it('should return true for existing commit', () => {
    const docs = require('../scripts/docs');
    // Use a known commit from the repo (from our earlier git log)
    const exists = docs.validateCommitExists('c446afe');
    assert.equal(exists, true, 'should return true for existing commit');
  });

  it('should return false for non-existing commit', () => {
    const docs = require('../scripts/docs');
    const exists = docs.validateCommitExists('nonexistent123456789');
    assert.equal(exists, false, 'should return false for non-existing commit');
  });

  it('should handle invalid hash gracefully', () => {
    const docs = require('../scripts/docs');
    const exists = docs.validateCommitExists('');
    assert.equal(exists, false, 'should return false for empty hash');
  });

  it('should support full workflow - find, categorize, format, and update', () => {
    const docs = require('../scripts/docs');
    // This test will ensure all pieces work together
    const commits = docs.findExemplaryCommits('feat', 2);
    assert(commits.length > 0, 'should find commits');
    
    const categorized = commits.map(c => ({
      ...c,
      category: docs.categorizeCommit(c.message)
    }));
    assert(categorized[0].category, 'should have category');
    
    const formatted = commits.map(c => docs.formatCommitReference(c.hash, c.message));
    assert(formatted.length > 0, 'should format commits');
    
    const content = '# Test Document\n### Examples\n\n### End';
    const updated = docs.updateExampleSection(content, 'Examples', commits);
    assert(updated.includes(commits[0].hash), 'should update content with examples');
  });
});