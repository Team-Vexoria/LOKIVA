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
} from 'lucide-react';
import { DayFeasibilityMetrics, ReplanCondition } from '../../types/itinerary';

interface FeasibilityPanelProps {
  metrics: DayFeasibilityMetrics | null;
  dayNumber: number;
  onReplan: (condition: ReplanCondition) => void;
  isReplanning?: boolean;
}

export function FeasibilityPanel({
  metrics,
  dayNumber,
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
    costBreakdown,
  } = metrics;

  const totalTimeHours = Math.round(((totalSightseeingMinutes + totalTransitMinutes) / 60) * 10) / 10;

  return (
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#E5DFD5] p-5 sm:p-6 space-y-5 shadow-sm text-ink">
      {/* Header Barometer */}
      <div className="space-y-3 pb-4 border-b border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C1443B]">
            AI Feasibility Solver · Day {dayNumber}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-dusk block">Sightseeing</span>
            <span className="text-sm font-bold font-mono text-ink">
              {Math.floor(totalSightseeingMinutes / 60)}h {totalSightseeingMinutes % 60}m
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-dusk block">Transit Time</span>
            <span className="text-sm font-bold font-mono text-ink">
              {totalTransitMinutes} mins ({totalTransitDistanceKm} km)
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-dusk block">Step Count</span>
            <span className="text-sm font-bold font-mono text-ink flex items-center gap-1">
              <Footprints className="w-3.5 h-3.5 text-[#C1443B]" />
              <span>{estimatedWalkingSteps.toLocaleString()}</span>
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-[#E5DFD5] space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-dusk block">Local Impact</span>
            <span className="text-sm font-bold font-mono text-emerald-700">
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

      {/* 1-Click Dynamic Smart Replanner Triggers */}
      <div className="space-y-2.5 pt-2 border-t border-[#E5DFD5]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase font-bold text-dusk">
            1-Click Adaptive Re-Planner:
          </span>
          <span className="text-[10px] font-mono text-[#C1443B]">Live Auto Solver</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onReplan('rain')}
            disabled={isReplanning}
            className="p-2.5 bg-white hover:bg-sky-50 border border-[#E5DFD5] hover:border-sky-300 rounded-xl text-xs font-heading font-bold text-ink flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Umbrella className="w-3.5 h-3.5 text-sky-600" />
            <span>It is Raining</span>
          </button>

          <button
            onClick={() => onReplan('heat')}
            disabled={isReplanning}
            className="p-2.5 bg-white hover:bg-amber-50 border border-[#E5DFD5] hover:border-amber-300 rounded-xl text-xs font-heading font-bold text-ink flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>Peak Heat</span>
          </button>

          <button
            onClick={() => onReplan('fatigue')}
            disabled={isReplanning}
            className="p-2.5 bg-white hover:bg-emerald-50 border border-[#E5DFD5] hover:border-emerald-300 rounded-xl text-xs font-heading font-bold text-ink flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Footprints className="w-3.5 h-3.5 text-emerald-600" />
            <span>Low Walking</span>
          </button>

          <button
            onClick={() => onReplan('crowded')}
            disabled={isReplanning}
            className="p-2.5 bg-white hover:bg-purple-50 border border-[#E5DFD5] hover:border-purple-300 rounded-xl text-xs font-heading font-bold text-ink flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Avoid Rush</span>
          </button>
        </div>
      </div>
    </div>
  );
}
