const express = require('express');
const User = require('../models/User');
const UserSession = require('../models/UserSession');
const JWTUtils = require('../utils/jwt');
const ValidationUtils = require('../utils/validation');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    const validation = ValidationUtils.validateUserLogin({ username, password });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Find user by username or email
    let user = await User.findByUsername(username);
    if (!user) {
      user = await User.findByEmail(username);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate tokens
    const tokenPair = JWTUtils.generateTokenPair(user);
    
    // Create session for access token
    const accessTokenExpiry = JWTUtils.getTokenExpiration(tokenPair.accessToken);
    await UserSession.create({
      user_id: user.id,
      token_hash: tokenPair.accessTokenHash,
      expires_at: accessTokenExpiry
    });

    // Create session for refresh token
    const refreshTokenExpiry = JWTUtils.getTokenExpiration(tokenPair.refreshToken);
    await UserSession.create({
      user_id: user.id,
      token_hash: tokenPair.refreshTokenHash,
      expires_at: refreshTokenExpiry
    });

    // Update last login
    await user.updateLastLogin();

    res.json({
      message: 'Login successful',
      user: user.getPublicData(),
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: '24h'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /register - User registration
router.post('/register', async (req, res) => {
  try {
    const userData = ValidationUtils.sanitizeInput(req.body);
    
    // Validate input
    const validation = ValidationUtils.validateUserRegistration(userData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check if username already exists
    const existingUserByUsername = await User.findByUsername(userData.username);
    if (existingUserByUsername) {
      return res.status(409).json({
        error: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findByEmail(userData.email);
    if (existingUserByEmail) {
      return res.status(409).json({
        error: 'Email already exists'
      });
    }

    // Create user
    const user = await User.create(userData);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.getPublicData()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /refresh - Refresh access token
router.post('/refresh', AuthMiddleware.verifyRefreshToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Generate new access token
    const newAccessToken = JWTUtils.generateAccessToken(req.user);
    const newAccessTokenHash = JWTUtils.generateTokenHash(newAccessToken);
    const newAccessTokenExpiry = JWTUtils.getTokenExpiration(newAccessToken);

    // Deactivate old access token session
    await req.session.deactivate();

    // Create new session for access token
    await UserSession.create({
      user_id: req.user.id,
      token_hash: newAccessTokenHash,
      expires_at: newAccessTokenExpiry
    });

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /logout - User logout
router.post('/logout', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    // Deactivate current session
    await req.session.deactivate();

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// POST /logout-all - Logout from all devices
router.post('/logout-all', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    // Deactivate all sessions for user
    await UserSession.deactivateAllForUser(req.user.id);

    res.json({
      message: 'Logged out from all devices'
    });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /profile - Get user profile
router.get('/profile', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      user: user.getPublicData()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /profile - Update user profile
router.put('/profile', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const updateData = ValidationUtils.sanitizeInput(req.body);
    
    // Validate input
    const validation = ValidationUtils.validateUserUpdate(updateData);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== req.user.email) {
      const existingUser = await User.findByEmail(updateData.email);
      if (existingUser) {
        return res.status(409).json({
          error: 'Email already exists'
        });
      }
    }

    // Update user
    const user = await User.findById(req.user.id);
    await user.update(updateData);

    res.json({
      message: 'Profile updated successfully',
      user: user.getPublicData()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// PUT /change-password - Change user password
router.put('/change-password', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    const validation = ValidationUtils.validatePasswordChange({
      currentPassword,
      newPassword
    });
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Get user and verify current password
    const user = await User.findById(req.user.id);
    const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: 'Current password is incorrect'
      });
    }

    // Update password
    await user.updatePassword(newPassword);

    // Deactivate all sessions to force re-login
    await UserSession.deactivateAllForUser(user.id);

    res.json({
      message: 'Password changed successfully. Please login again.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /sessions - Get user sessions
router.get('/sessions', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const sessions = await UserSession.findByUserId(req.user.id);
    
    res.json({
      sessions: sessions.map(session => session.toJSON())
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// GET /verify - Verify token (for other services)
router.get('/verify', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    // Il token è già stato verificato dal middleware
    // Ricarichiamo l'utente con i permessi per essere sicuri
    const userWithPermissions = await User.findByUsername(req.user.username);
    
    if (!userWithPermissions) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Restituiamo i dati completi dell'utente
    res.json({
      user: userWithPermissions.getPublicData()
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;
