// pages/api/verify-token.js - Token verification API route
import jwt from 'jsonwebtoken';
import { query } from '../../lib/database';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract token from authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ valid: false, error: 'No token provided' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Check if user exists in database
    const userResult = await query('SELECT id FROM users WHERE id = $1', [decoded.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ valid: false, error: 'User not found' });
    }
    
    // Token is valid
    return res.status(200).json({ valid: true, userId: decoded.id });
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ valid: false, error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: 'Token expired' });
    }
    
    return res.status(500).json({ valid: false, error: 'Failed to verify token' });
  }
}