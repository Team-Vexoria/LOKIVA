import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EvenlySpacedSlider } from '../ui/EvenlySpacedSlider';
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
  Search,
  Snowflake,
  CloudRain,
  Wind,
  Sun,
} from 'lucide-react';
import { ALL_INDIAN_STATES_BY_ZONE, IndianStateZoneInfo } from '../../data/places';

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
  weather_preference: 'winter' | 'monsoon' | 'summer_hills' | 'temperate';
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

// Milestones for EvenlySpacedSlider: visually even spacing with piecewise interpolation
export const DAY_MARKS = [
  { value: 1,  label: '1 Day'   },
  { value: 3,  label: '3 Days'  },
  { value: 5,  label: '5 Days'  },
  { value: 7,  label: '7 Days'  },
  { value: 10, label: '10 Days' },
  { value: 14, label: '14 Days' },
  { value: 21, label: '21 Days' },
];

export const BUDGET_MARKS = [
  { value: 1000,  label: '₹1k'   },
  { value: 3000,  label: '₹3k'   },
  { value: 5000,  label: '₹5k'   },
  { value: 10000, label: '₹10k'  },
  { value: 15000, label: '₹15k'  },
  { value: 25000, label: '₹25k+' },
];

export const WEATHER_OPTIONS = [
  {
    id: 'winter' as const,
    title: 'Winter Heritage & Desert Breeze',
    label: 'Winter Heritage & Desert Breeze',
    season: 'Oct to Mar',
    temp: '14°C - 24°C',
    icon: Snowflake,
    tagline: 'Golden Havelis & Desert Nights',
    desc: 'Golden sunlit havelis, crisp dawn ghats, and open stepwells.',
    hubs: 'Rajasthan, Varanasi, Delhi, Hampi',
  },
  {
    id: 'monsoon' as const,
    title: 'Lush Monsoon & Backwaters',
    label: 'Lush Monsoon & Backwaters',
    season: 'Jun to Sep',
    temp: '22°C - 28°C',
    icon: CloudRain,
    tagline: 'Verdant Green & Rains',
    desc: 'Verdant spice trails, petrichor, tea tastings, and Ayurvedic calm.',
    hubs: 'Kerala, Western Ghats, Goa, Meghalaya',
  },
  {
    id: 'summer_hills' as const,
    title: 'High-Altitude Mountain Sanctuaries',
    label: 'High-Altitude Mountain Sanctuaries',
    season: 'Apr to Jun',
    temp: '12°C - 20°C',
    icon: Wind,
    tagline: 'High-Altitude Serenity',
    desc: 'Pine forests, glacial valleys, and cliffside monasteries.',
    hubs: 'Ladakh, Spiti, Himachal, Sikkim',
  },
  {
    id: 'temperate' as const,
    title: 'Temperate Maritime & Deccan Plateau',
    label: 'Temperate Maritime & Deccan Plateau',
    season: 'Year-Round',
    temp: '24°C - 30°C',
    icon: Sun,
    tagline: 'Pleasant Cultural Strolls',
    desc: 'Coastal art districts, evening promenades, and shaded bazaars.',
    hubs: 'Mumbai, Bengaluru, Kolkata, Chettinad',
  },
];

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
  weather_preference: 'winter',
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

const ZONE_TABS = ['All', 'North', 'West', 'South', 'East & Central', 'Northeast', 'Islands'] as const;

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<string>('All');

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
  const [weatherPreference, setWeatherPreference] = useState<'winter' | 'monsoon' | 'summer_hills' | 'temperate'>(
    initialAnswers?.weather_preference || DEFAULT_DISCOVERY_ANSWERS.weather_preference
  );
  const [accessibility, setAccessibility] = useState<{
    low_walking: boolean;
    wheelchair: boolean;
    step_free: boolean;
  }>(initialAnswers?.accessibility || DEFAULT_DISCOVERY_ANSWERS.accessibility);

  // Synthesis & loading state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisStage, setSynthesisStage] = useState<number>(1);
  const [computedCity, setComputedCity] = useState<string>('Jaipur');

  // Filtered States based on Search & Zone for Question 1
  const filteredStates = useMemo(() => {
    return ALL_INDIAN_STATES_BY_ZONE.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.highlight.toLowerCase().includes(q) ||
        item.popularHubs.some((h) => h.toLowerCase().includes(q));
      const matchesZone = selectedZone === 'All' || item.zone === selectedZone;
      return matchesSearch && matchesZone;
    });
  }, [searchQuery, selectedZone]);

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
        if (currentStep < 8) {
          handleNext();
        } else if (currentStep === 8) {
          handleStartSynthesis();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isSynthesizing, destination, interests, days, budgetDaily, groupType, paceVal, weatherPreference, accessibility]);

  const handleNext = () => {
    if (currentStep < 8) {
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

  interface SmartHubCandidate {
    city: string;
    state: string;
    scores: Record<string, number>;
    budgetProfile: 'budget_friendly' | 'moderate' | 'luxury' | 'all';
    weatherAffinities: { winter: number; monsoon: number; summer_hills: number; temperate: number };
    groupAffinities: { solo: number; couple: number; family: number; friends: number };
    paceAffinities: { relaxed: number; balanced: number; packed: number };
    vibeTagline: string;
  }

  const SMART_DESTINATION_HUBS: SmartHubCandidate[] = [
    // ── Mountain & Valleys ──────────────────────────────────────────────────
    {
      city: 'Leh',
      state: 'Ladakh',
      scores: { nature: 10, offbeat: 10, rituals: 8, monuments: 7, heritage: 6, wellness: 6, crafts: 6, food: 5, markets: 4, arts: 5 },
      budgetProfile: 'luxury',
      weatherAffinities: { summer_hills: 10, temperate: 7, winter: 4, monsoon: 6 },
      groupAffinities: { solo: 10, friends: 9, couple: 8, family: 5 },
      paceAffinities: { relaxed: 9, balanced: 8, packed: 4 },
      vibeTagline: 'high-altitude monastic silence, rugged valleys and sacred stupas',
    },
    {
      city: 'Srinagar',
      state: 'Jammu and Kashmir',
      scores: { nature: 10, crafts: 9, heritage: 8, food: 8, offbeat: 7, wellness: 7, markets: 7, monuments: 6, arts: 6, rituals: 4 },
      budgetProfile: 'luxury',
      weatherAffinities: { summer_hills: 9, winter: 8, temperate: 7, monsoon: 5 },
      groupAffinities: { couple: 10, family: 8, solo: 6, friends: 6 },
      paceAffinities: { relaxed: 10, balanced: 7, packed: 4 },
      vibeTagline: 'wooden shikara sunsets, pashmina guilds and Mughal terrace gardens',
    },
    {
      city: 'Dharamshala',
      state: 'Himachal Pradesh',
      scores: { wellness: 10, arts: 9, crafts: 9, nature: 9, offbeat: 8, rituals: 8, food: 7, heritage: 6, markets: 6, monuments: 4 },
      budgetProfile: 'moderate',
      weatherAffinities: { summer_hills: 10, temperate: 8, winter: 6, monsoon: 5 },
      groupAffinities: { solo: 10, couple: 8, friends: 8, family: 6 },
      paceAffinities: { relaxed: 10, balanced: 7, packed: 4 },
      vibeTagline: 'Tibetan thangka ateliers, cedar pine walks and Himalayan meditation',
    },
    {
      city: 'Manali',
      state: 'Himachal Pradesh',
      scores: { nature: 10, offbeat: 9, wellness: 7, crafts: 6, food: 6, heritage: 6, markets: 6, rituals: 5, monuments: 4, arts: 4 },
      budgetProfile: 'moderate',
      weatherAffinities: { summer_hills: 10, winter: 8, temperate: 7, monsoon: 3 },
      groupAffinities: { friends: 10, couple: 9, solo: 7, family: 6 },
      paceAffinities: { balanced: 9, relaxed: 7, packed: 6 },
      vibeTagline: 'alpine cedar passes, apple orchards and woodcraft sanctuaries',
    },
    {
      city: 'Shimla',
      state: 'Himachal Pradesh',
      scores: { heritage: 9, nature: 8, monuments: 8, offbeat: 6, wellness: 6, markets: 6, food: 5, arts: 5, crafts: 5, rituals: 3 },
      budgetProfile: 'all',
      weatherAffinities: { summer_hills: 9, winter: 8, temperate: 7, monsoon: 3 },
      groupAffinities: { family: 10, couple: 8, friends: 7, solo: 6 },
      paceAffinities: { relaxed: 9, balanced: 8, packed: 5 },
      vibeTagline: 'colonial mountain ridges, cedar paths and toy train heritage',
    },
    {
      city: 'Gangtok',
      state: 'Sikkim',
      scores: { nature: 10, rituals: 9, crafts: 8, offbeat: 8, wellness: 8, food: 7, heritage: 7, arts: 7, markets: 6, monuments: 5 },
      budgetProfile: 'moderate',
      weatherAffinities: { summer_hills: 9, temperate: 8, winter: 7, monsoon: 5 },
      groupAffinities: { couple: 9, family: 8, solo: 8, friends: 7 },
      paceAffinities: { relaxed: 9, balanced: 8, packed: 5 },
      vibeTagline: 'misty monastery chants, orchid trails and woodblock craft workshops',
    },
    {
      city: 'Shillong',
      state: 'Meghalaya',
      scores: { nature: 10, offbeat: 9, arts: 9, wellness: 7, food: 7, crafts: 6, markets: 6, heritage: 5, rituals: 3, monuments: 3 },
      budgetProfile: 'moderate',
      weatherAffinities: { monsoon: 10, summer_hills: 9, temperate: 8, winter: 6 },
      groupAffinities: { friends: 9, solo: 9, couple: 8, family: 6 },
      paceAffinities: { relaxed: 8, balanced: 9, packed: 5 },
      vibeTagline: 'cloud waterfalls, living root bridges and vernacular indie music',
    },
    {
      city: 'Munnar',
      state: 'Kerala',
      scores: { nature: 10, wellness: 9, offbeat: 8, food: 7, crafts: 5, heritage: 5, markets: 5, arts: 4, rituals: 3, monuments: 2 },
      budgetProfile: 'moderate',
      weatherAffinities: { summer_hills: 9, monsoon: 9, temperate: 9, winter: 8 },
      groupAffinities: { couple: 10, family: 8, solo: 7, friends: 7 },
      paceAffinities: { relaxed: 10, balanced: 7, packed: 4 },
      vibeTagline: 'emerald tea terraces, spice gardens and cool Western Ghats mist',
    },
    {
      city: 'Ooty',
      state: 'Tamil Nadu',
      scores: { nature: 9, heritage: 8, wellness: 7, offbeat: 6, food: 6, markets: 6, crafts: 5, monuments: 4, arts: 4, rituals: 3 },
      budgetProfile: 'moderate',
      weatherAffinities: { summer_hills: 9, temperate: 8, winter: 8, monsoon: 4 },
      groupAffinities: { family: 9, couple: 9, friends: 7, solo: 6 },
      paceAffinities: { relaxed: 9, balanced: 8, packed: 5 },
      vibeTagline: 'Nilgiri mountain railway, botanical estates and artisanal chocolate walks',
    },
    {
      city: 'Coorg',
      state: 'Karnataka',
      scores: { nature: 10, wellness: 9, food: 8, offbeat: 8, heritage: 6, crafts: 5, markets: 5, rituals: 4, arts: 4, monuments: 3 },
      budgetProfile: 'moderate',
      weatherAffinities: { monsoon: 9, temperate: 9, summer_hills: 8, winter: 8 },
      groupAffinities: { couple: 9, friends: 9, family: 7, solo: 7 },
      paceAffinities: { relaxed: 10, balanced: 7, packed: 4 },
      vibeTagline: 'coffee plantation retreats, Kodava culinary feasts and misty hills',
    },

    // ── Cultural & Royal ────────────────────────────────────────────────────
    {
      city: 'Jaipur',
      state: 'Rajasthan',
      scores: { crafts: 10, heritage: 10, markets: 10, monuments: 9, food: 8, arts: 8, rituals: 6, offbeat: 6, wellness: 5, nature: 4 },
      budgetProfile: 'all',
      weatherAffinities: { winter: 10, temperate: 6, monsoon: 5, summer_hills: 2 },
      groupAffinities: { family: 10, couple: 9, friends: 8, solo: 7 },
      paceAffinities: { balanced: 9, packed: 8, relaxed: 7 },
      vibeTagline: 'master handloom guilds, terracotta city gates and royal palace courts',
    },
    {
      city: 'Udaipur',
      state: 'Rajasthan',
      scores: { heritage: 10, nature: 9, arts: 9, crafts: 8, wellness: 8, monuments: 8, food: 7, offbeat: 7, markets: 7, rituals: 5 },
      budgetProfile: 'luxury',
      weatherAffinities: { winter: 10, monsoon: 8, temperate: 7, summer_hills: 3 },
      groupAffinities: { couple: 10, family: 8, solo: 6, friends: 7 },
      paceAffinities: { relaxed: 10, balanced: 8, packed: 5 },
      vibeTagline: 'lakefront haveli courtyards, miniature fresco painting and sunset boat cruises',
    },
    {
      city: 'Jodhpur',
      state: 'Rajasthan',
      scores: { heritage: 10, crafts: 9, monuments: 9, offbeat: 8, food: 7, markets: 8, arts: 7, rituals: 5, nature: 5, wellness: 4 },
      budgetProfile: 'all',
      weatherAffinities: { winter: 10, temperate: 6, monsoon: 4, summer_hills: 2 },
      groupAffinities: { couple: 9, friends: 8, solo: 8, family: 7 },
      paceAffinities: { balanced: 9, relaxed: 8, packed: 6 },
      vibeTagline: 'blue city rooftop panoramas, indigo guilds and Mehrangarh ramparts',
    },
    {
      city: 'Jaisalmer',
      state: 'Rajasthan',
      scores: { offbeat: 10, heritage: 10, monuments: 9, crafts: 8, arts: 8, markets: 7, nature: 7, food: 6, rituals: 4, wellness: 4 },
      budgetProfile: 'all',
      weatherAffinities: { winter: 10, temperate: 5, monsoon: 3, summer_hills: 1 },
      groupAffinities: { couple: 9, friends: 9, solo: 9, family: 6 },
      paceAffinities: { relaxed: 9, balanced: 8, packed: 5 },
      vibeTagline: 'golden sandstone citadels, desert starlight and vernacular stepwells',
    },
    {
      city: 'Mysore',
      state: 'Karnataka',
      scores: { heritage: 10, crafts: 9, rituals: 8, arts: 8, food: 8, markets: 8, monuments: 7, wellness: 7, nature: 5, offbeat: 5 },
      budgetProfile: 'all',
      weatherAffinities: { temperate: 10, winter: 8, monsoon: 7, summer_hills: 5 },
      groupAffinities: { family: 10, couple: 8, solo: 7, friends: 6 },
      paceAffinities: { relaxed: 8, balanced: 9, packed: 6 },
      vibeTagline: 'sandalwood silk weavers, illuminated royal halls and fragrant market bazaars',
    },
    {
      city: 'Gwalior',
      state: 'Madhya Pradesh',
      scores: { monuments: 10, heritage: 9, arts: 9, offbeat: 8, crafts: 6, rituals: 5, food: 6, markets: 5, wellness: 4, nature: 3 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { winter: 9, temperate: 6, monsoon: 5, summer_hills: 2 },
      groupAffinities: { solo: 8, family: 7, friends: 6, couple: 6 },
      paceAffinities: { balanced: 9, packed: 8, relaxed: 6 },
      vibeTagline: 'impregnable hilltop forts, classical music shrines and ancient stone carvings',
    },

    // ── Heritage & Spiritual ────────────────────────────────────────────────
    {
      city: 'Varanasi',
      state: 'Uttar Pradesh',
      scores: { rituals: 10, offbeat: 9, crafts: 8, food: 8, heritage: 8, arts: 7, wellness: 7, markets: 6, monuments: 5, nature: 4 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { winter: 10, temperate: 6, monsoon: 5, summer_hills: 2 },
      groupAffinities: { solo: 10, couple: 8, family: 8, friends: 6 },
      paceAffinities: { balanced: 9, packed: 8, relaxed: 7 },
      vibeTagline: 'Ganga evening Aarti, Banarasi silk looms and dawn wooden boat serenades',
    },
    {
      city: 'Rishikesh',
      state: 'Uttarakhand',
      scores: { wellness: 10, rituals: 10, nature: 9, offbeat: 8, food: 6, arts: 5, heritage: 5, markets: 5, crafts: 4, monuments: 3 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { temperate: 9, winter: 8, summer_hills: 7, monsoon: 5 },
      groupAffinities: { solo: 10, friends: 9, couple: 8, family: 6 },
      paceAffinities: { relaxed: 10, balanced: 8, packed: 4 },
      vibeTagline: 'emerald riverbanks, Vedic yoga ashrams and sacred foothills chants',
    },
    {
      city: 'Amritsar',
      state: 'Punjab',
      scores: { rituals: 10, food: 10, heritage: 8, monuments: 7, crafts: 7, markets: 8, offbeat: 6, wellness: 5, arts: 5, nature: 3 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { winter: 10, temperate: 6, monsoon: 4, summer_hills: 2 },
      groupAffinities: { family: 10, friends: 8, solo: 8, couple: 7 },
      paceAffinities: { balanced: 9, packed: 9, relaxed: 6 },
      vibeTagline: 'Golden Temple sanctum, generational street kulchas and community hospitality',
    },
    {
      city: 'Hampi',
      state: 'Karnataka',
      scores: { monuments: 10, heritage: 10, offbeat: 10, nature: 8, rituals: 7, arts: 6, wellness: 5, food: 5, markets: 4, crafts: 4 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { winter: 10, temperate: 7, monsoon: 6, summer_hills: 2 },
      groupAffinities: { solo: 10, friends: 9, couple: 8, family: 6 },
      paceAffinities: { relaxed: 8, balanced: 9, packed: 7 },
      vibeTagline: 'Vijayanagara stone boulder ruins, coracle river rides and ancient temple steps',
    },
    {
      city: 'Madurai',
      state: 'Tamil Nadu',
      scores: { rituals: 10, heritage: 9, monuments: 9, food: 9, markets: 8, crafts: 8, arts: 7, offbeat: 6, wellness: 4, nature: 3 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { winter: 9, temperate: 7, monsoon: 5, summer_hills: 2 },
      groupAffinities: { family: 10, solo: 8, couple: 7, friends: 6 },
      paceAffinities: { balanced: 9, packed: 9, relaxed: 5 },
      vibeTagline: 'Meenakshi towering gopurams, fragrant jasmine alleys and heritage night feasts',
    },
    {
      city: 'Bhubaneswar',
      state: 'Odisha',
      scores: { monuments: 10, crafts: 9, rituals: 9, heritage: 9, arts: 8, offbeat: 7, food: 7, nature: 5, markets: 6, wellness: 4 },
      budgetProfile: 'budget_friendly',
      weatherAffinities: { winter: 9, temperate: 7, monsoon: 4, summer_hills: 2 },
      groupAffinities: { family: 9, solo: 8, couple: 7, friends: 6 },
      paceAffinities: { balanced: 9, relaxed: 8, packed: 6 },
      vibeTagline: 'Kalinga sandstone temple architecture, silver filigree guilds and sacred tanks',
    },

    // ── Maritime & Colonial ─────────────────────────────────────────────────
    {
      city: 'Kochi',
      state: 'Kerala',
      scores: { arts: 10, heritage: 9, wellness: 9, nature: 9, food: 8, offbeat: 8, markets: 7, crafts: 6, rituals: 5, monuments: 5 },
      budgetProfile: 'all',
      weatherAffinities: { temperate: 9, winter: 9, monsoon: 9, summer_hills: 4 },
      groupAffinities: { couple: 10, solo: 9, family: 8, friends: 7 },
      paceAffinities: { relaxed: 10, balanced: 8, packed: 5 },
      vibeTagline: 'Chinese fishing nets, spice warehouse galleries and backwater canoe journeys',
    },
    {
      city: 'Goa',
      state: 'Goa',
      scores: { nature: 9, wellness: 9, offbeat: 9, food: 9, markets: 8, heritage: 8, arts: 7, rituals: 4, monuments: 4, crafts: 4 },
      budgetProfile: 'luxury',
      weatherAffinities: { winter: 10, temperate: 8, monsoon: 8, summer_hills: 3 },
      groupAffinities: { friends: 10, couple: 10, solo: 8, family: 7 },
      paceAffinities: { relaxed: 10, balanced: 7, packed: 4 },
      vibeTagline: 'Indo-Portuguese baroque villas, palm riverways and artisanal coastal culinary trails',
    },
    {
      city: 'Mumbai',
      state: 'Maharashtra',
      scores: { food: 10, arts: 10, markets: 9, heritage: 8, offbeat: 8, monuments: 6, wellness: 5, nature: 4, rituals: 4, crafts: 5 },
      budgetProfile: 'luxury',
      weatherAffinities: { winter: 9, temperate: 8, monsoon: 6, summer_hills: 3 },
      groupAffinities: { friends: 9, couple: 8, solo: 9, family: 7 },
      paceAffinities: { packed: 10, balanced: 8, relaxed: 5 },
      vibeTagline: 'Victorian Gothic art districts, coastal promenades and Irani culinary heritage',
    },
    {
      city: 'Pondicherry',
      state: 'Puducherry',
      scores: { wellness: 9, heritage: 9, food: 8, offbeat: 8, arts: 8, nature: 7, markets: 6, crafts: 5, rituals: 4, monuments: 4 },
      budgetProfile: 'moderate',
      weatherAffinities: { winter: 9, temperate: 9, monsoon: 7, summer_hills: 3 },
      groupAffinities: { couple: 10, solo: 9, friends: 7, family: 6 },
      paceAffinities: { relaxed: 10, balanced: 8, packed: 4 },
      vibeTagline: 'French Quarter pastel promenades, Auroville pottery and seaside cycling trails',
    },
    {
      city: 'Kolkata',
      state: 'West Bengal',
      scores: { food: 10, arts: 10, heritage: 9, crafts: 9, offbeat: 9, markets: 8, rituals: 7, monuments: 6, nature: 4, wellness: 4 },
      budgetProfile: 'all',
      weatherAffinities: { winter: 10, temperate: 7, monsoon: 5, summer_hills: 2 },
      groupAffinities: { solo: 10, couple: 8, family: 8, friends: 7 },
      paceAffinities: { packed: 9, balanced: 8, relaxed: 6 },
      vibeTagline: 'Kumartuli clay sculptors, colonial coffee houses and river tram heritage',
    },
    {
      city: 'Delhi',
      state: 'Delhi',
      scores: { food: 10, monuments: 10, heritage: 10, markets: 10, offbeat: 7, arts: 7, crafts: 6, rituals: 5, nature: 4, wellness: 3 },
      budgetProfile: 'all',
      weatherAffinities: { winter: 10, temperate: 6, monsoon: 4, summer_hills: 1 },
      groupAffinities: { family: 9, friends: 8, solo: 8, couple: 7 },
      paceAffinities: { packed: 10, balanced: 8, relaxed: 5 },
      vibeTagline: 'Mughal sandstone citadels, historic spice bazaars and multi-dynasty culinary heritage',
    },
  ];

  const resolveSmartCity = (
    dest: string,
    userInterests: string[],
    dailyBudget: number,
    chosenGroup: 'solo' | 'couple' | 'family' | 'friends',
    chosenPace: 'relaxed' | 'balanced' | 'packed',
    chosenWeather: 'winter' | 'monsoon' | 'summer_hills' | 'temperate'
  ): string => {
    if (dest && dest !== 'Smart Match') {
      if (dest === 'Ladakh') return 'Leh';
      if (dest === 'Goa') return 'Goa';
      if (dest === 'Delhi') return 'Delhi';
      // If user selected a State or Union Territory from the 36 registry
      const stateMatch = ALL_INDIAN_STATES_BY_ZONE.find(
        (s) => s.name.toLowerCase() === dest.toLowerCase()
      );
      if (stateMatch && stateMatch.popularHubs.length > 0) {
        return stateMatch.popularHubs[0];
      }
      return dest;
    }

    const validInterests = userInterests && userInterests.length > 0 ? userInterests : ['heritage', 'crafts', 'food'];

    // ── NORMALIZED MULTI-ATTRIBUTE UTILITY FUNCTION ─────────────────────────
    // Total Score = (w1 * Score_Interests) + (w2 * Score_Budget) + (w3 * Score_Weather) + (w4 * Score_Group) + (w5 * Score_Pace)
    // Weights: Interests = 0.35, Budget = 0.25, Weather = 0.20, Group = 0.10, Pace = 0.10
    const scoredHubs = SMART_DESTINATION_HUBS.map((hub) => {
      // 1. Interests Score (0 - 100)
      const interestMatches = validInterests.map((interest) => (hub.scores[interest] || 5) * 10);
      const scoreInterests = interestMatches.reduce((a, b) => a + b, 0) / Math.max(1, interestMatches.length);

      // 2. Budget Compatibility Score (0 - 100)
      let scoreBudget = 80;
      if (dailyBudget >= 8000) {
        scoreBudget = hub.budgetProfile === 'luxury' ? 100 : hub.budgetProfile === 'all' ? 95 : hub.budgetProfile === 'moderate' ? 80 : 65;
      } else if (dailyBudget >= 4000) {
        scoreBudget = hub.budgetProfile === 'all' ? 100 : hub.budgetProfile === 'moderate' ? 95 : hub.budgetProfile === 'luxury' ? 85 : 85;
      } else {
        scoreBudget = hub.budgetProfile === 'budget_friendly' ? 100 : hub.budgetProfile === 'all' ? 95 : hub.budgetProfile === 'moderate' ? 75 : 50;
      }

      // 3. Weather & Climate Score (0 - 100)
      const scoreWeather = (hub.weatherAffinities[chosenWeather] || 6) * 10;

      // 4. Group Affinity Score (0 - 100)
      const scoreGroup = (hub.groupAffinities[chosenGroup] || 7) * 10;

      // 5. Pace Compatibility Score (0 - 100)
      const scorePace = (hub.paceAffinities[chosenPace] || 7) * 10;

      // Aggregated Weighted Score
      const totalScore =
        0.35 * scoreInterests +
        0.25 * scoreBudget +
        0.20 * scoreWeather +
        0.10 * scoreGroup +
        0.10 * scorePace;

      return {
        city: hub.city,
        state: hub.state,
        score: totalScore,
        vibeTagline: hub.vibeTagline,
      };
    });

    scoredHubs.sort((a, b) => b.score - a.score);

    // Deterministic selection among top contenders within 1.5 points of the best score
    const topScore = scoredHubs[0].score;
    const topContenders = scoredHubs.filter((h) => h.score >= topScore - 1.5);
    if (topContenders.length === 1) return topContenders[0].city;

    const seedString = `${validInterests.join('-')}_${dailyBudget}_${chosenGroup}_${chosenPace}_${chosenWeather}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % topContenders.length;
    return topContenders[index].city;
  };

  const handleStartSynthesis = async () => {
    setIsSynthesizing(true);
    setSynthesisStage(1);

    const pace = getPaceCategory(paceVal);
    const groupMeta = GROUP_OPTIONS.find((g) => g.id === groupType);
    const finalCity = resolveSmartCity(destination, interests, budgetDaily, groupType, pace, weatherPreference);
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
      weather_preference: weatherPreference,
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

    // Keep synthesis view displayed while onComplete executes (prevents bouncing back to questions)
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
      x: prefersReducedMotion ? 0 : d * 40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 30 },
        opacity: { duration: 0.22 },
      },
    },
    exit: (d: number) => ({
      x: prefersReducedMotion ? 0 : -d * 40,
      opacity: 0,
      transition: {
        x: { type: 'spring' as const, stiffness: 320, damping: 30 },
        opacity: { duration: 0.18 },
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
          style={{ maxHeight: 'min(92vh, 720px)' }}
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
                    animate={{ width: `${(currentStep / 8) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
                <span className="text-[11px] font-mono text-dusk-600 font-semibold tracking-wider">
                  {currentStep} of 8
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
          <div className="p-5 sm:p-7 overflow-y-auto flex-1 min-h-[380px] flex flex-col justify-between">
            <AnimatePresence mode="wait" custom={direction}>
              {/* ======================================================= */}
              {/* STEP 1: DESTINATION HORIZON (SMART MATCH + 36 STATES)   */}
              {/* ======================================================= */}
              {currentStep === 1 && !isSynthesizing && (
                <motion.div
                  key="step-1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 01 · Territorial Horizon
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Where is your curiosity pulling you?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Let our spatiotemporal concierge handpick a hidden frontier, or drop a pin directly onto your dream state.
                    </p>
                  </div>

                  {/* Featured AI Smart Match Card */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setDestination('Smart Match')}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer relative overflow-hidden flex items-center justify-between ${
                      destination === 'Smart Match'
                        ? 'bg-[#FFF9F2] border-[#C85A32] shadow-md ring-2 ring-[#C85A32]/20'
                        : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-[#D99B43] to-[#C85A32] text-white flex items-center justify-center shadow-xs shrink-0">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-sm sm:text-base text-[#12213B]">
                            Smart Match for My Vibe
                          </span>
                          <span className="text-[10px] font-mono uppercase bg-[#FAF7F2] border border-[#E5DFD5] text-[#C85A32] px-2 py-0.5 rounded-full font-bold">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-dusk-600 mt-0.5 font-sans">
                          Let Lokiva synthesize your affinities, season, and budget into the ideal route.
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        destination === 'Smart Match'
                          ? 'bg-[#C85A32] border-[#C85A32] text-white'
                          : 'border-[#E5DFD5]'
                      }`}
                    >
                      {destination === 'Smart Match' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </motion.div>

                  {/* Search & Zone Filter Bar */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-dusk-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search across all 36 States & UTs (e.g. Kerala, Ladakh, Assam, Rajasthan)..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#E5DFD5] text-xs font-sans text-[#12213B] placeholder-dusk-600 focus:outline-none focus:border-[#C85A32] shadow-2xs"
                      />
                    </div>

                    {/* Region Cluster Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      {ZONE_TABS.map((zone) => (
                        <button
                          key={zone}
                          type="button"
                          onClick={() => setSelectedZone(zone)}
                          className={`px-3 py-1 rounded-lg text-xs font-heading font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedZone === zone
                              ? 'bg-[#12213B] text-white shadow-xs'
                              : 'bg-white border border-[#E5DFD5] text-dusk-600 hover:bg-[#FAF8F5]'
                          }`}
                        >
                          {zone}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 36 States Grid Container */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[190px] overflow-y-auto pr-1">
                    {filteredStates.map((state) => {
                      const isSelected = destination === state.name;
                      return (
                        <motion.button
                          key={state.name}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setDestination(state.name)}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                            isSelected
                              ? 'bg-[#FFF9F2] border-[#C85A32] ring-1 ring-[#C85A32] shadow-xs'
                              : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-heading font-bold text-xs sm:text-sm text-[#12213B] line-clamp-1">
                              {state.name}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#C85A32] shrink-0 stroke-[3]" />}
                          </div>
                          <span className="text-[10px] text-dusk-600 font-mono mt-1 truncate block">
                            {state.highlight}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-3 border-t border-[#E5DFD5] flex items-center justify-between">
                    <span className="text-xs font-mono text-dusk-600">
                      Selected: <strong className="text-[#C85A32] font-bold">{destination}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-2xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-heading font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ======================================================= */}
              {/* STEP 2: CULTURAL AFFINITIES (QUESTION 2)                 */}
              {/* ======================================================= */}
              {currentStep === 2 && !isSynthesizing && (
                <motion.div
                  key="step-2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 02 · Cultural Passions
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What gets your pulse racing?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Select the cultural textures, living crafts, and sacred traditions you wish to immerse within.
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
              {/* STEP 3: DURATION (QUESTION 3)                            */}
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
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 03 · Time Horizon
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      How many sunrises are you investing?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      From spontaneous 1-day micro explorations to unhurried 21-day cultural odysseys.
                    </p>
                  </div>

                  {/* Big Animated Duration Display */}
                  <div className="py-2 text-center space-y-1">
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

                  {/* Days Slider - piecewise interpolation, ticks evenly distributed visually */}
                  <EvenlySpacedSlider
                    milestones={DAY_MARKS}
                    value={days}
                    onChange={setDays}
                    granularity={1}
                    ariaLabel="Trip duration in days"
                  />

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
              {/* STEP 4: FINANCIAL COMFORT (QUESTION 4)                   */}
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
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 04 · Financial Comfort
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What is your daily sanctuary comfort?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Calibrates dining tiers, heritage stays, host guides, and authentic artisan studio passes.
                    </p>
                  </div>

                  {/* Big Live Currency Counter */}
                  <div className="py-2 text-center space-y-1">
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

                  {/* Budget Slider - EvenlySpacedSlider: piecewise interpolation, ticks evenly distributed visually */}
                  <EvenlySpacedSlider
                    milestones={BUDGET_MARKS}
                    value={budgetDaily}
                    onChange={setBudgetDaily}
                    granularity={500}
                    ariaLabel="Daily budget in INR"
                  />

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
              {/* STEP 5: TRAVEL COMPANIONS (QUESTION 5)                   */}
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
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 05 · Travel Companions
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Who are you making memories with?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Calibrates cadence, vehicle sizing, seating arrangements, and comfort pauses.
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
              {/* STEP 6: JOURNEY RHYTHM (QUESTION 6)                      */}
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
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 06 · Journey Rhythm
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      What is your cadence: slow haveli teas or dawn-to-dusk trails?
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
              {/* STEP 7: SEASONAL ATMOSPHERE (QUESTION 7)                 */}
              {/* ======================================================= */}
              {currentStep === 7 && !isSynthesizing && (
                <motion.div
                  key="step-7"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 07 · Seasonal Atmosphere
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Which skies inspire your senses?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      Aligns destinations and activity timings with ideal thermal comfort and seasonal magic.
                    </p>
                  </div>

                  {/* 4 Tactile Season Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
                    {WEATHER_OPTIONS.map((card) => {
                      const isSelected = weatherPreference === card.id;
                      const Icon = card.icon;

                      return (
                        <motion.button
                          key={card.id}
                          type="button"
                          onClick={() => setWeatherPreference(card.id)}
                          whileHover={{ y: -2, scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          className={`p-3.5 sm:p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                            isSelected
                              ? 'bg-[#FFFDF9] border-[#FFC067] ring-2 ring-[#FFC067] shadow-[0_6px_20px_rgba(255,192,103,0.30)]'
                              : 'bg-white hover:bg-[#FAF8F5] border-[#E5DFD5] shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div
                              className={`p-2.5 rounded-xl shrink-0 ${
                                isSelected
                                  ? 'bg-[#FFC067]/20 text-[#C85A32]'
                                  : 'bg-[#FAF7F2] text-[#12213B]'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>

                            <span className="text-[10px] font-mono font-bold text-[#C85A32] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#E5DFD5]">
                              {card.temp}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <h3 className="font-heading font-bold text-sm sm:text-base text-[#12213B]">
                              {card.title}
                            </h3>
                            <p className="text-xs text-dusk-600 font-sans leading-snug">
                              {card.desc}
                            </p>
                            <span className="text-[10px] text-dusk-600 font-mono block pt-1 truncate">
                              Hubs: {card.hubs}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between">
                    <span className="text-xs font-mono text-dusk-600">
                      Selected: <strong className="text-[#C85A32] font-bold">{WEATHER_OPTIONS.find((w) => w.id === weatherPreference)?.title}</strong>
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
              {/* STEP 8: GROUND COMFORT / MOBILITY (QUESTION 8)           */}
              {/* ======================================================= */}
              {currentStep === 8 && !isSynthesizing && (
                <motion.div
                  key="step-8"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-5 flex-1 flex flex-col justify-between"
                >
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-[#C85A32] bg-[#FAF7F2] border border-[#E5DFD5] px-2.5 py-0.5 rounded-full">
                        Chapter 08 · Ground Comfort
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B] tracking-tight leading-snug">
                      Any ground comfort preferences to keep things seamless?
                    </h2>
                    <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                      We optimize route stops, ramps, and walking hops accordingly. Skip anytime if not needed.
                    </p>
                  </div>

                  {/* 3 Gentle Toggle Cards */}
                  <div className="space-y-2.5 py-1">
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
                      Aligning your exact budget of {formattedBudgetDaily}/day, {interests.length} cultural affinities, and seasonal comfort with verified local artisans and live schedules.
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

                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="px-3 py-1 rounded-full bg-white border border-[#E5DFD5] text-xs font-mono font-bold text-[#2D8978] shadow-xs"
                    >
                      {WEATHER_OPTIONS.find((w) => w.id === weatherPreference)?.title}
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
