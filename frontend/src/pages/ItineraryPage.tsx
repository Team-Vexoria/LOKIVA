import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Experience } from '../types';
import { FeasibilityPanel } from '../components/itinerary/FeasibilityPanel';
import {
  saveActiveItineraryOffline,
  getOfflineItinerary,
  useNetworkStatus,
} from '../lib/offlineStorage';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Navigation,
  WifiOff,
  Car,
  Compass,
  Check,
  Banknote,
  Route,
  Building2,
} from 'lucide-react';

export function ItineraryPage() {
  const isOnline = useNetworkStatus();
  const [availableExperiences, setAvailableExperiences] = useState<Experience[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);
  const [feasibility, setFeasibility] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [isOfflineCached, setIsOfflineCached] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const exps = await api.getExperiences({ city: 'Mumbai', limit: 12 });
        setAvailableExperiences(exps);
        if (exps.length >= 3) {
          const ids = [exps[0].id, exps[1].id, exps[2].id];
          setSelectedIds(ids);
          const fRes = await api.checkFeasibility(ids);
          setFeasibility(fRes);

          // Automatically cache active itinerary offline
          const activeExps = [exps[0], exps[1], exps[2]];
          saveActiveItineraryOffline({ title: 'Bandra West Circuit' }, activeExps);
          setIsOfflineCached(true);
        }
      } catch (err) {
        console.warn('Network fetch failed, attempting offline cache:', err);
        const cached = getOfflineItinerary();
        if (cached && cached.experiences.length > 0) {
          setAvailableExperiences(cached.experiences);
          setSelectedIds(cached.experiences.map((e) => e.id));
          setIsOfflineCached(true);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadInitial();
  }, []);

  const updateFeasibilityForIds = async (ids: number[]) => {
    setSelectedIds(ids);
    try {
      const fRes = await api.checkFeasibility(ids);
      setFeasibility(fRes);

      const activeExps = ids
        .map((id) => availableExperiences.find((e) => e.id === id))
        .filter(Boolean) as Experience[];
      saveActiveItineraryOffline({ title: 'Bandra West Circuit' }, activeExps);
      setIsOfflineCached(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddExperience = (id: number) => {
    if (!selectedIds.includes(id)) {
      updateFeasibilityForIds([...selectedIds, id]);
    }
  };

  const handleRemoveExperience = (id: number) => {
    updateFeasibilityForIds(selectedIds.filter((item) => item !== id));
  };

  const handleReplan = async (reason: string) => {
    setIsReplanning(true);
    try {
      const res = await api.replanItinerary(selectedIds, reason, 'Mumbai');
      if (res.new_experience_ids && res.new_experience_ids.length > 0) {
        setSelectedIds(res.new_experience_ids);
        setFeasibility(res.feasibility);
        setGeneration((g) => g + 1);

        const activeExps = res.new_experience_ids
          .map((id) => availableExperiences.find((e) => e.id === id))
          .filter(Boolean) as Experience[];
        saveActiveItineraryOffline({ title: 'Bandra West Circuit (ReKnitted)' }, activeExps);
        setIsOfflineCached(true);
      }
    } catch (err) {
      console.error('Replanning error:', err);
    } finally {
      setIsReplanning(false);
    }
  };

  const handleSaveItinerary = async () => {
    try {
      await api.createItinerary({
        title: 'Bandra Cultural & Artisan Feasible Day Journey',
        city: 'Mumbai',
        state: 'Maharashtra',
        experience_ids: selectedIds,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error('Failed to save itinerary:', err);
    }
  };

  const selectedList = selectedIds
    .map((id) => availableExperiences.find((e) => e.id === id))
    .filter(Boolean) as Experience[];

  // Deterministic schedule timing and day sequence computation
  const itineraryStats = useMemo(() => {
    const totalCost = selectedList.reduce((sum, exp) => sum + (exp.price || 0), 0);
    const totalActivityMins = selectedList.reduce((sum, exp) => sum + (exp.duration_mins || 45), 0);
    const transitLegsCount = selectedList.length > 0 ? selectedList.length + 1 : 0;
    const totalTransitMins = transitLegsCount * 15;
    const totalMins = totalActivityMins + totalTransitMins;

    // Start at 9:30 AM (570 minutes from 00:00)
    let currentMinute = 9 * 60 + 30;
    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 || 12;
      return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
    };

    const startTimeFormatted = formatTime(currentMinute);

    const timedStops = selectedList.map((exp, idx) => {
      const transitStart = currentMinute;
      const arrivalTime = currentMinute + 15;
      const duration = exp.duration_mins || 45;
      const departureTime = arrivalTime + duration;
      currentMinute = departureTime;

      return {
        exp,
        index: idx + 1,
        transitBefore: {
          startFormatted: formatTime(transitStart),
          arrivalFormatted: formatTime(arrivalTime),
          durationMins: 15,
        },
        activity: {
          startFormatted: formatTime(arrivalTime),
          endFormatted: formatTime(departureTime),
          durationMins: duration,
        },
      };
    });

    const returnStart = currentMinute;
    const returnEnd = currentMinute + 15;

    return {
      totalCost,
      totalActivityMins,
      totalTransitMins,
      totalDurationHours: (totalMins / 60).toFixed(1),
      startTimeFormatted,
      endTimeFormatted: formatTime(returnEnd),
      timedStops,
      returnTransit: {
        startFormatted: formatTime(returnStart),
        endFormatted: formatTime(returnEnd),
      },
    };
  }, [selectedList]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-dusk">
        <div className="w-8 h-8 border-3 border-marigold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Network & Offline Status Banner */}
        {!isOnline && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-mono text-amber-900 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Offline Mode Active: Viewing locally cached itinerary for Bandra West</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
              <Check className="w-3 h-3 text-amber-900" />
              <span>Offline Ready</span>
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-marigold" />
                <span>Dynamic ReKnit Feasibility Solver · Gen #{generation}</span>
              </div>

              {isOfflineCached && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-[11px] font-mono font-bold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                  <span>Offline Ready</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink mt-2">
              Sequenced Day Itinerary
            </h1>
            <p className="text-xs text-dusk-600 font-mono mt-1">
              Start: Bandra West Base · 9:30 AM · Optimized sequence with deterministic transit buffers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveItinerary}
              className="px-5 py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              {isSaved ? <Check className="w-4 h-4 text-marigold" /> : <Calendar className="w-4 h-4 text-marigold" />}
              <span>{isSaved ? 'Saved to Profile' : 'Save Itinerary'}</span>
            </button>
          </div>
        </div>

        {/* Two Column Layout: Sequenced Timeline vs Feasibility Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Main Itinerary Sequence Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
              {/* Header & Quick Summary Ribbon */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-paper-200">
                <div>
                  <h2 className="text-2xl font-display font-bold text-ink">
                    Chronological ReKnit Timeline
                  </h2>
                  <p className="text-xs text-dusk-600 font-mono mt-0.5">
                    Deterministic packing order with real-time transit and buffer pacing
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-teal-50 text-teal-800 rounded-xl text-xs font-mono font-bold border border-teal-200 shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-marigold" />
                    <span>{selectedList.length} Experiences Packed</span>
                  </span>
                </div>
              </div>

              {/* High-Level Day Sequence Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-paper-50 rounded-2xl border border-paper-300">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-dusk font-mono">
                    <Clock className="w-3.5 h-3.5 text-teal" />
                    <span>Window</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-ink">
                    {itineraryStats.startTimeFormatted} – {itineraryStats.endTimeFormatted}
                  </div>
                  <div className="text-[10px] text-dusk-500 font-mono">
                    ~{itineraryStats.totalDurationHours} hrs span
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-dusk font-mono">
                    <Route className="w-3.5 h-3.5 text-marigold" />
                    <span>Stops</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-ink">
                    {selectedList.length} Curated Stops
                  </div>
                  <div className="text-[10px] text-dusk-500 font-mono">
                    {itineraryStats.totalActivityMins} min activity time
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-dusk font-mono">
                    <Navigation className="w-3.5 h-3.5 text-teal" />
                    <span>Transit</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-ink">
                    ~{itineraryStats.totalTransitMins} mins
                  </div>
                  <div className="text-[10px] text-dusk-500 font-mono">
                    Auto-rickshaw buffers
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-dusk font-mono">
                    <Banknote className="w-3.5 h-3.5 text-marigold" />
                    <span>Est. Cost</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-teal">
                    ₹{itineraryStats.totalCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-dusk-500 font-mono">
                    per person
                  </div>
                </div>
              </div>

              {/* Connected Step Sequence Timeline */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-marigold before:border-l before:border-dashed before:border-marigold">
                {/* Hotel Base Origin Anchor */}
                <div className="relative">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-xs shadow-md border-2 border-white ring-2 ring-paper-300">
                    <Building2 className="w-3.5 h-3.5 text-paper" />
                  </div>
                  <div className="p-4 bg-paper-100 rounded-2xl border border-paper-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-ink text-sm">Hotel Base (Bandra West)</strong>
                        <span className="px-2 py-0.5 bg-white rounded text-[10px] text-teal font-bold border border-paper-300">
                          Origin Anchor
                        </span>
                      </div>
                      <span className="text-dusk block text-[11px] mt-0.5">
                        Departure at 9:30 AM · Day circuit starting point
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-ink bg-white px-3 py-1.5 rounded-xl border border-paper-200">
                      <Clock className="w-3.5 h-3.5 text-teal" />
                      <span>09:30 AM Departure</span>
                    </div>
                  </div>
                </div>

                {/* Sequential Itinerary Stops */}
                <AnimatePresence>
                  {itineraryStats.timedStops.map((stopItem) => {
                    const { exp, index, transitBefore, activity } = stopItem;
                    return (
                      <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        {/* Transit Transfer Indicator */}
                        <div className="p-2.5 bg-paper-50 rounded-xl border border-paper-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-dusk-600">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-[10px]">
                              <Navigation className="w-3 h-3 text-amber-900" />
                            </div>
                            <span className="font-semibold text-ink">
                              ~{transitBefore.durationMins} min Auto-rickshaw transfer
                            </span>
                            <span className="hidden sm:inline text-dusk">·</span>
                            <span className="hidden sm:inline text-dusk-500">
                              Built-in traffic & ramp buffer
                            </span>
                          </div>
                          <span className="font-mono text-teal font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-paper-200">
                            {transitBefore.startFormatted} → {transitBefore.arrivalFormatted}
                          </span>
                        </div>

                        {/* Stop Card */}
                        <div className="relative">
                          <div className="absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full bg-marigold text-ink font-mono font-extrabold flex items-center justify-center text-xs shadow-md border-2 border-white ring-2 ring-paper-300">
                            {index}
                          </div>

                          <div className="p-6 bg-white hover:border-paper-400 rounded-2xl border border-paper-300 shadow-sm transition space-y-4">
                            {/* Card Top Row */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                                  <span className="px-2.5 py-0.5 rounded-full bg-paper-100 text-ink font-bold uppercase text-[10px] border border-paper-300">
                                    {exp.category}
                                  </span>
                                  <span className="text-dusk flex items-center gap-1 text-[11px]">
                                    <MapPin className="w-3 h-3 text-dusk-500" />
                                    {exp.area_name || exp.city || 'Bandra West'}
                                  </span>
                                  {exp.is_indoor && (
                                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                      Indoor / Rain-Safe
                                    </span>
                                  )}
                                  {(exp.accessibility_wheelchair || exp.wheelchair_accessible) && (
                                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                                      Wheelchair Accessible
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-lg font-display font-bold text-ink leading-snug">
                                  {exp.title}
                                </h3>
                              </div>

                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <span className="text-base font-mono font-extrabold text-teal block">
                                    ₹{exp.price}
                                  </span>
                                  <span className="text-[10px] font-mono text-dusk block">
                                    per person
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleRemoveExperience(exp.id)}
                                  className="p-1.5 text-dusk hover:text-red-600 hover:bg-red-50 rounded-lg transition border border-transparent hover:border-red-200"
                                  title="Remove from plan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Scheduled Time Bar */}
                            <div className="flex items-center gap-3 py-2 px-3 bg-paper-50 rounded-xl border border-paper-200 text-xs font-mono text-ink">
                              <div className="flex items-center gap-1.5 font-bold text-teal">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{activity.startFormatted} – {activity.endFormatted}</span>
                              </div>
                              <span className="text-paper-400">|</span>
                              <span className="text-dusk">
                                Duration: <strong className="text-ink">{activity.durationMins} mins</strong>
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
                              {exp.description}
                            </p>

                            {/* "Why This Fits You" Deterministic Explainability Line */}
                            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-xs font-sans text-teal-900 flex items-start gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <strong className="font-semibold block text-teal-950 font-mono text-[11px] uppercase tracking-wide">
                                  Why This Fits Your Constraints
                                </strong>
                                <p className="text-teal-900 text-xs">
                                  {exp.why_it_fits || 'Vetted for feasible travel time, neighborhood proximity, and step-free accessibility.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Return to Base Anchor */}
                {selectedList.length > 0 && (
                  <div className="space-y-4 pt-2">
                    {/* Final Transit Leg */}
                    <div className="p-2.5 bg-paper-50 rounded-xl border border-paper-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-dusk-600">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px]">
                          <Navigation className="w-3 h-3 text-teal-800" />
                        </div>
                        <span className="font-semibold text-ink">
                          ~15 min Return transfer to Base
                        </span>
                      </div>
                      <span className="font-mono text-teal font-bold text-[10px] bg-white px-2 py-0.5 rounded border border-paper-200">
                        {itineraryStats.returnTransit.startFormatted} → {itineraryStats.returnTransit.endFormatted}
                      </span>
                    </div>

                    {/* Circuit Complete Card */}
                    <div className="relative">
                      <div className="absolute -left-6 sm:-left-8 top-2 w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-xs shadow-md border-2 border-white ring-2 ring-paper-300">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="p-4 bg-white rounded-2xl border border-paper-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono shadow-sm">
                        <div>
                          <strong className="text-ink text-sm">Return to Hotel Base (Bandra West)</strong>
                          <span className="text-dusk block text-[11px] mt-0.5">
                            Circuit Complete · Safe return with full day buffered schedule
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-teal bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
                          <Check className="w-3.5 h-3.5 text-teal" />
                          <span>Complete at ~{itineraryStats.endTimeFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Feasibility Panel with 4 Disruption Triggers */}
          <div className="space-y-6">
            <FeasibilityPanel
              feasibility={feasibility}
              onReplan={handleReplan}
              isReplanning={isReplanning}
              selectedCount={selectedList.length}
            />

            {/* Quick Add Available Gems */}
            <div className="bg-white rounded-3xl border border-paper-400 p-6 space-y-4 shadow-md">
              <h4 className="text-sm font-display font-bold text-ink">
                Add Nearby Cultural Gems
              </h4>
              <div className="space-y-2.5">
                {availableExperiences
                  .filter((e) => !selectedIds.includes(e.id))
                  .slice(0, 4)
                  .map((gem) => (
                    <div
                      key={gem.id}
                      className="p-3 bg-paper-50 rounded-xl border border-paper-300 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 truncate pr-2">
                        <strong className="block text-ink truncate">{gem.title}</strong>
                        <span className="text-[10px] font-mono text-dusk">
                          {gem.duration_mins || 45} mins · ₹{gem.price}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddExperience(gem.id)}
                        className="p-1.5 bg-ink text-paper hover:bg-marigold hover:text-ink rounded-lg transition flex-shrink-0 shadow-sm"
                        title="Add to Itinerary"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
