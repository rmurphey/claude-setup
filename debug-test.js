import { CLIMain } from './dist/cli/main.js';

const cli = new CLIMain();

console.log('Testing unknown flag...');
try {
  cli.parseArgs(['--unknown-flag']);
} catch (error) {
  console.log('Error message:', error.message);
  console.log('Error type:', error.constructor.name);
}

console.log('\nTesting invalid language...');
try {
  cli.parseArgs(['--language=invalid']);
} catch (error) {
  console.log('Error message:', error.message);
  console.log('Error type:', error.constructor.name);
}

console.log('\nTesting language without value...');
try {
  cli.parseArgs(['--language']);
} catch (error) {
  console.log('Error message:', error.message);
  console.log('Error type:', error.constructor.name);
}

console.log('\nTesting special characters...');
try {
  cli.parseArgs(['--language=c++']);
} catch (error) {
  console.log('Error message:', error.message);
  console.log('Error type:', error.constructor.name);
}