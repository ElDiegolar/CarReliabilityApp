// pages/api/generate-roast.js - Generate AI humorous car critiques
import openai from '../../lib/openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { year, make, model, score, issues } = req.body;

  if (!year || !make || !model) {
    return res.status(400).json({ error: 'Missing vehicle details' });
  }

  try {
    const issuesList = issues?.length > 0 
      ? `Common issues: ${issues.join(', ')}`
      : 'No major issues reported';

    const prompt = `You are a funny and sarcastic car roaster. Generate a SHORT (1-2 sentences max), hilarious roast about this vehicle. Be witty and entertaining, reference specific common issues of this model if known. This is for entertainment purposes.

Vehicle: ${year} ${make} ${model}
Reliability Score: ${score}/100
${issuesList}

Generate just the roast, no quotes or preamble:`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.9
    });

    const roast = completion.data.choices[0]?.message?.content || 'This transmission ghosts harder than my ex.';

    res.status(200).json({ roast });
  } catch (error) {
    console.error('Error generating roast:', error);
    res.status(500).json({ 
      error: 'Failed to generate roast',
      roast: `This ${year} ${make} ${model} is proof that not all cars age gracefully.` 
    });
  }
}