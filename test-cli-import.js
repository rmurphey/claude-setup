import { CLIMain } from './dist/cli/main.js';

console.log('Testing CLIMain import...');

try {
  const cli = new CLIMain();
  console.log('✅ CLIMain imported successfully');
  
  const config = cli.parseArgs(['--help']);
  console.log('✅ parseArgs works:', config);
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}