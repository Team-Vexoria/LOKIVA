import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  intent?: StructuredIntent;
  recommendations?: ScoredExperience[];
}

export function AiGuidePage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [selectedCity, setSelectedCity] = useState('Jaipur');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Namaste! I am your LOKIVA AI Cultural Concierge. Tell me your situation in plain words: where you are, who you are with, how many hours you have, your budget, and any walking or dietary needs. I will extract your constraints and pack a feasible plan!',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, []);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 1. Chat with guide API
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

      const botMsg: ChatMessage = {
        role: 'assistant',
        content: chatRes.reply,
        intent: chatRes.extracted_intent,
        recommendations: recs,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I encountered an issue connecting to the solver: ${err.message || 'Please check backend status.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>Natural Language Constraint Extraction</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-ink mt-2">
              AI Cultural Concierge
            </h1>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-dusk">Target Region:</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-white border border-paper-300 rounded-xl px-3 py-1.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
            >
              <option value="Jaipur">Jaipur (Rajasthan)</option>
              <option value="Mumbai">Mumbai (Bandra)</option>
              <option value="Kochi">Kochi (Kerala)</option>
              <option value="Goa">Goa (Fontainhas)</option>
              <option value="Delhi">Delhi</option>
              <option value="Varanasi">Varanasi</option>
            </select>
          </div>
        </div>

        {/* Chat History Messages */}
        <div className="space-y-6 pb-28">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3.5 max-w-4xl ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-ink text-paper'
                    : 'bg-white border border-paper-400 text-marigold-600'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-4 flex-1">
                {/* Bubble */}
                <div
                  className={`p-5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-ink text-paper rounded-tr-none font-sans'
                      : 'bg-white border border-paper-400 text-ink rounded-tl-none space-y-4 font-sans'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Extracted Constraints Card (Mono) */}
                  {msg.intent && (
                    <div className="pt-3 border-t border-paper-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                        <span className="text-dusk block text-[10px] uppercase">Group Context</span>
                        <strong className="text-ink">{msg.intent.traveler_type || 'Custom'} ({msg.intent.group_size} pax)</strong>
                      </div>
                      <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                        <span className="text-dusk block text-[10px] uppercase">Budget Ceiling</span>
                        <strong className="text-teal font-extrabold">₹{msg.intent.budget}</strong>
                      </div>
                      <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                        <span className="text-dusk block text-[10px] uppercase">Time Window</span>
                        <strong className="text-marigold-700 font-extrabold">{msg.intent.available_hours || 4} hours</strong>
                      </div>
                      <div className="bg-paper-100 p-2.5 rounded-xl border border-paper-300">
                        <span className="text-dusk block text-[10px] uppercase">Interests</span>
                        <strong className="text-ink capitalize truncate block">{msg.intent.interests?.join(', ')}</strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grounded Recommendations Grid */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-ink flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal" /> Matched Feasible Experiences:
                      </span>
                      <Link to="/itinerary" className="text-marigold-700 hover:underline font-bold">
                        Pack into Sequenced Itinerary &rarr;
                      </Link>
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
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-xl">
              <div className="w-9 h-9 rounded-xl bg-white border border-paper-400 text-marigold flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 bg-white border border-paper-400 rounded-2xl text-xs font-mono text-dusk flex items-center gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-marigold animate-pulse" />
                <span>Extracting constraints & calculating feasibility score...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sticky Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-paper-400 p-4 z-40">
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2 bg-white border border-paper-400 rounded-2xl p-2 shadow-xl"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="e.g. 4 hours in Jaipur with my parents, ₹2,000 budget, local craft, low walking..."
                className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-ink focus:outline-none placeholder-dusk font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-5 py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl text-xs font-mono font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-md flex-shrink-0"
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
