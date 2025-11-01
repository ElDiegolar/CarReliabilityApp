// pages/api/admin/users/[userId]/delete.js - Delete user

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware to authenticate admin access
function authenticateAdmin(req, res, next) {
  const { adminPassword } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CarReliability2025Admin!';
  
  if (!adminPassword || adminPassword !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Invalid admin password' });
  }
  
  next();
}

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  // Authenticate admin
  try {
    await new Promise((resolve, reject) => {
      authenticateAdmin(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  } catch (error) {
    return; // Response already sent by authenticateAdmin
  }

  try {
    // Delete related data first (foreign key constraints)
    await pool.query('DELETE FROM user_preferences WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM saved_vehicles WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM searches WHERE user_id = $1', [userId]);
    
    // Delete the user
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}