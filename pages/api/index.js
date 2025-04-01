// pages/api/index.js
export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
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
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
