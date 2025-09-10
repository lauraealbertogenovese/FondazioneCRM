const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const clinicalRoutes = require('./routes/clinical');
const visitRoutes = require('./routes/visits');

const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Clinical Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Clinical Service is running',
    version: '1.0.0',
    endpoints: {
      clinical: [
        'GET /clinical/records - List clinical records',
        'GET /clinical/records/:id - Get clinical record by ID',
        'GET /clinical/records/patient/:patientId - Get patient clinical records',
        'POST /clinical/records - Create clinical record',
        'PUT /clinical/records/:id - Update clinical record',
        'DELETE /clinical/records/:id - Delete clinical record',
        'GET /clinical/records/patient/:patientId/count - Count patient records'
      ],
      visits: [
        'GET /clinical/visits - List visits',
        'GET /clinical/visits/:id - Get visit by ID',
        'GET /clinical/visits/patient/:patientId - Get patient visits',
        'GET /clinical/visits/upcoming - Get upcoming visits',
        'POST /clinical/visits - Create visit',
        'PUT /clinical/visits/:id - Update visit',
        'DELETE /clinical/visits/:id - Delete visit',
        'GET /clinical/visits/patient/:patientId/count - Count patient visits'
      ]
    }
  });
});

// Routes
app.use('/clinical', clinicalRoutes);
app.use('/clinical', visitRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Clinical Service Error:', err);
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.message });
  }
  
  // Database errors
  if (err.code === '23505') { // Unique violation
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  if (err.code === '23503') { // Foreign key violation
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Clinical Service running on port ${PORT}`);
});
