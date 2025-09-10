const { query } = require('../utils/database');

class AuditLog {
  constructor(data) {
    this.id = data.id;
    this.action = data.action;
    this.entity_type = data.entity_type;
    this.entity_id = data.entity_id;
    this.entity_name = data.entity_name;
    this.user_id = data.user_id;
    this.user_name = data.user_name;
    this.ip_address = data.ip_address;
    this.user_agent = data.user_agent;
    this.changes = data.changes;
    this.metadata = data.metadata;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  // Create new audit log entry
  static async create(logData) {
    try {
      const queryText = `
        INSERT INTO audit.audit_logs (
          action, entity_type, entity_id, entity_name,
          user_id, user_name, ip_address, user_agent,
          changes, metadata, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      
      const values = [
        logData.action,
        logData.entity_type,
        logData.entity_id,
        logData.entity_name,
        logData.user_id,
        logData.user_name,
        logData.ip_address,
        logData.user_agent,
        JSON.stringify(logData.changes || {}),
        JSON.stringify(logData.metadata || {}),
        logData.description
      ];
      
      const result = await query(queryText, values);
      return new AuditLog(result.rows[0]);
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  // Get audit logs with filters
  static async findAll(filters = {}) {
    let queryText = `
      SELECT * FROM audit.audit_logs
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Filter by entity type
    if (filters.entity_type && filters.entity_type !== 'all') {
      queryText += ` AND entity_type = $${paramCount}`;
      queryParams.push(filters.entity_type);
      paramCount++;
    }
    
    // Filter by entity ID
    if (filters.entity_id) {
      queryText += ` AND entity_id = $${paramCount}`;
      queryParams.push(filters.entity_id);
      paramCount++;
    }
    
    // Filter by user
    if (filters.user_id) {
      queryText += ` AND user_id = $${paramCount}`;
      queryParams.push(filters.user_id);
      paramCount++;
    }
    
    // Filter by action
    if (filters.action) {
      queryText += ` AND action = $${paramCount}`;
      queryParams.push(filters.action);
      paramCount++;
    }
    
    // Filter by date range
    if (filters.start_date) {
      queryText += ` AND created_at >= $${paramCount}`;
      queryParams.push(filters.start_date);
      paramCount++;
    }
    
    if (filters.end_date) {
      queryText += ` AND created_at <= $${paramCount}`;
      queryParams.push(filters.end_date);
      paramCount++;
    }
    
    // Search in description or entity name
    if (filters.search) {
      queryText += ` AND (
        LOWER(description) LIKE LOWER($${paramCount}) OR 
        LOWER(entity_name) LIKE LOWER($${paramCount}) OR
        LOWER(user_name) LIKE LOWER($${paramCount})
      )`;
      queryParams.push(`%${filters.search}%`);
      paramCount++;
    }
    
    // Order by created_at (newest first)
    queryText += ' ORDER BY created_at DESC';
    
    // Pagination
    if (filters.limit) {
      queryText += ` LIMIT $${paramCount}`;
      queryParams.push(filters.limit);
      paramCount++;
    }
    
    if (filters.offset) {
      queryText += ` OFFSET $${paramCount}`;
      queryParams.push(filters.offset);
    }
    
    const result = await query(queryText, queryParams);
    return result.rows.map(row => new AuditLog(row));
  }

  // Get audit log by ID
  static async findById(id) {
    const result = await query(
      'SELECT * FROM audit.audit_logs WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? new AuditLog(result.rows[0]) : null;
  }

  // Get audit statistics
  static async getStatistics(filters = {}) {
    let queryText = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(CASE WHEN action = 'CREATE' THEN 1 END) as create_actions,
        COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as update_actions,
        COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as delete_actions,
        COUNT(CASE WHEN action = 'VIEW' THEN 1 END) as view_actions,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as last_24h,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as last_7days,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as last_30days
      FROM audit.audit_logs 
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 1;
    
    // Apply date filters if provided
    if (filters.start_date) {
      queryText += ` AND created_at >= $${paramCount}`;
      queryParams.push(filters.start_date);
      paramCount++;
    }
    
    if (filters.end_date) {
      queryText += ` AND created_at <= $${paramCount}`;
      queryParams.push(filters.end_date);
    }
    
    const result = await query(queryText, queryParams);
    return result.rows[0];
  }

  // Get most active users
  static async getMostActiveUsers(limit = 10) {
    const result = await query(`
      SELECT 
        user_id,
        user_name,
        COUNT(*) as action_count,
        MAX(created_at) as last_activity
      FROM audit.audit_logs 
      WHERE user_id IS NOT NULL
      GROUP BY user_id, user_name
      ORDER BY action_count DESC
      LIMIT $1
    `, [limit]);
    
    return result.rows;
  }

  // Get entity activity summary
  static async getEntityActivity(entityType, limit = 10) {
    const result = await query(`
      SELECT 
        entity_id,
        entity_name,
        COUNT(*) as activity_count,
        MAX(created_at) as last_activity,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit.audit_logs 
      WHERE entity_type = $1
      GROUP BY entity_id, entity_name
      ORDER BY activity_count DESC
      LIMIT $2
    `, [entityType, limit]);
    
    return result.rows;
  }

  // Clean up old audit logs based on retention policy
  static async cleanupOldLogs() {
    try {
      // Get retention policy for audit logs
      const retentionResult = await query(
        'SELECT retention_period_months FROM audit.gdpr_retention_policies WHERE entity_type = $1',
        ['audit_log']
      );
      
      const retentionMonths = retentionResult.rows[0]?.retention_period_months || 84; // Default 7 years
      
      const result = await query(`
        DELETE FROM audit.audit_logs 
        WHERE created_at < CURRENT_DATE - INTERVAL '${retentionMonths} months'
        RETURNING id
      `);
      
      console.log(`Cleaned up ${result.rows.length} old audit log entries`);
      return result.rows.length;
    } catch (error) {
      console.error('Error cleaning up old audit logs:', error);
      throw error;
    }
  }

  // Utility method to log an action
  static async logAction({
    action,
    entityType,
    entityId,
    entityName,
    userId,
    userName,
    ipAddress,
    userAgent,
    changes = {},
    metadata = {},
    description
  }) {
    return await this.create({
      action,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      user_id: userId,
      user_name: userName,
      ip_address: ipAddress,
      user_agent: userAgent,
      changes,
      metadata,
      description
    });
  }
}

module.exports = AuditLog;