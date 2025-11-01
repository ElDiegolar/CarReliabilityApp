// pages/api/admin/auth.js - Admin authentication API route

export default function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'CarReliability2025Admin!';

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    // In a real implementation, you might want to generate a proper JWT token
    // For now, we'll return a simple success response
    const token = Buffer.from(`admin_${Date.now()}`).toString('base64');
    
    res.json({ 
      success: true, 
      token: token,
      message: 'Admin access granted' 
    });
  } else {
    res.status(403).json({ error: 'Invalid admin password' });
  }
}