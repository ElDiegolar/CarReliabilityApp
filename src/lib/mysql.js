// src/lib/mysql.js - MySQL Database Connection Module

const mysql = require('serverless-mysql');
require('dotenv').config();

// Initialize the MySQL connection
const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    ssl: process.env.NODE_ENV === 'production' ? {} : undefined
  }
});

// Helper function to execute SQL queries
async function executeQuery({ query, values = [] }) {
  try {
    // Run the query and get results
    const results = await db.query(query, values);
    
    // Release the connection
    await db.end();
    
    // Return the results
    return results;
  } catch (error) {
    // Log any errors and rethrow
    console.error('Database query error:', error);
    throw error;
  }
}

// Initialize database tables if they don't exist
async function initializeDatabase() {
  try {
    // Create users table
    await executeQuery({
      query: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `
    });
    
    // Create subscriptions table
    await executeQuery({
      query: `
        CREATE TABLE IF NOT EXISTS subscriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          plan VARCHAR(50) NOT NULL,
          status VARCHAR(20) NOT NULL,
          stripe_session_id VARCHAR(255),
          stripe_customer_id VARCHAR(255),
          access_token VARCHAR(255) UNIQUE,
          expires_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `
    });
    
    // Create searches table
    await executeQuery({
      query: `
        CREATE TABLE IF NOT EXISTS searches (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          year VARCHAR(10),
          make VARCHAR(100),
          model VARCHAR(100),
          mileage VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `
    });
    
    // Create indexes for better performance
    await executeQuery({
      query: `CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);`
    });
    
    await executeQuery({
      query: `CREATE INDEX IF NOT EXISTS idx_subscriptions_access_token ON subscriptions(access_token);`
    });
    
    await executeQuery({
      query: `CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);`
    });
    
    console.log('MySQL database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Export the database utilities
module.exports = {
  query: executeQuery,
  db,
  initializeDatabase
};