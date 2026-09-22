import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Clock,
  Sparkles,
  Users,
  User,
  Heart,
  Home,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Coins,
  Gauge,
  Flame,
  Feather,
  Eye,
  Castle,
} from 'lucide-react';
import { UserJourneyPreferences } from '../../data/indiaStateMetadata';

interface CuratedJourneyProfilerProps {
  preferences: UserJourneyPreferences;
  onUpdatePreferences: (updated: UserJourneyPreferences) => void;
  onComplete: () => void;
  onSkip?: () => void;
  isCompact?: boolean;
}

export function CuratedJourneyProfiler({
  preferences,
  onUpdatePreferences,
  onComplete,
  onSkip,
  isCompact = false,
}: CuratedJourneyProfilerProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  // Step 1 options
  const rhythmOptions = [
    {
      id: 'solo' as const,
      label: 'Solo Wanderer',
      subtitle: 'Mindful temple trails, quiet heritage cafes, and unhurried observation',
      icon: User,
      pillTag: 'Independent Rhythm',
    },
    {
      id: 'couple' as const,
      label: 'Couple & Intimate Retreat',
      subtitle: 'Private palace courtyards, secluded dawn ghat boats, and candlelit havelis',
      icon: Heart,
      pillTag: 'Romantic Immersion',
    },
    {
      id: 'family' as const,
      label: 'Multi-Gen Family & Slow Travel',
      subtitle: 'Accessible heritage walks, comfortable heritage stays, and multi-generation ease',
      icon: Home,
      pillTag: 'Gentle Pacing',
    },
    {
      id: 'cohort' as const,
      label: 'Small Cohort of Cultural Seekers',
      subtitle: 'Artisan studio apprenticeships, regional feast trails, and hidden ruins',
      icon: Users,
      pillTag: 'Deep Exploration',
    },
  ];

  // Step 2 duration options
  const durationOptions = [
    {
      id: 'weekend' as const,
      title: 'Weekend Sprint',
      daysLabel: '2 to 3 Days',
      badge: 'Concentrated',
      desc: 'Deep immersion in one concentrated heritage cluster without long transit days.',
    },
    {
      id: 'circuit' as const,
      title: 'Heritage Circuit',
      daysLabel: '5 to 7 Days',
      badge: 'Signature',
      desc: 'Traverse 2 to 3 connected cultural centers linking royal bastions and living craft villages.',
    },
    {
      id: 'epic' as const,
      title: 'Epic Odyssey',
      daysLabel: '10+ Days',
      badge: 'Grand Journey',
      desc: 'Trans-state cultural corridor with remote frontiers, sacred sanctuaries, and master guilds.',
    },
  ];

  // Step 2 pacing options
  const pacingOptions = [
    {
      id: 'relaxed' as const,
      label: 'Slow & Immersive',
      stops: '1 to 2 deep stops / day',
      icon: Feather,
    },
    {
      id: 'balanced' as const,
      label: 'Balanced Discovery',
      stops: '3 to 4 stops / day',
      icon: Gauge,
    },
    {
      id: 'packed' as const,
      label: 'High-Energy Explorer',
      stops: 'Maximum sights in daylight',
      icon: Flame,
    },
  ];

  // Step 3 vibe options
  const vibeOptions = [
    {
      id: 'crafts' as const,
      title: 'Hidden Master Artisan Guilds',
      desc: 'Hand-block printing, lost-wax bronze casting, ikat looms, and miniature paintings.',
      icon: Sparkles,
    },
    {
      id: 'temples' as const,
      title: 'Sacred Rituals & Living Temples',
      desc: 'Dawn conch shell prayers, evening river aarti, and 1,000-year-old stone architecture.',
      icon: Compass,
    },
    {
      id: 'frontiers' as const,
      title: 'Wild Frontiers & Stepwells',
      desc: 'Subterranean water temples, windswept desert forts, and remote mountain monasteries.',
      icon: Eye,
    },
    {
      id: 'palaces' as const,
      title: 'Royal Palaces & Culinary Heritage',
      desc: 'Courtyard music recitals, ancestral royal havelis, and storied spice degustations.',
      icon: Castle,
    },
  ];

  // Editorial budget descriptor
  const getBudgetDescription = (amount: number) => {
    if (amount <= 3000) {
      return 'Authentic local dhabas, heritage homestays, public heritage walks, and shared local transit.';
    }
    if (amount <= 6500) {
      return 'Boutique heritage havelis, private master artisan access, guided walks, and comfortable cabs.';
    }
    return 'Royal palace dining, luxury courtyard stays, master artisan private ateliers, and chauffeured transit.';
  };

  const stepLabels = ['Travel Rhythm', 'Time & Scale', 'Vibe & Daily Budget'];

  return (
    <div className="w-full bg-[#FAF7F2] text-[#12213B] rounded-3xl border border-[#E5DFD5] p-6 sm:p-8 shadow-sm">
      {/* Profiler Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#E5DFD5]">
        <div>
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
              Curated Journey Profiler
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D99B43]" />
            <span className="text-xs font-mono font-bold text-dusk-600">
              Step {currentStep} of 3
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight">
            {currentStep === 1 && 'Define Your Travel Rhythm'}
            {currentStep === 2 && 'Set Your Time & Pacing'}
            {currentStep === 3 && 'Choose Cultural Vibe & Daily Budget'}
          </h2>
          <p className="text-xs sm:text-sm text-dusk-600 font-sans mt-0.5 max-w-xl">
            {currentStep === 1 && 'Tell us how you prefer to travel through India, solo reflection or shared memories.'}
            {currentStep === 2 && 'Calibrate your travel window and daily density to tailor every day properly.'}
            {currentStep === 3 && 'Select your cultural focal point and calibrate your estimated daily expenditure.'}
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
          {[1, 2, 3].map((step) => {
            const isActive = currentStep === step;
            const isDone = currentStep > step;
            return (
              <button
                key={step}
                type="button"
                onClick={() => setCurrentStep(step as 1 | 2 | 3)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#C85A32] text-white shadow-xs'
                    : isDone
                    ? 'bg-[#EFE8DC] text-[#2D4A3E] hover:bg-[#E5DFD5]'
                    : 'bg-white text-dusk-600 border border-[#E5DFD5]'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <span>0{step}</span>}
                <span className="hidden md:inline">{stepLabels[step - 1]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Step Content */}
      <div className="py-6 min-h-[340px]">
        <AnimatePresence mode="wait">
          {/* STEP 1: Travel Rhythm */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {rhythmOptions.map((opt) => {
                const isSelected = preferences.rhythm === opt.id;
                const IconComponent = opt.icon;

                return (
                  <motion.div
                    key={opt.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onUpdatePreferences({ ...preferences, rhythm: opt.id })}
                    className={`group relative p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FAF3EC] border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-sm'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] hover:border-[#D5CAB8]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#C85A32] text-white'
                            : 'bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5] group-hover:bg-[#FAF3EC]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-[#C85A32]/10 text-[#C85A32]'
                            : 'bg-[#FAF7F2] text-dusk-600 border border-[#E5DFD5]'
                        }`}
                      >
                        {opt.pillTag}
                      </span>
                    </div>

                    <h3 className="text-base font-heading font-bold text-[#12213B] group-hover:text-[#C85A32] transition-colors">
                      {opt.label}
                    </h3>
                    <p className="text-xs text-dusk-600 font-sans mt-1 leading-relaxed">
                      {opt.subtitle}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* STEP 2: Time & Scale + Pacing */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Duration Cards */}
              <div>
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] block mb-3">
                  Trip Duration Tier
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {durationOptions.map((opt) => {
                    const isSelected = preferences.durationTier === opt.id;

                    return (
                      <motion.div
                        key={opt.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onUpdatePreferences({ ...preferences, durationTier: opt.id })}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FAF3EC] border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-sm'
                            : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] hover:border-[#D5CAB8]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-mono font-bold text-[#C85A32]">
                            {opt.daysLabel}
                          </span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-dusk-600 px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DFD5]">
                            {opt.badge}
                          </span>
                        </div>
                        <h4 className="text-base font-heading font-bold text-[#12213B] mb-1">
                          {opt.title}
                        </h4>
                        <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                          {opt.desc}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Pacing Tactile Selector */}
              <div className="pt-4 border-t border-[#E5DFD5]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                    Exploration Pacing
                  </span>
                  <span className="text-xs font-mono text-dusk-600">
                    How many curated encounters per day
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pacingOptions.map((pace) => {
                    const isSelected = preferences.pacing === pace.id;
                    const IconComponent = pace.icon;

                    return (
                      <button
                        key={pace.id}
                        type="button"
                        onClick={() => onUpdatePreferences({ ...preferences, pacing: pace.id })}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#C85A32] text-white border-[#C85A32] shadow-xs'
                            : 'bg-white text-[#12213B] hover:bg-[#FAF8F5] border-[#E5DFD5]'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-[#C85A32]'}`} />
                        <div>
                          <div className="text-xs font-heading font-bold">{pace.label}</div>
                          <div className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-dusk-600'}`}>
                            {pace.stops}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Cultural Vibe & Dynamic Budget */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              {/* Vibe Selection */}
              <div>
                <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] block mb-3">
                  Primary Cultural Affinity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {vibeOptions.map((vibe) => {
                    const isSelected = preferences.vibe === vibe.id;
                    const IconComponent = vibe.icon;

                    return (
                      <motion.div
                        key={vibe.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onUpdatePreferences({ ...preferences, vibe: vibe.id })}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#FFFDF9] to-[#FAF3EC] border-[#C85A32] ring-2 ring-[#C85A32]/20 shadow-sm'
                            : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] hover:border-[#D5CAB8]'
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? 'bg-[#C85A32] text-white'
                              : 'bg-[#FAF7F2] text-[#C85A32] border border-[#E5DFD5]'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-heading font-bold text-[#12213B] leading-snug">
                            {vibe.title}
                          </h4>
                          <p className="text-xs text-dusk-600 font-sans mt-0.5 leading-relaxed line-clamp-2">
                            {vibe.desc}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Budget Slider */}
              <div className="p-5 bg-white rounded-2xl border border-[#E5DFD5] space-y-3">
                <div className="flex items-baseline justify-between gap-4">
                  <div>
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] block">
                      Target Daily Spending
                    </span>
                    <span className="text-xs text-dusk-600 font-sans">
                      Estimated all-inclusive local spend per traveler
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-mono font-black text-[#12213B]">
                      ₹{preferences.budgetDailyInr.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-mono text-dusk-600 ml-1">/ day</span>
                  </div>
                </div>

                {/* Range Input */}
                <input
                  type="range"
                  min="1500"
                  max="15000"
                  step="500"
                  value={preferences.budgetDailyInr}
                  onChange={(e) =>
                    onUpdatePreferences({
                      ...preferences,
                      budgetDailyInr: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-[#EFE8DC] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                />

                <div className="flex items-center justify-between text-[10px] font-mono text-dusk-600">
                  <span>₹1,500 (Homestays & Shared Rails)</span>
                  <span>₹6,500 (Heritage Havelis)</span>
                  <span>₹15,000+ (Palace Estates)</span>
                </div>

                <div className="pt-2 border-t border-[#FAF7F2] text-xs font-sans text-[#2D4A3E] bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5]">
                  <span className="font-bold">What this covers: </span>
                  {getBudgetDescription(preferences.budgetDailyInr)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-4 pt-5 border-t border-[#E5DFD5]">
        <div>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-ink border border-[#E5DFD5] rounded-xl text-xs font-heading font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs font-sans text-dusk-600 hover:text-ink transition-colors cursor-pointer underline underline-offset-4"
              >
                Skip profiler and explore map freely
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C85A32] hover:bg-[#B34E28] text-white rounded-xl text-xs sm:text-sm font-heading font-bold shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <span>{currentStep === 3 ? 'Reveal My Curated Map' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
