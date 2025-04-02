// pages/api/profile.js
import { withAuthEdge } from '../../lib/auth'; // Assume this attaches user to req
import { query } from '../../lib/database'; // ✅ use the correct Node-compatible query

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userResult = await query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const now = new Date().toISOString();

    const subscriptionResult = await query(`
      SELECT us.*, sp.name AS plan_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = $1 AND us.status = $2
        AND (us.current_period_end IS NULL OR us.current_period_end > $3)
    `, [user.id, 'active', now]);

    const subscription = subscriptionResult.rows[0];
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

export default withAuthEdge(handler);
