// scripts/migrate-to-products.js - Database migration for product-agnostic schema
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration to product-agnostic schema...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. Create new product_searches table
    console.log('Creating product_searches table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_searches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        product_data JSONB NOT NULL,
        product_name VARCHAR(500),
        results JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 2. Create saved_products table
    console.log('Creating saved_products table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS saved_products (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category VARCHAR(50) NOT NULL,
        product_data JSONB NOT NULL,
        product_name VARCHAR(500),
        reliability_data JSONB,
        specifications_data JSONB,
        timeline_data JSONB,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 3. Migrate data from searches to product_searches (if searches table exists)
    console.log('Checking for existing searches table...');
    const searchesTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'searches'
      )
    `);
    
    if (searchesTableCheck.rows[0].exists) {
      console.log('Migrating data from searches to product_searches...');
      await client.query(`
        INSERT INTO product_searches (user_id, category, product_data, product_name, results, created_at)
        SELECT 
          user_id,
          'automotive' as category,
          jsonb_build_object(
            'year', year,
            'make', make,
            'model', model,
            'mileage', mileage
          ) as product_data,
          CONCAT(year, ' ', make, ' ', model) as product_name,
          results,
          created_at
        FROM searches
        WHERE NOT EXISTS (
          SELECT 1 FROM product_searches ps
          WHERE ps.user_id = searches.user_id
          AND ps.created_at = searches.created_at
        )
      `);
      console.log('Migration from searches completed');
    }
    
    // 4. Migrate data from saved_vehicles to saved_products (if saved_vehicles table exists)
    console.log('Checking for existing saved_vehicles table...');
    const savedVehiclesCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'saved_vehicles'
      )
    `);
    
    if (savedVehiclesCheck.rows[0].exists) {
      console.log('Migrating data from saved_vehicles to saved_products...');
      await client.query(`
        INSERT INTO saved_products (
          user_id, category, product_data, product_name,
          reliability_data, specifications_data, timeline_data, notes,
          created_at, updated_at
        )
        SELECT 
          user_id,
          'automotive' as category,
          jsonb_build_object(
            'year', year,
            'make', make,
            'model', model,
            'mileage', mileage
          ) as product_data,
          CONCAT(year, ' ', make, ' ', model) as product_name,
          reliability_data,
          specifications_data,
          timeline_data,
          notes,
          created_at,
          updated_at
        FROM saved_vehicles
        WHERE NOT EXISTS (
          SELECT 1 FROM saved_products sp
          WHERE sp.user_id = saved_vehicles.user_id
          AND sp.created_at = saved_vehicles.created_at
        )
      `);
      console.log('Migration from saved_vehicles completed');
    }
    
    // 5. Create indexes for better performance
    console.log('Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_searches_user_id 
      ON product_searches(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_searches_category 
      ON product_searches(category)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_product_searches_created_at 
      ON product_searches(created_at DESC)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_products_user_id 
      ON saved_products(user_id)
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_saved_products_category 
      ON saved_products(category)
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Database migration completed successfully!');
    console.log('');
    console.log('Summary:');
    console.log('- Created product_searches table');
    console.log('- Created saved_products table');
    console.log('- Migrated existing data (if any)');
    console.log('- Created performance indexes');
    console.log('');
    console.log('Note: Old tables (searches, saved_vehicles) are preserved for safety.');
    console.log('You can manually drop them after verifying the migration.');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migration
migrateDatabase()
  .then(() => {
    console.log('Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
