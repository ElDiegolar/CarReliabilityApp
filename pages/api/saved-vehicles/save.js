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
    const { year, make, model, mileage, reliability_data } = req.body;
    
    // Validate required fields
    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }
    
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Check if this vehicle is already saved by the user
    const existingResult = await query(
      'SELECT id FROM saved_vehicles WHERE user_id = $1 AND year = $2 AND make = $3 AND model = $4 AND mileage = $5',
      [userId, year, make, model, mileage]
    );
    
    if (existingResult.rows.length > 0) {
      // If it exists, update the existing record
      const savedVehicleId = existingResult.rows[0].id;
      
      await query(
        'UPDATE saved_vehicles SET reliability_data = $1, saved_at = NOW() WHERE id = $2',
        [JSON.stringify(reliability_data), savedVehicleId]
      );
      
      return res.status(200).json({ 
        message: 'Vehicle updated successfully',
        id: savedVehicleId
      });
    }
    
    // If it doesn't exist, insert a new record
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