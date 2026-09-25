import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  MapPin,
  ChevronUp,
} from 'lucide-react';
import { IndiaVectorMap } from '../components/discovery/IndiaVectorMap';
import { StateBottomDrawer } from '../components/discovery/StateBottomDrawer';
import {
  DiscoveryOnboardingFlow,
  DiscoveryAnswers,
} from '../components/onboarding/DiscoveryOnboardingFlow';
import { getStateDossier } from '../data/stateDossiersData';
import { getStateForCity } from '../data/places';

// Map destination city/slug to Indian state name for the map
const CITY_TO_STATE: Record<string, string> = {
  jaipur: 'Rajasthan',
  jodhpur: 'Rajasthan',
  udaipur: 'Rajasthan',
  jaisalmer: 'Rajasthan',
  varanasi: 'Uttar Pradesh',
  agra: 'Uttar Pradesh',
  lucknow: 'Uttar Pradesh',
  delhi: 'Delhi',
  mumbai: 'Maharashtra',
  pune: 'Maharashtra',
  kochi: 'Kerala',
  alleppey: 'Kerala',
  munnar: 'Kerala',
  amritsar: 'Punjab',
  bengaluru: 'Karnataka',
  hampi: 'Karnataka',
  mysuru: 'Karnataka',
  chennai: 'Tamil Nadu',
  madurai: 'Tamil Nadu',
  kolkata: 'West Bengal',
  darjeeling: 'West Bengal',
  panaji: 'Goa',
  shimla: 'Himachal Pradesh',
  manali: 'Himachal Pradesh',
  srinagar: 'Jammu and Kashmir',
  leh: 'Ladakh',
  bhubaneswar: 'Odisha',
  puri: 'Odisha',
  guwahati: 'Assam',
  hyderabad: 'Telangana',
};

export function DiscoveryMapPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const routerState = (location.state as { solvedAnswers?: { city?: string } } | null) ?? {};

  // Initialize selected state from URL search params, router state, or default to Rajasthan
  const [selectedState, setSelectedState] = useState<string>(() => {
    const urlState = searchParams.get('state');
    if (urlState) return urlState;

    const urlCity = searchParams.get('city');
    if (urlCity && CITY_TO_STATE[urlCity.toLowerCase()]) {
      return CITY_TO_STATE[urlCity.toLowerCase()];
    }

    if (routerState.solvedAnswers?.city) {
      const mapped = CITY_TO_STATE[routerState.solvedAnswers.city.toLowerCase()];
      if (mapped) return mapped;
    }

    return 'Rajasthan';
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isGuidedFlowOpen, setIsGuidedFlowOpen] = useState<boolean>(() => {
    return searchParams.get('onboard') === 'true';
  });

  // Sync selected state to URL query parameter cleanly without reload
  useEffect(() => {
    const currentParam = searchParams.get('state');
    if (currentParam !== selectedState) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('state', selectedState);
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedState, searchParams, setSearchParams]);

  const handleStateSelect = (stateName: string) => {
    setSelectedState(stateName);
    setIsDrawerOpen(true);
  };

  const handleLaunchItinerary = (stateName: string) => {
    navigate(
      `/itinerary?city=${encodeURIComponent(stateName)}&days=4&pace=balanced`
    );
  };

  const handleDiscoveryFlowComplete = (answers: DiscoveryAnswers) => {
    setIsGuidedFlowOpen(false);
    if (answers.destination && answers.destination !== 'Smart Match') {
      const mappedState = getStateForCity(answers.destination);
      if (mappedState && mappedState !== 'India') {
        setSelectedState(mappedState);
        setIsDrawerOpen(true);
        return;
      }
    }
    setSelectedState('Rajasthan');
    setIsDrawerOpen(true);
  };

  const currentDossier = getStateDossier(selectedState);

  return (
    <div className="w-full h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] relative overflow-hidden bg-[#FAF7F2] select-none flex flex-col">
      {/* ── Top Floating Minimal Header ───────────────────────────────── */}
      <header className="absolute top-0 inset-x-0 h-14 px-4 sm:px-6 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 p-1.5 px-3 rounded-2xl bg-white/90 backdrop-blur-md border border-[#E5DFD5] shadow-xs pointer-events-auto">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-mono font-bold text-dusk-600 hover:text-[#C85A32] transition-colors"
            title="Return to Home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <span className="text-[#D5CAB8] hidden sm:inline">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C85A32]" />
            <h1 className="text-xs sm:text-sm font-heading font-extrabold uppercase tracking-wider text-[#12213B]">
              Living Discovery Canvas
            </h1>
          </div>
        </div>

        {/* Guided Flow Trigger */}
        <button
          type="button"
          onClick={() => setIsGuidedFlowOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/95 hover:bg-white text-[#C85A32] border border-[#E5DFD5] text-xs font-heading font-extrabold shadow-sm transition-all pointer-events-auto cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D99B43]" />
          <span className="hidden sm:inline">Guided Match</span>
          <span className="sm:hidden">Match</span>
        </button>
      </header>

      {/* ── Full-Width Vibrant Vector Map ──────────────────────────────── */}
      <main className="w-full h-full relative overflow-hidden" aria-label="Interactive Map of India">
        <IndiaVectorMap
          selectedState={selectedState}
          onSelectState={handleStateSelect}
          className="w-full h-full"
        />

        {/* Floating Mini Re-open Pill when Drawer is Collapsed */}
        <AnimatePresence>
          {!isDrawerOpen && currentDossier && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20"
            >
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 bg-white/95 backdrop-blur-md border border-[#E5DFD5] hover:border-[#C85A32] rounded-2xl shadow-lg text-[#12213B] hover:text-[#C85A32] transition-all cursor-pointer group"
                title="Open state cultural dossier"
              >
                <div className="w-6 h-6 rounded-full bg-[#C85A32] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block leading-tight">
                    Selected State
                  </span>
                  <span className="text-xs font-heading font-extrabold text-[#12213B] group-hover:text-[#C85A32]">
                    {currentDossier.name} (View Dossier)
                  </span>
                </div>
                <ChevronUp className="w-4 h-4 text-dusk-600 group-hover:text-[#C85A32] transition-colors" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Collapsible Slide-Up Cultural Dossier Drawer ───────────────── */}
        <StateBottomDrawer
          stateData={currentDossier}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onLaunchItinerary={handleLaunchItinerary}
        />
      </main>

      {/* ── Optional Fullscreen Guided Onboarding Modal ─────────────────── */}
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
