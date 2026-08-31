import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, CheckCircle2, DollarSign, Tag, Clock, ShieldCheck, Briefcase } from 'lucide-react';

export function ProviderCopilotProof() {
  const [inputText, setInputText] = useState(
    'I run a 5th-generation hand-block printing studio in Bandra. We teach natural indigo dyeing for ₹450 with wheelchair ramp.'
  );
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(4); // 0: empty, 1: title, 2: tags, 3: access, 4: price

  useEffect(() => {
    if (!inputText.trim()) {
      setStep(0);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      // Sequentially assemble the listing card
      setStep(1);
      setTimeout(() => setStep(2), 150);
      setTimeout(() => setStep(3), 300);
      setTimeout(() => setStep(4), 450);
    }, 400);

    return () => clearTimeout(timer);
  }, [inputText]);

  const presetExamples = [
    'Hand-block printing studio in Bandra, indigo dyeing, ₹450, wheelchair ramp',
    'Chimbai coastal heritage fish curry cooking workshop, 90 mins, ₹600, ground floor',
    'Ranwar village Portuguese colonial architecture sketching trail, 60 mins, ₹350',
  ];

  return (
    <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md text-ink">
      {/* Proof Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
              Interactive Proof 04 · Provider Co-Pilot
            </span>
            <span className="text-[11px] font-mono text-dusk">
              Plain Language to Structured Listing Assembly
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold text-ink">
            AI Co-Pilot for Local Artisans & Guides
          </h3>
        </div>

        <span className="text-xs font-mono text-dusk bg-paper-100 px-3 py-1.5 rounded-xl border border-paper-300">
          Architecture §6 Provider Layer
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Col: Chat Input Field & Presets */}
        <div className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-dusk uppercase font-bold block flex items-center justify-between">
              <span>Type 2 lines about your craft or workshop</span>
              {isTyping && (
                <span className="text-marigold flex items-center gap-1 text-[10px]">
                  <Sparkles className="w-3 h-3 animate-spin" /> Assembling...
                </span>
              )}
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. Traditional clay pottery masterclass in Sanganer, ₹400, step-free access..."
              className="w-full bg-paper-100 border border-paper-300 rounded-2xl p-4 text-xs text-ink placeholder-dusk focus:outline-none focus:border-marigold font-sans shadow-inner leading-relaxed"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-dusk uppercase font-bold block">
              Try clicking an artisan prompt:
            </span>
            <div className="flex flex-col gap-1.5">
              {presetExamples.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(preset)}
                  className="text-left p-2 px-3 bg-paper-50 hover:bg-paper-200 rounded-xl text-[11px] text-ink border border-paper-300 font-sans truncate transition"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Animated Assembling Listing Card */}
        <div className="bg-ink text-paper rounded-3xl p-6 border border-ink-700 space-y-4 shadow-xl relative min-h-[260px] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[10px] font-mono text-dusk-200 border-b border-ink-700 pb-2">
            <span className="flex items-center gap-1 uppercase font-bold text-teal-100">
              <Briefcase className="w-3.5 h-3.5 text-teal" /> Structured Listing Card
            </span>
            <span className="text-marigold font-bold">LIVE PREVIEW</span>
          </div>

          <div className="space-y-3 flex-1">
            {/* Step 1: Title */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-1"
                >
                  <h4 className="text-base font-display font-bold text-white leading-snug">
                    Generational Hand-Block Printing & Indigo Atelier
                  </h4>
                  <p className="text-[11px] text-dusk-100 font-sans leading-relaxed">
                    Interactive artisan workshop teaching mineral dye extraction and wooden stamping on handwoven cotton.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 2: Tags Stagger */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-wrap gap-1.5 font-mono text-[10px]"
                >
                  <span className="px-2 py-0.5 rounded-md bg-ink-800 text-marigold border border-ink-700 flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5" /> Art & Craft
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-ink-800 text-white border border-ink-700 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-dusk-200" /> 75 mins
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-ink-800 text-teal-100 border border-ink-700">
                    🌿 Natural Dyes
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Accessibility Flags */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-2.5 bg-ink-950/80 rounded-xl border border-ink-700/80 text-[10px] font-mono text-teal-100 flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                  <span>
                    <strong>Solver Flags:</strong> Wheelchair Ramp Verified · Ground Floor · Family Friendly
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Step 4: Suggested Price Band */}
          <AnimatePresence>
            {step >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="pt-2 border-t border-ink-700 flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <span className="text-[10px] text-dusk-200 uppercase block">Suggested Price</span>
                  <span className="text-sm font-extrabold text-marigold">₹450 / pax</span>
                </div>
                <div className="text-right text-[10px] text-dusk-200">
                  <span className="text-teal-100 font-bold block">Market Price Band</span>
                  <span>₹400 - ₹550 (14 Bandra workshops)</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
