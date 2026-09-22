import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

export function DiscoveryMapPage() {
  const [searchParams] = useSearchParams();
  const [preferences, setPreferences] = useState<UserJourneyPreferences>(() => {
    try {
      const saved = localStorage.getItem('lokiva_discovery_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_JOURNEY_PREFERENCES;
    } catch {
      return DEFAULT_JOURNEY_PREFERENCES;
    }
  });

  const [selectedState, setSelectedState] = useState<string>('Rajasthan');
  const [isProfilerOpen, setIsProfilerOpen] = useState<boolean>(false);
  const [isGuidedFlowOpen, setIsGuidedFlowOpen] = useState<boolean>(() => {
    return searchParams.get('onboard') === 'true';
  });

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

        {/* Phase 3: Synchronized Destination Output & Circuit Drawer */}
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
