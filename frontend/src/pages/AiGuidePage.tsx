import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { ScoredExperience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import { GoogleSignInButton } from '../components/auth/GoogleSignInButton';
import { routeVoiceInput, UserSessionContext } from '../lib/voiceRouter';
import {
  speakWithElevenLabsOrFallback,
  PlaybackController,
  checkHostedTTSConfigured,
} from '../lib/tts';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VOICE_SUGGESTIONS } from '../data/voiceSuggestions';
import {
  Sparkles,
  Send,
  User,
  CheckCircle2,
  RefreshCw,
  Lock,
  ArrowRight,
  RotateCcw,
  MapPin,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CloudSun,
  IndianRupee,
  Navigation,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WeatherData {
  location_name: string;
  temp_c: number;
  condition: string;
  humidity?: number;
  will_rain_soon?: boolean;
  is_live?: boolean;
}

interface ExperienceData {
  name: string;
  distance_meters: number;
  price_inr: number;
  crowd_tag?: string;
  category?: string;
  time_remaining_after_visit_minutes?: number;
}

interface ExpenseData {
  added_amount?: number;
  category?: string;
  note?: string;
  today_total_inr?: number;
  total_inr?: number;
  count?: number;
  period?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  spokenText?: string;
  timestamp: string;
  recommendations?: ScoredExperience[];
  intent?: string;
  weatherData?: WeatherData;
  experienceData?: ExperienceData;
  expenseData?: ExpenseData;
  isVoiceInitiated?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  timestamp: 'Just now',
  content:
    'Namaste! Welcome to LOKIVA, your AI Cultural Concierge.\n\nWhere are you heading to in India, and what are your interests? Tell me your destination (like Jaipur, Varanasi, Mumbai, or Goa) and whether you are drawn to royal heritage, street food, artisan workshops, or quiet temples, and I will curate the best spots for you!',
  spokenText:
    'Namaste! Welcome to Lokiva. Where in India are you heading to, and what are your interests? Tell me your destination and what you want to experience!',
};

const INTEREST_OPTIONS = [
  { label: 'Royal Heritage', icon: '🏰', interest: 'royal heritage and palaces' },
  { label: 'Street Food', icon: '🍲', interest: 'authentic street food and legendary culinary stalls' },
  { label: 'Artisan Crafts', icon: '🎨', interest: 'traditional artisan workshops and master craftspeople' },
  { label: 'Sacred Ghats', icon: '🪔', interest: 'sacred ghats, evening aarti and spiritual walks' },
  { label: 'Coastal Vibes', icon: '🌊', interest: 'quiet beaches and coastal seafood shacks' },
  { label: 'Quiet Temples', icon: '🧘', interest: 'peaceful ancient temples away from crowds' },
];

const getChatStorageKey = (user: { id?: string | number; email?: string } | null) => {
  if (!user) return null;
  return `lokiva_ai_guide_chat_${user.id || user.email}`;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AiGuidePage() {
  const { user, isAuthenticated, isLoading: authLoading, demoLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [inputMessage, setInputMessage] = useState(initialPrompt);

  // Synchronously initialize messages from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const activeUser = user || JSON.parse(localStorage.getItem('lokiva_user') || 'null');
      if (activeUser) {
        const key = getChatStorageKey(activeUser);
        if (key) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
              return parsed.messages;
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to initialize chat from storage:', e);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  // Synchronously initialize currentCity from localStorage
  const [currentCity, setCurrentCity] = useState<string | null>(() => {
    try {
      const activeUser = user || JSON.parse(localStorage.getItem('lokiva_user') || 'null');
      if (activeUser) {
        const key = getChatStorageKey(activeUser);
        if (key) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.currentCity || null;
          }
        }
      }
    } catch {}
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [isTotalLoading, setIsTotalLoading] = useState(false);
  const [ttsActiveMessageId, setTtsActiveMessageId] = useState<string | null>(null);
  const [voiceSpeakingState, setVoiceSpeakingState] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const latestReplyRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activePlaybackRef = useRef<PlaybackController | null>(null);

  // Voice input hook
  const {
    isListening,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: voiceSupported,
  } = useVoiceInput({
    onFinalTranscript: (text: string) => {
      handleSend(text, true);
    },
  });

  // ---------------------------------------------------------------------------
  // Expense total fetch
  // ---------------------------------------------------------------------------
  const fetchTodayTotal = useCallback(async () => {
    setIsTotalLoading(true);
    try {
      const sessionId = localStorage.getItem('lokiva_session_id') || `guest_${Date.now()}`;
      const res = await fetch('/voice/expense-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({ period: 'today' }),
      });
      if (res.ok) {
        const data = await res.json();
        setTodayTotal(data.total_inr ?? 0);
      }
    } catch {
      // Non-blocking: total stays at 0 if backend unreachable
    } finally {
      setIsTotalLoading(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  // Fetch today's expense total when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTodayTotal();
    }
  }, [isAuthenticated, fetchTodayTotal]);

  // Sync chat history when user changes
  useEffect(() => {
    if (!user) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      setCurrentCity(null);
      return;
    }
    const key = getChatStorageKey(user);
    if (!key) return;
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          if (parsed.currentCity) setCurrentCity(parsed.currentCity);
        }
      }
    } catch (err) {
      console.error('Failed to load saved chat from localStorage:', err);
    }
  }, [user?.id, user?.email]);

  // Persist chat to localStorage
  useEffect(() => {
    if (!user) return;
    const key = getChatStorageKey(user);
    if (!key) return;

    // Safety guard: never overwrite an existing multi-message conversation with a bare welcome
    if (messages.length <= 1 && messages[0]?.id === 'welcome-msg') {
      const existing = localStorage.getItem(key);
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          if (Array.isArray(parsed.messages) && parsed.messages.length > 1) return;
        } catch {}
      }
    }

    localStorage.setItem(key, JSON.stringify({ messages, currentCity, savedAt: Date.now() }));
  }, [messages, currentCity, user]);

  // Auto-scroll on new assistant message
  useEffect(() => {
    if (messages.length <= 1) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      const scrollDown = () => {
        const el = latestReplyRef.current || document.getElementById(`msg-${lastMessage.id}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      const rafId = requestAnimationFrame(scrollDown);
      const t1 = setTimeout(scrollDown, 80);
      const t2 = setTimeout(scrollDown, 250);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [messages]);

  // Scroll to loading state when it appears
  useEffect(() => {
    if (isLoading) {
      const scroll = () => {
        const el = loadingRef.current || document.getElementById('concierge-loading');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      const t = setTimeout(scroll, 80);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  // Auto-send initialPrompt when first authenticated
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (initialPrompt && isAuthenticated && user && messages.length <= 1) {
      handleSend(initialPrompt, false);
    }
  }, [isAuthenticated]);

  // ---------------------------------------------------------------------------
  // TTS
  // ---------------------------------------------------------------------------

  const handleSpeak = useCallback(
    (messageId: string, text: string) => {
      // Toggle off if already speaking this message
      if (ttsActiveMessageId === messageId) {
        activePlaybackRef.current?.stop();
        activePlaybackRef.current = null;
        setTtsActiveMessageId(null);
        setVoiceSpeakingState(false);
        return;
      }

      // Stop any current playback
      activePlaybackRef.current?.stop();
      activePlaybackRef.current = null;

      setTtsActiveMessageId(messageId);
      setVoiceSpeakingState(true);

      activePlaybackRef.current = speakWithElevenLabsOrFallback({
        text,
        onEnd: () => {
          setTtsActiveMessageId(null);
          setVoiceSpeakingState(false);
          activePlaybackRef.current = null;
        },
        onError: () => {
          setTtsActiveMessageId(null);
          setVoiceSpeakingState(false);
          activePlaybackRef.current = null;
        },
      });
    },
    [ttsActiveMessageId]
  );

  // Cleanup playback on unmount
  useEffect(() => {
    return () => {
      activePlaybackRef.current?.stop();
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Start fresh chat
  // ---------------------------------------------------------------------------
  const handleStartFreshChat = () => {
    if (messages.length > 1) {
      const confirmReset = window.confirm('Start a fresh conversation? This will clear your current chat history.');
      if (!confirmReset) return;
    }
    // Stop any active TTS
    activePlaybackRef.current?.stop();
    activePlaybackRef.current = null;
    setTtsActiveMessageId(null);
    setVoiceSpeakingState(false);

    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setCurrentCity(null);
    setInputMessage('');

    if (user) {
      const key = getChatStorageKey(user);
      if (key) localStorage.removeItem(key);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---------------------------------------------------------------------------
  // Unified send handler (typed, chip tap, voice)
  // ---------------------------------------------------------------------------
  const handleSend = async (customText?: string, voiceInitiated = false) => {
    if (!isAuthenticated || !user) return;
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    // Stop mic if a chip or typed send is triggered while listening
    if (isListening) stopListening();

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoiceInitiated: voiceInitiated,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build voice context for the router
      const context: UserSessionContext = {
        currentLocationName: currentCity ? currentCity : 'Jaipur',
        activeTripDeadlines: [],
        currentItinerary: null,
      };

      // Step 1: Try the Gemini function-calling router for structured queries
      const routeResult = await routeVoiceInput(textToSend, context);

      let botContent = routeResult.spoken_response;
      let spokenText = routeResult.spoken_response;
      let recommendations: ScoredExperience[] | undefined;
      let weatherData: WeatherData | undefined;
      let experienceData: ExperienceData | undefined;
      let expenseData: ExpenseData | undefined;

      // Step 2: If no function matched, fall back to cultural concierge for general travel chat
      if (routeResult.intent === 'none') {
        try {
          const chatRes = await api.chatWithConcierge({
            message: textToSend,
            city: currentCity || undefined,
            chat_history: messages.map((m) => ({ role: m.role, content: m.content })),
          });
          if (chatRes.context_destination) setCurrentCity(chatRes.context_destination);
          botContent = chatRes.reply;
          spokenText = chatRes.reply;
          recommendations = chatRes.suggested_experiences || [];
        } catch {
          // If cultural concierge also fails, keep voice router's response as-is
        }
      }

      // Extract structured data from function call results
      if (routeResult.intent === 'get_weather' && routeResult.data) {
        weatherData = routeResult.data as WeatherData;
      }
      if (routeResult.intent === 'find_nearby_experience' && routeResult.data) {
        experienceData = routeResult.data as ExperienceData;
      }
      if (routeResult.intent === 'log_expense' && routeResult.data) {
        expenseData = routeResult.data as ExpenseData;
        // Re-sync total from backend instead of guessing
        fetchTodayTotal();
      }
      if (routeResult.intent === 'get_expense_summary' && routeResult.data) {
        expenseData = routeResult.data as ExpenseData;
        setTodayTotal((routeResult.data as ExpenseData).total_inr ?? 0);
      }

      const botMsgId = `bot-${Date.now()}`;
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: botContent,
        spokenText,
        recommendations,
        intent: routeResult.intent,
        weatherData,
        experienceData,
        expenseData,
        isVoiceInitiated: voiceInitiated,
      };

      setMessages((prev) => [...prev, botMsg]);

      // Auto-TTS only for voice-initiated messages
      if (voiceInitiated && spokenText) {
        handleSpeak(botMsgId, spokenText);
      }
    } catch (err: any) {
      const rawMsg = err.message || '';
      const isNetworkError = /failed to fetch|network|refused|failed to connect/i.test(rawMsg);
      const isTransient = /503|high demand|temporarily unavailable|service unavailable/i.test(rawMsg);

      let friendlyMsg = 'Unable to reach the concierge. Please try again.';
      if (isNetworkError) {
        friendlyMsg =
          'Connecting to the LOKIVA Concierge service. The backend server may still be warming up. Please tap Send again in a moment.';
      } else if (isTransient) {
        friendlyMsg =
          'I am experiencing a momentary high demand spike. Please tap Send again in a moment, or tell me your destination to get started!';
      } else {
        friendlyMsg =
          rawMsg.replace(/^(AI Concierge Error:\s*|\[GoogleGenerativeAI Error\]:\s*)/i, '').slice(0, 160) ||
          friendlyMsg;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: friendlyMsg,
        },
      ]);
    } finally {
      setIsLoading(false);
      resetTranscript();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Input display: show interim transcript while listening, otherwise normal value
  const inputDisplayValue = isListening && interimTranscript ? interimTranscript : inputMessage;

  return (
    <div className="min-h-screen bg-paper text-ink pb-52 sm:pb-64 pt-6 sm:pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* AI Concierge Header */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-100 border border-paper-300 text-teal rounded-full text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-marigold" />
                <span>Powered by Gemini AI</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink tracking-tight">
                AI Cultural Concierge
              </h1>
              <p className="text-xs sm:text-sm text-dusk-600 font-sans max-w-xl">
                Ask me anything about travel, culture, food, and experiences across India. Use the microphone or type freely.
              </p>
            </div>

            {/* Right side: expense total + fresh chat */}
            <div className="flex flex-col sm:items-end gap-3 flex-shrink-0">
              {/* Today's expense total */}
              {isAuthenticated && (
                <div className="flex items-center gap-2 px-4 py-2 bg-paper-100 border border-paper-300 rounded-2xl">
                  <IndianRupee className="w-3.5 h-3.5 text-[#C1443B] flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk">
                      Today's Spend
                    </div>
                    <div className="text-sm font-mono font-black text-ink">
                      {isTotalLoading ? (
                        <span className="animate-pulse text-dusk">...</span>
                      ) : (
                        <>&#x20B9;{todayTotal.toLocaleString('en-IN')}</>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Start fresh chat */}
              {isAuthenticated && messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleStartFreshChat}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-paper-100 hover:bg-paper-200 border border-paper-400 hover:border-ink/40 text-ink rounded-2xl text-xs font-mono font-bold transition shadow-xs cursor-pointer"
                  title="Clear conversation and start fresh"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-terracotta" />
                  <span>Start Fresh Chat</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Auth Loading State */}
        {authLoading && (
          <div className="bg-white rounded-3xl border border-paper-400 p-8 shadow-sm text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-teal animate-spin mx-auto" />
            <p className="text-xs font-mono text-dusk">Checking authentication...</p>
          </div>
        )}

        {/* Conversation Stream */}
        {!authLoading && (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLatestReply = !isUser && index === messages.length - 1 && messages.length > 1;
              const isSpeakingThis = ttsActiveMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  id={`msg-${msg.id}`}
                  ref={isLatestReply ? latestReplyRef : undefined}
                  className={`flex gap-3.5 sm:gap-4 scroll-mt-24 sm:scroll-mt-28 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Assistant Avatar */}
                  {!isUser && (
                    <div className="w-10 h-10 rounded-2xl bg-white border border-paper-400 text-marigold flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <Sparkles className="w-5 h-5 fill-marigold/30 text-marigold" />
                    </div>
                  )}

                  {/* Message Body */}
                  <div className={`space-y-3 max-w-3xl ${isUser ? 'w-auto' : 'w-full'}`}>
                    <div
                      className={`rounded-3xl p-5 sm:p-6 shadow-sm border leading-relaxed ${
                        isUser
                          ? 'bg-ink text-paper border-ink rounded-tr-xs font-sans text-xs sm:text-sm'
                          : 'bg-white text-ink border-paper-400 rounded-tl-xs space-y-4 font-sans text-xs sm:text-sm'
                      }`}
                    >
                      {/* Timestamp row with speaker icon for assistant */}
                      <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-70 pb-2 border-b border-paper-200">
                        <span>{isUser ? 'You (Traveler)' : 'LOKIVA Concierge'}</span>
                        <div className="flex items-center gap-2">
                          <span>{msg.timestamp}</span>
                          {/* Speaker icon: only on assistant messages, only if TTS supported */}
                          {!isUser && voiceSupported && (
                            <button
                              type="button"
                              onClick={() => handleSpeak(msg.id, msg.spokenText || msg.content)}
                              title={isSpeakingThis ? 'Stop speaking' : 'Read aloud'}
                              className={`p-1 rounded-lg transition-colors ${
                                isSpeakingThis
                                  ? 'text-[#C1443B] bg-[#C1443B]/10'
                                  : 'text-dusk hover:text-ink'
                              } opacity-100`}
                            >
                              {isSpeakingThis ? (
                                <VolumeX className="w-3 h-3" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Text content */}
                      <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">{msg.content}</p>

                      {/* Weather data card */}
                      {msg.weatherData && (
                        <div className="mt-1 p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-heading font-bold text-ink flex items-center gap-1.5">
                              <CloudSun className="w-4 h-4 text-[#C1443B]" />
                              {msg.weatherData.location_name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                msg.weatherData.is_live
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {msg.weatherData.is_live ? 'Live' : 'Estimated'}
                            </span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-mono font-black text-ink">
                              {msg.weatherData.temp_c}&deg;C
                            </span>
                            <span className="text-xs font-sans capitalize text-dusk-600">
                              {msg.weatherData.condition}
                            </span>
                          </div>
                          {msg.weatherData.will_rain_soon && (
                            <div className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                              Rain expected soon - carry an umbrella
                            </div>
                          )}
                          {msg.weatherData.humidity !== undefined && (
                            <div className="text-[10px] font-mono text-dusk-600">
                              Humidity: {msg.weatherData.humidity}%
                            </div>
                          )}
                        </div>
                      )}

                      {/* Nearby experience card */}
                      {msg.experienceData && (
                        <div className="mt-1 p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-2">
                          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
                            Nearby Match
                          </span>
                          <h4 className="text-sm font-display font-bold text-ink leading-snug">
                            {msg.experienceData.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-dusk-600">
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {msg.experienceData.distance_meters}m walk
                            </span>
                            <span>
                              {msg.experienceData.price_inr > 0
                                ? `\u20B9${msg.experienceData.price_inr}`
                                : 'Free entry'}
                            </span>
                            {msg.experienceData.crowd_tag && (
                              <span className="capitalize">{msg.experienceData.crowd_tag} crowd</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Expense recorded chip */}
                      {msg.expenseData && msg.expenseData.added_amount !== undefined && (
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Recorded +&#x20B9;{msg.expenseData.added_amount}
                            {msg.expenseData.category ? ` (${msg.expenseData.category})` : ''}
                          </span>
                          {msg.expenseData.today_total_inr !== undefined && (
                            <span className="text-[10px] font-mono text-dusk-600">
                              Today's total: &#x20B9;{msg.expenseData.today_total_inr.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expense summary display */}
                      {msg.expenseData &&
                        msg.expenseData.added_amount === undefined &&
                        msg.expenseData.total_inr !== undefined && (
                          <div className="mt-1 p-4 bg-paper-50 rounded-2xl border border-paper-300 space-y-1">
                            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
                              Expense Summary
                            </span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-mono font-black text-ink">
                                &#x20B9;{msg.expenseData.total_inr.toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs font-mono text-dusk-600">
                                {msg.expenseData.period || 'today'}
                              </span>
                            </div>
                            {msg.expenseData.count !== undefined && (
                              <div className="text-[10px] font-mono text-dusk-600">
                                {msg.expenseData.count} item{msg.expenseData.count !== 1 ? 's' : ''} logged
                              </div>
                            )}
                          </div>
                        )}

                      {/* AI Recommended Experiences (cultural concierge results) */}
                      {msg.recommendations && msg.recommendations.length > 0 && (
                        <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 shadow-sm space-y-4">
                          <div className="pb-3 border-b border-paper-200 text-xs font-mono">
                            <span className="font-bold text-ink flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-teal" />
                              <span>AI Recommended Experiences ({msg.recommendations.length})</span>
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {msg.recommendations.map((rec, rIdx) => (
                              <ExperienceCard key={rIdx} experience={rec.experience} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-10 h-10 rounded-2xl bg-ink text-paper flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Auth Gate Card */}
            {!isAuthenticated && (
              <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-md space-y-6 max-w-xl mx-auto my-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-paper-100 border border-paper-300 text-marigold flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="w-7 h-7 text-marigold" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">
                    Sign in to Chat with AI Concierge
                  </h2>
                  <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                    Please log in or create an account to converse with your AI Cultural Concierge. Your travel chats, tips, and personalized recommendations will be securely preserved across visits.
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <GoogleSignInButton role="traveler" redirectTo="/ai-guide" />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-paper-300" />
                    <span className="text-[10px] font-mono font-bold text-dusk uppercase tracking-wider">
                      Or with Credentials
                    </span>
                    <div className="flex-1 h-px bg-paper-300" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Link
                      to="/login/traveler?redirect=/ai-guide"
                      className="w-full py-2.5 px-4 bg-ink hover:bg-ink-800 text-paper rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                    </Link>
                    <Link
                      to="/register/traveler?redirect=/ai-guide"
                      className="w-full py-2.5 px-4 bg-white hover:bg-paper-100 border border-paper-400 text-ink rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>Create Account</span>
                    </Link>
                  </div>
                  <button
                    type="button"
                    onClick={() => demoLogin('traveler', 'Piyush Kumar', 'piyush@lokiva.com')}
                    className="w-full py-2 px-3 bg-paper-100 hover:bg-paper-200 border border-dashed border-paper-400 text-teal rounded-xl text-xs font-mono font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-marigold" />
                    <span>Instant Demo Access (Traveler)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Loading Animation */}
            {isLoading && (
              <div
                ref={loadingRef}
                id="concierge-loading"
                className="flex gap-4 max-w-xl scroll-mt-24 sm:scroll-mt-28"
              >
                <div className="w-10 h-10 rounded-2xl bg-white border border-paper-400 text-marigold flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 animate-spin text-marigold" />
                </div>
                <div className="p-5 bg-white border border-paper-400 rounded-3xl rounded-tl-xs text-xs font-mono text-ink space-y-2 shadow-sm flex-1">
                  <div className="flex items-center gap-2 text-teal font-bold">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {voiceSpeakingState ? 'Speaking response...' : 'Thinking about the best experiences for you...'}
                    </span>
                  </div>
                  <p className="text-[11px] text-dusk-600 font-sans">
                    Please wait while I analyze your request.
                  </p>
                  <div className="w-full bg-paper-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-marigold h-full w-2/3 animate-pulse rounded-full" />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} className="h-4" />
          </div>
        )}

        {/* Fixed Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-paper-300 p-2.5 sm:p-4 z-40">
          <div className="max-w-4xl mx-auto space-y-2">
            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-1 px-2">
                <div className="flex items-center gap-2 text-xs font-sans text-dusk-700 text-center sm:text-left">
                  <Lock className="w-4 h-4 text-marigold flex-shrink-0" />
                  <span>Please sign in or create an account to start chatting with the AI Concierge.</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-center">
                  <Link
                    to="/login/traveler?redirect=/ai-guide"
                    className="flex-1 sm:flex-none justify-center px-4 py-2 bg-ink hover:bg-ink-800 text-paper rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                  </Link>
                  <Link
                    to="/register/traveler?redirect=/ai-guide"
                    className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white hover:bg-paper-100 border border-paper-400 text-ink rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Create Account</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* City context header */}
                {!currentCity ? (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none [-webkit-overflow-scrolling:touch] text-xs">
                    <span className="text-dusk font-mono text-[10px] uppercase tracking-wider flex-shrink-0">
                      Destination:
                    </span>
                    {['Jaipur', 'Varanasi', 'Goa', 'Mumbai', 'Delhi', 'Kochi', 'Udaipur'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setCurrentCity(city);
                          handleSend(`I want to explore ${city}. What authentic experiences do you recommend?`, false);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white hover:bg-paper-100 border border-paper-400 rounded-full text-xs font-mono font-medium text-ink transition flex-shrink-0 shadow-xs cursor-pointer"
                      >
                        <MapPin className="w-3 h-3 text-teal flex-shrink-0" />
                        <span>{city}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono px-1">
                      <span className="flex items-center gap-1.5 text-teal font-bold">
                        <MapPin className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                        <span>
                          Active Destination: <strong>{currentCity}</strong>
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentCity(null)}
                        className="hover:underline text-[11px] text-terracotta font-medium cursor-pointer"
                      >
                        Change city
                      </button>
                    </div>
                    {/* Interest chips for active city */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 max-w-full scrollbar-none [-webkit-overflow-scrolling:touch] text-xs">
                      <span className="text-dusk font-mono text-[10px] uppercase tracking-wider flex-shrink-0">
                        Interests:
                      </span>
                      {INTEREST_OPTIONS.map((item, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSend(`Show me ${item.interest} in ${currentCity}`, false)}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-paper-100 hover:bg-paper-200 border border-paper-300 rounded-full text-[11px] font-sans text-ink transition flex-shrink-0 shadow-xs cursor-pointer"
                        >
                          <span>{item.icon}</span>
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestion chips - horizontally scrollable from central config */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [-webkit-overflow-scrolling:touch]">
                  <span className="text-dusk font-mono text-[10px] uppercase tracking-wider flex-shrink-0 hidden sm:block">
                    Try:
                  </span>
                  {VOICE_SUGGESTIONS.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(suggestion.query, false)}
                      disabled={isLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-paper-100 border border-paper-300 hover:border-[#C1443B]/40 rounded-full text-[11px] font-sans text-ink transition flex-shrink-0 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {suggestion.icon && <span className="text-xs">{suggestion.icon}</span>}
                      <span>{suggestion.label}</span>
                    </button>
                  ))}
                </div>

                {/* Text input form with mic button */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 bg-white border border-paper-400 rounded-2xl p-1.5 sm:p-2 shadow-xl"
                >
                  {/* Mic button */}
                  {voiceSupported && (
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      title={isListening ? 'Stop listening' : 'Start voice input'}
                      className={`p-2 rounded-xl transition-all flex-shrink-0 ${
                        isListening
                          ? 'bg-[#C1443B] text-white animate-pulse shadow-md'
                          : 'bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300'
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <input
                    ref={inputRef}
                    type="text"
                    value={inputDisplayValue}
                    onChange={isListening ? undefined : (e) => setInputMessage(e.target.value)}
                    readOnly={isListening}
                    placeholder={
                      isListening
                        ? 'Listening to your voice...'
                        : !currentCity
                        ? 'Where in India are you heading? (e.g., Jaipur, Varanasi, Goa...)'
                        : `Ask about ${currentCity} - weather, experiences, expenses...`
                    }
                    className={`flex-1 min-w-0 bg-transparent px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm text-ink focus:outline-none placeholder-dusk font-sans ${
                      isListening ? 'italic text-dusk' : ''
                    }`}
                  />

                  <button
                    type="submit"
                    disabled={isLoading || (!inputMessage.trim() && !isListening)}
                    className="px-3.5 sm:px-5 py-2 sm:py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl text-xs font-mono font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-md flex-shrink-0 cursor-pointer"
                  >
                    <span>Solve</span>
                    <Send className="w-3.5 h-3.5 text-marigold" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
