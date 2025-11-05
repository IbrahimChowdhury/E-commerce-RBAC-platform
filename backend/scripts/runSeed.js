#!/usr/bin/env node

// Simple script to run seed data
const { spawn } = require('child_process');
const path = require('path');

console.log('🌱 Starting seed data process...\n');

const seedProcess = spawn('npm', ['run', 'seed'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  shell: true
});

seedProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Seed data completed successfully!');
    console.log('\n🚀 You can now start the server with: npm run dev');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@ecommerce.com / admin123');
    console.log('   Seller: techstore@example.com / seller123');
    console.log('   Buyer: ahmed@example.com / buyer123');
  } else {
    console.log(`\n❌ Seed process exited with code ${code}`);
  }
});

seedProcess.on('error', (error) => {
  console.error('❌ Error running seed script:', error);
});