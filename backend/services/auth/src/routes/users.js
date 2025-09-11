const express = require('express');
const User = require('../models/User');
const Role = require('../models/Role');
const ValidationUtils = require('../utils/validation');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /users - Get all users (admin only)
router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
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

    // Update user
    await user.update(updateData);

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

// DELETE /users/:id - Delete user (admin only)
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
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

    // Prevent admin from deleting themselves
    if (Number(id) === req.user.id) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      });
    }

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        error: 'Cannot delete admin users'
      });
    }

    // Soft delete user
    await user.delete();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
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

    // Check if role is not a system role (admin, doctor, etc.)
    const systemRoles = ['admin', 'doctor', 'psychologist', 'operator'];
    if (systemRoles.includes(role.name)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete system roles'
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
        is_active: user.is_active,
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
