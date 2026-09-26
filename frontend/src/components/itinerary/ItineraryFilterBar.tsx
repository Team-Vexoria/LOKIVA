import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Clock, Compass } from 'lucide-react';
import { POPULAR_CITIES_LIST } from '../../data/places';

interface ItineraryFilterBarProps {
  city: string;
  daysCount: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  isGenerating: boolean;
  onCityChange: (city: string) => void;
  onDaysChange: (days: number) => void;
  onPaceChange: (pace: 'relaxed' | 'balanced' | 'packed') => void;
  onGenerate: (e: React.FormEvent) => void;
  onQuickCitySelect: (city: string) => void;
}

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 7];
const PACE_OPTIONS: Array<{ id: 'relaxed' | 'balanced' | 'packed'; label: string }> = [
  { id: 'relaxed', label: 'Relaxed' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'packed', label: 'Packed' },
];

export function ItineraryFilterBar({
  city,
  daysCount,
  pace,
  isGenerating,
  onCityChange,
  onDaysChange,
  onPaceChange,
  onGenerate,
  onQuickCitySelect,
}: ItineraryFilterBarProps) {
  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full">
      {/* 1. Floating Glassmorphic Command Deck */}
      <form
        onSubmit={onGenerate}
        className="bg-[#FFFDF9]/90 backdrop-blur-2xl border border-[#E6DAC6] shadow-[0_10px_35px_-12px_rgba(59,35,22,0.06)] rounded-full px-4 sm:px-6 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 transition-all"
      >
        {/* Segment 1: Destination City */}
        <div className="flex items-center gap-2.5 w-full md:w-auto flex-1 px-1">
          <div className="w-8 h-8 rounded-full bg-[#FAF0DF] border border-[#F2D5A7] flex items-center justify-center text-[#B84A27] shrink-0">
            <MapPin className="w-4 h-4 text-[#B84A27]" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <span className="text-[10px] font-meta uppercase font-bold text-[#7A5C49] block leading-none mb-0.5">
              Destination City
            </span>
            <input
              type="text"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Jaipur, Varanasi, Kochi, Delhi..."
              className="w-full bg-transparent border-none p-0 text-sm font-display font-bold text-[#3B2316] placeholder:text-[#A67B5B]/60 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-[#E6DAC6] hidden md:block" />

        {/* Segment 2: Duration Stepper (1D to 7D) */}
        <div className="flex items-center gap-2 w-full md:w-auto px-1">
          <span className="text-[10px] font-meta uppercase font-bold text-[#7A5C49] hidden xl:block">
            Days:
          </span>
          <div className="flex items-center bg-[#FAF6F0] p-1 rounded-full border border-[#E6DAC6] gap-1">
            {DURATION_OPTIONS.map((num) => {
              const isSelected = daysCount === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => onDaysChange(num)}
                  className="relative px-2.5 py-1 text-xs font-meta font-bold rounded-full transition-colors cursor-pointer"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activeDurationPill"
                      className="absolute inset-0 bg-gradient-to-r from-[#B84A27] to-[#D47A39] rounded-full shadow-2xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 ${isSelected ? 'text-[#FFFDF9]' : 'text-[#5C3D2E] hover:text-[#B84A27]'}`}>
                    {num}D
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-[#E6DAC6] hidden md:block" />

        {/* Segment 3: Travel Pace Selector */}
        <div className="flex items-center gap-1.5 w-full md:w-auto px-1">
          <div className="flex items-center bg-[#FAF6F0] p-1 rounded-full border border-[#E6DAC6] gap-1">
            {PACE_OPTIONS.map((option) => {
              const isSelected = pace === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onPaceChange(option.id)}
                  className="relative px-3 py-1 text-xs font-meta font-bold rounded-full transition-colors cursor-pointer"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activePacePill"
                      className="absolute inset-0 bg-gradient-to-r from-[#B84A27] to-[#D47A39] rounded-full shadow-2xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 capitalize ${isSelected ? 'text-[#FFFDF9]' : 'text-[#5C3D2E] hover:text-[#B84A27]'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-[#E6DAC6] hidden md:block" />

        {/* Segment 4: Re-Generate Action Button */}
        <div className="w-full md:w-auto">
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full md:w-auto bg-gradient-to-r from-[#B84A27] to-[#D47A39] text-[#FFFDF9] font-heading font-bold text-xs uppercase tracking-wider px-6 py-2.5 rounded-full shadow-md shadow-[#B84A27]/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFFDF9]" />
            <span>{isGenerating ? 'Solving...' : 'Re-Generate'}</span>
          </button>
        </div>
      </form>

      {/* 2. Quick Hubs Horizontal Rail with Edge Fade Masks */}
      <div className="relative flex items-center px-1">
        {/* Left Fade Gradient Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FAF6F0] to-transparent z-10" />

        {/* Horizontal Chips Track */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full">
          <span className="text-[11px] font-meta uppercase font-bold text-[#B84A27] shrink-0 pl-1">
            Quick Hubs:
          </span>
          {POPULAR_CITIES_LIST.map((cityName) => {
            const isSelected = city.toLowerCase() === cityName.toLowerCase();
            return (
              <motion.button
                key={cityName}
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onQuickCitySelect(cityName)}
                className={`px-3 py-1 rounded-full text-xs font-meta whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#B84A27] to-[#D47A39] text-[#FFFDF9] font-bold shadow-2xs shadow-[#B84A27]/20'
                    : 'bg-[#FFFDF9]/85 hover:bg-[#FFFDF9] text-[#5C3D2E] border border-[#E6DAC6] hover:border-[#B84A27]/50 shadow-2xs'
                }`}
              >
                {cityName}
              </motion.button>
            );
          })}
        </div>

        {/* Right Fade Gradient Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAF6F0] to-transparent z-10" />
      </div>
    </div>
  );
}

export default ItineraryFilterBar;
