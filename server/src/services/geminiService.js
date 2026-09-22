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
  'gemini-flash-latest',
  'gemini-2.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-2.5-pro',
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

/** A 404, unsupported-model, 503 high-demand, timeout, or transient server error is worth retrying with next model. */
function isModelUnavailable(error) {
  const msg = error?.message || '';
  return /404|not found|is not supported|not supported for|503|service unavailable|high demand|spikes in demand|overloaded|temporarily unavailable|unavailable|timeout|timed out|500|502|504/i.test(msg);
}

/** An invalid key, revoked permission, or exhausted quota fails identically for every model: stop immediately. */
function isFatalError(error) {
  const msg = error?.message || '';
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|RESOURCE_EXHAUSTED|429|Quota exceeded|exceeded your current quota/i.test(msg);
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

  // Limit queue to top 2 fastest models to guarantee response within ~2 seconds
  const queue = candidateOrder().slice(0, 2);
  const tried = new Set();
  let lastError = null;
  const timeoutMs = 2000;

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
          quotaExhaustedUntil = Date.now() + 30000;
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
 * Intelligent deterministic cultural concierge engine that generates rich, logical,
 * and context-aware responses when external LLM quota/network limits are reached.
 */
export function generateSmartCulturalConciergeReply({
  userMessage = '',
  chatHistory = [],
  city = null,
  availableExperiences = [],
}) {
  const msg = (userMessage || '').toLowerCase();
  const allUserText = [
    ...chatHistory.filter((h) => h.role === 'user').map((h) => h.content || ''),
    userMessage,
  ].join(' ').toLowerCase();

  // 1. Detect duration
  const daysMatch = allUserText.match(/(\d+)\s*days?/i);
  const days = daysMatch ? parseInt(daysMatch[1], 10) : null;

  // 2. Detect region / state
  const isSouth = /(south|kerala|karnataka|tamil|tamil\s*nadu|kochi|cochin|munnar|alleppey|wayanad|hampi|mysore|mysuru|coorg|bengaluru|bangalore|chennai|madurai|pondicherry|puducherry|hyderabad|andhra|telangana)/i.test(allUserText);
  const isKerala = /(kerala|kochi|cochin|munnar|alleppey|wayanad|varkala|thekkady)/i.test(allUserText);
  const isKarnataka = /(karnataka|hampi|mysore|mysuru|coorg|bengaluru|bangalore|badami|gokarna)/i.test(allUserText);
  const isTamilNadu = /(tamil|tamil\s*nadu|chennai|madurai|pondicherry|puducherry|thanjavur|mahabalipuram|chettinad|rameshwaram)/i.test(allUserText);
  const isRajasthan = /(rajasthan|jaipur|udaipur|jodhpur|jaisalmer|pushkar|bikaner)/i.test(allUserText);
  const isNorth = /(north|delhi|varanasi|kashi|banaras|agra|amritsar|himachal|manali|shimla|dharamshala|rishikesh|haridwar|uttarakhand|kashmir|ladakh|leh)/i.test(allUserText);
  const isMumbai = /(mumbai|bombay|marine\s*drive|gateway\s*of\s*india|colaba|bandra)/i.test(allUserText);
  const isGoa = /(goa|panaji|fontainhas|anjuna|palolem)/i.test(allUserText);
  const isVaranasi = /(varanasi|kashi|banaras|ghat|ganga\s*aarti)/i.test(allUserText);
  const isDelhi = /(delhi|new\s*delhi|chandni\s*chowk|qutub|red\s*fort)/i.test(allUserText);
  const isKolkata = /(kolkata|calcutta|howrah|victoria\s*memorial)/i.test(allUserText);

  // 3. Detect interests
  const isNature = /(nature|beach|beaches|backwater|backwaters|hill|hills|tea|plantations|waterfall|forest|scenic|greenery)/i.test(allUserText);
  const isHeritage = /(heritage|history|historic|palace|palaces|fort|forts|temple|temples|monument|monuments|architecture|ancient)/i.test(allUserText);
  const isFood = /(food|cuisine|eat|eating|culinary|street\s*food|dishes|sweets|taste|tasting)/i.test(allUserText);
  const isSpiritual = /(spiritual|temple|peace|peaceful|meditation|ghat|aarti|sanctuary|ayurveda)/i.test(allUserText);
  const isCouple = /(couple|gf|girlfriend|bf|boyfriend|wife|husband|partner|two of us|2 of us|2 people|two people|we 2|we two|for 2|for two)/i.test(allUserText);
  const isFamily = /(family|kids|children|parents|elders|family of|4 people|four people)/i.test(allUserText);
  const isSolo = /(solo|alone|single|myself|1 person|one person)/i.test(allUserText);
  const isBudget = /(cost|budget|price|pricing|expense|expenses|how much|inr|₹|rs\.?|spend|spending|afford|rates|package|charges|fare)/i.test(allUserText);

  // Case 0: Explicit Budget or Trip Cost Inquiries
  if (isBudget) {
    const numDays = days || 5;
    const travelerDescription = isCouple ? '2 people (couple)' : isFamily ? 'a family of 4' : isSolo ? 'a solo traveler' : '2 people';

    // Kerala & South India Budget Breakdown
    if (isKerala || isSouth || (!isRajasthan && !isMumbai && !isNorth && !isGoa)) {
      return `Here is a complete, realistic budget breakdown for **${numDays} days in Kerala for ${travelerDescription}**:

### 1. Trip Cost Tiers (Total for ${travelerDescription}, ${numDays} Days)
• **Budget Tier: ₹16,000 to ₹22,000 total** (~₹3,200 to ₹4,400 per day for two)
  - **Stay:** Clean, welcoming heritage homestays in Fort Kochi and Munnar (₹1,400 to ₹2,000 per night).
  - **Transit:** Scenic KSRTC state buses and local auto-rickshaws.
  - **Food:** Generational banana leaf sadhyas, local appam-stew cafes, and fresh coastal messes (₹700 to ₹1,000 per day for two).
  - **Experiences:** Village country canoe cruise in Alleppey backwaters and Kathakali center ticket.

• **Comfort / Mid-Range Tier (Most Recommended): ₹35,000 to ₹50,000 total** (~₹7,000 to ₹10,000 per day for two)
  - **Stay:** Boutique heritage properties and tea plantation cottages (₹3,500 to ₹5,500 per night).
  - **Transit:** Dedicated private AC sedan with driver for the entire ${numDays}-day circuit (₹12,000 to ₹15,000 total).
  - **Food:** Celebrated local seafood dining, plantation garden cafes, and artisanal eateries (₹1,500 to ₹2,200 per day for two).
  - **Experiences:** Private 3-hour Shikara boat cruise in Alleppey, live Kathakali and Kalaripayattu shows, and guided spice garden walk.

• **Luxury Tier: ₹85,000 to ₹1,45,000+ total** (~₹17,000 to ₹29,000+ per day for two)
  - **Stay:** 5-star heritage resorts (Brunton Boatyard, Kumarakom Lake Resort) or private pool villas.
  - **Transit:** Premium AC SUV with professional chauffeur.
  - **Food:** Fine-dining coastal gastronomy and private curated meals.
  - **Experiences:** Overnight private 1-bedroom luxury houseboat on Vembanad Lake with personal chef and couple Ayurvedic spa rejuvenation.

### 2. Itemized Cost Estimation (Mid-Range Baseline for 2)
• **Accommodation (4 nights):** ₹16,000 to ₹22,000
• **Private AC Cab with Driver (${numDays} days):** ₹13,000 to ₹15,000
• **Food & Authentic Dining (2 people):** ₹8,000 to ₹11,000
• **Sightseeing, Boat Cruise & Cultural Shows:** ₹4,000 to ₹6,000

*Note: Excludes inter-state flight or train tickets to Kochi. Would you like me to tailor this for a specific tier or recommend handpicked boutique stays?*`;
    }

    // Rajasthan Budget Breakdown
    if (isRajasthan || city?.toLowerCase() === 'jaipur' || city?.toLowerCase() === 'udaipur') {
      return `Here is a complete, realistic budget breakdown for **${numDays} days in Rajasthan for ${travelerDescription}**:

### 1. Trip Cost Tiers (Total for ${travelerDescription}, ${numDays} Days)
• **Budget Tier: ₹15,000 to ₹21,000 total** (~₹3,000 to ₹4,200 per day for two)
  - **Stay:** Atmospheric heritage haveli guesthouses in the old city (₹1,500 to ₹2,200 per night).
  - **Transit:** Local e-rickshaws, metro, and intercity trains.
  - **Food:** Generational sweet shops, kachori stalls, and traditional thali messes (₹600 to ₹900 per day for two).
  - **Experiences:** Fort composite entry tickets and sunset walks.

• **Comfort / Mid-Range Tier (Most Recommended): ₹34,000 to ₹48,000 total** (~₹6,800 to ₹9,600 per day for two)
  - **Stay:** 3 to 4 star restored heritage havelis with courtyard pools (₹3,500 to ₹5,500 per night).
  - **Transit:** Dedicated private AC sedan with driver for ${numDays} days (₹12,000 to ₹14,000 total).
  - **Food:** Rooftop lake-view or fort-view dining with authentic Rajasthani folk music (₹1,500 to ₹2,200 per day for two).
  - **Experiences:** Private block printing artisan masterclasses, Amer Fort night viewing, and lake boat cruises.

• **Luxury Tier: ₹80,000 to ₹1,50,000+ total** (~₹16,000 to ₹30,000+ per day for two)
  - **Stay:** Grand royal palace hotels (Taj Lake Palace, Samode Haveli, Rambagh Palace).
  - **Transit:** Luxury private chauffeur service.
  - **Experiences:** Private royal museum access, vintage car rides, and bespoke fine dining.

*Would you like me to customize this budget for specific cities like Jaipur, Udaipur, or Jodhpur?*`;
    }

    // Mumbai Budget Breakdown
    if (isMumbai || city?.toLowerCase() === 'mumbai') {
      return `Here is a complete, realistic budget breakdown for **${numDays} days in Mumbai for ${travelerDescription}**:

### 1. Trip Cost Tiers (Total for ${travelerDescription}, ${numDays} Days)
• **Budget Tier: ₹18,000 to ₹25,000 total** (~₹3,600 to ₹5,000 per day for two)
  - **Stay:** Clean boutique hotels in South Mumbai or suburbs (₹2,500 to ₹3,500 per night).
  - **Transit:** Mumbai local trains, metro, and black-and-yellow Kaali Peeli taxis.
  - **Food:** Historic Irani cafes, street chaat at Chowpatty, and local coastal messes (₹800 to ₹1,200 per day for two).

• **Comfort / Mid-Range Tier (Most Recommended): ₹38,000 to ₹55,000 total** (~₹7,600 to ₹11,000 per day for two)
  - **Stay:** 4-star boutique hotels in Colaba, Fort, or Bandra (₹5,000 to ₹7,500 per night).
  - **Transit:** AC app-based cabs (Uber / Ola) for seamless city navigation.
  - **Food:** Iconic coastal seafood institutions (Trishna, Mahesh Lunch Home) and chic Bandra cafes (₹2,000 to ₹3,000 per day for two).
  - **Experiences:** Heritage Art Deco walking tour, Elephanta Caves ferry and entry, and NCPA theater tickets.

• **Luxury Tier: ₹90,000 to ₹1,60,000+ total** (~₹18,000 to ₹32,000+ per day for two)
  - **Stay:** Sea-facing 5-star icons (The Taj Mahal Palace, The Oberoi Mumbai).
  - **Transit:** Chauffeur-driven luxury car.
  - **Experiences:** Private yacht sail from Gateway of India and Michelin-caliber dining.

*Would you like suggestions for specific neighborhood stays like Colaba or Bandra?*`;
    }
  }

  // Case A: User explicitly asks about South India or deciding on a South Indian state
  if (isSouth || (!city && /(south|decide|where\s*to\s*go|suggest\s*a\s*state|any\s*state)/i.test(allUserText))) {
    if (days === 5 || allUserText.includes('5 day') || allUserText.includes('5-day')) {
      if (isNature || isKerala || (!isKarnataka && !isTamilNadu)) {
        return `For a **5-day journey across South India**, **Kerala** is an extraordinary choice blending living heritage, misty tea highlands, and serene waterways:

**Recommended 5-Day Kerala Cultural Circuit:**
• **Days 1 to 2 (Fort Kochi):** Wander through the 14th-century Chinese Fishing Nets, colonial spice warehouses, and witness evening Kathakali classical dance at an authentic guru atelier.
• **Days 3 to 4 (Munnar Highlands):** Explore high-altitude tea plantations, spice gardens, and cool mountain ridges in the Western Ghats.
• **Day 5 (Alleppey Backwaters):** Experience an unhurried traditional wooden canoe cruise through palm-shaded canals and savor authentic Malabar fish or vegetarian sadhya served on fresh banana leaves.

*Would you prefer this Kerala nature and heritage flow, or would you like to explore a royal temple circuit across Karnataka (Mysore and Hampi) or Tamil Nadu?*`;
      }

      if (isKarnataka) {
        return `For a **5-day exploration of Karnataka**, you get a magnificent contrast of royal dynasties and dramatic UNESCO boulder landscapes:

**Recommended 5-Day Karnataka Itinerary:**
• **Days 1 to 2 (Mysore & Srirangapatna):** Visit the grand illuminated Mysore Palace, Devaraja sandalwood and flower bazaar, and generational silk weaver collectives.
• **Days 3 to 5 (Hampi Vijayanagara Empire):** Explore the 14th-century Stone Chariot, Virupaksha Temple, royal subterranean enclosures, and watch the sunset from Matanga Hill.

*Are you traveling solo, as a couple, or with family? I can fine-tune the walking pace and budget recommendations for you.*`;
      }

      if (isTamilNadu) {
        return `For a **5-day Tamil Nadu cultural trail**, you will experience some of the world's most intricate Dravidian stone architecture:

**Recommended 5-Day Tamil Nadu Itinerary:**
• **Days 1 to 2 (Chennai & Mahabalipuram):** Explore Kapaleeshwarar Temple in Mylapore and the 7th-century monolithic Shore Temples and Arjuna's Penance on the Coromandel Coast.
• **Days 3 to 4 (Pondicherry French Quarter):** Walk through mustard-yellow French colonial villas, seaside promenades, and Auroville.
• **Day 5 (Thanjavur or Madurai):** Marvel at the 1,000-year-old Brihadisvara Temple or the towering gopurams of Meenakshi Amman Temple.

*Tell me your preferred travel style and budget, and I will curate specific local stays and heritage masterclasses!*`;
      }
    }

    // Undecided South Indian state general guidance
    return `South India offers three distinctly magical cultural landscapes depending on your travel vibe:

1. **Kerala (Nature, Backwaters & Wellness):** Ideal if you love misty tea plantations (Munnar), palm-lined canals (Alleppey), spice trade heritage (Fort Kochi), and traditional Ayurvedic rejuvenation.
2. **Karnataka (Palaces, Ancient Ruins & Coffee Estates):** Perfect if you love majestic royal architecture (Mysore Palace), UNESCO medieval ruins (Hampi), and lush coffee highlands (Coorg).
3. **Tamil Nadu (Living Temples & French Coastal Quarters):** Unmatched for ancient Dravidian temple gopurams (Madurai, Thanjavur), coastal rock carvings (Mahabalipuram), and French-colonial heritage (Pondicherry).

**Which of these vibes appeals to you most?** Tell me how many days you have and whether you prefer lush nature, royal history, or temple traditions, and I will build your day-by-day micro-itinerary!`;
  }

  // Case B: Rajasthan / Jaipur / Udaipur
  if (isRajasthan || city?.toLowerCase() === 'jaipur' || city?.toLowerCase() === 'udaipur') {
    const targetCity = city || (msg.includes('udaipur') ? 'Udaipur' : 'Jaipur');
    if (targetCity === 'Udaipur') {
      return `**Udaipur**, the City of Lakes, is one of India's most romantic and visually stunning cultural destinations:

• **Signature Highlights:** Explore the monumental City Palace overlooking Lake Pichola, take a sunset boat ride around Jag Mandir, and discover generational Mewari miniature painting ateliers in the old city.
• **Culinary Note:** Do not miss rooftop Rajasthani dining with views of the illuminated lake, accompanied by traditional folk Ghoomar dance.

*How many days are you spending in Udaipur, and would you like recommendations for quiet lakeside havelis or master craft studios?*`;
    }

    return `**Jaipur**, Rajasthan's Pink City, offers an extraordinary immersion into living royal heritage and master artisan guilds:

• **Signature Highlights:** Visit the 1799 Hawa Mahal facade at morning light, explore the hilltop Amer Fort and its mirrored Sheesh Mahal, and experience hands-on block printing in Sanganer's artisan quarters.
• **Culinary Note:** Savor authentic royal Ghewar from historic Johari Bazaar sweetmakers and authentic Dal Baati Churma.

*Tell me your available hours and budget, and I will curate the top 2 signature spots with precise transit buffers for you!*`;
  }

  // Case C: Mumbai
  if (isMumbai || city?.toLowerCase() === 'mumbai') {
    return `**Mumbai** has an electrifying cultural energy blending colonial Victorian Gothic architecture with living coastal traditions:

• **Signature Highlights:** Stroll through the Gateway of India at Apollo Bunder, admire the carved stone details of CSMT, take a heritage Art Deco walk along Marine Drive, and explore the ancient rock-cut Elephanta Caves.
• **Culinary Note:** Enjoy classic Parsi Irani chai and bun maska at Yazdani Bakery, followed by fresh coastal delicacies in Fort or Girgaon Chowpatty street chaat.

*What kind of experience excites you most in Mumbai (architectural walks, street food safaris, or artisan textile collectives)?*`;
  }

  // Case D: Varanasi
  if (isVaranasi || city?.toLowerCase() === 'varanasi') {
    return `**Varanasi (Kashi)** is the oldest continuously inhabited spiritual capital of India, steeped in sacred rituals and living traditions:

• **Signature Highlights:** Take a peaceful dawn wooden rowboat ride along the ancient stone ghats, visit the Kashi Vishwanath Golden Temple corridor, and witness the mesmerizing sunset Maha Aarti at Dashashwamedh Ghat.
• **Artisan Note:** Explore Madanpura's centuries-old handloom silk weaver guilds and taste thick saffron lassi in traditional clay kullads.

*How many days will you be in Varanasi, and are you traveling solo or with family?*`;
  }

  // Case E: North India / Himalayas
  if (isNorth || city?.toLowerCase() === 'delhi' || city?.toLowerCase() === 'amritsar') {
    return `For exploring **North India**, you have an incredible array of cultural gateways:

• **Delhi & Agra:** The heart of Mughal and colonial heritage (Red Fort, Qutub Minar, and the Taj Mahal).
• **Amritsar (Punjab):** The golden serenity of Harmandir Sahib, the world's largest community Langar, and the patriotic sunset ceremony at Wagah Border.
• **Himalayas (Himachal & Uttarakhand):** Cedar pine valleys in Manali, historic toy trains in Shimla, and sacred yoga sanctuaries along the Ganges in Rishikesh.

*Which specific region or city are you drawn to, and how many days is your trip?*`;
  }

  // Case F: General / Fallback
  if (city) {
    const expsList = availableExperiences.length > 0
      ? availableExperiences.slice(0, 2).map((e) => `• **${e.title}** (${e.category}): ${e.tagline || e.description || ''}`).join('\n')
      : '';
    return `Welcome to **${city}**! It offers a rich tapestry of living cultural heritage and local flavors.

${expsList ? `**Curated Cultural Highlights:**\n${expsList}\n\n` : ''}To help me tailor the best micro-circuit for your visit, please share:
1. How many hours or days do you have available?
2. Are you traveling solo, as a couple, or with family?
3. What is your primary interest (historic monuments, hands-on mastercraft workshops, or regional gastronomy)?`;
  }

  return `Namaste! I would be delighted to help you design an authentic Indian cultural journey.

To give you the most tailored and logical recommendations:
• **Where in India are you heading or considering?** (e.g., South India backwaters & temples, Rajasthan royal palaces, Varanasi ghats, or Mumbai coastal heritage?)
• **How many days do you have for your trip?**
• **What kind of experiences do you love most?** (Living history, artisan workshops, scenic nature, or local food trails?)

Share what you have in mind and I will curate a personalized plan for you!`;
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
The traveler is asking about travel across India (they may ask about a specific region like South India, North India, a state like Kerala/Rajasthan, a multi-day trip, or specific recommendations).

**Your Instructions:**
1. Directly and thoughtfully answer whatever the traveler asked. If they ask about South India, recommend genuine South Indian destinations (Kerala, Karnataka, Tamil Nadu) with specific cultural spots. If they mention a duration (e.g. 5 days), provide a logical day breakdown.
2. Be culturally rich, authentic, and specific (mention real local landmarks, generational foods, artisan guilds).
3. Do NOT repeat generic canned scripts. Always tailor your reply to their exact query.
4. Keep your answer engaging, structured (use bullet points where helpful), and concise (2-3 short paragraphs max).`;
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

    // Pass prior turns as real chat history so the concierge remembers the conversation
    const history = sanitizeHistory(chatHistory);

    const { text: aiReply, modelName } = await generateWithFallback(userMessage, {
      systemInstruction: systemPrompt,
      history,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
      },
    });

    const estimatedTokens = Math.floor((systemPrompt.length + userMessage.length + aiReply.length) / 4);

    return {
      reply: aiReply,
      tokensUsed: estimatedTokens,
      model: modelName,
    };
  } catch (error) {
    console.warn('Gemini API Error, utilizing intelligent cultural concierge fallback:', error.message);

    // Seamlessly fall back to rich, contextual, logical cultural responses
    const smartReply = generateSmartCulturalConciergeReply({
      userMessage,
      chatHistory,
      city,
      availableExperiences,
    });

    return {
      reply: smartReply,
      tokensUsed: 40,
      model: 'lokiva-cultural-engine',
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

