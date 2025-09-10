const JWTUtils = require('../utils/jwt');
const User = require('../models/User');
const UserSession = require('../models/UserSession');

class AuthMiddleware {
  // Middleware to verify JWT token
  static async verifyToken(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({
          error: 'Authorization header is required'
        });
      }

      const token = JWTUtils.extractTokenFromHeader(authHeader);
      const decoded = JWTUtils.verifyToken(token);
      
      // Check if token is access token
      if (decoded.type !== 'access') {
        return res.status(401).json({
          error: 'Invalid token type'
        });
      }

      // Get user from database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          error: 'User account is deactivated'
        });
      }

      // Verify session is still valid
      const tokenHash = JWTUtils.generateTokenHash(token);
      const session = await UserSession.findByTokenHash(tokenHash);
      if (!session || !session.isValid()) {
        return res.status(401).json({
          error: 'Session expired or invalid'
        });
      }

      // Add user and token info to request
      req.user = user;
      req.token = decoded;
      req.session = session;
      
      next();
    } catch (error) {
      return res.status(401).json({
        error: error.message
      });
    }
  }

  // Middleware to check user permissions
  static requirePermission(permission) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            error: 'Authentication required'
          });
        }

        // Get user role with permissions
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(401).json({
            error: 'User not found'
          });
        }

        // Check if user has required permission
        if (!user.hasPermission(permission)) {
          return res.status(403).json({
            error: 'Insufficient permissions'
          });
        }

        next();
      } catch (error) {
        return res.status(500).json({
          error: 'Permission check failed'
        });
      }
    };
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

        // Get user role
        const user = await User.findById(req.user.id);
        if (!user || !user.role || user.role.name !== roleName) {
          return res.status(403).json({
            error: `Role '${roleName}' is required`
          });
        }

        next();
      } catch (error) {
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

  // Middleware to check if user is psychologist
  static requirePsychologist(req, res, next) {
    return AuthMiddleware.requireRole('psychologist')(req, res, next);
  }

  // Optional authentication middleware (doesn't fail if no token)
  static optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    try {
      const token = JWTUtils.extractTokenFromHeader(authHeader);
      const decoded = JWTUtils.verifyToken(token);
      
      if (decoded.type === 'access') {
        User.findById(decoded.id).then(user => {
          if (user && user.is_active) {
            req.user = user;
            req.token = decoded;
          }
          next();
        }).catch(() => {
          next();
        });
      } else {
        next();
      }
    } catch (error) {
      next();
    }
  }

  // Middleware to validate refresh token
  static async verifyRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(401).json({
          error: 'Refresh token is required'
        });
      }

      const decoded = JWTUtils.verifyToken(refreshToken);
      
      // Check if token is refresh token
      if (decoded.type !== 'refresh') {
        return res.status(401).json({
          error: 'Invalid token type'
        });
      }

      // Get user from database
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          error: 'User not found'
        });
      }

      // Check if user is active
      if (!user.is_active) {
        return res.status(401).json({
          error: 'User account is deactivated'
        });
      }

      // Verify session is still valid
      const tokenHash = JWTUtils.generateTokenHash(refreshToken);
      const session = await UserSession.findByTokenHash(tokenHash);
      if (!session || !session.isValid()) {
        return res.status(401).json({
          error: 'Session expired or invalid'
        });
      }

      // Add user and token info to request
      req.user = user;
      req.token = decoded;
      req.session = session;
      
      next();
    } catch (error) {
      return res.status(401).json({
        error: error.message
      });
    }
  }
}

module.exports = AuthMiddleware;
