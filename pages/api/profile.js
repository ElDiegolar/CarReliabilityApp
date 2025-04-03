// pages/api/profile.js
import { withAuth } from '../../lib/auth';
import { query } from '../../lib/database';

export const config = {
  runtime: 'nodejs',
};
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get basic user information
    const userResult = await query(
      'SELECT id, email, name, created_at, stripe_customer_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const now = new Date().toISOString();

    // Get subscription information directly from the subscriptions table
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2
        AND (current_period_end IS NULL OR current_period_end > $3)
    `, [user.id, 'active', now]);

    const subscription = subscriptionResult.rows[0] || null;
    const isPremium = !!subscription;

    return res.status(200).json({
      user,
      isPremium,
      subscription,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export default withAuth(handler); // ✅ Correct middleware
