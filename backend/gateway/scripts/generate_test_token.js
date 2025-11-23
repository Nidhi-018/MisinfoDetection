/**
 * Generate Test Token Script
 * 
 * Usage: node scripts/generate_test_token.js --userId=ish
 * 
 * Generates a test token for mock authentication
 */

const args = process.argv.slice(2);
let userId = 'test-user';

// Parse command line arguments
args.forEach((arg) => {
  if (arg.startsWith('--userId=')) {
    userId = arg.split('=')[1];
  }
});

// Generate test token
const token = `test-token-${userId}`;

console.log('\n=== Test Token Generated ===');
console.log(`User ID: ${userId}`);
console.log(`Token: ${token}`);
console.log('\nUsage:');
console.log(`  Authorization: Bearer ${token}`);
console.log('\nExample curl:');
console.log(`  curl -H "Authorization: Bearer ${token}" http://localhost:3000/api/v1/game/challenges`);
console.log('');

