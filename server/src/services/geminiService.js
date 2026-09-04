import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Google retires model aliases (e.g. the old `gemini-pro`) without warning, which
// surfaces as a 404 from generateContent. So never hardcode a single name: try an
// ordered list, remember the first one that works, and fall back to asking the API
// what this key can actually reach.
const DEFAULT_MODEL_CANDIDATES = [
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-flash-latest',
];

const MODEL_CANDIDATES = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL, ...DEFAULT_MODEL_CANDIDATES.filter((m) => m !== process.env.GEMINI_MODEL)]
  : DEFAULT_MODEL_CANDIDATES;

// First model name known to work for this key, so we stop paying discovery cost.
let workingModelName = null;
let apiDiscoveryTried = false;

/** A 404, unsupported-model, 503 high-demand, rate-limit, timeout, or transient error is worth retrying with next model. */
function isModelUnavailable(error) {
  const msg = error?.message || '';
  return /404|not found|is not supported|not supported for|503|service unavailable|high demand|spikes in demand|overloaded|temporarily unavailable|unavailable|timeout|timed out|exceeded|500|502|504|429|resource_exhausted/i.test(msg);
}

/** Only a bad key or invalid permissions will fail identically for every model — stop early. */
function isFatalError(error) {
  const msg = error?.message || '';
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED/i.test(msg);
}

/**
 * Retirement 404s name their own replacement, e.g.
 *   "This model models/gemini-2.0-flash is no longer available.
 *    Please update your code to use models/gemini-3.6-flash"
 * That hint is more current than any list we hardcode, so prefer it.
 */
function extractRecommendedModel(error) {
  const msg = error?.message || '';
  const match = msg.match(/use\s+models\/([a-zA-Z0-9.\-_]+)/);
  return match ? match[1] : null;
}

/** Ask the API which models this key can actually use for generateContent. */
async function discoverModelsFromApi() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || typeof fetch !== 'function') return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?pageSize=200&key=${encodeURIComponent(key)}`
    );
    if (!res.ok) return [];

    const data = await res.json();
    return (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => String(m.name).replace(/^models\//, ''))
      // Prefer flash (cheap/fast) over pro, and skip previews/experiments.
      .filter((n) => /flash|pro/.test(n) && !/vision|embed|aqa|thinking|exp|preview/.test(n))
      .sort((a, b) => (a.includes('flash') === b.includes('flash') ? 0 : a.includes('flash') ? -1 : 1));
  } catch {
    return [];
  }
}

/** Candidate names to attempt, best-known first. */
function candidateOrder() {
  if (!workingModelName) return [...MODEL_CANDIDATES];
  return [workingModelName, ...MODEL_CANDIDATES.filter((n) => n !== workingModelName)];
}

/**
 * Run a prompt against the first Gemini model that answers.
 * @returns {Promise<{text: string, modelName: string}>}
 */
async function generateWithFallback(prompt, { systemInstruction, generationConfig, history } = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.');
  }

  const queue = candidateOrder();
  const tried = new Set();
  let lastError = null;

  while (queue.length > 0) {
    const modelName = queue.shift();
    if (tried.has(modelName)) continue;
    tried.add(modelName);

    try {
      const activeModel = genAI.getGenerativeModel({
        model: modelName,
        ...(systemInstruction ? { systemInstruction } : {}),
        ...(generationConfig ? { generationConfig } : {}),
      });

      const requestPromise = history?.length
        ? activeModel.startChat({ history }).sendMessage(prompt)
        : activeModel.generateContent(prompt);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout: ${modelName} exceeded 6000ms response window`)), 6000)
      );

      const result = await Promise.race([requestPromise, timeoutPromise]);

      workingModelName = modelName;
      return { text: result.response.text(), modelName };
    } catch (error) {
      lastError = error;

      // An invalid key or blown quota fails the same way for every model.
      if (isFatalError(error)) throw error;

      if (!isModelUnavailable(error)) throw error;

      // This name is gone; don't keep preferring it.
      if (workingModelName === modelName) workingModelName = null;
      console.warn(`Gemini model "${modelName}" unavailable: ${error.message}`);

      // The 404 usually names its successor — jump straight to it.
      const recommended = extractRecommendedModel(error);
      if (recommended && !tried.has(recommended)) {
        queue.unshift(recommended);
        continue;
      }

      // Out of guesses: ask the API what this key can actually reach, once per process.
      if (queue.length === 0 && !apiDiscoveryTried) {
        apiDiscoveryTried = true;
        const fresh = (await discoverModelsFromApi()).filter((n) => !tried.has(n));
        if (fresh.length > 0) {
          console.warn(`Falling back to models discovered from the API: ${fresh.slice(0, 4).join(', ')}`);
          queue.push(...fresh.slice(0, 4));
        }
      }
    }
  }

  throw lastError || new Error('No usable Gemini model found for this API key.');
}

/**
 * Gemini requires history to open on a user turn, strictly alternate, and end on a
 * model turn (the new message becomes the next user turn). Anything else is rejected.
 */
function sanitizeHistory(chatHistory) {
  const mapped = (chatHistory || [])
    .filter((msg) => msg && typeof msg.content === 'string' && msg.content.trim())
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

  // Drop any leading model turns — history must open with 'user'.
  const firstUser = mapped.findIndex((m) => m.role === 'user');
  if (firstUser === -1) return [];

  // Keep only turns that alternate, dropping consecutive same-role duplicates.
  const alternating = [];
  for (const turn of mapped.slice(firstUser)) {
    if (alternating.length === 0 || alternating[alternating.length - 1].role !== turn.role) {
      alternating.push(turn);
    }
  }

  // A trailing user turn would collide with the message we're about to send.
  if (alternating[alternating.length - 1]?.role === 'user') alternating.pop();

  return alternating;
}

/**
 * AI Cultural Concierge - Chat with Gemini about travel, culture, food
 * @param {string} userMessage - User's question or request
 * @param {Array} chatHistory - Previous conversation messages for context
 * @param {string} city - Current destination city
 * @param {Array} availableExperiences - Relevant experiences from database for grounding
 * @returns {Promise<Object>} AI response with recommendations
 */
export async function chatWithCulturalConcierge({
  userMessage,
  chatHistory = [],
  city = null,
  availableExperiences = [],
}) {
  try {
    let systemPrompt = '';

    if (!city) {
      systemPrompt = `You are LOKIVA's AI Cultural Concierge - an expert, warm, and authentic guide for cultural travel across India.

**Current Situation:**
The traveler has NOT yet specified which Indian city or destination they are visiting or planning to visit.

**Your Instructions:**
1. Respond to whatever the traveler said with genuine warmth and conversational charm (e.g., if they say "hi how are you", greet them warmly and express your excitement to help).
2. Directly and politely ask them which city or destination in India they are heading to or exploring (give brief examples like Jaipur, Varanasi, Mumbai, Goa, Delhi, or Kochi).
3. Do NOT invent or assume a default city like Mumbai or Delhi. Do NOT list specific experience cards until they name their destination.
4. Keep your reply concise (1-2 short paragraphs), friendly, and inviting.`;
    } else {
      // Build concise context about available experiences for the specific city
      const experiencesContext = availableExperiences.length > 0
        ? availableExperiences.slice(0, 5)
            .map((exp, idx) => `${idx + 1}. **${exp.title}** (${exp.category}) - ₹${exp.price}, ~${exp.approx_duration_mins} mins: ${exp.tagline || exp.description || ''}`)
            .join('\n')
        : 'Verified cultural experiences loaded dynamically.';

      systemPrompt = `You are LOKIVA's AI Cultural Concierge - an expert guide for authentic cultural travel in ${city}, India.

**Curated Experiences in ${city}:**
${experiencesContext}

**Your Instructions:**
1. Respond directly and accurately to the traveler's question using verified context about ${city}.
2. Mention or highlight up to 2 signature places from ${city} that best match their inquiry.
3. If they haven't shared their key travel constraints yet, ask 1 or 2 targeted questions to tailor their plan:
   - How many hours do they have available?
   - What is their approximate budget and who are they traveling with (solo, couple, family with kids/elders)?
   - What vibe do they prefer (generational street food, artisan workshops, heritage walks, or architecture)?
4. If they have already shared constraints, acknowledge them and tailor your recommendations to fit those constraints.
5. Keep your answer conversational, punchy, and practical (2-3 short paragraphs max). Never write generic essays.

Current Destination: ${city}, India`;
    }

    // Pass prior turns as real chat history so the concierge remembers the conversation,
    // and the persona as a system instruction rather than glued onto the user's message.
    const history = sanitizeHistory(chatHistory);

    const { text: aiReply, modelName } = await generateWithFallback(userMessage, {
      systemInstruction: systemPrompt,
      history,
      generationConfig: {
        maxOutputTokens: 450,
        temperature: 0.7,
      },
    });

    // Estimate tokens (Gemini doesn't provide exact count in free tier)
    const estimatedTokens = Math.floor((systemPrompt.length + userMessage.length + aiReply.length) / 4);

    return {
      reply: aiReply,
      tokensUsed: estimatedTokens,
      model: modelName,
    };
  } catch (error) {
    console.error('Gemini API Error:', error.message);

    if (error.message?.includes('API_KEY_INVALID')) {
      throw new Error('Gemini API key not configured. Please add GEMINI_API_KEY to your .env file.');
    }

    throw new Error(`AI Concierge Error: ${error.message}`);
  }
}

/**
 * Extract structured travel intent from natural language using Gemini
 */
export async function extractTravelIntent(userPrompt) {
  try {
    const systemPrompt = `You are an intent extraction system for a travel platform.
Extract structured travel constraints from user messages.

Return a JSON object with these fields:
{
  "traveler_type": "Solo Explorer" | "Couple" | "Family with Kids" | "Friends Group" | "Business Traveler",
  "group_size": number (1-10),
  "budget": number (in INR, extract maximum budget mentioned),
  "available_hours": number (time available in hours),
  "interests": array of strings (e.g., ["food", "culture", "art", "history", "nature"]),
  "accessibility_prefs": {
    "low_walking": boolean,
    "wheelchair_accessible": boolean,
    "is_indoor_preferred": boolean
  },
  "time_of_day": "morning" | "afternoon" | "evening" | "any",
  "is_rain_concern": boolean
}

Extract what's explicitly mentioned. Use reasonable defaults for missing information.`;

    const fullPrompt = `${systemPrompt}\n\nUser Message: ${userPrompt}`;

    const { text } = await generateWithFallback(fullPrompt, {
      generationConfig: { responseMimeType: 'application/json', temperature: 0 },
    });

    // Parse JSON from response (may be wrapped in markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const extractedIntent = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (extractedIntent) {
      return extractedIntent;
    }

    // Fallback to basic parsing if JSON extraction fails
    return {
      traveler_type: 'Solo Explorer',
      group_size: 1,
      budget: 2500,
      available_hours: 3,
      interests: ['culture', 'food'],
      accessibility_prefs: {
        low_walking: false,
        wheelchair_accessible: false,
        is_indoor_preferred: false,
      },
      time_of_day: 'any',
      is_rain_concern: false,
    };
  } catch (error) {
    console.error('Intent Extraction Error:', error.message);

    return {
      traveler_type: 'Solo Explorer',
      group_size: 1,
      budget: 2500,
      available_hours: 3,
      interests: ['culture', 'food'],
      accessibility_prefs: {
        low_walking: false,
        wheelchair_accessible: false,
        is_indoor_preferred: false,
      },
      time_of_day: 'any',
      is_rain_concern: false,
    };
  }
}

/**
 * Check if Gemini API is configured and working
 */
export async function checkGeminiHealth() {
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return {
        status: 'not_configured',
        message: 'Gemini API key not set in environment variables',
      };
    }

    // Test with a simple request
    const { modelName } = await generateWithFallback('Hello');

    return {
      status: 'healthy',
      message: `Gemini API is configured and working (model: ${modelName})`,
      model: modelName,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}

/**
 * Generate a personalized day plan using Gemini based on 8 onboarding answers
 */
export async function generateDayPlanWithGemini({
  destination,
  time_available,
  budget,
  group_type,
  interests = [],
  food_preferences,
  mobility,
  vibe,
}) {
  const systemPrompt = `You are Lokiva's day-plan generator. You build a single-day itinerary in a
specific Indian city using ONLY the user's onboarding answers as constraints.
Never default to a city's most famous landmarks unless they genuinely win
against alternatives on these specific constraints.

INPUTS you will receive: destination, time_available, budget, group_type,
interests (multi-select: heritage & history / food & street eats / art &
local markets / nature & scenic spots / shopping / offbeat & local life),
food_preferences, mobility (low-walking-or-wheelchair / moderate-walking-ok /
happy-to-walk), vibe (relaxed-and-slow / efficient-and-packed / a-mix).

RULES:
1. Constraint priority when trade-offs are needed: mobility > time_available >
   budget > interests > vibe > food_preferences.
2. Every stop must satisfy the mobility constraint literally — if
   low-walking-or-wheelchair is selected, do not include a stop requiring
   sustained walking or stairs without step-free access, even if it's
   otherwise a perfect interest match.
3. Every stop's "fit_reason" must cite the SPECIFIC answer it satisfies, in
   different words each time. Never reuse the same sentence across stops or
   across users. Bad: "Fits your budget & accessibility needs" (generic, reused).
   Good: "Step-free entry hall — matches your low-walking preference" or
   "No entry fee — comfortably inside your ₹1,000 budget."
4. If vibe is "efficient-and-packed," sequence tightly with minimal gaps and
   favor more, shorter stops. If "relaxed-and-slow," fewer stops with more
   time each and built-in slack between them.
5. If interests include food & street eats, at least one stop should be a
   specific eating experience (not a generic "explore the area"), and it must
   respect food_preferences.
6. feasibility_score (0–100) must be recomputed from how well the FULL plan
   satisfies ALL constraints together — mobility violations or budget
   overruns should visibly drop the score, not be hidden behind a high number.
7. If fewer than 3 genuinely good matches exist for these constraints, return
   fewer stops rather than padding with irrelevant ones.

Return ONLY valid JSON, no markdown fences, no preamble:

{
  "city": string,
  "feasibility_score": number,
  "feasibility_summary": string,
  "stops": [
    {
      "order": number,
      "time": string,
      "name": string,
      "duration_mins": number,
      "cost_label": string,
      "fit_reason": string,
      "match_notes": string | null
    }
  ]
}`;

  const interestsStr = Array.isArray(interests) ? interests.join(', ') : String(interests || '');
  const userPrompt = `Destination: ${destination || 'Jaipur'}
Time available: ${time_available || '4 Hours'}
Budget: ${budget || '₹1,500'}
Who this is for: ${group_type || 'Solo Explorer'}
Interests: ${interestsStr || 'Heritage & History'}
Food preferences: ${food_preferences || 'Vegetarian'}
Mobility: ${mobility || 'Moderate Walking'}
Vibe: ${vibe || 'Balanced mix'}

Generate today's plan following the system rules exactly.`;

  // Model fallback is handled centrally by generateWithFallback; retry here only
  // guards against a malformed JSON response, not a missing model.
  let lastError = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { text } = await generateWithFallback(userPrompt, {
        systemInstruction: systemPrompt,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(text);
      if (parsed && Array.isArray(parsed.stops)) {
        return parsed;
      }
      lastError = new Error('Response did not contain a "stops" array');
    } catch (err) {
      console.warn(`Day plan attempt ${attempt + 1} failed:`, err.message);
      lastError = err;

      // A bad key or blown quota won't fix itself on retry.
      if (isFatalError(err)) break;
    }
  }

  throw new Error(`Failed to generate day plan after retries: ${lastError?.message || 'Unknown error'}`);
}

function fallbackExtractListing(rawText) {
  const lower = rawText.toLowerCase();
  
  // Extract price if mentioned
  const priceMatch = rawText.match(/(?:₹|rs\.?|inr)\s*(\d+)/i) || rawText.match(/(\d+)\s*(?:rupees|inr|\/\s*pax|per pax)/i);
  const price = priceMatch ? parseInt(priceMatch[1], 10) : 500;

  // Extract duration if mentioned
  let duration_mins = 75;
  const durMatch = rawText.match(/(\d+)\s*(?:mins?|minutes?)/i);
  const hourMatch = rawText.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?)/i);
  if (durMatch) {
    duration_mins = parseInt(durMatch[1], 10);
  } else if (hourMatch) {
    duration_mins = Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // Detect category
  let category = 'Art & Craft';
  if (/curry|cook|food|tasting|thali|culinary|chef|baking|spices/i.test(rawText)) {
    category = 'Culinary & Food';
  } else if (/walk|heritage|trail|architecture|history|colonial|monument|ruins/i.test(rawText)) {
    category = 'Heritage & Walking Tour';
  } else if (/music|dance|theatre|pottery|craft|dyeing|printing|painting|weaving|sculpt/i.test(rawText)) {
    category = 'Art & Craft';
  } else if (/nature|bird|trek|hike|mangrove|garden|safari/i.test(rawText)) {
    category = 'Nature & Outdoor';
  }

  const is_wheelchair = /wheelchair|step-free|step free|ramp|accessible/i.test(rawText);
  const is_step_free = /step-free|step free|ramp|ground floor|no stairs/i.test(rawText) || is_wheelchair;
  const is_indoor = /indoor|studio|atelier|workshop|kitchen|air condition|ac/i.test(rawText);

  // Generate an attractive title
  let title = rawText.split('.')[0].trim();
  if (title.length > 60 || title.length < 10) {
    if (category === 'Culinary & Food') {
      title = 'Traditional Culinary & Heirloom Recipe Masterclass';
    } else if (category === 'Heritage & Walking Tour') {
      title = 'Historic Neighborhood Heritage & Architecture Trail';
    } else {
      title = 'Authentic Generational Artisan Craft Workshop';
    }
  }

  const accessibility = [];
  if (is_wheelchair) accessibility.push('Wheelchair Accessible');
  if (is_step_free) accessibility.push('Step-Free Ramp Entry');
  if (is_indoor) accessibility.push('Indoor Studio Setup');
  if (accessibility.length === 0) accessibility.push('Ground Floor Access');

  return {
    title,
    category,
    price,
    duration_mins,
    location: 'Bandra West, Mumbai',
    meeting_point: 'Artisan Atelier Main Gate, Bandra West',
    max_group_size: 8,
    description: rawText.length > 50
      ? rawText
      : `${rawText}. An authentic hands-on cultural experience curated by verified master artisans.`,
    whats_included: [
      'All workshop craft materials and tools',
      'Artisan guidance and cultural storytelling',
      'Handmade souvenir to take home',
      'Traditional tea and refreshments',
    ],
    requirements: [
      'Comfortable clothing suitable for hands-on activities',
      'No prior craft or cooking experience required',
    ],
    availability: 'Tuesday to Sunday · 10:30 AM & 3:30 PM slots',
    accessibility,
    suggestedPriceBand: `₹${Math.max(200, price - 100)} - ₹${price + 150} based on verified local host benchmarks`,
    is_wheelchair,
    is_step_free,
    is_indoor,
  };
}

export async function extractListingWithGemini(rawText) {
  if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
    throw new Error('Listing description text is required');
  }

  const systemPrompt = `You are LOKIVA's AI Co-Pilot for local artisans, heritage guides, and cultural hosts in India.
Convert the host's natural language description into a polished, structured experience listing.
Return ONLY a valid JSON object with the following fields:
{
  "title": "string (concise, captivating experience title, max 60 chars)",
  "category": "string (Must be one of: 'Art & Craft', 'Culinary & Food', 'Heritage & Walking Tour', 'Music & Performing Arts', 'Nature & Outdoor')",
  "price": number (integer INR per guest, e.g. 450, 600, 800),
  "duration_mins": number (integer duration in minutes, e.g. 60, 75, 90, 120),
  "location": "string (locality and city, e.g. 'Pali Hill, Bandra West, Mumbai')",
  "meeting_point": "string (specific easy-to-find landmark meeting point)",
  "max_group_size": number (integer, e.g. 6, 8, 10),
  "description": "string (2-3 engaging sentences describing the authentic hands-on experience, heritage technique, and cultural narrative)",
  "whats_included": ["string", "string", "string"],
  "requirements": ["string", "string"],
  "availability": "string (e.g. 'Tuesday to Sunday · 10:30 AM & 3:30 PM daily slots')",
  "accessibility": ["string accessibility features, e.g. 'Wheelchair Accessible', 'Step-Free Ramp'"],
  "suggestedPriceBand": "string (e.g. '₹400 - ₹550 based on 12 nearby artisan studios')",
  "is_wheelchair": boolean,
  "is_step_free": boolean,
  "is_indoor": boolean
}`;

  if (!process.env.GEMINI_API_KEY) {
    return fallbackExtractListing(rawText);
  }

  try {
    const aiPromise = generateWithFallback(rawText, {
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Extraction timeout 3500ms exceeded')), 3500)
    );

    const { text } = await Promise.race([aiPromise, timeoutPromise]);

    const parsed = JSON.parse(text);
    if (parsed && parsed.title && parsed.price) {
      return {
        ...parsed,
        price: Number(parsed.price) || 500,
        duration_mins: Number(parsed.duration_mins) || 75,
        max_group_size: Number(parsed.max_group_size) || 8,
        is_wheelchair: Boolean(parsed.is_wheelchair),
        is_step_free: Boolean(parsed.is_step_free),
        is_indoor: Boolean(parsed.is_indoor),
        whats_included: Array.isArray(parsed.whats_included) ? parsed.whats_included : [],
        requirements: Array.isArray(parsed.requirements) ? parsed.requirements : [],
        accessibility: Array.isArray(parsed.accessibility) ? parsed.accessibility : [],
      };
    }
    return fallbackExtractListing(rawText);
  } catch (err) {
    console.warn('Gemini copilot extraction falling back to heuristics:', err.message);
    return fallbackExtractListing(rawText);
  }
}

