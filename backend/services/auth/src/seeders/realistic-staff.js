/**
 * Realistic Staff Data Seeder for Addiction Recovery Foundation
 * 
 * This file contains realistic staff data for a psychological assistance
 * foundation dealing with addiction recovery.
 * 
 * Includes various professional roles: psychologists, doctors, social workers,
 * counselors, administrators, and volunteers.
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
    role: 'doctor',
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
    role: 'psychologist',
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
    role: 'psychologist',
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
    role: 'psychologist',
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
    role: 'doctor',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Social Workers
  {
    username: 'sw.reinserimento',
    email: 'e.romano@fondazionecura.it',
    password: 'SocialWork246!',
    first_name: 'Elena',
    last_name: 'Romano',
    role: 'social_worker',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    username: 'sw.famiglia',
    email: 's.marino@fondazionecura.it',
    password: 'FamilySupport135!',
    first_name: 'Silvia',
    last_name: 'Marino',
    role: 'social_worker',
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
    role: 'counselor',
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
    role: 'counselor',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Healthcare Operators
  {
    username: 'op.accoglienza',
    email: 'c.ricci@fondazionecura.it',
    password: 'Operator357!',
    first_name: 'Chiara',
    last_name: 'Ricci',
    role: 'operator',
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
    role: 'operator',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Peer Counselors (Ex-patients now helping others)
  {
    username: 'peer.recovery1',
    email: 'a.lombardi@fondazionecura.it',
    password: 'PeerHelp913!',
    first_name: 'Andrea',
    last_name: 'Lombardi',
    role: 'counselor',
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
    role: 'counselor',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Volunteers
  {
    username: 'vol.supporto1',
    email: 'l.moretti@fondazionecura.it',
    password: 'Volunteer147!',
    first_name: 'Luca',
    last_name: 'Moretti',
    role: 'volunteer',
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
    role: 'volunteer',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },

  // Observer/Trainee
  {
    username: 'trainee.psy',
    email: 'm.pellegrini@fondazionecura.it',
    password: 'Learning369!',
    first_name: 'Martina',
    last_name: 'Pellegrini',
    role: 'viewer',
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
    role: 'operator',
    is_active: false,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Role mapping for the foundation context
const foundationRoles = [
  {
    name: 'admin',
    display_name: 'Amministratore',
    description: 'Accesso completo al sistema, gestione utenti e configurazioni',
    permissions: ['*'] // All permissions
  },
  {
    name: 'doctor',
    display_name: 'Medico',
    description: 'Medico specialista per detox e gestione farmacologica',
    permissions: [
      'patients.read', 'patients.write', 'patients.update',
      'clinical.read', 'clinical.write', 'clinical.update',
      'visits.read', 'visits.write', 'visits.update',
      'groups.read'
    ]
  },
  {
    name: 'psychologist',
    display_name: 'Psicologo',
    description: 'Psicologo specializzato in dipendenze',
    permissions: [
      'patients.read', 'patients.write', 'patients.update',
      'clinical.read', 'clinical.write', 'clinical.update',
      'visits.read', 'visits.write', 'visits.update',
      'groups.read', 'groups.write', 'groups.update'
    ]
  },
  {
    name: 'social_worker',
    display_name: 'Assistente Sociale',
    description: 'Assistente sociale per reinserimento e supporto familiare',
    permissions: [
      'patients.read', 'patients.update',
      'clinical.read', 'clinical.update',
      'visits.read', 'visits.write',
      'groups.read', 'groups.write'
    ]
  },
  {
    name: 'counselor',
    display_name: 'Counselor',
    description: 'Counselor per dipendenze e peer counselor',
    permissions: [
      'patients.read',
      'clinical.read',
      'visits.read', 'visits.write',
      'groups.read', 'groups.write', 'groups.update'
    ]
  },
  {
    name: 'operator',
    display_name: 'Operatore',
    description: 'Operatore sanitario di supporto',
    permissions: [
      'patients.read',
      'clinical.read',
      'visits.read',
      'groups.read'
    ]
  },
  {
    name: 'volunteer',
    display_name: 'Volontario',
    description: 'Volontario per attività di supporto',
    permissions: [
      'patients.read',
      'visits.read',
      'groups.read'
    ]
  },
  {
    name: 'viewer',
    display_name: 'Osservatore',
    description: 'Accesso in sola lettura per tirocinanti',
    permissions: [
      'patients.read',
      'clinical.read',
      'visits.read',
      'groups.read'
    ]
  }
];

/**
 * Seeds the database with realistic staff data for addiction recovery foundation
 */
const seedRealisticStaff = async () => {
  try {
    console.log('🌱 Starting realistic staff data seeding...');
    
    // First, ensure roles exist
    console.log('📋 Creating/updating foundation roles...');
    for (const roleData of foundationRoles) {
      try {
        // Check if role exists
        const existingRole = await Role.findByName(roleData.name);
        
        if (existingRole) {
          // Update existing role
          await existingRole.update(roleData);
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