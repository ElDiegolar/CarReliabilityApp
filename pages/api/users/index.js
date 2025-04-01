// pages/api/users/index.js - Admin users API route for Edge Functions
import { withAuthEdge } from '../../../lib/auth'; // Adjusted to Edge-compatible auth handler
import { queryEdge } from '../../../lib/database'; // Adjusted for Edge-compatible database access

export const config = {
  runtime: 'edge', // Ensure this API route runs on Edge
};

async function handler(req) {
  // Only accept GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
    });
  }

  try {
    // In a real implementation, check if user has admin privileges
    const isAdmin = true; // Replace with actual admin check in production
    
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
      });
    }

    // Retrieve all users with limited fields for security
    const usersResult = await queryEdge(
      'SELECT id, email, created_at, updated_at FROM users ORDER BY id'
    );

    const userCount = usersResult.rows.length;

    return new Response(
      JSON.stringify({
        count: userCount,
        users: usersResult.rows,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve users' }), {
      status: 500,
    });
  }
}

// Wrap handler with Edge-compatible authentication middleware
export default withAuthEdge(handler);
