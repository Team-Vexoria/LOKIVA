import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * AI Cultural Concierge - Chat with GPT-4o-mini about travel, culture, food, and experiences
 * @param {string} userMessage - User's question or request
 * @param {Array} chatHistory - Previous conversation messages for context
 * @param {string} city - Current destination city
 * @param {Array} availableExperiences - Relevant experiences from database for grounding
 * @returns {Promise<Object>} AI response with recommendations
 */
export async function chatWithCulturalConcierge({
  userMessage,
  chatHistory = [],
  city = 'Mumbai',
  availableExperiences = [],
}) {
  try {
    // Build context about available experiences
    const experiencesContext = availableExperiences
      .map(
        (exp, idx) =>
          `${idx + 1}. **${exp.title}** in ${exp.city}
   - Category: ${exp.category}
   - Price: ₹${exp.price} (${exp.price === 0 ? 'Free Entry' : 'Paid'})
   - Duration: ~${exp.approx_duration_mins} mins
   - Description: ${exp.description}
   - Cultural Context: ${exp.cultural_context || 'N/A'}
   - Accessibility: ${exp.wheelchair_accessible ? 'Wheelchair accessible' : 'Standard access'}${exp.low_walking ? ', Low walking' : ''}
   - Indoor: ${exp.is_indoor ? 'Yes' : 'No'} | Rain Safe: ${exp.is_rain_safe ? 'Yes' : 'No'}
   - Hidden Gem: ${exp.is_hidden_gem ? 'Yes' : 'No'}`
      )
      .join('\n\n');

    const systemPrompt = `You are LOKIVA's AI Cultural Concierge - an expert guide for authentic cultural travel experiences across India.

**Your Role:**
- Help travelers discover meaningful cultural experiences in Indian cities
- Provide recommendations based on their time, budget, interests, and accessibility needs
- Share insights about local culture, food, traditions, artisans, and hidden gems
- Answer questions about travel logistics, best times to visit, and cultural etiquette
- Create feasible itineraries that respect travelers' constraints

**Your Knowledge Base:**
You have access to verified cultural experiences in ${city} and across India. For ${city}, here are some available experiences:

${experiencesContext || 'No specific experiences loaded for this city yet.'}

**Guidelines:**
1. **Be warm and knowledgeable** - Like a local friend who knows the city intimately
2. **Ground responses in reality** - Reference actual places from the database when possible
3. **Respect constraints** - Always consider time, budget, and accessibility needs mentioned
4. **Cultural sensitivity** - Explain cultural significance and appropriate etiquette
5. **Honest recommendations** - Don't oversell; be realistic about timing, costs, and expectations
6. **Local insights** - Share tips about best times to visit, local customs, and hidden details
7. **No hallucination** - If you don't have information about a specific place, say so clearly
8. **Actionable advice** - Provide practical next steps and realistic itineraries

**Response Style:**
- Conversational and helpful, not robotic
- Use Indian context and terminology naturally
- Provide specific recommendations with reasons
- Include practical details (timing, costs, how to get there)
- Mention trade-offs when relevant

Current conversation is about: ${city}, India`;

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cost-effective and fast
      messages,
      temperature: 0.7, // Balanced creativity and consistency
      max_tokens: 800, // Keep responses concise but informative
      presence_penalty: 0.1, // Slight penalty to reduce repetition
      frequency_penalty: 0.1,
    });

    const aiReply = completion.choices[0].message.content;

    return {
      reply: aiReply,
      tokensUsed: completion.usage.total_tokens,
      model: completion.model,
    };
  } catch (error) {
    console.error('OpenAI API Error:', error.message);

    // Handle specific error cases
    if (error.message?.includes('API key')) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.');
    }

    throw new Error(`AI Concierge Error: ${error.message}`);
  }
}

/**
 * Extract structured travel intent from natural language
 * Uses GPT-4o-mini to parse user requests into structured data
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3, // More deterministic for extraction
      max_tokens: 300,
      response_format: { type: 'json_object' }, // Force JSON response
    });

    const extractedIntent = JSON.parse(completion.choices[0].message.content);
    return extractedIntent;
  } catch (error) {
    console.error('Intent Extraction Error:', error.message);

    // Fallback to basic parsing if OpenAI fails
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
 * Check if OpenAI API is configured and working
 */
export async function checkOpenAIHealth() {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return {
        status: 'not_configured',
        message: 'OpenAI API key not set in environment variables',
      };
    }

    // Test with a simple completion
    await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 5,
    });

    return {
      status: 'healthy',
      message: 'OpenAI API is configured and working',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }
}
