require('dotenv').config({ path: '.env.production' });
const { execSync } = require('child_process');

console.log('DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
console.log('\nSeeding production database...\n');

try {
  execSync('npx ts-node seed-all.ts', {
    stdio: 'inherit',
    env: process.env
  });
  console.log('\n✅ Production database seeded successfully!');
} catch (error) {
  console.error('\n❌ Error seeding database');
  process.exit(1);
}
