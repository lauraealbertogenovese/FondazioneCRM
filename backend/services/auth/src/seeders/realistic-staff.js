/**
 * Realistic Staff Data Seeder for Addiction Recovery Foundation - UPDATED
 * 
 * This file contains realistic staff data aligned with the current system:
 * - Only 2 base roles: admin, Operatore
 * - All staff members use 'Operatore' role (customizable by admin)
 * - Granular permissions format
 * - Compatible with current database schema
 */

const bcrypt = require('bcrypt');
const { User, Role } = require('../models');

const realisticStaff = [
  // Only Admin and basic Operator
  {
    username: 'SuperAdmin',
    email: 'superadmin@fondazionecura.it',
    password: 'SecurePass123!', // Will be hashed
    first_name: 'Super',
    last_name: 'Admin',
    role: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'admin.fondazione',
    email: 'admin@fondazionecura.it',
    password: 'SecurePass123!', // Will be hashed
    first_name: 'Maria',
    last_name: 'Rossi',
    role: 'admin',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  
  {
    username: 'operatore1',
    email: 'operatore1@fondazionecura.it',
    password: 'Operator123!',
    first_name: 'Mario',
    last_name: 'Bianchi',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Updated role mapping - ONLY 2 BASE ROLES (aligned with current system)
const foundationRoles = [
  {
    name: 'admin',
    display_name: 'Amministratore',
    description: 'Accesso completo al sistema, gestione utenti e configurazioni',
    permissions: {
      pages: {
        patients: { access: true, create: true, edit_own: true, edit_all: true, delete: true, view_sensitive: true },
        clinical: { access: true, create_records: true, edit_own_records: true, edit_all_records: true, create_notes: true, edit_own_notes: true, edit_all_notes: true, delete_notes: true, view_all_records: true },
        groups: { access: true, create: true, edit_own: true, edit_all: true, manage_members: true, delete: true },
        billing: { access: true, create_invoices: true, edit_invoices: true, view_financial_data: true, export_data: true }
      },
      features: {
        documents: { upload: true, download: true, delete: true, upload_sensitive: true, manage_versions: true }
      },
      administration: {
        users: { access: true, create: true, edit: true, delete: true, view_permissions: true, edit_permissions: true },
        roles: { access: true, create: true, edit: true, delete: true },
        system: { access: true, email_config: true, audit_logs: true }
      }
    }
  },
  {
    name: 'Operatore',
    display_name: 'Operatore',
    description: 'Operatore sanitario di supporto - ruolo base personalizzabile',
    permissions: {
      pages: {
        patients: { access: true, create: true, edit_own: true, edit_all: false, delete: false, view_sensitive: true },
        clinical: { access: true, create_records: true, edit_own_records: true, edit_all_records: false, create_notes: true, edit_own_notes: true, edit_all_notes: false, delete_notes: false, view_all_records: false },
        groups: { access: true, create: true, edit_own: true, edit_all: false, manage_members: false, delete: false },
        billing: { access: false, create_invoices: false, edit_invoices: false, view_financial_data: false, export_data: false }
      },
      features: {
        documents: { upload: true, download: true, delete: false, upload_sensitive: false, manage_versions: false }
      },
      administration: {
        users: { access: false, create: false, edit: false, delete: false, view_permissions: false, edit_permissions: false },
        roles: { access: false, create: false, edit: false, delete: false },
        system: { access: false, email_config: false, audit_logs: false }
      }
    }
  }
];

/**
 * Seeds the database with realistic staff data for addiction recovery foundation
 * Updated to work with current system (only 2 base roles: admin + Operatore)
 */
const seedRealisticStaff = async () => {
  try {
    console.log('🌱 Starting realistic staff data seeding (UPDATED)...');
    
    // First, ensure roles exist
    console.log('📋 Creating/updating foundation roles...');
    for (const roleData of foundationRoles) {
      try {
        // Check if role exists
        const existingRole = await Role.findByName(roleData.name);
        
        if (existingRole) {
          // Update existing role with new permissions
          await existingRole.update({
            description: roleData.description,
            permissions: roleData.permissions
          });
          console.log(`🔄 Updated role: ${roleData.display_name}`);
        } else {
          // Create new role
          await Role.create({
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions
          });
          console.log(`✅ Created role: ${roleData.display_name}`);
        }
      } catch (error) {
        console.error(`❌ Error with role ${roleData.name}:`, error.message);
      }
    }
    
    // Then create staff users
    console.log('👥 Creating staff users...');
    const createdUsers = [];
    
    for (const userData of realisticStaff) {
      try {
        // Check if user already exists
        const existingUser = await User.findByUsername(userData.username);
        
        if (!existingUser) {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          // Find role
          const role = await Role.findByName(userData.role);
          if (!role) {
            console.error(`❌ Role not found: ${userData.role}`);
            continue;
          }
          
          const user = await User.create({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            first_name: userData.first_name,
            last_name: userData.last_name,
            role_id: role.id,
            is_active: userData.is_active
          });
          
          createdUsers.push(user);
          console.log(`✅ Created staff member: ${user.first_name} ${user.last_name} (${role.name})`);
        } else {
          console.log(`⚠️  Staff member already exists: ${userData.first_name} ${userData.last_name}`);
        }
      } catch (error) {
        console.error(`❌ Error creating user ${userData.username}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully seeded ${createdUsers.length} staff members`);
    console.log('🔐 Super Admin login: SuperAdmin / SecurePass123!');
    console.log('🔐 Admin login: admin.fondazione / SecurePass123!');
    console.log('🔐 Operator login: operatore1 / Operator123!');
    console.log('📝 Note: Only Admin and Operatore roles - customize permissions via admin panel');
    return createdUsers;
    
  } catch (error) {
    console.error('❌ Error seeding realistic staff data:', error);
    throw error;
  }
};

module.exports = {
  realisticStaff,
  foundationRoles,
  seedRealisticStaff
};