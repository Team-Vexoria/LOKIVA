import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { Experience } from '../types';
import { FeasibilityPanel } from '../components/itinerary/FeasibilityPanel';
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
} from 'lucide-react';

export function ItineraryPage() {
  const [availableExperiences, setAvailableExperiences] = useState<Experience[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([1, 2, 3]);
  const [feasibility, setFeasibility] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanning, setIsReplanning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [generation, setGeneration] = useState(1);

  useEffect(() => {
    async function loadInitial() {
      try {
        const exps = await api.getExperiences({ city: 'Jaipur', limit: 12 });
        setAvailableExperiences(exps);
        if (exps.length >= 3) {
          const ids = [exps[0].id, exps[1].id, exps[2].id];
          setSelectedIds(ids);
          const fRes = await api.checkFeasibility(ids);
          setFeasibility(fRes);
        }
      } catch (err) {
        console.error('Failed to load itinerary planner:', err);
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
      const res = await api.replanItinerary(selectedIds, reason, 'Jaipur');
      if (res.new_experience_ids && res.new_experience_ids.length > 0) {
        setSelectedIds(res.new_experience_ids);
        setFeasibility(res.feasibility);
        setGeneration((g) => g + 1);
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
        title: 'Jaipur Heritage & Craft Day Journey',
        city: 'Jaipur',
        state: 'Rajasthan',
        experience_ids: selectedIds,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (err) {
      console.error('Failed to save itinerary:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-dusk">
        <div className="w-8 h-8 border-3 border-marigold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>Dynamic ReKnit Feasibility Solver</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink mt-2">
              Sequenced Day Itinerary
            </h1>
            <p className="text-xs text-dusk-600 font-mono mt-1">
              Start: Hotel Diggi Palace · 9:00 AM · Real-time auto-rickshaw transit isochrones
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
          {/* Left 2 Cols: Timed Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-display font-bold text-ink flex items-center gap-2">
                <Clock className="w-5 h-5 text-marigold" />
                Chronological Sequence & Pacing
              </h2>
              <span className="text-xs font-mono text-dusk">
                Generation #{generation}
              </span>
            </div>

            {feasibility?.items && feasibility.items.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={generation}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-paper-400"
                >
                  {feasibility.items.map((item: any, idx: number) => (
                    <div key={idx} className="relative pl-12">
                      {/* Node Dot */}
                      <div className="absolute left-3.5 top-6 w-5 h-5 -translate-x-1/2 rounded-full bg-ink text-marigold font-mono font-extrabold text-[10px] flex items-center justify-center shadow-md border-2 border-paper">
                        {item.item_order}
                      </div>

                      {/* Timeline Card */}
                      <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 space-y-3 shadow-md hover:border-ink/30 transition">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal">
                              <span>{item.start_time} - {item.end_time}</span>
                              <span className="text-paper-400">•</span>
                              <span className="text-dusk font-normal uppercase text-[10px]">{item.category}</span>
                            </div>
                            <h3 className="text-base font-display font-bold text-ink">
                              {item.title}
                            </h3>
                          </div>

                          <button
                            onClick={() => handleRemoveExperience(item.experience_id)}
                            className="text-dusk hover:text-clay p-1.5 rounded-lg hover:bg-paper-200 transition"
                            title="Remove stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Explainability Tag */}
                        <div className="p-2.5 bg-paper-100 rounded-xl border border-paper-300 text-[11px] text-ink flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal flex-shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-teal font-semibold">Why this fits:</strong>{' '}
                            {item.why_it_fits ||
                              `Ground-floor step-free access, 10 mins from prior stop, fits budget.`}
                          </span>
                        </div>

                        {/* Travel buffer badge to next stop */}
                        {item.travel_time_to_next_mins > 0 && (
                          <div className="p-2 bg-paper-100 rounded-xl border border-paper-300 text-[11px] font-mono text-dusk-700 flex items-center gap-2">
                            <Navigation className="w-3.5 h-3.5 text-marigold" />
                            <span>
                              <strong>{item.travel_time_to_next_mins} mins</strong> auto transfer buffer ({item.distance_km} km)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="p-10 bg-white rounded-3xl border border-paper-400 text-center space-y-2 font-mono text-xs text-dusk">
                <p>No experiences selected in the timeline.</p>
              </div>
            )}

            {/* Add Nearby Experiences Section */}
            <div className="pt-6 space-y-4">
              <h3 className="text-base font-display font-bold text-ink">
                Add Nearby Feasible Cultural Experiences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableExperiences
                  .filter((e) => !selectedIds.includes(e.id))
                  .slice(0, 4)
                  .map((e) => (
                    <div
                      key={e.id}
                      className="p-3.5 bg-white rounded-2xl border border-paper-400 flex items-center justify-between gap-3 shadow-sm hover:border-ink/30 transition"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-ink truncate font-display">{e.title}</h4>
                        <span className="text-[10px] font-mono text-dusk">₹{e.price} · {e.approx_duration_mins} mins</span>
                      </div>
                      <button
                        onClick={() => handleAddExperience(e.id)}
                        className="p-2 bg-paper-200 hover:bg-ink hover:text-paper text-ink rounded-xl text-xs font-mono transition"
                        title="Add to Itinerary"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Right Col: Feasibility Panel */}
          <div>
            <div className="sticky top-24">
              <FeasibilityPanel
                feasibility={feasibility}
                onReplan={handleReplan}
                isReplanning={isReplanning}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
