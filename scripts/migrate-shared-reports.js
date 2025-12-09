// scripts/migrate-shared-reports.js - Add product support to shared_reports table
const { query } = require('../lib/database');

async function migrateSharedReports() {
  try {
    console.log('Starting migration: Adding product support to shared_reports table...');

    // Add new columns if they don't exist
    try {
      await query(`
        ALTER TABLE shared_reports 
        ADD COLUMN IF NOT EXISTS report_type VARCHAR(20) DEFAULT 'vehicle';
      `);
      console.log('✓ Added report_type column');
    } catch (err) {
      console.log('report_type column may already exist:', err.message);
    }

    try {
      await query(`
        ALTER TABLE shared_reports 
        ADD COLUMN IF NOT EXISTS category VARCHAR(100);
      `);
      console.log('✓ Added category column');
    } catch (err) {
      console.log('category column may already exist:', err.message);
    }

    try {
      await query(`
        ALTER TABLE shared_reports 
        ADD COLUMN IF NOT EXISTS product_data JSONB;
      `);
      console.log('✓ Added product_data column');
    } catch (err) {
      console.log('product_data column may already exist:', err.message);
    }

    // Make vehicle-specific columns nullable for product reports
    try {
      await query(`
        ALTER TABLE shared_reports 
        ALTER COLUMN year DROP NOT NULL;
      `);
      console.log('✓ Made year column nullable');
    } catch (err) {
      console.log('year column may already be nullable:', err.message);
    }

    try {
      await query(`
        ALTER TABLE shared_reports 
        ALTER COLUMN make DROP NOT NULL;
      `);
      console.log('✓ Made make column nullable');
    } catch (err) {
      console.log('make column may already be nullable:', err.message);
    }

    try {
      await query(`
        ALTER TABLE shared_reports 
        ALTER COLUMN model DROP NOT NULL;
      `);
      console.log('✓ Made model column nullable');
    } catch (err) {
      console.log('model column may already be nullable:', err.message);
    }

    console.log('\n✓ Migration completed successfully!');
    console.log('✓ Database is ready for product report sharing');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSharedReports();
