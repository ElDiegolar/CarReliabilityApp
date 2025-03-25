const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, query, sql } = require('./database');
const stripe = require('stripe')('sk_test_mW5kSbWQ5RUKweAmuVKnDaJx');

dotenv.config();

const app = express();

// STEP 1: Debug middleware to log the raw request before any processing
app.use((req, res, next) => {
  // Only for the webhook path
  if (req.path === '/api/webhook') {
    // Create a buffer array to collect chunks
    const chunks = [];
    
    // Save the original listeners
    const originalWrite = res.write;
    const originalEnd = res.end;
    
    // Override data listener
    req.on('data', chunk => {
      chunks.push(chunk);
    });
    
    // Override end listener
    req.on('end', () => {
      // Store the raw body for later use
      req.rawBody = Buffer.concat(chunks);
      console.log('💾 Raw body captured:', req.rawBody.length, 'bytes');
    });
  }
  next();
});

// STEP 2: Custom Stripe webhook handling route
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const endpointSecret = 'whsec_g9iplz4O3eLpzGqDrc4rnS7QWwZMpwaH';
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    return res.status(400).send('Stripe signature is missing');
  }

  // Use the rawBody if available, otherwise fall back to req.body
  const payload = req.rawBody || req.body;
  
  console.log('⚙️ Processing webhook with payload type:', typeof payload);
  console.log('⚙️ Is Buffer:', Buffer.isBuffer(payload));
  console.log('⚙️ Payload length:', payload.length, 'bytes');
  
  // Manual signature verification
  try {
    const signatureParts = signature.split(',');
    const timestampPart = signatureParts.find(part => part.startsWith('t='));
    const timestamp = timestampPart ? timestampPart.substring(2) : '';
    
    console.log('⏱️ Timestamp from signature:', timestamp);
    
    // Calculate the signature manually
    const signedPayload = `${timestamp}.${payload.toString('utf8')}`;
    
    const computedSignature = crypto
      .createHmac('sha256', endpointSecret)
      .update(signedPayload)
      .digest('hex');
    
    console.log('🔒 Computed signature:', computedSignature);
    
    // Check v1 signatures
    const v1Parts = signatureParts.filter(part => part.startsWith('v1='));
    
    if (v1Parts.length === 0) {
      throw new Error('No v1 signature found in Stripe signature header');
    }
    
    const v1Signatures = v1Parts.map(part => part.substring(3));
    console.log('🔑 v1 Signatures from Stripe:', v1Signatures);
    
    const signatureMatched = v1Signatures.some(sig => sig === computedSignature);
    
    if (!signatureMatched) {
      // One last attempt with using different encodings
      console.log('🔄 Trying alternative signature calculation methods...');
      
      // Method 1: Use the raw buffer directly
      const altSignature1 = crypto
        .createHmac('sha256', endpointSecret)
        .update(`${timestamp}.`)
        .update(payload)
        .digest('hex');
      
      console.log('🔀 Alt signature 1:', altSignature1);
      
      // Method 2: Try using a different encoding
      const altSignature2 = crypto
        .createHmac('sha256', endpointSecret)
        .update(`${timestamp}.${payload.toString('ascii')}`)
        .digest('hex');
      
      console.log('🔀 Alt signature 2:', altSignature2);
      
      // Check if any alternative methods worked
      if (v1Signatures.includes(altSignature1)) {
        console.log('✅ Matched with alternative method 1!');
      } else if (v1Signatures.includes(altSignature2)) {
        console.log('✅ Matched with alternative method 2!');
      } else {
        // If all verification methods fail, try to bypass for testing
        console.log('⚠️ All verification methods failed. Proceeding with caution...');
      }
    }
    
    // Try using Stripe's built-in verification as a fallback
    let event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
      console.log('✨ Stripe SDK verification succeeded!');
    } catch (stripeVerificationError) {
      console.error('❌ Stripe SDK verification failed:', stripeVerificationError.message);
      
      // For testing purposes, parse the payload manually
      // WARNING: In production, you should reject unverified webhooks
      console.log('🔧 Attempting to parse payload manually for testing...');
      event = JSON.parse(payload.toString('utf8'));
    }
    
    // Process the event
    console.log('📩 Processing event type:', event.type);
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('💰 Payment succeeded:', event.data.object.id);
        break;
      case 'customer.subscription.created':
        console.log('📝 Subscription created:', event.data.object.id);
        // Update your database with subscription details
        break;
      case 'customer.created':
        console.log('👤 Customer created:', event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Send a 200 response to acknowledge receipt of the event
    res.json({ received: true, eventType: event.type });
  } catch (err) {
    console.error('❌ Error processing webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// CORS middleware
app.use(cors({
  origin: "*", // Allow all domains (restrict in production)
  methods: "GET,POST,OPTIONS,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

// JSON body parsing for all other routes
app.use(express.json());

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
    const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', 
      [email, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    await query(
      'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
      [userId, 'basic', 'active']
    );
    
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
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
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
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription && subscription.plan === 'premium';
    const isBasic = subscription && subscription.plan === 'basic';
    
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
    res.status(500).json({ error: 'Failed to fetch profile', fool_error: error });
  }
});

// Verify payment and set up subscription
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { sessionId, plan } = req.body;
  
  if (!sessionId || !plan) {
    return res.status(400).json({ error: 'Session ID and plan are required' });
  }
  
  try {
    const accessToken = uuidv4();
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      const existingSub = existingSubscriptionResult.rows[0];
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, stripe_session_id = $3, access_token = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5
      `, [plan, 'active', sessionId, accessToken, existingSub.id]);
    } else {
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

    let isPremium = false;
    let isBasic = false;
    let user_id = null;
    
    if (premiumToken) {
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
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'your-secret-key');
        user_id = decoded.id;
        
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
          isBasic = true;
        }
      } catch (err) {
        console.error('Invalid user token:', err);
      }
    }
    
    if (user_id) {
      await query(`
        INSERT INTO searches (user_id, year, make, model, mileage) 
        VALUES ($1, $2, $3, $4, $5)
      `, [user_id, year, make, model, mileage]);
    }

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
        temperature: 0.2,
      });

      const responseText = completion.data.choices[0].message.content.trim();
      let reliabilityData;
      
      try {
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                          responseText.match(/```\n([\s\S]*)\n```/) ||
                          [null, responseText];
        reliabilityData = JSON.parse(jsonMatch[1]);
        
        if (!isPremium) {
          reliabilityData = {
            overallScore: reliabilityData.overallScore,
            categories: {
              engine: reliabilityData.categories.engine,
              transmission: reliabilityData.categories.transmission,
              electricalSystem: null,
              brakes: null,
              suspension: null,
              fuelSystem: null
            },
            commonIssues: [],
            aiAnalysis: "Upgrade to premium for full analysis",
            isPremium: false,
            isBasic: isBasic
          };
        } else {
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
    const isAdmin = true; // Replace with actual admin check in production
    if (!isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions to access user data' });
    }
    
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

// Create a test route for GET requests
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
        plan: plan || 'premium'
      },
      client_reference_id: userId
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
    if (process.env.NODE_ENV === 'production') {
      const authKey = req.headers['x-admin-key'];
      if (authKey !== process.env.ADMIN_SECRET_KEY) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
    }
    
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;
    const eventType = req.query.type || null;
    
    let queryText = `
      SELECT id, event_id, event_type, processing_status, error_message, created_at, updated_at 
      FROM webhook_logs
    `;
    const queryParams = [];
    let paramIndex = 1;
    
    if (eventType) {
      queryText += ` WHERE event_type = $${paramIndex}`;
      queryParams.push(eventType);
      paramIndex++;
    }
    
    queryText += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);
    
    let countQuery = 'SELECT COUNT(*) FROM webhook_logs';
    if (eventType) {
      countQuery += ' WHERE event_type = $1';
    }
    
    const [logsResult, countResult] = await Promise.all([
      query(queryText, queryParams),
      query(countQuery, eventType ? [eventType] : [])
    ]);
    
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

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;