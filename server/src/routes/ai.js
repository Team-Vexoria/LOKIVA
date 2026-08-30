import express from 'express';
import { dbAll, dbGet } from '../db/db.js';
import { parseIntentFromPrompt, scoreExperience } from '../services/algorithms.js';

export const aiRouter = express.Router();

// POST /ai/intent - extract structured intent from prompt
aiRouter.post('/intent', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ detail: 'Prompt is required' });

    const intent = parseIntentFromPrompt(prompt);
    res.json(intent);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// POST /ai/chat - conversational Cultural Guide
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, chat_history = [], city = 'Jaipur' } = req.body;
    if (!message) return res.status(400).json({ detail: 'Message is required' });

    // Look up top experiences for the city to include as grounded context
    const cityExps = await dbAll(
      'SELECT title, category, price, approx_duration_mins, tagline, rating FROM experiences WHERE LOWER(city) = ? AND is_active = 1 LIMIT 4',
      [city.toLowerCase()]
    );

    const intent = parseIntentFromPrompt(message);
    const suggestedTitles = cityExps.map((e) => `• **${e.title}** (${e.category}, ₹${e.price}) — *${e.tagline}*`).join('\n');

    let reply = `Namaste! Based on your query for **${city}**, here are handpicked cultural recommendations matched to your style:\n\n${suggestedTitles}\n\nWould you like me to build a seamless timed itinerary with optimal pacing for your day?`;

    if (message.toLowerCase().includes('rain') || message.toLowerCase().includes('weather')) {
      reply = `In case of unexpected rain in **${city}**, I recommend prioritizing sheltered artisan studios like traditional blue pottery, haveli heritage walks, or culinary tea tastings which remain 100% comfortable!`;
    } else if (message.toLowerCase().includes('food') || message.toLowerCase().includes('eat')) {
      reply = `For food lovers in **${city}**, you can explore authentic generational sweet-makers, clay-cup chai in bazaar alleys, and heritage cooking workshops with local families!`;
    }

    res.json({
      reply,
      extracted_intent: intent,
      suggested_experiences: cityExps,
      context_destination: city,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// GET /recommendations - multi-factor scored recommendations
aiRouter.get('/recommendations', async (req, res) => {
  try {
    const { city = 'Jaipur', prompt, traveler_type, max_budget, limit = '10' } = req.query;

    let intent = prompt ? parseIntentFromPrompt(prompt) : null;
    if (!intent) {
      intent = {
        traveler_type: traveler_type || 'Family with Kids',
        budget: max_budget ? parseFloat(max_budget) : 3000,
        interests: ['culture', 'food', 'workshop'],
        accessibility_prefs: { low_walking: false },
      };
    }

    const exps = await dbAll('SELECT * FROM experiences WHERE LOWER(city) = ? AND is_active = 1', [city.toLowerCase()]);
    const scoredList = exps.map((exp) => {
      const { score, match_reasons } = scoreExperience(exp, intent, null, { is_raining: false });
      return {
        experience: {
          ...exp,
          is_indoor: Boolean(exp.is_indoor),
          is_rain_safe: Boolean(exp.is_rain_safe),
          is_hidden_gem: Boolean(exp.is_hidden_gem),
          is_family_friendly: Boolean(exp.is_family_friendly),
          low_walking: Boolean(exp.low_walking),
          wheelchair_accessible: Boolean(exp.wheelchair_accessible),
          tags: typeof exp.tags === 'string' ? JSON.parse(exp.tags || '[]') : exp.tags || [],
          image_urls: typeof exp.image_urls === 'string' ? JSON.parse(exp.image_urls || '[]') : exp.image_urls || [],
        },
        score,
        match_reasons,
        estimated_start_time: '10:00 AM',
      };
    });

    scoredList.sort((a, b) => b.score - a.score);
    res.json(scoredList.slice(0, parseInt(limit, 10)));
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});
