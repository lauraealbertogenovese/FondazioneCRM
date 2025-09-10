const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const groupRoutes = require('./routes/groups');
const memberRoutes = require('./routes/members');

const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3006', 'http://localhost:3005', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Group Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info route
app.get('/', (req, res) => {
  res.json({
    message: 'Group Service is running',
    version: '1.0.0',
    endpoints: {
      groups: [
        'GET /groups - List all groups with filters',
        'POST /groups - Create new group',
        'GET /groups/:id - Get group by ID',
        'PUT /groups/:id - Update group',
        'DELETE /groups/:id - Delete group',
        'GET /groups/statistics - Get group statistics'
      ],
      members: [
        'GET /groups/:groupId/members - List group members',
        'POST /groups/:groupId/members - Add member to group',
        'PUT /groups/:groupId/members/:memberId - Update member',
        'DELETE /groups/:groupId/members/:memberId - Remove member',
        'GET /patients/:patientId/groups - Get patient groups'
      ]
    }
  });
});

// Routes
app.use('/groups', groupRoutes);
app.use('/groups', memberRoutes);
app.use('/', memberRoutes); // For /patients/:patientId/groups route

// Error handling
app.use((err, req, res, next) => {
  console.error('Group Service Error:', err.stack);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Route not found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Group Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
});