// pages/api/users/index.js - Admin users API route
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

async function handler(req, res) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // In a real implementation, check if user has admin privileges
    const isAdmin = true; // Replace with actual admin check in production
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions to access user data' });
    }
    
    // Retrieve all users with limited fields for security
    const usersResult = await query(
      'SELECT id, email, created_at, updated_at FROM users ORDER BY id'
    );
    
    const userCount = usersResult.rows.length;
    
    res.status(200).json({
      count: userCount,
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
}

// Wrap handler with authentication middleware
export default withAuth(handler);