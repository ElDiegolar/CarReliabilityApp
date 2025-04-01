// pages/api/index.js - Main API endpoint
export default function handler(req, res) {
    // Only accept GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    res.json({
      message: "Car Reliability API is running",
      version: "1.0.0",
      endpoints: [
        "/api/register", 
        "/api/login", 
        "/api/profile", 
        "/api/payment/verify", 
        "/api/verify-token", 
        "/api/car-reliability",
        "/api/users",
        "/api/user/searches"
      ]
    });
  }