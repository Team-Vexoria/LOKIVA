import express from 'express';
import { dbAll, dbGet } from '../db/db.js';
import { parseIntentFromPrompt, scoreExperience } from '../services/algorithms.js';
import {
  chatWithCulturalConcierge,
  extractTravelIntent,
  checkGeminiHealth,
  generateDayPlanWithGemini,
} from '../services/geminiService.js';

export const aiRouter = express.Router();

// POST /ai/day-plan - Generate day plan using Gemini from 8 onboarding answers
aiRouter.post('/day-plan', async (req, res) => {
  try {
    const {
      destination,
      time_available,
      budget,
      group_type,
      interests,
      food_preferences,
      mobility,
      vibe,
    } = req.body;

    const plan = await generateDayPlanWithGemini({
      destination,
      time_available,
      budget,
      group_type,
      interests,
      food_preferences,
      mobility,
      vibe,
    });

    res.json(plan);
  } catch (err) {
    console.error('Day Plan Generation Error:', err);
    res.status(500).json({ detail: err.message || 'Failed to generate day plan' });
  }
});

// GET /ai/health - Check AI service status
aiRouter.get('/health', async (req, res) => {
  try {
    const status = await checkGeminiHealth();
    res.json(status);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

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

const KNOWN_CITIES = [
  'Mumbai', 'Jaipur', 'Delhi', 'New Delhi', 'Varanasi', 'Banaras', 'Kashi',
  'Goa', 'Kochi', 'Cochin', 'Udaipur', 'Agra', 'Amritsar', 'Bengaluru',
  'Bangalore', 'Kolkata', 'Calcutta', 'Hyderabad', 'Pune', 'Chennai', 'Madurai',
  'Pondicherry', 'Puducherry', 'Hampi', 'Rishikesh', 'Haridwar', 'Shimla',
  'Darjeeling', 'Srinagar', 'Lucknow', 'Bhopal', 'Bhubaneswar', 'Mysore',
  'Mysuru', 'Jodhpur', 'Puri', 'Shillong', 'Gangtok', 'Munnar', 'Khajuraho',
  'Mathura', 'Bodh Gaya', 'Mahabalipuram', 'Leh', 'Ujjain', 'Patan'
];

function detectCityFromText(text) {
  if (!text || typeof text !== 'string') return null;
  for (const city of KNOWN_CITIES) {
    const regex = new RegExp(`\\b${city}\\b`, 'i');
    if (regex.test(text)) {
      if (/bangalore/i.test(city)) return 'Bengaluru';
      if (/puducherry/i.test(city)) return 'Pondicherry';
      if (/calcutta/i.test(city)) return 'Kolkata';
      if (/banaras|kashi/i.test(city)) return 'Varanasi';
      if (/cochin/i.test(city)) return 'Kochi';
      if (/mysuru/i.test(city)) return 'Mysore';
      if (/new delhi/i.test(city)) return 'Delhi';
      return city;
    }
  }
  return null;
}

// POST /ai/concierge - real AI Cultural Concierge using destination-first flow
aiRouter.post('/concierge', async (req, res) => {
  try {
    const { message, chat_history = [], city: requestedCity, state = 'India' } = req.body;
    if (!message) return res.status(400).json({ detail: 'Message is required' });

    // 1. Resolve active destination city
    let activeCity = requestedCity && requestedCity !== 'Mumbai' ? requestedCity : null;
    const mentionedInMessage = detectCityFromText(message);
    if (mentionedInMessage) {
      activeCity = mentionedInMessage;
    } else if (!activeCity && Array.isArray(chat_history)) {
      for (let i = chat_history.length - 1; i >= 0; i--) {
        const turnCity = chat_history[i].city || detectCityFromText(chat_history[i].content);
        if (turnCity) {
          activeCity = turnCity;
          break;
        }
      }
    }
    if (!activeCity && requestedCity && requestedCity.trim()) {
      activeCity = requestedCity.trim();
    }

    const intent = parseIntentFromPrompt(message);
    const cleanMsg = message.trim().toLowerCase();
    const isGreeting = /^(hi|hello|hey|namaste|hola|good\s+(morning|afternoon|evening)|sup|yo|start|help|hi how are you|hello how are you)[\s!.]*$/i.test(cleanMsg);

    // 2. If NO destination city has been established yet:
    if (!activeCity) {
      // Do NOT send unsolicited recommendations!
      if (isGreeting) {
        return res.json({
          reply: `Namaste! 🙏 I'm your LOKIVA Cultural Concierge.\n\nWhich Indian city or destination are you heading to or exploring right now? (e.g., Jaipur, Varanasi, Mumbai, Goa, Delhi, Kochi, Udaipur, etc.)\n\nTell me where you're going, and I'll recommend 2 signature cultural spots and ask a few quick questions to customize a feasible plan for you!`,
          tokens_used: 10,
          model: 'lokiva-instant',
          extracted_intent: intent,
          suggested_experiences: [],
          context_destination: null,
          state: 'India',
        });
      }

      // Call AI to answer their general question and ask for their destination city
      let aiResponse;
      try {
        aiResponse = await chatWithCulturalConcierge({
          userMessage: message,
          chatHistory: chat_history,
          city: null,
          availableExperiences: [],
        });
      } catch (aiErr) {
        aiResponse = {
          reply: `Namaste! I'd love to help you plan an authentic trip. Which city or destination in India are you exploring or planning to visit? (e.g. Jaipur, Varanasi, Mumbai, Goa, Delhi, etc.) Once you tell me the city, I'll recommend 2 signature cultural spots!`,
          tokensUsed: 0,
          model: 'cultural-concierge-local',
        };
      }

      return res.json({
        reply: aiResponse.reply,
        tokens_used: aiResponse.tokensUsed || 0,
        model: aiResponse.model || 'gemini-3.5-flash',
        extracted_intent: intent,
        suggested_experiences: [],
        context_destination: null,
        state: 'India',
      });
    }

    // 3. Destination IS known (activeCity is set!)
    // Look up experiences for the specific destination city
    const cityExps = await dbAll(
      `SELECT title, category, price, approx_duration_mins, tagline, description, cultural_context,
              wheelchair_accessible, low_walking, is_indoor, is_rain_safe, is_hidden_gem
       FROM experiences
       WHERE LOWER(city) = ? AND is_active = 1
       LIMIT 10`,
      [activeCity.toLowerCase()]
    );

    // Score experiences based on the extracted intent
    const scoredExperiences = cityExps.map((exp) => {
      const { score, match_reasons } = scoreExperience(exp, intent, null, { is_raining: false });
      return {
        experience: {
          ...exp,
          is_indoor: Boolean(exp.is_indoor),
          is_rain_safe: Boolean(exp.is_rain_safe),
          is_hidden_gem: Boolean(exp.is_hidden_gem),
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

    scoredExperiences.sort((a, b) => b.score - a.score);
    // User directive: "just recommend 2 places, and you can ask more questions to them based on the answers we will change our places recommendation"
    const topRecommendations = scoredExperiences.slice(0, 2);

    // Fast greeting when city was just mentioned (e.g. user just said "Jaipur" or "I am in Jaipur")
    const justCityName = cleanMsg.replace(/[.,!]/g, '').trim();
    if (justCityName === activeCity.toLowerCase() || isGreeting) {
      return res.json({
        reply: `Wonderful! **${activeCity}** has an incredible cultural fabric.\n\nHere are 2 signature experiences to anchor your visit. To tailor this into a plan that works for you:\n• How many hours do you have available?\n• What's your rough budget, and are you traveling solo, with a partner, or with family?\n• Do you prefer historic architecture, generational food trails, or hands-on artisan crafts?`,
        tokens_used: 15,
        model: 'lokiva-instant',
        extracted_intent: intent,
        suggested_experiences: topRecommendations,
        context_destination: activeCity,
        state,
      });
    }

    // Call Cultural Concierge grounded in the city's verified experiences
    let aiResponse;
    try {
      aiResponse = await chatWithCulturalConcierge({
        userMessage: message,
        chatHistory: chat_history,
        city: activeCity,
        availableExperiences: cityExps,
      });
    } catch (aiErr) {
      console.warn('AI Concierge model unavailable, using contextual fallback:', aiErr.message);
      aiResponse = {
        reply: generateFallbackResponse(message, activeCity),
        tokensUsed: 0,
        model: 'cultural-concierge-local',
      };
    }

    res.json({
      reply: aiResponse.reply,
      tokens_used: aiResponse.tokensUsed || 0,
      model: aiResponse.model || 'gemini-3.5-flash',
      extracted_intent: intent,
      suggested_experiences: topRecommendations,
      context_destination: activeCity,
      state,
    });
  } catch (err) {
    console.error('Concierge Error:', err);
    res.status(500).json({ detail: err.message });
  }
});

// POST /ai/chat - legacy endpoint (falls back to rule-based if Gemini not configured)
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message, chat_history = [], city = 'Jaipur' } = req.body;
    if (!message) return res.status(400).json({ detail: 'Message is required' });

    // Check if Gemini is configured
    const health = await checkGeminiHealth();
    const isConfigured = health.status === 'healthy';

    if (!isConfigured) {
      // Fallback to rule-based responses if OpenAI not configured
      return res.json({
        reply: getRuleBasedResponse(message, city),
        extracted_intent: parseIntentFromPrompt(message),
        suggested_experiences: [],
        context_destination: city,
      });
    }

    // Use OpenAI
    const cityExps = await dbAll(
      `SELECT title, category, price, approx_duration_mins, tagline, description, cultural_context,
              wheelchair_accessible, low_walking, is_indoor, is_rain_safe, is_hidden_gem
       FROM experiences
       WHERE LOWER(city) = ? AND is_active = 1
       LIMIT 8`,
      [city.toLowerCase()]
    );

    const aiResponse = await chatWithCulturalConcierge({
      userMessage: message,
      chatHistory: chat_history,
      city,
      availableExperiences: cityExps,
    });

    const intent = await extractTravelIntent(message);

    const scoredExperiences = cityExps.map((exp) => {
      const { score, match_reasons } = scoreExperience(exp, intent, null, { is_raining: false });
      return {
        experience: {
          ...exp,
          is_indoor: Boolean(exp.is_indoor),
          is_rain_safe: Boolean(exp.is_rain_safe),
          is_hidden_gem: Boolean(exp.is_hidden_gem),
          low_walking: Boolean(exp.low_walking),
          wheelchair_accessible: Boolean(exp.wheelchair_accessible),
          tags: typeof exp.tags === 'string' ? JSON.parse(exp.tags || '[]') : exp.tags || [],
          image_urls: typeof exp.image_urls === 'string' ? JSON.parse(exp.image_urls || '[]') : exp.image_urls || [],
        },
        score,
        match_reasons,
      };
    });

    scoredExperiences.sort((a, b) => b.score - a.score);

    res.json({
      reply: aiResponse.reply,
      extracted_intent: intent,
      suggested_experiences: scoredExperiences.slice(0, 4),
      context_destination: city,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
});

// Rule-based fallback responses (when OpenAI is not configured)
function getRuleBasedResponse(message, city) {
  const msg = message.toLowerCase();

  if (msg.includes('rain') || msg.includes('weather') || msg.includes('monsoon')) {
    return `In case of unexpected rain in **${city}**, I recommend prioritizing sheltered artisan studios like traditional blue pottery, haveli heritage walks, or culinary tea tastings which remain 100% comfortable!`;
  }

  if (msg.includes('food') || msg.includes('eat') || msg.includes('restaurant') || msg.includes('street')) {
    return `For food lovers in **${city}**, you can explore authentic generational sweet-makers, clay-cup chai in bazaar alleys, and heritage cooking workshops with local families! Would you like me to build a specific food itinerary?`;
  }

  if (msg.includes('budget') || msg.includes('cheap') || msg.includes('affordable')) {
    return `For budget travelers in **${city}**, you can enjoy free heritage walks, community cooking classes, temple visits, and local street food markets. I can create a cost-optimized itinerary for you!`;
  }

  if (msg.includes('family') || msg.includes('kids') || msg.includes('children')) {
    return `For families in **${city}**, I recommend interactive craft workshops, gentle heritage walks, and kid-friendly cultural experiences with storytelling. What age range are your kids?`;
  }

  if (msg.includes('solo') || msg.includes('solo traveler')) {
    return `Solo travelers in **${city}** will love intimate craft workshops, small-group cooking classes, and walking tours where you can connect deeply with local culture. Would you prefer cultural immersion or quiet reflection?`;
  }

  if (msg.includes('craft') || msg.includes('pottery') || msg.includes('art')) {
    return `**${city}** has incredible traditional crafts! From hand-block printing to blue pottery and metalwork, you can join hands-on workshops with master artisans. What craft interests you?`;
  }

  if (msg.includes('time') || msg.includes('hours') || msg.includes('duration')) {
    return `I can create optimized itineraries for any time frame - whether you have just 2 hours or a full day in **${city}**. How much time do you have available?`;
  }

  // Default generic response
  return `Namaste! I'm your LOKIVA Cultural Concierge in **${city}**.\n\nTell me about your travel situation - how many hours you have, your budget, who you're traveling with, and what interests you most. I'll build you a perfectly paced cultural itinerary!`;
}

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
