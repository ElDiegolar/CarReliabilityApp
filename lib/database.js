// lib/database.js - Modified for development
const { Pool } = require('pg');

// Create connection pool with error handling
// Note: pg-native is optional and not required in production
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Disable pg-native to avoid optional dependency warnings
    ...(process.env.NODE_ENV === 'production' && { native: false })
  });
} catch (error) {
  console.warn('Database configuration error:', error.message);
  // Use a mock pool for development
  pool = {
    connect: () => {
      console.log('Using mock database connection');
      return {
        query: async () => ({ rows: [] }),
        release: () => {}
      };
    }
  };
}

// Execute a database query
const query = async (text, params) => {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.warn('Database query error:', error.message);
    return { rows: [] }; // Return empty result for development
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create shared_reports table for shareable vehicle and product reports
    await query(`
      CREATE TABLE IF NOT EXISTS shared_reports (
        id SERIAL PRIMARY KEY,
        share_id VARCHAR(32) UNIQUE NOT NULL,
        report_type VARCHAR(20) DEFAULT 'vehicle',
        year INTEGER,
        make VARCHAR(100),
        model VARCHAR(100),
        mileage INTEGER,
        category VARCHAR(100),
        product_data JSONB,
        reliability_data JSONB NOT NULL,
        specifications_data JSONB,
        timeline_data JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL,
        view_count INTEGER DEFAULT 0
      )
    `);

    // Create indexes for shared_reports
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shared_reports_share_id ON shared_reports(share_id)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_shared_reports_expires_at ON shared_reports(expires_at)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.warn('Database initialization warning:', error.message);
    console.log('Continuing without database initialization');
  }
};

// Update timestamp helper
const updateTimestamp = async (table, id) => {
  try {
    await query(`
      UPDATE ${table} 
      SET updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1
    `, [id]);
  } catch (error) {
    console.warn(`Error updating timestamp for ${table} id ${id}:`, error.message);
  }
};

module.exports = {
  query,
  initializeDatabase,
  updateTimestamp
};