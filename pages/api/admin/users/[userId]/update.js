// pages/api/admin/users/[userId]/update.js - Update user information

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
  const { email, name, phone, preferences } = req.body;

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
    // Update user basic information
    const userResult = await pool.query(
      'UPDATE users SET email = $1, name = $2, phone = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [email, name, phone, userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update user preferences if provided
    if (preferences) {
      const { newCarAlerts, recallAlerts, marketingEmails } = preferences;
      
      // Check if preferences exist
      const prefCheck = await pool.query(
        'SELECT * FROM user_preferences WHERE user_id = $1',
        [userId]
      );
      
      if (prefCheck.rows.length === 0) {
        // Create preferences
        await pool.query(
          'INSERT INTO user_preferences (user_id, new_car_alerts, recall_alerts, marketing_emails, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())',
          [userId, newCarAlerts, recallAlerts, marketingEmails]
        );
      } else {
        // Update preferences
        await pool.query(
          'UPDATE user_preferences SET new_car_alerts = $1, recall_alerts = $2, marketing_emails = $3, updated_at = NOW() WHERE user_id = $4',
          [newCarAlerts, recallAlerts, marketingEmails, userId]
        );
      }
    }
    
    res.json({ 
      success: true, 
      user: userResult.rows[0],
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
}