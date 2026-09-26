import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Heart,
  ArrowRight,
  Compass,
  ChevronRight,
  Zap,
  Bot,
  Thermometer,
  Building2,
  Check,
  Star,
  ExternalLink,
  ChevronDown,
  Info,
  Award,
  Share2,
} from 'lucide-react';
import { getStateOverview, StateOverview, SeasonTimelineItem } from '../data/stateOverviewData';

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'culture', label: 'Culture' },
  { id: 'festivals', label: 'Festivals' },
  { id: 'food', label: 'Food' },
  { id: 'places', label: 'Places' },
  { id: 'experiences', label: 'Experiences' },
  { id: 'best-time', label: 'Best Time' },
];

export function StateOverviewPage() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const navigate = useNavigate();

  const stateData: StateOverview | null = getStateOverview(stateSlug || '');

  // Active section tracker for sticky navigation
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedSeason, setSelectedSeason] = useState<string>('Winter');
  const [selectedQuickHours, setSelectedQuickHours] = useState<number>(3);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [activeCultureCategory, setActiveCultureCategory] = useState<string>('All');

  // Check saved state from localStorage
  useEffect(() => {
    if (!stateData) return;
    try {
      const saved = JSON.parse(localStorage.getItem('lokiva_saved_states') || '[]');
      setIsSaved(saved.includes(stateData.id));
    } catch {
      setIsSaved(false);
    }
  }, [stateData]);

  // Set default selected season when state loads
  useEffect(() => {
    if (stateData?.seasons && stateData.seasons.length > 0) {
      const rec = stateData.seasons.find((s) => s.isRecommended);
      setSelectedSeason(rec ? rec.season : stateData.seasons[0].season);
    }
  }, [stateData]);

  // Handle active navigation spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200;
      for (const sec of NAV_SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(sec.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSave = () => {
    if (!stateData) return;
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('lokiva_saved_states') || '[]');
      let updated: string[];
      if (saved.includes(stateData.id)) {
        updated = saved.filter((id) => id !== stateData.id);
        setIsSaved(false);
        setSaveToast(`Removed ${stateData.name} from saved`);
      } else {
        updated = [...saved, stateData.id];
        setIsSaved(true);
        setSaveToast(`Saved ${stateData.name} to your wishlist`);
      }
      localStorage.setItem('lokiva_saved_states', JSON.stringify(updated));
      setTimeout(() => setSaveToast(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleLaunchQuickEscape = () => {
    if (!stateData) return;
    const hours = selectedQuickHours === 24 ? 5 : selectedQuickHours;
    navigate(
      `/?quickEscapeLocation=${encodeURIComponent(stateData.quickEscapeCity)}&quickEscapeHours=${hours}#quick-escape`
    );
  };

  const handleAskAi = (promptText?: string) => {
    const query = promptText || (stateData ? `Plan a tailored trip to ${stateData.name}` : '');
    navigate(`/ai-guide?prompt=${encodeURIComponent(query)}`);
  };

  if (!stateData) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-display font-extrabold text-[#12213B] mb-3">
          State Not Found
        </h1>
        <p className="text-slate-600 mb-6 max-w-md">
          We could not find the destination overview for &quot;{stateSlug}&quot;. Please return to our destinations showcase.
        </p>
        <Link
          to="/destinations"
          className="px-6 py-3 rounded-full bg-[#C1443B] text-white font-heading font-bold text-sm tracking-wider uppercase shadow-md hover:bg-[#A8362E] transition"
        >
          Return to Destinations
        </Link>
      </div>
    );
  }

  const cultureCategories = ['All', ...Array.from(new Set(stateData.culture.map((c) => c.category)))];
  const filteredCulture =
    activeCultureCategory === 'All'
      ? stateData.culture
      : stateData.culture.filter((c) => c.category === activeCultureCategory);

  const activeSeasonData: SeasonTimelineItem | undefined =
    stateData.seasons.find((s) => s.season === selectedSeason) || stateData.seasons[0];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#12213B] selection:bg-[#FFC067] selection:text-[#12213B]">
      {/* Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#12213B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/15 flex items-center gap-3 backdrop-blur-md font-sans text-sm"
          >
            <div className="w-7 h-7 rounded-full bg-[#C1443B]/20 border border-[#C1443B]/40 flex items-center justify-center text-[#FFC067]">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>{saveToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════════
          1. CINEMATIC STATE HERO
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full h-[92vh] sm:h-screen min-h-[640px] flex items-center justify-center overflow-hidden bg-[#0A111F]">
        {/* Cinematic Media Background */}
        <div className="absolute inset-0 z-0">
          {stateData.heroVideo ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              poster={stateData.heroImage}
              className="w-full h-full object-cover scale-[1.03]"
            >
              <source src={stateData.heroVideo} type="video/mp4" />
            </video>
          ) : (
            <img
              src={stateData.heroImage}
              alt={stateData.name}
              className="w-full h-full object-cover scale-[1.03]"
            />
          )}

          {/* Editorial dark layered gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] via-[#0A111F]/45 to-[#0A111F]/65" />
          <div className="absolute inset-0 bg-radial-[circle_at_center,_transparent_30%,_rgba(10,17,31,0.7)_100%]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center pt-16">
          {/* Breadcrumb pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-white/90 text-xs font-mono tracking-widest uppercase mb-6 shadow-sm">
            <Link to="/destinations" className="hover:text-[#FFC067] transition">
              Destinations
            </Link>
            <span className="text-white/40">/</span>
            <span className="text-[#FFC067] font-bold">{stateData.name}</span>
          </div>

          {/* STATE NAME (Monumental typography) */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-5xl sm:text-7xl lg:text-9xl font-display font-extrabold text-white tracking-tight uppercase leading-[0.95] drop-shadow-lg"
          >
            {stateData.name}
          </motion.h1>

          {/* Short Emotional Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: 'easeOut' }}
            className="mt-5 max-w-2xl text-lg sm:text-2xl font-serif italic text-white/95 font-medium leading-relaxed drop-shadow-md"
          >
            “{stateData.tagline}”
          </motion.p>

          {/* Buttons: [ Explore Places ] [ Build My Itinerary ] [ ♡ Save ] */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <button
              onClick={() => scrollToSection('places')}
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-[#C1443B] hover:bg-[#A8362E] text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition shadow-xl hover:shadow-[#C1443B]/30 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Explore Places</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to={`/itinerary?city=${encodeURIComponent(stateData.primaryCity)}`}
              className="px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition backdrop-blur-md shadow-lg hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>Build My Itinerary</span>
            </Link>

            <button
              onClick={handleToggleSave}
              className={`px-5 py-3 sm:py-3.5 rounded-full border transition backdrop-blur-md text-xs sm:text-sm font-heading font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-lg ${
                isSaved
                  ? 'bg-[#C1443B] border-[#C1443B] text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-[#FFC067]'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </motion.div>

          {/* Discover State Cue */}
          <button
            onClick={() => scrollToSection('overview')}
            className="mt-12 sm:mt-14 inline-flex items-center gap-2 text-white/80 hover:text-[#FFC067] text-xs font-mono tracking-widest uppercase transition group cursor-pointer"
          >
            <span>Discover {stateData.name}</span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          STICKY SECTION NAVIGATION
      ═══════════════════════════════════════════════════════════════════════ */}
      <nav className="sticky top-16 sm:top-20 z-30 w-full bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DFD5] shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-start sm:justify-center gap-1 sm:gap-2 overflow-x-auto py-2.5 scrollbar-none">
            {NAV_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#12213B] text-white shadow-xs'
                      : 'text-[#12213B]/70 hover:text-[#12213B] hover:bg-[#EAE4DC]'
                  }`}
                >
                  {sec.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. STATE SNAPSHOT STRIP
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative z-10 -mt-2 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-[#12213B] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FFC067]/10 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {/* Region */}
            <div className="flex flex-col space-y-1 pt-3 md:pt-0">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC067] flex items-center gap-1.5">
                <span>📍</span> Region
              </span>
              <span className="text-sm sm:text-base font-heading font-bold text-white">
                {stateData.snapshot.region}
              </span>
            </div>

            {/* Capital */}
            <div className="flex flex-col space-y-1 pt-3 md:pt-0 md:pl-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC067] flex items-center gap-1.5">
                <span>🏛️</span> Capital
              </span>
              <span className="text-sm sm:text-base font-heading font-bold text-white">
                {stateData.snapshot.capital}
              </span>
            </div>

            {/* Best Time */}
            <div className="flex flex-col space-y-1 pt-3 md:pt-0 md:pl-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC067] flex items-center gap-1.5">
                <span>🌤️</span> Best Time
              </span>
              <span className="text-sm sm:text-base font-heading font-bold text-white">
                {stateData.snapshot.bestTime}
              </span>
            </div>

            {/* Recommended Duration */}
            <div className="flex flex-col space-y-1 pt-3 md:pt-0 md:pl-5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC067] flex items-center gap-1.5">
                <span>⏱️</span> Duration
              </span>
              <span className="text-sm sm:text-base font-heading font-bold text-white">
                {stateData.snapshot.duration}
              </span>
            </div>

            {/* Best For */}
            <div className="flex flex-col space-y-1 pt-3 md:pt-0 md:pl-5 col-span-2 md:col-span-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC067] flex items-center gap-1.5">
                <span>✨</span> Best For
              </span>
              <span className="text-xs sm:text-sm font-sans text-white/90 font-medium">
                {stateData.snapshot.bestFor.join(' · ')}
              </span>
            </div>

            {/* Climate */}
            <div className="flex flex-col space-y-1 pt-3 md:pt-0 md:pl-5 col-span-2 md:col-span-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#FFC067] flex items-center gap-1.5">
                <span>🌡️</span> Climate
              </span>
              <span className="text-xs font-sans text-white/80 line-clamp-2 leading-relaxed">
                {stateData.snapshot.climate}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. WHY VISIT THIS STATE?
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="overview" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
            Curated Perspective
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight">
            Why Visit {stateData.name}?
          </h2>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-sans">
            {stateData.introduction.description}
          </p>
        </div>

        {/* 3-4 Visual Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stateData.whyVisitHighlights.map((hl, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl overflow-hidden bg-white border border-[#E5DFD5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={hl.image}
                  alt={hl.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-[11px] font-mono font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                  {hl.tag}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#12213B] mb-2 group-hover:text-[#C1443B] transition-colors">
                    {hl.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {hl.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          4. CULTURE & TRADITIONS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="culture" className="bg-[#EFEAE2] py-16 sm:py-24 border-y border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
                Living Heritage
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#12213B] tracking-tight mt-1">
                Culture That Lives Here
              </h2>
            </div>

            {/* Category filter tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
              {cultureCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCultureCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-heading font-semibold transition cursor-pointer whitespace-nowrap ${
                    activeCultureCategory === cat
                      ? 'bg-[#C1443B] text-white shadow-xs'
                      : 'bg-white/80 text-[#12213B]/70 hover:bg-white hover:text-[#12213B]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cultural Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCulture.map((item) => (
              <div
                key={item.id}
                className="group rounded-3xl overflow-hidden bg-white border border-[#E0D7CC] shadow-xs hover:shadow-lg transition-all duration-300"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12213B]/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[11px] font-mono font-bold text-white bg-[#12213B]/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                    {item.category}
                  </span>
                  <h3 className="absolute bottom-3 left-3 right-3 text-base sm:text-lg font-heading font-bold text-white leading-snug drop-shadow-xs">
                    {item.title}
                  </h3>
                </div>
                <div className="p-5">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          5. FESTIVALS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="festivals" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
            Sacred Celebrations & Pageantry
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight">
            Experience the Festivals
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-sans">
            Witness the state come alive through music, devotion, and centuries-old ceremonial gatherings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stateData.festivals.map((fest) => (
            <div
              key={fest.id}
              className="group rounded-3xl overflow-hidden bg-white border border-[#E5DFD5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={fest.image}
                  alt={fest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-[#FFC067] bg-black/60 px-2.5 py-1 rounded-md border border-white/15">
                  {fest.highlightTag}
                </span>
                <div className="absolute bottom-3 left-3 text-white text-xs font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FFC067]" />
                  <span>{fest.monthSeason}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-heading font-bold text-[#12213B] mb-2 group-hover:text-[#C1443B] transition-colors">
                    {fest.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                    {fest.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          6. LOCAL FOOD (Taste the State)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="food" className="bg-[#12213B] text-white py-16 sm:py-24 border-y border-black/20 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full bg-[#C1443B]/10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FFC067] font-bold">
              Culinary Tapestry
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
              Taste the State
            </h2>
            <p className="text-sm sm:text-base text-white/80 font-sans">
              Distinct culinary traditions honed over royal banquets, coastal fishermen hearths, and desert caravans.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stateData.foods.map((food) => (
              <div
                key={food.id}
                className="group rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#FFC067]/50 transition-all duration-300 backdrop-blur-md flex flex-col"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12213B] to-transparent opacity-80" />
                  {food.badge && (
                    <span className="absolute top-3 left-3 text-[10px] font-heading font-bold uppercase tracking-wider text-black bg-[#FFC067] px-2.5 py-1 rounded-md shadow-xs">
                      {food.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 text-[11px] font-mono text-white/90 bg-white/15 px-2.5 py-0.5 rounded-md border border-white/20">
                    {food.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-heading font-bold text-white mb-2 group-hover:text-[#FFC067] transition-colors">
                      {food.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-white/75 leading-relaxed font-sans">
                      {food.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          7. PLACES YOU SHOULDN'T MISS
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="places" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
              Must-Visit Landmarks
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight mt-1">
              Places Worth the Journey
            </h2>
          </div>
          <Link
            to={`/explore?state=${encodeURIComponent(stateData.name)}`}
            className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#C1443B] hover:text-[#A8362E] transition"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stateData.places.map((place) => (
            <div
              key={place.id}
              className="group rounded-3xl overflow-hidden bg-white border border-[#E5DFD5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
                    <Star className="w-3 h-3 text-[#FFC067] fill-[#FFC067]" />
                    <span>{place.rating}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 text-white text-xs font-mono flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#FFC067]" />
                    <span>{place.location}</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base sm:text-lg font-heading font-bold text-[#12213B] group-hover:text-[#C1443B] transition-colors leading-snug">
                    {place.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans line-clamp-3">
                    {place.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {place.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono bg-[#FAF7F2] text-[#12213B]/80 px-2 py-0.5 rounded border border-[#E5DFD5]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/explore?query=${encodeURIComponent(place.name)}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#C1443B] hover:text-white text-[#12213B] font-heading font-bold text-xs uppercase tracking-wider transition border border-[#E5DFD5] hover:border-transparent cursor-pointer"
                >
                  <span>Explore Place</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          8. BEST TIME TO VISIT (Interactive Seasonal Timeline)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="best-time" className="bg-[#FAF7F2] py-16 sm:py-24 border-t border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
              Seasonal Guide
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight">
              Best Time to Visit
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-sans">
              Select a season to discover weather patterns, curated experiences, and festival schedules.
            </p>
          </div>

          {/* Interactive Season Chips */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap mb-10">
            {stateData.seasons.map((s) => {
              const isSelected = selectedSeason === s.season;
              return (
                <button
                  key={s.season}
                  onClick={() => setSelectedSeason(s.season)}
                  className={`px-4 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#12213B] text-white shadow-md scale-105'
                      : 'bg-white text-slate-700 hover:bg-[#EAE4DC] border border-[#E5DFD5]'
                  }`}
                >
                  <span>{s.season}</span>
                  {s.isRecommended && (
                    <span className="text-[10px] bg-[#FFC067] text-black px-1.5 py-0.5 rounded font-mono font-bold">
                      Best
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Season Details Card */}
          {activeSeasonData && (
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E5DFD5] shadow-lg max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E5DFD5] gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase text-[#C1443B] font-bold">
                      {activeSeasonData.months}
                    </span>
                    {activeSeasonData.isRecommended && (
                      <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Recommended Season
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B]">
                    {activeSeasonData.season} Season
                  </h3>
                </div>

                <div className="flex items-center gap-2 bg-[#FAF7F2] border border-[#E5DFD5] px-4 py-2 rounded-2xl">
                  <Thermometer className="w-5 h-5 text-[#C1443B]" />
                  <span className="text-base font-mono font-bold text-[#12213B]">
                    {activeSeasonData.temperature}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1.5">
                    Weather Overview
                  </h4>
                  <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans">
                    {activeSeasonData.weather}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#C1443B] font-bold">
                      Recommended Experiences
                    </h4>
                    <ul className="space-y-2">
                      {activeSeasonData.experiences.map((exp, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#C1443B] font-bold">
                      Seasonal Festivals & Events
                    </h4>
                    <ul className="space-y-2">
                      {activeSeasonData.festivals.map((fest, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                          <Sparkles className="w-4 h-4 text-[#FFC067] shrink-0 mt-0.5" />
                          <span>{fest}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          9. WHO IS THIS STATE FOR?
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#EFEAE2] py-16 sm:py-24 border-y border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
              Travel Personality Match
            </span>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight">
              Who Is This State For?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-sans">
              Discover how {stateData.name} aligns with your travel style and passions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stateData.travelPersonalities.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl p-5 sm:p-6 transition-all border flex flex-col justify-between ${
                  item.isTopMatch
                    ? 'bg-white border-[#C1443B]/30 shadow-md ring-2 ring-[#C1443B]/10'
                    : 'bg-white/60 border-[#E5DFD5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{item.emoji}</span>
                    {item.isTopMatch && (
                      <span className="text-[10px] font-mono font-bold bg-[#C1443B] text-white px-2 py-0.5 rounded-full">
                        Top Match
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-[#12213B] mb-1.5">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          10. LOCAL EXPERIENCES (“Don't Just Visit. Experience.”)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section id="experiences" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C1443B] font-bold">
            Immersive Journeys
          </span>
          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-[#12213B] tracking-tight">
            Don&apos;t Just Visit. Experience.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-sans">
            Beyond standard sightseeing—participate in generational masterclasses, desert camps, and sacred rituals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {stateData.localExperiences.map((exp) => (
            <div
              key={exp.id}
              className="group rounded-3xl overflow-hidden bg-white border border-[#E5DFD5] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
            >
              <div className="relative sm:w-2/5 h-56 sm:h-auto overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                <span className="absolute top-3 left-3 text-2xl">{exp.icon}</span>
              </div>

              <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#C1443B] bg-[#FFF2ED] px-2 py-0.5 rounded">
                      {exp.tag}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{exp.duration}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-heading font-bold text-[#12213B] group-hover:text-[#C1443B] transition-colors leading-snug">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-slate-600 italic mt-0.5">
                    {exp.subtitle}
                  </p>

                  <ul className="mt-3 space-y-1.5">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                        <Sparkles className="w-3 h-3 text-[#FFC067] shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleAskAi(`Tell me how to experience: ${exp.title} in ${stateData.name}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-heading font-bold uppercase tracking-wider text-[#C1443B] hover:text-[#A8362E] transition self-start cursor-pointer"
                >
                  <span>Ask Concierge About This</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          11. CONNECT WITH QUICK ESCAPE
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[#12213B] via-[#1B3258] to-[#12213B] text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Glow circles */}
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#FFC067]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#C1443B]/20 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[#FFC067] font-mono text-xs font-bold uppercase tracking-widest mb-4">
            <Zap className="w-3.5 h-3.5 fill-[#FFC067]" />
            <span>Time-Constrained Discovery</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
            Only Have a Few Hours?
          </h2>
          <p className="mt-3 text-base sm:text-lg text-white/80 max-w-xl mx-auto font-sans">
            LOKIVA can build an authentic, feasible experience around the exact time you have in {stateData.name}.
          </p>

          {/* Time Options: [ 1 Hour ] [ 3 Hours ] [ 6 Hours ] [ 1 Day ] */}
          <div className="mt-8 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
            {[
              { label: '1 Hour', hours: 1 },
              { label: '3 Hours', hours: 3 },
              { label: '6 Hours', hours: 5 },
              { label: '1 Day', hours: 24 },
            ].map((option) => (
              <button
                key={option.label}
                onClick={() => setSelectedQuickHours(option.hours)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold uppercase tracking-wider transition cursor-pointer ${
                  selectedQuickHours === option.hours
                    ? 'bg-[#FFC067] text-black shadow-lg scale-105'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* CTA: ⚡ PLAN MY QUICK ESCAPE */}
          <div className="mt-8">
            <button
              onClick={handleLaunchQuickEscape}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#C1443B] hover:bg-[#A8362E] text-white font-heading font-bold text-sm tracking-wider uppercase transition shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>PLAN MY QUICK ESCAPE IN {stateData.name.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          12. AI CONCIERGE (“Not Sure What to Explore? Ask LOKIVA”)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-10 border border-[#E5DFD5] shadow-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#C1443B]">
              <Bot className="w-4 h-4 text-[#C1443B]" />
              <span>Intelligent Travel Assistance</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-[#12213B] tracking-tight">
              Not Sure What to Explore? Ask LOKIVA
            </h2>
            <p className="text-sm text-slate-600 font-sans leading-relaxed">
              Our AI Concierge synthesizes regional knowledge, weather reports, and crowd patterns to design your custom {stateData.name} adventure.
            </p>

            {/* Suggested prompts chips */}
            <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
              {stateData.suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAi(prompt)}
                  className="text-xs font-heading font-medium bg-white hover:bg-[#FAF0E6] text-slate-800 px-3.5 py-1.5 rounded-full border border-[#E5DFD5] hover:border-[#C1443B] transition cursor-pointer text-left shadow-2xs"
                >
                  “{prompt}”
                </button>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => handleAskAi()}
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[#12213B] hover:bg-[#1E3256] text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFC067]" />
              <span>Ask LOKIVA AI</span>
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════════
          13. FINAL TRAVEL CTA
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="relative w-full py-20 sm:py-28 overflow-hidden bg-[#0A111F] text-white">
        {/* Background photo with overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src={stateData.heroImage}
            alt={stateData.name}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A111F] via-[#0A111F]/70 to-[#0A111F]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-mono uppercase tracking-widest text-[#FFC067] font-bold">
            Begin Your Story
          </span>
          <h2 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            Your Journey Starts Here.
          </h2>
          <p className="text-base sm:text-xl font-serif italic text-white/90 max-w-2xl mx-auto leading-relaxed">
            “{stateData.finalCtaMessage}”
          </p>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('places')}
              className="px-7 py-3.5 rounded-full bg-[#C1443B] hover:bg-[#A8362E] text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
            >
              Explore Places
            </button>

            <Link
              to={`/itinerary?city=${encodeURIComponent(stateData.primaryCity)}`}
              className="px-7 py-3.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 text-white font-heading font-bold text-xs sm:text-sm tracking-wider uppercase transition backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
            >
              Build My Itinerary
            </Link>

            <button
              onClick={handleToggleSave}
              className={`px-6 py-3.5 rounded-full border transition backdrop-blur-md text-xs sm:text-sm font-heading font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-lg ${
                isSaved
                  ? 'bg-[#C1443B] border-[#C1443B] text-white'
                  : 'bg-white/10 hover:bg-white/20 border-white/25 text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white text-white' : 'text-[#FFC067]'}`} />
              <span>{isSaved ? 'Saved' : 'Save State'}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
export default StateOverviewPage;
