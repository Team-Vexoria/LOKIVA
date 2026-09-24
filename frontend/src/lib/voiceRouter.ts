import { auth } from './firebase';

export interface UserSessionContext {
  userId?: string;
  currentItinerary?: any;
  currentLocation?: { lat: number; lng: number } | null;
  currentLocationName?: string;
  activeTripDeadlines?: Array<{ label: string; time: string }>;
}

export interface VoiceRouteResponse {
  intent: 'get_weather' | 'log_expense' | 'get_expense_summary' | 'find_nearby_experience' | 'none';
  spoken_response: string;
  data?: any;
  is_live?: boolean;
}

const REALTIME_API_URL =
  import.meta.env.VITE_REALTIME_API_URL || 'http://localhost:4000';

function sanitizeVoiceText(str: string): string {
  if (!str) return '';
  return str.replace(/[\u2014\u2015]/g, ', ').replace(/[\u2013]/g, '-').replace(/--+/g, '-').trim();
}

/**
 * Routes spoken input through the secure backend proxy.
 * Gemini Function Calling is executed strictly on the server to prevent
 * API key exposure in the client bundle.
 */
export async function routeVoiceInput(
  transcript: string,
  context: UserSessionContext = {}
): Promise<VoiceRouteResponse> {
  console.log('[ROUTER] received transcript:', transcript);

  if (!transcript || transcript.trim() === '') {
    return {
      intent: 'none',
      spoken_response: '',
    };
  }

  // Retrieve user authentication token if signed in
  let idToken: string | null = null;
  try {
    if (auth && auth.currentUser) {
      idToken = await auth.currentUser.getIdToken();
    }
  } catch {
    // Non-blocking fallback
  }

  if (!idToken) {
    idToken =
      localStorage.getItem('lokiva_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('auth_token');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (idToken) {
    headers['Authorization'] = `Bearer ${idToken}`;
  }

  // Add session ID header for guest users with stable persistence
  let sessionId = localStorage.getItem('lokiva_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('lokiva_session_id', sessionId);
  }
  headers['x-session-id'] = sessionId;

  try {
    const payload = {
      transcript,
      context,
      current_time: new Date().toISOString(),
    };
    console.log('[ROUTER] sending to backend with payload:', payload);

    const res = await fetch(`${REALTIME_API_URL}/voice/route`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Voice router HTTP ${res.status}`);
    }

    const json = await res.json();
    return {
      intent: json.intent || 'none',
      spoken_response: sanitizeVoiceText(json.spoken_response || ''),
      data: json.data || null,
      is_live: json.is_live,
    };
  } catch (err: any) {
    console.warn('[VoiceRouter] Backend call failed:', err?.message || err);
    return {
      intent: 'none',
      spoken_response: 'Could not connect to the voice assistant service.',
    };
  }
}
