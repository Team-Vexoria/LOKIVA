'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Sparkles, MapPin, Clock, Coins, Star, FileText, ChevronUp } from 'lucide-react';
import { isReducedMotionPreferred } from '../../lib/gsap';

interface ExplainabilityReceiptCardProps {
  title?: string;
  category?: string;
  location?: string;
  price?: string;
  duration?: string;
  rating?: number;
  explanation?: string;
  contextTag?: string;
}

/**
 * Interactive card demonstrating LOKIVA's explainability module (ARCHITECTURE.md §5).
 * On hover or tap, slides out an honest, rule-based proof-of-work receipt from behind the card.
 */
export function ExplainabilityReceiptCard({
  title = 'Pali Portuguese Bakery & Heritage Tasting',
  category = 'Food & Culture',
  location = 'Pali Village, Bandra West',
  price = '₹450 for 3',
  duration = '45 mins',
  rating = 4.9,
  explanation = 'Picked because: fits your 2 hr window, 350m away, 4.9★ for family groups, within ₹1,500 budget ceiling.',
  contextTag = 'Sharma Family · 2h window · ₹1,500 budget',
}: ExplainabilityReceiptCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const reducedMotion = isReducedMotionPreferred();

  return (
    <div className="relative select-none">
      {/* Outer wrapper with mouse hover and focus listeners */}
      <div
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsRevealed(true)}
        onMouseLeave={() => setIsRevealed(false)}
        onClick={() => setIsRevealed((prev) => !prev)}
        onFocus={() => setIsRevealed(true)}
        onBlur={() => setIsRevealed(false)}
        tabIndex={0}
        role="region"
        aria-label={`Experience card for ${title}`}
      >
        {/* Main Experience Card (Front Layer) */}
        <div className="relative z-20 rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-xl transition-all group-hover:border-lokiva-marigold/60 group-hover:shadow-2xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-lokiva-marigold/10 text-lokiva-marigold border border-lokiva-marigold/20 font-mono">
              {category}
            </span>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          </div>

          <h3 className="text-base sm:text-lg font-bold font-display text-lokiva-paper group-hover:text-lokiva-marigold transition-colors">
            {title}
          </h3>

          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{location}</span>
          </p>

          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{duration}</span>
              <span className="text-slate-600">·</span>
              <Coins className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-lokiva-paper">{price}</span>
            </div>

            <span className="text-[11px] font-semibold text-lokiva-marigold flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              <span>{isRevealed ? 'Inspecting proof' : 'Hover for proof'}</span>
            </span>
          </div>
        </div>

        {/* The Slide-Out Solver Proof Receipt (Behind Layer) */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -20, scale: 0.96 }}
              animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 12, scale: 1 }}
              exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 -mt-2 rounded-2xl bg-lokiva-ink border border-lokiva-marigold/40 p-4 shadow-2xl space-y-3"
            >
              {/* Receipt Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 font-mono text-[11px]">
                <span className="text-lokiva-marigold font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-lokiva-marigold" />
                  <span>Solver Justification Receipt</span>
                </span>
                <span className="text-slate-400">{contextTag}</span>
              </div>

              {/* Exact Honest Explanation Template from ARCHITECTURE.md §5 */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                <strong className="text-lokiva-marigold font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                  Template Signal:
                </strong>
                &ldquo;{explanation}&rdquo;
              </div>

              {/* Deterministic Scoring Signals */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px] text-slate-300">
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Cosine Similarity</span>
                  <span className="text-emerald-400 font-bold">0.94 (Food & Heritage)</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Walking Distance</span>
                  <span className="text-lokiva-paper font-bold">350m (4 mins, step-free)</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Accessibility Pre-Filter</span>
                  <span className="text-emerald-400 font-bold">Passed (Ground Floor)</span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block">Packing Feasibility</span>
                  <span className="text-emerald-400 font-bold">100% Feasible</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
