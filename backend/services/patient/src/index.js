const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const patientRoutes = require('./routes/patients');
const documentRoutes = require('./routes/documents');

const app = express();
const PORT = process.env.PORT || 3002;

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
    service: 'Patient Service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Info route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Patient Service is running',
    version: '1.0.0',
    endpoints: {
      patients: [
        'GET /patients - Get all patients with pagination and filters',
        'GET /patients/:id - Get patient by ID',
        'GET /patients/cf/:codice_fiscale - Get patient by Codice Fiscale',
        'GET /patients/ts/:numero_tessera_sanitaria - Get patient by Numero Tessera Sanitaria',
        'POST /patients - Create new patient',
        'PUT /patients/:id - Update patient',
        'DELETE /patients/:id - Delete patient (soft delete)',
        'GET /patients/:id/documents - Get patient documents'
      ],
      documents: [
        'POST /patients/:patientId/documents - Upload document for patient',
        'GET /documents/:id - Get document by ID',
        'GET /documents/:id/download - Download document',
        'PUT /documents/:id - Update document metadata',
        'DELETE /documents/:id - Delete document',
        'GET /documents/types/:type - Get documents by type'
      ]
    }
  });
});

// Test route (no auth)
app.get('/test', (req, res) => {
  res.json({ message: 'Patient service routes working' });
});

// Routes
console.log('Loading patient routes...');
try {
  app.use('/', patientRoutes);
  console.log('Patient routes loaded successfully');
} catch (error) {
  console.error('Error loading patient routes:', error);
}

console.log('Loading document routes...');
try {
  app.use('/', documentRoutes);
  console.log('Document routes loaded successfully');
} catch (error) {
  console.error('Error loading document routes:', error);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Patient Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Auth Service URL: ${process.env.AUTH_SERVICE_URL || 'http://auth-service:3002'}`);
});
