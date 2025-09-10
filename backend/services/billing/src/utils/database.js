const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fondazione_crm',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Query function with error handling
const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const start = Date.now();
    const result = await client.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', { text: text.replace(/\s+/g, ' ').trim(), duration, rowCount: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Initialize database schema
const initializeSchema = async () => {
  try {
    console.log('🔄 Initializing billing database schema...');
    
    // Create billing schema if it doesn't exist
    await query('CREATE SCHEMA IF NOT EXISTS billing');
    
    // Create invoices table
    await query(`
      CREATE TABLE IF NOT EXISTS billing.invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        patient_id INTEGER NOT NULL REFERENCES patient.patients(id) ON DELETE CASCADE,
        patient_name VARCHAR(255) NOT NULL,
        patient_cf VARCHAR(16),
        description TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
        payment_method VARCHAR(20) DEFAULT 'contanti' CHECK (payment_method IN ('contanti', 'tracciabile')),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE NOT NULL,
        payment_date DATE,
        payment_notes TEXT,
        created_by INTEGER NOT NULL REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create invoice_items table for detailed line items
    await query(`
      CREATE TABLE IF NOT EXISTS billing.invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
        unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price > 0),
        total_price DECIMAL(10,2) NOT NULL CHECK (total_price > 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create payments table for payment tracking
    await query(`
      CREATE TABLE IF NOT EXISTS billing.payments (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES billing.invoices(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
        payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('contanti', 'tracciabile')),
        payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
        notes TEXT,
        recorded_by INTEGER NOT NULL REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create billing_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS billing.billing_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_by INTEGER REFERENCES auth.users(id),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create indexes for performance
    await query('CREATE INDEX IF NOT EXISTS idx_invoices_patient_id ON billing.invoices(patient_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_invoices_status ON billing.invoices(status)');
    await query('CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON billing.invoices(issue_date)');
    await query('CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON billing.invoices(due_date)');
    await query('CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON billing.invoice_items(invoice_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON billing.payments(invoice_id)');
    
    // Create update trigger for updated_at
    await query(`
      CREATE OR REPLACE FUNCTION billing.update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    await query(`
      DROP TRIGGER IF EXISTS update_invoices_updated_at ON billing.invoices;
      CREATE TRIGGER update_invoices_updated_at 
        BEFORE UPDATE ON billing.invoices 
        FOR EACH ROW EXECUTE FUNCTION billing.update_updated_at_column();
    `);
    
    // Insert default settings
    await query(`
      INSERT INTO billing.billing_settings (setting_key, setting_value, description)
      VALUES 
        ('invoice_number_format', 'INV-{YYYY}-{###}', 'Format for auto-generated invoice numbers'),
        ('default_due_days', '30', 'Default number of days for invoice due date'),
        ('company_name', 'Fondazione per il Recovery', 'Company name for invoices'),
        ('company_address', 'Via Roma 123, 00100 Roma', 'Company address for invoices'),
        ('company_vat', 'IT12345678901', 'Company VAT number'),
        ('company_cf', '12345678901', 'Company fiscal code')
      ON CONFLICT (setting_key) DO NOTHING
    `);
    
    console.log('✅ Billing database schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing billing schema:', error);
    throw error;
  }
};

// Test database connection
const testConnection = async () => {
  try {
    await query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  initializeSchema,
  testConnection
};