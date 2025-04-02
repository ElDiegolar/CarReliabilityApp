// pages/api/register.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryEdge } from '../../lib/database';

export const config = {
  runtime: 'nodejs', // still fine since you're using pg
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body; // ✅ correct for Node.js API route

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existingUserResult = await queryEdge('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await queryEdge(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, hashedPassword]
    );
    const userId = result.rows[0].id;

    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, email },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
