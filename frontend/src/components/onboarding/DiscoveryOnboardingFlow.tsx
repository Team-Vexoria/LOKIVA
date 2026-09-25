import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  MapPin,
} from 'lucide-react';

export interface DiscoveryAnswers {
  destination: string;
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

export const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
export const DAY_MILESTONES = [1, 3, 5, 7, 10, 14, 21];

export const BUDGET_VALUES = [1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 15000, 20000, 25000];
export const BUDGET_MILESTONES = [1000, 3000, 5000, 10000, 15000, 25000];
export const BUDGET_OPTIONS = BUDGET_VALUES;

export const DEFAULT_DISCOVERY_ANSWERS: DiscoveryAnswers = {
  destination: 'Smart Match',
  interests: ['heritage', 'crafts', 'food'],
  days: 5,
  time_available_minutes: 2400,
  budget_daily_inr: 5000,
  budget_max_inr: 25000,
  group_type: 'couple',
  group_size: 2,
  pace: 'balanced',
  accessibility: {
    low_walking: false,
    wheelchair: false,
    step_free: false,
  },
};

const DESTINATION_HUBS = [
  {
    id: 'Smart Match',
    title: 'Smart Match for my Vibe',
    subtitle: 'Recommended: Automatically matches the ideal Indian hub based on your cultural interests',
    badge: 'AI Curated',
    icon: Sparkles,
  },
  {
    id: 'Kochi',
    title: 'Kochi, Kerala',
    subtitle: 'Backwater canals, spice warehouses, Kathakali dance & Ayurvedic sanctuaries',
    badge: 'Wellness & Nature',
    icon: Mountain,
  },
  {
    id: 'Ladakh',
    title: 'Leh, Ladakh',
    subtitle: 'High-altitude monasteries, ancient Silk Route passes & starry mountain valleys',
    badge: 'Frontiers & Monasteries',
    icon: Mountain,
  },
  {
    id: 'Mumbai',
    title: 'Mumbai, Maharashtra',
    subtitle: 'Art Deco enclaves, colonial architecture, Parsi cafes & coastal bazaars',
    badge: 'Arts & Culture',
    icon: Compass,
  },
  {
    id: 'Jaipur',
    title: 'Jaipur, Rajasthan',
    subtitle: 'Golden havelis, royal citadels & living hand-block printing guilds',
    badge: 'Crafts & Palaces',
    icon: Landmark,
  },
  {
    id: 'Varanasi',
    title: 'Varanasi, Uttar Pradesh',
    subtitle: 'Ancient stone ghats, silk handlooms & evening Ganga Aarti ceremonies',
    badge: 'Sacred Rituals',
    icon: Flame,
  },
  {
    id: 'Delhi',
    title: 'Delhi, National Capital',
    subtitle: 'Mughal sandstone masterpieces, spice markets & century-old culinary lanes',
    badge: 'Gastronomy & History',
    icon: Utensils,
  },
  {
    id: 'Udaipur',
    title: 'Udaipur, Rajasthan',
    subtitle: 'Lakeside palaces, marble stepwells & Mewari miniature painting guilds',
    badge: 'Romantic Heritage',
    icon: Heart,
  },
  {
    id: 'Amritsar',
    title: 'Amritsar, Punjab',
    subtitle: 'Harmandir Sahib golden sanctuary, community langar & Phulkari handcraft',
    badge: 'Spiritual & Food',
    icon: Landmark,
  },
];

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
  onComplete: (answers: DiscoveryAnswers) => Promise<void> | void;
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
  const [destination, setDestination] = useState<string>(
    initialAnswers?.destination || 'Smart Match'
  );
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

  // Synthesis & loading state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<number>(1);
  const [computedCity, setComputedCity] = useState<string>('Jaipur');

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
        if (currentStep < 7) {
          handleNext();
        } else if (currentStep === 7) {
          handleStartSynthesis();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isSynthesizing, destination, interests, days, budgetDaily, groupType, paceVal, accessibility]);

  const handleNext = () => {
    if (currentStep < 7) {
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

  const resolveSmartCity = (
    dest: string,
    userInterests: string[],
    dailyBudget: number,
    chosenGroup: 'solo' | 'couple' | 'family' | 'friends',
    chosenPace: 'relaxed' | 'balanced' | 'packed'
  ): string => {
    if (dest && dest !== 'Smart Match') {
      if (dest === 'Ladakh') return 'Leh';
      return dest;
    }

    const validInterests = userInterests && userInterests.length > 0 ? userInterests : ['heritage', 'crafts', 'food'];

    const hubs = [
      {
        city: 'Varanasi',
        scores: { rituals: 10, offbeat: 8, crafts: 6, food: 7, heritage: 7, monuments: 4, wellness: 6, nature: 3, markets: 5, arts: 6 },
        budgetTier: 'budget',
        groupTypes: ['solo', 'couple', 'family'],
        paces: ['balanced', 'packed'],
      },
      {
        city: 'Rishikesh',
        scores: { wellness: 10, rituals: 9, nature: 8, offbeat: 7, food: 5, arts: 4, heritage: 4, monuments: 3, markets: 4, crafts: 3 },
        budgetTier: 'budget',
        groupTypes: ['solo', 'friends', 'couple'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Jaipur',
        scores: { crafts: 10, heritage: 10, markets: 9, monuments: 8, food: 7, arts: 7, offbeat: 5, rituals: 5, nature: 3, wellness: 4 },
        budgetTier: 'all',
        groupTypes: ['family', 'couple', 'friends'],
        paces: ['balanced', 'packed'],
      },
      {
        city: 'Udaipur',
        scores: { heritage: 9, nature: 9, arts: 8, crafts: 7, wellness: 6, monuments: 7, food: 6, offbeat: 6, markets: 6, rituals: 4 },
        budgetTier: 'luxury',
        groupTypes: ['couple', 'family'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Jaisalmer',
        scores: { offbeat: 9, heritage: 9, monuments: 8, crafts: 7, arts: 7, markets: 6, nature: 6, food: 5, rituals: 3, wellness: 3 },
        budgetTier: 'all',
        groupTypes: ['couple', 'friends', 'solo'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Leh',
        scores: { nature: 10, offbeat: 10, rituals: 8, monuments: 7, heritage: 6, wellness: 5, crafts: 5, food: 4, markets: 4, arts: 4 },
        budgetTier: 'luxury',
        groupTypes: ['solo', 'friends', 'couple'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Kochi',
        scores: { wellness: 9, nature: 8, arts: 8, heritage: 7, food: 7, markets: 6, offbeat: 6, crafts: 5, rituals: 5, monuments: 4 },
        budgetTier: 'all',
        groupTypes: ['couple', 'solo', 'family'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Amritsar',
        scores: { rituals: 10, food: 10, heritage: 7, monuments: 6, crafts: 6, markets: 7, offbeat: 5, wellness: 4, arts: 4, nature: 2 },
        budgetTier: 'budget',
        groupTypes: ['family', 'solo', 'friends'],
        paces: ['balanced', 'packed'],
      },
      {
        city: 'Delhi',
        scores: { food: 10, monuments: 10, heritage: 9, markets: 10, offbeat: 7, arts: 6, crafts: 5, rituals: 5, nature: 3, wellness: 2 },
        budgetTier: 'all',
        groupTypes: ['family', 'friends', 'solo'],
        paces: ['packed', 'balanced'],
      },
      {
        city: 'Mumbai',
        scores: { arts: 9, markets: 8, food: 9, heritage: 7, offbeat: 8, nature: 4, monuments: 5, rituals: 4, crafts: 4, wellness: 3 },
        budgetTier: 'luxury',
        groupTypes: ['friends', 'couple', 'solo'],
        paces: ['packed', 'balanced'],
      },
      {
        city: 'Kolkata',
        scores: { food: 10, arts: 10, heritage: 8, crafts: 8, offbeat: 8, markets: 7, rituals: 6, monuments: 5, nature: 3, wellness: 3 },
        budgetTier: 'all',
        groupTypes: ['solo', 'couple', 'family'],
        paces: ['packed', 'balanced'],
      },
      {
        city: 'Shillong',
        scores: { nature: 10, offbeat: 9, arts: 8, wellness: 6, food: 6, crafts: 5, markets: 5, heritage: 4, monuments: 2, rituals: 2 },
        budgetTier: 'all',
        groupTypes: ['friends', 'couple', 'solo'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Bhubaneswar',
        scores: { monuments: 10, crafts: 9, rituals: 8, heritage: 8, arts: 8, offbeat: 6, food: 6, nature: 5, markets: 5, wellness: 3 },
        budgetTier: 'budget',
        groupTypes: ['family', 'solo', 'couple'],
        paces: ['balanced', 'relaxed'],
      },
      {
        city: 'Ahmedabad',
        scores: { crafts: 9, heritage: 9, food: 8, offbeat: 8, markets: 8, monuments: 7, rituals: 5, arts: 5, wellness: 3, nature: 2 },
        budgetTier: 'all',
        groupTypes: ['family', 'couple', 'solo'],
        paces: ['balanced', 'packed'],
      },
      {
        city: 'Goa',
        scores: { nature: 9, wellness: 8, offbeat: 8, food: 8, markets: 7, heritage: 7, arts: 6, rituals: 4, monuments: 4, crafts: 4 },
        budgetTier: 'luxury',
        groupTypes: ['friends', 'couple'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Hyderabad',
        scores: { food: 10, heritage: 8, monuments: 8, markets: 8, crafts: 7, offbeat: 6, arts: 5, rituals: 4, wellness: 3, nature: 3 },
        budgetTier: 'all',
        groupTypes: ['family', 'friends', 'couple'],
        paces: ['packed', 'balanced'],
      },
      {
        city: 'Chennai',
        scores: { arts: 10, rituals: 9, food: 8, heritage: 7, crafts: 7, monuments: 6, markets: 6, wellness: 5, offbeat: 5, nature: 4 },
        budgetTier: 'all',
        groupTypes: ['family', 'solo', 'couple'],
        paces: ['balanced', 'packed'],
      },
      {
        city: 'Srinagar',
        scores: { nature: 10, crafts: 9, heritage: 7, food: 7, offbeat: 7, wellness: 6, markets: 6, monuments: 5, arts: 5, rituals: 4 },
        budgetTier: 'luxury',
        groupTypes: ['couple', 'family'],
        paces: ['relaxed', 'balanced'],
      },
      {
        city: 'Bhopal',
        scores: { monuments: 9, arts: 8, heritage: 8, crafts: 8, nature: 7, offbeat: 7, food: 6, markets: 5, rituals: 4, wellness: 4 },
        budgetTier: 'budget',
        groupTypes: ['family', 'solo'],
        paces: ['balanced', 'relaxed'],
      },
      {
        city: 'Shimla',
        scores: { nature: 9, heritage: 7, offbeat: 7, wellness: 6, monuments: 6, food: 5, arts: 4, markets: 5, crafts: 4, rituals: 3 },
        budgetTier: 'all',
        groupTypes: ['couple', 'family', 'friends'],
        paces: ['relaxed', 'balanced'],
      },
    ];

    const scoredHubs = hubs.map((hub) => {
      let score = 0;

      // 1. Direct interest score match
      for (const interest of validInterests) {
        score += (hub.scores as Record<string, number>)[interest] || 0;
      }

      // 2. Budget affinity calibration
      if (dailyBudget <= 3000 && (hub.budgetTier === 'budget' || hub.budgetTier === 'all')) {
        score += 3;
      } else if (dailyBudget >= 8000 && (hub.budgetTier === 'luxury' || hub.budgetTier === 'all')) {
        score += 3;
      } else if (dailyBudget > 3000 && dailyBudget < 8000) {
        score += 2;
      }

      // 3. Group type affinity
      if (hub.groupTypes.includes(chosenGroup)) {
        score += 3;
      }

      // 4. Pace category affinity
      if (hub.paces.includes(chosenPace)) {
        score += 2;
      }

      return { city: hub.city, score };
    });

    scoredHubs.sort((a, b) => b.score - a.score);

    // If top contenders are tied, use deterministic hash to select consistently
    const topScore = scoredHubs[0].score;
    const candidates = scoredHubs.filter((h) => h.score >= topScore - 1);
    if (candidates.length === 1) return candidates[0].city;

    const seedString = `${validInterests.join('-')}_${dailyBudget}_${chosenGroup}_${chosenPace}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % candidates.length;
    return candidates[index].city;
  };

  const handleStartSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthesisStage(1);

    const pace = getPaceCategory(paceVal);
    const groupMeta = GROUP_OPTIONS.find((g) => g.id === groupType);
    const finalCity = resolveSmartCity(destination, interests, budgetDaily, groupType, pace);
    setComputedCity(finalCity);

    const answers: DiscoveryAnswers = {
      destination: finalCity,
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
      localStorage.setItem('has_onboarded_lokiva', 'true');
      localStorage.setItem('lokiva_onboarding_last_shown', Date.now().toString());
    } catch {}

    // Honest progression of synthesis stages
    await new Promise((r) => setTimeout(r, 500));
    setSynthesisStage(2);
    await new Promise((r) => setTimeout(r, 600));
    setSynthesisStage(3);

    // Keep synthesis view displayed while onComplete executes (prevents bouncing back to question 6/7)
    try {
      await onComplete(answers);
    } catch (err) {
      console.warn('Onboarding completion error handled:', err);
    } finally {
      // Cleanly reset after parent modal has closed
      setCurrentStep(1);
      setIsSynthesizing(false);
    }
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

  const formattedBudgetDaily = budgetDaily >= 25000
    ? '₹25,000+'
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(budgetDaily);

  const formattedTotalBudget = budgetDaily >= 25000
    ? `₹${(25000 * days).toLocaleString('en-IN')}+`
    : new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(budgetDaily * days);

  if (!isOpen) return null;

  const content = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-[#12213B]/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#E5DFD5] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto"
          style={{ maxHeight: 'min(90vh, 650px)' }}
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
                    animate={{ width: `${(currentStep / 7) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <span className="text-[11px] font-mono text-dusk-600 font-semibold tracking-wider">
                  {currentStep} of 7
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
          <div className="p-5 sm:p-7 overflow-y-auto flex-1 min-h-[360px] flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ======================================================= */}
              {/* STEP 1: DESTINATION HUB (NEW: TARGET SPECIFIC REGION)   */}
              {/* ======================================================= */}
              {currentStep === 1 && !isSynthesizing && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-1.5 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 1: Destination Context
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Where would you like to explore?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Choose a cultural hub or select Smart Match to let Lokiva pair you with the best region.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-1 max-h-[260px] overflow-y-auto pr-1">
                    {DESTINATION_HUBS.map((hub) => {
                      const isSelected = destination === hub.id;
                      const Icon = hub.icon;

                      return (
                        <motion.button
                          key={hub.id}
                          type="button"
                          onClick={() => setDestination(hub.id)}
                          whileHover={{ scale: 1.01, y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer border flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#FFFDF9] border-[#FFC067] ring-2 ring-[#FFC067] shadow-[0_4px_16px_rgba(255,192,103,0.25)]'
                              : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${isSelected ? 'text-[#C85A32]' : 'text-dusk-600'}`} />
                              <span className="font-heading font-bold text-sm text-[#12213B]">
                                {hub.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2 py-0.5 rounded-full">
                              {hub.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-dusk-600 leading-snug line-clamp-2">
                            {hub.subtitle}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between">
                    <span className="text-xs font-mono text-[#C85A32] font-semibold">
                      Selected: {destination}
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
              {/* STEP 2: INTERESTS (MULTI-SELECT CHIP CLOUD)              */}
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
                      Question 2: Cultural Affinity
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What experiences draw you in most?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Tap the cultural threads you want woven into your itinerary. Every chosen interest directly creates matching stops.
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
              {/* STEP 3: TIME AVAILABLE (TACTILE SLIDER WITH BIG NUMBER)   */}
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
                      Question 3: Time Available
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

                  {/* Days Slider - slider index maps 1:1 to milestone array, labels evenly distributed */}
                  <div className="space-y-3 px-2">
                    <input
                      type="range"
                      min={0}
                      max={DAY_MILESTONES.length - 1}
                      step={1}
                      value={(() => {
                        const exact = DAY_MILESTONES.indexOf(days);
                        if (exact !== -1) return exact;
                        return DAY_MILESTONES.reduce(
                          (best, val, idx) =>
                            Math.abs(val - days) < Math.abs(DAY_MILESTONES[best] - days) ? idx : best,
                          0
                        );
                      })()}
                      onChange={(e) => setDays(DAY_MILESTONES[parseInt(e.target.value, 10)])}
                      className="w-full h-2.5 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                      aria-label="Trip duration in days"
                    />

                    {/* flex justify-between works perfectly because slider steps equal label count */}
                    <div className="flex justify-between text-[11px] font-mono font-semibold">
                      {DAY_MILESTONES.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDays(d)}
                          className={`transition-colors hover:text-[#C85A32] cursor-pointer ${
                            days === d ? 'text-[#C85A32] font-bold underline' : 'text-dusk-600'
                          }`}
                        >
                          {d} {d === 1 ? 'Day' : 'Days'}
                        </button>
                      ))}
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
              {/* STEP 4: BUDGET CEILING (LIVE INDIAN CURRENCY SLIDER)     */}
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
                      Question 4: Financial Comfort
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What is your comfortable spending range?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Per day for your entire party. Stop entry passes, craft fees, and food are calculated directly from this amount.
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

                  {/* Budget Slider - slider index maps 1:1 to milestone array, labels evenly distributed */}
                  <div className="space-y-3 px-2">
                    <input
                      type="range"
                      min={0}
                      max={BUDGET_MILESTONES.length - 1}
                      step={1}
                      value={(() => {
                        const exact = BUDGET_MILESTONES.indexOf(budgetDaily);
                        if (exact !== -1) return exact;
                        return BUDGET_MILESTONES.reduce(
                          (best, val, idx) =>
                            Math.abs(val - budgetDaily) < Math.abs(BUDGET_MILESTONES[best] - budgetDaily) ? idx : best,
                          0
                        );
                      })()}
                      onChange={(e) => setBudgetDaily(BUDGET_MILESTONES[parseInt(e.target.value, 10)])}
                      className="w-full h-2.5 bg-[#E5DFD5] rounded-lg appearance-none cursor-pointer accent-[#C85A32]"
                      aria-label="Daily budget in INR"
                    />

                    {/* flex justify-between works perfectly because slider steps equal label count */}
                    <div className="flex justify-between text-[11px] font-mono font-semibold">
                      {BUDGET_MILESTONES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudgetDaily(b)}
                          className={`transition-colors hover:text-[#C85A32] cursor-pointer ${
                            budgetDaily === b ? 'text-[#C85A32] font-bold underline' : 'text-dusk-600'
                          }`}
                        >
                          ₹{b >= 1000 ? `${b / 1000}k` : b}{b >= 25000 ? '+' : ''}
                        </button>
                      ))}
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
              {/* STEP 5: GROUP SIZE / TRAVEL TYPE (ILLUSTRATED CARDS)     */}
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
                      Question 5: Travel Companions
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
              {/* STEP 6: TRAVEL PACE (TWO-ENDED SPECTRUM SLIDER)          */}
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
                      Question 6: Travel Rhythm & Pace
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
              {/* STEP 7: ACCESSIBILITY NEEDS (OPTIONAL & GENTLE)          */}
              {/* ======================================================= */}
              {currentStep === 7 && !isSynthesizing && (
                <motion.div
                  key="step-7"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32]">
                      Question 7: Accessibility (Optional)
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
                      className="text-xs font-mono text-dusk-600 hover:text-[#12213B] transition-colors cursor-pointer"
                    >
                      Skip mobility preferences
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
              {/* FINAL STEP: SYNTHESIS MOMENT (PERSISTENT LOADING STATE)  */}
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
                      Synthesizing Your {computedCity} Route
                    </h3>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans">
                      Aligning your exact budget of {formattedBudgetDaily}/day and {interests.length} cultural affinities with verified local artisans and live schedules.
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
                      {computedCity}
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
                          ? `Enforcing hard ceiling of ${formattedBudgetDaily}/day`
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
                          ? `Matching ${interests.length} affinities in ${computedCity}`
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
                          ? 'Feasible plan compiled & ready'
                          : 'Computing schedule fit...'}
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

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}
