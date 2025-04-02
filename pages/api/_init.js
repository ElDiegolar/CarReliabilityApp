// pages/api/_init.js
import { initializeDatabase } from '../../lib/database';

export const config = {
  runtime: 'nodejs', // ✅ changed from 'edge'
};

export default async function handler(req, res) {
  try {
    await initializeDatabase();
    console.log('Database initialized from API route');
    return res.status(200).json({ initialized: true });
  } catch (error) {
    console.error('Failed to initialize database from API route:', error);
    return res.status(500).json({ error: 'Initialization failed' });
  }
}