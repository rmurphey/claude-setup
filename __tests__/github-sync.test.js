import { describe, test } from 'node:test';
import assert from 'node:assert';
import path from 'path';

import fs from 'fs-extra';

import { GitHubSync } from '../lib/github-sync.js';

describe('GitHub Sync', () => {
  const testWorkFile = path.join(process.cwd(), 'test-active-work.md');
  let sync;

  // Clean up test file before each test
  const setupTestFile = async () => {
    await fs.remove(testWorkFile);
    await fs.writeFile(testWorkFile, `# Active Work - Test

## Active Ideas

Quick capture of pending ideas:

---

## Deferred Items

- Test deferred item

---

## Completed Work
`);
    sync = new GitHubSync(testWorkFile);
  };

  const cleanupTestFile = async () => {
    await fs.remove(testWorkFile);
  };

  test('should create placeholder section when no issues exist', async () => {
    await setupTestFile();
    
    // Mock fetchGitHubIssues to return empty array
    sync.fetchGitHubIssues = async () => [];
    
    const result = await sync.syncIssues();
    assert(result);
    
    const content = await fs.readFile(testWorkFile, 'utf8');
    assert(content.includes('## GitHub Issues'));
    assert(content.includes('*No open GitHub issues*'));
    assert(content.includes('<!-- GITHUB_ISSUES_START -->'));
    assert(content.includes('<!-- GITHUB_ISSUES_END -->'));
    
    await cleanupTestFile();
  });

  test('should format GitHub issues correctly', async () => {
    await setupTestFile();
    
    // Mock fetchGitHubIssues to return sample issues
    sync.fetchGitHubIssues = async () => [
      {
        number: 123,
        title: 'Fix authentication bug',
        labels: [{ name: 'bug' }, { name: 'priority-high' }],
        assignees: [{ login: 'testuser' }],
        createdAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/123'
      },
      {
        number: 124,
        title: 'Add dark mode',
        labels: [{ name: 'feature' }],
        assignees: [],
        createdAt: '2025-01-02T00:00:00Z',
        url: 'https://github.com/test/repo/issues/124'
      }
    ];
    
    const result = await sync.syncIssues();
    assert(result);
    
    const content = await fs.readFile(testWorkFile, 'utf8');
    assert(content.includes('**#123**'));
    assert(content.includes('Fix authentication bug'));
    assert(content.includes('(@testuser)'));
    assert(content.includes('[bug, priority-high]'));
    assert(content.includes('**#124**'));
    assert(content.includes('Add dark mode'));
    assert(content.includes('[feature]'));
    
    await cleanupTestFile();
  });

  test('should update existing GitHub Issues section', async () => {
    await setupTestFile();
    
    // Add existing GitHub Issues section
    let content = await fs.readFile(testWorkFile, 'utf8');
    content = content.replace('## Deferred Items', `## GitHub Issues

<!-- GITHUB_ISSUES_START -->
Old content
<!-- GITHUB_ISSUES_END -->

---

## Deferred Items`);
    await fs.writeFile(testWorkFile, content);
    
    // Mock fetchGitHubIssues
    sync.fetchGitHubIssues = async () => [
      {
        number: 999,
        title: 'New issue',
        labels: [],
        assignees: [],
        createdAt: '2025-01-01T00:00:00Z',
        url: 'https://github.com/test/repo/issues/999'
      }
    ];
    
    const result = await sync.syncIssues();
    assert(result);
    
    const updatedContent = await fs.readFile(testWorkFile, 'utf8');
    assert(updatedContent.includes('**#999**'));
    assert(updatedContent.includes('New issue'));
    assert(!updatedContent.includes('Old content'));
    
    await cleanupTestFile();
  });

  test('should handle file not found gracefully', async () => {
    sync = new GitHubSync('nonexistent-file.md');
    const result = await sync.syncIssues();
    assert.strictEqual(result, false);
  });

  test('should format issues without labels and assignees', async () => {
    const issue = {
      number: 456,
      title: 'Simple issue',
      labels: [],
      assignees: [],
      createdAt: '2025-01-01T00:00:00Z',
      url: 'https://github.com/test/repo/issues/456'
    };
    
    const formatted = sync.formatIssue(issue);
    assert(formatted.includes('**#456**'));
    assert(formatted.includes('Simple issue'));
    assert(!formatted.includes('[@'));
    assert(!formatted.includes('(@'));
  });
});