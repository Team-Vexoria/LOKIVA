import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, DollarSign, Tag, Clock, ShieldCheck, Briefcase } from 'lucide-react';

export function ProviderCopilotProof() {
  const [inputText, setInputText] = useState(
    'I run a 5th-generation hand-block printing studio in Bandra. We teach natural indigo dyeing for ₹450 with wheelchair ramp.'
  );
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(4);

  useEffect(() => {
    if (!inputText.trim()) {
      setStep(0);
      return;
    }

    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
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
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-dusk">
            Provider Layer: Plain Language to Structured Listing Assembly
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
        {/* Left Column: Natural Language Input */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-dusk uppercase flex items-center justify-between">
              <span>Artisan Voice Input</span>
              <span className="text-[10px] text-teal font-semibold">Zero SEO Skills Required</span>
            </label>
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={3}
                placeholder="Describe your craft or walking route..."
                className="w-full p-3.5 bg-paper-50 border border-paper-300 rounded-2xl text-xs font-sans text-ink placeholder-dusk focus:outline-none focus:border-marigold resize-none leading-relaxed"
              />
              {isTyping && (
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 text-[10px] font-mono text-marigold-700 bg-white/90 px-2 py-0.5 rounded-md border border-paper-300 shadow-sm">
                  <Zap className="w-3 h-3 text-marigold animate-pulse" />
                  <span>Extracting parameters...</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-dusk uppercase block">
              Try sample artisan prompts:
            </span>
            <div className="flex flex-col gap-1.5">
              {presetExamples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(ex)}
                  className="text-left text-xs font-sans p-2 bg-paper-100 hover:bg-paper-200 text-ink rounded-xl border border-paper-300 transition text-truncate"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Solver-Ready Output Card */}
        <div className="p-5 bg-paper-50 rounded-2xl border border-paper-300 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-paper-300 pb-2.5">
            <span className="text-[10px] uppercase font-bold text-teal flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Structured Feasibility Entity
            </span>
            <span className="text-[10px] text-dusk">Live Extraction</span>
          </div>

          <div className="space-y-3">
            {/* Step 1: Title */}
            <div className="space-y-0.5">
              <span className="text-[9px] text-dusk uppercase block">Structured Title</span>
              <div className="text-sm font-display font-bold text-ink bg-white p-2.5 rounded-xl border border-paper-300 min-h-[38px] flex items-center">
                {step >= 1 ? (
                  <span>Generational Hand-Block Printing & Natural Indigo Atelier</span>
                ) : (
                  <span className="text-dusk-300 text-xs font-sans">Awaiting input...</span>
                )}
              </div>
            </div>

            {/* Step 2: Extracted Hard Constraints */}
            <div className="space-y-1">
              <span className="text-[9px] text-dusk uppercase block">Extracted Hard Constraints</span>
              <div className="flex flex-wrap gap-1.5">
                {step >= 3 ? (
                  <>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold">
                      Wheelchair Ramp Verified
                    </span>
                    <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold">
                      Step-Free Entry
                    </span>
                    <span className="px-2 py-0.5 bg-paper-200 text-ink rounded-md text-[10px]">
                      Duration: 75 mins
                    </span>
                  </>
                ) : (
                  <span className="text-dusk text-[10px]">Extracting accessibility flags...</span>
                )}
              </div>
            </div>

            {/* Step 3: Suggested Price Band */}
            <div className="p-3 bg-white rounded-xl border border-paper-300 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-dusk block uppercase">Fair Local Price</span>
                <span className="text-base font-extrabold text-ink font-mono">
                  {step >= 4 ? '₹450 / pax' : '...'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-dusk block uppercase">Bandra Benchmark</span>
                <span className="text-[10px] text-teal font-semibold">₹400 - ₹550 fair band</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
