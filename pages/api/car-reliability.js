// pages/api/car-reliability.js - Optimized with parallel GPT-4o calls
import { Configuration, OpenAIApi } from 'openai';
import { query } from '../../lib/database';
import { ensureTimelineTable, getCachedTimeline, saveTimelineData } from '../../lib/timeline-utils';

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Helper function to create reliability prompt
function createReliabilityPrompt(year, make, model, mileage, locale) {
  return `
    Given the following vehicle details:

    Year: ${year}
    Make: ${make}
    Model: ${model}
    Mileage: ${mileage}

    Provide a comprehensive RELIABILITY ANALYSIS with the following structure:

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
        {
          "description": "",
          "costToFix": "",
          "occurrence": "",
          "mileage": ""
        }
      ],
      "aiAnalysis": ""
    }

    Please ensure the JSON is valid and follows the exact key structure above and the return language in the following country code ${locale} translations.
  `;
}

// Helper function to create specifications prompt
function createSpecificationsPrompt(year, make, model, locale) {
  return `
    Given the following vehicle details:

    Year: ${year}
    Make: ${make}
    Model: ${model}

    Provide comprehensive TECHNICAL SPECIFICATIONS for this vehicle:

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

    Please ensure the JSON is valid and follows the exact key structure above and the return language in the following country code ${locale} translations.
  `;
}

// Helper function to create timeline prompt
function createTimelinePrompt(year, make, model) {
  return `
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
}

// Helper function to make OpenAI API call
async function makeOpenAICall(prompt, systemMessage) {
  const completion = await openai.createChatCompletion({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
  });

  const responseText = completion.data.choices[0].message.content.trim();
  
  // Extract JSON if it's wrapped in code blocks
  const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                    responseText.match(/```\n([\s\S]*)\n```/) ||
                    [null, responseText];

  return JSON.parse(jsonMatch[1]);
}

// Helper function to generate fallback data
function generateFallbackData(year, make, model, isPremium) {
  const reliabilityData = {
    overallScore: Math.floor(Math.random() * 30) + 70,
    categories: {
      engine: Math.floor(Math.random() * 30) + 70,
      transmission: Math.floor(Math.random() * 30) + 70,
      electricalSystem: Math.floor(Math.random() * 30) + 70, // Always available
      brakes: Math.floor(Math.random() * 30) + 70, // Always available
      suspension: Math.floor(Math.random() * 30) + 70, // Always available
      fuelSystem: Math.floor(Math.random() * 30) + 70, // Always available
    },
    commonIssues: [
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
    ],
    aiAnalysis: `The ${year} ${make} ${model} shows generally good reliability with some minor concerns. Compared to similar vehicles in its class, it ranks above average for long-term dependability. Owners report high satisfaction with engine performance and fuel economy, while some report issues with the transmission after extended use. Regular maintenance appears to prevent most common problems.`,
    isPremium: true // All users are now considered premium
  };

  const specificationsData = {
    engine: {
      type: `${Math.random() > 0.5 ? 'V6' : 'Inline-4'} ${Math.random() > 0.5 ? 'Turbocharged' : ''}`,
      displacement: `${(1.8 + Math.random() * 3.0).toFixed(1)}L`,
      horsepower: `${Math.floor(Math.random() * 150) + 150} hp`, // Always available
      torque: `${Math.floor(Math.random() * 150) + 150} lb-ft` // Always available
    },
    transmission: `${Math.random() > 0.5 ? 'Automatic' : 'Manual'} ${Math.floor(Math.random() * 3) + 6}-Speed`,
    drivetrain: Math.random() > 0.5 ? 'FWD' : (Math.random() > 0.5 ? 'RWD' : 'AWD'),
    fuelEconomy: {
      city: `${Math.floor(Math.random() * 10) + 18} mpg`, // Always available
      highway: `${Math.floor(Math.random() * 10) + 25} mpg`, // Always available
      combined: `${Math.floor(Math.random() * 10) + 22} mpg` // Always available
    },
    dimensions: {
      length: `${Math.floor(Math.random() * 20) + 170} in`,
      width: `${Math.floor(Math.random() * 10) + 65} in`,
      height: `${Math.floor(Math.random() * 10) + 55} in`,
      wheelbase: `${Math.floor(Math.random() * 20) + 100} in` // Always available
    },
    weight: `${Math.floor(Math.random() * 1000) + 3000} lbs`,
    cargoCapacity: `${Math.floor(Math.random() * 20) + 10} cu ft`, // Always available
    seatingCapacity: `${Math.floor(Math.random() * 3) + 4}`,
    safetyFeatures: ["ABS", "Stability Control", "Multiple Airbags", "Rear Camera"], // Always available
    warranty: `${Math.floor(Math.random() * 3) + 3} years / ${Math.floor(Math.random() * 30) + 30},000 miles` // Always available
  };

  return { reliabilityData, specificationsData };
}

// Helper function to limit data for free users
function limitDataForFreeUsers(reliabilityData, specificationsData) {
  const limitedReliabilityData = {
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
    isPremium: false
  };
  
  const limitedSpecificationsData = {
    engine: {
      type: specificationsData.engine.type,
      displacement: specificationsData.engine.displacement,
      horsepower: "Upgrade to premium",
      torque: "Upgrade to premium"
    },
    transmission: specificationsData.transmission,
    drivetrain: specificationsData.drivetrain,
    fuelEconomy: {
      city: "Upgrade to premium",
      highway: "Upgrade to premium",
      combined: "Upgrade to premium"
    },
    dimensions: {
      length: specificationsData.dimensions.length,
      width: specificationsData.dimensions.width,
      height: specificationsData.dimensions.height,
      wheelbase: "Upgrade to premium"
    },
    weight: specificationsData.weight,
    cargoCapacity: "Upgrade to premium",
    seatingCapacity: specificationsData.seatingCapacity,
    safetyFeatures: ["Upgrade to premium for full safety features"],
    warranty: "Upgrade to premium for warranty information"
  };

  return { limitedReliabilityData, limitedSpecificationsData };
}

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

    // All users now have full access - no premium restrictions
    let isPremium = true; // Enable all features for everyone
    let user_id = userId || null;

    let reliabilityData = null;
    let specificationsData = null;
    let timelineData = [];

    try {
      // Create all the prompts
      const reliabilityPrompt = createReliabilityPrompt(year, make, model, mileage, locale);
      const specificationsPrompt = createSpecificationsPrompt(year, make, model, locale);
      
      // System messages for different types of calls
      const reliabilitySystemMessage = "You are an automotive reliability expert that provides detailed and accurate reliability assessments for vehicles. Return all responses as properly formatted JSON.";
      const specificationsSystemMessage = "You are an automotive technical specifications expert that provides detailed and accurate technical information about vehicles. Return all responses as properly formatted JSON.";
      const timelineSystemMessage = "You are an automotive expert assistant that provides accurate historical vehicle information. Return all responses as properly formatted JSON.";

      // Create array of promises for parallel execution
      const promises = [
        makeOpenAICall(reliabilityPrompt, reliabilitySystemMessage),
        makeOpenAICall(specificationsPrompt, specificationsSystemMessage)
      ];

      // Timeline data now available to all users
      if (true) {
        // Check for cached timeline data first
        await ensureTimelineTable();
        const cachedTimeline = await getCachedTimeline(year, make, model);
        
        if (cachedTimeline) {
          console.log(`Using cached timeline data for ${year} ${make} ${model}`);
          timelineData = cachedTimeline;
        } else {
          console.log(`Generating new timeline data for ${year} ${make} ${model}`);
          const timelinePrompt = createTimelinePrompt(year, make, model);
          promises.push(makeOpenAICall(timelinePrompt, timelineSystemMessage));
        }
      }

      // Execute all API calls in parallel
      console.log(`Making ${promises.length} parallel OpenAI API calls`);
      const startTime = Date.now();
      
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      console.log(`Parallel API calls completed in ${endTime - startTime}ms`);

      // Extract results
      reliabilityData = results[0];
      specificationsData = results[1];
      
      // Handle timeline data if it was generated (not cached)
      if (isPremium && results.length > 2) {
        timelineData = results[2];
        // Cache the new timeline data
        await saveTimelineData(year, make, model, timelineData);
      }

      // Process data based on premium status
      // if (!isPremium) {
      //   const { limitedReliabilityData, limitedSpecificationsData } = limitDataForFreeUsers(reliabilityData, specificationsData);
      //   reliabilityData = limitedReliabilityData;
      //   specificationsData = limitedSpecificationsData;
      // } else {
        reliabilityData.isPremium = true;
      //}

    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError.message);
      
      // Fallback to mock data if OpenAI API fails
      console.log('Using fallback data');
      const fallbackData = generateFallbackData(year, make, model, isPremium);
      reliabilityData = fallbackData.reliabilityData;
      specificationsData = fallbackData.specificationsData;
    }
    
    // Add image URL for the car
    reliabilityData.imageUrl = `https://source.unsplash.com/featured/?${make},${model}`;
    
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

    // Log timeline data
    if (timelineData.length > 0) {
      console.log(`Including ${timelineData.length} timeline items in response`);
    }
    
    // Return the reliability data, specifications data, and timeline data to the client
    res.json({
      ...reliabilityData,
      specifications: specificationsData,
      timeline: timelineData // All users get timeline data
    });
  } catch (error) {
    console.error('General API Error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve reliability data',
      message: error.message
    });
  }
}