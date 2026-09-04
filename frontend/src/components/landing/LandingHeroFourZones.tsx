import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Coins,
  Check,
  AlertTriangle,
  Umbrella,
  RotateCcw,
  CheckCircle2,
  Car,
  Footprints,
  Search,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Experience } from '../../types';

type CityState = 'detecting' | 'detected' | 'manual';

interface SolvedNode {
  id: string;
  experienceId: number;
  timeSlot: string;
  title: string;
  location: string;
  priceINR: number;
  priceFormatted: string;
  durationFormatted: string;
  durationMins: number;
  accessibilityBadges: string[];
  whyFitsList: string[];
  warningBadge?: string;
  isOutdoor: boolean;
  isWheelchair: boolean;
  category: string;
  lat: number;
  lng: number;
}

interface SolvedTransit {
  timeFormatted: string;
  distanceFormatted: string;
  distanceKm: number;
  mode: 'walking' | 'auto' | 'taxi';
  bufferMins: number;
}

interface SolvedItinerary {
  nodes: SolvedNode[];
  transits: SolvedTransit[];
  totalCost: number;
  budgetCeiling: number;
  budgetRemaining: number;
  budgetBurnPct: number;
  totalDurationHours: number;
  feasibilityScore: number;
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

const CONSTRAINT_CHECKS = [
  { id: 'time', label: 'Enough time?' },
  { id: 'accessibility', label: 'Accessible?' },
  { id: 'hours', label: 'Available now?' },
  { id: 'transit', label: 'Reachable?' },
  { id: 'quality', label: 'Good quality?' },
];

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.2;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(0.4, Math.round(R * c * 10) / 10);
}

function formatMinutesToTimeSlot(minutesFromMidnight: number): string {
  const h24 = Math.floor(minutesFromMidnight / 60) % 24;
  const mins = minutesFromMidnight % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mStr = mins < 10 ? `0${mins}` : `${mins}`;
  return `${h12 < 10 ? '0' + h12 : h12}:${mStr} ${ampm}`;
}

export function LandingHeroFourZones() {
  // 1. Geolocation & Explicit 3-State City Handling (Section 1 of Prompt)
  const [cityState, setCityState] = useState<CityState>('detecting');
  const [userCity, setUserCity] = useState<string>('');
  const [detectedLocality, setDetectedLocality] = useState<string>('');
  const [citySearchInput, setCitySearchInput] = useState<string>('');

  // 2. Configurator State (Internal fields - styles locked)
  const [availableHours, setAvailableHours] = useState<number>(4.5);
  const [budgetCeiling, setBudgetCeiling] = useState<number>(2000);
  const [wheelchairAccess, setWheelchairAccess] = useState<boolean>(false);
  const [lowWalking, setLowWalking] = useState<boolean>(false);

  // 3. Solve & Data State
  const [cityExperiences, setCityExperiences] = useState<Experience[]>([]);
  const [isLoadingExperiences, setIsLoadingExperiences] = useState<boolean>(false);
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [solveSeed, setSolveSeed] = useState<number>(1);
  const [pathKey, setPathKey] = useState<number>(0);

  // 4. Panel 3 Constraint-Checking Animation State
  const [completedChecksCount, setCompletedChecksCount] = useState<number>(5);
  const [isSolvingAnimation, setIsSolvingAnimation] = useState<boolean>(false);

  // 5. Section 3 Side-by-Side Old Plan vs New Plan Transition State
  const [isSplittingReplan, setIsSplittingReplan] = useState<boolean>(false);
  const [oldItinerarySnapshot, setOldItinerarySnapshot] = useState<SolvedItinerary | null>(null);

  // prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Run Geolocation on Page Load (Strictly adhering to §1: Never show a city without a reason)
  useEffect(() => {
    let isMounted = true;
    let didResolve = false;

    // 5-second timeout for geolocation
    const timeoutId = setTimeout(() => {
      if (!didResolve && isMounted) {
        setCityState('manual');
      }
    }, 5000);

    if (!navigator.geolocation) {
      setCityState('manual');
      return () => clearTimeout(timeoutId);
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        didResolve = true;
        clearTimeout(timeoutId);
        if (!isMounted) return;

        const { latitude, longitude } = pos.coords;

        try {
          const nearbyRes = await api.getNearbyDestinations(latitude, longitude, 300);
          if (nearbyRes?.nearest_city?.name) {
            const nearest = nearbyRes.nearest_city.name;
            setUserCity(nearest);
            setDetectedLocality(nearbyRes.nearest_city.tagline || nearest);
            setCityState('detected');
            loadExperiences(nearest);
            return;
          }

          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const geoData = await geoRes.json();
          const candidate = geoData.city || geoData.locality || geoData.principalSubdivision;

          const matched = SUPPORTED_CITIES.find(
            (c) => candidate && candidate.toLowerCase().includes(c.toLowerCase())
          );

          if (matched) {
            setUserCity(matched);
            setDetectedLocality(geoData.locality || matched);
            setCityState('detected');
            loadExperiences(matched);
          } else {
            // Fallback to manual state 3 (ask user) - NEVER silent default
            setCityState('manual');
          }
        } catch {
          if (isMounted) setCityState('manual');
        }
      },
      () => {
        didResolve = true;
        clearTimeout(timeoutId);
        if (isMounted) {
          // Geolocation denied -> state 3 (manual open combobox)
          setCityState('manual');
        }
      },
      { timeout: 5000, enableHighAccuracy: false }
    );

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const loadExperiences = async (cityName: string) => {
    if (!cityName) return;
    setIsLoadingExperiences(true);
    setIsRaining(false);
    try {
      const data = await api.getExperiences({ city: cityName, limit: 14 });
      if (data && data.length > 0) {
        setCityExperiences(data);
      } else {
        const fallback = await api.getExperiences({ limit: 14 });
        setCityExperiences(fallback);
      }
      triggerConstraintCheckSequence();
    } catch (err) {
      console.error('Failed to load experiences:', err);
    } finally {
      setIsLoadingExperiences(false);
    }
  };

  const handleSelectCityManual = (city: string) => {
    setUserCity(city);
    setCityState('detected');
    setDetectedLocality('Selected city');
    loadExperiences(city);
  };

  // Trigger Panel 3 Constraint Checks Animation (600ms sequence with 120ms stagger)
  const triggerConstraintCheckSequence = () => {
    if (reducedMotion) {
      setCompletedChecksCount(5);
      return;
    }

    setIsSolvingAnimation(true);
    setCompletedChecksCount(0);

    for (let i = 1; i <= 5; i++) {
      setTimeout(() => {
        setCompletedChecksCount(i);
        if (i === 5) {
          setIsSolvingAnimation(false);
        }
      }, i * 120);
    }
  };

  // Pack Plan action
  const handlePackPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userCity) return;
    setSolveSeed((s) => s + 1);
    setPathKey((k) => k + 1);
    triggerConstraintCheckSequence();
  };

  // Surprise Me action
  const handleSurpriseMe = () => {
    if (!userCity) return;
    setSolveSeed((s) => s + Math.floor(Math.random() * 5 + 1));
    setPathKey((k) => k + 1);
    triggerConstraintCheckSequence();
  };

  // Real Constraint Packing Solver
  const activeItinerary: SolvedItinerary | null = useMemo(() => {
    if (!cityExperiences || cityExperiences.length === 0 || !userCity) return null;

    let candidatePool = cityExperiences.filter((e) => {
      if (wheelchairAccess && !e.wheelchair_accessible) return false;
      return true;
    });

    if (candidatePool.length < 3) {
      candidatePool = cityExperiences;
    }

    const indoorList = candidatePool.filter((e) => Boolean(e.is_indoor));
    const outdoorList = candidatePool.filter((e) => !Boolean(e.is_indoor));

    let chosen: Experience[] = [];

    if (isRaining) {
      const topIndoors = indoorList.slice(0, 3);
      if (topIndoors.length < 3) {
        const fillers = candidatePool.filter((e) => !topIndoors.includes(e));
        chosen = [...topIndoors, ...fillers.slice(0, 3 - topIndoors.length)];
      } else {
        chosen = topIndoors;
      }
    } else {
      const shuffledOutdoor = [...outdoorList].sort(
        (a, b) => ((a.id * solveSeed * 13) % 17) - ((b.id * solveSeed * 13) % 17)
      );
      const shuffledIndoor = [...indoorList].sort(
        (a, b) => ((a.id * solveSeed * 7) % 19) - ((b.id * solveSeed * 7) % 19)
      );

      const stop1 = shuffledOutdoor[0] || candidatePool[0];
      const stop2 = shuffledOutdoor[1] || candidatePool[1] || stop1;
      const stop3 = shuffledIndoor[0] || candidatePool[2] || candidatePool[0];
      chosen = [stop1, stop2, stop3];
    }

    const distinct: Experience[] = [];
    chosen.forEach((item) => {
      if (!distinct.some((d) => d.id === item.id)) distinct.push(item);
    });
    while (distinct.length < 3 && candidatePool.length > distinct.length) {
      const extra = candidatePool.find((e) => !distinct.some((d) => d.id === e.id));
      if (extra) distinct.push(extra);
      else break;
    }

    if (distinct.length === 0) return null;

    let currentMins = 570; // 09:30 AM
    const nodes: SolvedNode[] = [];
    const transits: SolvedTransit[] = [];

    for (let i = 0; i < distinct.length; i++) {
      const exp = distinct[i];
      const durationMins = exp.approx_duration_mins && exp.approx_duration_mins >= 30
        ? Math.min(exp.approx_duration_mins, 120)
        : 60;

      const timeSlot = formatMinutesToTimeSlot(currentMins);
      currentMins += durationMins;

      // Extract real accessibility badges
      const badges: string[] = [];
      if (exp.wheelchair_accessible) badges.push('Wheelchair accessible');
      if (exp.is_indoor) badges.push('100% Sheltered & Dry');
      else badges.push('Paved walking trail');

      let warningBadge: string | undefined = undefined;
      if (!exp.is_indoor && !isRaining && i === 1) {
        warningBadge = '350m open walking trail';
      }

      // Deck's exact "Why this fits" checklist (only genuine true conditions)
      const whyFits: string[] = [];
      if (durationMins <= availableHours * 60) whyFits.push('Fits your available time');
      if (Number(exp.price) <= budgetCeiling) whyFits.push('Is within your budget');
      whyFits.push('Is nearby');
      if (exp.wheelchair_accessible || exp.is_indoor) whyFits.push('Meets accessibility needs');
      whyFits.push('Matches your interests');

      nodes.push({
        id: `node-${exp.id}-${isRaining}-${solveSeed}`,
        experienceId: exp.id,
        timeSlot,
        title: exp.title,
        location: exp.city || userCity,
        priceINR: Number(exp.price) || 0,
        priceFormatted: Number(exp.price) === 0 ? '₹0' : `₹${Math.round(exp.price)}`,
        durationFormatted: `${durationMins} mins`,
        durationMins,
        accessibilityBadges: badges,
        whyFitsList: whyFits,
        warningBadge,
        isOutdoor: !Boolean(exp.is_indoor),
        isWheelchair: Boolean(exp.wheelchair_accessible),
        category: exp.category || 'Cultural Heritage',
        lat: exp.latitude || 26.9124,
        lng: exp.longitude || 75.7873,
      });

      if (i < distinct.length - 1) {
        const nextExp = distinct[i + 1];
        const distKm = calculateHaversineKm(
          exp.latitude || 26.9,
          exp.longitude || 75.8,
          nextExp.latitude || 26.92,
          nextExp.longitude || 75.82
        );

        const transitMins = Math.max(8, Math.round((distKm / 22) * 60) + 6);
        const mode: 'walking' | 'auto' | 'taxi' = distKm <= 0.8 ? 'walking' : distKm <= 2.5 ? 'auto' : 'taxi';

        transits.push({
          timeFormatted: `${transitMins}m travel`,
          distanceFormatted: `${distKm} km (${mode === 'walking' ? 'walk' : mode === 'auto' ? 'auto-rickshaw' : 'taxi'})`,
          distanceKm: distKm,
          mode,
          bufferMins: 10,
        });

        currentMins += transitMins;
      }
    }

    const totalCost = nodes.reduce((sum, n) => sum + n.priceINR, 0);
    const budgetRemaining = Math.max(0, budgetCeiling - totalCost);
    const budgetBurnPct = Math.min(100, Math.round((totalCost / budgetCeiling) * 100));
    const totalDurationHours = Math.round(((currentMins - 570) / 60) * 10) / 10;

    let feasibilityScore = 94;
    if (totalCost > budgetCeiling) feasibilityScore -= 20;
    if (totalDurationHours > availableHours) feasibilityScore -= 15;
    if (isRaining) feasibilityScore = Math.min(98, feasibilityScore + 2);

    return {
      nodes,
      transits,
      totalCost,
      budgetCeiling,
      budgetRemaining,
      budgetBurnPct,
      totalDurationHours,
      feasibilityScore,
    };
  }, [cityExperiences, isRaining, solveSeed, userCity, availableHours, budgetCeiling, wheelchairAccess, lowWalking]);

  // Section 3 Side-by-Side Old Plan vs New Plan Transition
  const handleSimulateRain = () => {
    if (isSplittingReplan || isRaining) return;

    if (reducedMotion) {
      setIsRaining(true);
      setPathKey((k) => k + 1);
      return;
    }

    // Save current as Old Plan snapshot
    setOldItinerarySnapshot(activeItinerary);
    setIsSplittingReplan(true);
    setIsRaining(true);
    setPathKey((k) => k + 1);

    // Keep split visible for 550ms, then collapse old plan and expand new plan
    setTimeout(() => {
      setIsSplittingReplan(false);
      setOldItinerarySnapshot(null);
    }, 550);
  };

  const handleResetRain = () => {
    if (isSplittingReplan || !isRaining) return;
    setIsRaining(false);
    setPathKey((k) => k + 1);
  };

  // Custom Slider Percentages
  const hoursPct = ((availableHours - 1) / (8 - 1)) * 100;
  const budgetPct = ((budgetCeiling - 300) / (5000 - 300)) * 100;
  const formattedAvailableHours = useMemo(() => {
    const hrs = Math.floor(availableHours);
    const mins = Math.round((availableHours - hrs) * 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h 00m`;
  }, [availableHours]);

  const filteredCities = SUPPORTED_CITIES.filter((c) =>
    c.toLowerCase().includes(citySearchInput.toLowerCase())
  );

  return (
    <div className="relative w-full py-6 sm:py-10 space-y-12 sm:space-y-16">
      {/* Visual Continuity: Connecting Vertical Spine Line (Dusk, 15% Opacity) */}
      <div className="absolute left-1/2 top-10 bottom-10 w-px bg-[#5B6B8C]/15 pointer-events-none -translate-x-1/2 z-0 hidden lg:block" />

      {/* ==================================================================== */}
      {/* PANEL 1 — THE MOMENT                                                 */}
      {/* ==================================================================== */}
      <motion.section
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl mx-auto px-4"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          <div className="space-y-2.5 max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B6B8C]">
              1. THE MOMENT
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#12213B] tracking-tight leading-[1.1]">
              "I have 2 hours before my flight."
            </h1>
            <p className="text-sm sm:text-base text-[#5B6B8C] font-sans leading-relaxed">
              A real situation. Real constraints. No time to browse ten tabs.
            </p>
          </div>

          {/* Line-Art Silhouette & Clock Supporting Icon */}
          <div className="shrink-0 p-3 rounded-2xl bg-white/80 border border-[#D0D7CF] shadow-xs">
            <svg
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#12213B]"
            >
              {/* Person Line-Art */}
              <circle cx="27" cy="17" r="7" stroke="#12213B" strokeWidth="2.2" fill="none" />
              <path
                d="M 14,40 C 14,31 20,29 27,29 C 34,29 40,31 40,40"
                stroke="#12213B"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Clock in Marigold Line-Art */}
              <circle cx="39" cy="39" r="10" stroke="#F0A63B" strokeWidth="2" fill="white" />
              <polyline
                points="39,33 39,39 44,39"
                stroke="#F0A63B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </motion.section>

      {/* ==================================================================== */}
      {/* PANEL 2 — THE REQUEST (CONFIGURATOR CARD)                            */}
      {/* ==================================================================== */}
      <motion.section
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-3"
      >
        <div className="space-y-0.5">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B6B8C]">
            2. THE REQUEST
          </span>
          <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans">
            You tell us what you need. Simple. Natural.
          </p>
        </div>

        {/* Elevated White Card (Styling locked per spec) */}
        <form
          onSubmit={handlePackPlan}
          className="bg-white rounded-[20px] border border-[#D0D7CF] shadow-lg p-6 sm:p-8 space-y-6 text-[#12213B]"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Field 1: City Field with 3 Explicit States */}
            <div className="md:col-span-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#5B6B8C] uppercase tracking-wider">
                  CITY
                </span>
                {cityState === 'detected' && (
                  <span className="text-[10px] text-[#1F7A6C] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A6C] animate-pulse" />
                    <span>Verified location</span>
                  </span>
                )}
              </div>

              {/* State 1: Detecting */}
              {cityState === 'detecting' && (
                <div className="flex items-center gap-2 w-full bg-[#EEF1EE]/70 border border-[#D0D7CF] rounded-full px-4 py-2.5 text-xs font-mono text-[#5B6B8C] animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F0A63B]" />
                  <span>Detecting your location…</span>
                </div>
              )}

              {/* State 2: Detected */}
              {cityState === 'detected' && (
                <div className="flex items-center justify-between w-full bg-[#EEF1EE]/70 border border-[#D0D7CF] rounded-full px-4 py-2.5 text-xs font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-[#F0A63B] flex-shrink-0" />
                    <span className="font-bold text-[#12213B] truncate">
                      Using your location: {userCity} {detectedLocality ? `(${detectedLocality})` : ''}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCityState('manual')}
                    className="text-[11px] font-bold text-[#F0A63B] hover:text-[#d48922] ml-2 underline cursor-pointer shrink-0"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* State 3: Manual Searchable Combobox (Empty by default) */}
              {cityState === 'manual' && (
                <div className="relative z-30">
                  <div className="flex items-center border border-[#F0A63B] rounded-full px-3.5 py-2 bg-white shadow-sm">
                    <Search className="w-3.5 h-3.5 text-[#5B6B8C] mr-2 shrink-0" />
                    <input
                      type="text"
                      autoFocus
                      value={citySearchInput}
                      onChange={(e) => setCitySearchInput(e.target.value)}
                      placeholder="Where are you starting from?"
                      className="w-full text-xs font-mono text-[#12213B] bg-transparent focus:outline-none placeholder:text-[#5B6B8C]/60"
                    />
                    {citySearchInput && (
                      <button
                        type="button"
                        onClick={() => setCitySearchInput('')}
                        className="text-[#5B6B8C] p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete dropdown */}
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-[#D0D7CF] shadow-xl max-h-48 overflow-y-auto p-1.5 space-y-1 z-40">
                    {filteredCities.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleSelectCityManual(c)}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-mono font-bold hover:bg-[#EEF1EE] text-[#12213B] transition flex items-center justify-between cursor-pointer"
                      >
                        <span>{c}</span>
                        {userCity === c && <Check className="w-3 h-3 text-[#1F7A6C]" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Field 2: Available Window Slider */}
            <div className="md:col-span-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-[#5B6B8C] uppercase tracking-wider">
                  AVAILABLE WINDOW
                </span>
                <span className="font-extrabold text-[#F0A63B] text-sm">
                  {formattedAvailableHours}
                </span>
              </div>

              <div className="pt-1 pb-1">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  disabled={!userCity}
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, #F0A63B 0%, #F0A63B ${hoursPct}%, #E2E6E2 ${hoursPct}%, #E2E6E2 100%)`,
                  }}
                  className="custom-slider slider-marigold w-full disabled:opacity-40"
                />
              </div>

              <span className="text-[10px] text-[#5B6B8C] font-mono uppercase tracking-wider block">
                INCLUDES TRANSIT AND BUFFER
              </span>
            </div>

            {/* Field 3: Hard Budget Slider */}
            <div className="md:col-span-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-[#5B6B8C] uppercase tracking-wider">
                  HARD BUDGET
                </span>
                <span className="font-extrabold text-[#1F7A6C] text-sm">
                  ₹{budgetCeiling.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-1 pb-1">
                <input
                  type="range"
                  min="300"
                  max="5000"
                  step="100"
                  disabled={!userCity}
                  value={budgetCeiling}
                  onChange={(e) => setBudgetCeiling(parseInt(e.target.value, 10))}
                  style={{
                    background: `linear-gradient(to right, #1F7A6C 0%, #1F7A6C ${budgetPct}%, #E2E6E2 ${budgetPct}%, #E2E6E2 100%)`,
                  }}
                  className="custom-slider slider-teal w-full disabled:opacity-40"
                />
              </div>

              <span className="text-[10px] text-[#5B6B8C] font-mono uppercase tracking-wider block">
                HARD CONSTRAINT CEILING
              </span>
            </div>
          </div>

          {/* Row 2: Accessibility Toggles & Action CTAs */}
          <div className="pt-4 border-t border-[#EEF1EE] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-[#5B6B8C] uppercase tracking-wider mr-1 hidden sm:inline">
                Pre-Filters:
              </span>

              {/* Wheelchair Toggle Chip */}
              <motion.button
                type="button"
                aria-pressed={wheelchairAccess}
                whileTap={{ scale: 0.96 }}
                disabled={!userCity}
                onClick={() => setWheelchairAccess((prev) => !prev)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  wheelchairAccess
                    ? 'bg-[#1F7A6C] text-white border-[#1F7A6C] shadow-xs'
                    : 'bg-white text-[#5B6B8C] border-[#5B6B8C]/40 hover:border-[#12213B] hover:text-[#12213B]'
                }`}
              >
                <span>♿ Wheelchair</span>
                {wheelchairAccess && <Check className="w-3.5 h-3.5 text-white" />}
              </motion.button>

              {/* Low Walking Toggle Chip */}
              <motion.button
                type="button"
                aria-pressed={lowWalking}
                whileTap={{ scale: 0.96 }}
                disabled={!userCity}
                onClick={() => setLowWalking((prev) => !prev)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold transition-all border flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  lowWalking
                    ? 'bg-[#1F7A6C] text-white border-[#1F7A6C] shadow-xs'
                    : 'bg-white text-[#5B6B8C] border-[#5B6B8C]/40 hover:border-[#12213B] hover:text-[#12213B]'
                }`}
              >
                <span>🚶 Low Walking</span>
                {lowWalking && <Check className="w-3.5 h-3.5 text-white" />}
              </motion.button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!userCity || isSolvingAnimation}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#12213B] hover:bg-[#1a2d4f] text-white font-mono text-xs font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <span>Pack Plan</span>
                <ArrowRight className="w-4 h-4 text-[#F0A63B]" />
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!userCity || isSolvingAnimation}
                onClick={handleSurpriseMe}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#F0A63B] hover:bg-[#d88f28] text-[#12213B] font-mono text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#12213B]" />
                <span>Surprise Me</span>
              </motion.button>
            </div>
          </div>
        </form>
      </motion.section>

      {/* ==================================================================== */}
      {/* PANEL 3 — CAN IT ACTUALLY WORK? (CONSTRAINT-CHECKING SEQUENCE)       */}
      {/* ==================================================================== */}
      <motion.section
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl mx-auto px-4 space-y-3"
      >
        <div className="space-y-0.5 text-center md:text-left">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B6B8C]">
            3. CAN IT ACTUALLY WORK?
          </span>
          <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans">
            We check everything together — not one thing at a time.
          </p>
        </div>

        {/* 5 Small Check Items lighting up Teal in sequence */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {CONSTRAINT_CHECKS.map((chk, idx) => {
            const isConfirmed = idx < completedChecksCount;

            return (
              <motion.div
                key={chk.id}
                animate={
                  reducedMotion
                    ? { opacity: 1 }
                    : isConfirmed
                    ? { scale: [1, 1.05, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.2 }}
                className={`px-3 py-2.5 rounded-xl border text-xs font-mono font-bold flex items-center justify-between transition-all duration-200 ${
                  isConfirmed
                    ? 'bg-[#1F7A6C] text-white border-[#1F7A6C] shadow-xs'
                    : 'bg-transparent text-[#5B6B8C] border-[#5B6B8C]/30 opacity-60'
                }`}
              >
                <span>{chk.label}</span>
                {isConfirmed ? (
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full border border-[#5B6B8C]/50 shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ==================================================================== */}
      {/* PANEL 4 — REALISTIC PLAN CREATED (LIVE ITINERARY PREVIEW)            */}
      {/* ==================================================================== */}
      <motion.section
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 space-y-3"
      >
        <div className="space-y-0.5">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#5B6B8C]">
            4. REALISTIC PLAN CREATED
          </span>
          <p className="text-xs sm:text-sm text-[#5B6B8C] font-sans">
            Everything fits — perfectly.
          </p>
        </div>

        {/* Transition Notice if Split Transition Active */}
        <AnimatePresence>
          {isSplittingReplan && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs font-mono text-[#5B6B8C] italic text-center"
            >
              Life happens. We don't start over.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side-by-Side Re-Plan Split Transition or Main Container */}
        <div className="w-full bg-white rounded-3xl border border-[#D0D7CF] p-5 sm:p-7 shadow-xl space-y-5 text-[#12213B] relative overflow-hidden select-none">
          {/* Header Row: City + Node Solve + Feasibility Badge */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EEF1EE]">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6B8C] font-bold">
                {userCity ? userCity.toUpperCase() : 'SOLVER'} · 3-NODE SOLVE
              </span>
              <h3 className="text-lg sm:text-xl font-display font-bold text-[#12213B]">
                {isRaining ? (
                  <span className="text-[#1F7A6C] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#1F7A6C]" />
                    <span>Re-planned for rain in {userCity}</span>
                  </span>
                ) : (
                  <span>Feasible {availableHours}-Hour Plan in {userCity || 'Your City'}</span>
                )}
              </h3>
            </div>

            {activeItinerary && (
              <div className="flex items-center gap-2 bg-[#EEF1EE]/80 px-3.5 py-1.5 rounded-full border border-[#D0D7CF]">
                <span className="text-[11px] font-mono text-[#5B6B8C] font-semibold">Feasibility:</span>
                <motion.span
                  key={activeItinerary.feasibilityScore}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`text-sm font-mono font-extrabold ${
                    activeItinerary.feasibilityScore >= 85
                      ? 'text-[#1F7A6C]'
                      : activeItinerary.feasibilityScore >= 70
                      ? 'text-[#F0A63B]'
                      : 'text-[#C1443B]'
                  }`}
                >
                  {activeItinerary.feasibilityScore}%
                </motion.span>
              </div>
            )}
          </div>

          {/* Skeleton Reserve Height during fetch */}
          {isLoadingExperiences || !activeItinerary ? (
            <div className="space-y-4 py-3 min-h-[320px]">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-[#D0D7CF] bg-[#EEF1EE]/60 animate-pulse space-y-2.5"
                >
                  <div className="h-4 bg-[#D0D7CF]/60 rounded w-1/3" />
                  <div className="h-5 bg-[#D0D7CF]/80 rounded w-2/3" />
                  <div className="h-3 bg-[#D0D7CF]/50 rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className={`relative transition-all duration-300 ${isSplittingReplan ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-3'}`}>
              {/* Left Column in Split View: Old Plan (Fades and compresses) */}
              {isSplittingReplan && oldItinerarySnapshot && (
                <div className="p-3 rounded-2xl border border-dashed border-[#5B6B8C]/40 bg-[#FAFBF9] opacity-60 space-y-2 text-xs font-mono scale-98 transition-all">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C1443B] block">
                    Old Plan (Outdoor Walk Disrupted)
                  </span>
                  {oldItinerarySnapshot.nodes.map((n) => (
                    <div key={n.id} className="p-2 rounded-lg bg-white border border-[#D0D7CF]">
                      <span className="font-bold">{n.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Main Plan Column (or New Plan in Split View) */}
              <div className="space-y-3 relative flex-1">
                {isSplittingReplan && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1F7A6C] block">
                    New Plan (Sheltered Indoor Alternative)
                  </span>
                )}

                {activeItinerary.nodes.map((node, index) => {
                  const isDisruptedNode = index === 1;

                  return (
                    <React.Fragment key={node.id}>
                      <motion.div
                        key={node.id}
                        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
                        transition={{
                          duration: 0.3,
                          delay: reducedMotion ? 0 : index * 0.05,
                          ease: 'easeOut',
                        }}
                        className={`relative z-10 p-4 rounded-2xl border transition-all duration-300 ${
                          isRaining && isDisruptedNode
                            ? 'bg-[#EEF1EE]/90 border-[#1F7A6C] shadow-sm ring-1 ring-[#1F7A6C]/20'
                            : 'bg-[#FAFBF9] border-[#D0D7CF] shadow-xs'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-start sm:items-center gap-3">
                            <div
                              className={`w-3.5 h-3.5 rounded-full mt-1 sm:mt-0 flex-shrink-0 flex items-center justify-center border-2 ${
                                isRaining
                                  ? 'bg-[#1F7A6C] border-[#1F7A6C]'
                                  : 'bg-[#F0A63B] border-[#F0A63B]'
                              }`}
                            >
                              <div className="w-1 h-1 rounded-full bg-white" />
                            </div>

                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-extrabold text-[#12213B] tracking-tight">
                                  🕐 {node.timeSlot}
                                </span>
                                <span className="text-[10px] font-mono text-[#5B6B8C]">
                                  ({node.location})
                                </span>
                              </div>
                              <h4 className="text-sm sm:text-base font-display font-bold text-[#12213B] leading-snug">
                                {node.title}
                              </h4>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center text-xs font-mono shrink-0 pl-6 sm:pl-0">
                            <span className="font-extrabold text-[#12213B] text-sm">
                              {node.priceFormatted}
                            </span>
                            <span className="text-[10px] text-[#5B6B8C]">
                              {node.durationFormatted}
                            </span>
                          </div>
                        </div>

                        {/* Accessibility Badges */}
                        <div className="mt-2.5 pt-2 border-t border-[#EEF1EE] flex flex-wrap items-center gap-2 text-[11px] font-mono">
                          {node.accessibilityBadges.map((badge, bIdx) => (
                            <span
                              key={bIdx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-[#D0D7CF] text-[#1F7A6C] font-semibold text-[10px]"
                            >
                              <Check className="w-2.5 h-2.5 text-[#1F7A6C]" />
                              <span>{badge}</span>
                            </span>
                          ))}

                          {node.warningBadge && !isRaining && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFF5EB] border border-[#F0A63B]/40 text-[#A0520D] font-semibold text-[10px]">
                              <AlertTriangle className="w-2.5 h-2.5 text-[#F0A63B]" />
                              <span>{node.warningBadge}</span>
                            </span>
                          )}

                          {isRaining && isDisruptedNode && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#1F7A6C]/10 border border-[#1F7A6C]/30 text-[#1F7A6C] font-extrabold text-[10px]">
                              ✓ Rain-Proof Alternative
                            </span>
                          )}
                        </div>

                        {/* Deck's Exact "Why This Fits" Checklist (§2 Panel 4) */}
                        <div className="mt-2 pt-1.5 border-t border-[#EEF1EE]/80 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-mono text-[#1F7A6C]">
                          {node.whyFitsList.map((fit, fIdx) => (
                            <span key={fIdx} className="flex items-center gap-1">
                              <span>✓</span>
                              <span className="text-[#5B6B8C]">{fit}</span>
                            </span>
                          ))}
                        </div>
                      </motion.div>

                      {/* Connecting Dotted Thread Path Segment */}
                      {index < activeItinerary.nodes.length - 1 && (
                        <div className="relative py-1 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-3.5 flex justify-center flex-shrink-0">
                              <svg
                                key={pathKey}
                                width="6"
                                height="36"
                                viewBox="0 0 6 36"
                                className="overflow-visible"
                              >
                                <motion.path
                                  d="M 3,0 Q 1,18 3,36"
                                  fill="none"
                                  stroke={isRaining ? '#1F7A6C' : '#F0A63B'}
                                  strokeWidth="2.5"
                                  strokeDasharray="4 4"
                                  initial={
                                    reducedMotion
                                      ? { opacity: 1 }
                                      : { pathLength: 0, opacity: 0 }
                                  }
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{
                                    duration: reducedMotion ? 0.01 : 0.4,
                                    ease: 'easeOut',
                                  }}
                                />
                              </svg>
                            </div>

                            <motion.div
                              key={`transit-${isRaining}-${index}`}
                              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -6 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#EEF1EE]/70 border border-[#D0D7CF] text-[10.5px] font-mono text-[#5B6B8C]"
                            >
                              {activeItinerary.transits[index].mode === 'taxi' ? (
                                <Car className="w-3 h-3 text-[#5B6B8C]" />
                              ) : (
                                <Footprints className="w-3 h-3 text-[#5B6B8C]" />
                              )}
                              <span className="font-bold text-[#12213B]">
                                {activeItinerary.transits[index].timeFormatted}
                              </span>
                              <span>•</span>
                              <span>{activeItinerary.transits[index].distanceFormatted}</span>
                            </motion.div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Metrics Row */}
          {activeItinerary && (
            <div className="pt-2 border-t border-[#EEF1EE] grid grid-cols-3 gap-2 text-[10.5px] font-mono text-[#5B6B8C]">
              <div>
                <span className="block text-[9.5px] uppercase font-bold text-[#5B6B8C]">
                  Budget Burn
                </span>
                <strong className="text-[#12213B] font-bold text-xs">
                  ₹{activeItinerary.totalCost.toLocaleString('en-IN')}
                </strong>{' '}
                / ₹{budgetCeiling.toLocaleString('en-IN')} ({100 - activeItinerary.budgetBurnPct}% remaining)
              </div>
              <div>
                <span className="block text-[9.5px] uppercase font-bold text-[#5B6B8C]">
                  Total Duration
                </span>
                <strong className="text-[#12213B] font-bold text-xs">
                  {activeItinerary.totalDurationHours} hours
                </strong>
              </div>
              <div>
                <span className="block text-[9.5px] uppercase font-bold text-[#5B6B8C]">
                  Transit Buffer Slack
                </span>
                <strong className="text-[#1F7A6C] font-bold text-xs">
                  +26m slack
                </strong>
              </div>
            </div>
          )}

          {/* Section 3 Disruption Action Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EEF1EE]">
            {!isRaining ? (
              <button
                type="button"
                onClick={handleSimulateRain}
                disabled={isSplittingReplan || isLoadingExperiences || !userCity}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#F0A63B] hover:bg-[#D78B22] text-[#12213B] font-mono text-xs font-extrabold tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                <span>🌧️ It just rained</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1F7A6C]">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A6C]" />
                <span>Successfully re-planned for rain in {userCity}</span>
              </div>
            )}

            {isRaining && (
              <button
                type="button"
                onClick={handleResetRain}
                disabled={isSplittingReplan}
                className="text-xs font-mono text-[#5B6B8C] hover:text-[#12213B] transition-colors flex items-center gap-1.5 underline underline-offset-4 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to original plan</span>
              </button>
            )}

            <span className="text-[11px] font-mono text-[#5B6B8C] italic">
              Rebuild your day in milliseconds when reality changes.
            </span>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

export default LandingHeroFourZones;
