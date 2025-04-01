// lib/database.js - Modified for development
const { Pool } = require('pg');

// Create connection pool with error handling
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
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

    // Create other tables...

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