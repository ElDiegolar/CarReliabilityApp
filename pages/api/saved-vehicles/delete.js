// pages/api/saved-vehicles/delete.js
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Vehicle ID is required' });
  }

  try {
    // Get user ID from the authenticated request
    const userId = req.user.id;
    
    // Check if the vehicle belongs to the user
    const checkResult = await query(
      'SELECT id FROM saved_vehicles WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Saved vehicle not found or you do not have permission to delete it' });
    }
    
    // Delete the vehicle
    await query(
      'DELETE FROM saved_vehicles WHERE id = $1',
      [id]
    );
    
    return res.status(200).json({ message: 'Vehicle removed successfully' });
  } catch (error) {
    console.error('Error deleting saved vehicle:', error);
    return res.status(500).json({ error: 'Failed to delete saved vehicle' });
  }
}

export default withAuth(handler);