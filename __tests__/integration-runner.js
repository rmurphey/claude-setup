#!/usr/bin/env node

// Simple test runner to verify integration tests work
import { spawn } from 'child_process';

console.log('🧪 Running integration tests...');

const testProcess = spawn('node', ['--test', '__tests__/integration.test.js'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'test' }
});

let output = '';
let errors = '';

testProcess.stdout.on('data', (data) => {
  output += data.toString();
});

testProcess.stderr.on('data', (data) => {
  errors += data.toString();
});

testProcess.on('close', (code) => {
  console.log('📊 Test Output:');
  console.log(output);
  
  if (errors) {
    console.log('❌ Errors:');
    console.log(errors);
  }
  
  if (code === 0) {
    console.log('✅ Integration tests passed!');
  } else {
    console.log(`❌ Integration tests failed with code ${code}`);
  }
  
  process.exit(code);
});

testProcess.on('error', (error) => {
  console.error('❌ Failed to run integration tests:', error);
  process.exit(1);
});