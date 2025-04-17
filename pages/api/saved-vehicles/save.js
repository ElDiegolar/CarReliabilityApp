// pages/api/saved-vehicles/save.js
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { year, make, model, mileage, reliability_data, saved_id } = req.body;
    
    // Validate required fields
    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }
    
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // If saved_id is provided, check if it exists and belongs to the user
    if (saved_id) {
      const existingResult = await query(
        'SELECT id FROM saved_vehicles WHERE id = $1 AND user_id = $2',
        [saved_id, userId]
      );
      
      if (existingResult.rows.length > 0) {
        // If it exists, update the existing record
        await query(
          'UPDATE saved_vehicles SET year = $1, make = $2, model = $3, mileage = $4, reliability_data = $5, saved_at = NOW() WHERE id = $6',
          [year, make, model, mileage, JSON.stringify(reliability_data), saved_id]
        );
        
        return res.status(200).json({ 
          message: 'Vehicle updated successfully',
          id: saved_id
        });
      }
    }
    
    // Check if a vehicle with the same details exists (excluding saved_id check)
    const existingVehicleResult = await query(
      'SELECT id FROM saved_vehicles WHERE user_id = $1 AND year = $2 AND make = $3 AND model = $4 AND mileage = $5',
      [userId, year, make, model, mileage]
    );
    
    if (existingVehicleResult.rows.length > 0) {
      // If it exists, update the existing record
      const savedVehicleId = existingVehicleResult.rows[0].id;
      
      await query(
        'UPDATE saved_vehicles SET reliability_data = $1, saved_at = NOW() WHERE id = $2',
        [JSON.stringify(reliability_data), savedVehicleId]
      );
      
      return res.status(200).json({ 
        message: 'Vehicle updated successfully',
        id: savedVehicleId
      });
    }
    
    // Before inserting, check if user has reached their limit
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
    let limit = 5; // Default for free users
    
    if (subscriptionPlan === 'premium') {
      limit = 20;
    } else if (subscriptionPlan === 'professional') {
      limit = null; // No limit
    }
    
    if (limit !== null) {
      const countResult = await query(
        'SELECT COUNT(*) as count FROM saved_vehicles WHERE user_id = $1',
        [userId]
      );
      
      const currentCount = parseInt(countResult.rows[0].count);
      
      if (currentCount >= limit) {
        return res.status(403).json({ 
          error: `You can only save up to ${limit} vehicles with your current plan. Please upgrade to save more.`,
          limit: limit,
          count: currentCount
        });
      }
    }
    
    // If no existing record, insert a new one
    const result = await query(
      'INSERT INTO saved_vehicles (user_id, year, make, model, mileage, reliability_data, saved_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id',
      [userId, year, make, model, mileage, JSON.stringify(reliability_data)]
    );
    
    const savedVehicleId = result.rows[0].id;
    
    return res.status(201).json({
      message: 'Vehicle saved successfully',
      id: savedVehicleId
    });
  } catch (error) {
    console.error('Error saving vehicle:', error);
    return res.status(500).json({ error: 'Failed to save vehicle' });
  }
}

export default withAuth(handler);