const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');

// Import middleware
const AuthMiddleware = require('./middleware/auth');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3006', 'http://localhost:3005', 'http://localhost:3000', 'http://localhost:3007'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Auth Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Auth Service is running',
    version: '1.0.0',
    endpoints: {
      auth: [
        'POST /login - User login',
        'POST /register - User registration',
        'POST /refresh - Refresh access token',
        'POST /logout - User logout',
        'POST /logout-all - Logout from all devices',
        'GET /profile - Get user profile',
        'PUT /profile - Update user profile',
        'PUT /change-password - Change password',
        'GET /sessions - Get user sessions'
      ],
      users: [
        'GET /users - Get all users (admin)',
        'GET /users/:id - Get user by ID (admin)',
        'PUT /users/:id - Update user (admin)',
        'DELETE /users/:id - Delete user (admin)',
        'PUT /users/:id/password - Reset password (admin)',
        'GET /roles - Get all roles',
        'GET /roles/:id - Get role by ID',
        'POST /roles - Create role (admin)',
        'PUT /roles/:id - Update role (admin)',
        'DELETE /roles/:id - Delete role (admin)'
      ]
    }
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  // Database errors
  if (err.code === '23505') { // Unique constraint violation
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  if (err.code === '23503') { // Foreign key constraint violation
    return res.status(400).json({ error: 'Referenced resource not found' });
  }
  
  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = app;
