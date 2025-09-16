/**
 * Master Seeder for Realistic Addiction Recovery Foundation Data
 * 
 * This script seeds all services with realistic data appropriate for 
 * a psychological assistance foundation dealing with addiction recovery.
 * 
 * Run this script from the backend root directory:
 * node seed-all-realistic-data.js
 */

const path = require('path');

// Utility to run seeder in specific service directory
async function runSeederInService(servicePath, seederFunction) {
  const originalCwd = process.cwd();
  
  try {
    // Change to service directory
    process.chdir(servicePath);
    
    // Run the seeder
    await seederFunction();
    
  } finally {
    // Always restore original directory
    process.chdir(originalCwd);
  }
}

async function seedAllRealisticData() {
  console.log('🚀 Starting comprehensive realistic data seeding for Addiction Recovery Foundation');
  console.log('==============================================================================');
  
  try {
    // Seed Auth Service (Staff/Users and Roles)
    console.log('\n📁 Seeding Auth Service (Staff and Roles)...');
    const authServicePath = path.join(__dirname, 'services', 'auth');
    const authSeederPath = path.join(authServicePath, 'src', 'seeders', 'realistic-staff');
    await runSeederInService(authServicePath, async () => {
      const { seedRealisticStaff } = require(authSeederPath);
      await seedRealisticStaff();
    });
    
    // Seed Patient Service
    console.log('\n📁 Seeding Patient Service...');
    const patientServicePath = path.join(__dirname, 'services', 'patient');
    const patientSeederPath = path.join(patientServicePath, 'src', 'seeders', 'realistic-patients');
    await runSeederInService(patientServicePath, async () => {
      const { seedRealisticPatients } = require(patientSeederPath);
      await seedRealisticPatients();
    });
    
    // Seed Group Service
    console.log('\n📁 Seeding Group Service (Support Groups)...');
    const groupServicePath = path.join(__dirname, 'services', 'group');
    const groupSeederPath = path.join(groupServicePath, 'src', 'seeders', 'realistic-support-groups');
    await runSeederInService(groupServicePath, async () => {
      const { seedRealisticSupportGroups } = require(groupSeederPath);
      await seedRealisticSupportGroups();
    });
    
    console.log('\n✅ All realistic data seeding completed successfully!');
    console.log('==============================================================================');
    console.log('🏥 Your Foundation CRM now has:');
    console.log('   • 10 Patients (alcohol and drug addictions only)');
    console.log('   • 2 Staff members (Admin + Operatore)');
    console.log('   • 15 Support groups (AA, NA, therapy groups, family support)');
    console.log('   • Simplified role system: admin + Operatore (others created dynamically)');
    console.log('');
    console.log('🔐 Default login credentials:');
    console.log('   • Admin: admin.fondazione / SecurePass123!');
    console.log('   • Operator: operatore1 / Operator123!');
    console.log('');
    console.log('🎯 Ready for production use!');
    
  } catch (error) {
    console.error('❌ Error during seeding process:', error);
    process.exit(1);
  }
}

// Self-executing seeding script
if (require.main === module) {
  seedAllRealisticData()
    .then(() => {
      console.log('🎉 Seeding process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  seedAllRealisticData
};