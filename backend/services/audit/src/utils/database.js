const { Pool } = require('pg');

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fondazione_crm',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Enhanced query function with error handling and logging
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    console.log(`[DB Query] ${text.replace(/\s+/g, ' ').trim()}`);
    if (params.length > 0) {
      console.log(`[DB Params] ${JSON.stringify(params)}`);
    }
    
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`[DB Result] ${res.rowCount} rows returned in ${duration}ms`);
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[DB Error] Query failed after ${duration}ms:`, err);
    throw err;
  }
};

// Initialize database schema
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing audit service database schema...');

    // Create audit schema if it doesn't exist
    await query(`
      CREATE SCHEMA IF NOT EXISTS audit;
    `);

    // Create audit_logs table
    await query(`
      CREATE TABLE IF NOT EXISTS audit.audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(100) NOT NULL,
        entity_id INTEGER,
        entity_name VARCHAR(500),
        user_id INTEGER,
        user_name VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        changes JSONB,
        metadata JSONB,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Indexes for better performance
        CONSTRAINT audit_logs_action_check CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT', 'LOGIN', 'LOGOUT'))
      );
    `);

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit.audit_logs(entity_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit.audit_logs(entity_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit.audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.audit_logs(action);
    `);

    // Create GDPR consents table
    await query(`
      CREATE TABLE IF NOT EXISTS audit.gdpr_consents (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        consent_type VARCHAR(50) NOT NULL,
        granted BOOLEAN NOT NULL DEFAULT false,
        consent_date TIMESTAMP WITH TIME ZONE,
        revocation_date TIMESTAMP WITH TIME ZONE,
        version VARCHAR(10) NOT NULL DEFAULT '1.0',
        ip_address INET,
        user_agent TEXT,
        legal_basis TEXT,
        purpose TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        -- Ensure one active consent per type per patient
        UNIQUE(patient_id, consent_type),
        CONSTRAINT gdpr_consents_type_check CHECK (consent_type IN ('data_processing', 'marketing', 'research', 'data_sharing', 'cookies'))
      );
    `);

    // Create GDPR consent history table
    await query(`
      CREATE TABLE IF NOT EXISTS audit.gdpr_consent_history (
        id SERIAL PRIMARY KEY,
        consent_id INTEGER REFERENCES audit.gdpr_consents(id),
        patient_id INTEGER NOT NULL,
        consent_type VARCHAR(50) NOT NULL,
        action VARCHAR(20) NOT NULL,
        granted BOOLEAN NOT NULL,
        version VARCHAR(10) NOT NULL,
        user_id INTEGER,
        user_name VARCHAR(255),
        ip_address INET,
        user_agent TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT gdpr_history_action_check CHECK (action IN ('granted', 'revoked', 'updated'))
      );
    `);

    // Create GDPR data retention policies table
    await query(`
      CREATE TABLE IF NOT EXISTS audit.gdpr_retention_policies (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(100) NOT NULL,
        retention_period_months INTEGER NOT NULL,
        legal_basis TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        UNIQUE(entity_type)
      );
    `);

    // Insert default retention policies
    await query(`
      INSERT INTO audit.gdpr_retention_policies (entity_type, retention_period_months, legal_basis, description)
      VALUES 
        ('patient', 120, 'Medical records retention law', 'Patient data retained for 10 years after last contact'),
        ('clinical_record', 120, 'Medical records retention law', 'Clinical records retained for 10 years'),
        ('billing', 120, 'Tax and accounting law', 'Billing records retained for 10 years'),
        ('audit_log', 84, 'Security and compliance', 'Audit logs retained for 7 years')
      ON CONFLICT (entity_type) DO NOTHING;
    `);

    // Create data subject requests table (for GDPR Article 15-22 requests)
    await query(`
      CREATE TABLE IF NOT EXISTS audit.gdpr_data_requests (
        id SERIAL PRIMARY KEY,
        request_type VARCHAR(50) NOT NULL,
        patient_id INTEGER,
        patient_name VARCHAR(255),
        patient_email VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        request_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        completion_date TIMESTAMP WITH TIME ZONE,
        assigned_to INTEGER,
        notes TEXT,
        attachments JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT gdpr_request_type_check CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction', 'objection')),
        CONSTRAINT gdpr_request_status_check CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected', 'cancelled'))
      );
    `);

    // Create indexes for GDPR tables
    await query(`
      CREATE INDEX IF NOT EXISTS idx_gdpr_consents_patient_id ON audit.gdpr_consents(patient_id);
      CREATE INDEX IF NOT EXISTS idx_gdpr_consents_type ON audit.gdpr_consents(consent_type);
      CREATE INDEX IF NOT EXISTS idx_gdpr_history_patient_id ON audit.gdpr_consent_history(patient_id);
      CREATE INDEX IF NOT EXISTS idx_gdpr_history_created_at ON audit.gdpr_consent_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_gdpr_requests_patient_id ON audit.gdpr_data_requests(patient_id);
      CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON audit.gdpr_data_requests(status);
    `);

    console.log('✅ Audit service database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database schema:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version()');
    console.log('✅ Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  initializeDatabase,
  testConnection
};