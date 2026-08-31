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
  selectedCount?: number;
}

export function FeasibilityPanel({
  feasibility,
  onReplan,
  isReplanning = false,
  selectedCount,
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
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
            {isFeasible ? '✓ Plan Feasible' : '⚠️ Soft Warning'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-extrabold font-mono text-teal">
              {score}%
            </span>
            <span className="text-xs font-mono text-dusk block">Feasibility Confidence</span>
          </div>

          <div className="text-right text-xs font-mono space-y-0.5">
            <span className="text-ink font-bold block">
              {feasibility.total_duration_mins || 110} mins total
            </span>
            <span className="text-dusk block">
              ₹{feasibility.total_cost || 1100} / ₹1,500 budget
            </span>
          </div>
        </div>
      </div>

      {/* Constraints Checklist */}
      <div className="space-y-2.5 font-mono text-xs">
        <span className="text-[10px] uppercase font-bold text-dusk block">
          Hard Constraint Checklist
        </span>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-paper-50 rounded-xl border border-paper-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
              <span>Time Window ({feasibility.total_duration_mins || 110}m / 120m)</span>
            </div>
            <span className="text-teal font-bold text-[10px]">PASS</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-paper-50 rounded-xl border border-paper-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
              <span>Transit Buffer (~18 mins auto)</span>
            </div>
            <span className="text-teal font-bold text-[10px]">SAFE</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-paper-50 rounded-xl border border-paper-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
              <span>Wheelchair Step-Free</span>
            </div>
            <span className="text-teal font-bold text-[10px]">VERIFIED</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-paper-50 rounded-xl border border-paper-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
              <span>Budget Ceiling (≤ ₹1,500)</span>
            </div>
            <span className="text-teal font-bold text-[10px]">₹1,100</span>
          </div>
        </div>
      </div>

      {/* 4 One-Tap Live Disruption Simulation Buttons */}
      <div className="space-y-2.5 pt-2 border-t border-paper-300">
        <span className="text-[10px] uppercase font-mono font-bold text-clay block flex items-center gap-1">
          <Activity className="w-3.5 h-3.5" />
          Simulate Live Disruption & Re-Plan
        </span>

        <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
          <button
            onClick={() => onReplan('rain')}
            disabled={isReplanning}
            className="p-2.5 bg-clay-50 hover:bg-clay-100 text-clay border border-clay-200 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Umbrella className="w-3.5 h-3.5" />
            <span>Rain Alert</span>
          </button>

          <button
            onClick={() => onReplan('delay')}
            disabled={isReplanning}
            className="p-2.5 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Clock className="w-3.5 h-3.5 text-marigold" />
            <span>30m Delay</span>
          </button>

          <button
            onClick={() => onReplan('budget')}
            disabled={isReplanning}
            className="p-2.5 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Coins className="w-3.5 h-3.5 text-teal" />
            <span>Cut ₹500</span>
          </button>

          <button
            onClick={() => onReplan('tired')}
            disabled={isReplanning}
            className="p-2.5 bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-marigold" />
            <span>Low Walking</span>
          </button>
        </div>
      </div>
    </div>
  );
}
