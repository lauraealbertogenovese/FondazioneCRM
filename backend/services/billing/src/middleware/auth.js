const jwt = require('jsonwebtoken');
const { query } = require('../utils/database');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
    
    // Get user info from database
    const userResult = await query(
      'SELECT u.id, u.username, u.email, u.role_id, r.name as role_name, r.permissions as role_permissions FROM auth.users u LEFT JOIN auth.roles r ON u.role_id = r.id WHERE u.id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }
    
    const userData = userResult.rows[0];
    req.user = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role_id: userData.role_id,
      role_name: userData.role_name,
      role: userData.role_name ? {
        name: userData.role_name,
        permissions: userData.role_permissions
      } : null
    };
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Check if user has specific permission
const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      // Check user permissions using role-based system
      if (!req.user.role || !req.user.role.permissions) {
        return res.status(403).json({
          success: false,
          error: 'No role permissions found'
        });
      }
      
      // Check for admin role (has all permissions)
      if (Array.isArray(req.user.role.permissions) && req.user.role.permissions.includes('*')) {
        return next(); // Admin has all permissions
      }
      
      // Check for specific permission in role
      if (Array.isArray(req.user.role.permissions) && !req.user.role.permissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

// Check if user has billing access (Administrative role)
const requireBillingAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check if user has billing access using role-based system
    if (!req.user.role || !req.user.role.permissions) {
      return res.status(403).json({
        success: false,
        error: 'No role permissions found'
      });
    }
    
    // Admin role has access to everything
    if (req.user.role_name === 'admin' || 
        (Array.isArray(req.user.role.permissions) && req.user.role.permissions.includes('*'))) {
      return next(); // Admin has billing access
    }
    
    // Check for specific billing permissions
    const hasBillingAccess = Array.isArray(req.user.role.permissions) && 
                            req.user.role.permissions.some(perm => 
                              perm.includes('billing.') || perm === 'billing' || perm === '*'
                            );
    
    if (!hasBillingAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Billing access required (Administrative role)'
      });
    }
    
    next();
  } catch (error) {
    console.error('Billing access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Access check failed'
    });
  }
};

module.exports = {
  verifyToken,
  requirePermission,
  requireBillingAccess
};