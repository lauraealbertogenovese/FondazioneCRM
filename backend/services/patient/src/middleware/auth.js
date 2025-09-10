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
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
      
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
        const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
        
        try {
          const response = await axios.get(`${authServiceUrl}/auth/profile`, {
            headers: {
              'Authorization': req.headers.authorization
            },
            timeout: 5000
          });

          const user = response.data.user;
          console.log(`[Patient Permission] Auth Service profile response:`, {role_name: user.role_name, permissions: user.permissions});
          
          // Check if user has required permission
          if (!user.role_name || !this.hasPermission(user.role_name, permission)) {
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

  // Check if role has permission (simplified version)
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
