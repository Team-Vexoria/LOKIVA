import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Compass,
  Sparkles,
  Sliders,
  RotateCcw,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  Landmark,
  Scissors,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';
import { InteractiveIndiaMap } from '../components/map/InteractiveIndiaMap';
import { CuratedJourneyProfiler } from '../components/discovery/CuratedJourneyProfiler';
import { RecommendedCircuitDrawer } from '../components/discovery/RecommendedCircuitDrawer';
import {
  DiscoveryOnboardingFlow,
  DiscoveryAnswers,
} from '../components/onboarding/DiscoveryOnboardingFlow';
import {
  DEFAULT_JOURNEY_PREFERENCES,
  UserJourneyPreferences,
  getStateMetadata,
  calculateStateMatchScore,
  INDIA_STATES_METADATA,
} from '../data/indiaStateMetadata';
import { DayPlanResponse } from '../types';
import { TripContextAnswers } from '../components/onboarding/TripOnboardingTakeover';

// Map destination city to Indian state name for the map
const CITY_TO_STATE: Record<string, string> = {
  jaipur: 'Rajasthan',
  udaipur: 'Rajasthan',
  varanasi: 'Uttar Pradesh',
  delhi: 'Delhi',
  mumbai: 'Maharashtra',
  kochi: 'Kerala',
  amritsar: 'Punjab',
};

export function DiscoveryMapPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const routerState = (location.state as { solvedPlan?: DayPlanResponse; solvedAnswers?: TripContextAnswers } | null) ?? {};

  const [preferences, setPreferences] = useState<UserJourneyPreferences>(() => {
    try {
      const saved = localStorage.getItem('lokiva_discovery_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_JOURNEY_PREFERENCES;
    } catch {
      return DEFAULT_JOURNEY_PREFERENCES;
    }
  });

  const [selectedState, setSelectedState] = useState<string>(() => {
    if (routerState.solvedAnswers?.city) {
      const mapped = CITY_TO_STATE[routerState.solvedAnswers.city.toLowerCase()];
      if (mapped) return mapped;
    }
    return 'Rajasthan';
  });

  const [injectedPlan, setInjectedPlan] = useState<DayPlanResponse | null>(routerState.solvedPlan ?? null);

  const [isProfilerOpen, setIsProfilerOpen] = useState<boolean>(false);
  const [isGuidedFlowOpen, setIsGuidedFlowOpen] = useState<boolean>(() => {
    return searchParams.get('onboard') === 'true';
  });

  useEffect(() => {
    if (injectedPlan) {
      setTimeout(() => {
        const el = document.getElementById('circuit-drawer-section');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }, [injectedPlan]);

  const handleUpdatePreferences = (updated: UserJourneyPreferences) => {
    setPreferences(updated);
    try {
      localStorage.setItem('lokiva_discovery_preferences', JSON.stringify(updated));
    } catch {}
  };

  const handleDiscoveryFlowComplete = (answers: DiscoveryAnswers) => {
    const mapped: UserJourneyPreferences = {
      rhythm: answers.group_type === 'friends' ? 'cohort' : answers.group_type,
      durationTier: answers.days <= 3 ? 'weekend' : answers.days <= 7 ? 'circuit' : 'epic',
      pacing: answers.pace,
      vibe: answers.interests.includes('crafts')
        ? 'crafts'
        : answers.interests.includes('rituals')
        ? 'temples'
        : answers.interests.includes('monuments')
        ? 'frontiers'
        : 'palaces',
      budgetDailyInr: answers.budget_daily_inr,
    };

    handleUpdatePreferences(mapped);

    // Auto-select highest matching state based on new constraints
    const allStates = Object.keys(INDIA_STATES_METADATA);
    let bestState = selectedState;
    let highestScore = -1;
    allStates.forEach((st) => {
      const res = calculateStateMatchScore(st, mapped);
      if (res.score > highestScore) {
        highestScore = res.score;
        bestState = st;
      }
    });
    setSelectedState(bestState);
    setIsGuidedFlowOpen(false);

    // Smooth scroll down to map section
    const mapEl = document.getElementById('vector-map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProfilerComplete = () => {
    setIsProfilerOpen(false);
    // Smooth scroll down to map section
    const mapEl = document.getElementById('vector-map-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    // Smooth scroll down to circuit drawer section
    const drawerEl = document.getElementById('circuit-drawer-section');
    if (drawerEl) {
      drawerEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const activeMeta = getStateMetadata(selectedState);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#12213B] pb-24 pt-6 sm:pt-8 relative overflow-hidden">
      {/* Subtle radial warmth backdrop */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] bg-gradient-to-b from-[#D99B43]/10 via-[#FAF7F2]/40 to-transparent blur-3xl -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation & Editorial Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-dusk-600 hover:text-[#C85A32] transition-colors text-xs font-mono font-bold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Home</span>
              </Link>
              <span className="text-[#D5CAB8]">/</span>
              <span className="text-xs font-mono font-bold text-[#C85A32]">Discovery Journey</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-[#12213B] tracking-tight">
              Curated Discovery & Living Map
            </h1>

            <p className="text-xs sm:text-sm text-dusk-600 font-sans max-w-2xl leading-relaxed">
              Define your travel rhythm, pacing, and cultural affinity, then explore an animated vector map of India with synchronized micro-circuits.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => setIsGuidedFlowOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C85A32] hover:bg-[#B34D28] text-white rounded-2xl text-xs font-heading font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FFC067]" />
              <span>Launch Guided Discovery</span>
            </button>

            <button
              type="button"
              onClick={() => setIsProfilerOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#12213B] border border-[#E5DFD5] hover:border-[#C85A32] rounded-2xl text-xs font-heading font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>{isProfilerOpen ? 'Minimize Quick Profiler' : 'Quick Profiler'}</span>
              {isProfilerOpen ? <ChevronUp className="w-3.5 h-3.5 text-dusk" /> : <ChevronDown className="w-3.5 h-3.5 text-dusk" />}
            </button>
          </div>
        </div>

        {/* Phase 1: Curated Journey Profiler (Expandable) */}
        <AnimatePresence>
          {isProfilerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <CuratedJourneyProfiler
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onComplete={handleProfilerComplete}
                onSkip={() => setIsProfilerOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: Interactive Animated India Vector Map */}
        <div id="vector-map-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#12213B]">
                Interactive Pan-India Vector Map
              </h2>
            </div>
            <p className="text-xs text-dusk-600 font-sans">
              Tap any state boundary to view tailored micro-circuits and curated cultural guilds.
            </p>
          </div>

          <InteractiveIndiaMap
            userPreferences={preferences}
            selectedState={selectedState}
            onSelectState={handleStateSelect}
          />
        </div>

        {/* Phase 3: Curated Plan Results */}
        {injectedPlan && injectedPlan.stops && injectedPlan.stops.length > 0 && (() => {
          const CATEGORY_IMAGES: Record<string, string> = {
            heritage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80',
            crafts: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
            food: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&q=80',
            rituals: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=600&q=80',
            monuments: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&q=80',
            nature: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
            markets: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=600&q=80',
            arts: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80',
            offbeat: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80',
            wellness: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
          };
          const CATEGORY_LABEL: Record<string, string> = {
            heritage: 'Living Heritage',
            crafts: 'Artisan Guild',
            food: 'Gastronomy',
            rituals: 'Sacred Ritual',
            monuments: 'Ancient Monument',
            nature: 'Natural Enclave',
            markets: 'Cultural Market',
            arts: 'Performing Arts',
            offbeat: 'Hidden Gem',
            wellness: 'Wellness Sanctuary',
          };
          return (
            <motion.div
              id="circuit-drawer-section"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2 space-y-6"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-[#E5DFD5]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C85A32]" />
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Your Curated Day Plan
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight">
                    {injectedPlan.city} Micro-Circuit
                  </h2>
                  {injectedPlan.feasibility_summary && (
                    <p className="text-sm text-[#5B6B8C] font-sans max-w-2xl leading-relaxed">
                      {injectedPlan.feasibility_summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGuidedFlowOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] hover:bg-[#B34D28] text-white rounded-xl text-xs font-heading font-bold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Recalibrate
                  </button>
                  <button
                    type="button"
                    onClick={() => setInjectedPlan(null)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-heading font-bold text-[#5B6B8C] hover:text-[#C85A32] border border-[#E5DFD5] hover:border-[#C85A32] rounded-xl transition-colors cursor-pointer bg-white"
                  >
                    Browse Map
                  </button>
                </div>
              </div>

              {/* Rich Stop Cards */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {injectedPlan.stops.map((stop, idx) => {
                  const cat = (stop as any).match_notes ? (stop as any).category || 'heritage' : 'heritage';
                  const img = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.heritage;
                  const catLabel = CATEGORY_LABEL[cat] || 'Cultural Stop';
                  return (
                    <motion.div
                      key={stop.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 * idx, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative bg-white border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C85A32]/30 transition-all duration-300 flex flex-col"
                    >
                      {/* Image with overlay */}
                      <div className="relative h-40 w-full overflow-hidden">
                        <img
                          src={img}
                          alt={stop.name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12213B]/75 via-[#12213B]/20 to-transparent" />
                        {/* Order badge */}
                        <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-[#C85A32] text-white text-sm font-mono font-extrabold flex items-center justify-center shadow-lg">
                          {stop.order}
                        </div>
                        {/* Category pill */}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-heading font-bold">
                          {catLabel}
                        </div>
                        {/* Time on image */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#FFC067]" />
                          <span className="text-white text-xs font-mono font-bold">{stop.time}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-col flex-1 p-4 gap-2.5">
                        <h3 className="font-heading font-bold text-[#12213B] text-base leading-snug">
                          {stop.name}
                        </h3>

                        {/* Duration + Cost */}
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs font-sans text-[#5B6B8C]">
                            <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                            <span className="font-mono font-bold text-[#12213B]">{stop.duration_mins}</span> min
                          </span>
                          <span className="flex items-center gap-1.5 text-xs font-sans text-[#5B6B8C]">
                            <Coins className="w-3.5 h-3.5 text-[#D99B43]" />
                            <span className="font-mono font-semibold text-[#12213B]">{stop.cost_label}</span>
                          </span>
                        </div>

                        {/* Description / match notes */}
                        {(stop as any).match_notes && (
                          <p className="text-xs font-sans text-[#5B6B8C] leading-relaxed border-t border-[#F0EBE3] pt-2">
                            {(stop as any).match_notes}
                          </p>
                        )}

                        {/* Fit reason */}
                        {stop.fit_reason && (
                          <div className="mt-auto pt-2 border-t border-[#F0EBE3] flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#C85A32] flex-shrink-0 mt-0.5" />
                            <p className="text-xs font-sans text-[#5B6B8C] leading-relaxed">
                              {stop.fit_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}

        {/* Phase 4: Synchronized Destination Output and Circuit Drawer */}
        {!injectedPlan && (
          <div id="circuit-drawer-section" className="pt-2">
            <RecommendedCircuitDrawer
              selectedState={selectedState}
              userPreferences={preferences}
              onSelectState={handleStateSelect}
              onOpenProfiler={() => {
                setIsGuidedFlowOpen(true);
              }}
            />
          </div>
        )}
      </div>

      {/* 6-Step Guided Discovery Flow Modal */}
      {isGuidedFlowOpen && (
        <DiscoveryOnboardingFlow
          isOpen={isGuidedFlowOpen}
          onClose={() => setIsGuidedFlowOpen(false)}
          onComplete={handleDiscoveryFlowComplete}
        />
      )}
    </div>
  );
}

export default DiscoveryMapPage;
