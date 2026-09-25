import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Compass,
  MapPin,
  ChevronUp,
  X,
  Sliders,
} from 'lucide-react';
import { IndiaVectorMap } from '../components/discovery/IndiaVectorMap';
import { StateDossierSidebar } from '../components/discovery/StateDossierSidebar';
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

  const [isGuidedFlowOpen, setIsGuidedFlowOpen] = useState<boolean>(() => {
    return searchParams.get('onboard') === 'true';
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);

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
    // On mobile screens, open the drawer automatically on selection
    if (window.innerWidth < 1024) {
      setIsMobileDrawerOpen(true);
    }
  };

  const handleDiscoveryFlowComplete = (answers: DiscoveryAnswers) => {
    setIsGuidedFlowOpen(false);
    if (answers.destination && answers.destination !== 'Smart Match') {
      const mappedState = getStateForCity(answers.destination);
      if (mappedState && mappedState !== 'India') {
        setSelectedState(mappedState);
        return;
      }
    }
    // Fallback to cultural affinity default
    setSelectedState('Rajasthan');
  };

  const currentDossier = getStateDossier(selectedState);

  return (
    <div className="h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] w-full overflow-hidden bg-[#FAF7F2] flex flex-col relative select-none">
      {/* ── Main Two-Tier Discovery Split Canvas ─────────────────────────── */}
      <div className="flex-1 w-full h-full flex flex-col lg:flex-row overflow-hidden">
        {/* ── LEFT CANVAS (60% Width on Desktop): Interactive Vector Map ── */}
        <section
          aria-label="Interactive Pan-India Discovery Map"
          className="w-full lg:w-[60%] h-full relative border-b lg:border-b-0 lg:border-r border-[#E5DFD5] bg-[#F5EFE6] flex flex-col overflow-hidden"
        >
          {/* Top Canvas Header Bar */}
          <div className="h-14 px-4 sm:px-6 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E5DFD5] flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3">
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
                  Pan-India Cultural Discovery Canvas
                </h1>
              </div>
            </div>

            {/* Guided Flow Trigger */}
            <button
              type="button"
              onClick={() => setIsGuidedFlowOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5] text-xs font-heading font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D99B43]" />
              <span className="hidden sm:inline">Guided Match</span>
              <span className="sm:hidden">Match</span>
            </button>
          </div>

          {/* Interactive Vector Map Container */}
          <div className="flex-1 w-full relative overflow-hidden">
            <IndiaVectorMap
              selectedState={selectedState}
              onSelectState={handleStateSelect}
              className="w-full h-full"
            />
          </div>

          {/* Mobile Bottom Floating State Summary Pill (lg:hidden) */}
          <div className="lg:hidden absolute bottom-3 inset-x-3 z-20">
            <div className="p-3 bg-white/95 backdrop-blur-md border border-[#E5DFD5] rounded-2xl shadow-lg flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#C85A32] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                    Selected State
                  </span>
                  <h3 className="text-sm font-heading font-bold text-[#12213B] truncate">
                    {currentDossier.name}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#C85A32] hover:bg-[#B34E28] text-white text-xs font-heading font-bold shrink-0 transition-colors cursor-pointer shadow-xs"
              >
                View Dossier
              </button>
            </div>
          </div>
        </section>

        {/* ── RIGHT SIDEBAR (40% Width on Desktop): Cultural Dossier ──────── */}
        <section
          aria-label="State Cultural Dossier Panel"
          className="hidden lg:flex w-full lg:w-[40%] h-full overflow-hidden bg-[#FAF7F2] flex-col"
        >
          <div className="flex-1 overflow-y-auto p-6 lg:p-7">
            <StateDossierSidebar dossier={currentDossier} />
          </div>
        </section>
      </div>

      {/* ── Mobile Responsive Bottom Drawer (< lg) ───────────────────────── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-[#FAF7F2] p-5 border-t border-[#E5DFD5] shadow-2xl lg:hidden flex flex-col"
            >
              {/* Grab Handle */}
              <div className="w-12 h-1.5 rounded-full bg-[#D5CAB8] mx-auto mb-3 shrink-0" />
              <StateDossierSidebar
                dossier={currentDossier}
                onCloseMobile={() => setIsMobileDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
