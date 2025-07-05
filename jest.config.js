export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: [
    'bin/**/*.js',
    'lib/**/*.js',
    '!bin/**/*.test.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ]
};