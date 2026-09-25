import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CloudSun,
  MapPin,
  Utensils,
  Compass,
  ArrowRight,
  Landmark,
  Scissors,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { StateCulturalDossier } from '../../data/stateDossiersData';

interface StateDossierSidebarProps {
  dossier: StateCulturalDossier;
  onCloseMobile?: () => void;
  className?: string;
}

export function StateDossierSidebar({
  dossier,
  onCloseMobile,
  className = '',
}: StateDossierSidebarProps) {
  const navigate = useNavigate();

  const handleLaunchItinerary = (circuitDays: number = 4) => {
    // Navigate directly to /itinerary with selected state and parameters
    navigate(
      `/itinerary?city=${encodeURIComponent(dossier.name)}&days=${circuitDays}&pace=balanced`
    );
  };

  return (
    <aside
      className={`w-full h-full flex flex-col justify-between overflow-y-auto bg-[#FAF7F2] ${className}`}
      aria-label={`${dossier.name} Cultural Dossier`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={dossier.stateId}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 flex-1 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Top Bar on Mobile with Close Button */}
            {onCloseMobile && (
              <div className="flex items-center justify-between lg:hidden pb-2 border-b border-[#E5DFD5]">
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                  State Cultural Dossier
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-xl hover:bg-white text-[#12213B] border border-[#E5DFD5] transition-colors"
                  aria-label="Close dossier"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 1. Hero Header Card */}
            <div className="relative rounded-2xl h-44 overflow-hidden border border-[#E5DFD5] shadow-xs group">
              <img
                src={dossier.heroImage}
                alt={dossier.name}
                loading="lazy"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              {/* Gradient scrim for crisp legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

              {/* Badges on Top */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase bg-[#C85A32] text-white px-2.5 py-1 rounded-full shadow-xs">
                  {dossier.region}
                </span>
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-white text-[11px] font-mono">
                  <Landmark className="w-3 h-3 text-[#FFC067]" />
                  <span>{dossier.siteCount} Sites</span>
                  <span className="text-white/40">•</span>
                  <Scissors className="w-3 h-3 text-[#FFC067]" />
                  <span>{dossier.guildCount} Guilds</span>
                </div>
              </div>

              {/* Title & Regional Tagline */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight drop-shadow-md text-white">
                  {dossier.name}
                </h2>
                <p className="text-xs sm:text-sm font-sans text-white/90 line-clamp-1 drop-shadow-xs mt-0.5">
                  {dossier.tagline}
                </p>
              </div>
            </div>

            {/* 2. Trip Timing & Weather Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs">
                <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5] shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                    Best Season
                  </span>
                  <p className="text-xs font-heading font-bold text-[#12213B] truncate">
                    {dossier.bestMonths}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs">
                <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#D99B43] border border-[#E5DFD5] shrink-0">
                  <CloudSun className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600 block">
                    Current Season Weather
                  </span>
                  <p className="text-xs font-heading font-bold text-[#12213B] truncate">
                    {dossier.currentWeather}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Popular Regional Heritage Sites */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                <MapPin className="w-3.5 h-3.5" />
                <span>Featured Heritage Anchors</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dossier.popularPlaces.map((place, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white border border-[#E5DFD5] text-xs font-sans text-[#12213B] shadow-2xs"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#C85A32]" />
                    <span>{place}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* 4. Gastronomy & Iconic Flavors Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Iconic Culinary Flavors</span>
                </div>
                <span className="text-[10px] font-mono text-dusk-600">
                  3 Regional Staples
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {dossier.iconicFlavors.map((flavor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs hover:border-[#FFC067] transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-heading font-bold text-xs text-[#12213B] truncate">
                          {flavor.name}
                        </h4>
                      </div>
                      <p className="text-[11px] font-sans text-dusk-600 leading-snug line-clamp-2">
                        {flavor.description}
                      </p>
                    </div>
                    <span className="mt-2 text-[9px] font-mono font-bold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2 py-0.5 rounded-full inline-block self-start">
                      {flavor.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Curated Micro-Circuits Available */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Curated Cultural Micro-Circuits</span>
                </div>
                <span className="text-[10px] font-mono text-dusk-600">
                  Verified Routes
                </span>
              </div>

              <div className="space-y-2">
                {dossier.curatedCircuits.map((circuit, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLaunchItinerary(parseInt(circuit.duration, 10) || 3)}
                    className="p-3.5 rounded-2xl bg-white hover:bg-[#FFFDF9] border border-[#E5DFD5] hover:border-[#FFC067] transition-all duration-200 shadow-2xs cursor-pointer group flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2 py-0.5 rounded-full">
                          {circuit.duration}
                        </span>
                        <span className="text-[10px] font-mono text-dusk-600 font-semibold">
                          {circuit.pace}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-[#12213B] truncate group-hover:text-[#C85A32] transition-colors">
                        {circuit.title}
                      </h4>
                      {circuit.highlights && circuit.highlights.length > 0 && (
                        <p className="text-[11px] font-sans text-dusk-600 line-clamp-1">
                          {circuit.highlights.join(' • ')}
                        </p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] group-hover:bg-[#C85A32] group-hover:text-white border border-[#E5DFD5] group-hover:border-[#C85A32] flex items-center justify-center shrink-0 transition-all">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 6. Primary Conversion Action */}
          <div className="pt-4 mt-6 border-t border-[#E5DFD5]">
            <button
              type="button"
              onClick={() => handleLaunchItinerary(4)}
              className="w-full py-3.5 px-5 rounded-2xl bg-[#C85A32] hover:bg-[#B34E28] active:scale-[0.99] text-white font-heading font-bold text-sm sm:text-base tracking-wide shadow-md shadow-[#C85A32]/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Sparkles className="w-4 h-4" />
              <span>Explore Full {dossier.name} Dossier &amp; Itinerary</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}

export default StateDossierSidebar;
