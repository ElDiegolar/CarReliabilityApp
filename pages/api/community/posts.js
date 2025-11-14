// pages/api/community/posts.js - Get community feed posts
import { query } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filter = 'trending', userId } = req.query;

  try {
    let queryStr = `
      SELECT 
        p.id, p.user_id, p.vehicle_year, p.vehicle_make, p.vehicle_model,
        p.score, p.caption, p.image_url, p.tags,
        p.likes_count as likes, p.comments_count as comments, p.shares_count as shares,
        p.created_at,
        u.username, u.avatar,
        CASE 
          WHEN p.created_at > NOW() - INTERVAL '1 hour' THEN '1h ago'
          WHEN p.created_at > NOW() - INTERVAL '1 day' THEN '1d ago'
          WHEN p.created_at > NOW() - INTERVAL '1 week' THEN '1w ago'
          ELSE TO_CHAR(p.created_at, 'Mon DD')
        END as timeAgo
      FROM community_posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.status = 'published'
    `;

    let params = [];

    if (filter === 'trending') {
      queryStr += ` ORDER BY (p.likes_count + p.comments_count * 2 + p.shares_count * 3) DESC, p.created_at DESC LIMIT 20`;
    } else if (filter === 'recent') {
      queryStr += ` ORDER BY p.created_at DESC LIMIT 20`;
    } else if (filter === 'my-network' && userId) {
      // Get posts from users that this user follows
      queryStr += ` AND p.user_id IN (
        SELECT followed_id FROM user_follows WHERE follower_id = $1
      )
      ORDER BY p.created_at DESC LIMIT 20`;
      params = [userId];
    }

    const result = await query(queryStr, params);

    const posts = result.rows.map(row => ({
      id: row.id,
      user: {
        id: row.user_id,
        username: row.username,
        avatar: row.avatar
      },
      vehicle: {
        year: row.vehicle_year,
        make: row.vehicle_make,
        model: row.vehicle_model
      },
      score: row.score,
      caption: row.caption,
      image: row.image_url,
      tags: row.tags || [],
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      timeAgo: row.timeago
    }));

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
}