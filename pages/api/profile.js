// pages/api/profile.js
import { withAuthEdge } from '../../lib/auth'; // Adjusted for Edge-compatible auth handler
import { queryEdge } from '../../lib/database';


export const config = {
  runtime: 'nodejs',
};

async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const userResult = await queryEdge('SELECT id, email, created_at FROM users WHERE id = $1', [req.user.id]);

    if (userResult.rows.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = userResult.rows[0];
    const now = new Date().toISOString();
    const subscriptionResult = await queryEdge(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);

    const subscription = subscriptionResult.rows[0];
    const isPremium = !!subscription;

    return new Response(
      JSON.stringify({ user, isPremium, subscription }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Wrap handler with Edge-compatible authentication middleware
export default withAuthEdge(handler);
