/**
 * Tests for archival system types and interfaces
 */

import { test } from 'node:test';
import assert from 'node:assert';

import { 
  ArchivalError, 
  ValidationError, 
  CopyError, 
  ConfigurationError 
} from '../dist/types/archival.js';

test('ArchivalError should be properly constructed', () => {
  const error = new ArchivalError(
    'Test error message',
    'VALIDATION_FAILED',
    '/test/spec/path'
  );

  assert.strictEqual(error.message, 'Test error message');
  assert.strictEqual(error.code, 'VALIDATION_FAILED');
  assert.strictEqual(error.specPath, '/test/spec/path');
  assert.strictEqual(error.name, 'ArchivalError');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ArchivalError);
});

test('ValidationError should extend ArchivalError correctly', () => {
  const error = new ValidationError(
    'Validation failed',
    '/test/spec/path'
  );

  assert.strictEqual(error.message, 'Validation failed');
  assert.strictEqual(error.code, 'VALIDATION_FAILED');
  assert.strictEqual(error.specPath, '/test/spec/path');
  assert.strictEqual(error.name, 'ValidationError');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ArchivalError);
  assert.ok(error instanceof ValidationError);
});

test('CopyError should extend ArchivalError correctly', () => {
  const error = new CopyError(
    'Copy operation failed',
    '/test/spec/path'
  );

  assert.strictEqual(error.message, 'Copy operation failed');
  assert.strictEqual(error.code, 'COPY_FAILED');
  assert.strictEqual(error.specPath, '/test/spec/path');
  assert.strictEqual(error.name, 'CopyError');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ArchivalError);
  assert.ok(error instanceof CopyError);
});

test('ConfigurationError should extend ArchivalError correctly', () => {
  const error = new ConfigurationError(
    'Configuration is invalid',
    '/test/spec/path'
  );

  assert.strictEqual(error.message, 'Configuration is invalid');
  assert.strictEqual(error.code, 'CONFIG_ERROR');
  assert.strictEqual(error.specPath, '/test/spec/path');
  assert.strictEqual(error.name, 'ConfigurationError');
  assert.ok(error instanceof Error);
  assert.ok(error instanceof ArchivalError);
  assert.ok(error instanceof ConfigurationError);
});

test('Error codes should be properly typed', () => {
  const validCodes = [
    'VALIDATION_FAILED',
    'COPY_FAILED',
    'CLEANUP_FAILED',
    'CONFIG_ERROR',
    'SPEC_NOT_FOUND',
    'ARCHIVE_EXISTS',
    'PERMISSION_DENIED',
    'INCOMPLETE_SPEC',
    'CONCURRENT_ACCESS'
  ];

  // Test that we can create errors with all valid codes
  validCodes.forEach(code => {
    const error = new ArchivalError(
      `Test error for ${code}`,
      code,
      '/test/path'
    );
    assert.strictEqual(error.code, code);
  });
});

test('Error stack trace should be properly maintained', () => {
  const error = new ArchivalError(
    'Test error',
    'VALIDATION_FAILED',
    '/test/path'
  );

  assert.ok(error.stack);
  assert.ok(error.stack.includes('ArchivalError'));
});