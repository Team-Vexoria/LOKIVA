'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Building, Coins, Clock, Tag, CheckCircle2, Bot, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { isReducedMotionPreferred } from '../../lib/gsap';

interface ParsedListing {
  title: string;
  category: string;
  tags: string[];
  duration: string;
  suggestedPrice: string;
  accessibility: string;
  localImpactScore: number;
  localImpactDetail: string;
}

const PRESET_PROMPTS = [
  {
    label: 'Jaipur Indigo Studio',
    prompt: 'We run a 3-generation woodblock printing studio in Jaipur offering 90-minute organic indigo workshops with chai.',
    parsed: {
      title: 'Heritage Organic Indigo Woodblock Printing & Tea',
      category: 'Craft & Workshop',
      tags: ['Handmade', 'Artisan Guild', 'Small Batch', 'Family Owned'],
      duration: '90 mins',
      suggestedPrice: '₹1,200 – ₹1,400',
      accessibility: 'Ground level courtyard · Step-free',
      localImpactScore: 0.94,
      localImpactDetail: '3rd-generation artisan family studio',
    },
  },
  {
    label: 'Goa Coastal Kitchen',
    prompt: 'Traditional coastal fish curry masterclass in a heritage Goa kitchen, max 4 people, with local market ingredient tour.',
    parsed: {
      title: 'Heritage Coastal Fish Curry & Spice Market Trail',
      category: 'Culinary Masterclass',
      tags: ['Secret Recipe', 'Market Walk', 'Intimate (Max 4)', 'Tasting'],
      duration: '2 hours',
      suggestedPrice: '₹1,500 – ₹1,800',
      accessibility: 'Traditional house entrance with 1 small step',
      localImpactScore: 0.91,
      localImpactDetail: 'Home-based local culinary host',
    },
  },
  {
    label: 'Dharavi Pottery Guild',
    prompt: 'Terracotta wheel throwing and clay pottery workshop with master craftsmen in Kumbharwada.',
    parsed: {
      title: 'Kumbharwada Traditional Wheel Pottery & Glazing',
      category: 'Artisan Workshop',
      tags: ['Terracotta', 'Master Craftsman', 'Hands-on', 'Take Home Art'],
      duration: '60 mins',
      suggestedPrice: '₹600 – ₹800',
      accessibility: 'Covered workshop studio area',
      localImpactScore: 0.96,
      localImpactDetail: 'Community pottery cooperative',
    },
  },
];

/**
 * Interactive proof demonstrating LOKIVA's Provider AI Co-Pilot (ARCHITECTURE.md §6).
 * Debounces plain text input and visibly assembles structured listing cards piece by piece.
 */
export function ProviderCoPilotProof() {
  const [inputText, setInputText] = useState(PRESET_PROMPTS[0].prompt);
  const [activeListing, setActiveListing] = useState<ParsedListing>(PRESET_PROMPTS[0].parsed);
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyStep, setAssemblyStep] = useState(3); // 0: parsing, 1: title, 2: tags, 3: full

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const reducedMotion = isReducedMotionPreferred();

  const triggerAssembly = (newText: string) => {
    setInputText(newText);
    setIsAssembling(true);

    if (reducedMotion) {
      // Find matching preset or generate plausible structured representation
      const matched = PRESET_PROMPTS.find((p) => p.prompt.toLowerCase() === newText.toLowerCase())?.parsed || {
        title: 'Custom Local Experience Listing',
        category: 'Local Experience',
        tags: ['Authentic', 'Direct Host', 'Verified'],
        duration: '60 mins',
        suggestedPrice: '₹800 – ₹1,200',
        accessibility: 'Standard ground level access',
        localImpactScore: 0.88,
        localImpactDetail: 'Independent verified local host',
      };
      setActiveListing(matched);
      setIsAssembling(false);
      setAssemblyStep(3);
      return;
    }

    // Step 0: Parsing indicator
    setAssemblyStep(0);

    if (timerRef.current) clearTimeout(timerRef.current);

    // Debounced assembly sequence
    timerRef.current = setTimeout(() => {
      const matched = PRESET_PROMPTS.find((p) => newText.includes(p.label.split(' ')[0]))?.parsed || {
        title: newText.length > 20 ? newText.slice(0, 48) + '...' : 'Custom Local Experience Listing',
        category: 'Local Workshop',
        tags: ['Direct Host', 'Handmade', 'Verified'],
        duration: '90 mins',
        suggestedPrice: '₹950 – ₹1,300',
        accessibility: 'Step-free access',
        localImpactScore: 0.90,
        localImpactDetail: 'Verified local specialist',
      };

      setActiveListing(matched);

      // Sequence the assembly piece by piece
      setAssemblyStep(1); // Title in
      setTimeout(() => {
        setAssemblyStep(2); // Tags in
        setTimeout(() => {
          setAssemblyStep(3); // Price & Impact in
          setIsAssembling(false);
        }, 150);
      }, 150);
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative rounded-3xl bg-lokiva-ink/90 dark:bg-lokiva-ink/95 border border-slate-700/60 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-lokiva-marigold px-2 py-0.5 rounded-full bg-lokiva-marigold/10 border border-lokiva-marigold/30">
              Provider Co-Pilot Proof
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Natural language to structured listing
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display text-lokiva-paper mt-1">
            2 Plain Lines to Full Structured Listing
          </h3>
        </div>

        {/* Quick Demo Prompts */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-400">Presets:</span>
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => triggerAssembly(p.prompt)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Field styled like a chat / provider co-pilot entry */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300">
          Describe your offering in plain language:
        </label>
        <div className="relative rounded-2xl bg-slate-900 border border-slate-700 focus-within:border-lokiva-marigold/70 focus-within:ring-2 focus-within:ring-lokiva-marigold/20 transition-all p-3">
          <textarea
            rows={2}
            value={inputText}
            onChange={(e) => triggerAssembly(e.target.value)}
            placeholder="e.g. We run a 3-generation woodblock printing studio in Jaipur..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-lokiva-marigold" />
              <span>Debounced AI parser (FastAPI solver-api)</span>
            </span>
            {isAssembling && (
              <span className="text-lokiva-marigold animate-pulse font-semibold">
                Structuring listing...
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Structured Listing Assembly Container */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
          <span className="text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-lokiva-marigold" />
            <span>Structured Data Output</span>
          </span>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Schema Compliant
          </span>
        </div>

        {/* Piece 1: Title & Category */}
        <AnimatePresence mode="wait">
          {assemblyStep >= 1 && (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-1"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-lokiva-teal/20 text-lokiva-teal border border-lokiva-teal/30 font-mono">
                  {activeListing.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {activeListing.duration}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold font-display text-lokiva-paper">
                {activeListing.title}
              </h4>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Piece 2: Staggered Weighted Tags */}
        <AnimatePresence mode="wait">
          {assemblyStep >= 2 && (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-1.5"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Extracted Interest Tags & Constraints:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeListing.tags.map((tag, i) => (
                  <motion.span
                    key={tag}
                    initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: reducedMotion ? 0 : i * 0.05, duration: 0.2 }}
                    className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Piece 3: Suggested Price Band & Local Impact Score */}
        <AnimatePresence mode="wait">
          {assemblyStep >= 3 && (
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                  Suggested Price Band (Heuristic from 8 Nearby Listings)
                </span>
                <span className="font-mono text-sm font-bold text-lokiva-marigold">
                  {activeListing.suggestedPrice}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                  Transparent Local Impact Score
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    {activeListing.localImpactScore.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">
                    ({activeListing.localImpactDetail})
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
