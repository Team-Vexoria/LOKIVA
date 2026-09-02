import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export function LokivaExperienceExchange() {
  return (
    <div className="bg-white rounded-2xl border border-paper-400 p-5 sm:p-7 shadow-sm text-ink space-y-5 relative overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-paper-200">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-paper-100 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-teal border border-paper-300">
            <Compass className="w-3 h-3 text-marigold" />
            <span>One Connected Ecosystem</span>
          </div>
          <h3 className="text-lg sm:text-xl font-display font-bold text-ink leading-tight">
            Where Traveler Intent Meets Local Expertise
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Link
            to="/explore"
            className="px-3.5 py-1.5 bg-ink hover:bg-ink-800 text-paper rounded-xl font-bold transition flex items-center gap-1 text-[11px] shadow-sm"
          >
            <span>Explore</span>
            <ArrowRight className="w-3 h-3 text-marigold" />
          </Link>
          <Link
            to="/provider?tab=copilot"
            className="px-3.5 py-1.5 bg-teal hover:bg-teal-700 text-white rounded-xl font-bold transition flex items-center gap-1 text-[11px] shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-marigold" />
            <span>Host</span>
          </Link>
        </div>
      </div>

      {/* 3 Compact Connected Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 relative items-stretch">
        {/* Step 1: Traveler */}
        <div className="p-4 bg-paper-50 rounded-xl border border-paper-300 space-y-2.5 flex flex-col justify-between hover:bg-white hover:border-paper-400 transition shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-paper-200 text-ink text-[10px] font-mono font-bold uppercase tracking-wider">
                01 · Traveler
              </span>
              <div className="w-6 h-6 rounded-lg bg-white border border-paper-300 flex items-center justify-center text-teal">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-sm font-display font-bold text-ink leading-snug">
              "I tell LOKIVA what I want."
            </h4>
            <p className="text-[11px] text-dusk-600 font-sans leading-relaxed">
              State time, budget, and accessibility constraints in plain words.
            </p>
          </div>
          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-paper-200 text-[10px] font-mono text-dusk truncate">
            💬 "Craft workshop in Bandra under ₹500, ramp access"
          </div>
        </div>

        {/* Step 2: LOKIVA AI */}
        <div className="p-4 bg-gradient-to-b from-white to-teal-50/20 rounded-xl border border-teal-300/90 space-y-2.5 flex flex-col justify-between shadow-xs ring-2 ring-teal-500/5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-mono font-bold uppercase tracking-wider border border-teal-200">
                02 · LOKIVA AI
              </span>
              <div className="w-6 h-6 rounded-lg bg-ink flex items-center justify-center text-marigold">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-sm font-display font-bold text-ink leading-snug">
              "Understands intent & matches craft."
            </h4>
            <p className="text-[11px] text-dusk-600 font-sans leading-relaxed">
              Deterministic feasibility solver balances travel buffers & pricing.
            </p>
          </div>
          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-teal-200 text-[10px] font-mono text-teal-900 flex items-center justify-between">
            <span className="font-bold">⚡ Feasibility Packed</span>
            <span className="font-extrabold text-[9px] bg-teal-50 px-1.5 py-0.5 rounded text-teal-800">Zero Ad-Tax</span>
          </div>
        </div>

        {/* Step 3: Local Provider */}
        <div className="p-4 bg-paper-50 rounded-xl border border-paper-300 space-y-2.5 flex flex-col justify-between hover:bg-white hover:border-paper-400 transition shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-paper-200 text-ink text-[10px] font-mono font-bold uppercase tracking-wider">
                03 · Local Provider
              </span>
              <div className="w-6 h-6 rounded-lg bg-white border border-paper-300 flex items-center justify-center text-marigold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <h4 className="text-sm font-display font-bold text-ink leading-snug">
              "Fulfills demand & earns 100% directly."
            </h4>
            <p className="text-[11px] text-dusk-600 font-sans leading-relaxed">
              Grassroots hosts match with ready travelers with zero commission.
            </p>
          </div>
          <div className="px-2.5 py-1.5 bg-white rounded-lg border border-paper-200 text-[10px] font-mono text-ink flex items-center justify-between">
            <span className="text-dusk">100% Direct Payout</span>
            <span className="font-bold text-teal text-[10px]">Verified Host ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
}
