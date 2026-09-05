import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Coins,
  Users,
  Compass,
  Utensils,
  Footprints,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Loader2,
  Navigation,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Car,
  User,
  Heart,
  Smile,
  Landmark,
  Palette,
  Leaf,
  ShoppingBag,
  Salad,
  Sprout,
  Flame,
  Award,
  Accessibility,
  Mountain,
  Coffee,
  Zap,
  Scale,
} from 'lucide-react';
import {
  SquiggleUnderline,
  HandDrawnCircle,
  HandDrawnSparkle,
  StampBadge,
  HandDrawnProgressTrail,
} from '../ui/HandDrawnAnnotations';
import { api } from '../../lib/api';
import { Experience, DayPlanResponse } from '../../types';

export interface TripContextAnswers {
  city: string;
  timeWindow: string;
  timeHours: number;
  budgetCeiling: number;
  companions: string;
  interests: string[];
  foodPreference: string;
  foodNotes: string;
  mobility: string;
  isWheelchair: boolean;
  isLowWalking: boolean;
  vibe: string;
}

const SUPPORTED_CITIES = [
  'Jaipur',
  'Mumbai',
  'Delhi',
  'Bengaluru',
  'Goa',
  'Pune',
  'Kochi',
  'Kolkata',
  'Varanasi',
  'Udaipur',
];

const TIME_OPTIONS = [
  { id: '2h', label: '2 Hours', desc: 'Quick Cultural Sprint', hours: 2, badge: 'Sprint' },
  { id: 'half', label: 'Half Day (4–5 Hours)', desc: 'Morning or afternoon deep-dive', hours: 4.5, badge: 'Popular' },
  { id: 'full', label: 'Full Day (8 Hours)', desc: 'Complete sunrise-to-sunset route', hours: 8, badge: 'Thorough' },
  { id: 'multi', label: 'Multiple Days', desc: 'Curated weekend or 3-day circuit', hours: 16, badge: 'Extended' },
  { id: 'custom', label: 'Custom Hours', desc: 'Specify exact free time window', hours: 3, badge: 'Flexible' },
];

const BUDGET_OPTIONS = [
  { id: '500', label: '₹500', desc: 'Free monuments, heritage walks, street tea', amount: 500 },
  { id: '1500', label: '₹1,500', desc: 'Entry tickets, tasting trail, local rickshaws', amount: 1500, badge: 'Balanced' },
  { id: '3000', label: '₹3,000', desc: 'Artisan masterclasses, haveli passes, tastings', amount: 3000 },
  { id: '5000', label: '₹5,000+', desc: 'Private royal quarters & master ateliers', amount: 5000 },
  { id: 'custom', label: 'Custom Ceiling', desc: 'Set your exact maximum spend', amount: 2000 },
];

const COMPANIONS_OPTIONS = [
  { id: 'solo', label: 'Solo Explorer', desc: 'Fast-paced, introspective, spontaneous', icon: <User className="w-5 h-5 text-[#F0A63B]" /> },
  { id: 'couple', label: 'Couple / Partner', desc: 'Atmospheric courtyards, quiet sunsets', icon: <Heart className="w-5 h-5 text-[#D85A38]" /> },
  { id: 'family', label: 'Family with Kids', desc: 'Engaging, shaded, frequent rest stops', icon: <Users className="w-5 h-5 text-[#1F7A6C]" /> },
  { id: 'friends', label: 'Friends Group', desc: 'Vibrant, food-centric, photo-worthy', icon: <Smile className="w-5 h-5 text-[#F0A63B]" /> },
];

const INTERESTS_OPTIONS = [
  { id: 'heritage', label: 'Heritage & History', desc: 'Ancient stepwells, fort ruins, royal havelis', icon: <Landmark className="w-5 h-5 text-[#D85A38]" /> },
  { id: 'food', label: 'Food & Street Eats', desc: 'Century-old recipes, secret sweets, tea stalls', icon: <Utensils className="w-5 h-5 text-[#F0A63B]" /> },
  { id: 'art', label: 'Art & Local Markets', desc: 'Block printing, blue pottery, weaver guilds', icon: <Palette className="w-5 h-5 text-[#1F7A6C]" /> },
  { id: 'nature', label: 'Nature & Scenic Spots', desc: 'Rooftop vistas, lake ghats, lush gardens', icon: <Leaf className="w-5 h-5 text-[#2D8978]" /> },
  { id: 'shopping', label: 'Shopping & Craft Bazaars', desc: 'Spices, handlooms, brassware, perfumeries', icon: <ShoppingBag className="w-5 h-5 text-[#AC6A15]" /> },
  { id: 'offbeat', label: 'Offbeat & Hidden Alleyways', desc: 'Undiscovered lanes away from tourist crowds', icon: <Compass className="w-5 h-5 text-[#1F7A6C]" /> },
];

const FOOD_OPTIONS = [
  { id: 'veg', label: 'Pure Vegetarian', desc: 'Strictly vegetarian kitchens & street carts', icon: <Salad className="w-5 h-5 text-[#2D8978]" /> },
  { id: 'vegan', label: '100% Plant-Based / Vegan', desc: 'Dairy-free, cruelty-free local food', icon: <Sprout className="w-5 h-5 text-[#1F7A6C]" /> },
  { id: 'jain', label: 'Jain Friendly', desc: 'No root vegetables (onion, garlic, potato)', icon: <Flame className="w-5 h-5 text-[#F0A63B]" /> },
  { id: 'halal', label: 'Halal Certified', desc: 'Permissible halal food & historic dining', icon: <Award className="w-5 h-5 text-[#D85A38]" /> },
  { id: 'none', label: 'No Restrictions', desc: 'Eats anything authentic and tasty', icon: <Sparkles className="w-5 h-5 text-[#F0A63B]" /> },
];

const MOBILITY_OPTIONS = [
  {
    id: 'wheelchair',
    label: 'Wheelchair-Friendly & Step-Free',
    desc: 'Mandatory elevators, ramps, no stairs or broken flagstones',
    icon: <Accessibility className="w-6 h-6 text-[#1F7A6C]" />,
    wheelchair: true,
    lowWalking: true,
  },
  {
    id: 'low_walking',
    label: 'Low Walking (Shaded & Close-Hops)',
    desc: 'Max 300–400m between stops, comfortable sitting breaks',
    icon: <Footprints className="w-6 h-6 text-[#F0A63B]" />,
    wheelchair: false,
    lowWalking: true,
  },
  {
    id: 'moderate',
    label: 'Moderate Walking is Fine',
    desc: 'Happy to walk 1–3 km through historic bazaars at comfortable pace',
    icon: <Navigation className="w-6 h-6 text-[#D85A38]" />,
    wheelchair: false,
    lowWalking: false,
  },
  {
    id: 'active',
    label: 'Active Pedestrian Explorer',
    desc: 'Can climb fort ramparts, stepwells, and long walking trails',
    icon: <Mountain className="w-6 h-6 text-[#12213B]" />,
    wheelchair: false,
    lowWalking: false,
  },
];

const VIBE_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed & Slow', desc: 'Breathe, linger in courtyards, no clock-watching', icon: <Coffee className="w-6 h-6 text-[#2D8978]" /> },
  { id: 'efficient', label: 'Efficient & Packed', desc: 'Maximize your time with high-density cultural gems', icon: <Zap className="w-6 h-6 text-[#F0A63B]" /> },
  { id: 'balanced', label: 'A Balanced Mix', desc: 'High-energy morning exploration + leisurely afternoon tea', icon: <Scale className="w-6 h-6 text-[#D85A38]" /> },
];

interface TripOnboardingTakeoverProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (answers: TripContextAnswers, plan: DayPlanResponse) => void;
}

export function TripOnboardingTakeover({
  isOpen,
  onClose,
  onPlanGenerated,
}: TripOnboardingTakeoverProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [direction, setDirection] = useState<number>(1);

  // Form Answers State
  const [city, setCity] = useState<string>('Jaipur');
  const [citySearch, setCitySearch] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const [timeWindow, setTimeWindow] = useState<string>('half');
  const [customHours, setCustomHours] = useState<number>(4);

  const [budgetOption, setBudgetOption] = useState<string>('1500');
  const [customBudget, setCustomBudget] = useState<number>(2000);

  const [companions, setCompanions] = useState<string>('solo');
  const [interests, setInterests] = useState<string[]>(['heritage', 'food']);

  const [foodPreference, setFoodPreference] = useState<string>('veg');
  const [foodNotes, setFoodNotes] = useState<string>('');

  const [mobility, setMobility] = useState<string>('moderate');
  const [vibe, setVibe] = useState<string>('balanced');

  // Solving State (End State)
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [dayPlan, setDayPlan] = useState<DayPlanResponse | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [solvedPlanReady, setSolvedPlanReady] = useState<boolean>(false);

  // Prefers reduced motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  // Keyboard navigation: Enter to advance, Esc to go back/close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (currentStep > 1 && !isSolving && !solvedPlanReady) {
          handleBack();
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && !isSolving && !solvedPlanReady) {
        // Allow enter if textareas or inputs aren't blocking
        if (currentStep < 8) {
          handleNext();
        } else if (currentStep === 8) {
          handleGeneratePlan();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isSolving, solvedPlanReady, city, timeWindow, budgetOption, companions, interests, foodPreference, mobility, vibe]);

  const handleNext = () => {
    if (currentStep < 8) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  // Location Geolocation Trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const nearbyRes = await api.getNearbyDestinations(latitude, longitude, 300);
          if (nearbyRes?.nearest_city?.name) {
            setCity(nearbyRes.nearest_city.name);
          } else {
            setCity('Jaipur');
          }
        } catch {
          setCity('Jaipur');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 5000 }
    );
  };

  // Toggle Interests Multi-Select
  const toggleInterest = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Compute final Answers Object
  const getAnswersObject = (): TripContextAnswers => {
    const selectedTime = TIME_OPTIONS.find((t) => t.id === timeWindow);
    const finalHours = timeWindow === 'custom' ? customHours : (selectedTime?.hours || 4);

    const selectedBudget = BUDGET_OPTIONS.find((b) => b.id === budgetOption);
    const finalBudget = budgetOption === 'custom' ? customBudget : (selectedBudget?.amount || 1500);

    const selectedMobility = MOBILITY_OPTIONS.find((m) => m.id === mobility);

    return {
      city,
      timeWindow,
      timeHours: finalHours,
      budgetCeiling: finalBudget,
      companions,
      interests,
      foodPreference,
      foodNotes,
      mobility,
      isWheelchair: Boolean(selectedMobility?.wheelchair),
      isLowWalking: Boolean(selectedMobility?.lowWalking),
      vibe,
    };
  };

  // End State: Solving & Feasibility packing via Gemini
  const handleGeneratePlan = async () => {
    setIsSolving(true);
    setPlanError(null);
    const answers = getAnswersObject();

    const selectedTime = TIME_OPTIONS.find((t) => t.id === answers.timeWindow);
    const timeAvailableStr =
      answers.timeWindow === 'custom'
        ? `${answers.timeHours} Hours`
        : selectedTime?.label || 'Half Day (4–5 Hours)';

    const selectedBudget = BUDGET_OPTIONS.find((b) => b.id === budgetOption);
    const budgetStr =
      budgetOption === 'custom'
        ? `₹${customBudget}`
        : selectedBudget?.label || '₹1,500';

    const groupStr =
      COMPANIONS_OPTIONS.find((c) => c.id === answers.companions)?.label ||
      'Solo Explorer';

    const interestsList = answers.interests.map(
      (id) => INTERESTS_OPTIONS.find((i) => i.id === id)?.label || id
    );

    const foodStr = `${FOOD_OPTIONS.find((f) => f.id === answers.foodPreference)?.label || 'Pure Vegetarian'}${
      answers.foodNotes ? ` (${answers.foodNotes})` : ''
    }`;

    const mobilityStr =
      MOBILITY_OPTIONS.find((m) => m.id === answers.mobility)?.label ||
      'Moderate Walking is Fine';

    const vibeStr =
      VIBE_OPTIONS.find((v) => v.id === answers.vibe)?.label || 'A Balanced Mix';

    const payload = {
      destination: answers.city,
      time_available: timeAvailableStr,
      budget: budgetStr,
      group_type: groupStr,
      interests: interestsList,
      food_preferences: foodStr,
      mobility: mobilityStr,
      vibe: vibeStr,
    };

    try {
      const plan = await api.generateDayPlan(payload);
      setDayPlan(plan);
      setSolvedPlanReady(true);
      onPlanGenerated(answers, plan);
    } catch (err: any) {
      console.warn('Initial plan generation failed, retrying once...', err);
      try {
        const retryPlan = await api.generateDayPlan(payload);
        setDayPlan(retryPlan);
        setSolvedPlanReady(true);
        onPlanGenerated(answers, retryPlan);
      } catch (retryErr: any) {
        console.error('Day plan generation failed after retry:', retryErr);
        // Explicit error state per spec - do NOT silently fall back to mock data
        setPlanError(
          retryErr?.message ||
            'Unable to generate day plan for these constraints. Please try again or adjust your parameters.'
        );
      }
    } finally {
      setIsSolving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-[#EEF1EE]/95 backdrop-blur-md overflow-y-auto flex flex-col justify-between p-3 sm:p-6 lg:p-10 select-none">
        {/* Top Header: Progress & Close Button */}
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between pb-3 sm:pb-4 border-b border-[#D0D7CF]">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="font-display font-extrabold text-xl sm:text-2xl text-[#12213B] tracking-tight">
              LOKIVA
            </span>
            <StampBadge text="ONBOARDING ENGINE" />
          </div>

          <div className="flex items-center gap-4">
            {currentStep > 1 && !solvedPlanReady && (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5B6B8C] hover:text-[#12213B] px-3 py-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#D0D7CF] transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white text-[#5B6B8C] hover:text-[#12213B] transition border border-transparent hover:border-[#D0D7CF] cursor-pointer"
              aria-label="Close question flow"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Milestone Progress Trail (1 to 8) */}
        {!solvedPlanReady && (
          <div className="w-full max-w-3xl mx-auto py-3">
            <HandDrawnProgressTrail
              currentStep={currentStep}
              totalSteps={8}
              onStepClick={(step) => setCurrentStep(step)}
            />
            <div className="text-center">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6B8C] font-semibold">
                Question {currentStep} of 8
              </span>
            </div>
          </div>
        )}

        {/* Central Stage: Animated Questions */}
        <main className="w-full max-w-3xl mx-auto my-auto py-6">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ======================================================= */}
            {/* QUESTION 1: DESTINATION                                  */}
            {/* ======================================================= */}
            {currentStep === 1 && !solvedPlanReady && (
              <motion.div
                key="step-1"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#F0A63B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F0A63B] inline-block" />
                    <span>Step 1: Destination Context</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    Where are you headed?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    Pick a heritage hub or let us detect where you're starting from right now.
                  </p>
                </div>

                {/* Geolocation Button */}
                <div className="flex flex-wrap gap-3 items-center">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FAFBF9] border border-[#D0D7CF] hover:border-[#12213B] text-xs font-mono font-bold text-[#12213B] flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    {isLocating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F0A63B]" />
                    ) : (
                      <Navigation className="w-3.5 h-3.5 text-[#F0A63B]" />
                    )}
                    <span>{isLocating ? 'Detecting your coordinates…' : 'Use my current location'}</span>
                  </button>

                  <span className="text-xs font-mono text-[#5B6B8C]">or choose below</span>
                </div>

                {/* City Chips Selection with Hand-Cut Stamp Style */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {SUPPORTED_CITIES.map((c) => {
                    const isSelected = city === c;

                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setCity(c);
                        }}
                        className={`relative p-3.5 rounded-xl text-center font-mono text-xs font-bold transition-all duration-200 border cursor-pointer ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] shadow-md scale-105 rotate-1'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF] hover:border-[#5B6B8C]'
                        }`}
                      >
                        {isSelected && <HandDrawnCircle />}
                        <span>{c}</span>
                        {isSelected && (
                          <span className="block text-[10px] text-[#F0A63B] font-mono mt-0.5 font-normal">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 2: TIME WINDOW                                  */}
            {/* ======================================================= */}
            {currentStep === 2 && !solvedPlanReady && (
              <motion.div
                key="step-2"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#F0A63B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F0A63B] inline-block" />
                    <span>Step 2: Real Time Constraint</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    How much time do you have?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    We calculate travel isochrones, auto traffic, and opening schedules so you never rush.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {TIME_OPTIONS.map((opt) => {
                    const isSelected = timeWindow === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setTimeWindow(opt.id);
                        }}
                        className={`relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] shadow-md ring-2 ring-[#F0A63B]'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-base">{opt.label}</span>
                          {opt.badge && (
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                                isSelected ? 'bg-[#F0A63B] text-[#12213B]' : 'bg-[#EEF1EE] text-[#5B6B8C]'
                              }`}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 font-sans ${
                            isSelected ? 'text-[#D0D7CF]' : 'text-[#5B6B8C]'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Hours Input if selected */}
                {timeWindow === 'custom' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#F0A63B] space-y-2">
                    <label className="text-xs font-mono font-bold text-[#12213B] block">
                      Enter exact available hours:
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="16"
                        step="0.5"
                        value={customHours}
                        onChange={(e) => setCustomHours(parseFloat(e.target.value) || 1)}
                        className="w-28 px-3 py-2 text-sm font-mono font-bold text-[#12213B] bg-[#EEF1EE] rounded-xl border border-[#D0D7CF] focus:outline-none focus:border-[#F0A63B]"
                      />
                      <span className="text-xs font-mono text-[#5B6B8C]">
                        Hours (Includes buffers)
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 3: BUDGET CEILING                               */}
            {/* ======================================================= */}
            {currentStep === 3 && !solvedPlanReady && (
              <motion.div
                key="step-3"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#1F7A6C] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#1F7A6C] inline-block" />
                    <span>Step 3: Hard Financial Wall</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    What's your budget ceiling?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    Lokiva treats this as a hard wall: every entry ticket, chai stop, and auto fare fits inside.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {BUDGET_OPTIONS.map((opt) => {
                    const isSelected = budgetOption === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setBudgetOption(opt.id);
                        }}
                        className={`relative p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F7A6C] text-white border-[#1F7A6C] shadow-md ring-2 ring-[#F0A63B]'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-extrabold text-base">{opt.label}</span>
                          {opt.badge && (
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                                isSelected ? 'bg-[#F0A63B] text-[#12213B]' : 'bg-[#EEF1EE] text-[#5B6B8C]'
                              }`}
                            >
                              {opt.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs mt-1 font-sans ${
                            isSelected ? 'text-[#EEF1EE]/90' : 'text-[#5B6B8C]'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {budgetOption === 'custom' && (
                  <div className="p-4 bg-white rounded-2xl border border-[#1F7A6C] space-y-2">
                    <label className="text-xs font-mono font-bold text-[#12213B] block">
                      Enter maximum total budget (₹):
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="200"
                        max="25000"
                        step="100"
                        value={customBudget}
                        onChange={(e) => setCustomBudget(parseInt(e.target.value, 10) || 500)}
                        className="w-36 px-3 py-2 text-sm font-mono font-bold text-[#12213B] bg-[#EEF1EE] rounded-xl border border-[#D0D7CF] focus:outline-none focus:border-[#1F7A6C]"
                      />
                      <span className="text-xs font-mono text-[#5B6B8C]">
                        INR (Never exceeded)
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 4: WHO'S THIS FOR                               */}
            {/* ======================================================= */}
            {currentStep === 4 && !solvedPlanReady && (
              <motion.div
                key="step-4"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#F0A63B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#F0A63B] inline-block" />
                    <span>Step 4: Traveling Companions</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    Who's traveling with you?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    Helps us calibrate pace, rest stops, seating, and joint happiness.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {COMPANIONS_OPTIONS.map((opt) => {
                    const isSelected = companions === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setCompanions(opt.id);
                        }}
                        className={`p-4 rounded-2xl text-left border transition-all duration-200 flex items-start gap-3.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] shadow-md ring-2 ring-[#F0A63B]'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">{opt.icon}</span>
                        <div>
                          <span className="font-display font-bold text-base block">
                            {opt.label}
                          </span>
                          <p
                            className={`text-xs mt-0.5 font-sans ${
                              isSelected ? 'text-[#D0D7CF]' : 'text-[#5B6B8C]'
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 5: INTERESTS (MULTI-SELECT)                     */}
            {/* ======================================================= */}
            {currentStep === 5 && !solvedPlanReady && (
              <motion.div
                key="step-5"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#F0A63B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#F0A63B] inline-block" />
                    <span>Step 5: Cultural Pulls</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    What pulls you in most?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    Pick as many as you like. We'll weave them into a coherent neighborhood thread.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INTERESTS_OPTIONS.map((opt) => {
                    const isSelected = interests.includes(opt.id);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleInterest(opt.id)}
                        className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] shadow-sm'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0">{opt.icon}</span>
                          <div>
                            <span className="font-display font-bold text-sm block">
                              {opt.label}
                            </span>
                            <span
                              className={`text-[11px] font-sans ${
                                isSelected ? 'text-[#D0D7CF]' : 'text-[#5B6B8C]'
                              }`}
                            >
                              {opt.desc}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#F0A63B] border-[#F0A63B] text-[#12213B]'
                              : 'border-[#5B6B8C]/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 6: FOOD PREFERENCES                             */}
            {/* ======================================================= */}
            {currentStep === 6 && !solvedPlanReady && (
              <motion.div
                key="step-6"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#F0A63B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-[#F0A63B] inline-block" />
                    <span>Step 6: Culinary Guidelines</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    Any food preferences?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    We only schedule tea stops and culinary ateliers where you can eat comfortably.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FOOD_OPTIONS.map((opt) => {
                    const isSelected = foodPreference === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setFoodPreference(opt.id);
                        }}
                        className={`p-3.5 rounded-2xl text-left border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] shadow-md ring-2 ring-[#F0A63B]'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <span className="flex-shrink-0">{opt.icon}</span>
                        <div>
                          <span className="font-display font-bold text-sm block">
                            {opt.label}
                          </span>
                          <span
                            className={`text-[11px] font-sans ${
                              isSelected ? 'text-[#D0D7CF]' : 'text-[#5B6B8C]'
                            }`}
                          >
                            {opt.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Optional free-text input for food nuances */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#5B6B8C] uppercase tracking-wider block">
                    Optional notes (allergies, loves filter coffee, spicy food):
                  </label>
                  <input
                    type="text"
                    value={foodNotes}
                    onChange={(e) => setFoodNotes(e.target.value)}
                    placeholder="e.g. Peanut allergy, loves South Indian filter coffee..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D0D7CF] bg-white text-xs font-mono text-[#12213B] focus:outline-none focus:border-[#F0A63B]"
                  />
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 7: MOBILITY & WALKING                           */}
            {/* ======================================================= */}
            {currentStep === 7 && !solvedPlanReady && (
              <motion.div
                key="step-7"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#1F7A6C] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Accessibility className="w-3.5 h-3.5 text-[#1F7A6C] inline-block" />
                    <span>Step 7: Mobility & Routing Logic</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    How do you like to move?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    This sets our walking threshold and step-free routing algorithms.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {MOBILITY_OPTIONS.map((opt) => {
                    const isSelected = mobility === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setMobility(opt.id);
                        }}
                        className={`p-4 rounded-2xl text-left border transition-all duration-200 flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F7A6C] text-white border-[#1F7A6C] shadow-md ring-2 ring-[#F0A63B]'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <span className="flex-shrink-0 mt-0.5">{opt.icon}</span>
                        <div>
                          <span className="font-display font-bold text-sm block">
                            {opt.label}
                          </span>
                          <p
                            className={`text-xs mt-1 font-sans ${
                              isSelected ? 'text-[#EEF1EE]/90' : 'text-[#5B6B8C]'
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* QUESTION 8: VIBE & PACE                                  */}
            {/* ======================================================= */}
            {currentStep === 8 && !solvedPlanReady && !isSolving && (
              <motion.div
                key="step-8"
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -direction * 40 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-[#F0A63B] uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F0A63B] inline-block" />
                    <span>Step 8: Rhythm & Atmosphere</span>
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-extrabold text-[#12213B] leading-tight">
                    What's the vibe?
                  </h2>
                  <p className="text-sm text-[#5B6B8C] font-sans">
                    Dictates our buffer times, pause durations, and density of activities.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {VIBE_OPTIONS.map((opt) => {
                    const isSelected = vibe === opt.id;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setVibe(opt.id);
                        }}
                        className={`p-4 rounded-2xl text-left border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-[#12213B] text-white border-[#12213B] shadow-md ring-2 ring-[#F0A63B]'
                            : 'bg-white hover:bg-[#FAFBF9] text-[#12213B] border-[#D0D7CF]'
                        }`}
                      >
                        <span className="flex-shrink-0">{opt.icon}</span>
                        <div>
                          <span className="font-display font-bold text-sm block">
                            {opt.label}
                          </span>
                          <p
                            className={`text-xs mt-1 font-sans ${
                              isSelected ? 'text-[#D0D7CF]' : 'text-[#5B6B8C]'
                            }`}
                          >
                            {opt.desc}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* END STATE: SOLVING ANIMATION                             */}
            {/* ======================================================= */}
            {isSolving && (
              <motion.div
                key="solving-state"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 text-center space-y-5"
              >
                <div className="w-16 h-16 rounded-full bg-[#12213B] text-[#F0A63B] flex items-center justify-center mx-auto shadow-lg animate-pulse">
                  <Compass className="w-8 h-8 animate-spin" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl font-display font-bold text-[#12213B]">
                    Packing your feasible plan…
                  </h3>
                  <p className="text-xs font-mono text-[#5B6B8C]">
                    Evaluating {city} opening hours, isochrones, and hard budget walls.
                  </p>
                </div>

                <div className="max-w-md mx-auto space-y-2 text-left text-xs font-mono text-[#1F7A6C] pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A6C]" />
                    <span>Selected verified cultural places in {city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A6C]" />
                    <span>Locked transit buffer under {timeWindow === 'custom' ? customHours : 4.5} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A6C]" />
                    <span>Enforced {mobility === 'wheelchair' ? 'Step-Free Ramps' : 'Comfortable Walking'} guarantee</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* EXPLICIT ERROR STATE (NO SILENT MOCK FALLBACK)          */}
            {/* ======================================================= */}
            {planError && !isSolving && (
              <motion.div
                key="plan-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 px-6 bg-white rounded-3xl border border-red-200 shadow-md text-center space-y-4 max-w-lg mx-auto"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                  <X className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-display font-bold text-[#12213B]">
                    Plan Generation Paused
                  </h3>
                  <p className="text-xs font-mono text-[#5B6B8C] leading-relaxed">
                    {planError}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleGeneratePlan}
                    className="px-5 py-2.5 rounded-xl bg-[#12213B] hover:bg-[#1a2d4f] text-white text-xs font-mono font-bold transition shadow cursor-pointer"
                  >
                    Retry Generation
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPlanError(null);
                      setCurrentStep(1);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#D0D7CF] text-[#5B6B8C] hover:text-[#12213B] text-xs font-mono font-bold transition cursor-pointer"
                  >
                    Adjust Answers
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================= */}
            {/* END STATE: REAL GEMINI SOLVED PLAN PRESENTATION          */}
            {/* ======================================================= */}
            {solvedPlanReady && dayPlan && (
              <motion.div
                key="solved-presentation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D0D7CF]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1F7A6C] animate-pulse" />
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6B8C] font-bold">
                        {dayPlan.city.toUpperCase()} · FEASIBLE DAY PLAN
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-[#12213B]">
                      Everything fits, mathematically packed.
                    </h3>
                    <p className="text-xs font-mono text-[#5B6B8C]">
                      {dayPlan.feasibility_summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`px-3 py-1.5 rounded-full text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs ${
                        dayPlan.feasibility_score >= 85
                          ? 'bg-[#1F7A6C]'
                          : dayPlan.feasibility_score >= 70
                          ? 'bg-[#F0A63B] text-[#12213B]'
                          : 'bg-red-600'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-[#F0A63B]" />
                      <span>Feasibility: {dayPlan.feasibility_score}%</span>
                    </div>
                  </div>
                </div>

                {/* Solved Nodes List */}
                <div className="space-y-3">
                  {dayPlan.stops.map((stop) => (
                    <div
                      key={stop.order}
                      className="p-4 rounded-2xl bg-white border border-[#D0D7CF] shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#F0A63B] text-[#12213B] font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {stop.order}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold text-[#12213B]">
                              {stop.time}
                            </span>
                            <span className="text-[10px] font-mono text-[#5B6B8C]">
                              ({stop.duration_mins} mins)
                            </span>
                          </div>
                          <h4 className="text-sm sm:text-base font-display font-bold text-[#12213B]">
                            {stop.name}
                          </h4>
                          <p className="text-xs font-mono text-[#1F7A6C] font-semibold leading-relaxed flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#1F7A6C]" />
                            <span>{stop.fit_reason}</span>
                          </p>
                          {stop.match_notes && (
                            <p className="text-[11px] font-sans text-[#5B6B8C] italic">
                              {stop.match_notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right font-mono text-xs shrink-0 pl-9 sm:pl-0">
                        <span className="font-extrabold text-[#12213B]">
                          {stop.cost_label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Next Steps Buttons */}
                <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#D0D7CF]">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/itinerary');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#12213B] hover:bg-[#1a2d4f] text-white font-mono text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open in Full Itinerary Workspace</span>
                    <ArrowRight className="w-4 h-4 text-[#F0A63B]" />
                  </button>

                  <div className="flex items-center gap-4">
                    {/* Secondary Explore Instead CTA per spec */}
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/explore');
                      }}
                      className="text-xs font-mono text-[#5B6B8C] hover:text-[#12213B] underline underline-offset-4 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explore Instead</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSolvedPlanReady(false);
                        setCurrentStep(1);
                      }}
                      className="text-xs font-mono text-[#5B6B8C] hover:text-[#12213B] underline underline-offset-4 flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Adjust Answers</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Footer Controls: Back & Next / Finish */}
        {!solvedPlanReady && !isSolving && (
          <div className="w-full max-w-3xl mx-auto pt-3 sm:pt-4 border-t border-[#D0D7CF] flex items-center justify-between gap-2">
            <div className="text-xs font-mono text-[#5B6B8C] hidden sm:block">
              Press <kbd className="px-1.5 py-0.5 bg-white border border-[#D0D7CF] rounded text-[10px] font-bold text-[#12213B]">Enter ↵</kbd> to proceed
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end ml-auto">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="sm:hidden px-4 py-2.5 rounded-xl bg-white border border-[#D0D7CF] text-[#12213B] font-mono text-xs font-bold"
                >
                  Back
                </button>
              )}
              {currentStep < 8 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 sm:flex-none justify-center px-6 py-2.5 rounded-xl bg-[#12213B] hover:bg-[#1a2d4f] text-white font-mono text-xs font-bold transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#F0A63B]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  className="flex-1 sm:flex-none justify-center px-6 py-2.5 rounded-xl bg-[#F0A63B] hover:bg-[#d88f28] text-[#12213B] font-mono text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#12213B]" />
                  <span>Build My Plan</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
}
