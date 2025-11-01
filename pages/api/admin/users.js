// pages/api/admin/users.js - Get all users with statistics

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
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.phone, 
        u.created_at, 
        u.updated_at,
        up.new_car_alerts,
        up.recall_alerts,
        up.marketing_emails,
        COUNT(DISTINCT sv.id) as saved_vehicles_count,
        COUNT(DISTINCT s.id) as searches_count
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      LEFT JOIN saved_vehicles sv ON u.id = sv.user_id
      LEFT JOIN searches s ON u.id = s.user_id
      GROUP BY u.id, up.new_car_alerts, up.recall_alerts, up.marketing_emails
      ORDER BY u.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}