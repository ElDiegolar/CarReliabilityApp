// api/test.js
export default function handler(req, res) {
    res.status(200).json({
      status: 'success',
      message: 'API is working!',
      timestamp: new Date().toISOString()
    });
  }