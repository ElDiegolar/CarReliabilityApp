// pages/api/user/searches.js
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user subscription information to determine history limit
    const userResult = await query(
      'SELECT id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check subscription type
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT us.*, sp.name as plan_name 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = $2
        AND (us.current_period_end IS NULL OR us.current_period_end > $3)
    `, [req.user.id, 'active', now]);

    const subscription = subscriptionResult.rows[0];
    const isProfessional = subscription && subscription.plan_name === 'professional';
    
    // Determine search limit based on subscription
    let searchLimit = 10; // Default limit for premium users
    let limitClause = 'LIMIT 10';
    
    if (isProfessional) {
      searchLimit = 1000; // Very high limit for professional users
      limitClause = 'LIMIT 1000';
    }

    // Get search history
    const searchesResult = await query(`
      SELECT * FROM searches 
      WHERE user_id = $1 
      ORDER BY created_at DESC
      ${limitClause}
    `, [req.user.id]);

    // Return searches with plan info
    return res.status(200).json(searchesResult.rows);
  } catch (error) {
    console.error('Search history error:', error);
    return res.status(500).json({ error: 'Failed to fetch search history' });
  }
}

export default withAuth(handler);