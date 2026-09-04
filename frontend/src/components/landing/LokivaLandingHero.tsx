import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Footprints,
  Car,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  SquiggleUnderline,
  HandDrawnArrow,
  HandDrawnSparkle,
  StampBadge,
} from '../ui/HandDrawnAnnotations';
import { TripOnboardingTakeover, TripContextAnswers } from '../onboarding/TripOnboardingTakeover';
import { DayPlanResponse } from '../../types';

export function LokivaLandingHero() {
  const navigate = useNavigate();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [solvedPlan, setSolvedPlan] = useState<{
    answers: TripContextAnswers;
    plan: DayPlanResponse;
  } | null>(null);

  // prefers-reduced-motion check
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  const handlePlanGenerated = (answers: TripContextAnswers, plan: DayPlanResponse) => {
    setSolvedPlan({ answers, plan });
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-16 text-[#12213B] overflow-hidden">
      {/* Onboarding Full-Screen Takeover Modal */}
      <TripOnboardingTakeover
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* Decorative Indian Monument Cutouts (Asymmetrically Flanking Negative Space) */}
      <div className="pointer-events-none select-none z-0 absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
        {/* 1. Hawa Mahal (Jaipur) - Primary Left Anchor (Upper-Mid) */}
        <div className="absolute left-0 xl:left-4 top-6 xl:top-8 w-36 lg:w-44 xl:w-56 -rotate-3 transition-transform duration-700 ease-out hover:rotate-0">
          <img
            src="/assets/monuments/hawa-mahal-cutout.png"
            alt="Hawa Mahal Jaipur architectural silhouette cutout"
            loading="lazy"
            className="w-full h-auto object-contain opacity-70 xl:opacity-85 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
          />
        </div>

        {/* 2. Taj Mahal (Agra) - Secondary Right Anchor (Upper-Right) */}
        <div className="absolute right-0 xl:right-4 top-4 xl:top-6 w-36 lg:w-40 xl:w-52 -rotate-2 transition-transform duration-700 ease-out hover:rotate-0">
          <img
            src="/assets/monuments/taj-mahal-cutout.png"
            alt="Taj Mahal Agra dome and minarets cutout"
            loading="lazy"
            className="w-full h-auto object-contain opacity-70 xl:opacity-85 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
          />
        </div>

        {/* 3. Temple Gopuram (Madurai) - Lower Left Accent (Flanking CTA) */}
        <div className="hidden xl:block absolute left-2 xl:left-8 top-[52%] w-32 xl:w-40 rotate-[2.5deg] transition-transform duration-700 ease-out hover:rotate-0">
          <img
            src="/assets/monuments/temple-gopuram-cutout.png"
            alt="South Indian Temple Gopuram tower cutout"
            loading="lazy"
            className="w-full h-auto object-contain opacity-65 xl:opacity-80 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
          />
        </div>

        {/* 4. Gateway of India (Mumbai) - Lower Right Accent (Flanking CTA) */}
        <div className="hidden xl:block absolute right-2 xl:right-8 top-[50%] w-36 xl:w-48 rotate-3 transition-transform duration-700 ease-out hover:rotate-0">
          <img
            src="/assets/monuments/gateway-of-india-cutout.png"
            alt="Gateway of India Mumbai arch cutout"
            loading="lazy"
            className="w-full h-auto object-contain opacity-65 xl:opacity-80 filter drop-shadow-[0_8px_18px_rgba(18,33,59,0.06)]"
          />
        </div>
      </div>

      {/* Main Hero Display (Clean, Confident, Not AI-Boxy) */}
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">
        {/* Subtle Stamp Badge */}
        <div className="flex items-center justify-center gap-2">
          <StampBadge text="ALGORITHMIC CULTURAL CONCIERGE" />
        </div>

        {/* Confident Headline */}
        <motion.div
          initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="space-y-2 relative"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#12213B] tracking-tight leading-[1.08]">
            <span>Real Indian cultural experiences.</span>
            <br />
            <span className="relative inline-block mt-1">
              <span>Packed around your </span>
              <span className="relative inline-block text-[#1F7A6C]">
                exact constraints.
                <SquiggleUnderline className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-4 sm:h-5" />
              </span>
            </span>
          </h1>

          {/* Supporting Line */}
          <p className="pt-3 text-base sm:text-lg text-[#5B6B8C] font-sans max-w-2xl mx-auto leading-relaxed">
            Tell us your available window, budget ceiling, and mobility needs. Lokiva evaluates real transit buffers, opening schedules, and crowd peaks to build a plan that actually works.
          </p>
        </motion.div>

        {/* Primary CTA with Hand-Drawn Annotation Arrow */}
        <motion.div
          initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Button wrapper anchoring the 'Takes 60s' arrow directly to button's edge */}
          <div className="relative inline-flex items-center">
            {/* Hand-drawn arrow curving toward and terminating at the button's left edge */}
            <div className="hidden md:flex items-center gap-1 absolute -left-24 top-1/2 -translate-y-1/2 pointer-events-none select-none">
              <span className="font-display italic text-xs font-semibold text-[#5B6B8C] transform -rotate-6 whitespace-nowrap">
                Takes 60s
              </span>
              <HandDrawnArrow className="w-11 h-6 -mr-1" />
            </div>

            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="px-8 py-4 rounded-2xl bg-[#D85A38] hover:bg-[#C24927] text-white font-mono text-sm sm:text-base font-bold transition-all duration-200 shadow-lg shadow-[#D85A38]/30 hover:shadow-xl hover:shadow-[#D85A38]/40 border border-[#B84724]/40 flex items-center gap-3 active:scale-98 cursor-pointer group"
            >
              <span>{solvedPlan ? 'Adjust Your Trip Plan' : 'Plan My Time'}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Small illustrative aside: Never dominant headline, subtle sticker chip */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#D0D7CF] text-xs font-mono text-[#5B6B8C] shadow-2xs transform rotate-1">
            <Zap className="w-3.5 h-3.5 text-[#D85A38] fill-[#D85A38]/20 flex-shrink-0" />
            <span>Have 2 hours before a flight? We solve that too.</span>
          </div>
        </motion.div>

        {/* If user completed the onboarding flow, display their active solved plan */}
        <AnimatePresence>
          {solvedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-10 p-6 sm:p-8 bg-white rounded-3xl border border-[#D0D7CF] shadow-xl text-left space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EEF1EE]">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6B8C] font-bold">
                    TAILORED PLAN · {solvedPlan.plan.city.toUpperCase()}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-[#12213B]">
                    Feasible {solvedPlan.answers.timeHours}-Hour Plan in {solvedPlan.plan.city}
                  </h3>
                  <p className="text-xs font-mono text-[#5B6B8C] mt-1">
                    {solvedPlan.plan.feasibility_summary}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 ${
                      solvedPlan.plan.feasibility_score >= 85
                        ? 'bg-[#1F7A6C]/10 text-[#1F7A6C] border-[#1F7A6C]/30'
                        : solvedPlan.plan.feasibility_score >= 70
                        ? 'bg-[#F0A63B]/10 text-[#F0A63B] border-[#F0A63B]/30'
                        : 'bg-red-50 text-red-600 border-red-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Feasibility: {solvedPlan.plan.feasibility_score}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOnboardingOpen(true)}
                    className="text-xs font-mono text-[#F0A63B] hover:text-[#d88f28] font-bold underline cursor-pointer"
                  >
                    Edit Preferences
                  </button>
                </div>
              </div>

              {/* Solved stops with specific fit reasons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {solvedPlan.plan.stops.map((stop) => (
                  <div
                    key={stop.order}
                    className="p-4 rounded-2xl bg-[#FAFBF9] border border-[#D0D7CF] space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-extrabold text-[#12213B]">
                          Stop {stop.order} · {stop.time}
                        </span>
                        <span className="text-[#1F7A6C] font-bold">
                          {stop.cost_label}
                        </span>
                      </div>
                      <h4 className="font-display font-bold text-sm text-[#12213B] leading-snug">
                        {stop.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#1F7A6C] font-semibold leading-tight">
                        ✓ {stop.fit_reason}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-[#5B6B8C] block pt-1 border-t border-[#EEF1EE]">
                      ~{stop.duration_mins} mins scheduled
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EEF1EE]">
                <button
                  type="button"
                  onClick={() => navigate('/itinerary')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12213B] hover:bg-[#1a2d4f] text-white text-xs font-mono font-bold transition shadow-md cursor-pointer"
                >
                  <span>Open in Full Interactive Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F0A63B]" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/explore')}
                  className="text-xs font-mono text-[#5B6B8C] hover:text-[#12213B] underline underline-offset-4 flex items-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Explore Instead</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default LokivaLandingHero;
