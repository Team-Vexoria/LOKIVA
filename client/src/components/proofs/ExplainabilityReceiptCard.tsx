import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Star, Clock, MapPin, ShieldCheck, FileText, ArrowUpRight } from 'lucide-react';

export function ExplainabilityReceiptCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md text-ink">
      {/* Proof Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              Interactive Proof 03 · Explainability
            </span>
            <span className="text-[11px] font-mono text-dusk">
              Hover/Tap Card to Inspect Proof Receipt
            </span>
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

          {/* Foreground Experience Card */}
          <motion.div
            animate={{
              y: isHovered ? 40 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative z-10 bg-white rounded-3xl border border-paper-400 p-6 space-y-4 shadow-lg hover:border-ink/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                    Artisan Workshop
                  </span>
                  <span className="text-dusk flex items-center gap-1 font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-marigold" />
                    Pali Hill, Bandra West
                  </span>
                </div>
                <h4 className="text-lg font-display font-bold text-ink">
                  Sanganeri Hand-Block Printing Atelier
                </h4>
              </div>

              <span className="px-3 py-1 bg-ink text-marigold font-mono text-xs font-extrabold rounded-xl">
                ₹350 / pax
              </span>
            </div>

            <p className="text-xs text-dusk-600 font-sans leading-relaxed">
              Hands-on botanical indigo stamping masterclass guided by 5th-generation Rajasthani textile artisans residing in Bandra.
            </p>

            <div className="pt-3 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3 text-dusk">
                <span className="flex items-center gap-1 text-ink font-bold">
                  <Star className="w-3.5 h-3.5 text-marigold fill-marigold" /> 4.9 (42)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 50 mins
                </span>
              </div>

              <span className="text-[11px] font-bold text-teal flex items-center gap-1 group-hover:underline">
                {isHovered ? '✓ Receipt Revealed' : 'Hover to Inspect Match'}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
