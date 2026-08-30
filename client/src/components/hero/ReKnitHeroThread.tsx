import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, MapPin, CheckCircle2, ShieldCheck, AlertCircle, ArrowRight, RefreshCw, Umbrella, Sun } from 'lucide-react';

export function ReKnitHeroThread() {
  const [isRaining, setIsRaining] = useState(false);
  const [generation, setGeneration] = useState(1);

  const toggleWeather = () => {
    setIsRaining(!isRaining);
    setGeneration((g) => g + 1);
  };

  // Scenario 1: Sunny / Default (Sharma family in Bandra)
  const sunnyPlan = {
    title: 'Sunny Stroll Plan',
    generationLabel: 'Plan Generation #1 — Feasible',
    totalTime: '1 hr 50 min',
    timeBudget: '2.0 hrs available',
    totalCost: '₹750',
    budgetCap: '₹1,500 budget',
    feasibilityScore: 98,
    stops: [
      {
        id: 1,
        title: 'Ranwar Village Heritage Stroll & Pao Tasting',
        area: 'Bandra West, Mumbai',
        category: 'Culture & Food',
        duration: '50 mins',
        price: '₹350 / pax',
        distance: '250m away',
        whyThis: 'Step-free pavement, 5 mins from your location, fits 2h window',
        isIndoor: false,
        icon: '🏛️',
      },
      {
        id: 2,
        title: 'Chimbai Seated Seaside Chai & Coastal Kebab Story',
        area: 'Chimbai, Bandra',
        category: 'Food Walk',
        duration: '45 mins',
        price: '₹400 / pax',
        distance: '450m away',
        whyThis: 'Ground floor seating, family friendly, under ₹1,500 ceiling',
        isIndoor: false,
        icon: '☕',
      },
    ],
    transitMins: 15,
  };

  // Scenario 2: Rain Disruption (Instant Plan B Re-knit)
  const rainPlan = {
    title: 'Rain-Adapted Indoor Route',
    generationLabel: `Plan Generation #${generation} — Re-knit in 340ms`,
    totalTime: '1 hr 45 min',
    timeBudget: '2.0 hrs available',
    totalCost: '₹800',
    budgetCap: '₹1,500 budget',
    feasibilityScore: 100,
    stops: [
      {
        id: 3,
        title: 'Sheltered Hand-Block Printing & Indigo Atelier',
        area: 'Pali Hill, Bandra',
        category: 'Artisan Workshop',
        duration: '55 mins',
        price: '₹450 / pax',
        distance: '300m away',
        whyThis: '100% indoor covered studio, ramp access, zero rain exposure',
        isIndoor: true,
        icon: '🎨',
      },
      {
        id: 4,
        title: 'Bandra Heritage Tea Room & Portuguese Sweets',
        area: 'Chapel Road, Bandra',
        category: 'Culinary Heritage',
        duration: '35 mins',
        price: '₹350 / pax',
        distance: '200m away',
        whyThis: 'Indoor seating, warm herbal spices, fits family pacing',
        isIndoor: true,
        icon: '🫖',
      },
    ],
    transitMins: 10,
  };

  const activePlan = isRaining ? rainPlan : sunnyPlan;

  return (
    <div className="w-full bg-ink text-paper-50 rounded-3xl p-6 sm:p-8 border border-ink-700 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Decorative subtle ambient backdrop */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-marigold/10 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

      {/* Header with Scenario Context & Disruption Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-ink-700/80 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-teal/20 text-teal-100 border border-teal/40">
              Live Constraint Solver
            </span>
            <span className="text-xs text-dusk-200 font-mono">
              The Sharma Family · Bandra · Wheelchair access
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
            {isRaining ? (
              <span className="text-clay-100 flex items-center gap-2">
                <Umbrella className="w-5 h-5 text-clay" />
                Live Plan B: Indoor Sheltered Route
              </span>
            ) : (
              <span className="flex items-center gap-2 text-white">
                <Sun className="w-5 h-5 text-marigold" />
                Feasible 2-Hour Plan
              </span>
            )}
          </h3>
        </div>

        {/* The Disruption Trigger Button */}
        <button
          onClick={toggleWeather}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg ${
            isRaining
              ? 'bg-clay hover:bg-clay-600 text-white shadow-clay/30 animate-pulse'
              : 'bg-paper text-ink hover:bg-white border border-paper-300'
          }`}
        >
          {isRaining ? (
            <>
              <Sun className="w-4 h-4 text-marigold" />
              <span>Switch Back to Clear Skies</span>
            </>
          ) : (
            <>
              <Umbrella className="w-4 h-4 text-clay" />
              <span className="text-ink font-bold">Simulate: "It just started raining"</span>
            </>
          )}
        </button>
      </div>

      {/* Constraints Status Bar (Mono Numbers) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="bg-ink-800/90 p-3 rounded-xl border border-ink-700">
          <span className="text-dusk-200 block text-[10px] uppercase">Time Window</span>
          <span className="text-marigold font-bold text-sm">{activePlan.totalTime}</span>
          <span className="text-[10px] text-dusk-200 block">/ {activePlan.timeBudget}</span>
        </div>
        <div className="bg-ink-800/90 p-3 rounded-xl border border-ink-700">
          <span className="text-dusk-200 block text-[10px] uppercase">Total Cost</span>
          <span className="text-teal-100 font-bold text-sm">{activePlan.totalCost}</span>
          <span className="text-[10px] text-dusk-200 block">/ {activePlan.budgetCap}</span>
        </div>
        <div className="bg-ink-800/90 p-3 rounded-xl border border-ink-700">
          <span className="text-dusk-200 block text-[10px] uppercase">Transit Buffer</span>
          <span className="text-white font-bold text-sm">~{activePlan.transitMins} mins auto</span>
          <span className="text-[10px] text-teal-100 block">✓ Included in solve</span>
        </div>
        <div className="bg-ink-800/90 p-3 rounded-xl border border-ink-700">
          <span className="text-dusk-200 block text-[10px] uppercase">Solver Score</span>
          <span className="text-emerald-400 font-bold text-sm">{activePlan.feasibilityScore}% Fit</span>
          <span className="text-[10px] text-dusk-200 block">{activePlan.generationLabel}</span>
        </div>
      </div>

      {/* The Animated ReKnit Thread Sequence */}
      <div className="relative pt-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={generation}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 relative"
          >
            {activePlan.stops.map((stop, idx) => (
              <div
                key={stop.id}
                className="bg-ink-800/90 rounded-2xl border border-ink-700 p-5 space-y-3 relative hover:border-marigold/40 transition flex flex-col justify-between"
              >
                {/* Node Top Indicator */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{stop.icon}</span>
                    <div>
                      <span className="text-[10px] font-mono text-dusk-200 uppercase tracking-wider block">
                        Stop {idx + 1} · {stop.category}
                      </span>
                      <h4 className="text-base font-display font-bold text-white leading-tight">
                        {stop.title}
                      </h4>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-lg bg-ink-950 text-marigold font-mono text-xs font-bold border border-ink-700 flex-shrink-0">
                    {stop.price}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-dusk-200">
                  <span className="flex items-center gap-1 text-paper-100">
                    <MapPin className="w-3.5 h-3.5 text-marigold" /> {stop.area}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-dusk-200" /> {stop.duration}
                  </span>
                  <span>•</span>
                  <span>{stop.distance}</span>
                </div>

                {/* "Why This For You" Explainability Sentence */}
                <div className="p-2.5 bg-ink-950/80 rounded-xl border border-ink-700/80 text-[11px] text-teal-100 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Why this fits:</strong> {stop.whyThis}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Live Promise Statement */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs text-dusk-200 border-t border-ink-700/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-marigold" />
          <span>Every pick is mathematically feasibility-checked against distance, budget, and accessibility.</span>
        </div>
        <span className="text-[11px] font-mono text-dusk-200 mt-2 sm:mt-0">
          Deterministic greedy + backtracking solver
        </span>
      </div>
    </div>
  );
}
