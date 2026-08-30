'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, CheckCircle2, XCircle, ShieldAlert, Sparkles, MapPin, Footprints } from 'lucide-react';
import { isReducedMotionPreferred } from '../../lib/gsap';

interface ExperienceCandidate {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  duration: string;
  wheelchairAccessible: boolean;
  accessibilityDetail: string;
  failureReason?: string;
}

const CANDIDATE_EXPERIENCES: ExperienceCandidate[] = [
  {
    id: 'exp-1',
    title: 'Subko Artisan Coffee & Roastery',
    category: 'Food & Culinary',
    location: 'Ranwar Village, Bandra',
    price: '₹350',
    duration: '30m',
    wheelchairAccessible: true,
    accessibilityDetail: 'Ground floor step-free entrance, wide doorways & accessible seating',
  },
  {
    id: 'exp-2',
    title: 'Mount Mary Basilica Historic Steps Climb',
    category: 'Heritage & Views',
    location: 'Bandra Hill',
    price: 'Free',
    duration: '45m',
    wheelchairAccessible: false,
    accessibilityDetail: 'Historic stepped path',
    failureReason: 'Fails hard constraint: 85 steep outdoor stone steps, no elevator or ramp',
  },
  {
    id: 'exp-3',
    title: 'Dr. Bhau Daji Lad Cultural Gallery & Guild',
    category: 'Art & Heritage',
    location: 'Byculla / Bandra Link',
    price: '₹100',
    duration: '60m',
    wheelchairAccessible: true,
    accessibilityDetail: 'Full ramp access, ground-level galleries & tactile signage',
  },
];

/**
 * Interactive Proof component demonstrating that accessibility requirements in LOKIVA
 * are evaluated as Stage 1 hard constraints (pre-filtered), never soft-ranked.
 */
export function AccessibilityConstraintProof() {
  const [isWheelchairRequired, setIsWheelchairRequired] = useState(false);
  const reducedMotion = isReducedMotionPreferred();

  const handleToggle = () => {
    setIsWheelchairRequired((prev) => !prev);
  };

  return (
    <div className="relative rounded-3xl bg-lokiva-ink/90 dark:bg-lokiva-ink/95 border border-slate-700/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 select-none">
      {/* Header with Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lokiva-teal px-2 py-0.5 rounded-full bg-lokiva-teal/10 border border-lokiva-teal/30">
              Stage 1 Pre-Filter Proof
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Hard constraint filter
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-lokiva-paper mt-1">
            Accessibility as a Hard Constraint
          </h3>
        </div>

        {/* The Toggle Button */}
        <button
          type="button"
          onClick={handleToggle}
          className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95 border ${
            isWheelchairRequired
              ? 'bg-lokiva-teal text-white border-lokiva-teal ring-2 ring-lokiva-teal/30'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-600'
          }`}
          aria-pressed={isWheelchairRequired}
        >
          <Accessibility className={`w-4 h-4 ${isWheelchairRequired ? 'text-white' : 'text-lokiva-teal'}`} />
          <span>Wheelchair access required</span>
          <span
            className={`w-2 h-2 rounded-full transition-colors ${
              isWheelchairRequired ? 'bg-emerald-300' : 'bg-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Candidates List */}
      <div className="space-y-3">
        {CANDIDATE_EXPERIENCES.map((candidate) => {
          const isFailing = isWheelchairRequired && !candidate.wheelchairAccessible;

          return (
            <motion.div
              key={candidate.id}
              layout={!reducedMotion}
              initial={false}
              animate={
                reducedMotion
                  ? { opacity: isFailing ? 0.35 : 1 }
                  : {
                      opacity: isFailing ? 0.35 : 1,
                      scale: isFailing ? 0.98 : 1,
                      y: isFailing ? 4 : 0,
                    }
              }
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`rounded-2xl p-4 border transition-all duration-300 ${
                isFailing
                  ? 'bg-slate-950/70 border-rose-900/40 text-slate-500 grayscale'
                  : 'bg-slate-900/80 border-slate-700/60 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono">
                      {candidate.category}
                    </span>
                    <h4 className={`text-sm font-bold ${isFailing ? 'text-slate-400 line-through' : 'text-lokiva-paper'}`}>
                      {candidate.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{candidate.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-mono text-xs font-semibold text-slate-300">
                    {candidate.duration} · {candidate.price}
                  </span>

                  {isWheelchairRequired ? (
                    candidate.wheelchairAccessible ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Certified Fit</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-lg border border-rose-500/20">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Filtered Out</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] text-slate-400 font-mono">
                      {candidate.wheelchairAccessible ? 'Step-free' : 'Stepped'}
                    </span>
                  )}
                </div>
              </div>

              {/* Status explanation line */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] font-mono flex items-center gap-1.5">
                {isFailing ? (
                  <span className="text-rose-400 font-medium">
                    {candidate.failureReason}
                  </span>
                ) : (
                  <span className="text-slate-400">
                    {candidate.accessibilityDetail}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Explanatory Footer note */}
      <div className="pt-2 text-xs text-slate-400 flex items-center gap-2 border-t border-slate-700/50 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-lokiva-teal shrink-0" />
        <span>
          Accessibility is never soft-ranked — non-matching stops are dropped before scoring.
        </span>
      </div>
    </div>
  );
}
