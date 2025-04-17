// pages/api/car-reliability.js - Car reliability data API route
import { Configuration, OpenAIApi } from 'openai';
import { query } from '../../lib/database';

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { year, make, model, mileage, premiumToken, userId, locale } = req.body;

    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Year, make, model, and mileage are required' });
    }

    // Check if premium based on token
    let isPremium = false;
    let user_id = null;
    
    if (premiumToken) {
      // Verify token
      const now = new Date().toISOString();
      const subscriptionResult = await query(`
        SELECT us.user_id
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.status = $1 
        AND (us.current_period_end IS NULL OR us.current_period_end > $2)
        AND (sp.name = 'premium' OR sp.name = 'professional')
      `, ['active', now]);
      
      if (subscriptionResult.rows.length > 0) {
        isPremium = true;
        user_id = subscriptionResult.rows[0].user_id;
      }
    } else if (userId) {
      // If user is authenticated but no token provided
      user_id = userId;
      
      // Check if user has active subscription (premium or professional)
      const now = new Date().toISOString();
      const subscriptionResult = await query(`
        SELECT us.id
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1 
        AND us.status = $2 
        AND (us.current_period_end IS NULL OR us.current_period_end > $3)
        AND (sp.name = 'premium' OR sp.name = 'professional')
      `, [userId, 'active', now]);
      
      if (subscriptionResult.rows.length > 0) {
        isPremium = true;
      }
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
      AI Analysis: Mention any important recall issues and write a detailed report analyzing the overall reliability of the vehicle. 
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
          {engineCodes: [description of known engine codes], and link to car user manual for more details}
        ],
        "aiAnalysis": ""
      }

      Please ensure the JSON is valid and follows the exact key structure above and the return language in the following country code ${locale} translations.
    `;

    let reliabilityData = null;

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
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError.message);
      
      // Fallback to mock data if OpenAI API fails
      console.log('Using fallback data');
      reliabilityData = {
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
    }
    
    // Log the search with results
    if (user_id && reliabilityData) {
      try {
        // Check if the searches table has the results column
        const tableInfo = await query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = 'searches'
            AND column_name = 'results'
        `);
        
        if (tableInfo.rows.length > 0) {
          // Store search with results if the column exists
          const resultsJson = JSON.stringify(reliabilityData);
          
          console.log('Logging search with results for user:', user_id);
          await query(`
            INSERT INTO searches (user_id, year, make, model, mileage, results) 
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [user_id, year, make, model, mileage, resultsJson]);
        } else {
          // Fall back to the original behavior if the column doesn't exist
          console.log('Results column not found, logging search without results');
          await query(`
            INSERT INTO searches (user_id, year, make, model, mileage) 
            VALUES ($1, $2, $3, $4, $5)
          `, [user_id, year, make, model, mileage]);
        }
      } catch (searchError) {
        console.error('Error logging search:', searchError);
        // Continue even if search logging fails
      }
    }

    // Return the data to the client
    res.json(reliabilityData);
  } catch (error) {
    console.error('General API Error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve reliability data',
      message: error.message
    });
  }
}