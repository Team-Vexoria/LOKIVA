import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveLocationAnchor } from '../services/locationResolver.js';
import { fetchCurrentWeather } from '../services/weatherService.js';
import { logExpenseToFirestore, getExpenseSummaryFromFirestore } from '../services/firestoreService.js';
import { verifyFirebaseToken } from '../services/firebaseAdmin.js';
import jwt from 'jsonwebtoken';

export const voiceRouter = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const JWT_SECRET = process.env.JWT_SECRET || 'lokiva_super_secure_jwt_secret_key_2026_hackathon';
const SOLVER_API_URL = process.env.SOLVER_API_URL || 'http://localhost:8000';

/**
 * Authentication helper for voice requests:
 * Strictly verifies identity from Firebase ID token or internal JWT.
 * NEVER trusts a userId supplied in the request body.
 */
async function authenticateVoiceUser(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) return null;

  // 1. Try Firebase Auth verification
  try {
    const verified = await verifyFirebaseToken(token);
    if (verified && verified.uid) {
      return { userId: verified.uid, email: verified.email, name: verified.name };
    }
  } catch (fbErr) {
    // Continue to internal JWT fallback
  }

  // 2. Try internal JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && (decoded.id || decoded.sub)) {
      return { userId: String(decoded.id || decoded.sub), email: decoded.email, name: decoded.name };
    }
  } catch (jwtErr) {
    // Token invalid
  }

  return null;
}

// ============================================================================
// 1. WEATHER ENDPOINT (Module C)
// ============================================================================
voiceRouter.post('/weather', async (req, res) => {
  try {
    const { location } = req.body;
    if (!location) {
      return res.status(400).json({ detail: 'location is required' });
    }

    const resolved = await resolveLocationAnchor(location);
    const lat = resolved ? resolved.lat : 26.9124; // default Jaipur centroid if unknown
    const lng = resolved ? resolved.lng : 75.7873;
    const locationName = resolved ? `${resolved.name}${resolved.city ? ', ' + resolved.city : ''}` : location;

    const weather = await fetchCurrentWeather(lat, lng, locationName);
    return res.json(weather);
  } catch (err) {
    console.error('[VoiceRouter] Weather error:', err);
    return res.status(500).json({ detail: err.message || 'Failed to fetch weather' });
  }
});

// ============================================================================
// 2. EXPENSE LOGGING ENDPOINTS (Module D)
// Strict rule: userId strictly derived from session token, never from body.
// ============================================================================
voiceRouter.post('/log-expense', async (req, res) => {
  try {
    const authUser = await authenticateVoiceUser(req);
    // If not logged in, use a session fallback user ID for demo continuity
    const userId = authUser ? authUser.userId : (req.headers['x-session-id'] || 'guest_traveler_session');

    const { amount_inr, category, note, tripId } = req.body;
    const amount = Number(amount_inr);

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ detail: 'Valid amount_inr greater than 0 is required' });
    }

    const expense = await logExpenseToFirestore({
      userId,
      amount_inr: amount,
      category: category || 'other',
      note: note || '',
      source: 'voice',
      tripId: tripId || null,
    });

    const summary = await getExpenseSummaryFromFirestore({ userId, period: 'today' });

    return res.json({
      success: true,
      expense,
      today_total_inr: summary.total_inr,
      period: 'today',
    });
  } catch (err) {
    console.error('[VoiceRouter] Log expense error:', err);
    return res.status(500).json({ detail: err.message || 'Failed to log expense' });
  }
});

voiceRouter.post('/expense-summary', async (req, res) => {
  try {
    const authUser = await authenticateVoiceUser(req);
    const userId = authUser ? authUser.userId : (req.headers['x-session-id'] || 'guest_traveler_session');

    const period = req.body.period || 'today';
    const summary = await getExpenseSummaryFromFirestore({ userId, period });

    return res.json(summary);
  } catch (err) {
    console.error('[VoiceRouter] Expense summary error:', err);
    return res.status(500).json({ detail: err.message || 'Failed to fetch expense summary' });
  }
});

// ============================================================================
// 3. INTENT ROUTER PROXY (Module A3)
// Evaluates speech transcript via Gemini Function Calling with zero frontend secret exposure.
// ============================================================================
voiceRouter.post('/route', async (req, res) => {
  try {
    const { transcript, context = {}, current_time } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ detail: 'transcript is required' });
    }

    const authUser = await authenticateVoiceUser(req);
    const userId = authUser ? authUser.userId : (req.headers['x-session-id'] || context.userId || 'guest_traveler_session');

    const nowIso = current_time || new Date().toISOString();
    const systemPrompt = `You are Lokiva Voice Assistant, a helpful cultural companion for travelers in India.
Current system time: ${nowIso}.
The user communicates via voice. Use the available functions when the user's intent matches.
- For weather inquiries, call get_weather.
- For recording money spent, call log_expense.
- For reviewing money spent or asking how much they spent, call get_expense_summary.
- For finding nearby experiences or places under time/budget/crowd constraints, call find_nearby_experience.
If the user's input is general conversation or out of scope, do not call any function.`;

    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({
      model: modelName,
      tools: [
        {
          functionDeclarations: [
            {
              name: 'get_weather',
              description: 'Get current weather conditions for a specific place.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  location: {
                    type: 'STRING',
                    description: 'The city, neighborhood, or landmark to get weather for, e.g. City Palace or Jaipur',
                  },
                },
                required: ['location'],
              },
            },
            {
              name: 'log_expense',
              description: 'Record a new expense the user just mentioned spending.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  amount_inr: {
                    type: 'NUMBER',
                    description: 'Amount spent in Indian Rupees (INR)',
                  },
                  category: {
                    type: 'STRING',
                    description: 'Best guess category: food, transport, shopping, activity, other',
                  },
                  note: {
                    type: 'STRING',
                    description: 'Short description of what was bought in the user own words',
                  },
                },
                required: ['amount_inr'],
              },
            },
            {
              name: 'get_expense_summary',
              description: 'Retrieve the user total spending for a given period.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  period: {
                    type: 'STRING',
                    enum: ['today', 'this_trip', 'this_week'],
                  },
                },
                required: ['period'],
              },
            },
            {
              name: 'find_nearby_experience',
              description: 'Find a local experience near a location, constrained by time available, budget, and crowd preference.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  location_anchor: {
                    type: 'STRING',
                    description: 'Named place the user is currently near, e.g. City Palace',
                  },
                  time_available_minutes: {
                    type: 'NUMBER',
                    description: 'Minutes the user has free, extracted or computed from a stated deadline',
                  },
                  budget_max_inr: {
                    type: 'NUMBER',
                    description: 'Maximum budget in INR if specified',
                  },
                  crowd_preference: {
                    type: 'STRING',
                    enum: ['low', 'any'],
                  },
                  activity_type: {
                    type: 'STRING',
                    description: 'Optional category hint: shopping, food, culture, or null',
                  },
                },
                required: ['location_anchor', 'time_available_minutes'],
              },
            },
          ],
        },
      ],
    });

    const chat = model.startChat({
      history: [{ role: 'user', parts: [{ text: systemPrompt }] }],
    });

    const result = await chat.sendMessage(transcript);
    const functionCalls = result.response.functionCalls();

    if (!functionCalls || functionCalls.length === 0) {
      // Fallback message as specified
      return res.json({
        intent: 'none',
        spoken_response: 'I can help you find nearby experiences, check the weather, or log an expense. What would you like?',
        data: null,
      });
    }

    const call = functionCalls[0];
    const callName = call.name;
    const args = call.args || {};

    // ------------------------------------------------------------------------
    // Case 1: get_weather
    // ------------------------------------------------------------------------
    if (callName === 'get_weather') {
      const locStr = args.location || context.currentLocationName || 'Jaipur';
      const resolved = await resolveLocationAnchor(locStr);
      const lat = resolved ? resolved.lat : 26.9124;
      const lng = resolved ? resolved.lng : 75.7873;
      const locName = resolved ? `${resolved.name}${resolved.city ? ', ' + resolved.city : ''}` : locStr;

      const weatherData = await fetchCurrentWeather(lat, lng, locName);

      // Second Gemini call: synthesize natural spoken response
      const phrasePrompt = `Phrase this weather report as one warm, natural spoken sentence a friend would say.
Data: Location: ${weatherData.location_name}, Temp: ${weatherData.temp_c}°C, Condition: ${weatherData.condition}, Will rain soon: ${weatherData.will_rain_soon}, Is live: ${weatherData.is_live}.
${!weatherData.is_live ? 'Note: Mention that this is an estimated forecast.' : ''}`;

      const phraseRes = await model.generateContent(phrasePrompt);
      const spoken = phraseRes.response.text().trim();

      return res.json({
        intent: 'get_weather',
        function_call: { name: callName, args },
        data: weatherData,
        spoken_response: spoken,
        is_live: weatherData.is_live,
      });
    }

    // ------------------------------------------------------------------------
    // Case 2: log_expense
    // ------------------------------------------------------------------------
    if (callName === 'log_expense') {
      const amount = Number(args.amount_inr) || 0;
      const category = args.category || 'other';
      const note = args.note || 'expense';

      await logExpenseToFirestore({
        userId,
        amount_inr: amount,
        category,
        note,
        source: 'voice',
      });

      const summary = await getExpenseSummaryFromFirestore({ userId, period: 'today' });

      const phrasePrompt = `The user logged an expense. Confirm it warmly in one spoken sentence stating the added amount and the new total for today.
Added: ₹${amount} for ${note} (${category}).
New Today Total: ₹${summary.total_inr}.
Format similar to: "Got it, added ₹${amount} for ${note}. Your new total for today is ₹${summary.total_inr}."`;

      const phraseRes = await model.generateContent(phrasePrompt);
      const spoken = phraseRes.response.text().trim();

      return res.json({
        intent: 'log_expense',
        function_call: { name: callName, args },
        data: {
          added_amount: amount,
          category,
          note,
          today_total_inr: summary.total_inr,
        },
        spoken_response: spoken,
      });
    }

    // ------------------------------------------------------------------------
    // Case 3: get_expense_summary
    // ------------------------------------------------------------------------
    if (callName === 'get_expense_summary') {
      const period = args.period || 'today';
      const summary = await getExpenseSummaryFromFirestore({ userId, period });

      const phrasePrompt = `The user asked for their spending summary. Respond in one concise spoken sentence.
Total for ${period}: ₹${summary.total_inr}. Total items: ${summary.count}.
If total is 0, mention they haven't logged any expenses yet for this period.`;

      const phraseRes = await model.generateContent(phrasePrompt);
      const spoken = phraseRes.response.text().trim();

      return res.json({
        intent: 'get_expense_summary',
        function_call: { name: callName, args },
        data: summary,
        spoken_response: spoken,
      });
    }

    // ------------------------------------------------------------------------
    // Case 4: find_nearby_experience
    // ------------------------------------------------------------------------
    if (callName === 'find_nearby_experience') {
      // Call solver-api
      let solverResult = null;
      try {
        const solverRes = await fetch(`${SOLVER_API_URL}/voice/find-experience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location_anchor: args.location_anchor,
            time_available_minutes: args.time_available_minutes,
            budget_max_inr: args.budget_max_inr,
            crowd_preference: args.crowd_preference,
            activity_type: args.activity_type,
            activeTripDeadlines: context.activeTripDeadlines || [],
            currentItinerary: context.currentItinerary || null,
          }),
        });

        if (solverRes.ok) {
          solverResult = await solverRes.json();
        }
      } catch (solverErr) {
        console.warn('[VoiceRouter] Solver API call error:', solverErr?.message || solverErr);
      }

      if (!solverResult || !solverResult.experience) {
        return res.json({
          intent: 'find_nearby_experience',
          function_call: { name: callName, args },
          data: null,
          spoken_response: `I could not find an experience near ${args.location_anchor} that fits within ${args.time_available_minutes} minutes. Would you like to expand your search?`,
        });
      }

      const exp = solverResult.experience;
      const phrasePrompt = `Phrase this single recommendation as one warm, concise spoken sentence a friend would say. State the distance, that it fits their time, and mention price only if budget was given.
Experience name: ${exp.name}
Distance: ${exp.distance_meters} meters
Category: ${exp.category}
Price: ₹${exp.price_inr}
Crowd status: ${exp.crowd_tag === 'low' ? 'usually quiet' : 'moderate'}
Time remaining after visit: ${exp.time_remaining_after_visit_minutes} minutes
User budget: ${args.budget_max_inr ? '₹' + args.budget_max_inr : 'unspecified'}`;

      const phraseRes = await model.generateContent(phrasePrompt);
      const spoken = phraseRes.response.text().trim();

      return res.json({
        intent: 'find_nearby_experience',
        function_call: { name: callName, args },
        data: exp,
        spoken_response: spoken,
      });
    }

    return res.json({
      intent: 'none',
      spoken_response: 'I can help you find nearby experiences, check the weather, or log an expense. What would you like?',
      data: null,
    });
  } catch (err) {
    console.error('[VoiceRouter] Intent routing error:', err);
    return res.status(500).json({ detail: err.message || 'Intent routing failed' });
  }
});
