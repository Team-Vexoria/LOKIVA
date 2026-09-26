import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  Umbrella,
  Sun,
  ShieldCheck,
  Zap,
  Footprints,
  Compass,
  Coins,
  Flame,
  RotateCcw,
} from 'lucide-react';
import { DayFeasibilityMetrics, ReplanCondition } from '../../types/itinerary';

interface FeasibilityPanelProps {
  metrics: DayFeasibilityMetrics | null;
  dayNumber: number;
  activeFilter?: ReplanCondition;
  onReplan: (condition: ReplanCondition) => void;
  isReplanning?: boolean;
}

export function FeasibilityPanel({
  metrics,
  dayNumber,
  activeFilter = 'none',
  onReplan,
  isReplanning = false,
}: FeasibilityPanelProps) {
  if (!metrics) {
    return (
      <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 text-center space-y-2 shadow-xs font-mono text-xs text-dusk">
        <span>Calculating time-space feasibility matrix...</span>
      </div>
    );
  }

  const {
    paceScore,
    paceLabel,
    totalSightseeingMinutes,
    totalTransitMinutes,
    totalTransitDistanceKm,
    estimatedWalkingSteps,
    localImpactScore,
    warnings,
  } = metrics;

  return (
    <div className="bg-[#FAF6F0] rounded-2xl border border-[#E6DAC6] p-5 sm:p-6 space-y-5 shadow-sm text-[#3B2316]">
      {/* Top Header Barometer */}
      <div className="space-y-3 pb-4 border-b border-[#E6DAC6]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#B84A27]">
              AI Feasibility Solver · Day {dayNumber}
            </span>
            {activeFilter !== 'none' && (
              <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#B84A27] to-[#D47A39] text-[#FFFDF9] text-[10px] font-meta font-bold uppercase tracking-wider">
                Filter: {activeFilter}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilter !== 'none' && (
              <button
                onClick={() => onReplan('none')}
                className="text-[11px] font-meta text-[#B84A27] hover:underline flex items-center gap-1 cursor-pointer"
                title="Reset to original balanced schedule"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Day</span>
              </button>
            )}

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-meta font-bold border ${
                paceScore >= 80
                  ? 'bg-[#FAF0DF] text-[#9E5414] border-[#F2D5A7]'
                  : paceScore >= 60
                  ? 'bg-[#FAF0DF] text-[#9E5414] border-[#F2D5A7]'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              {paceScore >= 80 ? '✓ ' : '⚠️ '}
              {paceLabel} Pace ({paceScore}/100)
            </span>
          </div>
        </div>

        {/* 4 Key Feasibility Real-Time Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E6DAC6] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-[#7A5C49] block">Sightseeing</span>
            <span className="text-sm font-bold font-meta text-[#3B2316]">
              {Math.floor(totalSightseeingMinutes / 60)}h {totalSightseeingMinutes % 60}m
            </span>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E6DAC6] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-[#7A5C49] block">Transit Time</span>
            <span className="text-sm font-bold font-meta text-[#3B2316]">
              {totalTransitMinutes} mins ({totalTransitDistanceKm} km)
            </span>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E6DAC6] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-[#7A5C49] block">Step Count</span>
            <span className="text-sm font-bold font-meta text-[#3B2316] flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#B84A27]" />
              <span>{estimatedWalkingSteps.toLocaleString()}</span>
            </span>
          </div>

          <div className="bg-[#FFFDF9] p-3 rounded-xl border border-[#E6DAC6] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-[#7A5C49] block">Local Impact</span>
            <span className="text-sm font-bold font-meta text-[#9E5414]">
              {localImpactScore}% Direct
            </span>
          </div>
        </div>
      </div>

      {/* Warnings & Domain Alerts */}
      {warnings.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[11px] font-mono uppercase font-bold text-[#7A5C49] block">
            Constraint & Timing Advisories ({warnings.length})
          </span>

          <div className="space-y-2">
            {warnings.map((w) => (
              <div
                key={w.id}
                className={`p-3 rounded-xl border text-xs font-sans space-y-1 ${
                  w.severity === 'critical'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : w.severity === 'warning'
                    ? 'bg-[#FAF0DF] border-[#F2D5A7] text-[#3B2316]'
                    : 'bg-[#FAF6F0] border-[#E6DAC6] text-[#3B2316]'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      w.severity === 'critical'
                        ? 'text-rose-600'
                        : w.severity === 'warning'
                        ? 'text-[#D47A39]'
                        : 'text-[#B84A27]'
                    }`}
                  />
                  <div>
                    <strong className="font-heading font-bold block">{w.message}</strong>
                    {w.recommendation && (
                      <p className="text-[11px] opacity-90 mt-0.5 font-sans">
                        💡 {w.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1-Click Adaptive Re-Planner Pill Buttons (Fully Functional State) */}
      <div className="space-y-2.5 pt-2 border-t border-[#E6DAC6]">
        <div className="flex items-center justify-between">
          <span className="font-meta text-xs font-semibold tracking-wider uppercase text-[#7A5C49]">
            1-Click Adaptive Re-Planner:
          </span>
          <span className="font-meta text-[11px] text-[#B84A27]">
            {activeFilter !== 'none' ? `Active: ${activeFilter} (Click to toggle)` : 'Click to adapt schedule'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. It is Raining Pill */}
          <button
            onClick={() => onReplan('rain')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'rain'
                ? 'bg-[#FAF0DF] border-2 border-[#B84A27] text-[#3B2316] ring-2 ring-[#D47A39]/30'
                : 'bg-[#FFFDF9] hover:bg-[#FAF6F0] border border-[#E6DAC6] hover:border-[#B84A27]/40 text-[#3B2316]'
            }`}
          >
            <Umbrella className="w-3.5 h-3.5 text-[#B84A27]" />
            <span>{activeFilter === 'rain' ? '✓ Rain Mode' : 'It is Raining'}</span>
          </button>

          {/* 2. Peak Heat Pill */}
          <button
            onClick={() => onReplan('heat')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'heat'
                ? 'bg-[#FAF0DF] border-2 border-[#B84A27] text-[#3B2316] ring-2 ring-[#D47A39]/30'
                : 'bg-[#FFFDF9] hover:bg-[#FAF6F0] border border-[#E6DAC6] hover:border-[#B84A27]/40 text-[#3B2316]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#D47A39]" />
            <span>{activeFilter === 'heat' ? '✓ Heat Mode' : 'Peak Heat'}</span>
          </button>

          {/* 3. Low Walking Pill */}
          <button
            onClick={() => onReplan('fatigue')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'fatigue'
                ? 'bg-[#FAF0DF] border-2 border-[#B84A27] text-[#3B2316] ring-2 ring-[#D47A39]/30'
                : 'bg-[#FFFDF9] hover:bg-[#FAF6F0] border border-[#E6DAC6] hover:border-[#B84A27]/40 text-[#3B2316]'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-[#B84A27]" />
            <span>{activeFilter === 'fatigue' ? '✓ Low Walk' : 'Low Walking'}</span>
          </button>

          {/* 4. Avoid Rush Pill */}
          <button
            onClick={() => onReplan('crowded')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'crowded'
                ? 'bg-[#FAF0DF] border-2 border-[#B84A27] text-[#3B2316] ring-2 ring-[#D47A39]/30'
                : 'bg-[#FFFDF9] hover:bg-[#FAF6F0] border border-[#E6DAC6] hover:border-[#B84A27]/40 text-[#3B2316]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#D47A39]" />
            <span>{activeFilter === 'crowded' ? '✓ Avoid Rush' : 'Avoid Rush'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
