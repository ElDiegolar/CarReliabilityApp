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

    // Get subscription information from the user_subscriptions table instead of subscriptions
    const subscriptionResult = await query(`
      SELECT us.*, sp.name as plan_name 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = $2
        AND (us.current_period_end IS NULL OR us.current_period_end > $3)
    `, [user.id, 'active', now]);

    const subscription = subscriptionResult.rows[0] || null;
    const isPremium = !!subscription;

    // Transform subscription data if needed
    let subscriptionData = null;
    if (subscription) {
      subscriptionData = {
        id: subscription.id,
        plan: subscription.plan_name,
        status: subscription.status,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        stripe_customer_id: subscription.stripe_customer_id,
        stripe_subscription_id: subscription.stripe_subscription_id
      };
    }

    return res.status(200).json({
      user,
      isPremium,
      subscription: subscriptionData,
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

export default withAuth(handler);