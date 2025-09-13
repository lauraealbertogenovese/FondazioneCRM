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
  // Administrative Staff
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
  
  // Clinical Director
  {
    username: 'dr.direzione',
    email: 'direttore.clinico@fondazionecura.it',
    password: 'ClinicalDir456!',
    first_name: 'Giuseppe',
    last_name: 'Marchetti',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Senior Psychologists specializing in addiction
  {
    username: 'psy.addiction1',
    email: 'l.ferrari@fondazionecura.it',
    password: 'Psychology789!',
    first_name: 'Laura',
    last_name: 'Ferrari',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'psy.addiction2',
    email: 'a.conti@fondazionecura.it',
    password: 'Therapy321!',
    first_name: 'Alessandro',
    last_name: 'Conti',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'psy.groups',
    email: 'g.bianchi@fondazionecura.it',
    password: 'GroupTherapy654!',
    first_name: 'Giulia',
    last_name: 'Bianchi',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Medical Doctor for detox and medical management
  {
    username: 'md.detox',
    email: 'm.verdi@fondazionecura.it',
    password: 'Medical987!',
    first_name: 'Marco',
    last_name: 'Verdi',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Addiction Counselors
  {
    username: 'counselor.aa',
    email: 'r.galli@fondazionecura.it',
    password: 'Counseling579!',
    first_name: 'Roberto',
    last_name: 'Galli',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'counselor.na',
    email: 'f.costa@fondazionecura.it',
    password: 'Recovery468!',
    first_name: 'Francesca',
    last_name: 'Costa',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Healthcare Operators (now using 'Operatore' role)
  {
    username: 'op.accoglienza',
    email: 'c.ricci@fondazionecura.it',
    password: 'Operator357!',
    first_name: 'Chiara',
    last_name: 'Ricci',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'op.supporto',
    email: 'd.fontana@fondazionecura.it',
    password: 'Support802!',
    first_name: 'Davide',
    last_name: 'Fontana',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Peer Counselors (now using 'Operatore' role)
  {
    username: 'peer.recovery1',
    email: 'a.lombardi@fondazionecura.it',
    password: 'PeerHelp913!',
    first_name: 'Andrea',
    last_name: 'Lombardi',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'peer.recovery2',
    email: 'v.esposito@fondazionecura.it',
    password: 'SharedExperience624!',
    first_name: 'Valentina',
    last_name: 'Esposito',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Support Staff (now using 'Operatore' role)
  {
    username: 'vol.supporto1',
    email: 'l.moretti@fondazionecura.it',
    password: 'Volunteer147!',
    first_name: 'Luca',
    last_name: 'Moretti',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'vol.supporto2',
    email: 't.giuliani@fondazionecura.it',
    password: 'VolunteerHelp258!',
    first_name: 'Tommaso',
    last_name: 'Giuliani',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Trainee (now using 'Operatore' role with limited permissions)
  {
    username: 'trainee.psy',
    email: 'm.pellegrini@fondazionecura.it',
    password: 'Learning369!',
    first_name: 'Martina',
    last_name: 'Pellegrini',
    role: 'Operatore',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Temporarily inactive staff
  {
    username: 'ex.staff',
    email: 'ex.staff@fondazionecura.it',
    password: 'Inactive000!',
    first_name: 'Paolo',
    last_name: 'Inattivo',
    role: 'Operatore',
    is_active: false,
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
        patients: { access: true, create: true, edit: true, delete: true, view_sensitive: true },
        clinical: { access: true, create_records: true, edit_own_records: true, edit_all_records: true },
        groups: { access: true, create: true, edit: true, delete: true },
        billing: { access: true, create: true, edit: true, delete: true }
      },
      features: {
        documents: { access: true, upload: true, download: true, delete: true }
      },
      administration: {
        users: { access: true, create: true, edit: true, delete: true },
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
        patients: { access: true, create: true, edit: true, delete: false, view_sensitive: true },
        clinical: { access: true, create_records: true, edit_own_records: true, edit_all_records: false },
        groups: { access: true, create: true, edit: true, delete: false },
        billing: { access: false, create: false, edit: false, delete: false }
      },
      features: {
        documents: { access: true, upload: true, download: true, delete: false }
      },
      administration: {
        users: { access: false, create: false, edit: false, delete: false },
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
    
    console.log(`🎉 Successfully seeded ${createdUsers.length} staff members for addiction recovery foundation`);
    console.log('🔐 Admin login: admin.fondazione / SecurePass123!');
    console.log('📝 Note: All staff use "Operatore" role - customize permissions via admin panel');
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