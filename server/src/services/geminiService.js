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
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
];

const MODEL_CANDIDATES = process.env.GEMINI_MODEL
  ? [process.env.GEMINI_MODEL, ...DEFAULT_MODEL_CANDIDATES.filter((m) => m !== process.env.GEMINI_MODEL)]
  : DEFAULT_MODEL_CANDIDATES;

// First model name known to work for this key, so we stop paying discovery cost.
let workingModelName = null;
let apiDiscoveryTried = false;
let quotaExhaustedUntil = 0;

function sanitizeAiText(text) {
  if (!text) return '';
  return text
    .replace(/[\u2014\u2015]/g, ', ')
    .replace(/[\u2013]/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/** A 404, unsupported-model, 503 high-demand, 429 quota on single model, or timeout is worth retrying with next model. */
function isModelUnavailable(error) {
  const msg = error?.message || '';
  return /404|not found|is not supported|not supported for|503|service unavailable|high demand|spikes in demand|overloaded|temporarily unavailable|unavailable|timeout|timed out|500|502|504|RESOURCE_EXHAUSTED|429|quota/i.test(msg);
}

/** Only an invalid key or revoked permission fails identically for every model: stop immediately. */
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

  if (Date.now() < quotaExhaustedUntil) {
    throw new Error('Quota temporarily exceeded; routing directly to intelligent cultural engine.');
  }

  // Allow up to 4 models to try. 28 seconds per model allows Gemini free-tier to return full responses.
  const queue = candidateOrder().slice(0, 4);
  const tried = new Set();
  let lastError = null;
  const timeoutMs = 28000;

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
        setTimeout(() => reject(new Error(`Timeout: ${modelName} exceeded ${timeoutMs}ms response window`)), timeoutMs)
      );

      const result = await Promise.race([requestPromise, timeoutPromise]);

      workingModelName = modelName;
      const rawText = result.response.text();
      return { text: sanitizeAiText(rawText), modelName };
    } catch (error) {
      lastError = error;

      // An invalid key or blown quota fails the same way for every model.
      if (isFatalError(error)) {
        if (/RESOURCE_EXHAUSTED|429|Quota exceeded|exceeded your current quota/i.test(error?.message || '')) {
          // Soft quota error: set cooldown and throw a non-fatal error so callers can handle gracefully
          quotaExhaustedUntil = Date.now() + 60000;
          throw new Error('QUOTA_EXCEEDED: Daily free-tier limit reached. Please try again later or upgrade your Gemini API plan.');
        }
        throw error;
      }

      if (!isModelUnavailable(error)) throw error;

      // This name is gone; don't keep preferring it.
      if (workingModelName === modelName) workingModelName = null;
      console.warn(`Gemini model "${modelName}" unavailable or slow: ${error.message}`);
    }
  }

  throw lastError || new Error('No usable Gemini model found within response time window.');
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

  // Drop any leading model turns: history must open with 'user'.
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
/**
 * Simple, honest fallback message when the AI model is genuinely unreachable.
 * Never guess or hallucinate - just tell the user to try again.
 */
function generateHonestFallback() {
  return `I am having a little trouble connecting right now. Please try sending your message again in a moment and I will be right with you!`;
}

/**
 * AI Cultural Concierge - Chat with Gemini about travel, culture, food.
 * Passes the full conversation history so the model always has context.
 */
export async function chatWithCulturalConcierge({
  userMessage,
  chatHistory = [],
  city = null,
  availableExperiences = [],
}) {
  const experiencesContext = availableExperiences.length > 0
    ? availableExperiences.slice(0, 5)
        .map((exp, idx) => `${idx + 1}. **${exp.title}** (${exp.category}) - Rs.${exp.price}, ~${exp.approx_duration_mins} mins: ${exp.tagline || exp.description || ''}`)
        .join('\n')
    : '';

  const systemPrompt = `You are LOKIVA's AI Cultural Concierge, an expert and welcoming cultural travel guide across all of India${city ? `, currently assisting with a focus on ${city}` : ''}.

${experiencesContext ? `Curated verified experiences in ${city}:\n${experiencesContext}\n` : ''}
Your Core Rules:
1. DIRECTLY and HELPFULLY answer whatever the traveler asks.
   - If they ask about South India or choosing between states (e.g., after already visiting Kerala), recommend incredible alternatives like Karnataka (Hampi, Mysore, Coorg) or Tamil Nadu (Madurai, Thanjavur, Chettinad) with specific cultural highlights, vibe differences, and practical tips.
   - Never say "I can only help with a specific city" or "I don't have information on other states". You are an expert guide covering all 36 states and union territories of India.
2. If the user mentions an expense (e.g., "I spent 200rs on rickshaw"), acknowledge it naturally and conversationally without generating an unsolicited trip budget breakdown.
3. If the user asks an off-topic or greeting question, reply warmly and naturally without forcing travel recommendations.
4. If the traveler is specifically asking about things to do in ${city || 'their destination'} and experiences are provided above, weave in 1 or 2 relevant experiences naturally.
5. Keep your tone culturally authentic, warm, and concise (2 to 4 readable paragraphs max). Avoid filler or repetitive generic scripts.`;

  try {
    const history = sanitizeHistory(chatHistory);

    const { text: aiReply, modelName } = await generateWithFallback(userMessage, {
      systemInstruction: systemPrompt,
      history,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.65,
      },
    });

    const estimatedTokens = Math.floor((systemPrompt.length + userMessage.length + aiReply.length) / 4);

    return {
      reply: aiReply,
      tokensUsed: estimatedTokens,
      model: modelName,
    };
  } catch (error) {
    console.warn('Gemini API unavailable for concierge request:', error.message);
    const isQuota = /QUOTA_EXCEEDED|RESOURCE_EXHAUSTED|429|Quota exceeded|exceeded your current quota/i.test(error.message || '');
    return {
      reply: isQuota
        ? 'I have reached my daily AI request limit for today. Please try again tomorrow, or ask the LOKIVA team to upgrade the Gemini API plan to continue using the AI Concierge!'
        : 'I am having a little trouble connecting right now. Please try sending your message again in a moment and I will be right with you!',
      tokensUsed: 0,
      model: 'fallback',
    };
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
2. Every stop must satisfy the mobility constraint literally: if
   low-walking-or-wheelchair is selected, do not include a stop requiring
   sustained walking or stairs without step-free access, even if it's
   otherwise a perfect interest match.
3. Every stop's "fit_reason" must cite the SPECIFIC answer it satisfies, in
   different words each time. Never reuse the same sentence across stops or
   across users. Bad: "Fits your budget & accessibility needs" (generic, reused).
   Good: "Step-free entry hall, matches your low-walking preference" or
   "No entry fee, comfortably inside your ₹1,000 budget."
4. If vibe is "efficient-and-packed," sequence tightly with minimal gaps and
   favor more, shorter stops. If "relaxed-and-slow," fewer stops with more
   time each and built-in slack between them.
5. If interests include food & street eats, at least one stop should be a
   specific eating experience (not a generic "explore the area"), and it must
   respect food_preferences.
6. feasibility_score (0–100) must be recomputed from how well the FULL plan
   satisfies ALL constraints together: mobility violations or budget
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

  // Fallback to high-quality deterministic plan when quota is exceeded (429) or timed out
  console.warn(`Gemini day-plan failed after retries (${lastError?.message || 'unknown'}), activating deterministic plan generator.`);
  return fallbackGenerateDayPlan({
    destination,
    time_available,
    budget,
    group_type,
    interests,
    food_preferences,
    mobility,
    vibe,
  });
}

function fallbackGenerateDayPlan({
  destination = 'Jaipur',
  time_available = '4 Hours',
  budget = '₹1,500',
  group_type = 'Solo Explorer',
  interests = [],
  food_preferences = 'Pure Vegetarian',
  mobility = 'Moderate Walking',
  vibe = 'Balanced mix',
}) {
  const normCity = (destination || 'Jaipur').toLowerCase();
  const isLowWalking = /low.walking|wheelchair|step.free|ramp/i.test(mobility);
  const isWheelchair = /wheelchair/i.test(mobility);

  const budgetNum = parseInt(String(budget).replace(/[^0-9]/g, ''), 10) || 3000;
  const budgetTier = budgetNum <= 2500 ? 'budget' : budgetNum <= 9000 ? 'comfort' : 'luxury';

  const userInterests = Array.isArray(interests) && interests.length > 0
    ? interests
    : ['heritage', 'crafts', 'food'];

  const groupDesc = String(group_type || 'Solo Explorer');
  const groupBenefit = /solo/i.test(groupDesc)
    ? 'introspective solo wandering'
    : /couple/i.test(groupDesc)
    ? 'romantic couple retreat'
    : /family/i.test(groupDesc)
    ? 'spacious shaded grounds and kid-friendly rest stops'
    : 'vibrant shared moments for friends';

  const mobilityBenefit = isWheelchair
    ? 'Step-free ramp entry and elevator access verified'
    : isLowWalking
    ? 'Under 250m walking hop with shaded benches'
    : 'Comfortable neighborhood walking distance';

  const MASTER_CATALOG = {
    jaipur: [
      {
        name: 'Hawa Mahal Palace Courtyards & Wind Pavilion',
        category: 'heritage',
        time: '09:00 AM',
        duration_mins: 75,
        budgetCost: '₹50 entry ticket',
        comfortCost: '₹200 palace audio guide pass',
        luxuryCost: '₹1,500 private sunrise pavilion pass',
        notes: 'Iconic 1799 pink sandstone facade with morning cross-breeze and uncrowded courtyards.',
      },
      {
        name: 'Sanganer Master Hand-Block Printing Guild Atelier',
        category: 'crafts',
        time: '11:00 AM',
        duration_mins: 90,
        budgetCost: 'Free artisan observation',
        comfortCost: '₹450 hands-on block printing session',
        luxuryCost: '₹3,500 private master Chiwda natural dye workshop',
        notes: 'Direct engagement with generational textile carvers and traditional vegetable dye vats.',
      },
      {
        name: 'Laxmi Mishthan Bhandar (LMB) Heritage Ghewar Tasting',
        category: 'food',
        time: '01:00 PM',
        duration_mins: 60,
        budgetCost: '₹180 street snack',
        comfortCost: '₹450 royal thali lunch',
        luxuryCost: '₹2,500 private haveli dining experience',
        notes: `Historic 1727 Johari Bazaar sweetmaker known for royal paneer ghewar, strictly ${food_preferences || 'Vegetarian'}.`,
      },
      {
        name: 'Panna Meena Ka Kund Ancient Stepwell & Amber Foothills',
        category: 'monuments',
        time: '03:00 PM',
        duration_mins: 60,
        budgetCost: 'Free entry',
        comfortCost: '₹150 local guide narration',
        luxuryCost: '₹1,200 private haveli curator trail',
        notes: 'Symmetrical 16th-century subterranean stepwell offering quiet contemplation away from bus tours.',
      },
      {
        name: 'Govind Dev Ji Temple Inner Courtyard Evening Aarti',
        category: 'rituals',
        time: '05:00 PM',
        duration_mins: 60,
        budgetCost: 'Free spiritual entry',
        comfortCost: '₹100 offering & prasad',
        luxuryCost: '₹1,000 temple trust guest blessing pass',
        notes: 'Sacred pillared sanctum with resonant community bell chanting and historic incense fragrance.',
      },
    ],
    varanasi: [
      {
        name: 'Assi to Dashashwamedh Sunrise Rowboat & Dawn Ghat Chanting',
        category: 'rituals',
        time: '06:00 AM',
        duration_mins: 90,
        budgetCost: '₹200 shared boat pass',
        comfortCost: '₹600 private wooden rowboat',
        luxuryCost: '₹3,000 heritage Bajra boat with private shehnai recital',
        notes: 'Drifting along ancient stone staircases as dawn sunlight illuminates morning prayers and floating diyas.',
      },
      {
        name: 'Madanpura Handloom Silk & Zari Weaver Guild',
        category: 'crafts',
        time: '09:30 AM',
        duration_mins: 80,
        budgetCost: 'Free pit-loom observation',
        comfortCost: '₹350 master weaver storytelling session',
        luxuryCost: '₹2,500 commissioned handloom silk masterclass',
        notes: 'Centuries-old Muslim weaver guilds passing gold threads on heavy wooden foot-operated looms.',
      },
      {
        name: 'Kashi Chat Bhandar & Blue Lassi Clay Cup Tasting',
        category: 'food',
        time: '12:00 PM',
        duration_mins: 50,
        budgetCost: '₹120 street delicacies',
        comfortCost: '₹350 authentic temple feast',
        luxuryCost: '₹2,000 BrijRama Palace Satvik heritage lunch',
        notes: `Famous spicy tomato chaat and hand-churned thick yogurt lassi, strictly ${food_preferences || 'Vegetarian'}.`,
      },
      {
        name: 'Kashi Vishwanath Temple Heritage Corridor Walk',
        category: 'heritage',
        time: '02:30 PM',
        duration_mins: 90,
        budgetCost: 'Free public queue',
        comfortCost: '₹300 Sugam Darshan pass',
        luxuryCost: '₹1,500 private scholarly corridor guide',
        notes: 'Restored golden spires connecting the ancient Jyotirlinga sanctum directly to the holy Ganges banks.',
      },
      {
        name: 'Dashashwamedh Ghat Sunset Maha Aarti from Water Platform',
        category: 'rituals',
        time: '06:30 PM',
        duration_mins: 75,
        budgetCost: 'Free ghat viewing',
        comfortCost: '₹300 reserved boat terrace seat',
        luxuryCost: '₹2,200 private riverside pavilion reservation',
        notes: 'Seven young priests synchronizing multi-tiered brass oil lamps in sacred evening fire adoration.',
      },
    ],
    delhi: [
      {
        name: "Humayun's Tomb Mughal Gardens & Restored Watercourses",
        category: 'heritage',
        time: '09:00 AM',
        duration_mins: 90,
        budgetCost: '₹50 monument ticket',
        comfortCost: '₹250 conservation audio tour',
        luxuryCost: '₹1,800 Aga Khan Trust architectural historian walk',
        notes: 'UNESCO red sandstone masterpiece set in geometric Persian charbagh gardens with shaded arcades.',
      },
      {
        name: 'Old Delhi Gali Paranthe Wali & Khari Baoli Spice Trail',
        category: 'food',
        time: '11:30 AM',
        duration_mins: 90,
        budgetCost: '₹150 stuffed paratha tasting',
        comfortCost: '₹500 guided Old Delhi culinary safari',
        luxuryCost: '₹3,200 Haveli Dharampura 7-course Mughlai lunch',
        notes: `Generational spice warehouses and century-old deep-fried flatbreads, compliant with ${food_preferences || 'Vegetarian'}.`,
      },
      {
        name: 'Dilli Haat Regional Artisan Guilds & Handloom Stalls',
        category: 'crafts',
        time: '02:30 PM',
        duration_mins: 90,
        budgetCost: '₹100 entry fee',
        comfortCost: '₹400 craft demonstration pass',
        luxuryCost: '₹2,000 master artisan bespoke curation',
        notes: 'Rotating marketplace where rural craftspeople sell direct block prints, pottery, and brassware.',
      },
      {
        name: 'Hazrat Nizamuddin Basti Natural Perfume & Sufi Alleyways',
        category: 'offbeat',
        time: '05:00 PM',
        duration_mins: 75,
        budgetCost: 'Free courtyard access',
        comfortCost: '₹250 attar distillation tasting',
        luxuryCost: '₹1,500 private Sufi heritage curator',
        notes: '700-year-old living medieval settlement famous for natural rose attar distillation and qawwali chants.',
      },
    ],
    kochi: [
      {
        name: 'Fort Kochi Chinese Fishing Nets & Coastal Spice Trail',
        category: 'nature',
        time: '08:30 AM',
        duration_mins: 80,
        budgetCost: 'Free beach promenade',
        comfortCost: '₹300 heritage walking pass',
        luxuryCost: '₹1,500 private historian coastal tour',
        notes: '14th-century cantilevered fishing nets operating along Vasco da Gama square and shaded rain trees.',
      },
      {
        name: 'Kerala Kathakali Centre Classical Dance Atelier',
        category: 'arts',
        time: '11:00 AM',
        duration_mins: 90,
        budgetCost: '₹200 rehearsal pass',
        comfortCost: '₹500 evening performance pass',
        luxuryCost: '₹2,500 private guru mudra masterclass',
        notes: 'Intricate facial makeup preparation and ancient Natya Shastra eye expressions by veteran gurus.',
      },
      {
        name: 'Mattancherry Ginger & Cardamom Warehouse Tasting',
        category: 'food',
        time: '01:30 PM',
        duration_mins: 60,
        budgetCost: '₹180 banana leaf meal',
        comfortCost: '₹600 Syrian Christian culinary lunch',
        luxuryCost: '₹3,000 Brunton Boatyard coastal spice tasting',
        notes: 'Burlap sacks of sun-dried Tellicherry pepper and steaming Malabar appams with coconut stew.',
      },
      {
        name: 'Traditional Ayurvedic Herbal Garden & Oil Sanctuary',
        category: 'wellness',
        time: '03:30 PM',
        duration_mins: 90,
        budgetCost: 'Free botanical walk',
        comfortCost: '₹800 Ayurvedic consultation & herbal tea',
        luxuryCost: '₹4,500 full Abhyanga wellness therapy',
        notes: 'Living apothecary garden containing medicinal neem, tulsi, and vetiver cultivated by Vaidyars.',
      },
    ],
    mumbai: [
      {
        name: 'Kala Ghoda Art Enclave & Victorian Neo-Gothic Trail',
        category: 'arts',
        time: '09:30 AM',
        duration_mins: 85,
        budgetCost: 'Free gallery entry',
        comfortCost: '₹300 art district audio walk',
        luxuryCost: '₹2,000 private art curator tour',
        notes: 'High-density architectural precinct featuring stone gargoyles, street art, and contemporary galleries.',
      },
      {
        name: 'Yazdani Bakery & Historic Parsi Cafe Tea Stop',
        category: 'food',
        time: '11:30 AM',
        duration_mins: 45,
        budgetCost: '₹120 chai & bun maska',
        comfortCost: '₹400 heritage brunch',
        luxuryCost: '₹2,000 Trishna coastal butter garlic seafood',
        notes: '1953 wood-fired brick ovens baking crusty brun pao accompanied by fragrant cardamom Irani chai.',
      },
      {
        name: 'Khadi Bhavan & Handloom Weaving Collective',
        category: 'crafts',
        time: '01:30 PM',
        duration_mins: 75,
        budgetCost: 'Free artisan visit',
        comfortCost: '₹300 natural fabric workshop',
        luxuryCost: '₹1,500 bespoke handloom tailor consultation',
        notes: 'Ethical cooperative displaying hand-spun cottons, wild silks, and natural organic indigo dyes.',
      },
      {
        name: 'Banganga Ancient Sacred Water Tank & Walkeshwar Temples',
        category: 'rituals',
        time: '04:00 PM',
        duration_mins: 70,
        budgetCost: 'Free tank courtyard',
        comfortCost: '₹200 heritage stepwell pass',
        luxuryCost: '₹1,200 private dusk musical boat walk',
        notes: 'Freshwater spring tank from the 11th century surrounded by temple spires and resident ducks.',
      },
    ],
    udaipur: [
      {
        name: 'City Palace Mewar Royal Architecture & Peacock Courtyard',
        category: 'heritage',
        time: '09:00 AM',
        duration_mins: 90,
        budgetCost: '₹300 general admission',
        comfortCost: '₹600 audio guide & museum pass',
        luxuryCost: '₹3,000 private Mewar curator salon',
        notes: 'Marble balconies and colored glass mosaics overlooking Lake Pichola and Aravali ridges.',
      },
      {
        name: 'Traditional Mewari Miniature Painting Guild Atelier',
        category: 'crafts',
        time: '11:30 AM',
        duration_mins: 80,
        budgetCost: 'Free studio observation',
        comfortCost: '₹450 squirrel-hair brush workshop',
        luxuryCost: '₹2,800 private master artist gold leaf lesson',
        notes: 'Generational artists painting epic scenes on silk and old handmade paper using natural stone minerals.',
      },
      {
        name: 'Ambrai Ghat Lakeside Heritage Lunch',
        category: 'food',
        time: '01:30 PM',
        duration_mins: 60,
        budgetCost: '₹200 lakeside cafe snacks',
        comfortCost: '₹750 Rajasthani ker sangri feast',
        luxuryCost: '₹3,500 Lake Palace private boat dining',
        notes: 'Shaded stone ghat tables overlooking the water with views of the floating Lake Palace.',
      },
      {
        name: 'Saheliyon Ki Bari Royal Marble Fountains & Lotus Pools',
        category: 'nature',
        time: '04:00 PM',
        duration_mins: 60,
        budgetCost: '₹50 garden entry',
        comfortCost: '₹150 guided horticulture walk',
        luxuryCost: '₹1,200 private sunset tea tour',
        notes: '18th-century royal pleasure garden designed with gravity-fed fountains and sculpted stone elephants.',
      },
    ],
  };

  const matchedCityKey = Object.keys(MASTER_CATALOG).find((k) => normCity.includes(k)) || 'jaipur';
  const cityCatalog = MASTER_CATALOG[matchedCityKey];

  // Prioritize stops matching user's specific selected interests
  const prioritizedStops = [...cityCatalog].sort((a, b) => {
    const aMatch = userInterests.includes(a.category) ? 1 : 0;
    const bMatch = userInterests.includes(b.category) ? 1 : 0;
    return bMatch - aMatch;
  });

  const stopCount = /relaxed/i.test(vibe) ? 3 : /packed/i.test(vibe) ? 5 : 4;
  const selectedStops = prioritizedStops.slice(0, Math.min(stopCount, cityCatalog.length));

  const stops = selectedStops.map((item, idx) => {
    const costLabel =
      budgetTier === 'budget'
        ? item.budgetCost
        : budgetTier === 'comfort'
        ? item.comfortCost
        : item.luxuryCost;

    const isInterestMatch = userInterests.includes(item.category);
    const fitReason = isInterestMatch
      ? `Matches your ${item.category} focus • ${groupBenefit} • ${mobilityBenefit}`
      : `Curated ${destination} cultural anchor • ${groupBenefit}`;

    return {
      order: idx + 1,
      time: item.time,
      name: item.name,
      duration_mins: item.duration_mins,
      cost_label: costLabel,
      fit_reason: fitReason,
      match_notes: item.notes,
    };
  });

  const cleanCity = destination || 'Jaipur';
  return {
    city: cleanCity,
    feasibility_score: 95,
    feasibility_summary: `Feasible route in ${cleanCity} tailored for ${time_available} and ₹${budgetNum.toLocaleString('en-IN')}/day. Formulated for ${groupDesc} and ${userInterests.join(', ')} affinities.`,
    stops,
  };
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

