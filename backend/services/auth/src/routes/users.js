const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const ValidationUtils = require('../utils/validation');
const AuthMiddleware = require('../middleware/auth');
const { query } = require('../database/connection');

const router = express.Router();

// GET /users/clinicians - Get available clinicians for patient assignment (all authenticated users)
router.get('/clinicians', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    // Get all users with basic info for clinician selection
    const clinicians = await User.findAll(50, 0); // Get up to 50 users
    
    // Return only necessary data for clinician selection
    const cliniciansData = clinicians.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role_name: user.role_name
    }));
    
    res.json({
      success: true,
      clinicians: cliniciansData
    });
  } catch (error) {
    console.error('Get clinicians error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /users - Get all users (admin only)
router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    
    const users = await User.findAll(parseInt(limit), parseInt(offset));
    
    res.json({
      users: users.map(user => user.getPublicData()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /users/:id - Get user by ID (admin only)
router.get('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: user.getPublicData()
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /users - Create new user (admin only)
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const userData = ValidationUtils.sanitizeInput(req.body);
    
    // Validate input
    const validation = ValidationUtils.validateUserRegistration(userData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(userData.email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findByUsername(userData.username);
    if (existingUsername) {
      return res.status(409).json({
        error: 'Username already exists'
      });
    }

    // Create user
    const user = await User.create({
      username: userData.username,
      email: userData.email.toLowerCase(),
      password: userData.password,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role_id: userData.role_id
    });

    res.status(201).json({
      message: 'User created successfully',
      user: user.getPublicData()
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /users/:id - Update user (admin only)
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = ValidationUtils.sanitizeInput(req.body);
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Validate input
    const validation = ValidationUtils.validateUserUpdate(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await User.findByEmail(updateData.email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already exists'
        });
      }
    }

    // Handle password update separately if provided
    if (updateData.password) {
      // Validate password
      const passwordValidation = ValidationUtils.validatePassword(updateData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: 'Password validation failed',
          details: passwordValidation.errors
        });
      }
      
      // Update password using the secure method
      await user.updatePassword(updateData.password);
      
      // Remove password from updateData so it's not processed again
      delete updateData.password;
    }
    
    // Update user (without password)
    if (Object.keys(updateData).some(key => ['first_name', 'last_name', 'email', 'role_id'].includes(key))) {
      await user.update(updateData);
    }

    res.json({
      message: 'User updated successfully',
      user: user.getPublicData()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /users/:id/transfer-ownership - Transfer ownership of user's records (admin only)
router.post('/:id/transfer-ownership', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }
    
    if (!Number.isInteger(Number(newOwnerId)) || Number(newOwnerId) < 1) {
      return res.status(400).json({
        error: 'Invalid new owner ID'
      });
    }
    
    if (Number(id) === Number(newOwnerId)) {
      return res.status(400).json({
        error: 'Cannot transfer ownership to the same user'
      });
    }

    // Check if both users exist
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User to transfer from not found'
      });
    }
    
    const newOwner = await User.findById(newOwnerId);
    if (!newOwner) {
      return res.status(404).json({
        error: 'New owner user not found'
      });
    }

    console.log(`Transferring ownership from user ${id} to user ${newOwnerId}`);
    
    // Start transaction
    await query('BEGIN');
    
    try {
      const transferredTables = [];
      
      // REAL transfer ownership - update actual database records
      console.log(`Starting REAL ownership transfer from user ${id} to user ${newOwnerId}`);
      
      // Transfer ownership in each table that references users
      const transferOperations = [
        { table: 'patient.patients', column: 'created_by', description: 'Pazienti creati' },
        { table: 'patient.patients', column: 'medico_curante', description: 'Pazienti come medico curante' },
        { table: 'clinical.clinical_records', column: 'created_by', description: 'Cartelle cliniche' }
      ];
      
      for (const operation of transferOperations) {
        try {
          const updateQuery = `
            UPDATE ${operation.table} 
            SET ${operation.column} = $1 
            WHERE ${operation.column} = $2
          `;
          
          const result = await query(updateQuery, [newOwnerId, id]);
          
          if (result.rowCount > 0) {
            transferredTables.push({
              table: operation.table,
              column: operation.column,
              description: operation.description,
              recordsTransferred: result.rowCount
            });
            console.log(`✅ Transferred ${result.rowCount} records in ${operation.table}.${operation.column}`);
          }
        } catch (transferError) {
          console.error(`❌ Error transferring ${operation.table}.${operation.column}:`, transferError.message);
          // Continue with other transfers even if one fails
        }
      }
      
      // Now delete the user - this should work since ownership has been transferred
      console.log(`Deleting user ${id} after REAL ownership transfer`);
      await user.delete();
      
      // Commit transaction
      await query('COMMIT');
      
      console.log('Ownership transfer and user deletion completed successfully');
      
      res.json({
        message: 'Ownership transferred and user deleted successfully',
        transferredTables,
        fromUser: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        toUser: {
          id: newOwner.id,
          username: newOwner.username,
          email: newOwner.email
        }
      });
      
    } catch (transferError) {
      // Rollback transaction
      await query('ROLLBACK');
      throw transferError;
    }
    
  } catch (error) {
    console.error('Transfer ownership error:', error);
    res.status(500).json({
      error: 'Internal server error during ownership transfer'
    });
  }
});

// GET /users/:id/ownership-summary - Get summary of user's data for ownership transfer
router.get('/:id/ownership-summary', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Query real data from database
    const ownershipQueries = [
      // Pazienti creati dall'utente
      `SELECT id, nome, cognome, created_at 
       FROM patient.patients 
       WHERE created_by = $1`,
      
      // Pazienti di cui è medico curante
      `SELECT id, nome, cognome, created_at 
       FROM patient.patients 
       WHERE medico_curante = $1`,
       
      // Cartelle cliniche create
      `SELECT cr.id, p.nome as patient_nome, p.cognome as patient_cognome, cr.created_at
       FROM clinical.clinical_records cr
       JOIN patient.patients p ON cr.patient_id = p.id
       WHERE cr.created_by = $1`
    ];

    const [patientsCreated, patientsAsDoctor, clinicalRecords] = await Promise.all(
      ownershipQueries.map(queryText => query(queryText, [id]))
    );

    const ownershipSummary = {
      user: {
        id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name
      },
      summary: {
        patients_created: patientsCreated.rowCount,
        patients_as_doctor: patientsAsDoctor.rowCount,
        clinical_records: clinicalRecords.rowCount,
        total_records: patientsCreated.rowCount + patientsAsDoctor.rowCount + clinicalRecords.rowCount
      },
      details: {
        patients: patientsCreated.rows.map(p => ({
          id: p.id,
          name: `${p.nome} ${p.cognome}`,
          created_at: p.created_at
        })),
        patients_as_doctor: patientsAsDoctor.rows.map(p => ({
          id: p.id,
          name: `${p.nome} ${p.cognome}`,
          assigned_at: p.created_at
        })),
        clinical_records: clinicalRecords.rows.map(cr => ({
          id: cr.id,
          patient: `${cr.patient_nome} ${cr.patient_cognome}`,
          created_at: cr.created_at
        }))
      }
    };

    res.json(ownershipSummary);
  } catch (error) {
    console.error('Get ownership summary error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    console.log('Deleting user:', { id: user.id, username: user.username, role: user.role });

    // Prevent admin from deleting themselves
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    // Prevent deletion of the last admin user
    if (user.role && user.role.name === 'admin') {
      const adminCount = await User.countByRole(1); // ID 1 = admin role
      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last admin user. At least one admin must remain.'
        });
      }
    }

    // Hard delete user
    console.log('About to delete user from database...');
    await user.delete();
    console.log('User deleted from database successfully');

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    
    // Handle foreign key constraint violations
    if (error.code === '23503') {
      return res.status(400).json({
        error: 'Cannot delete user because they have associated records',
        details: 'This user has created clinical records, patients, or other data. Use POST /users/:id/transfer-ownership to transfer their data to another user before deletion.',
        action: 'transfer_ownership_required',
        endpoint: `/users/${id}/transfer-ownership`
      });
    }
    
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /users/:id/password - Reset user password (admin only)
router.put('/:id/password', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid user ID'
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        error: 'New password is required'
      });
    }

    // Validate password
    const passwordValidation = ValidationUtils.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: passwordValidation.errors
      });
    }

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update password
    await user.updatePassword(newPassword);

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /roles - Get all roles
router.get('/roles', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    res.json({
      success: true,
      data: roles.map(role => role.toJSON())
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /roles/:id - Get role by ID
router.get('/roles/:id', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid role ID'
      });
    }

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role.toJSON()
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /roles - Create new role (admin only)
router.post('/roles', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        error: 'Name and description are required'
      });
    }

    // Check if role already exists
    const existingRole = await Role.findByName(name);
    if (existingRole) {
      return res.status(409).json({
        error: 'Role already exists'
      });
    }

    // Create role
    const role = await Role.create({
      name,
      description,
      permissions: permissions || {}
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role.toJSON()
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /roles/:id - Update role (admin only)
router.put('/roles/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        error: 'Invalid role ID'
      });
    }

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        error: 'Role not found'
      });
    }

    // Check if name is being changed and already exists
    if (updateData.name && updateData.name !== role.name) {
      const existingRole = await Role.findByName(updateData.name);
      if (existingRole) {
        return res.status(409).json({
          error: 'Role name already exists'
        });
      }
    }

    // Update role
    await role.update(updateData);

    res.json({
      message: 'Role updated successfully',
      role: role.toJSON()
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// DELETE /roles/:id - Delete role (admin only)
router.delete('/roles/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role ID'
      });
    }

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Prevent deleting admin role only
    if (role.name === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete admin role'
      });
    }

    // Check if role has users assigned
    const users = await role.getUsers();
    if (users && users.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete role with assigned users'
      });
    }

    // Delete role
    await role.delete();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });

  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /roles/:id/users - Get users with specific role (admin only)
router.get('/roles/:id/users', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role ID'
      });
    }

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Get users with this role
    const users = await role.getUsers();

    res.json({
      success: true,
      data: users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        last_login: user.last_login,
        created_at: user.created_at
      }))
    });
  } catch (error) {
    console.error('Get role users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /roles/:id - Delete role (admin only)
router.delete('/roles/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!Number.isInteger(Number(id)) || Number(id) < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role ID'
      });
    }

    // Check if role exists
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        error: 'Role not found'
      });
    }

    // Check if role is being used by any users
    const userCount = await role.getUserCount();
    if (userCount > 0) {
      return res.status(409).json({
        success: false,
        error: 'Cannot delete role - it is currently assigned to active users',
        details: { activeUsers: userCount }
      });
    }

    // Delete role
    await role.delete();

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user permissions
router.put('/users/:id/permissions', AuthMiddleware.verifyToken, AuthMiddleware.requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { permissions } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Permissions must be a valid object'
      });
    }

    // Check if user exists
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Prevent modifying admin user permissions
    if (existingUser.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify permissions for admin users'
      });
    }

    // Update user permissions
    const queryText = `
      UPDATE auth.users 
      SET permissions = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, first_name, last_name, permissions
    `;

    const result = await query(queryText, [JSON.stringify(permissions), userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        permissions: updatedUser.permissions
      }
    });

  } catch (error) {
    console.error('Update user permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
