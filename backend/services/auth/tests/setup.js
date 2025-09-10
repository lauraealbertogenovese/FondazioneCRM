// Test setup file

// Set test environment variables BEFORE any imports
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-very-long-string-for-security';
process.env.DATABASE_URL = 'postgresql://crm_user:crm_password@localhost:5432/fondazione_crm_test';

const { Pool } = require('pg');

// Test database configuration
const testDbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: false
};

// Global test setup
beforeAll(async () => {
  // Setup test database connection
  global.testDb = new Pool(testDbConfig);
});

// Global test teardown
afterAll(async () => {
  if (global.testDb) {
    await global.testDb.end();
  }
});

// Setup for each test
beforeEach(async () => {
  // Clear relevant tables before each test
  if (global.testDb) {
    try {
      await global.testDb.query('DELETE FROM auth.user_sessions WHERE id > 0');
      // Note: Don't delete users as they might be needed for other tests
    } catch (error) {
      // Ignore errors if tables don't exist in test
    }
  }
});

// Cleanup after each test
afterEach(async () => {
  // Any cleanup needed after tests
});
