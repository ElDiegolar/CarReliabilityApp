// pages/api/saved-vehicles/get-one.js
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

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Vehicle ID is required' });
  }

  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Get the saved vehicle details, ensuring it belongs to the current user
    const savedVehicleResult = await query(
      `SELECT id, year, make, model, mileage, reliability_data, saved_at
       FROM saved_vehicles 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
    
    if (savedVehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Saved vehicle not found or you do not have permission to access it' });
    }
    
    const savedVehicle = savedVehicleResult.rows[0];
    
    return res.status(200).json({
      savedVehicle
    });
  } catch (error) {
    console.error('Error fetching saved vehicle:', error);
    return res.status(500).json({ error: 'Failed to fetch saved vehicle details' });
  }
}

export default withAuth(handler);