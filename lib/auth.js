// lib/auth.js - Authentication functions for Next.js
import jwt from 'jsonwebtoken';
import { query } from './database';

// Authenticate a JWT token from request headers
export const authenticateToken = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return { authenticated: false, error: 'Access token required' };
    }
    
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }
};

// Check subscription status
export const checkSubscription = async (userId) => {
  try {
    // Get current timestamp in ISO format
    const now = new Date().toISOString();
    
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [userId, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    
    if (!subscription) {
      return { isPremium: false };
    } else {
      return { isPremium: true, subscription };
    }
  } catch (error) {
    console.error('Subscription check error:', error);
    throw new Error('Subscription check failed');
  }
};

// Middleware-like function for Next.js API routes
export const withAuth = (handler) => async (req, res) => {
  const authResult = await authenticateToken(req);
  
  if (!authResult.authenticated) {
    return res.status(401).json({ error: authResult.error });
  }
  
  // Add user to request object
  req.user = authResult.user;
  
  // Call the original handler
  return handler(req, res);
};

// Middleware-like function that checks subscription
export const withSubscription = (handler) => async (req, res) => {
  const authResult = await authenticateToken(req);
  
  if (!authResult.authenticated) {
    return res.status(401).json({ error: authResult.error });
  }
  
  // Add user to request object
  req.user = authResult.user;
  
  // Check subscription
  try {
    const subResult = await checkSubscription(req.user.id);
    req.isPremium = subResult.isPremium;
    if (subResult.subscription) {
      req.subscription = subResult.subscription;
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  
  // Call the original handler
  return handler(req, res);
};