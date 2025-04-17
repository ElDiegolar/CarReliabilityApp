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
    console.log('Save vehicle request body:', req.body);
    const { year, make, model, mileage, reliability_data } = req.body;
    
    // Validate required fields
    if (!year || !make || !model) {
      return res.status(400).json({ error: 'Missing required vehicle information' });
    }
    
    // Get user ID from the authenticated request
    const userId = req.user.id;
    console.log('User ID:', userId);

    // Get table column information to debug
    const columnsResult = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'saved_vehicles'
    `);
    
    const columns = columnsResult.rows.map(row => row.column_name);
    console.log('Available columns in saved_vehicles table:', columns);
    
    // Check if mileage column exists
    const hasMileageColumn = columns.includes('mileage');
    console.log('Has mileage column:', hasMileageColumn);

    // If the mileage column doesn't exist, try to add it
    if (!hasMileageColumn) {
      try {
        console.log('Attempting to add mileage column...');
        await query(`
          ALTER TABLE saved_vehicles 
          ADD COLUMN mileage INTEGER NOT NULL DEFAULT 0
        `);
        console.log('Mileage column added successfully');
      } catch (alterError) {
        console.error('Error adding mileage column:', alterError);
        // Continue with the operation even if column addition fails
      }
    }

    // Create a query that works regardless of column case (PostgreSQL is case-sensitive in quoted identifiers)
    let insertQuery;
    let insertParams;
    
    // Assuming the issue might be case sensitivity in column names
    if (hasMileageColumn) {
      // Normal case where mileage column exists
      insertQuery = `
        INSERT INTO saved_vehicles (user_id, year, make, model, mileage, reliability_data, saved_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `;
      insertParams = [userId, year, make, model, mileage || 0, JSON.stringify(reliability_data)];
    } else {
      // Fallback - try with column names exactly as they appear in the database
      insertQuery = `
        INSERT INTO saved_vehicles (user_id, year, make, model, reliability_data, saved_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `;
      insertParams = [userId, year, make, model, JSON.stringify(reliability_data)];
    }
    
    console.log('Executing query:', insertQuery);
    console.log('With params:', insertParams);
    
    const result = await query(insertQuery, insertParams);
    
    if (!result || !result.rows || result.rows.length === 0) {
      throw new Error('Failed to insert record - no ID returned');
    }
    
    const savedVehicleId = result.rows[0].id;
    console.log('Saved vehicle with ID:', savedVehicleId);
    
    return res.status(201).json({
      message: 'Vehicle saved successfully',
      id: savedVehicleId
    });
  } catch (error) {
    console.error('Error saving vehicle:', error);
    return res.status(500).json({ 
      error: 'Failed to save vehicle',
      details: error.message
    });
  }
}

export default withAuth(handler);