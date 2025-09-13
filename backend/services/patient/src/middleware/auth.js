const axios = require('axios');

class AuthMiddleware {
  // Middleware to verify JWT token via Auth Service
  static async verifyToken(req, res, next) {
    try {
      console.log(`[Patient Auth] Verifying token for ${req.method} ${req.url}`);
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        console.log(`[Patient Auth] No authorization header found`);
        return res.status(401).json({
          error: 'Authorization header is required'
        });
      }
      
      console.log(`[Patient Auth] Authorization header present: ${authHeader.substring(0, 20)}...`);

      // Call Auth Service to verify token
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';
      
      try {
        console.log(`[Patient Auth] Calling Auth Service at ${authServiceUrl}/auth/verify`);
        const response = await axios.get(`${authServiceUrl}/auth/verify`, {
          headers: {
            'Authorization': authHeader
          },
          timeout: 5000
        });

        console.log(`[Patient Auth] Auth Service response: ${response.status}`);
        // Add user info to request
        req.user = response.data.user;
        console.log(`[Patient Auth] Token verified successfully for user: ${req.user.username}`);
        next();
      } catch (error) {
        console.log(`[Patient Auth] Auth verification failed:`, error.message);
        if (error.response) {
          return res.status(error.response.status).json({
            error: error.response.data.error || 'Authentication failed'
          });
        } else {
          return res.status(503).json({
            error: 'Auth service unavailable'
          });
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  // Middleware to check user permissions
  static requirePermission(permission) {
    return async (req, res, next) => {
      try {
        console.log(`[Patient Permission] Checking permission '${permission}' for ${req.method} ${req.url}`);
        if (!req.user) {
          console.log(`[Patient Permission] No user found in request`);
          return res.status(401).json({
            error: 'Authentication required'
          });
        }
        
        console.log(`[Patient Permission] User found: ${req.user.username}`);

        // Call Auth Service to check permissions
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3002';
        
        try {
          const response = await axios.get(`${authServiceUrl}/auth/profile`, {
            headers: {
              'Authorization': req.headers.authorization
            },
            timeout: 5000
          });

          const user = response.data.user;
          console.log(`[Patient Permission] Auth Service profile response:`, {
            role_name: user.role_name, 
            permissions: user.permissions,
            role: user.role
          });
          
          // Check if user has required permission using granular permissions
          if (!this.hasGranularPermission(user, permission)) {
            console.log(`[Patient Permission] Permission denied for '${permission}' - role: '${user.role_name}'`);
            return res.status(403).json({
              error: 'Insufficient permissions'
            });
          }

          console.log(`[Patient Permission] Permission '${permission}' granted for role '${user.role_name}'`);
          next();
        } catch (error) {
          if (error.response) {
            return res.status(error.response.status).json({
              error: error.response.data.error || 'Permission check failed'
            });
          } else {
            return res.status(503).json({
              error: 'Auth service unavailable'
            });
          }
        }
      } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({
          error: 'Permission check failed'
        });
      }
    };
  }

  // Check if user has granular permission
  static hasGranularPermission(user, permission) {
    try {
      // Mappa permessi legacy a permessi granulari
      const permissionMap = {
        'patients.read': 'pages.patients.access',
        'patients.write': 'pages.patients.create',
        'patients.update': 'pages.patients.edit',
        'patients.delete': 'pages.patients.delete',
        'clinical.read': 'pages.clinical.access',
        'clinical.write': 'pages.clinical.create_records',
        'clinical.update': 'pages.clinical.edit_own_records',
        'groups.read': 'pages.groups.access',
        'groups.write': 'pages.groups.create',
        'groups.update': 'pages.groups.edit',
        'groups.delete': 'pages.groups.delete',
        'billing.read': 'pages.billing.access',
        'billing.write': 'pages.billing.create',
        'billing.update': 'pages.billing.edit',
        'billing.delete': 'pages.billing.delete',
        'users.read': 'administration.users.access',
        'users.write': 'administration.users.create',
        'users.update': 'administration.users.edit',
        'users.delete': 'administration.users.delete',
        'roles.read': 'administration.roles.access',
        'roles.write': 'administration.roles.create',
        'roles.update': 'administration.roles.edit',
        'roles.delete': 'administration.roles.delete'
      };
      
      // Converti permesso legacy a granulare
      const granularPermission = permissionMap[permission] || permission;
      
      // Usa i permessi del ruolo (non user.permissions)
      const permissions = user.role?.permissions;
      
      if (!permissions) {
        console.log(`[Patient Permission] No role permissions found for user ${user.username}`);
        return false;
      }
      
      // Controlla se admin ha tutti i permessi
      if (typeof permissions === 'object' && permissions.all === true) {
        return true;
      }
      
      // Controlla permesso wildcard
      if (Array.isArray(permissions) && permissions.includes('*')) {
        return true;
      }
      
      // Controlla permesso specifico (formato: "area.action")
      if (Array.isArray(permissions) && permissions.includes(permission)) {
        return true;
      }
      
      // Controlla permesso nell'oggetto permissions (formato granulare)
      if (typeof permissions === 'object' && !Array.isArray(permissions)) {
        const [section, area, action] = granularPermission.split('.');
        if (!section || !area || !action) {
          return false;
        }
        
        // Controlla permesso granulare: permissions[section][area][action]
        return permissions[section] && 
               permissions[section][area] && 
               permissions[section][area][action] === true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in hasGranularPermission:', error);
      return false;
    }
  }

  // Check if role has permission (legacy version - kept for compatibility)
  static hasPermission(roleName, permission) {
    const rolePermissions = {
      'admin': ['*'], // Admin has all permissions
      'doctor': ['patients.read', 'patients.write', 'patients.delete'],
      'psychologist': ['patients.read', 'patients.write'],
      'operator': ['patients.read', 'patients.write'],
      'viewer': ['patients.read']
    };

    const permissions = rolePermissions[roleName] || [];
    
    // Check for wildcard permission
    if (permissions.includes('*')) {
      return true;
    }
    
    // Check specific permission
    return permissions.includes(permission);
  }

  // Middleware to check if user has specific role
  static requireRole(roleName) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        if (req.user.role_name !== roleName) {
          return res.status(403).json({
            error: `Role '${roleName}' is required`
          });
        }

        next();
      } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({
          error: 'Role check failed'
        });
      }
    };
  }

  // Middleware to check if user is admin
  static requireAdmin(req, res, next) {
    return AuthMiddleware.requireRole('admin')(req, res, next);
  }

  // Middleware to check if user is doctor
  static requireDoctor(req, res, next) {
    return AuthMiddleware.requireRole('doctor')(req, res, next);
  }

  // Optional authentication middleware (doesn't fail if no token)
  static optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    // Try to verify token, but don't fail if it's invalid
    AuthMiddleware.verifyToken(req, res, (err) => {
      if (err) {
        // Token is invalid, but continue without user info
        req.user = null;
      }
      next();
    });
  }
}

module.exports = AuthMiddleware;
