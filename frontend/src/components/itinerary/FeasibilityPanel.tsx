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
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 sm:p-6 space-y-5 shadow-sm text-ink">
      {/* Top Header Barometer */}
      <div className="space-y-3 pb-4 border-b border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
              AI Feasibility Solver · Day {dayNumber}
            </span>
            {activeFilter !== 'none' && (
              <span className="px-2 py-0.5 rounded-full bg-[#12213B] text-white text-[10px] font-meta font-bold uppercase tracking-wider">
                Filter: {activeFilter}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeFilter !== 'none' && (
              <button
                onClick={() => onReplan('none')}
                className="text-[11px] font-meta text-[#C1443B] hover:underline flex items-center gap-1 cursor-pointer"
                title="Reset to original balanced schedule"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Day</span>
              </button>
            )}

            <span
              className={`px-3 py-1 rounded-full text-[11px] font-meta font-bold border ${
                paceScore >= 80
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : paceScore >= 60
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
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
          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-dusk block">Sightseeing</span>
            <span className="text-sm font-bold font-meta text-ink">
              {Math.floor(totalSightseeingMinutes / 60)}h {totalSightseeingMinutes % 60}m
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-dusk block">Transit Time</span>
            <span className="text-sm font-bold font-meta text-ink">
              {totalTransitMinutes} mins ({totalTransitDistanceKm} km)
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-dusk block">Step Count</span>
            <span className="text-sm font-bold font-meta text-ink flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#C1443B]" />
              <span>{estimatedWalkingSteps.toLocaleString()}</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5 shadow-2xs">
            <span className="text-[10px] font-meta uppercase text-dusk block">Local Impact</span>
            <span className="text-sm font-bold font-meta text-emerald-700">
              {localImpactScore}% Direct
            </span>
          </div>
        </div>
      </div>

      {/* Warnings & Domain Alerts */}
      {warnings.length > 0 && (
        <div className="space-y-2.5">
          <span className="text-[11px] font-mono uppercase font-bold text-dusk block">
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
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-blue-50 border-blue-200 text-blue-950'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      w.severity === 'critical'
                        ? 'text-rose-600'
                        : w.severity === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
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
      <div className="space-y-2.5 pt-2 border-t border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <span className="font-meta text-xs font-semibold tracking-wider uppercase text-dusk">
            1-Click Adaptive Re-Planner:
          </span>
          <span className="font-meta text-[11px] text-[#C1443B]">
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
                ? 'bg-sky-100 border-2 border-sky-600 text-sky-950 ring-2 ring-sky-300'
                : 'bg-white hover:bg-sky-50 border border-[#E5DFD5] hover:border-sky-300 text-ink'
            }`}
          >
            <Umbrella className="w-3.5 h-3.5 text-sky-600" />
            <span>{activeFilter === 'rain' ? '✓ Rain Mode' : 'It is Raining'}</span>
          </button>

          {/* 2. Peak Heat Pill */}
          <button
            onClick={() => onReplan('heat')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'heat'
                ? 'bg-amber-100 border-2 border-amber-600 text-amber-950 ring-2 ring-amber-300'
                : 'bg-white hover:bg-amber-50 border border-[#E5DFD5] hover:border-amber-300 text-ink'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>{activeFilter === 'heat' ? '✓ Heat Mode' : 'Peak Heat'}</span>
          </button>

          {/* 3. Low Walking Pill */}
          <button
            onClick={() => onReplan('fatigue')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'fatigue'
                ? 'bg-emerald-100 border-2 border-emerald-600 text-emerald-950 ring-2 ring-emerald-300'
                : 'bg-white hover:bg-emerald-50 border border-[#E5DFD5] hover:border-emerald-300 text-ink'
            }`}
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeFilter === 'fatigue' ? '✓ Low Walk' : 'Low Walking'}</span>
          </button>

          {/* 4. Avoid Rush Pill */}
          <button
            onClick={() => onReplan('crowded')}
            disabled={isReplanning}
            className={`p-2.5 rounded-xl font-meta text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50 ${
              activeFilter === 'crowded'
                ? 'bg-purple-100 border-2 border-purple-600 text-purple-950 ring-2 ring-purple-300'
                : 'bg-white hover:bg-purple-50 border border-[#E5DFD5] hover:border-purple-300 text-ink'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>{activeFilter === 'crowded' ? '✓ Avoid Rush' : 'Avoid Rush'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
