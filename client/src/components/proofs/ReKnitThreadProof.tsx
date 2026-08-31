import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { Umbrella, Sun, MapPin, CheckCircle2 } from 'lucide-react';

interface StopNode {
  id: string;
  title: string;
  area: string;
  category: string;
  duration: string;
  price: string;
  isIndoor: boolean;
  whyThis: string;
}

export function ReKnitThreadProof() {
  const [isRaining, setIsRaining] = useState(false);
  const [generation, setGeneration] = useState(1);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Stop 1 & Stop 3 remain constant anchor stops in Bandra
  const stop1: StopNode = {
    id: 'stop-1',
    title: 'Ranwar Village Heritage Stroll & Pao Tasting',
    area: 'Bandra West',
    category: 'Culture & Food',
    duration: '50 mins',
    price: '₹350 / pax',
    isIndoor: false,
    whyThis: 'Step-free pavement, 5 mins from hotel',
  };

  const stop3: StopNode = {
    id: 'stop-3',
    title: 'Chimbai Seated Coastal Tea Room',
    area: 'Chimbai, Bandra',
    category: 'Culinary Heritage',
    duration: '40 mins',
    price: '₹300 / pax',
    isIndoor: true,
    whyThis: 'Ground floor seating, fits budget ceiling',
  };

  // Stop 2 swaps on rain trigger
  const outdoorStop2: StopNode = {
    id: 'stop-2-outdoor',
    title: 'Bandstand Open-Air Seaside Architecture Trail',
    area: 'Bandstand, Bandra',
    category: 'Architecture Walk',
    duration: '45 mins',
    price: '₹250 / pax',
    isIndoor: false,
    whyThis: 'Seaside breeze, wheelchair-paved promenade',
  };

  const indoorStop2: StopNode = {
    id: 'stop-2-indoor',
    title: 'Pali Hill Indigo & Hand-Block Printing Atelier',
    area: 'Pali Hill, Bandra',
    category: 'Artisan Workshop',
    duration: '50 mins',
    price: '₹450 / pax',
    isIndoor: true,
    whyThis: '100% sheltered studio, ramp access, zero rain exposure',
  };

  const activeStop2 = isRaining ? indoorStop2 : outdoorStop2;
  const totalCost = isRaining ? '₹1,100' : '₹900';
  const totalTime = isRaining ? '1 hr 50 min' : '1 hr 45 min';

  const handleToggle = () => {
    const nextState = !isRaining;
    setIsRaining(nextState);
    setGeneration((g) => g + 1);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !pathRef.current) return;

    const path = pathRef.current;
    const length = path.getTotalLength ? path.getTotalLength() : 400;

    gsap.killTweensOf(path);
    gsap.set(path, {
      strokeDasharray: '6 6',
      strokeDashoffset: length,
      opacity: 0.4,
    });

    gsap.to(path, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 0.45,
      ease: 'back.out(1.4)',
    });
  };

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength ? path.getTotalLength() : 400;
    gsap.fromTo(
      path,
      { strokeDasharray: '6 6', strokeDashoffset: length, opacity: 0.3 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md text-ink relative overflow-hidden"
    >
      {/* Proof Label & Disruption Toggle Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
            Sharma Family Scenario: 2.0 hrs · ₹1,500 Budget
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
            {isRaining ? (
              <span className="text-clay flex items-center gap-2">
                <Umbrella className="w-5 h-5" />
                Live Plan B: Indoor Sheltered Route
              </span>
            ) : (
              <span>Dynamic Feasible Route in Bandra</span>
            )}
          </h3>
        </div>

        {/* The Single Disruption Toggle Button */}
        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all duration-200 flex items-center gap-2 shadow-sm ${
            isRaining
              ? 'bg-clay hover:bg-clay-600 text-white shadow-clay/20'
              : 'bg-paper-100 hover:bg-paper-200 text-ink border border-paper-300'
          }`}
        >
          {isRaining ? (
            <>
              <Sun className="w-4 h-4 text-marigold" />
              <span>Simulate: "Clear Skies"</span>
            </>
          ) : (
            <>
              <Umbrella className="w-4 h-4 text-clay" />
              <span className="text-clay font-bold">Simulate: "It just started raining"</span>
            </>
          )}
        </button>
      </div>

      {/* Constraints Status Bar (Mono) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-paper-100 rounded-2xl border border-paper-300">
          <span className="text-dusk block text-[10px] uppercase">Time Window</span>
          <strong className="text-marigold-700 text-sm">{totalTime}</strong>
          <span className="text-[10px] text-dusk block">/ 2.0 hrs cap</span>
        </div>
        <div className="p-3 bg-paper-100 rounded-2xl border border-paper-300">
          <span className="text-dusk block text-[10px] uppercase">Total Cost</span>
          <strong className="text-teal font-extrabold text-sm">{totalCost}</strong>
          <span className="text-[10px] text-dusk block">/ ₹1,500 budget</span>
        </div>
        <div className="p-3 bg-paper-100 rounded-2xl border border-paper-300">
          <span className="text-dusk block text-[10px] uppercase">Transit Buffers</span>
          <strong className="text-ink text-sm">~18 mins auto</strong>
          <span className="text-[10px] text-teal block">Included in solve</span>
        </div>
        <div className="p-3 bg-paper-100 rounded-2xl border border-paper-300">
          <span className="text-dusk block text-[10px] uppercase">Solver Status</span>
          <strong className="text-teal text-sm">Gen #{generation} Feasible</strong>
          <span className="text-[10px] text-dusk block">Rebuilt in 340ms</span>
        </div>
      </div>

      {/* The Visual ReKnit Thread Route with SVG Path */}
      <div className="relative pt-4 pb-2">
        {/* Responsive Desktop Connecting SVG Line */}
        <div className="hidden lg:block absolute top-1/2 left-12 right-12 -translate-y-8 pointer-events-none z-0">
          <svg className="w-full h-8 overflow-visible" preserveAspectRatio="none">
            <path
              ref={pathRef}
              d="M 50,16 Q 250,-10 450,16 T 850,16"
              fill="none"
              stroke="#F0A63B"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="animate-reknit"
            />
          </svg>
        </div>

        {/* 3 Stop Nodes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
          {/* Stop 1 (Anchor) */}
          <div className="bg-paper-50 rounded-2xl border border-paper-300 p-4 space-y-2.5 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-dusk uppercase text-[10px]">Stop 1: {stop1.category}</span>
                <span className="font-bold text-ink">{stop1.price}</span>
              </div>
              <h4 className="text-sm font-display font-bold text-ink leading-snug">
                {stop1.title}
              </h4>
            </div>
            <div className="text-[11px] font-mono text-dusk flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-marigold" />
              <span>{stop1.area} · {stop1.duration}</span>
            </div>
            <div className="p-2 bg-paper-200/80 rounded-xl text-[10px] text-teal-800 font-sans flex items-start gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal flex-shrink-0 mt-0.5" />
              <span>{stop1.whyThis}</span>
            </div>
          </div>

          {/* Stop 2 (The Dynamic Re-Knit Node) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStop2.id}
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: -8 }}
              transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
              className={`rounded-2xl border p-4 space-y-2.5 shadow-md flex flex-col justify-between transition-colors ${
                isRaining
                  ? 'bg-clay-50 border-clay-300'
                  : 'bg-paper-50 border-paper-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={`uppercase text-[10px] font-bold ${isRaining ? 'text-clay' : 'text-dusk'}`}>
                    Stop 2: {isRaining ? 'Indoor Re-knit' : activeStop2.category}
                  </span>
                  <span className="font-bold text-ink">{activeStop2.price}</span>
                </div>
                <h4 className="text-sm font-display font-bold text-ink leading-snug">
                  {activeStop2.title}
                </h4>
              </div>
              <div className="text-[11px] font-mono text-dusk flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-marigold" />
                <span>{activeStop2.area} · {activeStop2.duration}</span>
              </div>
              <div
                className={`p-2 rounded-xl text-[10px] font-sans flex items-start gap-1 ${
                  isRaining ? 'bg-clay-100 text-clay-900' : 'bg-paper-200/80 text-teal-800'
                }`}
              >
                <CheckCircle2
                  className={`w-3 h-3 flex-shrink-0 mt-0.5 ${
                    isRaining ? 'text-clay' : 'text-teal'
                  }`}
                />
                <span>{activeStop2.whyThis}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stop 3 (Anchor) */}
          <div className="bg-paper-50 rounded-2xl border border-paper-300 p-4 space-y-2.5 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-dusk uppercase text-[10px]">Stop 3: {stop3.category}</span>
                <span className="font-bold text-ink">{stop3.price}</span>
              </div>
              <h4 className="text-sm font-display font-bold text-ink leading-snug">
                {stop3.title}
              </h4>
            </div>
            <div className="text-[11px] font-mono text-dusk flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-marigold" />
              <span>{stop3.area} · {stop3.duration}</span>
            </div>
            <div className="p-2 bg-paper-200/80 rounded-xl text-[10px] text-teal-800 font-sans flex items-start gap-1">
              <CheckCircle2 className="w-3 h-3 text-teal flex-shrink-0 mt-0.5" />
              <span>{stop3.whyThis}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
