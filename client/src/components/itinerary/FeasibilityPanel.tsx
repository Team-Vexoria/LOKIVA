import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  MapPin,
  RefreshCw,
  Umbrella,
  Activity,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { FeasibilityResult } from '../../types';

interface FeasibilityPanelProps {
  feasibility: FeasibilityResult | null;
  onReplan: (reason: string) => void;
  isReplanning?: boolean;
}

export function FeasibilityPanel({
  feasibility,
  onReplan,
  isReplanning = false,
}: FeasibilityPanelProps) {
  if (!feasibility) {
    return (
      <div className="bg-white rounded-3xl border border-paper-400 p-6 text-center space-y-2 shadow-sm font-mono text-xs text-dusk">
        <span>Calculating feasibility matrix...</span>
      </div>
    );
  }

  const isFeasible = feasibility.is_feasible;
  const score = feasibility.score || 94;

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 space-y-6 shadow-lg text-ink">
      {/* Top Status & Score Gauge */}
      <div className="space-y-3 pb-4 border-b border-paper-300">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal">
            Constraint Solver Engine
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
              isFeasible
                ? 'bg-teal-50 text-teal-700 border-teal-200'
                : 'bg-clay-50 text-clay border-clay-200'
            }`}
          >
            {isFeasible ? '✓ Plan Feasible' : '⚠ Tight Schedule'}
          </span>
        </div>

        {/* Score Ring / Bar */}
        <div className="space-y-1 font-mono">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-dusk uppercase">Feasibility Confidence</span>
            <span className="text-2xl font-extrabold text-ink">{score}%</span>
          </div>
          <div className="w-full h-2.5 bg-paper-300 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                score > 80 ? 'bg-teal' : score > 60 ? 'bg-marigold' : 'bg-clay'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Constraints Breakdown Grid (Mono) */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 space-y-0.5">
          <span className="text-dusk block text-[10px] uppercase">Total Duration</span>
          <strong className="text-ink text-sm">
            {Math.floor(feasibility.total_duration_mins / 60)}h{' '}
            {feasibility.total_duration_mins % 60}m
          </strong>
          <span className="text-[10px] text-dusk block">including transit</span>
        </div>

        <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 space-y-0.5">
          <span className="text-dusk block text-[10px] uppercase">Total Cost</span>
          <strong className="text-teal font-extrabold text-sm">
            ₹{feasibility.total_cost}
          </strong>
          <span className="text-[10px] text-dusk block">for whole group</span>
        </div>

        <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 space-y-0.5">
          <span className="text-dusk block text-[10px] uppercase">Total Transit</span>
          <strong className="text-ink text-sm">
            {feasibility.total_travel_mins} mins
          </strong>
          <span className="text-[10px] text-dusk block">~{feasibility.total_distance_km} km</span>
        </div>

        <div className="p-3 bg-paper-100 rounded-xl border border-paper-300 space-y-0.5">
          <span className="text-dusk block text-[10px] uppercase">Fatigue Pacing</span>
          <strong className="text-marigold-700 text-sm">
            {feasibility.fatigue_index || 'Low (Relaxed)'}
          </strong>
          <span className="text-[10px] text-teal block">✓ Senior Friendly</span>
        </div>
      </div>

      {/* Solver Observations */}
      {feasibility.warnings && feasibility.warnings.length > 0 && (
        <div className="p-3 bg-clay-50 border border-clay-200 rounded-2xl space-y-1 text-xs text-clay">
          <div className="font-mono font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Solver Advisory</span>
          </div>
          <ul className="list-disc list-inside text-[11px] space-y-0.5 text-dusk-700 font-sans">
            {feasibility.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* One-Tap Live Disruption Triggers */}
      <div className="pt-2 space-y-2.5">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-dusk block">
          Simulate Real-World Disruption (Live Re-Plan)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
          <button
            onClick={() => onReplan('weather_rain')}
            disabled={isReplanning}
            className="p-2.5 bg-clay-50 hover:bg-clay-100 text-clay border border-clay-300 rounded-xl text-left font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Umbrella className="w-4 h-4 flex-shrink-0" />
            <span>🌧️ Rain Alert (Indoor)</span>
          </button>

          <button
            onClick={() => onReplan('running_late')}
            disabled={isReplanning}
            className="p-2.5 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300 rounded-xl text-left font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Clock className="w-4 h-4 text-marigold flex-shrink-0" />
            <span>⏰ 30m Delay Reroute</span>
          </button>

          <button
            onClick={() => onReplan('low_walking')}
            disabled={isReplanning}
            className="p-2.5 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300 rounded-xl text-left font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-teal flex-shrink-0" />
            <span>🚶 Low Walking Mode</span>
          </button>

          <button
            onClick={() => onReplan('reduced_budget')}
            disabled={isReplanning}
            className="p-2.5 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300 rounded-xl text-left font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Coins className="w-4 h-4 text-marigold flex-shrink-0" />
            <span>💰 Cut ₹500 Budget</span>
          </button>
        </div>
      </div>
    </div>
  );
}
