// pages/api/car-timeline.js
import { query } from '../../lib/database';
import { withAuth } from '../../lib/auth';
import { Configuration, OpenAIApi } from 'openai';

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year, make, model } = req.query;

  if (!year || !make || !model) {
    return res.status(400).json({ error: 'Year, make, and model are required' });
  }

  try {
    // Check if user has premium or professional subscription
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT us.id
      FROM user_subscriptions us
      JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = $1 
      AND us.status = $2 
      AND (us.current_period_end IS NULL OR us.current_period_end > $3)
      AND (sp.name = 'premium' OR sp.name = 'professional')
    `, [req.user.id, 'active', now]);
    
    if (subscriptionResult.rows.length === 0) {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    // Check if we already have cached timeline data
    const cachedResult = await query(`
      SELECT timeline_data FROM car_timelines 
      WHERE year = $1 AND make = $2 AND model = $3
    `, [year, make, model]);

    if (cachedResult.rows.length > 0) {
      return res.json({ timeline: cachedResult.rows[0].timeline_data });
    }

    // Generate timeline data using OpenAI
    const prompt = `
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

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an automotive expert assistant that provides accurate historical vehicle information. Return all responses as properly formatted JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
    });

    // Extract and parse the response
    const responseText = completion.data.choices[0].message.content.trim();
    let timelineData = [];
    
    try {
      // Extract JSON if it's wrapped in code blocks
      const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                        responseText.match(/```\n([\s\S]*)\n```/) ||
                        [null, responseText];

      timelineData = JSON.parse(jsonMatch[1]);
      
      // Cache the timeline data
      await query(`
        INSERT INTO car_timelines (year, make, model, timeline_data) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (year, make, model) 
        DO UPDATE SET timeline_data = $4
      `, [year, make, model, JSON.stringify(timelineData)]);
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      return res.status(500).json({ 
        error: 'Failed to parse timeline data',
        rawResponse: responseText
      });
    }

    return res.json({ timeline: timelineData });
  } catch (error) {
    console.error('Car timeline API error:', error);
    return res.status(500).json({ 
      error: 'Failed to retrieve timeline data',
      message: error.message
    });
  }
}

export default withAuth(handler);