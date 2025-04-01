// pages/api/test-get.js - Test API route
export default function handler(req, res) {
    // Only accept GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    res.json({
      message: "GET endpoint is working!",
      timestamp: new Date().toISOString()
    });
  }