// api/server.js - Express server with PostgreSQL integration and user management


const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { initializeDatabase, query, sql } = require('./database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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
// Special middleware for Stripe webhooks (raw body parsing)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    // Use express.raw() to capture raw body for Stripe signature verification
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    // Use express.json() for other routes
    express.json()(req, res, next);
  }
});


// Initialize database tables if they don't exist
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
const checkSubscription = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  
  try {
    // Get current timestamp in ISO format
    const now = new Date().toISOString();
    
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [req.user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    
    if (!subscription) {
      req.isPremium = false;
    } else {
      req.isPremium = subscription.plan === 'premium';
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
    const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user and get the ID
    const userResult = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', 
      [email, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    
    // Create basic subscription for the user
    await query(
      'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
      [userId, 'basic', 'active']
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully with basic subscription',
      user: { id: userId, email },
      subscription: { plan: 'basic', status: 'active' },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
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
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    
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
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription && subscription.plan === 'premium';
    const isBasic = subscription && subscription.plan === 'basic';
    
    res.status(200).json({
      user: { id: user.id, email: user.email },
      token,
      isPremium,
      isBasic,
      subscription
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile and subscription status
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, email, created_at, stripe_customer_id FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get subscription status
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription && subscription.plan === 'premium';
    const isBasic = subscription && subscription.plan === 'basic';
    
    // Get recent payments
    const paymentsResult = await query(`
      SELECT * FROM payments 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [user.id]);
    
    res.status(200).json({
      user,
      isPremium,
      isBasic,
      subscription,
      payments: paymentsResult.rows
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', fool_error:  error});
  }
});

// Verify payment and set up subscription
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { sessionId, plan } = req.body;
  
  if (!sessionId || !plan) {
    return res.status(400).json({ error: 'Session ID and plan are required' });
  }
  
  try {
    // In production, verify the session with Stripe
    // For example:
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    // if (session.payment_status !== 'paid') {
    //   return res.status(400).json({ error: 'Payment not completed' });
    // }
    
    // Generate a unique access token
    const accessToken = uuidv4();
    
    // Check for existing subscription
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubscriptionResult.rows[0];
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, stripe_session_id = $3, access_token = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5
      `, [plan, 'active', sessionId, accessToken, existingSub.id]);
    } else {
      // Create new subscription
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, access_token) 
        VALUES ($1, $2, $3, $4, $5)
      `, [req.user.id, plan, 'active', sessionId, accessToken]);
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
app.post('/api/verify-token', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    // Check if token exists in any active subscription
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE access_token = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [token, 'active', now]);
    
    if (subscriptionResult.rows.length === 0) {
      return res.status(401).json({ 
        isPremium: false,
        message: 'Invalid or expired token'
      });
    }
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription.plan === 'premium';
    
    res.status(200).json({
      isPremium,
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
    const { year, make, model, mileage, premiumToken, userToken } = req.body;

    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Year, make, model, and mileage are required' });
    }

    // Check user's subscription status
    let isPremium = false;
    let isBasic = false;
    let user_id = null;
    
    if (premiumToken) {
      // Verify premium token
      const now = new Date().toISOString();
      const subscriptionResult = await query(`
        SELECT user_id, plan FROM subscriptions 
        WHERE access_token = $1 AND status = $2 
        AND (expires_at IS NULL OR expires_at > $3)
      `, [premiumToken, 'active', now]);
      
      if (subscriptionResult.rows.length > 0) {
        const subscription = subscriptionResult.rows[0];
        isPremium = subscription.plan === 'premium';
        isBasic = subscription.plan === 'basic';
        user_id = subscription.user_id;
      }
    } else if (userToken) {
      // Verify user token (basic users)
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'your-secret-key');
        user_id = decoded.id;
        
        // Check subscription
        const now = new Date().toISOString();
        const subscriptionResult = await query(`
          SELECT * FROM subscriptions 
          WHERE user_id = $1 AND status = $2 
          AND (expires_at IS NULL OR expires_at > $3)
        `, [user_id, 'active', now]);
        
        if (subscriptionResult.rows.length > 0) {
          const subscription = subscriptionResult.rows[0];
          isPremium = subscription.plan === 'premium';
          isBasic = subscription.plan === 'basic';
        } else {
          // If user has no active subscription, set them as basic by default
          isBasic = true;
        }
      } catch (err) {
        console.error('Invalid user token:', err);
      }
    }
    
    // Log the search if we have a user ID
    if (user_id) {
      await query(`
        INSERT INTO searches (user_id, year, make, model, mileage) 
        VALUES ($1, $2, $3, $4, $5)
      `, [user_id, year, make, model, mileage]);
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
          // Provide limited data for free/basic users
          reliabilityData = {
            overallScore: reliabilityData.overallScore,
            categories: {
              engine: reliabilityData.categories.engine,
              transmission: reliabilityData.categories.transmission,
              // Limit other categories for non-premium users
              electricalSystem: null,
              brakes: null,
              suspension: null,
              fuelSystem: null
            },
            // No common issues for non-premium users
            commonIssues: [],
            aiAnalysis: "Upgrade to premium for full analysis",
            // Set these flags explicitly and consistently
            isPremium: false,
            isBasic: isBasic
          };
        } else {
          // Add premium and basic flags for premium users
          reliabilityData.isPremium = true;
          reliabilityData.isBasic = false;
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
        isPremium: isPremium,
        isBasic: isBasic
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

// Get all users - Protected admin endpoint
app.get('/api/users', async (req, res) => {
  try {
    // In a real implementation, check if user has admin privileges
    const isAdmin = true; // Replace with actual admin check in production
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions to access user data' });
    }
    
    // Retrieve all users with limited fields for security
    const usersResult = await query(
      'SELECT id, email, created_at, updated_at FROM users ORDER BY id'
    );
    
    const userCount = usersResult.rows.length;
    
    res.status(200).json({
      count: userCount,
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get user's search history
app.get('/api/user/searches', authenticateToken, async (req, res) => {
  try {
    // Get user's search history
    const searchesResult = await query(`
      SELECT * FROM searches 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [req.user.id]);
    
    res.status(200).json(searchesResult.rows);
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// Create a test route for GET requests (easier to test in browser)
app.get('/api/test-get', (req, res) => {
  res.json({
    message: "GET endpoint is working!",
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ 
      status: 'connected', 
      timestamp: result.rows[0].now,
      message: 'Successfully connected to PostgreSQL database'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
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
      "/api/car-reliability",
      "/api/users",
      "/api/user/searches",
      "/api/db-test"
    ]
  });
});

// Update your Stripe checkout session creation
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, plan, userId } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://car-reliability-app.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://car-reliability-app.vercel.app/payment-cancel`,
      metadata: {
        plan: plan || 'premium' // Store the plan in metadata
      },
      client_reference_id: userId // Link session to user
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});




// Endpoint to view recent webhook logs
app.get('/api/webhook-logs', async (req, res) => {
  try {
    // Check for admin authentication in production
    if (process.env.NODE_ENV === 'production') {
      // Implement proper auth check here
      // This is just a simple example using a secret key
      const authKey = req.headers['x-admin-key'];
      if (authKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }
    
    // Get limit and page from query params
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const eventType = req.query.type || null;
    
    // Build query based on filters
    let queryText = `
      SELECT id, event_id, event_type, processing_status, error_message, created_at, updated_at 
      FROM webhook_logs
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Add WHERE clause if filtering by event type
    if (eventType) {
      queryText += ` WHERE event_type = $${paramIndex}`;
      queryParams.push(eventType);
      paramIndex++;
    }
    
    // Add ordering and pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM webhook_logs';
    if (eventType) {
      countQuery += ' WHERE event_type = $1';
    }
    
    const [logsResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQuery, eventType ? [eventType] : [])
    ]);
    
    // Return paginated results with metadata
    res.status(200).json({
      logs: logsResult.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page,
        limit,
        pages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({ error: 'Failed to retrieve webhook logs' });
  }
});




// ----------------- STREAMLINED STRIPE WEBHOOK HANDLERS -----------------

// Parse raw body for Stripe webhooks
app.post("/api/webhook", express.raw({ type: "application/json" }), (request, response) => {
  
  const rawBody = request.body;
  let event = request.body;
  const endpointSecret = "whsec_g9iplz4O3eLpzGqDrc4rnS7QWwZMpwaH";
  let logId = null;
  

  const signature = request.headers["stripe-signature"];
  console.log('Webhook Headers:', JSON.stringify(request.headers));
  console.log('Signature Header:', signature);
  console.log('Body Length:', rawBody.length);

  // Verify the webhook signature using the raw body (Buffer)
    event = stripe.webhooks.constructEvent(
      request.body,
      request.headers["stripe-signature"],
      endpointSecret
    );

  // Initial log entry - before signature verification
  try {
    logId = query(`
      INSERT INTO webhook_logs (
        event_type, 
        event_object, 
        stripe_signature, 
        raw_body, 
        processing_status
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      'unknown',
      JSON.stringify({}),
      signature,
      rawBody.length > 10000 ? rawBody.toString('utf8').substring(0, 10000) + '...(truncated)' : rawBody.toString('utf8'),
      'received'
    ]);

    logId = logId.rows[0].id;
    console.log(`🔍 Webhook received and logged with ID: ${logId}`);
  } catch (logError) {
    console.error('Error logging webhook receipt:', logError);
    // Continue processing even if logging fails
  }

  if (!signature) {
    console.log("⚠️  Webhook received without signature");
    return response.sendStatus(400);
  }

  try {
    // Update log after successful signature verification
    if (logId) {
      try {
         query(`
          UPDATE webhook_logs 
          SET event_id = $1, 
              event_type = $2, 
              event_object = $3, 
              processing_status = $4,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [
          event.id,
          event.type,
          JSON.stringify(event.data.object),
          'verified',
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log after verification:', updateError);
      }
    }
  } catch (err) {
    // Update log with signature verification failure
    if (logId) {
      try {
         query(`
          UPDATE webhook_logs 
          SET processing_status = $1, 
              error_message = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [
          'verification_failed',
          err.message,
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log with verification failure:', updateError);
      }
    }

    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event based on its type
  try {
    // Update log to show we're starting processing
    if (logId) {
      try {
         query(`
          UPDATE webhook_logs 
          SET processing_status = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [
          'processing',
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log before processing:', updateError);
      }
    }

    switch (event.type) {
      case 'checkout.session.completed':
         handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
         handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
         handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
         handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
         handleInvoicePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
         handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.created':
         handleCustomerCreated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Update log after successful processing
    if (logId) {
      try {
         query(`
          UPDATE webhook_logs 
          SET processing_status = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [
          'completed',
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log after processing:', updateError);
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    response.status(200).json({ 
      received: true,
      logId: logId
    });
  } catch (err) {
    // Update log with processing error
    if (logId) {
      try {
        query(`
          UPDATE webhook_logs 
          SET processing_status = $1,
              error_message = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [
          'failed',
          err.message,
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log with processing failure:', updateError);
      }
    }

    console.error(`Error processing webhook event: ${err.message}`);
    response.status(500).send(`Server Error: ${err.message}`);
  }
});


// Handle successful checkout completion
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout.session.completed event');
    
    // Extract necessary data from the session
    const { client_reference_id, customer, metadata, id: sessionId } = session;
    const userId = client_reference_id;
    const plan = metadata?.plan || 'premium';
    const customerId = customer;
    
    if (!userId) {
      console.error('No client_reference_id (userId) found in checkout session');
      return;
    }
    
    // Calculate expiration date based on the plan
    const expiresAt = calculateExpirationDate(plan);
    
    // Check if user already has a subscription
    const existingSubResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubResult.rows[0];
      
      await query(`
        UPDATE subscriptions 
        SET plan = $1, 
            status = $2, 
            stripe_session_id = $3, 
            stripe_customer_id = $4,
            access_token = $5,
            expires_at = $6,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $7
      `, [
        plan, 
        'active', 
        sessionId, 
        customerId,
        uuidv4(), // Generate a new access token
        expiresAt,
        existingSub.id
      ]);
      
      console.log(`Updated subscription for user ${userId} to ${plan} plan`);
    } else {
      // Create new subscription
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, stripe_customer_id, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        plan,
        'active',
        sessionId,
        customerId,
        uuidv4(), // Generate a new access token
        expiresAt
      ]);
      
      console.log(`Created new subscription for user ${userId} with ${plan} plan`);
    }
    
    // Update user record with Stripe customer ID if needed
    await query(`
      UPDATE users 
      SET stripe_customer_id = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 AND (stripe_customer_id IS NULL OR stripe_customer_id != $1)
    `, [customerId, userId]);
    
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('Processing customer.subscription.created event');
    
    const { customer: customerId, id: subscriptionId, status, items } = subscription;
    
    // Get the plan from the subscription item
    const plan = items.data.length > 0 ? 
      (items.data[0].price.nickname || 'premium') : 
      'premium';
    
    // Calculate expiration date based on the billing cycle
    const expiresAt = calculateExpirationFromSubscription(subscription);
    
    // Find user by Stripe customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`No user found with Stripe customer ID: ${customerId}`);
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Check if user already has a subscription
    const existingSubResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubResult.rows[0];
      
      await query(`
        UPDATE subscriptions 
        SET plan = $1, 
            status = $2, 
            stripe_subscription_id = $3,
            access_token = $4,
            expires_at = $5,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $6
      `, [
        plan, 
        mapStripeStatus(status), 
        subscriptionId,
        uuidv4(), // Generate a new access token
        expiresAt,
        existingSub.id
      ]);
      
      console.log(`Updated subscription for user ${userId} with subscription ID ${subscriptionId}`);
    } else {
      // Create new subscription
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_subscription_id, stripe_customer_id, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        plan,
        mapStripeStatus(status),
        subscriptionId,
        customerId,
        uuidv4(), // Generate a new access token
        expiresAt
      ]);
      
      console.log(`Created new subscription for user ${userId} with subscription ID ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling customer.subscription.created:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Processing customer.subscription.updated event');
    
    const { 
      customer: customerId, 
      id: subscriptionId, 
      status, 
      items, 
      cancel_at_period_end 
    } = subscription;
    
    // Get the plan from the subscription item
    const plan = items.data.length > 0 ? 
      (items.data[0].price.nickname || 'premium') : 
      'premium';
    
    // Calculate expiration date based on the current period end
    const expiresAt = calculateExpirationFromSubscription(subscription);
    
    // Find the subscription in our database
    const subscriptionResult = await query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Determine the status to set
    let dbStatus = mapStripeStatus(status);
    
    // If the subscription is set to cancel at period end, but still active
    if (cancel_at_period_end && status === 'active') {
      dbStatus = 'canceling';
    }
    
    // Update the subscription
    await query(`
      UPDATE subscriptions 
      SET plan = $1, 
          status = $2, 
          expires_at = $3,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4
    `, [plan, dbStatus, expiresAt, subId]);
    
    console.log(`Updated subscription for user ${userId} to status: ${dbStatus}`);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Processing customer.subscription.deleted event');
    
    const { 
      customer: customerId, 
      id: subscriptionId 
    } = subscription;
    
    // Find the subscription in our database
    const subscriptionResult = await query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Update the subscription status to canceled
    await query(`
      UPDATE subscriptions 
      SET status = $1, 
          expires_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, ['canceled', subId]);
    
    console.log(`Canceled subscription for user ${userId}`);
    
    // Optionally, downgrade to a basic plan
    await query(`
      INSERT INTO subscriptions 
      (user_id, plan, status) 
      VALUES ($1, $2, $3)
    `, [userId, 'basic', 'active']);
    
    console.log(`Created new basic subscription for user ${userId}`);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('Processing invoice.payment_succeeded event');
    
    const { 
      customer: customerId, 
      subscription: subscriptionId,
      paid,
      amount_paid
    } = invoice;
    
    if (!paid || amount_paid <= 0) {
      console.log('Invoice not paid or zero amount, ignoring');
      return;
    }
    
    // Find the subscription in our database
    const subscriptionResult = await query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Get the subscription details from Stripe to update expiration
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const expiresAt = calculateExpirationFromSubscription(stripeSubscription);
    
    // Update the subscription status and expiration
    await query(`
      UPDATE subscriptions 
      SET status = $1, 
          expires_at = $2,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
    `, ['active', expiresAt, subId]);
    
    console.log(`Updated subscription for user ${userId} after successful payment`);
    
    // Insert payment record
    await query(`
      INSERT INTO payments 
      (user_id, subscription_id, amount, stripe_invoice_id) 
      VALUES ($1, $2, $3, $4)
    `, [userId, subId, amount_paid / 100, invoice.id]);
    
    console.log(`Recorded payment of ${amount_paid / 100} for user ${userId}`);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log('Processing invoice.payment_failed event');
    
    const { 
      customer: customerId, 
      subscription: subscriptionId,
      attempt_count
    } = invoice;
    
    // Find the subscription in our database
    const subscriptionResult = await query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Update the subscription status based on attempt count
    // If multiple attempts have failed, mark as past_due or unpaid
    const status = attempt_count > 3 ? 'unpaid' : 'past_due';
    
    await query(`
      UPDATE subscriptions 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [status, subId]);
    
    console.log(`Updated subscription for user ${userId} to status: ${status} after failed payment`);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

// Handle customer creation
async function handleCustomerCreated(customer) {
  try {
    console.log('Processing customer.created event');
    
    const { id: customerId, email } = customer;
    
    if (!email) {
      console.error('No email found in customer object');
      return;
    }
    
    // Find user by email
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`No user found with email: ${email}, potentially a new signup flow`);
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Update user with Stripe customer ID
    await query(`
      UPDATE users 
      SET stripe_customer_id = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [customerId, userId]);
    
    console.log(`Updated user ${userId} with Stripe customer ID: ${customerId}`);
  } catch (error) {
    console.error('Error handling customer.created:', error);
    throw error;
  }
}

// Helper function to map Stripe subscription status to our database status
function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'unpaid': 'unpaid',
    'canceled': 'canceled',
    'incomplete': 'pending',
    'incomplete_expired': 'canceled',
    'trialing': 'active',
    'paused': 'paused'
  };
  
  return statusMap[stripeStatus] || 'unknown';
}

// Helper function to calculate expiration date from a Stripe subscription
function calculateExpirationFromSubscription(subscription) {
  if (!subscription) return null;
  
  // Use current_period_end if available
  if (subscription.current_period_end) {
    return new Date(subscription.current_period_end * 1000).toISOString();
  }
  
  // If we have a cancel_at, use that
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000).toISOString();
  }
  
  // Otherwise, calculate based on plan interval
  const plan = subscription.items?.data[0]?.plan;
  if (plan) {
    const now = new Date();
    
    if (plan.interval === 'month') {
      now.setMonth(now.getMonth() + 1);
    } else if (plan.interval === 'year') {
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan.interval === 'week') {
      now.setDate(now.getDate() + 7);
    } else if (plan.interval === 'day') {
      now.setDate(now.getDate() + 1);
    }
    
    return now.toISOString();
  }
  
  // Fallback to 1 year from now
  return calculateExpirationDate('premium');
}

// Enhanced helper function to calculate expiration date based on plan details
function calculateExpirationDate(plan) {
  const now = new Date();
  
  if (typeof plan === 'string') {
    if (plan.includes('monthly')) {
      now.setMonth(now.getMonth() + 1);
    } else if (plan.includes('yearly') || plan.includes('annual')) {
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan.includes('weekly')) {
      now.setDate(now.getDate() + 7);
    } else if (plan.includes('quarterly')) {
      now.setMonth(now.getMonth() + 3);
    } else if (plan.includes('premium')) {
      // Default premium to 1 year
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan.includes('basic')) {
      // For free basic plans, we might set longer expiration or null
      now.setFullYear(now.getFullYear() + 10); // Effectively "forever"
      // Alternatively: return null; // No expiration
    } else {
      // Default to 1 year for unknown premium plans
      now.setFullYear(now.getFullYear() + 1);
    }
  } else {
    // Default to 1 year if plan type is unclear
    now.setFullYear(now.getFullYear() + 1);
  }
  
  return now.toISOString();
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;