import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  CloudSun,
  Utensils,
  Compass,
  ArrowRight,
  Landmark,
  Scissors,
  Sparkles,
} from 'lucide-react';
import { StateCulturalDossier } from '../../data/stateDossiersData';

interface StateBottomDrawerProps {
  stateData: StateCulturalDossier | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchItinerary: (stateName: string) => void;
}

export function StateBottomDrawer({
  stateData,
  isOpen,
  onClose,
  onLaunchItinerary,
}: StateBottomDrawerProps) {
  if (!stateData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-4 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 max-w-5xl mx-auto z-30 bg-[#FAF7F2]/95 backdrop-blur-xl border border-[#E5DFD5] rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden"
          role="dialog"
          aria-label={`${stateData.name} Cultural Dossier`}
        >
          {/* Top Bar with Region, Title & Close Button */}
          <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3 mb-4">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
              <span className="text-[10px] sm:text-xs font-heading font-extrabold uppercase tracking-wider text-[#C85A32] bg-[#FAF5EE] border border-[#E5DFD5] px-3 py-1 rounded-full">
                {stateData.region} Cluster
              </span>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#12213B] tracking-tight truncate">
                {stateData.name}
              </h3>
              <span className="text-xs font-sans text-dusk-600 hidden md:inline truncate max-w-md">
                "{stateData.tagline}"
              </span>
            </div>

            {/* Prominent Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white text-[#12213B] hover:text-[#C85A32] border border-[#E5DFD5] transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Close drawer and explore map"
              aria-label="Close cultural dossier"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Grid Content: Weather, Flavors, Circuits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5 items-stretch">
            {/* 1. Best Season & Weather */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs flex items-center gap-3.5">
              <div className="p-2.5 sm:p-3 bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5] rounded-xl shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                  Best Travel Window
                </span>
                <span className="text-xs sm:text-sm font-heading font-bold text-[#12213B] block truncate">
                  {stateData.bestMonths}
                </span>
                <span className="text-[11px] font-sans text-[#2D4A3E] font-semibold block mt-0.5 truncate">
                  {stateData.currentWeather}
                </span>
              </div>
            </div>

            {/* 2. Iconic Culinary Flavors */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-wider text-[#C85A32] mb-2">
                <Utensils className="w-3.5 h-3.5" />
                <span>Flavors of the Soil</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stateData.iconicFlavors.slice(0, 3).map((dish, idx) => (
                  <span
                    key={idx}
                    title={dish.description}
                    className="text-[11px] font-mono bg-[#FAF7F2] border border-[#E5DFD5] text-[#12213B] font-semibold px-2.5 py-1 rounded-lg"
                  >
                    {dish.name}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Primary CTA Action */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E5DFD5] shadow-2xs flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between text-xs font-mono text-dusk-600">
                <span className="flex items-center gap-1 font-bold text-[#12213B]">
                  <Landmark className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{stateData.siteCount} Sites</span>
                </span>
                <span className="text-[#D5CAB8]">•</span>
                <span className="flex items-center gap-1 font-bold text-[#12213B]">
                  <Compass className="w-3.5 h-3.5 text-[#D99B43]" />
                  <span>{stateData.curatedCircuits.length} Circuits</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onLaunchItinerary(stateData.name)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B34E28] active:scale-[0.99] text-white font-heading font-bold text-xs sm:text-sm shadow-md shadow-[#C85A32]/25 transition-all cursor-pointer group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#FFC067]" />
                <span>Plan {stateData.name} Itinerary</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default StateBottomDrawer;
