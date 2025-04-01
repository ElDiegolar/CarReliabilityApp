// pages/api/_init.js
import { initializeDatabase } from '../../lib/database';

export const config = {
  runtime: 'edge',
};

(async () => {
  try {
    await initializeDatabase();
    console.log('Database initialized from API route');
  } catch (error) {
    console.error('Failed to initialize database from API route:', error);
  }
});

export default function handler(req) {
  return new Response(JSON.stringify({ initialized: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
