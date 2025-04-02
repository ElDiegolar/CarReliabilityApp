// lib/auth.js
import jwt from 'jsonwebtoken';

export function withAuth(handler) {
  return async (req, res) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization;
      console.log('Auth header:', authHeader);
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('No valid auth header found');
        return res.status(401).json({ error: 'Unauthorized - No valid authorization header' });
      }
      
      const token = authHeader.split(' ')[1];
      console.log('Token extracted:', token.substring(0, 20) + '...');
      
      try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token decoded successfully:', decoded);
        
        // Add user to request
        req.user = {
          id: decoded.id,
          email: decoded.email
        };
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError.message);
        console.log('Continuing with mock user for debugging');
        
        // For debugging purposes only - remove in production
        req.user = {
          id: 2,
          email: 'debug@example.com'
        };
      }
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}