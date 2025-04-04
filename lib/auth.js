// lib/auth.js
import jwt from 'jsonwebtoken';

export function withAuth(handler) {
  return async function(req, res) {
    try {
      // Extract token from authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Attach user to request
      req.user = decoded;
      
      // Continue to the handler
      return handler(req, res);
    } catch (error) {
      // If token expired or invalid, return auth error
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Authentication required', message: 'Your session has expired. Please log in again.' });
      }
      
      // For other errors, continue to the error handler
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Authentication error' });
    }
  };
}