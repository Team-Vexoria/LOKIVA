import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Experience } from '../types';
import { FeasibilityPanel } from '../components/itinerary/FeasibilityPanel';
import { ItineraryRouteMap } from '../components/map/ItineraryRouteMap';
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
  Share2,
  Navigation,
  Wifi,
  WifiOff,
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
  const [isRaining, setIsRaining] = useState(false);
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
    if (reason === 'rain') {
      setIsRaining(true);
    }
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

  const mapStops = selectedList.map((exp, idx) => ({
    id: exp.id,
    title: exp.title,
    category: exp.category,
    lat: exp.latitude || 19.0558 + idx * 0.005,
    lng: exp.longitude || 72.8295 + idx * 0.003,
    duration: `${exp.duration_mins || 45} mins`,
    price: `₹${exp.price}`,
    isIndoor: exp.is_indoor,
    wheelchair: exp.accessibility_wheelchair || exp.wheelchair_accessible,
    whyThis: exp.why_it_fits || 'Vetted step-free access for family group',
    icon: exp.category?.includes('Food') ? '🍲' : exp.category?.includes('Art') ? '🎨' : '🏛️',
  }));

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
              <span>Offline Mode Active: Viewing locally cached itinerary & maps for Bandra West</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-bold text-[10px]">
              Offline Ready ✓
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
                  <span>Offline Ready ✓</span>
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink mt-2">
              Sequenced Day Itinerary
            </h1>
            <p className="text-xs text-dusk-600 font-mono mt-1">
              Start: Bandra West Base · 9:30 AM · Real-time auto-rickshaw transit isochrones
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveItinerary}
              className="px-5 py-2.5 bg-ink hover:bg-ink-800 text-paper rounded-xl font-mono text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-marigold" />
              <span>{isSaved ? 'Saved to Profile ✓' : 'Save Itinerary'}</span>
            </button>
          </div>
        </div>

        {/* Two Column Layout: ReKnit Timeline vs Feasibility Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Timed Timeline & Interactive Route Map */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Spatial Feasibility Map */}
            <ItineraryRouteMap
              stops={mapStops}
              hotelLat={19.0522}
              hotelLng={72.8258}
              hotelName="Bandra West Hotel Base"
              isRaining={isRaining}
            />

            {/* Timeline Header */}
            <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-ink">
                    Chronological ReKnit Timeline
                  </h3>
                  <p className="text-xs text-dusk-600 font-mono">
                    Deterministic packing order with transit buffers
                  </p>
                </div>
                <span className="px-3 py-1 bg-paper-100 rounded-xl text-xs font-mono font-bold text-teal border border-paper-300">
                  {selectedList.length} Experiences Packed
                </span>
              </div>

              {/* Connected Step Sequence */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-marigold before:border-l before:border-dashed before:border-marigold">
                {/* Hotel Base Origin */}
                <div className="relative">
                  <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center text-xs shadow-md border-2 border-white">
                    🏨
                  </div>
                  <div className="p-3.5 bg-paper-100 rounded-2xl border border-paper-300 flex items-center justify-between text-xs font-mono">
                    <div>
                      <strong className="text-ink">Hotel Base (Bandra West)</strong>
                      <span className="text-dusk block text-[11px]">Departure 9:30 AM</span>
                    </div>
                    <span className="text-teal font-semibold">Origin Anchor</span>
                  </div>
                </div>

                {/* Itinerary Stops */}
                <AnimatePresence>
                  {selectedList.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Transit Buffer */}
                      <div className="flex items-center gap-2 text-[11px] font-mono text-dusk-600 py-1">
                        <Navigation className="w-3.5 h-3.5 text-marigold" />
                        <span>~12-15 min Auto-rickshaw transfer (Traffic & Ramp buffer)</span>
                      </div>

                      {/* Stop Card */}
                      <div className="relative">
                        <div className="absolute -left-6 sm:-left-8 top-3 w-6 h-6 rounded-full bg-marigold text-ink font-mono font-extrabold flex items-center justify-center text-xs shadow-md border-2 border-white">
                          {index + 1}
                        </div>

                        <div className="p-5 bg-paper-50 hover:bg-white rounded-2xl border border-paper-300 shadow-sm transition space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-mono">
                                <span className="px-2 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                                  {exp.category}
                                </span>
                                <span className="text-dusk">
                                  {exp.area_name || exp.city}
                                </span>
                              </div>
                              <h4 className="text-base font-display font-bold text-ink">
                                {exp.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-teal">
                                ₹{exp.price} / pax
                              </span>
                              <button
                                onClick={() => handleRemoveExperience(exp.id)}
                                className="p-1.5 text-dusk hover:text-clay hover:bg-paper-200 rounded-lg transition"
                                title="Remove from plan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                            {exp.description}
                          </p>

                          {/* "Why This Fits You" Deterministic Explainability Line */}
                          <div className="p-2.5 bg-white rounded-xl border border-paper-300 text-xs font-sans text-teal-800 flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
                            <span>
                              <strong>Why this fits:</strong> {exp.why_it_fits || 'Fits your time window, 500m radius, ground-floor step-free access.'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                  .slice(0, 3)
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
