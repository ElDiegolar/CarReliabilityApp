// pages/api/user/searches.js
import { withAuth } from '../../lib/auth';
import { query } from '../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // First, get table structure to find the timestamp column
    const tableStructureResult = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'searches'
    `);
    
    const columns = tableStructureResult.rows.map(row => row.column_name);
    console.log('Available columns in searches table:', columns);
    
    // Determine which column to use for timestamp
    let timestampColumn = 'timestamp'; // Default fallback
    
    if (columns.includes('created_at')) {
      timestampColumn = 'created_at';
    } else if (columns.includes('search_date')) {
      timestampColumn = 'search_date';
    } else if (columns.includes('date')) {
      timestampColumn = 'date';
    }
    
    // Check user subscription for limit determination
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT us.*, sp.name as plan_name 
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 AND us.status = $2
        AND (us.current_period_end IS NULL OR us.current_period_end > $3)
    `, [req.user.id, 'active', now]);

    const subscription = subscriptionResult.rows[0];
    const isProfessional = subscription && subscription.plan_name === 'professional';
    
    // Determine search limit based on subscription
    let limitClause = isProfessional ? 'LIMIT 1000' : 'LIMIT 10';

    // Get search history with correct column for ordering
    const searchesQuery = `
      SELECT * FROM searches 
      WHERE user_id = $1 
      ORDER BY ${timestampColumn} DESC
      ${limitClause}
    `;
    
    console.log('Executing query:', searchesQuery);
    const searchesResult = await query(searchesQuery, [req.user.id]);

    // Add a timestamp property to each search for the frontend
    const processedSearches = searchesResult.rows.map(search => {
      return {
        ...search,
        timestamp: search[timestampColumn], // Add a standardized timestamp field
      };
    });

    return res.status(200).json(processedSearches);
  } catch (error) {
    console.error('Search history error:', error);
    return res.status(500).json({ error: 'Failed to fetch search history', message: error.message });
  }
}

export default withAuth(handler);