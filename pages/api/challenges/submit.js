// pages/api/challenges/submit.js - Submit to challenge
import { query } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { vehicle, story, userId } = req.body;

  if (!vehicle || !story) {
    return res.status(400).json({ error: 'Missing vehicle or story' });
  }

  try {
    // Get current challenge
    const challengeResult = await query(
      `SELECT id FROM challenges 
       WHERE start_date <= NOW() AND end_date >= NOW() 
       ORDER BY created_at DESC LIMIT 1`,
      []
    );

    let challengeId = challengeResult.rows[0]?.id;

    if (!challengeId) {
      // Create a default challenge if none exists
      const newChallenge = await query(
        `INSERT INTO challenges (title, description, start_date, end_date, prize_amount, created_at)
         VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days', $3, NOW())
         RETURNING id`,
        ['Weekly Lemon Hunt', 'Find and share the worst deals', 100]
      );
      challengeId = newChallenge.rows[0].id;
    }

    // Submit to challenge
    const result = await query(
      `INSERT INTO challenge_submissions 
       (challenge_id, user_id, vehicle_year, vehicle_make, vehicle_model, vehicle_mileage, score, story, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING id`,
      [
        challengeId,
        userId || null,
        vehicle.year,
        vehicle.make,
        vehicle.model,
        vehicle.mileage,
        vehicle.score,
        story
      ]
    );

    // Calculate points based on score (lower is better/more points)
    let points = 10;
    if (vehicle.score < 60) points = 50;
    else if (vehicle.score < 70) points = 25;

    res.status(201).json({
      id: result.rows[0].id,
      points
    });
  } catch (error) {
    console.error('Error submitting to challenge:', error);
    res.status(500).json({ error: 'Failed to submit to challenge' });
  }
}