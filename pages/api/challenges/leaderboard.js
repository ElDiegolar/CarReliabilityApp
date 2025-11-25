// pages/api/challenges/leaderboard.js - Get challenge leaderboard
import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { challengeId } = req.query;

  try {
    // Get top performers this week
    const result = await query(
      `SELECT 
        u.id, u.username, u.avatar,
        COUNT(cs.id) as submission_count,
        SUM(CASE WHEN cs.score < 60 THEN 50 ELSE CASE WHEN cs.score < 70 THEN 25 ELSE 10 END END) as points,
        json_build_object(
          'year', cs.vehicle_year,
          'make', cs.vehicle_make,
          'model', cs.vehicle_model
        ) as lastCar
      FROM users u
      LEFT JOIN challenge_submissions cs ON u.id = cs.user_id
      WHERE cs.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY u.id, u.username, u.avatar, cs.vehicle_year, cs.vehicle_make, cs.vehicle_model
      ORDER BY points DESC LIMIT 10`,
      []
    );

    res.status(200).json({
      leaderboard: result.rows
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}