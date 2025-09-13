require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
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
    console.log(`[DB Result] ${res.rowCount} rows affected in ${duration}ms`);
    return res;
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[DB Error] Query failed after ${duration}ms:`, err);
    throw err;
  }
};

// Create migrations tracking table
const createMigrationsTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS public.migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64),
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Migrations tracking table ready');
};

// Get applied migrations
const getAppliedMigrations = async () => {
  const result = await query('SELECT filename FROM public.migrations ORDER BY id');
  return result.rows.map(row => row.filename);
};

// Calculate file checksum (simple hash)
const calculateChecksum = (content) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(content).digest('hex');
};

// Apply single migration
const applyMigration = async (migrationFile) => {
  const migrationPath = path.join(__dirname, 'database', 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }

  console.log(`📄 Reading migration: ${migrationFile}`);
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  const checksum = calculateChecksum(migrationContent);

  console.log(`🚀 Applying migration: ${migrationFile}`);
  
  try {
    // Begin transaction
    await query('BEGIN');
    
    // Execute migration
    await query(migrationContent);
    
    // Record migration
    await query(
      'INSERT INTO public.migrations (filename, checksum) VALUES ($1, $2)',
      [migrationFile, checksum]
    );
    
    // Commit transaction
    await query('COMMIT');
    
    console.log(`✅ Migration applied successfully: ${migrationFile}`);
  } catch (error) {
    // Rollback on error
    await query('ROLLBACK');
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    throw error;
  }
};

// Main migration function
const applyMigrations = async () => {
  try {
    console.log('🔧 Fondazione CRM - Database Migrations');
    console.log('=====================================');

    // Test database connection
    const result = await query('SELECT NOW() as current_time, version()');
    console.log('✅ Database connection successful:', result.rows[0].current_time);

    // Create migrations table
    await createMigrationsTable();

    // Get migration files
    const migrationsDir = path.join(__dirname, 'database', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('⚠️ No migrations directory found');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Apply in alphabetical order

    if (migrationFiles.length === 0) {
      console.log('⚠️ No migration files found');
      return;
    }

    console.log(`📁 Found ${migrationFiles.length} migration files:`, migrationFiles);

    // Get already applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`✅ Already applied: ${appliedMigrations.length} migrations`);

    // Apply pending migrations
    let appliedCount = 0;
    for (const migrationFile of migrationFiles) {
      if (!appliedMigrations.includes(migrationFile)) {
        await applyMigration(migrationFile);
        appliedCount++;
      } else {
        console.log(`⏭️ Skipping already applied: ${migrationFile}`);
      }
    }

    if (appliedCount === 0) {
      console.log('🎉 All migrations are already applied - database is up to date!');
    } else {
      console.log(`🎉 Applied ${appliedCount} new migrations successfully!`);
    }

  } catch (error) {
    console.error('❌ Migration process failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run migrations
applyMigrations()
  .then(() => {
    console.log('✅ Database migrations completed');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });