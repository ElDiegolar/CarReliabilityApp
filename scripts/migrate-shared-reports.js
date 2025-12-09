// scripts/migrate-shared-reports.js - Add product support to shared_reports table
const { query } = require('../lib/database');

async function migrateSharedReports() {
  try {
    console.log('Starting migration: Adding product support to shared_reports table...');

    // Add new columns if they don't exist
    await query(`
      ALTER TABLE shared_reports 
      ADD COLUMN IF NOT EXISTS report_type VARCHAR(20) DEFAULT 'vehicle',
      ADD COLUMN IF NOT EXISTS category VARCHAR(100),
      ADD COLUMN IF NOT EXISTS product_data JSONB;
    `);

    // Make vehicle-specific columns nullable for product reports
    await query(`
      ALTER TABLE shared_reports 
      ALTER COLUMN year DROP NOT NULL,
      ALTER COLUMN make DROP NOT NULL,
      ALTER COLUMN model DROP NOT NULL;
    `);

    console.log('✓ Migration completed successfully!');
    console.log('✓ Added report_type, category, and product_data columns');
    console.log('✓ Made vehicle columns nullable');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSharedReports();
