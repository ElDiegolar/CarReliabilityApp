// pages/api/challenges/current.js - Get current weekly challenge
import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get current week's challenge
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() + 6));

    const result = await query(
      `SELECT * FROM challenges 
       WHERE start_date <= $1 AND end_date >= $2 
       ORDER BY created_at DESC LIMIT 1`,
      [new Date(), new Date()]
    );

    if (result.rows.length === 0) {
      // Return default challenge if none exists
      return res.status(200).json({
        id: 'default',
        title: 'Weekly Lemon Hunt',
        description: 'Find the worst deal this week! Submit a vehicle with the lowest reliability score.',
        prizeAmount: 100,
        participantCount: 247,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    const challenge = result.rows[0];
    
    // Get participant count
    const countResult = await query(
      `SELECT COUNT(*) as count FROM challenge_submissions WHERE challenge_id = $1`,
      [challenge.id]
    );

    res.status(200).json({
      ...challenge,
      participantCount: countResult.rows[0].count
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Failed to fetch challenge' });
  }
}