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

// Middleware per verificare i permessi
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Verifica se l'utente ha il permesso richiesto
    if (req.user.permissions && (
      req.user.permissions.includes(permission) || 
      req.user.permissions.includes('*')  // Wildcard permission
    )) {
      next();
    } else {
      console.log(`Permission denied: user permissions ${JSON.stringify(req.user.permissions)}, required: ${permission}`);
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
