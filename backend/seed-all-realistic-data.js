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
    
    // Seed Clinical Service
    console.log('\n📁 Seeding Clinical Service (Clinical Records)...');
    const clinicalServicePath = path.join(__dirname, 'services', 'clinical');
    const clinicalSeederPath = path.join(clinicalServicePath, 'src', 'seeders', 'realistic-clinical-records');
    await runSeederInService(clinicalServicePath, async () => {
      const { seedRealisticClinicalRecords } = require(clinicalSeederPath);
      await seedRealisticClinicalRecords();
    });
    
    // Seed Group Service
    console.log('\n📁 Seeding Group Service (Support Groups)...');
    const groupServicePath = path.join(__dirname, 'services', 'group');
    const groupSeederPath = path.join(groupServicePath, 'src', 'seeders', 'realistic-support-groups');
    await runSeederInService(groupServicePath, async () => {
      const { seedRealisticSupportGroups } = require(groupSeederPath);
      await seedRealisticSupportGroups();
    });
    
    // Seed Clinical Service - Therapeutic Visits
    console.log('\n📁 Seeding Clinical Service (Therapeutic Visits)...');
    const visitsSeederPath = path.join(clinicalServicePath, 'src', 'seeders', 'realistic-visits');
    await runSeederInService(clinicalServicePath, async () => {
      const { seedRealisticTherapeuticVisits } = require(visitsSeederPath);
      await seedRealisticTherapeuticVisits();
    });
    
    console.log('\n✅ All realistic data seeding completed successfully!');
    console.log('==============================================================================');
    console.log('🏥 Your Addiction Recovery Foundation CRM now has:');
    console.log('   • 16 Realistic patients (alcohol, drugs, gambling addictions)');
    console.log('   • 17 Professional staff members (doctors, psychologists, counselors, social workers)');
    console.log('   • 16 Clinical records with appropriate diagnoses and treatment plans');
    console.log('   • 15 Support groups (AA, NA, therapy groups, family support)');
    console.log('   • 20+ Therapeutic sessions (individual, group, family, medical)');
    console.log('   • Foundation-specific roles and permissions');
    console.log('');
    console.log('🔐 Default login credentials:');
    console.log('   • Admin: admin.fondazione / SecurePass123!');
    console.log('   • Clinical Director: dr.direzione / ClinicalDir456!');
    console.log('   • Senior Psychologist: psy.addiction1 / Psychology789!');
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