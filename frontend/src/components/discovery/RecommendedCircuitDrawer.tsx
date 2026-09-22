import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Landmark,
  Coins,
  MapPin,
  Compass,
  CheckCircle2,
  X,
  Gauge,
  Scissors,
} from 'lucide-react';
import {
  getStateMetadata,
  calculateStateMatchScore,
  UserJourneyPreferences,
  StateMetadata,
  MicroCircuit,
} from '../../data/indiaStateMetadata';

interface RecommendedCircuitDrawerProps {
  selectedState: string;
  userPreferences: UserJourneyPreferences;
  onSelectState: (stateName: string) => void;
  onOpenProfiler?: () => void;
  isOpen?: boolean;
}

export function RecommendedCircuitDrawer({
  selectedState,
  userPreferences,
  onSelectState,
  onOpenProfiler,
  isOpen = true,
}: RecommendedCircuitDrawerProps) {
  const navigate = useNavigate();
  const stateMeta = getStateMetadata(selectedState);
  const matchInfo = calculateStateMatchScore(selectedState, userPreferences);

  // Suggested alternative states with high match scores
  const alternativeStates = ['Rajasthan', 'Uttar Pradesh', 'Kerala', 'Tamil Nadu', 'Gujarat', 'Karnataka']
    .filter((s) => s.toLowerCase() !== selectedState.toLowerCase())
    .slice(0, 4);

  const handleGenerateItinerary = (circuit: MicroCircuit) => {
    // Direct CTA pre-filling /itinerary query parameters
    const params = new URLSearchParams({
      city: circuit.baseCity,
      state: stateMeta.name,
      days: String(circuit.durationDays),
      pace: circuit.pacing,
    });
    navigate(`/itinerary?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white rounded-3xl border border-[#E5DFD5] border-t-2 border-t-[#C85A32] p-6 sm:p-8 shadow-sm space-y-6"
    >
      {/* State Header & Dynamic Match Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
              {stateMeta.region}
            </span>
            <span className="text-[#D5CAB8]">•</span>
            <span className="text-xs font-mono font-bold text-dusk-600">
              Primary Hub: {stateMeta.primaryHub}
            </span>
            <span className="text-[#D5CAB8]">•</span>
            <span className="text-xs font-mono text-dusk-600">
              Best Season: {stateMeta.bestSeason}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#12213B] tracking-tight">
            {stateMeta.name}
          </h2>

          <p className="text-xs sm:text-sm text-dusk-600 font-sans mt-1.5 max-w-2xl leading-relaxed">
            {stateMeta.teaser}
          </p>
        </div>

        {/* Dynamic Match Badge Pill */}
        <div className="flex flex-col sm:items-end gap-2 flex-shrink-0">
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-br from-[#FAF5EE] to-[#F3EAE0] border border-[#E8DDD2] rounded-2xl shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#C85A32] text-white flex items-center justify-center font-mono font-black text-sm">
              {matchInfo.score}%
            </div>
            <div>
              <div className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#C85A32]">
                Match Score
              </div>
              <div className="text-xs font-sans font-bold text-[#12213B]">
                {matchInfo.reason}
              </div>
            </div>
          </div>

          {onOpenProfiler && (
            <button
              type="button"
              onClick={onOpenProfiler}
              className="text-xs font-heading font-bold text-[#C85A32] hover:text-[#B34E28] transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Refine Travel Profiler</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Alternative Top Match State Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-dusk-600 font-sans text-xs flex-shrink-0">
          Quick explore other destinations:
        </span>
        {alternativeStates.map((alt) => (
          <button
            key={alt}
            type="button"
            onClick={() => onSelectState(alt)}
            className="px-3 py-1.5 rounded-xl font-heading font-bold bg-[#FAF7F2] hover:bg-white text-[#12213B] border border-[#E5DFD5] hover:border-[#C85A32] transition-colors flex-shrink-0 cursor-pointer shadow-xs"
          >
            {alt}
          </button>
        ))}
      </div>

      {/* Recommended Micro-Circuits Grid */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-heading font-bold text-[#12213B]">
            Recommended Itinerary Circuits for {stateMeta.name}
          </h3>
          <span className="text-xs font-mono text-dusk-600">
            {stateMeta.circuits.length} Curated Options
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stateMeta.circuits.map((circuit, idx) => (
            <div
              key={circuit.id}
              className="group bg-[#FAF7F2] hover:bg-white border border-[#E5DFD5] hover:border-[#C85A32]/40 rounded-3xl p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* Duration and Vibe Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#E5DFD5] rounded-xl text-xs font-mono font-bold text-[#C85A32]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{circuit.durationLabel}</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600">
                    {circuit.vibeTag}
                  </span>
                </div>

                {/* Circuit Title */}
                <h4 className="text-base font-heading font-bold text-[#12213B] group-hover:text-[#C85A32] transition-colors leading-snug">
                  {circuit.title}
                </h4>

                <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                  {circuit.description}
                </p>

                {/* Highlight stops */}
                <div className="space-y-1.5 pt-2 border-t border-[#E5DFD5]">
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#2D4A3E] block">
                    Curated Key Encounters:
                  </span>
                  {circuit.highlights.map((h, hIdx) => (
                    <div key={hIdx} className="flex items-start gap-1.5 text-xs text-[#12213B] font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D99B43] mt-1.5 flex-shrink-0" />
                      <span className="leading-tight">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action and Spend Footer */}
              <div className="pt-4 mt-4 border-t border-[#E5DFD5] flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk-600">
                    Estimated Spend
                  </div>
                  <div className="text-xs font-mono font-black text-[#12213B]">
                    {circuit.dailySpendEst}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleGenerateItinerary(circuit)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C85A32] hover:bg-[#B34E28] text-white rounded-xl text-xs font-heading font-bold shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <span>Generate This Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
