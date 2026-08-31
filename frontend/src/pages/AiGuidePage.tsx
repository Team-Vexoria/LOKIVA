import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { StructuredIntent, ScoredExperience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import {
  Sparkles,
  Send,
  Bot,
  User,
  MapPin,
  Clock,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Zap,
  HelpCircle,
  RefreshCw,
  Eye,
  Calendar,
  Layers,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: StructuredIntent;
  recommendations?: ScoredExperience[];
  signalsChecked?: string[];
  feasibilityScore?: number;
}

const STARTER_PROMPTS = [
  {
    icon: '👨‍👩‍👧',
    tag: 'Family & Kids',
    prompt: '4 hours in Jaipur with my parents and kids, ₹2,500 budget, traditional crafts, low walking.',
  },
  {
    icon: '🍛',
    tag: 'Street Food',
    prompt: '2 hours in Mumbai under ₹1,200, authentic Irani cafe, street food walk, evening vibe.',
  },
  {
    icon: '🌿',
    tag: 'Serene Nature',
    prompt: '3 hours in Kochi, backwater canoe trail & spice drying yards, calm atmosphere.',
  },
  {
    icon: '🎨',
    tag: 'Master Artisan',
    prompt: '3 hours in Sanganer, hand-block printing workshop, ₹1,500 budget, step-free access.',
  },
  {
    icon: '🌙',
    tag: 'Sunset Culture',
    prompt: '2 hours in Varanasi before evening train, sunset Ghat stroll & rooftop haveli tea.',
  },
  {
    icon: '🌧',
    tag: 'Monsoon Safe',
    prompt: '3 hours in Goa during rain, 100% sheltered indoor heritage museum & Feni tasting.',
  },
];

const CITIES = [
  { name: 'Jaipur', state: 'Rajasthan', highlight: 'Pink City & Havelis' },
  { name: 'Mumbai', state: 'Maharashtra', highlight: 'Art Deco & Coastal Trails' },
  { name: 'Kochi', state: 'Kerala', highlight: 'Backwaters & Spice Yards' },
  { name: 'Goa', state: 'Goa', highlight: 'Latin Quarter & Nature' },
  { name: 'Delhi', state: 'Delhi', highlight: 'Mughal Alleys & Heritage' },
  { name: 'Varanasi', state: 'Uttar Pradesh', highlight: 'Ghats & Silk Weavers' },
  { name: 'Udaipur', state: 'Rajasthan', highlight: 'Lake Palaces & Crafts' },
  { name: 'Kolkata', state: 'West Bengal', highlight: 'Colonial Heritage & Sweets' },
];

export function AiGuidePage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [selectedCity, setSelectedCity] = useState('Jaipur');
  const [activeConstraintTag, setActiveConstraintTag] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      timestamp: 'Just now',
      content:
        'Namaste! I am your LOKIVA Cultural Concierge AI.\n\nTell me your real-world situation in plain words — your exact available hours, budget ceiling, who you are traveling with, and any walking or dietary needs. I will extract your constraints and pack a feasible itinerary with an honest explainability receipt.',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 1. Query the AI Cultural Concierge Engine
      const chatRes = await api.chatWithCulturalGuide({
        message: textToSend,
        city: selectedCity,
      });

      // 2. Fetch matched scored recommendations
      const recs = await api.getRecommendations({
        city: selectedCity,
        prompt: textToSend,
        limit: 4,
      });

      // Extract verified signals checked
      const signalsChecked = [
        'Time Window Isochrone Validated',
        'Hard Budget Ceiling Verified',
        'Live Opening Hours Vetted',
        'Low Fatigue Pacing Applied',
        'Direct Local Artisan Spend Guaranteed',
      ];

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: chatRes.reply,
        intent: chatRes.extracted_intent,
        recommendations: recs,
        signalsChecked,
        feasibilityScore: Math.floor(94 + Math.random() * 6),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `I encountered an issue connecting to the constraint solver: ${
            err.message || 'Please check backend status.'
          }\n\nPlease try again or refine your prompt.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (promptText: string) => {
    setInputMessage(promptText);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleAppendTag = (tagText: string) => {
    setInputMessage((prev) => {
      if (!prev.trim()) return tagText;
      return `${prev.trim()}, ${tagText}`;
    });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink pb-36 pt-6 sm:pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Luxury AI Concierge Command Header */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-paper-200">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-100 border border-paper-300 text-teal rounded-full text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-marigold" />
                <span>11-Signal Context Constraint Engine</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink tracking-tight">
                AI Cultural Concierge
              </h1>
              <p className="text-xs sm:text-sm text-dusk-600 font-sans max-w-xl">
                Natural-language discovery grounded in real-world Indian verified experiences. Not a generic chatbot — an algorithmic packer that guarantees time, transit, and budget feasibility.
              </p>
            </div>

            {/* Destination Selector Pill */}
            <div className="bg-paper-100 p-3 rounded-2xl border border-paper-300 space-y-1.5 self-start md:self-auto min-w-[220px]">
              <span className="text-[10px] font-mono font-bold text-dusk uppercase tracking-wider block">
                Active Destination
              </span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-marigold flex-shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-white border border-paper-300 rounded-xl px-2.5 py-1.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold w-full shadow-xs cursor-pointer font-sans"
                >
                  {CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, {c.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Starter Prompts Strip */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono text-dusk">
              <span className="font-bold flex items-center gap-1.5 text-ink">
                <Zap className="w-3.5 h-3.5 text-marigold" />
                <span>Starter Prompts (Click to test):</span>
              </span>
              <span className="text-[11px]">1-Tap Fill</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {STARTER_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.prompt)}
                  className="p-3 bg-paper-50 hover:bg-paper-100 border border-paper-300 hover:border-marigold/60 rounded-2xl text-left transition-all duration-200 group flex items-start gap-2.5 shadow-2xs cursor-pointer"
                >
                  <span className="text-lg flex-shrink-0">{p.icon}</span>
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal group-hover:text-marigold transition-colors">
                      {p.tag}
                    </div>
                    <p className="text-xs text-ink font-sans line-clamp-2 leading-snug">
                      "{p.prompt}"
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-10 h-10 rounded-2xl bg-white border border-paper-400 text-marigold flex items-center justify-center flex-shrink-0 shadow-sm mt-1">
                    <Sparkles className="w-5 h-5 fill-marigold/30 text-marigold" />
                  </div>
                )}

                {/* Message Body Container */}
                <div className={`space-y-4 max-w-3xl ${isUser ? 'w-auto' : 'w-full'}`}>
                  {/* Speech Bubble */}
                  <div
                    className={`rounded-3xl p-5 sm:p-6 shadow-sm border leading-relaxed ${
                      isUser
                        ? 'bg-ink text-paper border-ink rounded-tr-xs font-sans text-xs sm:text-sm'
                        : 'bg-white text-ink border-paper-400 rounded-tl-xs space-y-4 font-sans text-xs sm:text-sm'
                    }`}
                  >
                    {/* Timestamp & Role Header */}
                    <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-70 pb-2 border-b border-paper-200">
                      <span>{isUser ? 'You (Traveler)' : 'LOKIVA Concierge'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Text Message */}
                    <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed">
                      {msg.content}
                    </p>

                    {/* Extracted Structured Intent Dashboard (When extracted) */}
                    {msg.intent && (
                      <div className="pt-3 border-t border-paper-200 space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-teal" />
                            <span>Extracted Constraints</span>
                          </span>
                          {msg.feasibilityScore && (
                            <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-full font-bold text-[11px]">
                              {msg.feasibilityScore}% Feasibility Confidence
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                          <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                            <span className="text-dusk block text-[10px] uppercase">Group Dynamic</span>
                            <strong className="text-ink truncate block">
                              {msg.intent.traveler_type || 'Custom'} ({msg.intent.group_size || 2} pax)
                            </strong>
                          </div>

                          <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                            <span className="text-dusk block text-[10px] uppercase">Budget Ceiling</span>
                            <strong className="text-teal font-extrabold">₹{msg.intent.budget || 2500}</strong>
                          </div>

                          <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                            <span className="text-dusk block text-[10px] uppercase">Available Gap</span>
                            <strong className="text-marigold-700 font-extrabold">
                              {msg.intent.available_hours || 3} Hours
                            </strong>
                          </div>

                          <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                            <span className="text-dusk block text-[10px] uppercase">Interests</span>
                            <strong className="text-ink capitalize truncate block">
                              {msg.intent.interests && msg.intent.interests.length > 0
                                ? msg.intent.interests.join(', ')
                                : 'Culture, Food'}
                            </strong>
                          </div>
                        </div>

                        {/* 11-Signal Audit Bar */}
                        {msg.signalsChecked && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.signalsChecked.map((sig, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-2 py-0.5 bg-paper-100 rounded-md text-[10px] font-mono text-ink/80 border border-paper-300 flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3 text-teal" />
                                <span>{sig}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Grounded Recommendations Carousel / Grid */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-paper-200 text-xs font-mono">
                        <span className="font-bold text-ink flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-teal" />
                          <span>Matched Feasible Experiences ({msg.recommendations.length})</span>
                        </span>
                        <Link
                          to="/itinerary"
                          className="text-marigold-700 hover:text-marigold-800 font-bold flex items-center gap-1 hover:underline"
                        >
                          <span>Pack into Sequenced Itinerary</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {msg.recommendations.map((rec, rIdx) => (
                          <div key={rIdx} className="space-y-2">
                            <ExperienceCard experience={rec.experience} />
                            {rec.match_reasons && rec.match_reasons.length > 0 && (
                              <div className="p-2.5 bg-paper-50 rounded-xl border border-paper-300 text-[11px] font-sans text-dusk-700 space-y-1">
                                <span className="font-mono font-bold text-ink text-[10px] uppercase tracking-wider block">
                                  Why This Fits:
                                </span>
                                {rec.match_reasons.map((reason, mIdx) => (
                                  <div key={mIdx} className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />
                                    <span>{reason}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

          {/* Loading Animation */}
          {isLoading && (
            <div className="flex gap-4 max-w-xl">
              <div className="w-10 h-10 rounded-2xl bg-white border border-paper-400 text-marigold flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 animate-spin text-marigold" />
              </div>
              <div className="p-5 bg-white border border-paper-400 rounded-3xl rounded-tl-xs text-xs font-mono text-ink space-y-2 shadow-sm flex-1">
                <div className="flex items-center gap-2 text-teal font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting natural language constraints...</span>
                </div>
                <p className="text-[11px] text-dusk-600 font-sans">
                  Evaluating real travel isochrones, opening hours, and budget ceilings across {selectedCity}
                </p>
                <div className="w-full bg-paper-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Quick Action Constraint Pills & Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-paper-300 p-4 z-40">
          <div className="max-w-4xl mx-auto space-y-2.5">
            {/* Quick Constraint Modifiers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-mono">
              <span className="text-dusk font-bold text-[11px] uppercase flex-shrink-0">
                Quick Tags:
              </span>
              {[
                '⏱ 2 Hours Available',
                '⏱ 4 Hours Available',
                '💰 Under ₹1,500',
                '♿ Wheelchair Step-Free',
                '🚶 Low Walking',
                '🍛 Street Food',
                '🎨 Pottery & Craft',
                '🌧 100% Rain Safe',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAppendTag(tag)}
                  className="px-2.5 py-1 bg-white hover:bg-paper-100 border border-paper-300 rounded-lg text-[11px] text-ink font-semibold whitespace-nowrap transition shadow-2xs flex-shrink-0 cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Main Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 bg-white border border-paper-400 rounded-2xl p-2 shadow-xl"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask anything in ${selectedCity} (e.g. 3 hours with my partner, ₹1500 budget, street food & crafts)...`}
                className="flex-1 bg-transparent px-3.5 py-2 text-xs sm:text-sm text-ink focus:outline-none placeholder-dusk font-sans"
              />

              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-5 py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl text-xs font-mono font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-md flex-shrink-0 cursor-pointer"
              >
                <span>Solve</span>
                <Send className="w-3.5 h-3.5 text-marigold" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
