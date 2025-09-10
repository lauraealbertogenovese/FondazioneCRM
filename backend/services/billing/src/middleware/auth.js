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
      'SELECT id, username, email, role_id FROM auth.users WHERE id = $1 AND is_active = true',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token - user not found'
      });
    }
    
    req.user = userResult.rows[0];
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
      
      // Check user permissions
      const permissionResult = await query(`
        SELECT p.name 
        FROM auth.user_permissions up
        JOIN auth.permissions p ON up.permission_id = p.id
        WHERE up.user_id = $1 AND (p.name = $2 OR p.name = '*')
      `, [req.user.id, permission]);
      
      if (permissionResult.rows.length === 0) {
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
    
    // Check if user has billing permissions or is root
    const hasAccess = await query(`
      SELECT 1 FROM auth.user_permissions up
      JOIN auth.permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1 
      AND (p.name LIKE 'billing.%' OR p.name = '*' OR p.name = 'admin')
    `, [req.user.id]);
    
    if (hasAccess.rows.length === 0) {
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