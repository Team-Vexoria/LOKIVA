import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { ScoredExperience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import {
  Sparkles,
  Send,
  User,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendations?: ScoredExperience[];
}

export function AiGuidePage() {
  const [searchParams] = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [inputMessage, setInputMessage] = useState(initialPrompt);
  const [currentCity, setCurrentCity] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      timestamp: 'Just now',
      content:
        "Namaste! 🙏 Welcome to LOKIVA, your AI Cultural Concierge.\n\nI'm here to help you experience authentic Indian heritage, generational culinary traditions, and master artisan workshops.\n\nBefore I recommend any places, where are you heading? (e.g., Jaipur, Varanasi, Udaipur, Delhi, Mumbai, Kochi, Goa)\n\nTell me your destination and what you're in the mood for, and I'll curate the top 2 signature spots for you!",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      const chatRes = await api.chatWithConcierge({
        message: textToSend,
        city: currentCity || undefined,
        chat_history: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (chatRes.context_destination) {
        setCurrentCity(chatRes.context_destination);
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: chatRes.reply,
        recommendations: chatRes.suggested_experiences || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const rawMsg = err.message || '';
      const isNetworkError = /failed to fetch|network|refused|failed to connect/i.test(rawMsg);
      const isTransient = /503|high demand|temporarily unavailable|service unavailable/i.test(rawMsg);

      let friendlyMsg = 'Unable to reach the concierge. Please try again.';
      if (isNetworkError) {
        friendlyMsg =
          'Connecting to the LOKIVA Concierge service... The backend server is now active. Please tap send or type your question again!';
      } else if (isTransient) {
        friendlyMsg =
          "I'm experiencing a momentary high demand spike right now. Please tap send again in a moment, or tell me your destination and budget to get started!";
      } else {
        friendlyMsg =
          rawMsg.replace(/^(AI Concierge Error:\s*|\[GoogleGenerativeAI Error\]:\s*)/i, '').slice(0, 160) || friendlyMsg;
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
    }
  };

  // Ensure user always starts at the top of the page upon navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (initialPrompt) {
      handleSend(initialPrompt);
    }
  }, []);

  return (
    <div className="min-h-screen bg-paper text-ink pb-36 pt-6 sm:pt-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* AI Concierge Header */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-paper-100 border border-paper-300 text-teal rounded-full text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>Powered by Gemini AI</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-ink tracking-tight">
              AI Cultural Concierge
            </h1>
            <p className="text-xs sm:text-sm text-dusk-600 font-sans max-w-xl">
              Ask me anything about travel, culture, food, and experiences across India. I'll provide personalized recommendations based on your needs.
            </p>
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

                    {/* AI Recommended Experiences */}
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

          {/* Loading Animation */}
          {isLoading && (
            <div className="flex gap-4 max-w-xl">
              <div className="w-10 h-10 rounded-2xl bg-white border border-paper-400 text-marigold flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 animate-spin text-marigold" />
              </div>
              <div className="p-5 bg-white border border-paper-400 rounded-3xl rounded-tl-xs text-xs font-mono text-ink space-y-2 shadow-sm flex-1">
                <div className="flex items-center gap-2 text-teal font-bold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Thinking about the best experiences for you...</span>
                </div>
                <p className="text-[11px] text-dusk-600 font-sans">
                  Please wait while I analyze your request and find the perfect places.
                </p>
                <div className="w-full bg-paper-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-marigold h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-paper/95 backdrop-blur-md border-t border-paper-300 p-4 z-40">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Context Header / Destination Selector */}
            {!currentCity ? (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-dusk font-mono text-[10px] uppercase tracking-wider flex-shrink-0">
                  Select destination:
                </span>
                {['Jaipur', 'Varanasi', 'Goa', 'Mumbai', 'Delhi', 'Kochi', 'Udaipur'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSend(`I want to explore ${city}`)}
                    className="px-2.5 py-1 bg-white hover:bg-paper-100 border border-paper-400 rounded-full text-xs font-mono font-medium text-ink transition flex-shrink-0 shadow-xs cursor-pointer"
                  >
                    📍 {city}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs font-mono px-1">
                <span className="flex items-center gap-1.5 text-teal font-bold">
                  <span>📍 Active Destination: <strong>{currentCity}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentCity(null)}
                  className="hover:underline text-[11px] text-terracotta font-medium cursor-pointer"
                >
                  Change city
                </button>
              </div>
            )}

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
                placeholder={
                  !currentCity
                    ? 'Where in India are you heading? (e.g., Jaipur, Varanasi, Goa, Kochi...)'
                    : `Ask anything about ${currentCity} (e.g., 3 hours with family, ₹2000 budget, street food)`
                }
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
