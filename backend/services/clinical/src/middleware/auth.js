const axios = require('axios');

// Middleware per verificare l'autenticazione
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verifica il token con l'Auth Service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';
    const response = await axios.get(`${authServiceUrl}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200) {
      req.user = response.data.user;
      next();
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth verification error:', error.message);
    return res.status(401).json({ error: 'Token verification failed' });
  }
};

// Helper function to check if user has a specific permission
const hasPermission = (userPermissions, permission) => {
  // List of possible roots
  const roots = ["pages", "features", "administration"];

  // If permissions is an array (legacy format)
  if (Array.isArray(userPermissions)) {
    return userPermissions.includes(permission) || userPermissions.includes('*');
  }

  // If permissions is an object (granular format)
  if (typeof userPermissions === 'object' && userPermissions !== null) {
    // Check for wildcard
    if (
      userPermissions['*'] ||
      userPermissions['all'] === true ||
      Object.values(userPermissions).includes('*')
    ) {
      return true;
    }

    // Try each root (pages, features, administration)
    for (const root of roots) {
      if (userPermissions[root]) {
        const parts = permission.split('.');
        let current = userPermissions[root];
        for (const part of parts) {
          if (current && typeof current === 'object' && part in current) {
            current = current[part];
          } else {
            current = null;
            break;
          }
        }
        if (current === true) {
          return true;
        }
      }
    }

    // Also check direct permission at root (for backwards compatibility)
    if (userPermissions[permission]) return true;
  }

  return false;
};

// Middleware per verificare i permessi
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verifica se l'utente ha il permesso richiesto
    if (req.user.permissions && hasPermission(req.user.permissions, permission)) {
      next();
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
  };
};

// Middleware per verificare se l'utente è admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role_name === 'admin') {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireAdmin
};
