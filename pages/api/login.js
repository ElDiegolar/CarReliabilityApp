import { query } from '../../lib/database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

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
      user: { id: user.id, email: user.email },
      token,
      isPremium,
      subscription,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
}
