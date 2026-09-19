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

  // macOS Window States: 'normal' | 'minimized' | 'maximized' | 'closed'
  const [macState, setMacState] = useState<'normal' | 'minimized' | 'maximized' | 'closed'>('normal');

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
        const expId = topExp.experience?.id || (topExp as any).id;
        action = {
          label: `View ${expTitle.slice(0, 24)}`,
          url: expId ? `/experience/${expId}` : '/explore',
        };
      } else if (chatRes.context_destination) {
        action = {
          label: `Explore ${chatRes.context_destination}`,
          url: `/explore?city=${encodeURIComponent(chatRes.context_destination)}`,
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

  // Play audio simulation
  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(!isPlayingAudio ? 523.25 : 392.0, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext fallback
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
      const delta = e.touches[0].clientY - touchStartY.current;
      if (delta > 20) {
        setIsNotificationCenterOpen(true);
        touchStartY.current = null;
      }
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-4 pb-8 select-none">
      {/* Interactive Feature Tab Selector */}
      <div className="flex flex-col items-center justify-center mb-8 space-y-3">
        <div>
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
            Interactive Platform Preview
          </span>
        </div>
        <h3 className="text-2xl sm:text-4xl font-display font-black text-ink text-center tracking-tight">
          Explore LOKIVA Across Desktop & Mobile
        </h3>
        <p className="text-xs sm:text-sm text-dusk-700 text-center max-w-xl font-sans font-medium">
          Test live macOS controls and swipe down the iPhone camera notch to reveal real-time alerts.
        </p>

        {/* Tab Pills - Clean High-Contrast Sandstone Style */}
        <div className="inline-flex p-1.5 rounded-xl bg-[#EBE5DA] border-2 border-[#D8CFC0] shadow-sm gap-1 sm:gap-2 mt-2">
          <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'itinerary'
                ? 'bg-white text-ink shadow-sm border border-[#DDD7CC]'
                : 'text-ink-800 hover:text-ink hover:bg-white/60'
            }`}
          >
            <Compass className="w-4 h-4 text-[#C1443B]" />
            <span>AI Spatio-Temporal Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('vernacular')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'vernacular'
                ? 'bg-white text-ink shadow-sm border border-[#DDD7CC]'
                : 'text-ink-800 hover:text-ink hover:bg-white/60'
            }`}
          >
            <Mic className="w-4 h-4 text-[#C1443B]" />
            <span>Artisan Vernacular Voice</span>
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'checkout'
                ? 'bg-white text-ink shadow-sm border border-[#DDD7CC]'
                : 'text-ink-800 hover:text-ink hover:bg-white/60'
            }`}
          >
            <QrCode className="w-4 h-4 text-[#C1443B]" />
            <span>Dynamic UPI QR & Pass</span>
          </button>
        </div>
      </div>

      {/* Floating Layered Device Showcase Container */}
      <div className="relative w-full mx-auto max-w-5xl">
        {/* DESKTOP macOS Safari Window Frame */}
        <AnimatePresence mode="wait">
          {macState === 'closed' ? (
            <motion.div
              key="closed-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full p-8 rounded-2xl bg-white border-2 border-[#DDD7CC] shadow-md text-center space-y-4"
            >
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#FAF7F2] border border-[#DDD7CC] flex items-center justify-center text-ink shadow-sm">
                <Laptop className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-display font-black text-ink">
                  MacBook Window Closed
                </h4>
                <p className="text-xs text-dusk-600 font-medium">
                  Click below to restore the desktop Safari preview.
                </p>
              </div>
              <button
                onClick={() => setMacState('normal')}
                className="px-6 py-2.5 rounded-lg bg-[#12213B] hover:bg-[#1a2d4f] text-white text-xs font-mono font-bold transition shadow cursor-pointer"
              >
                Reopen MacBook Window
              </button>
            </motion.div>
          ) : macState === 'minimized' ? (
            <motion.div
              key="minimized-dock"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full flex items-center justify-center py-6"
            >
              <div
                onClick={() => setMacState('normal')}
                className="group flex items-center gap-3 px-6 py-3 rounded-xl bg-white border-2 border-ink shadow-xl hover:scale-105 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#12213B] flex items-center justify-center text-white font-bold text-xs">
                  LK
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold text-ink">
                    🖥️ LOKIVA Desktop Preview (Minimized)
                  </div>
                  <div className="text-[10px] font-mono text-dusk-500 font-semibold">
                    Click to restore window
                  </div>
                </div>
                <Maximize2 className="w-4 h-4 text-ink ml-2" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="normal-or-maximized"
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: macState === 'maximized' ? 1.02 : 1,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`w-full bg-[#FFFFFF] rounded-2xl sm:rounded-3xl border-2 border-[#D5CEC2] shadow-[0_20px_50px_-10px_rgba(18,33,59,0.12)] overflow-hidden transition-all ${
                macState === 'maximized' ? 'ring-4 ring-ink/20' : ''
              }`}
            >
              {/* macOS Safari Header Bar */}
              <div className="bg-[#EFEAE1] border-b-2 border-[#DCD3C5] px-4 py-3 flex items-center justify-between select-none relative">
                {/* Window Controls (Traffic Lights) - FULLY FUNCTIONAL */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMacState('closed')}
                    title="Close Window"
                    className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center group shadow-xs cursor-pointer hover:brightness-90 transition"
                  >
                    <X className="w-2 h-2 text-[#7F100B] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => setMacState('minimized')}
                    title="Minimize to Dock"
                    className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center group shadow-xs cursor-pointer hover:brightness-90 transition"
                  >
                    <Minimize2 className="w-2 h-2 text-[#7F5000] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <button
                    onClick={() => setMacState(macState === 'maximized' ? 'normal' : 'maximized')}
                    title={macState === 'maximized' ? 'Restore Window Size' : 'Maximize Window'}
                    className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center group shadow-xs cursor-pointer hover:brightness-90 transition"
                  >
                    <Maximize2 className="w-2 h-2 text-[#0A5613] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <div className="hidden sm:flex items-center gap-1 ml-4 text-ink-700">
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
                <div className="flex-1 max-w-lg mx-2 sm:mx-6">
                  <div className="bg-white rounded-md border border-[#D5CEC2] px-3 py-1.5 flex items-center justify-between gap-2 text-xs font-mono text-ink shadow-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate font-bold text-ink">
                        https://lokiva.vercel.app{activeTab === 'itinerary' ? '/itinerary' : activeTab === 'vernacular' ? '/artisan-studio' : '/checkout'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => navigate(activeTab === 'itinerary' ? '/itinerary' : '/explore')}
                        title="Open real page in Lokiva"
                        className="p-1 hover:bg-paper-200 rounded text-ink transition cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Action: Share with Copy Tooltip (CLUSTER LOGO REMOVED!) */}
                <div className="flex items-center gap-2 text-ink relative">
                  <button
                    onClick={handleShareClick}
                    title="Copy Lokiva Vercel Link"
                    className="p-1.5 hover:bg-white rounded-md text-ink transition cursor-pointer flex items-center gap-1 border border-[#D5CEC2]"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Toast Tooltip when copied */}
                  <AnimatePresence>
                    {isCopied && (
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="absolute right-0 top-10 z-50 whitespace-nowrap bg-black text-white text-[11px] font-mono font-bold px-3 py-1.5 rounded-md shadow-xl flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied https://lokiva.vercel.app</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Desktop Content Viewport (Padded right so phone never cuts text) */}
              <div className="p-4 sm:p-6 lg:p-8 pr-4 md:pr-64 lg:pr-76 min-h-[380px] bg-[#FAF8F5]">
                <AnimatePresence mode="wait">
                  {/* TAB 1: ITINERARY SOLVER VIEWPORT */}
                  {activeTab === 'itinerary' && (
                    <motion.div
                      key="itinerary-desktop"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Top Status Header - Bold Clean Typography (No capsule styling) */}
                      <div className="bg-white rounded-xl p-5 border-2 border-[#E5DFD5] flex flex-wrap items-center justify-between gap-4 shadow-sm">
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#C1443B]">
                            VARANASI HERITAGE MICRO-CIRCUIT
                          </span>
                          <h4 className="text-xl sm:text-2xl font-display font-black text-ink tracking-tight">
                            Southern Ghats & Madanpura Silk Weavers
                          </h4>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[10px] font-mono font-bold uppercase text-dusk-500">
                              SOLVER DURATION
                            </div>
                            <div className="text-xl font-display font-black text-ink">
                              3.5 <span className="text-xs font-mono text-dusk-600">HOURS</span>
                            </div>
                          </div>
                          <div className="h-8 w-px bg-[#E5DFD5]" />
                          <div className="text-right">
                            <div className="text-[10px] font-mono font-bold uppercase text-dusk-500">
                              ESTIMATED BUDGET
                            </div>
                            <div className="text-xl font-display font-black text-ink">
                              ₹350 <span className="text-xs font-mono text-dusk-600">/ ₹600</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Waypoint Cards Grid - High-End Architectural Ticket Styling (No chunky black/colored blocks) */}
                      <div className="space-y-3">
                        {/* Stop 1 */}
                        <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#E5DFD5] space-y-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-[#EFE9DF]">
                            <div className="flex items-center gap-2.5">
                              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF4ED] border border-[#E8DCCB] text-xs font-heading font-black text-[#C1443B]">
                                01
                              </span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-heading font-extrabold uppercase tracking-wider text-ink">
                                  Stop 1
                                </span>
                                <span className="text-dusk-300">·</span>
                                <span className="font-mono text-dusk-700 font-bold">
                                  15:30 – 16:20
                                </span>
                                <span className="text-[10px] font-mono text-dusk-600 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                                  50 mins
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-heading font-bold text-teal-700 tracking-wide">
                              Free Admission
                            </span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Raja_Ghat%2C_Varanasi.JPG/250px-Raja_Ghat%2C_Varanasi.JPG"
                              alt="Raja Ghat"
                              className="w-24 h-20 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                            />
                            <div className="space-y-1">
                              <h5 className="font-heading font-extrabold text-ink text-base sm:text-lg">
                                Raja Ghat (Southern Riverfront)
                              </h5>
                              <p className="text-xs text-dusk-700 leading-relaxed font-sans font-medium">
                                Monumental 1720 sandstone steps overlooking the sacred Ganga. Classical sitar musicians gather at the southern stone pavilion before sunset.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stop 2 */}
                        <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#E5DFD5] space-y-3 shadow-xs">
                          <div className="flex items-center justify-between pb-2 border-b border-[#EFE9DF]">
                            <div className="flex items-center gap-2.5">
                              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-[#FAF4ED] border border-[#E8DCCB] text-xs font-heading font-black text-[#C1443B]">
                                02
                              </span>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="font-heading font-extrabold uppercase tracking-wider text-ink">
                                  Stop 2
                                </span>
                                <span className="text-dusk-300">·</span>
                                <span className="font-mono text-dusk-700 font-bold">
                                  16:35 – 17:35
                                </span>
                                <span className="text-[10px] font-mono text-dusk-600 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                                  60 mins
                                </span>
                              </div>
                            </div>
                            <span className="text-xs font-heading font-bold text-[#C1443B] tracking-wide">
                              ₹350 Workshop Fee
                            </span>
                          </div>
                          <div className="flex gap-4 items-center">
                            <img
                              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80"
                              alt="Silk Weavers Guild"
                              className="w-24 h-20 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                            />
                            <div className="space-y-1">
                              <h5 className="font-heading font-extrabold text-ink text-base sm:text-lg">
                                Madanpura Silk Handloom Guild
                              </h5>
                              <p className="text-xs text-dusk-700 leading-relaxed font-sans font-medium">
                                5th-generation pure Zari silk weaving masterclass with master artisan Rashid-ji. 15 min pedestrian walk via narrow stone gali.
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
                      className="space-y-4"
                    >
                      <div className="bg-white rounded-xl p-5 border-2 border-[#E5DFD5] space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-[#C1443B] text-white flex items-center justify-center font-display font-black text-lg">
                              RS
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display font-black text-ink text-base sm:text-lg">
                                  Ramswaroop Sharma
                                </h4>
                                <span className="bg-black text-white text-[10px] font-mono font-extrabold px-2 py-0.5 rounded">
                                  5TH-GEN GUILD
                                </span>
                              </div>
                              <p className="text-xs text-dusk-700 font-medium">
                                Blue Pottery Master Artisan · Kot Jewar, Jaipur District
                              </p>
                            </div>
                          </div>

                          <a
                            href="https://wa.me/919876543210?text=Namaste%20Ramswaroop-ji,%20I%20saw%20your%20listing%20on%20LOKIVA!"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold font-mono hover:bg-emerald-700 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Direct
                          </a>
                        </div>

                        {/* Audio Player - High-Contrast Sharp Styling */}
                        <div className="p-4 rounded-xl bg-[#F8F5EE] border-2 border-[#E5DFD5] space-y-3">
                          <div className="flex items-center justify-between text-xs font-mono font-bold text-ink">
                            <button
                              onClick={handleToggleAudio}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#12213B] hover:bg-[#1a2d4f] text-white transition cursor-pointer"
                            >
                              {isPlayingAudio ? (
                                <>
                                  <Pause className="w-3.5 h-3.5" /> Pause Note
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5" /> Play Voice Note (0:24)
                                </>
                              )}
                            </button>
                            <span className="text-dusk-700">Dhundhari / Hindi Dialect</span>
                          </div>

                          {/* Sound Wave Bars */}
                          <div className="flex items-center gap-1 h-8 px-1">
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
                        <div className="p-4 rounded-xl bg-white border-2 border-ink space-y-1.5 shadow-xs">
                          <div className="text-xs font-mono font-black text-ink uppercase tracking-wide">
                            GEMINI 1.5 MULTIMODAL TRANSLATION:
                          </div>
                          <p className="text-xs sm:text-sm text-ink leading-relaxed font-sans font-medium">
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
                      className="space-y-4"
                    >
                      <div className="bg-white rounded-xl p-5 border-2 border-[#E5DFD5] space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-[#E5DFD5]">
                          <div>
                            <span className="bg-black text-white text-[11px] font-mono font-extrabold px-2.5 py-1 rounded">
                              PASS #LOK-2026-IND-737
                            </span>
                            <h4 className="font-display font-black text-ink text-lg mt-2">
                              Silk Handloom Workshop Admission Voucher
                            </h4>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-mono font-bold text-dusk-500">PAID AMOUNT</div>
                            <div className="text-xl font-display font-black text-emerald-800">₹350 INR</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                            <div className="text-[10px] font-mono font-bold text-dusk-500">AUTHENTICATED TRAVELER</div>
                            <div className="font-extrabold text-ink text-sm">Piyush Kumar</div>
                            <div className="text-dusk-600">piyush@lokiva.com · ID Verified</div>
                          </div>

                          <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E5DFD5] space-y-1">
                            <div className="text-[10px] font-mono font-bold text-dusk-500">VENUE LOCATION</div>
                            <div className="font-extrabold text-ink text-sm">Madanpura Silk Guild, Varanasi</div>
                            <div className="text-dusk-600">Valid today until 18:30 IST · 1 Guest</div>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold">
                          <span className="text-ink">
                            Cryptographic HMAC-SHA256 Signed
                          </span>
                          <span
                            onClick={() => window.print()}
                            className="text-[#C1443B] underline cursor-pointer hover:text-black"
                          >
                            Print Ticket Voucher
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING MOBILE iPhone 16 Pro Device Frame (Realistic Dimensions: Fixed 310px Width) */}
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="hidden md:block absolute -bottom-10 -right-2 lg:-right-4 w-[310px] min-w-[310px] max-w-[310px] bg-[#111622] rounded-[48px] p-2.5 border-[5px] border-[#252E3E] shadow-[0_25px_60px_rgba(18,33,59,0.3)] z-20"
        >
          {/* Titanium Inner Screen */}
          <div className="relative bg-[#FFFFFF] rounded-[38px] overflow-hidden border border-[#D5CEC2] h-[550px] flex flex-col justify-between">
            {/* Top Status Bar & Dynamic Island (Interactive Camera Notch Sensor) */}
            <div
              onWheel={handleTopBarWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onClick={() => setIsNotificationCenterOpen(!isNotificationCenterOpen)}
              title="Tap camera notch to open live notifications"
              className="pt-2 px-4 pb-2 flex justify-between items-center text-[10px] font-mono font-bold text-ink select-none cursor-pointer bg-[#F8F5EE] border-b border-[#EBE4D8] hover:bg-[#F2ECE0] transition group"
            >
              <span>09:41</span>

              {/* Dynamic Island Pill / Camera Notch */}
              <div
                className="bg-black w-22 h-5.5 rounded-full flex items-center justify-between px-2.5 shadow-inner transition-transform group-hover:scale-105"
                title="Tap notch to open notifications"
              >
                <span className="w-2 h-2 rounded-full bg-neutral-900 border border-neutral-700" />
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
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
                  className="absolute inset-x-0 top-0 bottom-0 z-40 bg-black/95 backdrop-blur-xl p-4 text-white flex flex-col justify-between overflow-y-auto"
                >
                  <div className="space-y-3 pt-1">
                    {/* iOS Lock Screen Header */}
                    <div className="text-center pt-2 pb-1 space-y-0.5">
                      <div className="text-[10px] font-heading uppercase text-neutral-400 font-semibold tracking-wider">
                        Wednesday, September 20
                      </div>
                      <div className="text-3xl font-heading font-extrabold text-white tracking-tight">
                        09:41
                      </div>
                    </div>

                    {/* Quick iOS Control Tiles */}
                    <div className="grid grid-cols-4 gap-2 py-1">
                      <div className="p-2 rounded-xl bg-white/15 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs">📶</span>
                        <span className="text-[9px] font-mono text-neutral-300">5G Fast</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/15 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs">🛜</span>
                        <span className="text-[9px] font-mono text-neutral-300">Wi-Fi</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/15 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs">🔋</span>
                        <span className="text-[9px] font-mono text-neutral-300">100%</span>
                      </div>
                      <div className="p-2 rounded-xl bg-white/15 flex flex-col items-center justify-center gap-1">
                        <span className="text-xs">📍</span>
                        <span className="text-[9px] font-mono text-neutral-300">GPS On</span>
                      </div>
                    </div>

                    {/* Lokiva Notifications Header */}
                    <div className="flex items-center justify-between text-[11px] font-heading font-bold text-neutral-300 pt-1 pb-0.5 border-b border-white/15">
                      <span className="flex items-center gap-1 text-[#F0A63B]">
                        <Bell className="w-3.5 h-3.5" />
                        <span>LOKIVA LIVE ALERTS</span>
                      </span>
                      <button
                        onClick={() => setIsNotificationCenterOpen(false)}
                        className="text-[10px] text-neutral-400 hover:text-white cursor-pointer"
                      >
                        Dismiss ✕
                      </button>
                    </div>

                    {/* Alert 1 */}
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5 text-left">
                      <div className="flex items-center justify-between text-[9px] text-[#F0A63B] font-mono font-bold">
                        <span>🧭 REAL-TIME TRANSIT</span>
                        <span>Now</span>
                      </div>
                      <p className="text-[11px] text-neutral-200 leading-snug font-sans">
                        Approaching Raja Ghat stone stairs. Sitar performance begins in 15 mins.
                      </p>
                    </div>

                    {/* Alert 2 */}
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5 text-left">
                      <div className="flex items-center justify-between text-[9px] text-teal-300 font-mono font-bold">
                        <span>🧵 MADANPURA GUILD</span>
                        <span>12m ago</span>
                      </div>
                      <p className="text-[11px] text-neutral-200 leading-snug font-sans">
                        Master Rashid confirmed silk handloom workshop slot for 4:30 PM.
                      </p>
                    </div>

                    {/* Alert 3 */}
                    <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 space-y-0.5 text-left">
                      <div className="flex items-center justify-between text-[9px] text-emerald-400 font-mono font-bold">
                        <span>⚡ UPI TICKET READY</span>
                        <span>25m ago</span>
                      </div>
                      <p className="text-[11px] text-neutral-200 leading-snug font-sans">
                        ₹350 Paid. Digital QR pass activated for gate entry.
                      </p>
                    </div>
                  </div>

                  {/* Swipe Up Bar to dismiss */}
                  <div
                    onClick={() => setIsNotificationCenterOpen(false)}
                    className="py-2 flex flex-col items-center justify-center cursor-pointer group"
                  >
                    <div className="w-16 h-1 bg-white/50 group-hover:bg-white rounded-full transition-colors mb-1" />
                    <span className="text-[10px] font-sans text-neutral-400 group-hover:text-white">Swipe or tap to close</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Viewport Header: Segment Switcher */}
            <div className="px-3 pt-2 pb-1.5 border-b border-[#E5DFD5] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileActiveView('concierge')}
                  className={`text-xs font-heading font-bold pb-0.5 transition cursor-pointer ${
                    mobileActiveView === 'concierge'
                      ? 'text-[#C1443B] border-b-2 border-[#C1443B]'
                      : 'text-dusk-500 hover:text-ink'
                  }`}
                >
                  AI Concierge
                </button>
                <span className="text-dusk-300">·</span>
                <button
                  onClick={() => setMobileActiveView('destinations')}
                  className={`text-xs font-heading font-bold pb-0.5 transition cursor-pointer ${
                    mobileActiveView === 'destinations'
                      ? 'text-[#C1443B] border-b-2 border-[#C1443B]'
                      : 'text-dusk-500 hover:text-ink'
                  }`}
                >
                  Destinations
                </button>
              </div>

              <span className="text-[10px] font-heading font-bold text-ink bg-[#FAF4ED] px-2 py-0.5 rounded border border-[#E8DCCB]">
                Live
              </span>
            </div>

            {/* Mobile Viewport Body */}
            <div className="flex-1 flex flex-col justify-between overflow-hidden bg-[#FAF8F5]">
              {mobileActiveView === 'concierge' ? (
                /* VIEW A: REAL INTERACTIVE AI CONCIERGE CHAT */
                <div className="flex-1 flex flex-col justify-between overflow-hidden p-3">
                  {/* Chat Messages Scroll Container */}
                  <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        {msg.sender === 'ai' ? (
                          <div className="max-w-[90%] bg-white rounded-2xl rounded-tl-xs p-2.5 border border-[#E5DFD5] shadow-xs space-y-1.5 text-left">
                            <div className="flex items-center gap-1.5 text-[10px] font-heading font-bold text-ink">
                              <Bot className="w-3 h-3 text-[#C1443B]" />
                              <span>LOKIVA AI</span>
                              {msg.badge && (
                                <span className="text-[9px] font-heading text-[#C1443B] bg-[#FAF4ED] px-1.5 py-0.2 rounded border border-[#E8DCCB]">
                                  {msg.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-ink leading-relaxed font-sans whitespace-pre-line">
                              {msg.text}
                            </p>
                            {msg.action && (
                              <button
                                onClick={() => navigate(msg.action!.url)}
                                className="mt-1 w-full py-1 px-2 rounded-lg bg-[#FAF4ED] hover:bg-[#F2ECE0] text-[#C1443B] text-[10px] font-heading font-bold border border-[#E8DCCB] transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <span>{msg.action.label}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="max-w-[85%] bg-[#C1443B] text-white rounded-2xl rounded-tr-xs p-2.5 shadow-xs text-left">
                            <p className="text-[11px] font-sans font-medium leading-relaxed whitespace-pre-line">
                              {msg.text}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* AI Typing Indicator */}
                    {isAiTyping && (
                      <div className="flex items-center gap-1 p-2 bg-white rounded-xl border border-[#E5DFD5] w-14">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-pulse delay-100" />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C1443B] animate-pulse delay-200" />
                      </div>
                    )}
                  </div>

                  {/* Interactive Quick Chip Prompts (Destination-first, matching platform AI Concierge) */}
                  <div className="pt-2 pb-1.5 border-t border-[#E8E1D5] space-y-1">
                    <div className="text-[9px] font-heading font-bold uppercase tracking-wider text-dusk-500 text-left">
                      SELECT DESTINATION / PROMPT:
                    </div>
                    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none">
                      <button
                        onClick={() => handleSendChat('Jaipur')}
                        className="whitespace-nowrap px-2 py-1 rounded-md bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[10px] font-heading font-bold text-ink transition cursor-pointer"
                      >
                        🏰 Jaipur
                      </button>
                      <button
                        onClick={() => handleSendChat('Varanasi')}
                        className="whitespace-nowrap px-2 py-1 rounded-md bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[10px] font-heading font-bold text-ink transition cursor-pointer"
                      >
                        🕉️ Varanasi
                      </button>
                      <button
                        onClick={() => handleSendChat('Goa')}
                        className="whitespace-nowrap px-2 py-1 rounded-md bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[10px] font-heading font-bold text-ink transition cursor-pointer"
                      >
                        🌴 Goa
                      </button>
                      <button
                        onClick={() => handleSendChat('Udaipur')}
                        className="whitespace-nowrap px-2 py-1 rounded-md bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[10px] font-heading font-bold text-ink transition cursor-pointer"
                      >
                        ⛵ Udaipur
                      </button>
                      <button
                        onClick={() => handleSendChat('Street Food & Aarti')}
                        className="whitespace-nowrap px-2 py-1 rounded-md bg-white hover:bg-[#FAF4ED] border border-[#DDD7CC] text-[10px] font-heading font-bold text-ink transition cursor-pointer"
                      >
                        ☕ Food & Aarti
                      </button>
                    </div>
                  </div>

                  {/* Chat Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat(chatInputText);
                    }}
                    className="flex items-center gap-1.5 pt-1"
                  >
                    <input
                      type="text"
                      value={chatInputText}
                      onChange={(e) => setChatInputText(e.target.value)}
                      placeholder="Ask Lokiva Concierge..."
                      className="flex-1 bg-white border border-[#DDD7CC] rounded-xl px-2.5 py-1.5 text-xs text-ink placeholder:text-dusk-400 focus:outline-none focus:border-[#C1443B] font-sans"
                    />
                    <button
                      type="submit"
                      disabled={!chatInputText.trim() || isAiTyping}
                      className="w-7 h-7 rounded-xl bg-[#C1443B] hover:bg-[#A8372F] disabled:opacity-40 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              ) : (
                /* VIEW B: TOP DESTINATIONS FEED */
                <div className="p-3 space-y-2.5 overflow-y-auto">
                  {/* Destination 1 */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD5] space-y-1.5 shadow-xs text-left">
                    <div className="flex gap-2 items-center">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Raja_Ghat%2C_Varanasi.JPG/250px-Raja_Ghat%2C_Varanasi.JPG"
                        alt="Raja Ghat"
                        className="w-14 h-12 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="text-[9px] font-heading font-bold text-[#C1443B]">VARANASI, UP</div>
                        <h6 className="font-heading font-bold text-ink text-[11px] leading-snug">Raja Ghat Stone Terraces</h6>
                        <p className="text-[10px] text-dusk-600 font-sans">Free Entry · Classical Sitar</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/explore?search=Ghat')}
                      className="w-full py-1.5 rounded-lg bg-[#FAF4ED] text-[#C1443B] text-[11px] font-heading font-bold hover:bg-[#F2ECE0] transition border border-[#E8DCCB] cursor-pointer"
                    >
                      Explore Ghats
                    </button>
                  </div>

                  {/* Destination 2 */}
                  <div className="p-2.5 rounded-xl bg-white border border-[#E5DFD5] space-y-1.5 shadow-xs text-left">
                    <div className="flex gap-2 items-center">
                      <img
                        src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80"
                        alt="Taj Mahal"
                        className="w-14 h-12 rounded-lg object-cover border border-[#DDD7CC] shrink-0"
                      />
                      <div className="space-y-0.5">
                        <div className="text-[9px] font-heading font-bold text-[#C1443B]">AGRA, UP</div>
                        <h6 className="font-heading font-bold text-ink text-[11px] leading-snug">Taj Mahal Heritage Walk</h6>
                        <p className="text-[10px] text-dusk-600 font-sans">₹50 Entry · UNESCO World Heritage</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/explore?city=Agra')}
                      className="w-full py-1.5 rounded-lg bg-[#FAF4ED] text-[#C1443B] text-[11px] font-heading font-bold hover:bg-[#F2ECE0] transition border border-[#E8DCCB] cursor-pointer"
                    >
                      Explore Agra
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Passive Home Indicator Bar */}
            <div className="py-1.5 flex justify-center bg-white border-t border-[#E5DFD5]">
              <div className="w-20 h-1 bg-ink/30 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
