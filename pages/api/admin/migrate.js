// pages/api/admin/migrate.js - Protected migration endpoint
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple authentication - use a secret key
  const authHeader = req.headers.authorization;
  const expectedAuth = `Bearer ${process.env.MIGRATION_SECRET}`;
  
  if (!authHeader || authHeader !== expectedAuth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting migration: Adding product support to shared_reports table...');
    const results = [];

    // Add report_type column
    try {
      await query(`
        ALTER TABLE shared_reports 
        ADD COLUMN IF NOT EXISTS report_type VARCHAR(20) DEFAULT 'vehicle';
      `);
      results.push('✓ Added report_type column');
    } catch (err) {
      results.push(`report_type: ${err.message}`);
    }

    // Add category column
    try {
      await query(`
        ALTER TABLE shared_reports 
        ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      `);
      results.push('✓ Added category column');
    } catch (err) {
      results.push(`category: ${err.message}`);
    }

    // Add product_data column
    try {
      await query(`
        ALTER TABLE shared_reports 
        ADD COLUMN IF NOT EXISTS product_data JSONB;
      `);
      results.push('✓ Added product_data column');
    } catch (err) {
      results.push(`product_data: ${err.message}`);
    }

    // Make year column nullable
    try {
      await query(`
        ALTER TABLE shared_reports 
        ALTER COLUMN year DROP NOT NULL;
      `);
      results.push('✓ Made year column nullable');
    } catch (err) {
      results.push(`year nullable: ${err.message}`);
    }

    // Make make column nullable
    try {
      await query(`
        ALTER TABLE shared_reports 
        ALTER COLUMN make DROP NOT NULL;
      `);
      results.push('✓ Made make column nullable');
    } catch (err) {
      results.push(`make nullable: ${err.message}`);
    }

    // Make model column nullable
    try {
      await query(`
        ALTER TABLE shared_reports 
        ALTER COLUMN model DROP NOT NULL;
      `);
      results.push('✓ Made model column nullable');
    } catch (err) {
      results.push(`model nullable: ${err.message}`);
    }

    return res.status(200).json({
      success: true,
      message: 'Migration completed',
      results
    });

  } catch (error) {
    console.error('Migration failed:', error);
    return res.status(500).json({ 
      error: 'Migration failed', 
      details: error.message 
    });
  }
}
