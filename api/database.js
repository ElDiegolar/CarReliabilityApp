export const config = {
  api: {
    bodyParser: false
  }
};
// api/database.js - PostgreSQL integration with Vercel Postgres
const { createPool  } = require('@vercel/postgres');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new PostgreSQL connection pool
// Note: We're using the Pool class directly, not as a constructor
const pool = new createPool ({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Initialize the database tables if they don't exist
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Create subscriptions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          plan TEXT NOT NULL,
          status TEXT NOT NULL,
          stripe_session_id TEXT,
          stripe_customer_id TEXT,
          access_token TEXT,
          expires_at TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      // Create searches table
      await client.query(`
        CREATE TABLE IF NOT EXISTS searches (
          id SERIAL PRIMARY KEY,
          user_id INTEGER,
          year TEXT,
          make TEXT,
          model TEXT,
          mileage TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);
      
      console.log('PostgreSQL database initialized successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Helper to execute parameterized queries
async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Helper function to update timestamp
async function updateTimestamp(table, id) {
  const now = new Date().toISOString();
  await query(`UPDATE ${table} SET updated_at = $1 WHERE id = $2`, [now, id]);
}

module.exports = {
  initializeDatabase,
  query,
  updateTimestamp,
  pool
};