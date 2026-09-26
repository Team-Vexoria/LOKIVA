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

interface RegionalIntelligenceBentoProps {
  data: DynamicRegionalIntelligence;
  cityName: string;
  stateName?: string;
}

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12, duration: 0.6, ease: 'easeOut' as const },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function RegionalIntelligenceBento({
  data,
  cityName,
  stateName,
}: RegionalIntelligenceBentoProps) {
  if (!data) return null;

  const resolvedTitle = stateName && stateName !== cityName ? `${cityName}, ${stateName}` : cityName;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="w-full space-y-6 pt-4"
    >
      {/* Editorial Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2D5BE] pb-4">
        <div className="space-y-1">
          <span className="font-heading text-xs font-extrabold uppercase tracking-widest text-[#C85A32] bg-[#FAF4ED] border border-[#E8DEC8] px-3 py-1 rounded-full inline-block">
            Field Intelligence &amp; Regional Dossier
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-neutral-900 tracking-tight">
            Essential {resolvedTitle} Briefing
          </h3>
        </div>
        <span className="font-meta text-xs text-neutral-500 font-medium">
          Synthesized dynamically across regional cultural registries
        </span>
      </div>

      {/* 2x2 Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* ── CARD 1: GASTRONOMY & LOCAL HEARTHS ── */}
        <motion.div
          variants={cardItemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative rounded-3xl p-6 sm:p-7 bg-white/90 backdrop-blur-xl border border-[#E2D5BE] hover:border-[#C85A32] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#C85A32] to-[#D99B43] text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                  <UtensilsCrossed className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-heading text-[11px] uppercase font-extrabold tracking-widest text-[#C85A32]">
                    Gastronomy Dossier
                  </span>
                  <h4 className="font-heading font-bold text-xl sm:text-2xl text-neutral-900 tracking-tight">
                    Food Recommendations
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8] font-meta text-xs font-bold uppercase tracking-wider">
                Local Hearth
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {(data.foodRecommendations || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] space-y-2 transition-all hover:border-[#C85A32]/40"
                >
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#C85A32] shrink-0" />
                    <span className="font-heading font-bold text-sm sm:text-base text-neutral-900">
                      {item.locale}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(item.dishes || []).map((dish, dIdx) => (
                      <span
                        key={dIdx}
                        className="font-meta text-xs sm:text-sm font-bold px-3 py-1 rounded-xl bg-white border border-[#E8DEC8] text-neutral-800 shadow-2xs"
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
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── CARD 2: TACTILE FIELD TIPS & ADVISORIES ── */}
        <motion.div
          variants={cardItemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative rounded-3xl p-6 sm:p-7 bg-white/90 backdrop-blur-xl border border-[#E2D5BE] hover:border-indigo-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-indigo-500/10 via-sky-400/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md group-hover:-rotate-6 transition-transform">
                  <Compass className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-heading text-[11px] uppercase font-extrabold tracking-widest text-indigo-700">
                    On-Ground Intuition
                  </span>
                  <h4 className="font-heading font-bold text-xl sm:text-2xl text-neutral-900 tracking-tight">
                    Travel Tips &amp; Advisories
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-meta text-xs font-bold uppercase tracking-wider">
                Insider Rules
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {(data.travelTips || []).map((tip, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-start gap-3.5 transition-all hover:border-indigo-300"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 flex items-center justify-center font-display font-black text-xs shrink-0 mt-0.5 shadow-2xs">
                    0{idx + 1}
                  </div>
                  <p className="font-meta text-xs sm:text-sm text-neutral-800 leading-relaxed font-medium">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── CARD 3: SOLAR & SEASONAL CLOCK ── */}
        <motion.div
          variants={cardItemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative rounded-3xl p-6 sm:p-7 bg-white/90 backdrop-blur-xl border border-[#E2D5BE] hover:border-amber-400 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-amber-500/10 via-orange-400/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-md group-hover:rotate-6 transition-transform">
                  <CalendarCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-heading text-[11px] uppercase font-extrabold tracking-widest text-amber-700">
                    Solar &amp; Seasonal Clock
                  </span>
                  <h4 className="font-heading font-bold text-xl sm:text-2xl text-neutral-900 tracking-tight">
                    Best Time to Visit
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-meta text-xs font-bold uppercase tracking-wider">
                Peak Window
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/80 border border-amber-200/90 shadow-2xs space-y-1">
                <span className="font-heading text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Prime Season Window</span>
                </span>
                <p className="font-display text-2xl font-black text-[#C85A32] tracking-tight">
                  {data.bestTimeToVisit?.idealMonths || 'October to March'}
                </p>
                <p className="font-meta text-xs sm:text-sm text-neutral-700 leading-relaxed pt-0.5">
                  {data.bestTimeToVisit?.seasonContext || 'Pleasant weather and clear skies across the region.'}
                </p>
              </div>

              {data.bestTimeToVisit?.crowdPacing && (
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="font-meta text-xs sm:text-sm text-neutral-700 leading-relaxed font-medium">
                    {data.bestTimeToVisit.crowdPacing}
                  </p>
                </div>
              )}

              {(data.bestTimeToVisit?.advisoryNote || data.bestTimeToVisit?.advisory) && (
                <div className="p-3.5 rounded-2xl bg-orange-50/90 border border-orange-200 flex items-start gap-2.5 text-orange-950 font-meta text-xs">
                  <ShieldAlert className="w-4 h-4 text-[#C85A32] shrink-0 mt-0.5" />
                  <span>{data.bestTimeToVisit.advisoryNote || data.bestTimeToVisit.advisory}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── CARD 4: PERIMETER HORIZONS & DETOURS ── */}
        <motion.div
          variants={cardItemVariants}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="group relative rounded-3xl p-6 sm:p-7 bg-white/90 backdrop-blur-xl border border-[#E2D5BE] hover:border-emerald-500 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-emerald-500/10 via-teal-400/5 to-transparent rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md group-hover:-rotate-6 transition-transform">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <span className="font-heading text-[11px] uppercase font-extrabold tracking-widest text-emerald-800">
                    Perimeter Horizons
                  </span>
                  <h4 className="font-heading font-bold text-xl sm:text-2xl text-neutral-900 tracking-tight">
                    Nearby Places &amp; Detours
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-meta text-xs font-bold uppercase tracking-wider">
                Curated Radii
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {(data.nearbyPlaces || []).map((place, idx) => {
                const areaText = place.districtOrArea || place.area || '';
                const distanceText = place.distanceKm ? `≈ ${place.distanceKm} km` : '';
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DEC8] flex items-center justify-between group/row hover:border-emerald-500 transition-all cursor-pointer"
                  >
                    <div>
                      <h5 className="font-heading font-bold text-sm sm:text-base text-neutral-900 group-hover/row:text-emerald-700 transition-colors">
                        {place.name}
                      </h5>
                      <span className="font-meta text-xs text-neutral-500 font-medium">
                        {areaText} {distanceText && `· ${distanceText}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-meta text-xs font-bold uppercase tracking-wider bg-white border border-[#E8DEC8] text-neutral-700 px-2.5 py-0.5 rounded-xl shadow-2xs">
                        {place.tag}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover/row:text-emerald-600 group-hover/row:translate-x-0.5 group-hover/row:-translate-y-0.5 transition-all" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default RegionalIntelligenceBento;
