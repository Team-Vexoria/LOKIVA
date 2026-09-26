import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Navigation,
  Footprints,
  Heart,
  CloudRain,
  Sun,
  Accessibility,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ItineraryDay, DayFeasibilityMetrics, ReplanCondition } from '../../types/itinerary';

interface ItineraryDayConsoleProps {
  days: ItineraryDay[];
  selectedDay: number;
  feasibilityMetrics?: Record<number, DayFeasibilityMetrics>;
  activeFilter?: string;
  viewTabs?: React.ReactNode;
  onSelectDay: (dayNumber: number) => void;
  onReplanDay: (condition: ReplanCondition) => void;
}

const CONDITION_SWITCHERS: Array<{
  id: ReplanCondition;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'rain',
    label: 'It is Raining',
    icon: CloudRain,
    description: 'Swaps to covered artisan ateliers and indoor museums',
  },
  {
    id: 'heat',
    label: 'Peak Heat',
    icon: Sun,
    description: 'Avoids open courtyard walks from 12:30 PM to 3:30 PM',
  },
  {
    id: 'fatigue',
    label: 'Low Walking',
    icon: Accessibility,
    description: 'Injects step-free transit & reduces pedestrian segments',
  },
  {
    id: 'crowded',
    label: 'Avoid Rush',
    icon: Zap,
    description: 'Sequences popular bazaars during off-peak morning hours',
  },
];

export function ItineraryDayConsole({
  days,
  selectedDay,
  feasibilityMetrics,
  activeFilter = 'none',
  viewTabs,
  onSelectDay,
  onReplanDay,
}: ItineraryDayConsoleProps) {
  const activeDayIndex = Math.max(0, Math.min(days.length - 1, selectedDay - 1));
  const currentDay = days[activeDayIndex] || days[0];
  const currentMetrics = currentDay && feasibilityMetrics ? feasibilityMetrics[currentDay.dayNumber] : null;

  // Telemetry metric calculations
  const totalDurationMinutes = currentDay?.activities.reduce((sum, a) => sum + (a.durationMins || 60), 0) || 360;
  const hours = (totalDurationMinutes / 60).toFixed(1);
  const totalDistanceKm = currentMetrics?.totalTransitDistanceKm || (currentDay?.activities.length ? (currentDay.activities.length * 2.8).toFixed(1) : '8.5');
  const estimatedSteps = currentMetrics?.estimatedWalkingSteps || Math.round(Number(totalDistanceKm) * 1250);

  return (
    <div className="space-y-4">
      {/* 1. Stippl Fluid Day Bar & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {days.map((day) => {
            const isSelected = selectedDay === day.dayNumber;
            const metric = feasibilityMetrics?.[day.dayNumber];
            const paceScore = metric ? metric.paceScore : 95;

            return (
              <button
                key={day.dayNumber}
                type="button"
                onClick={() => onSelectDay(day.dayNumber)}
                className="relative px-5 py-2.5 rounded-2xl text-xs font-meta font-bold transition-all flex items-center gap-2.5 whitespace-nowrap cursor-pointer shrink-0"
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeDayIndicator"
                    className="absolute inset-0 bg-[#1A1D20] rounded-2xl shadow-md"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}

                <span className={`relative z-10 font-heading text-sm ${isSelected ? 'text-white' : 'text-[#1A1D20]'}`}>
                  Day {day.dayNumber}
                </span>

                <span
                  className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : paceScore >= 80
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {paceScore}% Feasible
                </span>
              </button>
            );
          })}
        </div>

        {viewTabs && <div className="shrink-0 self-end sm:self-auto">{viewTabs}</div>}
      </div>

      {/* 2. Compact Environmental Telemetry Instrument Strip */}
      <div className="bg-[#1A1D20] text-[#FAF7F2] rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-around gap-4 font-mono text-xs">
        {/* Metric 1: Total Paced Duration */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#D99B43]">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 font-meta">
              Active Pace
            </div>
            <div className="text-sm font-bold text-white">
              {hours} hrs total
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/15 hidden sm:block" />

        {/* Metric 2: Route Distance */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#C85A32]">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 font-meta">
              Route Distance
            </div>
            <div className="text-sm font-bold text-white">
              {totalDistanceKm} km loop
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/15 hidden sm:block" />

        {/* Metric 3: Step Count */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 font-meta">
              Pedestrian Steps
            </div>
            <div className="text-sm font-bold text-white">
              ~{estimatedSteps.toLocaleString('en-IN')} steps
            </div>
          </div>
        </div>

        <div className="h-6 w-[1px] bg-white/15 hidden md:block" />

        {/* Metric 4: Community Impact */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#D99B43]">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400/30" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 font-meta">
              Local Community Impact
            </div>
            <div className="text-sm font-bold text-white">
              100% Artisan Direct
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tactile Weather & Condition Switchers */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-meta text-neutral-500 font-bold uppercase tracking-wider px-1">
          <span className="flex items-center gap-1.5 text-[#C85A32]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Environmental Adaptive Console (1-Click Re-Plan)</span>
          </span>
          <span className="text-[10px] font-mono lowercase">
            Active: {activeFilter !== 'none' ? activeFilter : 'standard daylight'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {CONDITION_SWITCHERS.map((switcher) => {
            const isFilterActive = activeFilter === switcher.id;
            const Icon = switcher.icon;

            return (
              <motion.button
                key={switcher.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => onReplanDay(switcher.id)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isFilterActive
                    ? 'bg-[#FAF4ED] border-[#C85A32] shadow-sm ring-1 ring-[#C85A32]'
                    : 'bg-white/80 hover:bg-white border-[#E2D5BE] shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                    isFilterActive ? 'bg-[#C85A32] text-white' : 'bg-[#FAF7F2] text-[#1A1D20]'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    isFilterActive
                      ? 'bg-[#C85A32] text-white'
                      : 'bg-[#FAF7F2] text-neutral-600'
                  }`}>
                    {isFilterActive ? 'Active' : 'Switch'}
                  </span>
                </div>

                <div>
                  <div className={`text-xs font-heading font-bold ${
                    isFilterActive ? 'text-[#C85A32]' : 'text-[#1A1D20]'
                  }`}>
                    {switcher.label}
                  </div>
                  <div className="text-[10px] font-meta text-neutral-500 line-clamp-1 leading-tight mt-0.5">
                    {switcher.description}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ItineraryDayConsole;
