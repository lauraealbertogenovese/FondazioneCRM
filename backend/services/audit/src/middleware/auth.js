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
      'SELECT id, username, email, role FROM auth.users WHERE id = $1 AND is_active = true',
      [decoded.userId]
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

// Check if user has admin/audit access
const requireAuditAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check if user has audit permissions or is admin
    const hasAccess = await query(`
      SELECT 1 FROM auth.user_permissions up
      JOIN auth.permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1 
      AND (p.name LIKE 'audit.%' OR p.name = '*' OR p.name = 'admin')
    `, [req.user.id]);
    
    if (hasAccess.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Audit access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Audit access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Access check failed'
    });
  }
};

// Check if user has GDPR access
const requireGDPRAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    // Check if user has GDPR permissions or is admin
    const hasAccess = await query(`
      SELECT 1 FROM auth.user_permissions up
      JOIN auth.permissions p ON up.permission_id = p.id
      WHERE up.user_id = $1 
      AND (p.name LIKE 'gdpr.%' OR p.name = '*' OR p.name = 'admin')
    `, [req.user.id]);
    
    if (hasAccess.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. GDPR access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('GDPR access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Access check failed'
    });
  }
};

module.exports = {
  verifyToken,
  requireAuditAccess,
  requireGDPRAccess
};