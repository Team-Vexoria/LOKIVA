import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Utensils,
  Compass,
  Calendar,
  MapPin,
  Sparkles,
  AlertCircle,
  CloudSun,
  Luggage,
  Languages
} from 'lucide-react';
import { ItineraryPracticalInfo } from '../../types/itinerary';

interface PracticalBriefingCardProps {
  practicalInfo: ItineraryPracticalInfo;
  cityName: string;
}

export function PracticalBriefingCard({ practicalInfo, cityName }: PracticalBriefingCardProps) {
  const [activeTab, setActiveTab] = useState<'food' | 'tips' | 'season' | 'nearby' | 'overview'>('food');

  const tabs = [
    { id: 'food', label: 'Food Trails', icon: Utensils, count: practicalInfo.foodRecommendations?.length || 0 },
    { id: 'tips', label: 'Field Tips', icon: Compass, count: practicalInfo.travelTips?.length || 0 },
    { id: 'season', label: 'Best Time', icon: Calendar },
    { id: 'nearby', label: 'Nearby Excursions', icon: MapPin, count: practicalInfo.nearbyPlaces?.length || 0 },
    { id: 'overview', label: 'Climate & Gear', icon: CloudSun },
  ] as const;

  return (
    <div className="bg-[#FAF7F2] border border-[#E5DFD5] rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 text-ink">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-3">
        <div>
          <span className="font-heading text-[10px] uppercase font-extrabold tracking-widest text-[#C1443B] block mb-0.5">
            Spatiotemporal Field Intelligence
          </span>
          <h3 className="font-display text-lg sm:text-xl font-bold text-ink tracking-tight">
            {cityName} Territory Dispatch
          </h3>
        </div>
        <div className="w-8 h-8 rounded-xl bg-white border border-[#E5DFD5] flex items-center justify-center text-[#C1443B] shadow-2xs">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-sm border border-[#E5DFD5] rounded-2xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[85px] py-2 px-3 rounded-xl font-heading text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#C1443B] text-white shadow-xs'
                  : 'text-dusk hover:text-ink hover:bg-[#FAF7F2]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Animated Content Panel */}
      <div className="min-h-[220px]">
        <AnimatePresence mode="wait">
          {/* TAB 1: FOOD RECOMMENDATIONS */}
          {activeTab === 'food' && (
            <motion.div
              key="tab-food"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              {practicalInfo.foodRecommendations && practicalInfo.foodRecommendations.length > 0 ? (
                practicalInfo.foodRecommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs space-y-1.5 hover:border-[#FFC067] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C1443B]" />
                        <span className="font-heading font-bold text-xs text-ink">
                          {rec.locale}
                        </span>
                      </div>
                      {rec.notes && (
                        <span className="text-[10px] font-mono text-dusk">
                          {rec.notes}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.dishes.map((dish, idx) => (
                        <span
                          key={idx}
                          className="font-mono text-[11px] bg-[#FAF7F2] text-ink border border-[#E5DFD5] px-2.5 py-0.5 rounded-lg font-semibold"
                        >
                          🍲 {dish}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] text-xs font-sans text-dusk text-center">
                  Discovering authentic gastronomic circuits for {cityName}...
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: FIELD TRAVEL TIPS */}
          {activeTab === 'tips' && (
            <motion.div
              key="tab-tips"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-2.5"
            >
              {practicalInfo.travelTips && practicalInfo.travelTips.length > 0 ? (
                practicalInfo.travelTips.map((tip, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs flex items-start gap-3 text-xs text-ink font-sans leading-relaxed"
                  >
                    <Compass className="w-4 h-4 text-[#C1443B] shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] text-xs font-sans text-dusk text-center">
                  Compile field advisories for {cityName}...
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: BEST TIME TO VISIT & SEASONS */}
          {activeTab === 'season' && (
            <motion.div
              key="tab-season"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs space-y-1">
                <span className="font-heading text-[10px] uppercase font-extrabold tracking-wider text-dusk block">
                  Prime Travel Window
                </span>
                <p className="font-display text-sm font-bold text-ink">
                  {practicalInfo.bestTimeToVisit?.idealMonths || 'October to March (Optimal Season)'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs space-y-1">
                <span className="font-heading text-[10px] uppercase font-extrabold tracking-wider text-dusk block">
                  Crowd Density &amp; Pacing
                </span>
                <p className="font-sans text-xs text-ink leading-relaxed">
                  {practicalInfo.bestTimeToVisit?.crowdPacing || 'Mornings before 09:30 AM offer the most serene experiences; weekends see local footfall at major monuments.'}
                </p>
              </div>

              {practicalInfo.bestTimeToVisit?.advisory && (
                <div className="p-3.5 rounded-2xl bg-[#FFF7ED] border border-[#FDBA74] flex items-start gap-2.5 text-xs text-[#C1443B] font-sans">
                  <AlertCircle className="w-4 h-4 text-[#C1443B] shrink-0 mt-0.5" />
                  <span>{practicalInfo.bestTimeToVisit.advisory}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: NEARBY PLACES & DETOURS */}
          {activeTab === 'nearby' && (
            <motion.div
              key="tab-nearby"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-2.5"
            >
              {practicalInfo.nearbyPlaces && practicalInfo.nearbyPlaces.length > 0 ? (
                practicalInfo.nearbyPlaces.map((place, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs flex items-center justify-between gap-3 hover:border-[#C1443B] transition-colors"
                  >
                    <div>
                      <h5 className="font-heading font-bold text-xs text-ink">
                        {place.name}
                      </h5>
                      <span className="font-mono text-[11px] text-dusk">
                        📍 {place.districtOrArea || place.area}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase bg-[#FAF7F2] text-[#C1443B] border border-[#E5DFD5] px-2.5 py-1 rounded-lg font-bold">
                      {place.tag}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-2xl bg-white border border-[#E5DFD5] text-xs font-sans text-dusk text-center">
                  Calculating nearby excursions for {cityName}...
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: OVERVIEW & CLIMATE GEAR */}
          {activeTab === 'overview' && (
            <motion.div
              key="tab-overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="space-y-3"
            >
              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs flex items-start gap-3">
                <CloudSun className="w-4 h-4 text-[#FFC067] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-heading text-[10px] uppercase font-extrabold tracking-wider text-dusk block">
                    Climate &amp; Temperature
                  </span>
                  <p className="font-sans text-xs text-ink">
                    {practicalInfo.weatherSummary} ({practicalInfo.temperature})
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs flex items-start gap-3">
                <Luggage className="w-4 h-4 text-[#C1443B] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-heading text-[10px] uppercase font-extrabold tracking-wider text-dusk block">
                    Packing Essentials
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {practicalInfo.packingList.map((item, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-[11px] bg-[#FAF7F2] text-ink border border-[#E5DFD5] px-2.5 py-0.5 rounded-lg"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#E5DFD5] shadow-2xs flex items-start gap-3">
                <Languages className="w-4 h-4 text-[#12213B] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-heading text-[10px] uppercase font-extrabold tracking-wider text-dusk block">
                    Regional Dialects
                  </span>
                  <p className="font-mono text-xs text-ink font-semibold">
                    {practicalInfo.languages.join(' · ')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PracticalBriefingCard;
