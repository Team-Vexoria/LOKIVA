import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  Compass,
  Clock,
  MapPin,
  Mic,
  Volume2,
  CheckCircle2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Laptop,
  MessageCircle,
  ExternalLink,
  Lock,
  ChevronLeft,
  ChevronRight,
  Share2,
  Award,
  Bell,
  Check,
  Maximize2,
  Minimize2,
  X,
  Play,
  Pause,
  Navigation,
  Send,
  Bot,
  User,
  Ticket,
} from 'lucide-react';

export type FeatureTab = 'itinerary' | 'vernacular' | 'checkout';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  badge?: string;
  action?: { label: string; url: string };
}

export function DeviceMockupSection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeatureTab>('itinerary');

  // Desktop Window State: boolean toggling between full Safari Window and centered mobile view
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isDesktopMaximized, setIsDesktopMaximized] = useState(false);

  // Share button copy toast state
  const [isCopied, setIsCopied] = useState(false);

  // iPhone 16 Pro States
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [mobileActiveView, setMobileActiveView] = useState<'concierge' | 'destinations'>('concierge');
  const [mobileCurrentCity, setMobileCurrentCity] = useState<string | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'ai',
      text: "Namaste! Welcome to LOKIVA, your AI Cultural Concierge.\n\nI'm here to help you experience authentic Indian heritage, generational culinary traditions, and master artisan workshops.\n\nBefore I recommend any places, where are you heading? (e.g., Jaipur, Varanasi, Udaipur, Delhi, Mumbai, Kochi, Goa)\n\nTell me your destination and available time, and I'll curate the top 2 signature spots for you!",
      badge: 'Gemini 1.5 Pro',
    },
  ]);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Auto-scroll ONLY the chat container, NEVER scrolling the main website window
  useEffect(() => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [chatMessages, isAiTyping]);

  // Handle sending a chat message using the EXACT same platform function (api.chatWithConcierge)
  const handleSendChat = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isAiTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setChatInputText('');
    setIsAiTyping(true);

    try {
      // Calls the EXACT same function that powers the website's AI Concierge
      const chatRes = await api.chatWithConcierge({
        message: trimmed,
        city: mobileCurrentCity || undefined,
        chat_history: newMessages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
      });

      if (chatRes.context_destination) {
        setMobileCurrentCity(chatRes.context_destination);
      }

      let action: { label: string; url: string } | undefined;
      if (chatRes.suggested_experiences && chatRes.suggested_experiences.length > 0) {
        const topExp = chatRes.suggested_experiences[0];
        const expTitle = topExp.experience?.title || (topExp as any).title || 'Curated Spot';
        const expCity = (topExp as any).city || chatRes.context_destination || 'Jaipur';
        const expId = (topExp as any).id || (topExp.experience as any)?.id || '1';
        action = {
          label: `Book: ${expTitle.slice(0, 24)}...`,
          url: `/experience/${expId}?city=${encodeURIComponent(expCity)}`,
        };
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: chatRes.reply,
          badge: chatRes.context_destination ? `${chatRes.context_destination} Verified` : 'AI Concierge',
          action,
        },
      ]);
    } catch (err: any) {
      console.warn('Mobile Concierge API error, using intelligent fallback:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-fallback-${Date.now()}`,
          sender: 'ai',
          text: "Hello! Namaste 🙏 Welcome to LOKIVA, your personal AI Cultural Concierge.\n\nWhich Indian city or destination are you exploring or planning to visit? (e.g., Jaipur, Varanasi, Udaipur, Delhi, Mumbai, Kochi, Goa)\n\nShare where you're heading and what you enjoy, and I'll curate the top 2 signature spots perfectly suited for you!",
          badge: 'AI Concierge',
          action: { label: 'Explore 36 States', url: '/explore' },
        },
      ]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Copy share link handler
  const handleShareClick = () => {
    navigator.clipboard.writeText('https://lokiva.vercel.app');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Play audio voice note simulation with realistic speech synthesis and animated waveform
  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } else {
      setIsPlayingAudio(true);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = "Welcome to our village courtyard! We mold pots from Egyptian paste and quartz powder without clay kilns. Each traveler molds their own flower vase and paints authentic cobalt blue motifs to take home. Workshop fee is ₹450 per traveler including all raw minerals.";
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.rate = 0.95;
        utter.pitch = 1.0;
        utter.onend = () => setIsPlayingAudio(false);
        utter.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => setIsPlayingAudio(false), 8000);
      }
    }
  };

  // Top bar scroll / drag listener to trigger Notification Center
  const handleTopBarWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      setIsNotificationCenterOpen(true);
    }
  };

  // Touch drag tracking for mobile status bar pull-down
  const touchStartY = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current !== null) {
      const deltaY = e.touches[0].clientY - touchStartY.current;
      if (deltaY > 20) {
        setIsNotificationCenterOpen(true);
        touchStartY.current = null;
      }
    }
  };

  return (
    <div className="w-full pt-6 sm:pt-8 pb-8 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2] border-t border-b border-[#E5DFD5]">
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-2 mb-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-ink tracking-tight">
          Live Cultural Intelligence &amp; On-Ground Sync
        </h2>

        <p className="text-xs sm:text-sm text-dusk-700 max-w-2xl mx-auto font-sans leading-relaxed font-medium">
          Synthesize hyper-local micro-itineraries on your desktop while synchronizing real-time vernacular audio, verified artisan passes, and live AI guidance directly to your mobile device.
        </p>

        {/* Feature Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'itinerary'
                ? 'bg-white text-ink shadow-sm border border-[#DDD7CC]'
                : 'text-ink-800 hover:text-ink hover:bg-white/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#C1443B]" />
            <span>Time-Budget Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('vernacular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'vernacular'
                ? 'bg-white text-ink shadow-sm border border-[#DDD7CC]'
                : 'text-ink-800 hover:text-ink hover:bg-white/60'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#C1443B]" />
            <span>Artisan Masterclasses</span>
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'bg-white text-ink shadow-sm border border-[#DDD7CC]'
                : 'text-ink-800 hover:text-ink hover:bg-white/60'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-[#C1443B]" />
            <span>Passes &amp; Gate Access</span>
          </button>
        </div>
      </div>

      {/* Dual Device / Centered Standalone Showcase Container */}
      <div className="relative w-full mx-auto max-w-6xl">
        {/* Reserved Height Slot for Reopen Button (Prevents any vertical layout jump/drop) */}
        <div className="h-9 mb-3 flex items-center justify-center">
          <AnimatePresence>
            {!isDesktopOpen && (
              <motion.div
                key="reopen-button-container"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => setIsDesktopOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] hover:border-[#C1443B]/50 text-xs font-heading font-bold text-ink shadow-xs hover:shadow transition cursor-pointer group"
                >
                  <Laptop className="w-3.5 h-3.5 text-[#C1443B] group-hover:scale-110 transition-transform" />
                  <span>Reopen MacBook Window</span>
                  <Maximize2 className="w-3 h-3 text-dusk-400 group-hover:text-ink transition-colors" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Coordinated Flex Container with Fixed Vertical Center Baseline */}
        <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-6 min-h-[500px]">
          {/* Left Main Viewport: Desktop Safari Window */}
          <AnimatePresence mode="popLayout">
            {isDesktopOpen && (
              <motion.div
                key="desktop-window"
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{
                  opacity: 1,
                  scale: isDesktopMaximized ? 1.025 : 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.94,
                  transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
                }}
                transition={{
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  layout: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
                }}
                className="w-full lg:flex-1 flex flex-col justify-center"
              >
                <div
                  className={`w-full bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border-2 border-[#D5CEC2] shadow-[0_20px_50px_-10px_rgba(18,33,59,0.12)] overflow-hidden flex flex-col h-full transition-all ${
                    isDesktopMaximized ? 'ring-2 ring-[#27C93F]/50 shadow-2xl z-10' : ''
                  }`}
                >
                  {/* macOS Safari Header Bar */}
                  <div className="bg-[#EFEAE1] border-b-2 border-[#DCD3C5] px-4 py-2.5 flex items-center justify-between select-none relative">
                    {/* Window Controls (Traffic Lights) */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsDesktopOpen(false)}
                        title="Close Window"
                        className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center group shadow-xs cursor-pointer hover:brightness-90 transition"
                      >
                        <X className="w-2 h-2 text-[#7F100B] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <button
                        onClick={() => setIsDesktopOpen(false)}
                        title="Minimize Window"
                        className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center group shadow-xs cursor-pointer hover:brightness-90 transition"
                      >
                        <Minimize2 className="w-2 h-2 text-[#7F5000] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <button
                        onClick={() => setIsDesktopMaximized(!isDesktopMaximized)}
                        title={isDesktopMaximized ? 'Restore Normal Window Size' : 'Maximize Window Size'}
                        className={`w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center group shadow-xs cursor-pointer hover:brightness-90 transition ${
                          isDesktopMaximized ? 'ring-2 ring-[#27C93F]/60' : ''
                        }`}
                      >
                        {isDesktopMaximized ? (
                          <Minimize2 className="w-2 h-2 text-[#0A5613]" />
                        ) : (
                          <Maximize2 className="w-2 h-2 text-[#0A5613] opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>

                      <div className="hidden sm:flex items-center gap-1 ml-3 text-ink-700">
                        <button
                          type="button"
                          onClick={() => setActiveTab(activeTab === 'checkout' ? 'vernacular' : 'itinerary')}
                          className="p-1 hover:text-ink cursor-pointer transition"
                          title="Previous View"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab(activeTab === 'itinerary' ? 'vernacular' : 'checkout')}
                          className="p-1 hover:text-ink cursor-pointer transition"
                          title="Next View"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Address / URL Bar */}
                    <div className="flex-1 max-w-lg mx-2 sm:mx-4">
                      <div className="bg-white rounded-md border border-[#D5CEC2] px-3 py-1 flex items-center justify-between gap-2 text-xs font-mono text-ink shadow-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span className="truncate font-bold text-ink text-[11px] sm:text-xs">
                            https://lokiva.vercel.app{activeTab === 'itinerary' ? '/itinerary' : activeTab === 'vernacular' ? '/artisan-studio' : '/checkout'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={handleShareClick}
                            title="Share URL"
                            className="p-1 hover:bg-[#FAF8F5] rounded text-ink cursor-pointer transition"
                          >
                            {isCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Share2 className="w-3 h-3 text-dusk-500 hover:text-ink" />
                            )}
                          </button>
                          <button
                            onClick={() => navigate('/explore')}
                            title="Open in new tab"
                            className="p-1 hover:bg-[#FAF8F5] rounded text-ink cursor-pointer transition"
                          >
                            <ExternalLink className="w-3 h-3 text-dusk-500 hover:text-ink" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Browser Viewport Content */}
                  <div className="p-4 sm:p-5 lg:p-6 space-y-3.5 bg-[#FAF8F5] flex-1">
                    <AnimatePresence mode="wait">
                      {/* TAB 1: ITINERARY VIEWPORT */}
                      {activeTab === 'itinerary' && (
                        <motion.div
                          key="itinerary-desktop"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          {/* Top Status Header */}
                          <div className="bg-white rounded-xl p-4 sm:p-4.5 border-2 border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3 shadow-sm">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#C1443B]">
                                MUMBAI HERITAGE MICRO-CIRCUIT
                              </span>
                              <h4 className="text-lg sm:text-xl font-display font-black text-ink tracking-tight">
                                Colaba Heritage Quarter &amp; Artisan Weavers
                              </h4>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-[9px] font-mono font-bold uppercase text-dusk-500">
                                  SOLVER DURATION
                                </div>
                                <div className="text-lg font-display font-black text-ink">
                                  3.5 <span className="text-[11px] font-mono text-dusk-600">HOURS</span>
                                </div>
                              </div>
                              <div className="h-7 w-px bg-[#E5DFD5]" />
                              <div className="text-right">
                                <div className="text-[9px] font-mono font-bold uppercase text-dusk-500">
                                  ESTIMATED BUDGET
                                </div>
                                <div className="text-lg font-display font-black text-ink">
                                  ₹380 <span className="text-[11px] font-mono text-dusk-600">/ ₹600</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Waypoint Cards Grid */}
                          <div className="space-y-2.5">
                            {/* Stop 1 */}
                            <div className="bg-white rounded-xl p-3.5 sm:p-4 border-2 border-[#E5DFD5] space-y-2.5 shadow-xs">
                              <div className="flex items-center justify-between pb-1.5 border-b border-[#EFE9DF]">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-5 h-5 rounded bg-[#FAF4ED] border border-[#E8DCCB] text-[11px] font-heading font-black text-[#C1443B]">
                                    01
                                  </span>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-heading font-extrabold uppercase tracking-wider text-ink text-[11px]">
                                      Stop 1
                                    </span>
                                    <span className="text-dusk-300">·</span>
                                    <span className="font-mono text-dusk-700 font-bold text-[11px]">
                                      09:00 - 10:00
                                    </span>
                                    <span className="text-[9px] font-mono text-dusk-600 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                                      60 mins
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-heading font-bold text-teal-700 tracking-wide">
                                  ₹80 Tasting Fee
                                </span>
                              </div>
                              <div className="flex gap-3 items-center">
                                <img
                                  src="https://content.jdmagicbox.com/comp/def_content_category/chai-point-11979630-jbt2xr4sg2.jpg"
                                  alt="Mumbai Heritage Breakfast & Chai"
                                  className="w-20 h-16 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                                />
                                <div className="space-y-0.5">
                                  <h5 className="font-heading font-extrabold text-ink text-sm sm:text-base">
                                    Mumbai Heritage Breakfast &amp; Chai Tasting
                                  </h5>
                                  <p className="text-[11px] text-dusk-700 leading-relaxed font-sans font-medium line-clamp-2">
                                    Centuries-old morning breakfast institution serving regional specialty dishes, hot Irani chai, and freshly baked accompaniments in Colaba.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Stop 2 */}
                            <div className="bg-white rounded-xl p-3.5 sm:p-4 border-2 border-[#E5DFD5] space-y-2.5 shadow-xs">
                              <div className="flex items-center justify-between pb-1.5 border-b border-[#EFE9DF]">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-5 h-5 rounded bg-[#FAF4ED] border border-[#E8DCCB] text-[11px] font-heading font-black text-[#C1443B]">
                                    02
                                  </span>
                                  <div className="flex items-center gap-1.5 text-xs">
                                    <span className="font-heading font-extrabold uppercase tracking-wider text-ink text-[11px]">
                                      Stop 2
                                    </span>
                                    <span className="text-dusk-300">·</span>
                                    <span className="font-mono text-dusk-700 font-bold text-[11px]">
                                      10:15 - 11:45
                                    </span>
                                    <span className="text-[9px] font-mono text-dusk-600 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                                      90 mins
                                    </span>
                                  </div>
                                </div>
                                <span className="text-xs font-heading font-bold text-[#C1443B] tracking-wide">
                                  ₹300 Workshop Fee
                                </span>
                              </div>
                              <div className="flex gap-3 items-center">
                                <img
                                  src="https://ruralindiaonline.org/_next/image?url=https%3A%2F%2Fproduction.ruralindiaonline.org%2Fuploads%2F05_DSC_7079_KA_Kabir_and_the_fraying_fabric_of_Dindori_weavers_8e13543a7d.jpg&w=1080&q=65"
                                  alt="Mumbai Traditional Handloom Weaving Guild"
                                  className="w-20 h-16 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                                />
                                <div className="space-y-0.5">
                                  <h5 className="font-heading font-extrabold text-ink text-sm sm:text-base">
                                    Mumbai Traditional Handloom Weaving Guild
                                  </h5>
                                  <p className="text-[11px] text-dusk-700 leading-relaxed font-sans font-medium line-clamp-2">
                                    Master weavers operating authentic wooden pit looms to produce exquisite hand-spun textiles and heritage weaves with natural dye masterclasses.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* TAB 2: VERNACULAR VOICE VIEWPORT */}
                      {activeTab === 'vernacular' && (
                        <motion.div
                          key="vernacular-desktop"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#E5DFD5] space-y-3 shadow-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-[#C1443B] text-white flex items-center justify-center font-display font-black text-base">
                                  RS
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-display font-black text-ink text-sm sm:text-base">
                                      Ramswaroop Sharma
                                    </h4>
                                    <span className="text-[9px] font-heading font-extrabold uppercase tracking-widest text-[#C1443B] bg-[#FAF4ED] px-1.5 py-0.5 rounded border border-[#E8DCCB]">
                                      5TH-GEN GUILD
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-dusk-700 font-medium">
                                    Blue Pottery Master Artisan · Kot Jewar, Jaipur District
                                  </p>
                                </div>
                              </div>

                              <a
                                href="https://wa.me/919876543210?text=Namaste%20Ramswaroop-ji,%20I%20saw%20your%20listing%20on%20LOKIVA!"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono hover:bg-emerald-700 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Direct
                              </a>
                            </div>

                            {/* Audio Player */}
                            <div className="p-3 rounded-xl bg-[#F8F5EE] border-2 border-[#E5DFD5] space-y-2">
                              <div className="flex items-center justify-between text-xs font-mono font-bold text-ink">
                                <button
                                  onClick={handleToggleAudio}
                                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#12213B] hover:bg-[#1a2d4f] text-white transition cursor-pointer text-xs"
                                >
                                  {isPlayingAudio ? (
                                    <>
                                      <Pause className="w-3 h-3" /> Pause Note
                                    </>
                                  ) : (
                                    <>
                                      <Play className="w-3 h-3" /> Play Voice Note (0:24)
                                    </>
                                  )}
                                </button>
                                <span className="text-dusk-700 text-[11px]">Dhundhari / Hindi Dialect</span>
                              </div>

                              {/* Sound Wave Bars */}
                              <div className="flex items-center gap-1 h-6 px-1">
                                {[40, 70, 30, 85, 95, 60, 40, 80, 100, 75, 50, 90, 65, 45, 80, 55, 35, 70, 90, 60, 40, 75].map(
                                  (h, idx) => (
                                    <div
                                      key={idx}
                                      style={{ height: `${isPlayingAudio ? Math.min(100, h * 1.2) : h * 0.7}%` }}
                                      className={`flex-1 rounded-sm transition-all duration-200 ${
                                        isPlayingAudio ? 'bg-[#C1443B]' : 'bg-[#12213B]'
                                      }`}
                                    />
                                  )
                                )}
                              </div>
                            </div>

                            {/* Gemini Translation Output */}
                            <div className="p-3 rounded-xl bg-white border-2 border-ink space-y-1 shadow-xs">
                              <div className="text-[10px] font-mono font-black text-ink uppercase tracking-wide">
                                GEMINI 1.5 MULTIMODAL TRANSLATION:
                              </div>
                              <p className="text-xs text-ink leading-relaxed font-sans font-medium">
                                "Welcome to our village courtyard! We mold pots from Egyptian paste and quartz powder without clay kilns. Each traveler molds their own flower vase and paints authentic cobalt blue motifs to take home. Workshop fee is ₹450 per traveler including all raw minerals."
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* TAB 3: CHECKOUT & PASS VIEWPORT */}
                      {activeTab === 'checkout' && (
                        <motion.div
                          key="checkout-desktop"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-3"
                        >
                          <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#E5DFD5] space-y-3 shadow-xs">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b-2 border-[#E5DFD5]">
                              <div>
                                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#C1443B]">
                                  PASS #LOK-2026-BOM-108
                                </span>
                                <h4 className="font-display font-black text-ink text-base sm:text-lg mt-0.5">
                                  Handloom Weaving Workshop Admission Voucher
                                </h4>
                              </div>

                              <div className="text-right">
                                <div className="text-[10px] font-mono font-bold text-dusk-500">PAID AMOUNT</div>
                                <div className="text-lg font-display font-black text-emerald-800">₹300 INR</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
                              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] space-y-0.5">
                                <div className="text-[9px] font-mono font-bold text-dusk-500">AUTHENTICATED TRAVELER</div>
                                <div className="font-extrabold text-ink text-xs sm:text-sm">Piyush Kumar</div>
                                <div className="text-dusk-600 text-[11px]">piyush@lokiva.com · ID Verified</div>
                              </div>

                              <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] space-y-0.5">
                                <div className="text-[9px] font-mono font-bold text-dusk-500">VENUE LOCATION</div>
                                <div className="font-extrabold text-ink text-xs sm:text-sm">Mumbai Traditional Handloom Guild, Colaba</div>
                                <div className="text-dusk-600 text-[11px]">Mumbai, Maharashtra</div>
                              </div>
                            </div>

                            <div className="p-2.5 rounded-lg bg-[#FAF4ED] border border-[#E8DCCB] flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[11px] font-mono text-ink">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                <span>UPI Transaction: #LOK-TXN-9948271</span>
                              </div>
                              <span className="text-[10px] font-heading font-extrabold text-[#C1443B] uppercase">
                                Instant Pass Active
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Phone Mockup: Anchored on right when desktop is open, smoothly Centered & Scaled along strict X-axis */}
          <motion.div
            layout="position"
            transition={{
              layout: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
            }}
            className="relative z-20 shrink-0 w-[310px] min-w-[310px] max-w-[310px] flex justify-center"
          >
            <motion.div
              animate={{
                scale: isDesktopOpen ? 1 : 1.05,
              }}
              transition={{
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-[310px] min-w-[310px] max-w-[310px] bg-[#111622] rounded-[44px] p-2.5 border-[4px] border-[#252E3E] shadow-[0_20px_50px_rgba(18,33,59,0.25)] transition-shadow duration-300 origin-center"
            >
              {/* Titanium Inner Screen */}
              <div className="relative bg-[#FFFFFF] rounded-[36px] overflow-hidden border border-[#D5CEC2] h-[490px] flex flex-col justify-between">
                {/* Top Status Bar & Dynamic Island (Interactive Camera Notch Sensor) */}
                <div
                  onWheel={handleTopBarWheel}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
                  title="Tap camera notch to open live notifications"
                  className="pt-1.5 px-3.5 pb-1.5 flex justify-between items-center text-[10px] font-mono font-bold text-ink select-none cursor-pointer bg-[#F8F5EE] border-b border-[#EBE4D8] hover:bg-[#F2ECE0] transition group"
                >
                  <span>09:41</span>

                  {/* Dynamic Island Pill / Camera Notch */}
                  <div
                    className="bg-black w-20 h-5 rounded-full flex items-center justify-between px-2 shadow-inner transition-transform group-hover:scale-105"
                    title="Tap notch to open notifications"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 border border-neutral-700" />
                    <span className="w-1 h-1 rounded-full bg-neutral-800" />
                  </div>

                  <div className="flex items-center gap-1 text-[10px]">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Notification Center Shade (Slides down from top with realistic iOS spring physics) */}
                <AnimatePresence>
                  {isNotificationCenterOpen && (
                    <motion.div
                      initial={{ y: '-100%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '-100%', opacity: 0 }}
                      transition={{ type: 'spring', damping: 26, stiffness: 240 }}
                      className="absolute inset-x-0 top-0 bottom-0 z-40 bg-black/95 backdrop-blur-xl p-3.5 text-white flex flex-col justify-between overflow-y-auto"
                    >
                      <div className="space-y-2.5 pt-1">
                        {/* iOS Lock Screen Header */}
                        <div className="text-center pt-1.5 pb-1 space-y-0.5">
                          <div className="text-[10px] font-heading uppercase text-neutral-400 font-semibold tracking-wider">
                            Wednesday, September 20
                          </div>
                          <div className="text-2xl font-heading font-extrabold text-white tracking-tight">
                            09:41
                          </div>
                        </div>

                        {/* Quick iOS Control Tiles */}
                        <div className="grid grid-cols-4 gap-1.5 py-0.5">
                          <div className="p-1.5 rounded-lg bg-white/15 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-xs">📶</span>
                            <span className="text-[8px] font-mono text-neutral-300">5G Fast</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/15 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-xs">🛜</span>
                            <span className="text-[8px] font-mono text-neutral-300">Wi-Fi</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/15 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-xs">🔋</span>
                            <span className="text-[8px] font-mono text-neutral-300">100%</span>
                          </div>
                          <div className="p-1.5 rounded-lg bg-white/15 flex flex-col items-center justify-center gap-0.5">
                            <span className="text-xs">📍</span>
                            <span className="text-[8px] font-mono text-neutral-300">GPS On</span>
                          </div>
                        </div>

                        {/* Lokiva Notifications Header */}
                        <div className="flex items-center justify-between text-[10px] font-heading font-bold text-neutral-300 pt-1 pb-0.5 border-b border-white/15">
                          <span className="flex items-center gap-1 text-[#F0A63B]">
                            <Bell className="w-3 h-3" />
                            <span>LOKIVA LIVE ALERTS</span>
                          </span>
                          <button
                            onClick={() => setIsNotificationCenterOpen(false)}
                            className="text-[9px] text-neutral-400 hover:text-white cursor-pointer"
                          >
                            Dismiss
                          </button>
                        </div>

                        {/* Notification Item 1: Artisan Pass */}
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5 text-left backdrop-blur-md">
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                            <span className="font-bold text-[#F0A63B]">PASS CONFIRMED</span>
                            <span>2m ago</span>
                          </div>
                          <h6 className="font-heading font-bold text-xs text-white">
                            Admission Voucher #LOK-2026-BOM-108
                          </h6>
                          <p className="text-[10px] text-neutral-300 font-sans leading-relaxed">
                            Your pass for Mumbai Traditional Handloom Weaving Guild is ready with instant QR gate check-in.
                          </p>
                        </div>

                        {/* Notification Item 2: Vernacular Audio Ready */}
                        <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5 text-left backdrop-blur-md">
                          <div className="flex items-center justify-between text-[9px] text-neutral-400 font-mono">
                            <span className="font-bold text-emerald-400">AUDIO SYNCED</span>
                            <span>14m ago</span>
                          </div>
                          <h6 className="font-heading font-bold text-xs text-white">
                            Master Artisan Ramswaroop Sharma
                          </h6>
                          <p className="text-[10px] text-neutral-300 font-sans leading-relaxed">
                            Gemini 1.5 translation ready for Dhundhari audio masterclass. Tap to play note.
                          </p>
                        </div>
                      </div>

                      {/* Pull Up To Close / Slide Indicator */}
                      <div className="pt-2 pb-0.5 text-center">
                        <button
                          onClick={() => setIsNotificationCenterOpen(false)}
                          className="w-full py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-[11px] font-heading font-bold text-white transition cursor-pointer"
                        >
                          Close Notifications
                        </button>
                        <div className="w-12 h-1 bg-white/30 rounded-full mx-auto mt-1.5" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Mobile View Switcher Pill Header */}
                <div className="bg-[#FAF8F5] px-2.5 py-1.5 border-b border-[#E5DFD5] flex items-center justify-between gap-1">
                  <button
                    onClick={() => setMobileActiveView('concierge')}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] font-heading font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                      mobileActiveView === 'concierge'
                        ? 'bg-[#12213B] text-white shadow-xs'
                        : 'text-ink-700 hover:text-ink hover:bg-white'
                    }`}
                  >
                    <Bot className="w-3 h-3 text-[#C1443B]" />
                    <span>AI Concierge</span>
                  </button>

                  <button
                    onClick={() => setMobileActiveView('destinations')}
                    className={`flex-1 py-1 px-2 rounded-md text-[10px] font-heading font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1 ${
                      mobileActiveView === 'destinations'
                        ? 'bg-[#12213B] text-white shadow-xs'
                        : 'text-ink-700 hover:text-ink hover:bg-white'
                    }`}
                  >
                    <Compass className="w-3 h-3 text-[#C1443B]" />
                    <span>Explore Feed</span>
                  </button>
                </div>

                {/* Mobile Screen Body Content */}
                <div className="flex-1 overflow-y-auto bg-[#FAF8F5] relative">
                  {mobileActiveView === 'concierge' ? (
                    /* VIEW A: INTERACTIVE AI CONCIERGE CHAT */
                    <div className="flex flex-col h-full justify-between p-2.5">
                      {/* Chat Messages List */}
                      <div
                        ref={chatScrollContainerRef}
                        className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[275px] sm:max-h-[290px] scrollbar-thin scrollbar-thumb-[#DDD7CC]"
                      >
                        {chatMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${
                              msg.sender === 'user' ? 'items-end' : 'items-start'
                            } text-left`}
                          >
                            {msg.sender === 'ai' && msg.badge && (
                              <div className="flex items-center gap-1 text-[9px] font-mono font-bold text-[#C1443B] mb-0.5 ml-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>{msg.badge}</span>
                              </div>
                            )}

                            <div
                              className={`max-w-[92%] p-2 rounded-xl text-[11px] font-sans leading-relaxed shadow-xs ${
                                msg.sender === 'user'
                                  ? 'bg-[#12213B] text-white rounded-tr-xs'
                                  : 'bg-white border border-[#E5DFD5] text-ink rounded-tl-xs whitespace-pre-line'
                              }`}
                            >
                              {msg.text}
                            </div>

                            {/* Optional Action Card attached to response */}
                            {msg.action && (
                              <button
                                onClick={() => navigate(msg.action!.url)}
                                className="mt-1 flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FAF4ED] hover:bg-[#F2ECE0] border border-[#E8DCCB] text-[#C1443B] text-[10px] font-heading font-extrabold shadow-xs transition cursor-pointer"
                              >
                                <Ticket className="w-2.5 h-2.5" />
                                <span>{msg.action.label}</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Typing Animation Bubble */}
                        {isAiTyping && (
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-[#E5DFD5] w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-bounce [animation-delay:0.4s]" />
                            <span className="text-[9px] font-mono text-dusk-500 ml-1">LOKIVA thinking...</span>
                          </div>
                        )}
                      </div>

                      {/* Prompt Helper Chips */}
                      <div className="pt-1.5 pb-1 border-t border-[#E8E1D5] space-y-0.5">
                        <div className="text-[8px] font-heading font-bold uppercase tracking-wider text-dusk-500 text-left">
                          SELECT DESTINATION / PROMPT:
                        </div>
                        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                          <button
                            onClick={() => handleSendChat('Jaipur')}
                            className="whitespace-nowrap px-1.5 py-0.5 rounded bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[9px] font-heading font-bold text-ink transition cursor-pointer"
                          >
                            🏰 Jaipur
                          </button>
                          <button
                            onClick={() => handleSendChat('Varanasi')}
                            className="whitespace-nowrap px-1.5 py-0.5 rounded bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[9px] font-heading font-bold text-ink transition cursor-pointer"
                          >
                            🕉️ Varanasi
                          </button>
                          <button
                            onClick={() => handleSendChat('Goa')}
                            className="whitespace-nowrap px-1.5 py-0.5 rounded bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[9px] font-heading font-bold text-ink transition cursor-pointer"
                          >
                            🌴 Goa
                          </button>
                          <button
                            onClick={() => handleSendChat('Udaipur')}
                            className="whitespace-nowrap px-1.5 py-0.5 rounded bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[9px] font-heading font-bold text-ink transition cursor-pointer"
                          >
                            ⛵ Udaipur
                          </button>
                          <button
                            onClick={() => handleSendChat('Street Food & Aarti')}
                            className="whitespace-nowrap px-1.5 py-0.5 rounded bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[9px] font-heading font-bold text-ink transition cursor-pointer"
                          >
                            ☕ Food &amp; Aarti
                          </button>
                        </div>
                      </div>

                      {/* Chat Input Form */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendChat(chatInputText);
                        }}
                        className="flex items-center gap-1 pt-0.5"
                      >
                        <input
                          type="text"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          placeholder="Ask Lokiva Concierge..."
                          className="flex-1 bg-white border border-[#DDD7CC] rounded-lg px-2 py-1 text-[11px] text-ink placeholder:text-dusk-400 focus:outline-none focus:border-[#C1443B] font-sans"
                        />
                        <button
                          type="submit"
                          disabled={!chatInputText.trim() || isAiTyping}
                          className="w-6 h-6 rounded-lg bg-[#C1443B] hover:bg-[#A8372F] disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* VIEW B: TOP DESTINATIONS FEED */
                    <div className="p-2.5 space-y-2 overflow-y-auto">
                      {/* Destination 1 */}
                      <div className="p-2 rounded-xl bg-white border border-[#E5DFD5] space-y-1 shadow-xs text-left">
                        <div className="flex gap-2 items-center">
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Raja_Ghat%2C_Varanasi.JPG/250px-Raja_Ghat%2C_Varanasi.JPG"
                            alt="Raja Ghat"
                            className="w-12 h-10 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="text-[8px] font-heading font-bold text-[#C1443B]">VARANASI, UP</div>
                            <h6 className="font-heading font-bold text-ink text-[10px] leading-snug">Raja Ghat Stone Terraces</h6>
                            <p className="text-[9px] text-dusk-600 font-sans">Free Entry · Classical Sitar</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/explore?search=Ghat')}
                          className="w-full py-1 rounded-md bg-[#FAF4ED] text-[#C1443B] text-[10px] font-heading font-bold hover:bg-[#F2ECE0] transition border border-[#E8DCCB] cursor-pointer"
                        >
                          Explore Ghats
                        </button>
                      </div>

                      {/* Destination 2 */}
                      <div className="p-2 rounded-xl bg-white border border-[#E5DFD5] space-y-1 shadow-xs text-left">
                        <div className="flex gap-2 items-center">
                          <img
                            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80"
                            alt="Taj Mahal"
                            className="w-12 h-10 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="text-[8px] font-heading font-bold text-[#C1443B]">AGRA, UP</div>
                            <h6 className="font-heading font-bold text-ink text-[10px] leading-snug">Taj Mahal Heritage Walk</h6>
                            <p className="text-[9px] text-dusk-600 font-sans">₹50 Entry · UNESCO World Heritage</p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/explore?city=Agra')}
                          className="w-full py-1 rounded-md bg-[#FAF4ED] text-[#C1443B] text-[10px] font-heading font-bold hover:bg-[#F2ECE0] transition border border-[#E8DCCB] cursor-pointer"
                        >
                          Explore Agra
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Passive Home Indicator Bar */}
                <div className="py-1 flex justify-center bg-white border-t border-[#E5DFD5]">
                  <div className="w-16 h-1 bg-ink/30 rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
