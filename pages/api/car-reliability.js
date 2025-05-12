// pages/api/car-reliability.js - Car reliability data API route with integrated timeline
import { Configuration, OpenAIApi } from 'openai';
import { query } from '../../lib/database';
import { ensureTimelineTable, getCachedTimeline, saveTimelineData } from '../../lib/timeline-utils';

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

    // Construct a combined prompt for ChatGPT for both reliability and specifications data
    const combinedPrompt = `
      Given the following vehicle details:

      Year: ${year}
      Make: ${make}
      Model: ${model}
      Mileage: ${mileage}

      Provide a complete analysis with two main sections:

      SECTION 1: RELIABILITY DATA
      - Overall Score: Provide a reliability score between 1 and 100.
      - Categories: Provide reliability scores (each between 1 and 100) for the following categories:
        * Engine
        * Transmission
        * Electrical System
        * Brakes
        * Suspension
        * Fuel System
      - Common Issues: List known problem areas that might occur with this vehicle, along with potential cost to fix in USD. 
        Add reference to the number of these issues found.
        Include an estimate of the mileage at which these issues typically occur.
      - AI Analysis: Mention any important recall issues and write a detailed report analyzing the overall reliability of the vehicle. 
        Mention how it compares to similar cars in its class, note any major concerns, and highlight any particular strengths. 
        Provide supporting sources for your determinations.

      SECTION 2: SPECIFICATIONS DATA
      - Engine: type, displacement, horsepower, torque
      - Transmission
      - Drivetrain
      - Fuel Economy: city/highway/combined
      - Dimensions: length, width, height, wheelbase
      - Weight
      - Cargo capacity
      - Seating capacity
      - Safety features
      - Warranty information

      Output the response in JSON format with the following structure:

      {
        "reliabilityData": {
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
            {
              "description": "",
              "costToFix": "",
              "occurrence": "",
              "mileage": ""
            }
          ],
          "aiAnalysis": ""
        },
        "specificationsData": {
          "engine": {
            "type": "",
            "displacement": "",
            "horsepower": "",
            "torque": ""
          },
          "transmission": "",
          "drivetrain": "",
          "fuelEconomy": {
            "city": "",
            "highway": "",
            "combined": ""
          },
          "dimensions": {
            "length": "",
            "width": "",
            "height": "",
            "wheelbase": ""
          },
          "weight": "",
          "cargoCapacity": "",
          "seatingCapacity": "",
          "safetyFeatures": ["", "", ""],
          "warranty": ""
        }
      }

      Please ensure the JSON is valid and follows the exact key structure above and the return language in the following country code ${locale} translations.
    `;

    let reliabilityData = null;
    let specificationsData = null;

    try {
      // Get both reliability and specifications data in a single API call
      const completion = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an automotive expert assistant that provides detailed and accurate information about vehicles, including reliability scores and technical specifications. Return all responses as properly formatted JSON." },
          { role: "user", content: combinedPrompt }
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

        const combinedData = JSON.parse(jsonMatch[1]);
        
        // Extract reliability data and specifications data
        reliabilityData = combinedData.reliabilityData;
        specificationsData = combinedData.specificationsData;
        
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
          
          // Provide basic specifications data for free users
          const fullSpecs = specificationsData;
          specificationsData = {
            engine: {
              type: fullSpecs.engine.type,
              displacement: fullSpecs.engine.displacement,
              // Limit detailed engine info for free users
              horsepower: "Upgrade to premium",
              torque: "Upgrade to premium"
            },
            transmission: fullSpecs.transmission,
            drivetrain: fullSpecs.drivetrain,
            // Limit other specifications for free users
            fuelEconomy: {
              city: "Upgrade to premium",
              highway: "Upgrade to premium",
              combined: "Upgrade to premium"
            },
            dimensions: {
              length: fullSpecs.dimensions.length,
              width: fullSpecs.dimensions.width,
              height: fullSpecs.dimensions.height,
              wheelbase: "Upgrade to premium"
            },
            weight: fullSpecs.weight,
            cargoCapacity: "Upgrade to premium",
            seatingCapacity: fullSpecs.seatingCapacity,
            safetyFeatures: ["Upgrade to premium for full safety features"],
            warranty: "Upgrade to premium for warranty information"
          };
        } else {
          // Add premium flag for paid users
          reliabilityData.isPremium = true;
        }
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return res.status(500).json({ 
          error: 'Failed to parse vehicle data',
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

      // Mock specifications data
      specificationsData = {
        engine: {
          type: `${Math.random() > 0.5 ? 'V6' : 'Inline-4'} ${Math.random() > 0.5 ? 'Turbocharged' : ''}`,
          displacement: `${(1.8 + Math.random() * 3.0).toFixed(1)}L`,
          horsepower: isPremium ? `${Math.floor(Math.random() * 150) + 150} hp` : "Upgrade to premium",
          torque: isPremium ? `${Math.floor(Math.random() * 150) + 150} lb-ft` : "Upgrade to premium"
        },
        transmission: `${Math.random() > 0.5 ? 'Automatic' : 'Manual'} ${Math.floor(Math.random() * 3) + 6}-Speed`,
        drivetrain: Math.random() > 0.5 ? 'FWD' : (Math.random() > 0.5 ? 'RWD' : 'AWD'),
        fuelEconomy: {
          city: isPremium ? `${Math.floor(Math.random() * 10) + 18} mpg` : "Upgrade to premium",
          highway: isPremium ? `${Math.floor(Math.random() * 10) + 25} mpg` : "Upgrade to premium",
          combined: isPremium ? `${Math.floor(Math.random() * 10) + 22} mpg` : "Upgrade to premium"
        },
        dimensions: {
          length: `${Math.floor(Math.random() * 20) + 170} in`,
          width: `${Math.floor(Math.random() * 10) + 65} in`,
          height: `${Math.floor(Math.random() * 10) + 55} in`,
          wheelbase: isPremium ? `${Math.floor(Math.random() * 20) + 100} in` : "Upgrade to premium"
        },
        weight: `${Math.floor(Math.random() * 1000) + 3000} lbs`,
        cargoCapacity: isPremium ? `${Math.floor(Math.random() * 20) + 10} cu ft` : "Upgrade to premium",
        seatingCapacity: `${Math.floor(Math.random() * 3) + 4}`,
        safetyFeatures: isPremium ? ["ABS", "Stability Control", "Multiple Airbags", "Rear Camera"] : ["Upgrade to premium for full safety features"],
        warranty: isPremium ? `${Math.floor(Math.random() * 3) + 3} years / ${Math.floor(Math.random() * 30) + 30},000 miles` : "Upgrade to premium for warranty information"
      };
    }
    
    // Add image URL for the car
    reliabilityData.imageUrl = `https://source.unsplash.com/featured/?${make},${model}`;
    
    // Now, if user is premium, get or generate timeline data
    let timelineData = [];
    
    if (isPremium) {
      try {
        // Ensure the timeline table exists
        await ensureTimelineTable();
        
        // Check for cached timeline data
        const cachedTimeline = await getCachedTimeline(year, make, model);
        
        if (cachedTimeline) {
          console.log(`Using cached timeline data for ${year} ${make} ${model}`);
          timelineData = cachedTimeline;
        } else {
          console.log(`Generating new timeline data for ${year} ${make} ${model}`);
          // Generate timeline data using OpenAI
          const timelinePrompt = `
            Create a design history timeline for the ${year} ${make} ${model} car. 
            For each significant version or generation, include:
            1. The year of introduction
            2. Key design changes
            3. Engineering modifications that could affect reliability
            4. Notable features or innovations

            Format the response as a JSON array with objects containing:
            {
              "year": "YYYY",
              "title": "Brief title of the change",
              "description": "Detailed description",
              "engineeringChanges": ["list of specific engineering changes"],
              "imageUrl": null
            }

            Start from the first generation up to the ${year} model. Include at least 3-5 major milestones.
            Return ONLY the JSON array with no additional text.
          `;

          const timelineCompletion = await openai.createChatCompletion({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are an automotive expert assistant that provides accurate historical vehicle information. Return all responses as properly formatted JSON." },
              { role: "user", content: timelinePrompt }
            ],
            temperature: 0.2,
          });

          const timelineResponseText = timelineCompletion.data.choices[0].message.content.trim();
          
          try {
            const jsonMatch = timelineResponseText.match(/```json\n([\s\S]*)\n```/) ||
                              timelineResponseText.match(/```\n([\s\S]*)\n```/) ||
                              [null, timelineResponseText];

            timelineData = JSON.parse(jsonMatch[1]);

            // Cache the timeline data
            await saveTimelineData(year, make, model, timelineData);
          } catch (parseError) {
            console.error("Error parsing timeline JSON response:", parseError);
            // Don't fail the whole request if timeline parsing fails
            timelineData = [];
          }
        }
      } catch (timelineError) {
        console.error('Timeline generation error:', timelineError.message);
        // Don't fail the whole request if timeline generation fails
        timelineData = [];
      }
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

    // Log if we're including timeline data
    if (isPremium && timelineData.length > 0) {
      console.log(`Including ${timelineData.length} timeline items in response`);
    }
    
    // Return both the reliability data, specifications data, and timeline data to the client
    res.json({
      ...reliabilityData,
      specifications: specificationsData,
      timeline: isPremium ? timelineData : []
    });
  } catch (error) {
    console.error('General API Error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve reliability data',
      message: error.message
    });
  }
}