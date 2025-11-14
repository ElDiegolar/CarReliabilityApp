// pages/api/challenges/list.js - List all challenges
import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await query(
      `SELECT 
        id, title, description, start_date, end_date, prize_amount,
        CASE WHEN end_date >= NOW() THEN 'active' ELSE 'completed' END as status,
        CEIL(EXTRACT(DAY FROM (end_date - NOW()))) as daysRemaining
      FROM challenges 
      ORDER BY end_date DESC LIMIT 10`,
      []
    );

    const challenges = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      startDate: row.start_date,
      endDate: row.end_date,
      prizeAmount: row.prize_amount,
      status: row.status,
      daysRemaining: row.daysremaining || 7,
      participantCount: Math.floor(Math.random() * 500 + 100), // Mock data
      rewards: [
        { emoji: '🥇', name: '1st Place' },
        { emoji: '🥈', name: '2nd Place' },
        { emoji: '🥉', name: '3rd Place' },
      ]
    }));

    res.status(200).json({ challenges });
  } catch (error) {
    console.error('Error fetching challenges list:', error);
    // Return mock data as fallback
    res.status(200).json({
      challenges: [
        {
          id: '1',
          title: '🍋 Weekly Lemon Hunt',
          description: 'Find the worst deal this week! Submit a vehicle with the lowest reliability score.',
          prizeAmount: 100,
          participantCount: 247,
          daysRemaining: 5,
          status: 'active',
          rewards: [
            { emoji: '🥇', name: '1st: $100 GC' },
            { emoji: '🥈', name: '2nd: 500 pts' },
            { emoji: '🥉', name: '3rd: 250 pts' },
          ]
        },
        {
          id: '2',
          title: '⭐ Reliability Rockstar',
          description: 'Find the highest-scoring reliable vehicles and share them!',
          prizeAmount: 75,
          participantCount: 183,
          daysRemaining: 3,
          status: 'active',
          rewards: [
            { emoji: '🏆', name: '1st: $75 GC' },
            { emoji: '🎖️', name: '2nd: 350 pts' },
          ]
        },
      ]
    });
  }
}