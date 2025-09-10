const express = require('express');
const Role = require('../models/Role');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /roles - Get all roles
router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const roles = await Role.findAll();
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /roles/:id - Get role by ID
router.get('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
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
        error: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /roles - Create new role
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const roleData = req.body;
    
    // Validate required fields
    if (!roleData.name || !roleData.description) {
      return res.status(400).json({
        error: 'Name and description are required'
      });
    }

    // Check if role with same name already exists
    const existingRole = await Role.findByName(roleData.name);
    if (existingRole) {
      return res.status(409).json({
        error: 'Role with this name already exists'
      });
    }

    // Create role
    const role = await Role.create(roleData);

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role
    });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /roles/:id - Update role
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
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
          error: 'Role with this name already exists'
        });
      }
    }

    // Update role
    await role.update(updateData);

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// DELETE /roles/:id - Delete role
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
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

    // Prevent deletion of admin role
    if (role.name === 'admin') {
      return res.status(403).json({
        error: 'Cannot delete admin role'
      });
    }

    // Check if role is assigned to any users
    const userCount = await role.getUserCount();
    if (userCount > 0) {
      return res.status(409).json({
        error: `Cannot delete role. It is assigned to ${userCount} user(s)`
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
      error: 'Internal server error'
    });
  }
});

// GET /roles/:id/users - Get users with this role
router.get('/:id/users', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, async (req, res) => {
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
        error: 'Role not found'
      });
    }

    const users = await role.getUsers();

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get role users error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;