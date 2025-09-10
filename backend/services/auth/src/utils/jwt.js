const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

class JWTUtils {
  // Generate access token
  static generateAccessToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      type: 'access'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'fondazione-crm',
      audience: 'fondazione-crm-users'
    });
  }

  // Generate refresh token
  static generateRefreshToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      type: 'refresh'
    };

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'fondazione-crm',
      audience: 'fondazione-crm-users'
    });
  }

  // Verify token
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'fondazione-crm',
        audience: 'fondazione-crm-users'
      });
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  // Decode token without verification (for debugging)
  static decodeToken(token) {
    return jwt.decode(token);
  }

  // Generate token hash for database storage
  static generateTokenHash(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Generate random token for password reset, etc.
  static generateRandomToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  // Generate token pair (access + refresh)
  static generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
      accessTokenHash: this.generateTokenHash(accessToken),
      refreshTokenHash: this.generateTokenHash(refreshToken)
    };
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new Error('Invalid authorization header format');
    }

    return parts[1];
  }

  // Get token expiration date
  static getTokenExpiration(token) {
    const decoded = this.decodeToken(token);
    return new Date(decoded.exp * 1000);
  }

  // Check if token is expired
  static isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      return new Date(decoded.exp * 1000) < new Date();
    } catch (error) {
      return true;
    }
  }
}

module.exports = JWTUtils;
