// server/server.js - Express server for car reliability API
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "*",  // Allow all domains (you can restrict it later)
  methods: "GET,POST,OPTIONS",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/test', (req, res) => {
  res.json({ message: "Backend is running!", data: req.body });
});

// API endpoint to get car reliability data
app.post('/api/car-reliability', async (req, res) => {
  try {
    console.log('Hit API');
    const { year, make, model, mileage } = req.body;

    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Year, make, and model are required' });
    }

    // Construct prompt for ChatGPT
    const prompt = `
      Given the following vehicle details:

      Year: ${year}
      Make: ${make}
      Model: ${model}
      Mileage: ${mileage}
      Overall Score: Provide a reliability score between 70 and 100.
      Average Price: Provide an average price for this vehicle in USD.
      Categories: Provide reliability scores (each between 70 and 100) for the following categories:
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
          {description: [description of issue here], costToFix: [cost to fix here], occurrence: [occurences you found]], mileage: [mileage at which issue occurs]},
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
          electricalSystem: Math.floor(Math.random() * 30) + 70,
          brakes: Math.floor(Math.random() * 30) + 70,
          suspension: Math.floor(Math.random() * 30) + 70,
          fuelSystem: Math.floor(Math.random() * 30) + 70,
        },
        commonIssues: [
          `${make} ${model} transmission issues reported after 60,000 miles`,
          "Some electrical system problems in cold weather",
          "Brake rotors may wear prematurely",
          "Minor oil leaks in some units"
        ],
        aiAnalysis: `The ${year} ${make} ${model} shows generally good reliability with some minor concerns. Compared to similar vehicles in its class, it ranks above average for long-term dependability. Owners report high satisfaction with engine performance and fuel economy, while some report issues with the transmission after extended use. Regular maintenance appears to prevent most common problems.`
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

// Fallback route for data
app.post('/api/fallback-reliability', (req, res) => {
  const { year, make, model } = req.body;

  const reliabilityData = {
    overallScore: Math.floor(Math.random() * 30) + 70,
    categories: {
      engine: Math.floor(Math.random() * 30) + 70,
      transmission: Math.floor(Math.random() * 30) + 70,
      electricalSystem: Math.floor(Math.random() * 30) + 70,
      brakes: Math.floor(Math.random() * 30) + 70,
      suspension: Math.floor(Math.random() * 30) + 70,
      fuelSystem: Math.floor(Math.random() * 30) + 70,
    },
    commonIssues: [
      "Transmission issues reported after 60,000 miles",
      "Some electrical system problems in cold weather",
      "Brake rotors may wear prematurely",
      "Minor oil leaks in some units"
    ],
    aiAnalysis: `The ${year} ${make} ${model} shows generally good reliability with some minor concerns. Compared to similar vehicles in its class, it ranks above average for long-term dependability. Owners report high satisfaction with engine performance and fuel economy, while some report issues with the transmission after extended use. Regular maintenance appears to prevent most common problems.`
  };

  res.json(reliabilityData);
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
    endpoints: ["/api/test", "/api/car-reliability", "/api/fallback-reliability"]
  });
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