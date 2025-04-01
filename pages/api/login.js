// pages/api/login.js - User login API route
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../lib/database';

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Get user
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
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
      user: { id: user.id, email: user.email },
      token,
      isPremium,
      subscription
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
}