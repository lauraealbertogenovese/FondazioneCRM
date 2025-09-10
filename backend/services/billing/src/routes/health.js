const express = require('express');
const router = express.Router();
const { query } = require('../utils/database');

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    // Test database connection
    await query('SELECT 1');
    
    res.json({
      success: true,
      service: 'Billing Service',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      service: 'Billing Service',
      version: '1.0.0',
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

module.exports = router;