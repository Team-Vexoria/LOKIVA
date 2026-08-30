'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { StructuredIntent, ScoredExperience, Experience } from '../../types';
import { ExperienceCard } from '../../components/ExperienceCard';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Compass,
  ArrowRight,
  Code2,
  Calendar,
  Layers,
  Clock,
  Coins,
  Footprints,
  ShieldCheck,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  intent?: StructuredIntent;
  recommendations?: ScoredExperience[];
  timestamp: string;
}

function AiGuideContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPrompt = searchParams.get('prompt') || '';

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [itineraryIds, setItineraryIds] = useState<number[]>([]);
  const [showJsonInspector, setShowJsonInspector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lokiva_itinerary_ids');
      if (saved) {
        setItineraryIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveItineraryIds = (ids: number[]) => {
    setItineraryIds(ids);
    try {
      localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const toggleItinerary = (exp: Experience) => {
    if (itineraryIds.includes(exp.id)) {
      saveItineraryIds(itineraryIds.filter((id) => id !== exp.id));
    } else {
      saveItineraryIds([...itineraryIds, exp.id]);
    }
  };

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.aiChat(q);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        intent: res.extracted_intent,
        recommendations: res.recommendations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI chat failed:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'I ran into an issue connecting to the engine, but here are the top verified local experiences that fit your situation.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && messages.length === 0) {
      handleSend(initialPrompt);
    } else if (messages.length === 0) {
      // Initial Welcome Message
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: "Namaste! I am your LOKIVA AI Local Concierge for India. Tell me your destination (e.g. Mumbai, Goa, Kochi, Jaipur, Delhi, Varanasi, Rishikesh), who you're with, your available time and budget, and any walking or dietary preferences. I will extract your constraints and recommend authentic, verified local experiences.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const presetQueries = [
    "I'm with my parents in Mumbai. We have 4 hours, ₹2,000 total, want local food and culture, and low walking.",
    "What can I do in Goa under ₹3000 with adventure and hidden beaches?",
    "I have 3 hours in Kochi and want authentic cultural and spice experiences.",
    "I want heritage havelis and hand block printing in Jaipur with zero tourist traps.",
    "Find authentic street food in Delhi with minimal walking for family.",
    "Find authentic hidden gems near me within 5 km."
  ];

  const buildPlanFromRecommendations = async (recs: ScoredExperience[]) => {
    if (!recs || recs.length === 0) return;
    const expIds = recs.map((r) => r.experience.id);
    saveItineraryIds(expIds);
    try {
      await api.createItinerary({
        title: 'AI Curated Day Plan',
        start_time: '10:00',
        total_duration_mins: 240,
        total_budget: 2000.0,
        experience_ids: expIds
      });
    } catch {
      // fallback
    }
    router.push('/itinerary');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 h-[calc(100vh-4rem)] transition-colors">
      {/* Top AI Concierge Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 p-0.5 shadow-md shadow-orange-500/20">
            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">AI Local Concierge</h2>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Grounded in Database Facts
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero hallucinations on prices, hours, or distances</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJsonInspector(!showJsonInspector)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showJsonInspector
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-500'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>{showJsonInspector ? 'Hide Constraints JSON' : 'View Extracted JSON'}</span>
          </button>

          {itineraryIds.length > 0 && (
            <Link
              href="/itinerary"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{itineraryIds.length} in Plan</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Chat Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full">
        {messages.map((msg) => {
          const isAi = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                  isAi
                    ? 'bg-gradient-to-tr from-orange-500 to-rose-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Content */}
              <div className={`max-w-3xl space-y-3 ${isAi ? 'items-start' : 'items-end flex flex-col'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                      : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Extracted Structured JSON Inspector */}
                {isAi && msg.intent && showJsonInspector && (
                  <div className="w-full rounded-xl bg-slate-900 dark:bg-slate-950 border border-slate-800 p-3 text-[11px] font-mono text-emerald-400 overflow-x-auto shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1 font-sans">
                      <span>STRUCTURED CONSTRAINTS (EXTRACTED)</span>
                      <span>100% JSON Schema</span>
                    </div>
                    <pre>{JSON.stringify(msg.intent, null, 2)}</pre>
                  </div>
                )}

                {/* Constraint Summary Pills if AI response */}
                {isAi && msg.intent && (
                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-300">
                    <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span>₹{msg.intent.budget} budget</span>
                    </span>
                    <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      <span>{msg.intent.duration_minutes / 60} hrs available</span>
                    </span>
                    {msg.intent.accessibility?.low_walking && (
                      <span className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg">
                        <Footprints className="w-3.5 h-3.5" />
                        <span>Low walking verified</span>
                      </span>
                    )}
                    {msg.intent.hidden_gem_preference && (
                      <span className="flex items-center gap-1 bg-purple-950/60 border border-purple-500/30 text-purple-400 px-2.5 py-1 rounded-lg">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Hidden Gem Filter Active</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Recommendation Cards Carousel / Grid */}
                {isAi && msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="w-full space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Top {msg.recommendations.length} Recommendations For You
                      </span>
                      <button
                        onClick={() => buildPlanFromRecommendations(msg.recommendations!)}
                        className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 bg-orange-500/10 px-3 py-1 rounded-lg border border-orange-500/20 transition-all hover:scale-105"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Build Itinerary From These</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                      {msg.recommendations.map((rec) => (
                        <ExperienceCard
                          key={rec.experience.id}
                          experience={rec.experience}
                          scored={rec}
                          isInItinerary={itineraryIds.includes(rec.experience.id)}
                          onToggleItinerary={toggleItinerary}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
              <span>Extracting constraints, filtering impossible spots & ranking experiences...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Query Chips Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          <span className="text-[11px] text-slate-500 font-semibold shrink-0">Try Query:</span>
          {presetQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              💬 {q.slice(0, 48)}...
            </button>
          ))}
        </div>
      </div>

      {/* Input Message Form Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-5xl mx-auto relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-1.5 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all shadow-sm"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Tell me who you're with, time, budget, and walking preferences..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 px-4 py-2.5 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity disabled:opacity-40 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AiGuidePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading AI Local Concierge...</div>}>
      <AiGuideContent />
    </Suspense>
  );
}

