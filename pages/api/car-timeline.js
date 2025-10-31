// pages/api/car-timeline.js - Fallback API for getting timeline separately
import { withAuth } from '../../lib/auth';
import { 
  getCachedTimeline, 
  saveTimelineData, 
  ensureTimelineTable 
} from '../../lib/timeline-utils';
import { Configuration, OpenAIApi } from 'openai';
import { query } from '../../lib/database';

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year, make, model } = req.body;

  if (!year || !make || !model) {
    return res.status(400).json({ error: 'Year, make, and model are required' });
  }

  try {
    // Timeline is now available to all authenticated users

    // Ensure timeline table exists
    await ensureTimelineTable();

    // Check for cached timeline data
    const cachedTimeline = await getCachedTimeline(year, make, model);
    
    if (cachedTimeline) {
      console.log(`Using cached timeline data for ${year} ${make} ${model}`);
      return res.json({ timeline: cachedTimeline });
    }

    // Generate timeline data using OpenAI
    console.log(`Generating new timeline data for ${year} ${make} ${model}`);
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

    const responseText = completion.data.choices[0].message.content.trim();
    let timelineData = [];

    try {
      const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) ||
                        responseText.match(/```\n([\s\S]*)\n```/) ||
                        [null, responseText];

      timelineData = JSON.parse(jsonMatch[1]);

      // Cache the timeline data
      await saveTimelineData(year, make, model, timelineData);
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