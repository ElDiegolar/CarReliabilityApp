// pages/api/viral/metrics.js - Get user's viral growth metrics
import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from session/token - this would come from your auth system
    // For now, returning mock data
    const userId = req.query.userId; // In production, extract from token

    // Mock metrics - in production would query database
    const metrics = {
      totalShares: 47,
      sharesThisWeek: 12,
      viralCoefficient: 5.8,
      referralConversions: 8,
      challengeWins: 3,
      leaderboardRank: 24,
      badges: [
        { name: 'Lemon Spotter', icon: '🍋', earnedDate: 'Oct 15' },
        { name: 'Sharpshooter', icon: '🎯', earnedDate: 'Oct 22' },
      ],
      totalPoints: 1240,
      level: 5,
      sharesByPlatform: {
        tiktok: 18,
        twitter: 12,
        reddit: 8,
        facebook: 6,
        instagram: 3
      },
      challengeSubmissions: 15,
      averageChallengeScore: 65,
      challengeWinRate: 20,
    };

    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching viral metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
}