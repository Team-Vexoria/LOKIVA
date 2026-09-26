import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  Navigation,
  Compass,
  Landmark,
  UtensilsCrossed,
  ShoppingBag,
  Trees,
  Ticket,
  Share2,
  ExternalLink,
  ShieldCheck,
  Footprints,
  Car,
  RotateCcw,
  CheckCircle2,
  Zap,
  Star,
  Building2,
} from 'lucide-react';
import {
  QuickEscapeQuery,
  QuickEscapePlan,
  QuickEscapeInterest,
  AvailableHours,
  StartPointType,
} from '../../types/quickEscape';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  generateQuickEscapePlan,
  POPULAR_CITIES_QUICK,
  DEFAULT_QUICK_ESCAPE_PLAN,
  getStartPointConfig,
} from '../../data/quickEscapeData';
import { getUserLiveLocation } from '../../lib/gpsLocation';
import { SquiggleUnderline, StampBadge } from '../ui/HandDrawnAnnotations';

const AVAILABLE_TIMES: AvailableHours[] = [1, 2, 3, 5];

const INTEREST_OPTIONS: { id: QuickEscapeInterest; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Culture', label: 'Culture', icon: Landmark },
  { id: 'Food', label: 'Food', icon: UtensilsCrossed },
  { id: 'Heritage', label: 'Heritage', icon: Compass },
  { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'Nature', label: 'Nature', icon: Trees },
  { id: 'Entertainment', label: 'Entertainment', icon: Ticket },
];

export function QuickEscapeSection() {
  // Form State
  const [location, setLocation] = useState<string>('Delhi, India');
  const [availableHours, setAvailableHours] = useState<AvailableHours>(3);
  const [interests, setInterests] = useState<QuickEscapeInterest[]>(['Heritage', 'Food', 'Shopping']);
  const [startPointType, setStartPointType] = useState<StartPointType>('current');
  const [customStartPoint, setCustomStartPoint] = useState<string>('Indira Gandhi Int. Airport (DEL)');
  
  // GPS Detection State
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isLiveGpsActive, setIsLiveGpsActive] = useState<boolean>(false);
  const [liveCoords, setLiveCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Result state - initialize with default plan for instant zero-jump rendering
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedPlan, setGeneratedPlan] = useState<QuickEscapePlan | null>(DEFAULT_QUICK_ESCAPE_PLAN);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const itineraryRef = useRef<HTMLDivElement>(null);

  // Dynamic start point config for currently selected city
  const currentStartConfig = getStartPointConfig(location);

  // Sync GSAP ScrollTrigger whenever generatedPlan changes
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [generatedPlan]);

  const handleToggleInterest = (interest: QuickEscapeInterest) => {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((i) => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  // Helper to re-generate with custom parameters
  const runPlanGeneration = async (
    targetLocation: string,
    targetStartType: StartPointType,
    targetCustomStart: string,
    targetHours: AvailableHours,
    targetInterests: QuickEscapeInterest[],
    targetCoords?: { latitude: number; longitude: number },
    targetIsLiveGps: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const plan = await generateQuickEscapePlan({
        location: targetLocation.trim() || 'Delhi, India',
        availableHours: targetHours,
        interests: targetInterests,
        startPointType: targetStartType,
        customStartPoint: targetCustomStart,
        coords: targetCoords,
        isLiveGps: targetIsLiveGps,
      });
      setGeneratedPlan(plan);
    } catch (err) {
      console.error('Quick escape generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setGpsErrorMsg(null);
    try {
      const liveRes = await getUserLiveLocation();
      const detectedLocation = liveRes.fullLocationString;
      const coords = { latitude: liveRes.latitude, longitude: liveRes.longitude };

      setLocation(detectedLocation);
      setIsLiveGpsActive(true);
      setLiveCoords(coords);

      const localLabel = liveRes.locality ? `${liveRes.locality}` : 'Live Current Location';
      setCustomStartPoint(localLabel);

      await runPlanGeneration(
        detectedLocation,
        startPointType,
        localLabel,
        availableHours,
        interests,
        coords,
        true
      );

      // Smooth scroll into itinerary on mobile/tablet
      setTimeout(() => {
        if (window.innerWidth < 1024 && itineraryRef.current) {
          itineraryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Failed to acquire live GPS location:', err);
      setGpsErrorMsg('Could not detect GPS location. Please check browser permissions.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleCitySelect = async (selectedCity: string) => {
    setLocation(selectedCity);
    setIsLiveGpsActive(false);
    setGpsErrorMsg(null);

    const cfg = getStartPointConfig(selectedCity);
    const primaryPreset = cfg.customPresets[0] || `${selectedCity.split(',')[0]} Airport`;
    setCustomStartPoint(primaryPreset);

    const effectiveCustom = startPointType === 'custom' ? primaryPreset : cfg.current;
    await runPlanGeneration(
      selectedCity,
      startPointType,
      effectiveCustom,
      availableHours,
      interests,
      undefined,
      false
    );
  };

  const handleSelectStartType = async (type: StartPointType) => {
    setStartPointType(type);
    let targetCustom = customStartPoint;
    if (type === 'custom' && (!customStartPoint || customStartPoint.includes('Current Location'))) {
      targetCustom = currentStartConfig.customPresets[0] || 'Airport / City Center';
      setCustomStartPoint(targetCustom);
    }

    await runPlanGeneration(
      location,
      type,
      targetCustom,
      availableHours,
      interests,
      liveCoords,
      isLiveGpsActive
    );
  };

  const handleSelectPreset = async (preset: string) => {
    setCustomStartPoint(preset);
    if (startPointType !== 'custom') {
      setStartPointType('custom');
    }
    await runPlanGeneration(
      location,
      'custom',
      preset,
      availableHours,
      interests,
      liveCoords,
      isLiveGpsActive
    );
  };

  const handleTimeChange = async (hours: AvailableHours) => {
    setAvailableHours(hours);
    await runPlanGeneration(
      location,
      startPointType,
      customStartPoint,
      hours,
      interests,
      liveCoords,
      isLiveGpsActive
    );
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await runPlanGeneration(
      location,
      startPointType,
      customStartPoint,
      availableHours,
      interests,
      liveCoords,
      isLiveGpsActive
    );
    // Smooth scroll into itinerary on mobile/tablet
    setTimeout(() => {
      if (window.innerWidth < 1024 && itineraryRef.current) {
        itineraryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleCopyShare = () => {
    const text = `Check out this ${generatedPlan?.title} on LOKIVA! Feasible route in ${availableHours} hours starting from ${generatedPlan?.startPoint}.`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <section
      id="quick-escape"
      className="relative z-20 w-full bg-[#FAF7F2] py-16 sm:py-24 border-t border-[#E5DFD5] overflow-hidden"
    >
      {/* Decorative ambient background blurs matching LOKIVA aesthetic */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#FFC067]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-[#C1443B]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── SECTION HEADER ───────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12 sm:mb-16">
          {/* Eyebrow badge */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF3DF] border border-[#FFC067]/70 text-[#C1443B] font-mono text-xs sm:text-sm font-extrabold tracking-wide shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-[#F0A63B] fill-[#F0A63B]" />
              <span>Quick Escape</span>
            </span>
          </div>

          {/* Main headline */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-[#12213B] tracking-tight leading-[1.12]">
            <span>Got a few hours </span>
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C1443B] via-[#E25C34] to-[#F59E0B]">
                to spare?
              </span>
              <SquiggleUnderline className="absolute -bottom-2 left-0 w-full h-3 sm:h-4 text-[#FFC067]" />
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#5B6B8C] font-sans font-medium leading-relaxed max-w-2xl mx-auto">
            Make the most of your time with personalized experiences near you, planned around your exact time constraint.
          </p>

          {/* Key Value Highlight Callout Box */}
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-white/90 border border-[#E5DFD5] shadow-xs max-w-xl mx-auto text-left sm:text-center mt-2">
            <Sparkles className="w-4 h-4 text-[#F0A63B] shrink-0" />
            <p className="text-xs sm:text-[13px] text-[#12213B] font-sans font-semibold leading-normal">
              <strong className="text-[#C1443B] font-extrabold">LOKIVA key value:</strong> We don&apos;t just find nearby places — we plan what you can <span className="underline decoration-[#FFC067] decoration-2">realistically experience</span> within the time you have.
            </p>
          </div>
        </div>

        {/* ─── INTERACTIVE WORKSPACE GRID ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: THE INTERACTIVE INPUT CARD (5 COLS) */}
          <div className="lg:col-span-5 bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-[#E5DFD5] shadow-xl shadow-[#12213B]/5 space-y-6">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-4">
              <div className="space-y-0.5">
                <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-[#C1443B]">
                  Constraint Planner
                </span>
                <h3 className="text-xl font-display font-bold text-[#12213B]">
                  Customize Your Window
                </h3>
              </div>
              <StampBadge text="REAL TIME" className="scale-90 origin-right" />
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              {/* 1. LOCATION */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="quick-escape-location" className="text-xs font-mono font-bold uppercase tracking-wider text-[#12213B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
                    <span>1. Location</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className={`text-[11px] font-mono font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      isLiveGpsActive
                        ? 'bg-[#EBF6F0] text-[#1F7A6C] border-[#B6DDD4] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5B6B8C] border-[#DDD7CC] hover:border-[#FFC067] hover:text-[#12213B]'
                    }`}
                    title="Detect your exact live GPS location"
                  >
                    {isLocating ? (
                      <>
                        <Navigation className="w-3 h-3 animate-spin text-[#C1443B]" />
                        <span>Acquiring GPS...</span>
                      </>
                    ) : isLiveGpsActive ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#1F7A6C] animate-pulse" />
                        <span>Live GPS Active</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3 text-[#C1443B]" />
                        <span>Use Live GPS</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="quick-escape-location"
                    type="text"
                    value={location}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocation(val);
                      setIsLiveGpsActive(false);
                      setGpsErrorMsg(null);
                      const cfg = getStartPointConfig(val);
                      if (cfg && cfg.customPresets[0]) {
                        setCustomStartPoint(cfg.customPresets[0]);
                      }
                    }}
                    placeholder="e.g. Jaipur, Rajasthan or Mumbai"
                    className={`w-full px-4 py-3 pl-10 rounded-2xl bg-[#FAF8F5] border text-sm font-sans font-medium text-[#12213B] placeholder-[#8FA1BC] transition outline-none shadow-2xs ${
                      isLiveGpsActive
                        ? 'border-[#1F7A6C] bg-[#F4F9F6] pr-24'
                        : 'border-[#DDD7CC] hover:border-[#FFC067] focus:border-[#C1443B] focus:bg-white'
                    }`}
                  />
                  <MapPin className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLiveGpsActive ? 'text-[#1F7A6C]' : 'text-[#C1443B]'}`} />
                  {isLiveGpsActive && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-[#EBF6F0] text-[#1F7A6C] text-[10px] font-mono font-extrabold flex items-center gap-1 border border-[#B6DDD4]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1F7A6C] animate-pulse" />
                      GPS Fixed
                    </span>
                  )}
                </div>

                {gpsErrorMsg && (
                  <p className="text-[11px] text-[#C1443B] font-mono font-semibold flex items-center gap-1 pt-0.5">
                    <span>⚠️</span> {gpsErrorMsg}
                  </p>
                )}

                {/* Popular Quick Suggestions - All 14 major cities */}
                <div className="space-y-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8FA1BC]">
                      Popular Cities
                    </span>
                    <span className="text-[10px] font-mono text-[#5B6B8C]">
                      One-tap to switch
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1 py-0.5">
                    {POPULAR_CITIES_QUICK.map((city) => {
                      const cityNameOnly = city.split(',')[0].trim();
                      const isSelected =
                        !isLiveGpsActive &&
                        (location === city || location.toLowerCase().startsWith(cityNameOnly.toLowerCase()));

                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#12213B] text-white border-[#12213B] shadow-2xs font-extrabold'
                              : 'bg-[#FAF8F5] text-[#5B6B8C] border-[#E5DFD5] hover:border-[#FFC067] hover:text-[#12213B]'
                          }`}
                        >
                          {cityNameOnly}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 2. AVAILABLE TIME */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#12213B] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F0A63B]" />
                    <span>2. Available Time</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#5B6B8C]">
                    Strict Hard Limit
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_TIMES.map((hours) => {
                    const isSelected = availableHours === hours;
                    return (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => handleTimeChange(hours)}
                        className={`py-3 px-2 rounded-2xl text-xs font-mono font-bold transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer border ${
                          isSelected
                            ? 'bg-[#FFC067] text-[#12213B] font-extrabold shadow-md shadow-[#FFC067]/35 border-[#E5A84B] scale-[1.02]'
                            : 'bg-[#FAF8F5] text-[#12213B] border-[#DDD7CC] hover:border-[#FFC067] hover:bg-white'
                        }`}
                      >
                        <span className="text-base font-display font-extrabold leading-none">{hours}h</span>
                        <span className="text-[10px] tracking-wide opacity-80">
                          {hours === 1 ? '1 Hour' : `${hours} Hours`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. INTERESTS (MULTI-SELECT) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#12213B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C1443B]" />
                    <span>3. Interests (Select Multiple)</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#5B6B8C]">
                    {interests.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTEREST_OPTIONS.map(({ id, label, icon: Icon }) => {
                    const isChecked = interests.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleToggleInterest(id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-sans font-bold transition text-left cursor-pointer border ${
                          isChecked
                            ? 'bg-[#FFF6E9] text-[#12213B] border-[#F0A63B] shadow-2xs font-extrabold'
                            : 'bg-[#FAF8F5] text-[#5B6B8C] border-[#E5DFD5] hover:border-[#DDD7CC] hover:text-[#12213B]'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                            isChecked ? 'bg-[#F0A63B] text-[#12213B]' : 'bg-[#E5DFD5] text-transparent'
                          }`}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isChecked ? 'text-[#C1443B]' : 'text-[#8FA1BC]'}`} />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. START POINT */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#12213B] flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#5B6B8C]" />
                    <span>4. Start Point</span>
                  </label>
                  <span className="text-[11px] font-mono text-[#5B6B8C]">
                    Circuit loops here
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectStartType('current')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition text-center cursor-pointer border ${
                      startPointType === 'current'
                        ? 'bg-[#12213B] text-white border-[#12213B] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5B6B8C] border-[#E5DFD5] hover:border-[#FFC067]'
                    }`}
                  >
                    Current Location
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectStartType('custom')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-mono font-bold transition text-center cursor-pointer border ${
                      startPointType === 'custom'
                        ? 'bg-[#12213B] text-white border-[#12213B] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#5B6B8C] border-[#E5DFD5] hover:border-[#FFC067]'
                    }`}
                  >
                    Custom Location
                  </button>
                </div>

                {/* Content according to selected Start Point mode */}
                {startPointType === 'current' ? (
                  <div className="rounded-xl bg-[#FAF8F5] border border-[#DDD7CC] p-3 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#1F7A6C] shrink-0" />
                      <span className="font-mono text-[11px] text-[#12213B]">
                        <strong>Active Origin:</strong>{' '}
                        {isLiveGpsActive ? `Live GPS (${location})` : currentStartConfig.current}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#1F7A6C] bg-[#EBF6F0] px-2 py-0.5 rounded-md font-bold shrink-0">
                      Safe Return Loop
                    </span>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 pt-1"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={customStartPoint}
                        onChange={(e) => setCustomStartPoint(e.target.value)}
                        placeholder="e.g. Airport, Railway Station, Hotel, Landmark"
                        className="w-full px-3.5 py-2.5 pl-8 rounded-xl bg-[#FAF8F5] border border-[#DDD7CC] focus:border-[#C1443B] text-xs font-sans text-[#12213B] placeholder-[#8FA1BC] outline-none"
                      />
                      <Navigation className="w-3.5 h-3.5 text-[#5B6B8C] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    </div>

                    {/* Quick Hub Presets for Current City */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-[#8FA1BC] uppercase tracking-wider">
                        Quick Hub Presets:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentStartConfig.customPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`text-[10px] font-mono px-2 py-1 rounded-lg border transition cursor-pointer ${
                              customStartPoint === preset
                                ? 'bg-[#FFC067] text-[#12213B] font-extrabold border-[#E5A84B] shadow-2xs'
                                : 'bg-[#FAF8F5] text-[#5B6B8C] border-[#E5DFD5] hover:border-[#FFC067] hover:text-[#12213B]'
                            }`}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 5. CTA BUTTON */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-[#FFC067] hover:bg-[#F5B24E] text-[#12213B] font-heading font-extrabold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-[#FFC067]/35 hover:shadow-xl border border-[#E5A84B]/60 flex items-center justify-center gap-3 active:scale-[0.98] cursor-pointer group disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin text-[#12213B]" />
                      <span>Synthesizing Realistic Micro-Circuit...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate My Quick Escape</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: GENERATED MINI-ITINERARY DISPLAY (7 COLS) */}
          <div ref={itineraryRef} className="lg:col-span-7 space-y-6">
            {generatedPlan ? (
              <div className="bg-white rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 border border-[#E5DFD5] shadow-xl shadow-[#12213B]/5 space-y-6">
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0ECE1] pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF6F0] text-[#1F7A6C] font-mono text-[10px] font-extrabold uppercase tracking-wide">
                        <CheckCircle2 className="w-3 h-3" />
                        {generatedPlan.feasibilityBadge}
                      </span>
                      <span className="text-xs font-mono text-[#5B6B8C]">
                        {generatedPlan.startTime} — {generatedPlan.endTime}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display font-black text-[#12213B] tracking-tight">
                      {generatedPlan.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyShare}
                      className="px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF6E9] border border-[#DDD7CC] hover:border-[#FFC067] text-[#12213B] text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Share Micro-Circuit"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#C1443B]" />
                      <span>{copiedLink ? 'Copied!' : 'Share'}</span>
                    </button>
                    <a
                      href={generatedPlan.mapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#12213B] hover:bg-[#1D2E49] text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#FFC067]" />
                      <span>Open Maps</span>
                    </a>
                  </div>
                </div>

                {/* KPI Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF8F5] rounded-2xl p-4 border border-[#E5DFD5]">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#5B6B8C]">
                      Total Duration
                    </span>
                    <p className="text-sm sm:text-base font-display font-extrabold text-[#12213B]">
                      {generatedPlan.totalHours} Hours Hard Cap
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#5B6B8C]">
                      Estimated Travel Time
                    </span>
                    <p className="text-sm sm:text-base font-display font-extrabold text-[#C1443B]">
                      {generatedPlan.estimatedTravelTimeMins} mins
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#5B6B8C]">
                      Approx Distance
                    </span>
                    <p className="text-sm sm:text-base font-display font-extrabold text-[#12213B]">
                      ~{generatedPlan.approxDistanceKm} km Circuit
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-[#5B6B8C]">
                      Return Assurance
                    </span>
                    <p className="text-sm sm:text-base font-display font-extrabold text-[#1F7A6C]">
                      100% Padded
                    </p>
                  </div>
                </div>

                {/* ─── TIMELINE SEQUENCE ROUTE VIEW ───────────────────────── */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#12213B] flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-[#C1443B]" />
                      <span>Optimized Route Sequence</span>
                    </h4>
                    <span className="text-[11px] font-mono text-[#5B6B8C] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C1443B]" />
                      <span>Start Point: <strong>{generatedPlan.startPoint}</strong></span>
                    </span>
                  </div>

                  <div className="relative pl-6 sm:pl-8 space-y-3">
                    {/* Continuous vertical route line */}
                    <div className="absolute left-[11px] sm:left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[#12213B] via-[#FFC067] via-[#C1443B] to-[#1F7A6C]" />

                    {/* Compact Circuit Departure Strip */}
                    <div className="relative group">
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#12213B] text-white border-2 border-white ring-2 ring-[#12213B]/20 flex items-center justify-center text-[10px] font-mono font-bold">
                        ▶
                      </div>
                      <div className="rounded-xl px-3.5 py-2 bg-[#FAF8F5] border border-[#DDD7CC] flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDD7CC] text-[10px] font-mono font-extrabold text-[#12213B] shrink-0">
                            {generatedPlan.startTime}
                          </span>
                          <span className="text-xs sm:text-[13px] font-sans font-semibold text-[#12213B] truncate">
                            Depart: <strong>{generatedPlan.startPoint}</strong>
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-[#1F7A6C] bg-[#EBF6F0] px-2 py-0.5 rounded font-bold shrink-0 ml-2">
                          Origin
                        </span>
                      </div>
                    </div>

                    {/* Curated Stops List */}
                    {generatedPlan.stops.map((stop, idx) => {
                      const isReturn = stop.category === 'Return';

                      return (
                        <div key={stop.id} className="relative group">
                          {/* Timeline node icon */}
                          <div
                            className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-black border-2 transition-transform group-hover:scale-110 ${
                              isReturn
                                ? 'bg-[#1F7A6C] text-white border-white ring-2 ring-[#1F7A6C]/30'
                                : idx === 0
                                ? 'bg-[#FFC067] text-[#12213B] border-white ring-2 ring-[#FFC067]/40'
                                : 'bg-[#FAF8F5] text-[#12213B] border-[#C1443B] ring-2 ring-[#C1443B]/20'
                            }`}
                          >
                            {isReturn ? '✓' : idx + 1}
                          </div>

                          {/* Stop Card */}
                          <div
                            className={`rounded-2xl p-3 sm:p-4 border transition-all ${
                              isReturn
                                ? 'bg-[#F2F8F5] border-[#B6DDD4]'
                                : 'bg-[#FAF8F5] border-[#E5DFD5] hover:border-[#FFC067] hover:bg-white shadow-2xs hover:shadow-xs'
                            }`}
                          >
                            {isReturn ? (
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-[#B6DDD4] text-[10px] font-mono font-extrabold text-[#1F7A6C]">
                                      {stop.startTime} — {stop.endTime}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1F7A6C] text-white px-2 py-0.5 rounded">
                                      Return Complete
                                    </span>
                                  </div>
                                  <h5 className="text-sm sm:text-base font-display font-bold text-[#12213B] truncate pt-0.5">
                                    {stop.title}
                                  </h5>
                                  <p className="text-[11px] text-[#1F7A6C] font-mono font-semibold">
                                    ✓ Safely back within hard time cap (100% time-padded buffer)
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center sm:items-start justify-between gap-3">
                                <div className="space-y-1 flex-1 min-w-0">
                                  {/* Badges in a single clean row */}
                                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-[#DDD7CC] font-extrabold text-[#12213B]">
                                      {stop.startTime}
                                    </span>
                                    <span className="px-1.5 py-0.5 rounded bg-[#FFF3DF] text-[#C1443B] font-bold uppercase">
                                      {stop.categoryLabel}
                                    </span>
                                    <span className="text-[#5B6B8C] font-medium">
                                      {stop.durationMins}m
                                    </span>
                                    {stop.rating && (
                                      <span className="inline-flex items-center gap-0.5 font-bold text-[#12213B] bg-white px-1.5 py-0.5 rounded border border-[#E5DFD5]">
                                        <Star className="w-2.5 h-2.5 text-[#F59E0B] fill-[#F59E0B]" />
                                        {stop.rating}
                                        {stop.reviewCount && (
                                          <span className="text-[#8FA1BC] font-normal">
                                            ({stop.reviewCount > 1000 ? `${(stop.reviewCount / 1000).toFixed(1)}k` : stop.reviewCount})
                                          </span>
                                        )}
                                      </span>
                                    )}
                                    {stop.priceNote && (
                                      <span className="text-[#5B6B8C] bg-white/80 px-1.5 py-0.5 rounded border border-[#E5DFD5] truncate max-w-[130px]">
                                        {stop.priceNote}
                                      </span>
                                    )}
                                  </div>

                                  {/* Title */}
                                  <h5 className="text-sm sm:text-base font-display font-bold text-[#12213B] leading-tight truncate">
                                    {stop.title}
                                  </h5>

                                  {/* Description - concise 1 line */}
                                  <p className="text-xs text-[#5B6B8C] font-sans line-clamp-1 leading-snug">
                                    {stop.description}
                                  </p>

                                  {/* Feasibility tag - compact */}
                                  <div className="flex items-center gap-1 text-[10.5px] font-sans text-[#1F7A6C] font-semibold truncate">
                                    <ShieldCheck className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{stop.whyItFits}</span>
                                  </div>
                                </div>

                                {/* Compact Thumbnail */}
                                {stop.imageUrl && (
                                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-[#DDD7CC] shadow-2xs">
                                    <img
                                      src={stop.imageUrl}
                                      alt={stop.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Transit segment indicator connecting to next stop - slim */}
                          {stop.transitToNext && !isReturn && (
                            <div className="py-1 pl-2 flex items-center gap-1.5 text-[11px] font-mono text-[#5B6B8C]">
                              {stop.transitToNext.mode === 'walk' ? (
                                <Footprints className="w-3 h-3 text-[#C1443B] shrink-0" />
                              ) : (
                                <Car className="w-3 h-3 text-[#C1443B] shrink-0" />
                              )}
                              <span className="font-bold text-[#12213B]">{stop.endTime}</span>
                              <span className="text-[#8FA1BC]">·</span>
                              <span className="truncate">{stop.transitToNext.description}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[28px] p-8 border border-[#E5DFD5] text-center space-y-4">
                <RotateCcw className="w-6 h-6 animate-spin mx-auto text-[#FFC067]" />
                <p className="text-sm font-sans text-[#5B6B8C]">
                  Preparing sample Quick Escape itineraries...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default QuickEscapeSection;
