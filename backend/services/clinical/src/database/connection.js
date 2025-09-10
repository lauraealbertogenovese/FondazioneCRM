const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Clinical Service: Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Clinical Service: Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
