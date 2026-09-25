const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  'init.js',
  'init_phase3.js',
  'init_phase4.js',
  'init_phase5.js',
  'init_phase7.js',
  'init_phaseA.js',
  'init_resource_upload.js'
];

console.log('Starting Database Migrations...');
console.log('Using DATABASE_URL:', process.env.DATABASE_URL ? 'Provided' : 'Not Provided (Using local config)');

try {
  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    console.log(`\n▶ Running ${script}...`);
    execSync(`node ${scriptPath}`, { stdio: 'inherit', env: process.env });
  }
  console.log('\n✅ All migrations completed successfully!');
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}
