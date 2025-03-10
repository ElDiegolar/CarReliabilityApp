// server/server.js - Express server with SQLite integration and user management
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const sqlite3 = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(cors({
  origin: "*",  // Allow all domains (restrict in production)
  methods: "GET,POST,OPTIONS,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// SQLite Configuration
const dbPath = path.join(__dirname, 'car_reliability.db');
const db = sqlite3(dbPath, { verbose: console.log });

// Initialize the database tables if they don't exist
function initializeDatabase() {
  try {
    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create subscriptions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan TEXT NOT NULL,
        status TEXT NOT NULL,
        stripe_session_id TEXT,
        stripe_customer_id TEXT,
        access_token TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    // Create searches table
    db.exec(`
      CREATE TABLE IF NOT EXISTS searches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        year TEXT,
        make TEXT,
        model TEXT,
        mileage TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Initialize database on startup
initializeDatabase();

// Helper function to update timestamp
function updateTimestamp(table, id) {
  const now = new Date().toISOString();
  db.prepare(`UPDATE ${table} SET updated_at = ? WHERE id = ?`).run(now, id);
}

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Check subscription status middleware
const checkSubscription = (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  
  try {
    const now = new Date().toISOString();
    
    const subscription = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? AND status = ? 
      AND (expires_at IS NULL OR expires_at > ?)
    `).get(req.user.id, 'active', now);
    
    if (!subscription) {
      req.isPremium = false;
    } else {
      req.isPremium = true;
      req.subscription = subscription;
    }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Register a new user
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = db.prepare('INSERT INTO users (email, password) VALUES (?, ?)').run(email, hashedPassword);
    const userId = result.lastInsertRowid;
    
    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: userId, email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Get user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Get subscription status
    const now = new Date().toISOString();
    const subscription = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? AND status = ? 
      AND (expires_at IS NULL OR expires_at > ?)
    `).get(user.id, 'active', now);
    
    const isPremium = !!subscription;
    
    res.status(200).json({
      user: { id: user.id, email: user.email },
      token,
      isPremium,
      subscription
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile and subscription status
app.get('/api/profile', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get subscription status
    const now = new Date().toISOString();
    const subscription = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE user_id = ? AND status = ? 
      AND (expires_at IS NULL OR expires_at > ?)
    `).get(user.id, 'active', now);
    
    const isPremium = !!subscription;
    
    res.status(200).json({
      user,
      isPremium,
      subscription
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Handle successful payment verification and token generation
app.post('/api/payment/verify', authenticateToken, (req, res) => {
  const { sessionId, plan } = req.body;
  
  if (!sessionId || !plan) {
    return res.status(400).json({ error: 'Session ID and plan are required' });
  }
  
  try {
    // In a real implementation, you would verify the Stripe session
    // Here we're just trusting the sessionId and creating a subscription
    
    // Generate a unique access token
    const accessToken = uuidv4();
    
    // Find existing subscription
    const existingSubscription = db.prepare('SELECT * FROM subscriptions WHERE user_id = ? AND plan = ?')
      .get(req.user.id, plan);
    
    if (existingSubscription) {
      // Update existing subscription
      db.prepare(`
        UPDATE subscriptions 
        SET status = ?, stripe_session_id = ?, access_token = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run('active', sessionId, accessToken, existingSubscription.id);
    } else {
      // Create new subscription
      db.prepare(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, access_token) 
        VALUES (?, ?, ?, ?, ?)
      `).run(req.user.id, plan, 'active', sessionId, accessToken);
    }
    
    res.status(200).json({
      message: 'Payment verified successfully',
      accessToken,
      plan
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Verify premium token for non-authenticated users
app.post('/api/verify-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    // Check if token exists in any active subscription
    const now = new Date().toISOString();
    const subscription = db.prepare(`
      SELECT * FROM subscriptions 
      WHERE access_token = ? AND status = ? 
      AND (expires_at IS NULL OR expires_at > ?)
    `).get(token, 'active', now);
    
    if (!subscription) {
      return res.status(401).json({ 
        isPremium: false,
        message: 'Invalid or expired token'
      });
    }
    
    res.status(200).json({
      isPremium: true,
      plan: subscription.plan,
      message: 'Token verified successfully'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// API endpoint to get car reliability data
app.post('/api/car-reliability', async (req, res) => {
  try {
    console.log('Hit API');
    const { year, make, model, mileage, premiumToken, userId } = req.body;

    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Year, make, and model are required' });
    }

    // Check if premium based on token
    let isPremium = false;
    let user_id = null;
    
    
    if (premiumToken) {
      // Verify token
      const now = new Date().toISOString();
      const subscription = db.prepare(`
        SELECT user_id FROM subscriptions 
        WHERE access_token = ? AND status = ? 
        AND (expires_at IS NULL OR expires_at > ?)
      `).get(premiumToken, 'active', now);
      
      if (subscription) {
        isPremium = true;
        user_id = subscription.user_id;
      }
    } else if (userId) {
      // If user is authenticated but no token provided
      user_id = userId;
      
      // Check if user has active subscription
      const now = new Date().toISOString();
      const subscription = db.prepare(`
        SELECT id FROM subscriptions 
        WHERE user_id = ? AND status = ? 
        AND (expires_at IS NULL OR expires_at > ?)
      `).get(userId, 'active', now);
      
      if (subscription) {
        isPremium = true;
      }
    }
    
    // Log the search
    if (user_id) {
      db.prepare(`
        INSERT INTO searches (user_id, year, make, model, mileage) 
        VALUES (?, ?, ?, ?, ?)
      `).run(user_id, year, make, model, mileage);
    }

    // Construct prompt for ChatGPT
    const prompt = `
      Given the following vehicle details:

      Year: ${year}
      Make: ${make}
      Model: ${model}
      Mileage: ${mileage}
      Overall Score: Provide a reliability score between 1 and 100.
      Average Price: Provide an average price for this vehicle in USD.
      Categories: Provide reliability scores (each between 1 and 100) for the following categories:
      - Engine
      - Transmission
      - Electrical System
      - Brakes
      - Suspension
      - Fuel System
      Common Issues: List known problem areas that might occur with this vehicle, along with potential cost to fix in USD. 
      Add reference to the number of these issues found.
      Mileage: Provide an estimate of the mileage at which these issues typically occur.
      AI Analysis: Mention any important recall issues and write a detailed paragraph analyzing the overall reliability of the vehicle. 
      Mention how it compares to similar cars in its class, note any major concerns, and highlight any particular strengths. 
      Provide supporting sources for your determinations.

      Output the response in JSON format with the following structure:

      {
        "overallScore": 0,
        "categories": {
          "engine": 0,
          "transmission": 0,
          "electricalSystem": 0,
          "brakes": 0,
          "suspension": 0,
          "fuelSystem": 0
        },
        "commonIssues":[
          {description: [description of issue here], costToFix: [cost to fix here in $], occurrence: [occurrences you found], mileage: [mileage at which issue occurs]},
        ],
        "aiAnalysis": ""
      }

      Please ensure the JSON is valid and follows the exact key structure above.
    `;

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an automotive expert assistant that provides detailed and accurate reliability information about vehicles. Return all responses as properly formatted JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2, // Lower temperature for more factual responses
      });

      // Extract and parse the response
      const responseText = completion.data.choices[0].message.content.trim();
      
      let reliabilityData;
      
      try {
        // Extract JSON if it's wrapped in code blocks
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                          responseText.match(/```\n([\s\S]*)\n```/) ||
                          [null, responseText];

        reliabilityData = JSON.parse(jsonMatch[1]);
        
        // If not premium, limit the data
        if (!isPremium) {
          // Provide limited data for free users
          reliabilityData = {
            overallScore: reliabilityData.overallScore,
            categories: {
              engine: reliabilityData.categories.engine,
              transmission: reliabilityData.categories.transmission,
              // Limit other categories for free users
              electricalSystem: null,
              brakes: null,
              suspension: null,
              fuelSystem: null
            },
            // No common issues for free users
            commonIssues: [],
            aiAnalysis: "Upgrade to premium for full analysis",
            isPremium: false
          };
        } else {
          // Add premium flag for paid users
          reliabilityData.isPremium = true;
        }
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return res.status(500).json({ 
          error: 'Failed to parse reliability data',
          rawResponse: responseText
        });
      }

      res.json(reliabilityData);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError.message);
      
      // Fallback to mock data if OpenAI API fails
      console.log('Using fallback data');
      const reliabilityData = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        categories: {
          engine: Math.floor(Math.random() * 30) + 70,
          transmission: Math.floor(Math.random() * 30) + 70,
          electricalSystem: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
          brakes: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
          suspension: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
          fuelSystem: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
        },
        commonIssues: isPremium ? [
          {
            description: `${make} ${model} transmission issues reported after 60,000 miles`,
            costToFix: "$1,500-$3,000",
            occurrence: "15% of vehicles",
            mileage: "60,000-80,000 miles"
          },
          {
            description: "Electrical system problems in cold weather",
            costToFix: "$200-$800",
            occurrence: "8% of vehicles",
            mileage: "Any mileage"
          }
        ] : [],
        aiAnalysis: isPremium 
          ? `The ${year} ${make} ${model} shows generally good reliability with some minor concerns. Compared to similar vehicles in its class, it ranks above average for long-term dependability. Owners report high satisfaction with engine performance and fuel economy, while some report issues with the transmission after extended use. Regular maintenance appears to prevent most common problems.`
          : "Upgrade to premium for full analysis",
        isPremium: isPremium
      };

      return res.json(reliabilityData);
    }
  } catch (error) {
    console.error('General API Error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve reliability data',
      message: error.message
    });
  }
});

// Create a test route for GET requests (easier to test in browser)
app.get('/api/test-get', (req, res) => {
  res.json({
    message: "GET endpoint is working!",
    timestamp: new Date().toISOString()
  });
});

// Default route for the API
app.get('/api', (req, res) => {
  res.json({
    message: "Car Reliability API is running",
    version: "1.0.0",
    endpoints: [
      "/api/register", 
      "/api/login", 
      "/api/profile", 
      "/api/payment/verify", 
      "/api/verify-token", 
      "/api/car-reliability"
    ]
  });
});

// Get user's search history
app.get('/api/user/searches', authenticateToken, (req, res) => {
  try {
    // Get user's search history
    const searches = db.prepare(`
      SELECT * FROM searches 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 10
    `).all(req.user.id);
    
    res.status(200).json(searches);
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});
// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;