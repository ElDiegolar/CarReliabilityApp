// pages/api/_init.js
import { initializeDatabase } from '../../lib/database';

// Initialize database on server startup
(async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized from API route');
  } catch (error) {
    console.error('Failed to initialize database from API route:', error);
  }
})();

export default function handler(req, res) {
  res.status(200).json({ initialized: true });
}