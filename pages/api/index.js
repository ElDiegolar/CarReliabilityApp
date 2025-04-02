// pages/api/index.js

export const config = {
  runtime: 'nodejs',
};

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.status(200).json({
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