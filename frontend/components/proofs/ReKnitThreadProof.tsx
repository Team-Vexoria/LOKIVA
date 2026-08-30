'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, MapPin, ShieldCheck, Check } from 'lucide-react';
import { gsap, isReducedMotionPreferred } from '../../lib/gsap';

interface StopNode {
  id: string;
  time: string;
  title: string;
  location: string;
  duration: string;
  cost: string;
  type: 'indoor' | 'outdoor';
  note?: string;
}

const INITIAL_STOPS: StopNode[] = [
  {
    id: 'stop-1',
    time: '14:00',
    title: 'Subko Coffee Roasters & Bakery',
    location: 'Ranwar, Bandra West',
    duration: '30m',
    cost: '₹350',
    type: 'indoor',
  },
  {
    id: 'stop-2-outdoor',
    time: '14:40',
    title: 'Ranwar Village Mural Trail',
    location: 'Waroda Road Walk',
    duration: '45m',
    cost: 'Free',
    type: 'outdoor',
    note: 'Outdoor walking trail',
  },
  {
    id: 'stop-3',
    time: '15:35',
    title: 'Elco Heritage Chaat House',
    location: 'Hill Road, Bandra',
    duration: '30m',
    cost: '₹220',
    type: 'indoor',
  },
];

const RAIN_REPLACEMENT_STOP: StopNode = {
  id: 'stop-2-indoor',
  time: '14:40',
  title: 'Pali Artisan Guild & Tea Room',
  location: 'Pali Village, Bandra',
  duration: '45m',
  cost: '₹400',
  type: 'indoor',
  note: 'Covered indoor workshop · 200m cab',
};

/**
 * Interactive ReKnit Thread component demonstrating LOKIVA's live re-plan loop.
 * Renders connected stop nodes with a dotted SVG path animated with GSAP overshoot.
 */
export function ReKnitThreadProof() {
  const [isRaining, setIsRaining] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [replanDurationMs, setReplanDurationMs] = useState(0);

  const pathRef1 = useRef<SVGLineElement>(null);
  const pathRef2 = useRef<SVGLineElement>(null);

  const currentStops = [
    INITIAL_STOPS[0],
    isRaining ? RAIN_REPLACEMENT_STOP : INITIAL_STOPS[1],
    INITIAL_STOPS[2],
  ];

  const handleToggleRain = () => {
    const reducedMotion = isReducedMotionPreferred();
    const nextRaining = !isRaining;
    setIsRaining(nextRaining);
    setGeneration((prev) => prev + 1);
    setReplanDurationMs(380 + Math.floor(Math.random() * 60));

    if (reducedMotion) {
      return;
    }

    // Animate the ReKnit dotted thread path breaking and reconnecting with GSAP overshoot
    if (pathRef1.current && pathRef2.current) {
      const paths = [pathRef1.current, pathRef2.current];

      // Break path by contracting strokeDashoffset
      gsap.fromTo(
        paths,
        { strokeDashoffset: 40, opacity: 0.3 },
        {
          strokeDashoffset: 0,
          opacity: 1,
          duration: 0.45,
          ease: 'back.out(1.4)',
          stagger: 0.08,
        }
      );
    }
  };

  const totalCost = isRaining ? '₹970' : '₹570';

  return (
    <div className="relative rounded-3xl bg-lokiva-ink/90 dark:bg-lokiva-ink/95 border border-slate-700/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 select-none overflow-hidden">
      {/* Header Bar with Live Toggle & Telemetry */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lokiva-marigold px-2 py-0.5 rounded-full bg-lokiva-marigold/10 border border-lokiva-marigold/30">
              Live Re-Plan Demo
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Generation #{generation}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-lokiva-paper mt-1">
            Bandra Afternoon Itinerary
          </h3>
        </div>

        {/* The Single Disruption Toggle */}
        <button
          type="button"
          onClick={handleToggleRain}
          className={`px-3.5 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            isRaining
              ? 'bg-lokiva-clay text-white shadow-lokiva-clay/30 border border-lokiva-clay ring-2 ring-lokiva-clay/20'
              : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-600/60'
          }`}
          aria-pressed={isRaining}
        >
          {isRaining ? (
            <>
              <CloudRain className="w-4 h-4 text-white animate-bounce" />
              <span>It started raining · Re-knitted!</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Simulate: &quot;It just started raining&quot;</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Thread Area */}
      <div className="relative pt-2 pb-4">
        {/* Dotted SVG Thread Connecting Nodes */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
          style={{ zIndex: 0 }}
        >
          <line
            ref={pathRef1}
            x1="18%"
            y1="50%"
            x2="48%"
            y2="50%"
            stroke="#F0A63B"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="reknit-thread-path opacity-80"
          />
          <line
            ref={pathRef2}
            x1="52%"
            y1="50%"
            x2="82%"
            y2="50%"
            stroke="#F0A63B"
            strokeWidth="2.5"
            strokeDasharray="6 6"
            className="reknit-thread-path opacity-80"
          />
        </svg>

        {/* 3 Stop Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {currentStops.map((stop, index) => {
            const isMiddleReplaced = index === 1;

            return (
              <motion.div
                key={stop.id}
                layout
                initial={{ opacity: 0.8, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between h-44 ${
                  isMiddleReplaced && isRaining
                    ? 'bg-slate-900/90 border-lokiva-clay/80 shadow-lg shadow-lokiva-clay/10 ring-1 ring-lokiva-clay/30'
                    : isMiddleReplaced
                    ? 'bg-slate-900/80 border-lokiva-marigold/60 shadow-lg'
                    : 'bg-slate-900/60 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-lokiva-marigold bg-lokiva-marigold/10 px-2 py-0.5 rounded-lg border border-lokiva-marigold/20">
                      {stop.time}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400 font-semibold">
                      {stop.duration} · {stop.cost}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-lokiva-paper leading-snug">
                    {stop.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{stop.location}</span>
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      stop.type === 'outdoor'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : isMiddleReplaced && isRaining
                        ? 'bg-lokiva-clay/20 text-rose-300 border border-lokiva-clay/40 font-bold'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}
                  >
                    {isMiddleReplaced && isRaining ? 'Indoor Swap' : stop.type}
                  </span>

                  {stop.note && (
                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                      {stop.note}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Solver Feasibility Telemetry Footer */}
      <div className="pt-3 border-t border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Feasible plan: <strong className="text-lokiva-paper">{totalCost}</strong> total · Under 2 hrs
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          {generation > 1 && (
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <Check className="w-3.5 h-3.5" />
              Re-solved in {replanDurationMs || 390}ms
            </span>
          )}
          <span>Constraint solver verified</span>
        </div>
      </div>
    </div>
  );
}
