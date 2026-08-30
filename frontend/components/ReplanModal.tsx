'use client';

import React, { useState } from 'react';
import {
  CloudRain,
  AlertOctagon,
  Clock,
  Coins,
  Sparkles,
  X,
  ArrowRight,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface ReplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteReplan: (scenario: string, params?: { new_budget?: number; new_duration_mins?: number }) => Promise<void>;
  isLoading?: boolean;
}

export function ReplanModal({
  isOpen,
  onClose,
  onExecuteReplan,
  isLoading = false
}: ReplanModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('weather_rain');
  const [customBudget, setCustomBudget] = useState<number>(1000);
  const [customDuration, setCustomDuration] = useState<number>(120);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'weather_rain',
      icon: CloudRain,
      title: 'Simulate Rain Alert',
      tagline: 'Outdoor stops detected · Swap with indoor cultural gems',
      badge: 'Weather Scenario',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/40 text-blue-600 dark:text-blue-400',
      description: 'LOKIVA detects an upcoming rain forecast and replaces exposed outdoor activities with indoor covered workshops or royal heritage galleries while keeping transit time and budget intact.'
    },
    {
      id: 'activity_unavailable',
      icon: AlertOctagon,
      title: 'Simulate Activity Sold Out',
      tagline: 'Capacity hit · Hot-swap with verified alternative',
      badge: 'Availability Scenario',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400',
      description: 'Simulates a sudden booking capacity limit on a scheduled stop. LOKIVA instantly queries the database to find the closest verified provider in the same category and neighborhood.'
    },
    {
      id: 'reduced_time',
      icon: Clock,
      title: 'Simulate Shortened Time (4h → 2h)',
      tagline: 'Time cut · Re-balance schedule to prevent rushing',
      badge: 'Schedule Tightening',
      color: 'from-purple-500/10 to-rose-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400',
      description: 'Traveler needs to wrap up earlier for a train or dinner. LOKIVA eliminates lower-priority distant stops and tightens the schedule to fit within 2 hours.'
    },
    {
      id: 'reduced_budget',
      icon: Coins,
      title: 'Simulate Budget Constraint Drop',
      tagline: 'Budget capped · Swap high-ticket stops with low-cost gems',
      badge: 'Budget Re-optimization',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400',
      description: 'Reduces the total itinerary cost to fit within a strict budget while maintaining an authentic cultural vibe.'
    }
  ];

  const handleReplan = async () => {
    const params: { new_budget?: number; new_duration_mins?: number } = {};
    if (selectedScenario === 'reduced_budget') {
      params.new_budget = customBudget;
    }
    if (selectedScenario === 'reduced_time') {
      params.new_duration_mins = customDuration;
    }
    await onExecuteReplan(selectedScenario, params);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                Dynamic Re-Plan Engine
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Live Heuristics</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Simulate Real-World Travel Disruptions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a disruption to test how LOKIVA dynamically adapts your timeline, transit, and bookings.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disruption Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = selectedScenario === sc.id;

            return (
              <div
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `bg-gradient-to-br ${sc.color} ring-2 ring-orange-500/60 shadow-lg scale-[1.02]`
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      {sc.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{sc.title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{sc.tagline}</p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-500">
                  {sc.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Input Controls if specific scenarios selected */}
        {selectedScenario === 'reduced_budget' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Target Budget:</span>
            <div className="flex items-center gap-2">
              {[500, 1000, 1500].map((b) => (
                <button
                  key={b}
                  onClick={() => setCustomBudget(b)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    customBudget === b
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ₹{b}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedScenario === 'reduced_time' && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">New Available Time:</span>
            <div className="flex items-center gap-2">
              {[90, 120, 180].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setCustomDuration(mins)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    customDuration === mins
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mins / 60} hrs
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReplan}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 text-white font-bold text-xs shadow-lg shadow-orange-500/25 hover:opacity-95 transition-all hover:scale-105 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recalculating Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute Re-Plan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
