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

// Helper: Generate contextual rule-based response when Gemini is offline
export function generateFallbackResponse(message, city, recommendedPlaces = []) {
  const msg = (message || '').toLowerCase();
  let baseReply = '';

  if (msg.includes('food') || msg.includes('eat') || msg.includes('street') || msg.includes('culinary')) {
    baseReply = `For culinary discovery in **${city}**, I've prioritized authentic generational food traditions, local sweet-makers, and iconic flavor alleys.`;
  } else if (msg.includes('craft') || msg.includes('pottery') || msg.includes('textile') || msg.includes('art')) {
    baseReply = `For artisanal exploration in **${city}**, I've curated hands-on workshops with master craftspeople so you can experience living traditions firsthand.`;
  } else if (msg.includes('family') || msg.includes('kids') || msg.includes('children')) {
    baseReply = `For traveling with family in **${city}**, I've chosen comfortable, accessible spots with gentle pacing and engaging cultural stories for all ages.`;
  } else if (msg.includes('budget') || msg.includes('cheap') || msg.includes('affordable')) {
    baseReply = `To keep within your budget in **${city}**, these selections offer maximum cultural immersion with low or no entry fees.`;
  } else if (msg.includes('hour') || msg.includes('time') || msg.includes('duration')) {
    baseReply = `Based on your available time in **${city}**, I've selected 2 signature stops that are nearby each other to minimize transit and avoid rushing.`;
  } else {
    baseReply = `Based on your request, here are 2 signature cultural highlights in **${city}** that capture its authentic heritage.`;
  }

  if (Array.isArray(recommendedPlaces) && recommendedPlaces.length > 0) {
    const names = recommendedPlaces.map((r) => `**${r.experience?.title || r.title || 'Selected Experience'}**`).join(' and ');
    return `${baseReply}\n\nI recommend starting with ${names}.\n\n*If your available time, budget, or preferred vibe changes, just let me know and I'll adapt your recommendations immediately!*`;
  }

  return baseReply;
}

// POST /ai/concierge - real AI Cultural Concierge using destination-first flow
aiRouter.post('/concierge', async (req, res) => {
  try {
    const { message, chat_history = [], city: requestedCity, state = 'India' } = req.body;
    if (!message) return res.status(400).json({ detail: 'Message is required' });

    const cleanMsg = message.trim().toLowerCase();
    const isGreeting = /^(hi|hello|hey|namaste|hola|good\s+(morning|afternoon|evening)|sup|yo|start|help|hi there|hello there|hi how are you|hello how are you|how are you|hey there|greetings)[\s!.]*$/i.test(cleanMsg);

    // 1. Resolve active destination city
    // A. Check current message for explicit city mention
    const mentionedInMessage = detectCityFromText(message);

    // B. Check user turns ONLY in chat_history (NEVER scan assistant turns, which list example cities!)
    let cityInUserHistory = null;
    if (Array.isArray(chat_history)) {
      for (let i = chat_history.length - 1; i >= 0; i--) {
        const turn = chat_history[i];
        if (turn && turn.role === 'user' && typeof turn.content === 'string') {
          const detected = detectCityFromText(turn.content);
          if (detected) {
            cityInUserHistory = detected;
            break;
          }
        }
      }
    }

    // Do not use requestedCity if it was defaulted to 'Mumbai' without user input
    const cleanRequestedCity = requestedCity && requestedCity.trim() && requestedCity.toLowerCase() !== 'mumbai'
      ? requestedCity.trim()
      : null;

    let activeCity = mentionedInMessage || cleanRequestedCity || cityInUserHistory || null;
    const intent = parseIntentFromPrompt(message);

    // 2. CASE: Greeting ("hi", "hello", "hey", "namaste", etc.)
    // Directives: Answer the greeting properly and ask the questions before recommending!
    // NEVER return place recommendations on greetings!
    if (isGreeting) {
      if (!activeCity) {
        return res.json({
          reply: `Hello! Namaste 🙏 Welcome to LOKIVA, your personal AI Cultural Concierge.\n\nI am here to help you experience the living soul of India — from timeless heritage monuments and sacred rituals to generational street food stalls and hands-on master artisan workshops.\n\nBefore I recommend any places, could you share a few details?\n1. **Where are you heading?** Which Indian city or destination are you exploring or planning to visit? (e.g., Jaipur, Varanasi, Udaipur, Delhi, Mumbai, Kochi, Goa)\n2. **How much time do you have?** (e.g., 2–3 hours quick stop, a half day, or a full day?)\n3. **Who is traveling?** (Solo explorer, couple, or family with kids/elders?)\n4. **What is your budget & preferred vibe?** (Historic architecture, hands-on craft workshops, food trails, or quiet spiritual heritage?)\n\nTell me where you're heading and what you enjoy, and I'll curate the top 2 signature spots perfectly suited for you!`,
          tokens_used: 25,
          model: 'lokiva-instant',
          extracted_intent: intent,
          suggested_experiences: [],
          context_destination: null,
          state: 'India',
        });
      } else {
        return res.json({
          reply: `Hello! Namaste 🙏 Ready to explore **${activeCity}**?\n\nBefore I recommend places, tell me a bit about your travel plans so I can tailor them for you:\n• **How many hours do you have available?** (e.g., 2–3 hours, half day, or full day?)\n• **What is your rough budget, and are you traveling solo, as a couple, or with family?**\n• **What kind of experiences do you prefer?** (Living history & monuments, hands-on craft workshops, or generational street food?)\n\nShare what you're in the mood for, and I'll recommend the top 2 cultural spots for you!`,
          tokens_used: 20,
          model: 'lokiva-instant',
          extracted_intent: intent,
          suggested_experiences: [],
          context_destination: activeCity,
          state,
        });
      }
    }

    // 3. CASE: No destination known yet
    if (!activeCity) {
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
          reply: `Namaste! I'd love to help you plan an authentic trip. Which city or destination in India are you exploring or planning to visit? (e.g., Jaipur, Varanasi, Udaipur, Delhi, Mumbai, Kochi, Goa)\n\nOnce you share your destination and how much time you have, I will curate the top 2 cultural spots for you!`,
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

    // 4. Destination IS known (activeCity is set)
    // Check if user ONLY mentioned the city and hasn't asked for places or shared constraints yet
    const strippedMsg = cleanMsg.replace(/[.,!]/g, '').trim();
    const isJustCity =
      strippedMsg === activeCity.toLowerCase() ||
      strippedMsg === `i want to explore ${activeCity.toLowerCase()}` ||
      strippedMsg === `i am in ${activeCity.toLowerCase()}` ||
      strippedMsg === `heading to ${activeCity.toLowerCase()}` ||
      strippedMsg === `visiting ${activeCity.toLowerCase()}` ||
      strippedMsg === `going to ${activeCity.toLowerCase()}` ||
      strippedMsg === `explore ${activeCity.toLowerCase()}`;

    if (isJustCity) {
      return res.json({
        reply: `Wonderful! **${activeCity}** has an incredible cultural fabric.\n\nTo ensure I recommend the 2 best places tailored specifically to your visit:\n1. **How much time do you have?** (e.g., 2–3 hours, half a day, or a full day?)\n2. **Who is traveling and what's your rough budget?** (Solo explorer, couple, or family with kids/elders?)\n3. **What excites you most?** (Royal architecture & forts, hands-on master artisan workshops like pottery/textiles, or authentic regional food trails?)\n\nTell me your preferences, and I'll curate the top 2 spots for you!`,
        tokens_used: 20,
        model: 'lokiva-instant',
        extracted_intent: intent,
        suggested_experiences: [],
        context_destination: activeCity,
        state,
      });
    }

    // 5. User has specified activeCity and provided preferences OR asked a question / for recommendations
    // Query experiences for activeCity
    const cityExps = await dbAll(
      `SELECT id, title, category, price, approx_duration_mins, tagline, description, cultural_context,
              wheelchair_accessible, low_walking, is_indoor, is_rain_safe, is_hidden_gem, image_urls, tags
       FROM experiences
       WHERE LOWER(city) = ? AND is_active = 1
       LIMIT 15`,
      [activeCity.toLowerCase()]
    );

    // Score experiences based on extracted intent
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

    // Check if the user is asking for places/activities or sharing constraints (vs asking general knowledge question)
    const hasPreferencesOrSeekingRecs =
      /(hour|hr|half\s*day|full\s*day|budget|₹|rs|rupee|family|kids|children|couple|solo|friend|food|eat|street|craft|pottery|textile|walk|temple|fort|palace|monument|museum|recommend|places|spot|visit|attraction|itinerary|see|do|what to|where to)/i.test(cleanMsg) ||
      Boolean(intent.budget && intent.budget !== 2500) ||
      Boolean(intent.available_hours && intent.available_hours !== 8) ||
      Boolean(intent.traveler_type && intent.traveler_type !== 'Solo Explorer') ||
      Boolean(intent.interests && intent.interests.length > 0);

    const placesToAttach = hasPreferencesOrSeekingRecs ? topRecommendations : [];

    let aiResponse;
    try {
      aiResponse = await chatWithCulturalConcierge({
        userMessage: message,
        chatHistory: chat_history,
        city: activeCity,
        availableExperiences: topRecommendations.map((r) => r.experience),
      });
    } catch (aiErr) {
      console.warn('AI Concierge model unavailable, using contextual fallback:', aiErr.message);
      aiResponse = {
        reply: generateFallbackResponse(message, activeCity, placesToAttach),
        tokensUsed: 0,
        model: 'cultural-concierge-local',
      };
    }

    res.json({
      reply: aiResponse.reply,
      tokens_used: aiResponse.tokensUsed || 0,
      model: aiResponse.model || 'gemini-3.5-flash',
      extracted_intent: intent,
      suggested_experiences: placesToAttach,
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
