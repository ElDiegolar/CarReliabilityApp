// pages/api/profile.js - User profile API route
import { withAuth } from '../../lib/auth';
import { query } from '../../lib/database';

async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const userResult = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get subscription status
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = !!subscription;
    
    res.status(200).json({
      user,
      isPremium,
      subscription
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

// Wrap handler with authentication middleware
export default withAuth(handler);