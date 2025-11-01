// pages/api/admin/users/[userId]/activity.js - Get user activity details

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
    // Get saved vehicles
    const savedVehicles = await pool.query(
      'SELECT * FROM saved_vehicles WHERE user_id = $1 ORDER BY saved_at DESC',
      [userId]
    );
    
    // Get search history
    const searches = await pool.query(
      'SELECT * FROM searches WHERE user_id = $1 ORDER BY search_date DESC',
      [userId]
    );
    
    res.json({
      savedVehicles: savedVehicles.rows,
      searches: searches.rows
    });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
}