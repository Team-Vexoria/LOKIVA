import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  X,
  Compass,
  Landmark,
  Utensils,
  Palette,
  Flame,
  Mountain,
  ShoppingBag,
  Music,
  Eye,
  Sparkles,
  User,
  Heart,
  Users,
  Smile,
  ShieldCheck,
  Check,
  Accessibility,
  Footprints,
  Navigation,
} from 'lucide-react';

export interface DiscoveryAnswers {
  interests: string[];
  days: number;
  time_available_minutes: number;
  budget_daily_inr: number;
  budget_max_inr: number;
  group_type: 'solo' | 'couple' | 'family' | 'friends';
  group_size: number;
  pace: 'relaxed' | 'balanced' | 'packed';
  accessibility: {
    low_walking: boolean;
    wheelchair: boolean;
    step_free: boolean;
  };
}

export const DEFAULT_DISCOVERY_ANSWERS: DiscoveryAnswers = {
  interests: ['heritage', 'crafts', 'food'],
  days: 5,
  time_available_minutes: 2400, // 5 days * 8h * 60m
  budget_daily_inr: 4500,
  budget_max_inr: 22500,
  group_type: 'couple',
  group_size: 2,
  pace: 'balanced',
  accessibility: {
    low_walking: false,
    wheelchair: false,
    step_free: false,
  },
};

const INTEREST_OPTIONS = [
  { id: 'heritage', label: 'Living Heritage & Citadels', icon: Landmark },
  { id: 'crafts', label: 'Master Artisan Guilds', icon: Palette },
  { id: 'food', label: 'Street Gastronomy & Royal Recipes', icon: Utensils },
  { id: 'rituals', label: 'Sacred Temples & Dawn Ghats', icon: Flame },
  { id: 'monuments', label: 'Stepwells & Ancient Ruins', icon: Compass },
  { id: 'nature', label: 'Lakes, Valleys & Wildlife', icon: Mountain },
  { id: 'markets', label: 'Bazaars, Textiles & Perfumeries', icon: ShoppingBag },
  { id: 'arts', label: 'Classical Music & Folk Dance', icon: Music },
  { id: 'offbeat', label: 'Hidden Alleyways & Secret Courtyards', icon: Eye },
  { id: 'wellness', label: 'Ayurveda & Mindful Sanctuaries', icon: Sparkles },
];

const GROUP_OPTIONS = [
  {
    id: 'solo' as const,
    label: 'Solo Explorer',
    size: 1,
    icon: User,
    tagline: '1 Traveler',
    desc: 'Spontaneous wandering, contemplative temple corners, flexible cadence.',
  },
  {
    id: 'couple' as const,
    label: 'Couple Retreat',
    size: 2,
    icon: Heart,
    tagline: '2 Travelers',
    desc: 'Intimate palace courtyards, candlelit rooftop havelis, serene boat rides.',
  },
  {
    id: 'family' as const,
    label: 'Multi-Gen Family',
    size: 4,
    icon: Users,
    tagline: '3 to 5 Travelers',
    desc: 'Engaging heritage storytellers, shaded pathways, frequent comfort pauses.',
  },
  {
    id: 'friends' as const,
    label: 'Friends Tribe',
    size: 5,
    icon: Smile,
    tagline: '4 to 8 Travelers',
    desc: 'High-energy food crawls, craft studio sessions, panoramic photo spots.',
  },
];

interface DiscoveryOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (answers: DiscoveryAnswers) => void;
  initialAnswers?: Partial<DiscoveryAnswers>;
}

export function DiscoveryOnboardingFlow({
  isOpen,
  onClose,
  onComplete,
  initialAnswers,
}: DiscoveryOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  // Form State
  const [interests, setInterests] = useState<string[]>(
    initialAnswers?.interests || DEFAULT_DISCOVERY_ANSWERS.interests
  );
  const [days, setDays] = useState<number>(
    initialAnswers?.days || DEFAULT_DISCOVERY_ANSWERS.days
  );
  const [budgetDaily, setBudgetDaily] = useState<number>(
    initialAnswers?.budget_daily_inr || DEFAULT_DISCOVERY_ANSWERS.budget_daily_inr
  );
  const [groupType, setGroupType] = useState<'solo' | 'couple' | 'family' | 'friends'>(
    initialAnswers?.group_type || DEFAULT_DISCOVERY_ANSWERS.group_type
  );
  const [paceVal, setPaceVal] = useState<number>(50); // 0 (relaxed) to 100 (packed)
  const [accessibility, setAccessibility] = useState<{
    low_walking: boolean;
    wheelchair: boolean;
    step_free: boolean;
  }>(initialAnswers?.accessibility || DEFAULT_DISCOVERY_ANSWERS.accessibility);

  // Synthesis state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<number>(0);

  // Prefers reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || isSynthesizing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentStep > 1) {
          handleBack();
        } else {
          onClose();
        }
      } else if (e.key === 'Enter') {
        if (currentStep < 6) {
          handleNext();
        } else if (currentStep === 6) {
          handleStartSynthesis();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isSynthesizing, interests, days, budgetDaily, groupType, paceVal, accessibility]);

  const handleNext = () => {
    if (currentStep < 6) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    } else {
      handleStartSynthesis();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getPaceCategory = (val: number): 'relaxed' | 'balanced' | 'packed' => {
    if (val <= 33) return 'relaxed';
    if (val >= 67) return 'packed';
    return 'balanced';
  };

  const handleStartSynthesis = () => {
    setIsSynthesizing(true);
    setSynthesisStage(1);

    const pace = getPaceCategory(paceVal);
    const groupMeta = GROUP_OPTIONS.find((g) => g.id === groupType);
    const answers: DiscoveryAnswers = {
      interests: interests.length > 0 ? interests : ['heritage', 'crafts'],
      days,
      time_available_minutes: days * 8 * 60,
      budget_daily_inr: budgetDaily,
      budget_max_inr: budgetDaily * days,
      group_type: groupType,
      group_size: groupMeta ? groupMeta.size : 2,
      pace,
      accessibility,
    };

    // Store in localStorage for solver and discovery engine
    try {
      localStorage.setItem('lokiva_discovery_answers', JSON.stringify(answers));
      localStorage.setItem(
        'lokiva_discovery_preferences',
        JSON.stringify({
          rhythm: groupType === 'friends' ? 'cohort' : groupType,
          durationTier: days <= 3 ? 'weekend' : days <= 7 ? 'circuit' : 'epic',
          pacing: pace,
          vibe: interests.includes('crafts')
            ? 'crafts'
            : interests.includes('rituals')
            ? 'temples'
            : interests.includes('monuments')
            ? 'frontiers'
            : 'palaces',
          budgetDailyInr: budgetDaily,
        })
      );
      localStorage.setItem('has_onboarded_lokiva', 'true');
    } catch {}

    // 1.5s honest synthesis animation progression
    const timer1 = setTimeout(() => setSynthesisStage(2), 600);
    const timer2 = setTimeout(() => setSynthesisStage(3), 1100);
    const timer3 = setTimeout(() => {
      setIsSynthesizing(false);
      onComplete(answers);
    }, 1600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  if (!isOpen) return null;

  // Spring animation variants
  const slideVariants = {
    enter: (d: number) => ({
      x: prefersReducedMotion ? 0 : d * 50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (d: number) => ({
      x: prefersReducedMotion ? 0 : -d * 50,
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  const formattedBudgetDaily = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(budgetDaily);

  const formattedTotalBudget = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(budgetDaily * days);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#12213B]/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        >
          {/* Subtle warm glow background accent */}
          <div
            className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-[#D99B43]/15 rounded-full blur-3xl -z-10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 bg-[#C85A32]/10 rounded-full blur-3xl -z-10"
            aria-hidden="true"
          />

          {/* Top Header: Progress & Unobtrusive Controls */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E5DFD5] bg-white/70 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              {currentStep > 1 && !isSynthesizing ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-dusk-600 hover:text-[#12213B] px-2.5 py-1.5 rounded-xl hover:bg-[#FAF7F2] border border-transparent hover:border-[#E5DFD5] transition-colors cursor-pointer"
                  aria-label="Go back to previous question"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#C85A32]" />
                  <span className="text-xs font-heading font-bold text-[#12213B] tracking-wide">
                    LOKIVA DISCOVERY
                  </span>
                </div>
              )}
            </div>

            {/* Smooth Progress Track */}
            {!isSynthesizing && (
              <div className="flex items-center gap-3">
                <div className="w-28 sm:w-40 h-1.5 bg-[#E5DFD5] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FFC067] to-[#C85A32] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStep / 6) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <span className="text-[11px] font-mono text-dusk-600 font-semibold tracking-wider">
                  {currentStep} of 6
                </span>
              </div>
            )}

            {/* Close affordance */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-dusk-600 hover:text-[#12213B] rounded-xl hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              aria-label="Close discovery flow"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Central Question Stage */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 min-h-[380px] flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ======================================================= */}
              {/* STEP 1: INTERESTS (MULTI-SELECT CHIP CLOUD)              */}
              {/* ======================================================= */}
              {currentStep === 1 && !isSynthesizing && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 1: Cultural Affinity
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What experiences draw you in most?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Tap the cultural threads you want woven into your Indian journey. Choose any combination.
                    </p>
                  </div>

                  {/* Multi-Select Chip Cloud with Micro-Interactions */}
                  <div className="flex flex-wrap gap-2.5 sm:gap-3 justify-center sm:justify-start py-2">
                    {INTEREST_OPTIONS.map((item) => {
                      const isSelected = interests.includes(item.id);
                      const Icon = item.icon;

                      return (
                        <motion.button
                          key={item.id}
                          type="button"
                          onClick={() => toggleInterest(item.id)}
                          whileHover={{ scale: 1.02, y: -1 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-heading font-bold transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-[#FFF9F2] text-[#12213B] border-2 border-[#D99B43] shadow-[0_4px_16px_rgba(217,155,67,0.22)] ring-1 ring-[#D99B43]'
                              : 'bg-white hover:bg-[#FAF8F5] text-[#12213B] border border-[#E5DFD5] shadow-xs'
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 transition-colors ${
                              isSelected ? 'text-[#C85A32]' : 'text-dusk-600'
                            }`}
                          />
                          <span>{item.label}</span>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] ml-0.5" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between">
                    <span className="text-xs font-mono text-dusk-600">
                      {interests.length} {interests.length === 1 ? 'affinity' : 'affinities'} selected
                    </span>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* STEP 2: TIME AVAILABLE (TACTILE SLIDER WITH BIG NUMBER)   */}
              {/* ======================================================= */}
              {currentStep === 2 && !isSynthesizing && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 2: Time Available
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      How much time do you realistically have?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Drag the dial. We calculate realistic travel times, sunset timings, and opening hours so you never rush.
                    </p>
                  </div>

                  {/* Big Animated Duration Display */}
                  <div className="py-4 text-center space-y-1">
                    <div className="inline-flex items-baseline justify-center gap-2">
                      <span className="text-5xl sm:text-7xl font-display font-bold text-[#12213B] tracking-tight">
                        {days}
                      </span>
                      <span className="text-xl sm:text-2xl font-heading font-bold text-[#C85A32]">
                        {days === 1 ? 'Day' : 'Days'}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-dusk-600">
                      ≈ {days * 8} hours of curated exploration across verified sites
                    </p>
                  </div>

                  {/* Responsive Slider */}
                  <div className="space-y-3 px-2">
                    <input
                      type="range"
                      min={1}
                      max={21}
                      step={1}
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value, 10))}
                      className="w-full h-2.5 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-dusk-600 font-semibold px-1">
                      <span>1 Day</span>
                      <span>3 Days</span>
                      <span>7 Days</span>
                      <span>14 Days</span>
                      <span>21 Days</span>
                    </div>
                  </div>

                  {/* Editorial Helper Badge */}
                  <div className="p-3.5 bg-white border border-[#E5DFD5] rounded-2xl text-xs font-sans text-[#12213B]">
                    <span className="font-heading font-bold text-[#C85A32] block mb-0.5">
                      {days <= 3
                        ? 'Weekend Sprint'
                        : days <= 7
                        ? 'Signature Circuit'
                        : days <= 14
                        ? 'Grand Route'
                        : 'Epic Odyssey'}
                    </span>
                    <p className="text-dusk-600">
                      {days <= 3
                        ? 'Concentrated single-city immersion with zero long transit delays.'
                        : days <= 7
                        ? 'Optimal duration to connect 2 complementary heritage hubs and artisan guilds.'
                        : days <= 14
                        ? 'Comprehensive route across palace havelis, stepwells, and sacred rivers.'
                        : 'Deep multi-regional odyssey across historic Indian frontiers.'}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* STEP 3: BUDGET CEILING (LIVE INDIAN CURRENCY SLIDER)     */}
              {/* ======================================================= */}
              {currentStep === 3 && !isSynthesizing && (
                <motion.div
                  key="step-3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 3: Financial Comfort
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What is your comfortable spending range?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Per day for your entire party. Every haveli pass, artisan fee, and local transit fits comfortably inside.
                    </p>
                  </div>

                  {/* Big Live Currency Counter */}
                  <div className="py-4 text-center space-y-1">
                    <div className="text-4xl sm:text-6xl font-display font-bold text-[#12213B] tracking-tight">
                      {formattedBudgetDaily}
                      <span className="text-base sm:text-lg font-heading font-bold text-dusk-600 ml-2">
                        / day
                      </span>
                    </div>

                    <p className="text-xs font-mono text-[#C85A32] font-semibold">
                      Estimated total for {days} {days === 1 ? 'day' : 'days'}: {formattedTotalBudget}
                    </p>
                  </div>

                  {/* Responsive Slider */}
                  <div className="space-y-3 px-2">
                    <input
                      type="range"
                      min={1000}
                      max={25000}
                      step={500}
                      value={budgetDaily}
                      onChange={(e) => setBudgetDaily(parseInt(e.target.value, 10))}
                      className="w-full h-2.5 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                    />

                    <div className="flex justify-between text-[11px] font-mono text-dusk-600 font-semibold px-1">
                      <span>₹1,000</span>
                      <span>₹5,000</span>
                      <span>₹12,000</span>
                      <span>₹25,000+</span>
                    </div>
                  </div>

                  {/* Editorial Tier Explanation */}
                  <div className="p-3.5 bg-white border border-[#E5DFD5] rounded-2xl text-xs font-sans text-[#12213B]">
                    <span className="font-heading font-bold text-[#D99B43] block mb-0.5">
                      {budgetDaily <= 3000
                        ? 'Conscious Explorer'
                        : budgetDaily <= 8000
                        ? 'Heritage Comfort'
                        : budgetDaily <= 15000
                        ? 'Atelier & Boutique Luxury'
                        : 'Royal Heritage Bespoke'}
                    </span>
                    <p className="text-dusk-600">
                      {budgetDaily <= 3000
                        ? 'Historic walking loops, street gastronomy, tea stops, and local rickshaws.'
                        : budgetDaily <= 8000
                        ? 'Boutique havelis, verified craft workshops, and curated regional dining.'
                        : budgetDaily <= 15000
                        ? 'Private artisan apprenticeships, haveli suites, and dedicated cultural guides.'
                        : 'Private royal quarters access, bespoke haveli dining, and private transit.'}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* STEP 4: GROUP SIZE / TRAVEL TYPE (ILLUSTRATED CARDS)     */}
              {/* ======================================================= */}
              {currentStep === 4 && !isSynthesizing && (
                <motion.div
                  key="step-4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 4: Travel Companions
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Who is traveling with you?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Calibrates itinerary pace, vehicle sizing, seating arrangements, and rest stops.
                    </p>
                  </div>

                  {/* 4 Illustrated Cards with Marigold Border Glow */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2">
                    {GROUP_OPTIONS.map((card) => {
                      const isSelected = groupType === card.id;
                      const Icon = card.icon;

                      return (
                        <motion.button
                          key={card.id}
                          type="button"
                          onClick={() => setGroupType(card.id)}
                          whileHover={{ y: -3, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                            isSelected
                              ? 'bg-[#FFFDF9] border-[#FFC067] ring-2 ring-[#FFC067] shadow-[0_8px_24px_rgba(255,192,103,0.32)]'
                              : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div
                              className={`p-2.5 rounded-xl ${
                                isSelected
                                  ? 'bg-[#FFC067]/20 text-[#C85A32]'
                                  : 'bg-[#FAF7F2] text-[#12213B]'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <span className="text-[10px] font-mono font-bold text-dusk-600 bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E5DFD5]">
                              {card.tagline}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-heading font-bold text-base text-[#12213B]">
                              {card.label}
                            </h3>
                            <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                              {card.desc}
                            </p>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* STEP 5: TRAVEL PACE (TWO-ENDED SPECTRUM SLIDER)          */}
              {/* ======================================================= */}
              {currentStep === 5 && !isSynthesizing && (
                <motion.div
                  key="step-5"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 5: Travel Rhythm & Pace
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      How do you like to pace your days?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Find your equilibrium between slow contemplation and high-density discovery.
                    </p>
                  </div>

                  {/* Spectrum Visual Indicator */}
                  <div className="p-5 bg-white border border-[#E5DFD5] rounded-3xl space-y-4 shadow-xs">
                    <div className="flex items-center justify-between text-xs font-heading font-bold">
                      <span className={`${paceVal <= 33 ? 'text-[#C85A32]' : 'text-dusk-600'}`}>
                        Slow & Relaxed
                      </span>
                      <span
                        className={`${
                          paceVal > 33 && paceVal < 67 ? 'text-[#C85A32]' : 'text-dusk-600'
                        }`}
                      >
                        Balanced Discovery
                      </span>
                      <span className={`${paceVal >= 67 ? 'text-[#C85A32]' : 'text-dusk-600'}`}>
                        Fast-Paced & Full
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={paceVal}
                      onChange={(e) => setPaceVal(parseInt(e.target.value, 10))}
                      className="w-full h-3 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                    />

                    {/* Dynamic Label */}
                    <div className="text-center pt-1">
                      <span className="text-xs font-mono font-bold text-[#12213B] bg-[#FAF7F2] px-3 py-1 rounded-full border border-[#E5DFD5]">
                        {paceVal <= 33
                          ? 'Slow & Immersive • 2 to 3 stops max per day'
                          : paceVal >= 67
                          ? 'High-Energy Explorer • 5 to 6 stops per day'
                          : 'Balanced Loop • 3 to 4 stops per day with tea breaks'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-dusk-600 text-center sm:text-left font-sans leading-relaxed">
                    {paceVal <= 33
                      ? 'Linger in quiet temple courtyards, enjoy lengthy afternoon haveli teas, and take unhurried artisan walks.'
                      : paceVal >= 67
                      ? 'Sunrise to sunset cultural exploration maximizing landmarks, stepwells, and street markets.'
                      : 'Structured morning cultural sights, relaxed midday workshop or lunch, and golden-hour ghat walks.'}
                  </p>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* STEP 6: ACCESSIBILITY NEEDS (OPTIONAL & GENTLE)          */}
              {/* ======================================================= */}
              {currentStep === 6 && !isSynthesizing && (
                <motion.div
                  key="step-6"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 6: Accessibility (Optional)
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Any mobility or walking preferences?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      We optimize route stops, ramps, and walking hops accordingly. Skip anytime if not needed.
                    </p>
                  </div>

                  {/* 3 Gentle Toggle Cards */}
                  <div className="space-y-3 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        setAccessibility((prev) => ({
                          ...prev,
                          wheelchair: !prev.wheelchair,
                          step_free: !prev.wheelchair ? true : prev.step_free,
                        }))
                      }
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        accessibility.wheelchair
                          ? 'bg-[#FFFDF9] border-[#D99B43] shadow-xs'
                          : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32]">
                          <Accessibility className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-heading font-bold text-sm text-[#12213B] block">
                            Wheelchair Friendly & Elevators
                          </span>
                          <span className="text-xs text-dusk-600">
                            Strictly step-free paths, ramps, and accessible monument entries.
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          accessibility.wheelchair
                            ? 'bg-[#C85A32] border-[#C85A32] text-white'
                            : 'border-[#E5DFD5]'
                        }`}
                      >
                        {accessibility.wheelchair && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAccessibility((prev) => ({
                          ...prev,
                          low_walking: !prev.low_walking,
                        }))
                      }
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        accessibility.low_walking
                          ? 'bg-[#FFFDF9] border-[#D99B43] shadow-xs'
                          : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32]">
                          <Footprints className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-heading font-bold text-sm text-[#12213B] block">
                            Low Walking Radius (Under 400m hops)
                          </span>
                          <span className="text-xs text-dusk-600">
                            Shaded hops, frequent seating spots, and minimal stair climbs.
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          accessibility.low_walking
                            ? 'bg-[#C85A32] border-[#C85A32] text-white'
                            : 'border-[#E5DFD5]'
                        }`}
                      >
                        {accessibility.low_walking && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setAccessibility((prev) => ({
                          ...prev,
                          step_free: !prev.step_free,
                        }))
                      }
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between ${
                        accessibility.step_free
                          ? 'bg-[#FFFDF9] border-[#D99B43] shadow-xs'
                          : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#C85A32]">
                          <Navigation className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-heading font-bold text-sm text-[#12213B] block">
                            Smooth Flagstone & Paved Surfaces
                          </span>
                          <span className="text-xs text-dusk-600">
                            Avoid rough cobblestones or unpaved alleyways.
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          accessibility.step_free
                            ? 'bg-[#C85A32] border-[#C85A32] text-white'
                            : 'border-[#E5DFD5]'
                        }`}
                      >
                        {accessibility.step_free && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleStartSynthesis}
                      className="text-xs font-mono text-dusk-600 hover:text-[#12213B] transition-colors"
                    >
                      Skip accessibility preferences
                    </button>

                    <button
                      type="button"
                      onClick={handleStartSynthesis}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Build My Journey</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* FINAL STEP: SYNTHESIS CONVERGENCE MOMENT (1.5 SECONDS)   */}
              {/* ======================================================= */}
              {isSynthesizing && (
                <motion.div
                  key="synthesis-stage"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-10 text-center space-y-6 flex-1 flex flex-col justify-center items-center"
                >
                  {/* Rotating Compass Icon with Amber Glow */}
                  <motion.div
                    className="w-16 h-16 rounded-3xl bg-white border-2 border-[#D99B43] shadow-[0_8px_30px_rgba(217,155,67,0.3)] flex items-center justify-center text-[#C85A32]"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  >
                    <Compass className="w-8 h-8" />
                  </motion.div>

                  <div className="space-y-1.5 max-w-md">
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-[#12213B]">
                      Synthesizing Your Indian Discovery
                    </h3>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans">
                      Aligning your constraints with verified artisan guilds, live opening hours, and regional vector boundaries.
                    </p>
                  </div>

                  {/* Converging Constraint Badges */}
                  <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs font-mono font-bold text-[#12213B] shadow-xs"
                    >
                      {days} Days Duration
                    </motion.span>

                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs font-mono font-bold text-[#C85A32] shadow-xs"
                    >
                      {formattedBudgetDaily} / day
                    </motion.span>

                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs font-mono font-bold text-[#12213B] shadow-xs"
                    >
                      {GROUP_OPTIONS.find((g) => g.id === groupType)?.label}
                    </motion.span>

                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs font-mono font-bold text-[#D99B43] shadow-xs"
                    >
                      {getPaceCategory(paceVal)} Pace
                    </motion.span>
                  </div>

                  {/* Real-time Constraint Solver Computation Indicators */}
                  <div className="space-y-1.5 text-xs font-mono text-dusk-600 text-left max-w-xs pt-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2D8978]" />
                      <span className="text-[#2D8978] font-bold">
                        {synthesisStage >= 1
                          ? 'Enforced hard budget & transit walls'
                          : 'Evaluating financial constraints...'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`w-3.5 h-3.5 ${
                          synthesisStage >= 2 ? 'text-[#2D8978]' : 'text-dusk-600'
                        }`}
                      />
                      <span className={synthesisStage >= 2 ? 'text-[#2D8978] font-bold' : ''}>
                        {synthesisStage >= 2
                          ? 'Matched top-tier artisan guilds'
                          : 'Searching master ateliers...'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <ShieldCheck
                        className={`w-3.5 h-3.5 ${
                          synthesisStage >= 3 ? 'text-[#2D8978]' : 'text-dusk-600'
                        }`}
                      />
                      <span className={synthesisStage >= 3 ? 'text-[#2D8978] font-bold' : ''}>
                        {synthesisStage >= 3
                          ? 'Vector map synchronized'
                          : 'Computing state match scores...'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
