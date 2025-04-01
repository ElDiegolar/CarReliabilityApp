// scripts/init-db.js - Database initialization script
const { initializeDatabase } = require('../lib/database.js');

(async () => {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
})();