const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { verifyToken, requireAuditAccess } = require('../middleware/auth');

// Apply authentication to all routes
router.use(verifyToken);
router.use(requireAuditAccess);

// GET /audit/logs - Get audit logs with filters
router.get('/logs', async (req, res) => {
  try {
    const filters = {
      entity_type: req.query.entity_type,
      entity_id: req.query.entity_id ? parseInt(req.query.entity_id) : undefined,
      user_id: req.query.user_id ? parseInt(req.query.user_id) : undefined,
      action: req.query.action,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      search: req.query.search,
      limit: req.query.limit ? parseInt(req.query.limit) : 100,
      offset: req.query.offset ? parseInt(req.query.offset) : 0
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const logs = await AuditLog.findAll(filters);
    
    res.json({
      success: true,
      data: logs,
      filters: filters
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching audit logs'
    });
  }
});

// GET /audit/logs/:id - Get specific audit log
router.get('/logs/:id', async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Audit log not found'
      });
    }
    
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching audit log'
    });
  }
});

// POST /audit/logs - Create new audit log entry
router.post('/logs', async (req, res) => {
  try {
    const logData = {
      ...req.body,
      user_id: req.user.id,
      user_name: req.user.username || `${req.user.first_name} ${req.user.last_name}`.trim(),
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent')
    };

    const log = await AuditLog.create(logData);
    
    res.status(201).json({
      success: true,
      message: 'Audit log created successfully',
      data: log
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating audit log'
    });
  }
});

// GET /audit/statistics - Get audit statistics
router.get('/statistics', async (req, res) => {
  try {
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) delete filters[key];
    });

    const statistics = await AuditLog.getStatistics(filters);
    
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching audit statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching statistics'
    });
  }
});

// GET /audit/users/active - Get most active users
router.get('/users/active', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const activeUsers = await AuditLog.getMostActiveUsers(limit);
    
    res.json({
      success: true,
      data: activeUsers
    });
  } catch (error) {
    console.error('Error fetching active users:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching active users'
    });
  }
});

// GET /audit/entities/:type/activity - Get entity activity summary
router.get('/entities/:type/activity', async (req, res) => {
  try {
    const entityType = req.params.type;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    
    const activity = await AuditLog.getEntityActivity(entityType, limit);
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching entity activity:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching entity activity'
    });
  }
});

// POST /audit/cleanup - Clean up old audit logs
router.post('/cleanup', async (req, res) => {
  try {
    const deletedCount = await AuditLog.cleanupOldLogs();
    
    // Log the cleanup action
    await AuditLog.logAction({
      action: 'DELETE',
      entityType: 'audit_log',
      entityId: null,
      entityName: 'Old Audit Logs',
      userId: req.user.id,
      userName: req.user.username || `${req.user.first_name} ${req.user.last_name}`.trim(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      metadata: { deleted_count: deletedCount },
      description: `Cleaned up ${deletedCount} old audit log entries`
    });
    
    res.json({
      success: true,
      message: `Successfully cleaned up ${deletedCount} old audit log entries`,
      data: { deleted_count: deletedCount }
    });
  } catch (error) {
    console.error('Error cleaning up audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error cleaning up audit logs'
    });
  }
});

// Utility route to log an action (for internal use by other services)
router.post('/log-action', async (req, res) => {
  try {
    const logData = {
      action: req.body.action,
      entityType: req.body.entity_type || req.body.entityType,
      entityId: req.body.entity_id || req.body.entityId,
      entityName: req.body.entity_name || req.body.entityName,
      userId: req.body.user_id || req.user.id,
      userName: req.body.user_name || req.user.username || `${req.user.first_name} ${req.user.last_name}`.trim(),
      ipAddress: req.body.ip_address || req.ip || req.connection.remoteAddress,
      userAgent: req.body.user_agent || req.get('User-Agent'),
      changes: req.body.changes || {},
      metadata: req.body.metadata || {},
      description: req.body.description
    };

    const log = await AuditLog.logAction(logData);
    
    res.status(201).json({
      success: true,
      message: 'Action logged successfully',
      data: log
    });
  } catch (error) {
    console.error('Error logging action:', error);
    res.status(500).json({
      success: false,
      error: 'Error logging action'
    });
  }
});

module.exports = router;