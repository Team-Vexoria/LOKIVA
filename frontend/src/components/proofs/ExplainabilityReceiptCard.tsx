import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, FileText } from 'lucide-react';

export function ExplainabilityReceiptCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md text-ink">
      {/* Proof Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
            Explainability: Inspect Proof Receipt
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
            Deterministic "Why This For You" Layer
          </h3>
        </div>

        <span className="text-xs font-mono text-dusk bg-paper-100 px-3 py-1.5 rounded-xl border border-paper-300">
          Template Engine (Architecture §5)
        </span>
      </div>

      {/* Main Interactive Demo Container */}
      <div className="max-w-xl mx-auto py-2">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsHovered(!isHovered)}
          tabIndex={0}
          onFocus={() => setIsHovered(true)}
          onBlur={() => setIsHovered(false)}
          className="relative cursor-pointer group focus:outline-none"
        >
          {/* Background Slid-out "Proof-of-Work Receipt" */}
          <motion.div
            initial={false}
            animate={{
              y: isHovered ? -120 : 0,
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 0.98 : 0.95,
            }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute top-0 left-4 right-4 bg-ink text-paper rounded-2xl p-4 sm:p-5 border border-ink-700 shadow-xl font-mono text-xs z-0 space-y-2.5 pointer-events-none"
          >
            <div className="flex items-center justify-between text-[10px] text-dusk-200 border-b border-ink-700 pb-1.5">
              <span className="flex items-center gap-1 uppercase tracking-wider">
                <FileText className="w-3 h-3 text-marigold" /> Solver Match Audit Receipt
              </span>
              <span className="text-teal-100 font-bold">MATCH SCORE: 98%</span>
            </div>

            <p className="text-[11px] text-paper-50 font-sans leading-snug">
              <strong className="text-marigold font-mono">Picked because:</strong> fits your 2.0 hr window, 350m from hotel, step-free access for family, within ₹1,500 budget ceiling.
            </p>

            <div className="grid grid-cols-4 gap-2 text-[10px] text-dusk-200 pt-1">
              <div className="bg-ink-800 p-1.5 rounded-lg text-center">
                <span className="block text-[8px] text-dusk-300 uppercase">Window</span>
                <span className="text-white font-bold">50m / 120m</span>
              </div>
              <div className="bg-ink-800 p-1.5 rounded-lg text-center">
                <span className="block text-[8px] text-dusk-300 uppercase">Transit</span>
                <span className="text-white font-bold">8m auto</span>
              </div>
              <div className="bg-ink-800 p-1.5 rounded-lg text-center">
                <span className="block text-[8px] text-dusk-300 uppercase">Cost</span>
                <span className="text-teal-100 font-bold">₹350 ≤ ₹1500</span>
              </div>
              <div className="bg-ink-800 p-1.5 rounded-lg text-center">
                <span className="block text-[8px] text-dusk-300 uppercase">Access</span>
                <span className="text-emerald-400 font-bold">PASS (Ramp)</span>
              </div>
            </div>
          </motion.div>

          {/* Foreground Experience Card (Lifts on hover) */}
          <motion.div
            animate={{
              y: isHovered ? 24 : 0,
              boxShadow: isHovered
                ? '0 20px 25px -5px rgba(18, 33, 59, 0.15)'
                : '0 4px 6px -1px rgba(18, 33, 59, 0.05)',
            }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative bg-paper-50 rounded-2xl border border-paper-300 p-6 space-y-4 z-10 select-none"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                    Artisan Workshop
                  </span>
                  <span className="text-dusk">Pali Hill, Bandra</span>
                </div>
                <h4 className="text-lg font-display font-bold text-ink">
                  Indigo Vat Dyeing & Hand-Block Masterclass
                </h4>
              </div>

              <div className="text-right">
                <span className="text-sm font-mono font-bold text-teal block">₹350 / pax</span>
                <span className="text-[10px] font-mono text-dusk">50 mins</span>
              </div>
            </div>

            {/* Deterministic "Why This Fits You" Box */}
            <div className="p-3 bg-white rounded-xl border border-paper-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal" />
                <span>Why this fits your plan</span>
              </div>
              <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                "Selected because it fits your 2.0-hour window, is 350m from your hotel base, and features verified ground-floor ramp access for your group."
              </p>
            </div>

            {/* Hover Prompt Cue */}
            <div className="text-[11px] font-mono text-center text-dusk pt-1">
              {isHovered ? (
                <span className="text-marigold font-bold">Audit Receipt Revealed (Solver Proof-of-Work)</span>
              ) : (
                <span className="text-dusk-600">Hover or tap to reveal solver audit receipt</span>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
