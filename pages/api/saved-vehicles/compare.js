// pages/api/saved-vehicles/compare.js
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vehicleIds } = req.body;
  
  if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0 || vehicleIds.length > 3) {
    return res.status(400).json({ error: 'Please provide 1-3 valid vehicle IDs' });
  }

  try {
    const userId = req.user.id;
    
    // Get vehicles data with a single query
    const placeholders = vehicleIds.map((_, index) => `$${index + 2}`).join(', ');
    const vehiclesResult = await query(
      `SELECT id, year, make, model, mileage, reliability_data
       FROM saved_vehicles 
       WHERE user_id = $1 AND id IN (${placeholders})`,
      [userId, ...vehicleIds]
    );
    
    return res.status(200).json({
      vehicles: vehiclesResult.rows
    });
  } catch (error) {
    console.error('Error fetching vehicles for comparison:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles for comparison' });
  }
}

export default withAuth(handler);