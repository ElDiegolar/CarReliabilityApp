// lib/timeline-utils.js
import { query } from './database';

/**
 * Ensures the car_timelines table exists in the database
 */
export async function ensureTimelineTable() {
  try {
    // Check if the table exists
    const tableCheck = await query(`
      SELECT to_regclass('public.car_timelines') as table_exists;
    `);
    
    // If the table doesn't exist, create it
    if (!tableCheck.rows[0].table_exists) {
      console.log('Creating car_timelines table...');
      
      await query(`
        CREATE TABLE car_timelines (
          id SERIAL PRIMARY KEY,
          year VARCHAR(4) NOT NULL,
          make VARCHAR(100) NOT NULL,
          model VARCHAR(100) NOT NULL,
          timeline_data JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(year, make, model)
        );
      `);
      
      console.log('car_timelines table created successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring timeline table:', error);
    // Don't throw, just return false to indicate failure
    // This shouldn't block the main functionality
    return false;
  }
}

/**
 * Gets cached timeline data if it exists
 */
export async function getCachedTimeline(year, make, model) {
  try {
    // Ensure the table exists first
    await ensureTimelineTable();
    
    const cachedResult = await query(`
      SELECT timeline_data FROM car_timelines 
      WHERE year = $1 AND make = $2 AND model = $3
    `, [year, make, model]);
    
    if (cachedResult.rows.length > 0) {
      return cachedResult.rows[0].timeline_data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached timeline:', error);
    return null;
  }
}

/**
 * Saves timeline data to the cache
 */
export async function saveTimelineData(year, make, model, timelineData) {
  try {
    // Ensure the table exists first
    await ensureTimelineTable();
    
    await query(`
      INSERT INTO car_timelines (year, make, model, timeline_data) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (year, make, model) 
      DO UPDATE SET 
        timeline_data = $4,
        updated_at = CURRENT_TIMESTAMP
    `, [year, make, model, JSON.stringify(timelineData)]);
    
    return true;
  } catch (error) {
    console.error('Error saving timeline data:', error);
    return false;
  }
}