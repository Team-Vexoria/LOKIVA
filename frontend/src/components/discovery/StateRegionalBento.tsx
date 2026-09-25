import React from 'react';
import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Compass,
  CalendarCheck,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Flame,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { DynamicRegionalIntelligence } from '../../types/itinerary';

interface Props {
  data: DynamicRegionalIntelligence;
  stateName: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function StateRegionalBento({ data, stateName }: Props) {
  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-6 py-8"
    >
      {/* ── CARD 1: CULINARY SOUL & FOOD HEARTHS ── */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25 } }}
        className="group relative rounded-3xl p-7 bg-white/75 backdrop-blur-xl border-2 border-[#E8DEC8] hover:border-[#C85A32] shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
      >
        {/* Ambient Gradient Glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-[#C85A32]/20 via-amber-400/10 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-[#E88E44] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:rotate-6 transition-transform">
                <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-meta text-xs uppercase font-extrabold tracking-widest text-[#C85A32]">
                  Gastronomy Dossier
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Culinary Traditions
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-[#C85A32] font-meta text-xs font-bold uppercase tracking-wider">
              Local Hearth
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {(data.foodRecommendations || []).map((item, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                className="p-4 rounded-2xl bg-[#FAF7F2]/90 border border-[#E8DEC8] space-y-2.5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#C85A32] shrink-0 animate-pulse" />
                  <span className="font-heading font-bold text-sm sm:text-base text-neutral-900">
                    {item.locale}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(item.dishes || []).map((dish, dIdx) => (
                    <span
                      key={dIdx}
                      className="font-meta text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl bg-white border border-[#E8DEC8] text-neutral-800 shadow-2xs hover:bg-[#FAF7F2] transition-colors"
                    >
                      {dish}
                    </span>
                  ))}
                </div>
                {(item.contextNote || item.notes) && (
                  <p className="font-meta text-xs text-neutral-500 italic pt-0.5">
                    {item.contextNote || item.notes}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── CARD 2: TACTILE FIELD TIPS & SECRETS ── */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25 } }}
        className="group relative rounded-3xl p-7 bg-white/75 backdrop-blur-xl border-2 border-[#E8DEC8] hover:border-indigo-500 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-500/20 via-sky-400/10 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:-rotate-6 transition-transform">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-meta text-xs uppercase font-extrabold tracking-widest text-indigo-600">
                  On-Ground Intuition
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Travel Tips & Advisories
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-meta text-xs font-bold uppercase tracking-wider">
              Insider Rules
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(data.travelTips || []).map((tip, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 4 }}
                className="p-3.5 rounded-2xl bg-[#FAF7F2]/90 border border-[#E8DEC8] flex items-start gap-3.5 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-meta font-bold text-xs shrink-0 mt-0.5">
                  0{idx + 1}
                </div>
                <p className="font-meta text-sm sm:text-[15px] text-neutral-800 leading-relaxed font-medium">
                  {tip}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── CARD 3: BEST TIME TO VISIT & CLIMATE RHYTHMS ── */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25 } }}
        className="group relative rounded-3xl p-7 bg-white/75 backdrop-blur-xl border-2 border-[#E8DEC8] hover:border-amber-500 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:rotate-6 transition-transform">
                <CalendarCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-meta text-xs uppercase font-extrabold tracking-widest text-amber-700">
                  Solar & Seasonal Clock
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Best Time to Visit
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-meta text-xs font-bold uppercase tracking-wider">
              Peak Window
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Primary Travel Window Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/90 shadow-2xs space-y-1">
              <span className="font-meta text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Prime Season Window
              </span>
              <p className="font-heading text-lg sm:text-xl font-bold text-neutral-900">
                {data.bestTimeToVisit?.idealMonths || 'October to March (Optimal Season)'}
              </p>
              <p className="font-meta text-sm text-neutral-700 leading-relaxed pt-1">
                {data.bestTimeToVisit?.seasonContext || 'Pleasant weather and clear skies across the region.'}
              </p>
            </div>

            {/* Crowd Dynamic */}
            {data.bestTimeToVisit?.crowdPacing && (
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2]/90 border border-[#E8DEC8] flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-meta text-sm text-neutral-700 leading-relaxed font-medium">
                  {data.bestTimeToVisit.crowdPacing}
                </p>
              </div>
            )}

            {/* Safety / Weather Alert */}
            {(data.bestTimeToVisit?.advisoryNote || data.bestTimeToVisit?.advisory) && (
              <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200 flex items-start gap-2.5 text-orange-950 font-meta text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                <span>{data.bestTimeToVisit.advisoryNote || data.bestTimeToVisit.advisory}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── CARD 4: EXPEDITIONS & NEARBY DETOURS ── */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25 } }}
        className="group relative rounded-3xl p-7 bg-white/75 backdrop-blur-xl border-2 border-[#E8DEC8] hover:border-emerald-600 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-500/20 via-teal-400/10 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:-rotate-6 transition-transform">
                <MapPin className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-meta text-xs uppercase font-extrabold tracking-widest text-emerald-700">
                  Perimeter Horizons
                </span>
                <h3 className="font-heading text-2xl font-extrabold text-neutral-900 tracking-tight">
                  Nearby Places & Detours
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-meta text-xs font-bold uppercase tracking-wider">
              Curated Radii
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(data.nearbyPlaces || []).map((place, idx) => {
              const areaText = place.districtOrArea || place.area || '';
              const distanceText = place.distanceKm ? `· ≈ ${place.distanceKm} km` : '';
              return (
                <motion.div
                  key={idx}
                  whileHover={{ x: 4 }}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2]/90 border border-[#E8DEC8] flex items-center justify-between group/row hover:border-emerald-500 transition-all cursor-pointer"
                >
                  <div>
                    <h5 className="font-heading font-bold text-sm sm:text-base text-neutral-900 group-hover/row:text-emerald-700 transition-colors">
                      {place.name}
                    </h5>
                    <span className="font-meta text-xs text-neutral-500 font-medium">
                      {areaText} {distanceText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-meta text-xs font-bold uppercase tracking-wider bg-white border border-[#E8DEC8] text-neutral-700 px-3 py-1 rounded-xl shadow-2xs">
                      {place.tag}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover/row:text-emerald-600 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 transition-all" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StateRegionalBento;
