// pages/api/saved-vehicles/get.js
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Get subscription status to determine if we should limit results
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT sp.name as plan_name
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = $2
        AND (us.current_period_end IS NULL OR us.current_period_end > $3)
    `, [userId, 'active', now]);
    
    const subscriptionPlan = subscriptionResult.rows.length > 0 ? subscriptionResult.rows[0].plan_name : 'free';
    
    // Set limit based on subscription plan
    let limit = null;
    if (subscriptionPlan === 'free') {
      limit = 5; // Free users can only see 5 saved vehicles
    } else if (subscriptionPlan === 'premium') {
      limit = 20; // Premium users can see 20 saved vehicles
    }
    // Professional users have unlimited access (limit = null)
    
    // Fetch saved vehicles with limit if applicable
    let savedVehiclesQuery = `
      SELECT id, year, make, model, mileage, reliability_data, saved_at
      FROM saved_vehicles
      WHERE user_id = $1
      ORDER BY saved_at DESC
    `;
    
    if (limit) {
      savedVehiclesQuery += ` LIMIT ${limit}`;
    }
    
    const savedVehiclesResult = await query(savedVehiclesQuery, [userId]);
    
    return res.status(200).json({
      savedVehicles: savedVehiclesResult.rows,
      subscription: {
        plan: subscriptionPlan,
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error fetching saved vehicles:', error);
    return res.status(500).json({ error: 'Failed to fetch saved vehicles' });
  }
}

export default withAuth(handler);