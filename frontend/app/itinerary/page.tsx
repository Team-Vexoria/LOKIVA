'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Itinerary, Experience } from '../../types';
import { TimelineView } from '../../components/TimelineView';
import { InteractiveMap } from '../../components/InteractiveMap';
import { ReplanModal } from '../../components/ReplanModal';
import {
  Calendar,
  Sparkles,
  RefreshCw,
  Plus,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Share2,
  Printer
} from 'lucide-react';

import { useSearchParams } from 'next/navigation';

function ItineraryContent() {
  const searchParams = useSearchParams();
  const targetCity = searchParams.get('city') || 'Mumbai';

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [allExperiences, setAllExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReplanModalOpen, setIsReplanModalOpen] = useState(false);
  const [isReplanning, setIsReplanning] = useState(false);
  const [replanNotice, setReplanNotice] = useState<string | null>(null);

  const loadItineraryData = async () => {
    setIsLoading(true);
    try {
      // Get experiences for destination city
      const exps = await api.getExperiences({ city: targetCity, limit: 30 });
      setAllExperiences(exps);

      // Check if user has saved experience IDs
      const savedIdsStr = localStorage.getItem('lokiva_itinerary_ids');
      let expIds: number[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];

      // If no saved IDs or saved IDs don't belong to current city, pick top 2-3 from this city
      const matchingCityExps = exps.filter((e) => expIds.includes(e.id));
      if (matchingCityExps.length === 0 && exps.length >= 2) {
        expIds = [exps[0].id, exps[1].id];
        if (exps[2]) expIds.push(exps[2].id);
        localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(expIds));
      }

      // Create/calculate itinerary
      const itin = await api.createItinerary({
        title: `${targetCity} Authentic Day Plan`,
        city: targetCity,
        start_time: '10:00',
        total_duration_mins: 240,
        total_budget: 2000.0,
        experience_ids: expIds
      });
      setItinerary(itin);
    } catch (err) {
      console.error('Failed to load itinerary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItineraryData();
  }, []);

  const handleRemoveItem = async (index: number) => {
    if (!itinerary) return;
    const updatedItems = itinerary.items.filter((_, i) => i !== index);
    const updatedIds = updatedItems.map((it) => it.experience.id);
    localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(updatedIds));

    if (updatedIds.length === 0) {
      setItinerary(null);
      return;
    }

    try {
      const updatedItin = await api.createItinerary({
        title: itinerary.title,
        start_time: itinerary.start_time,
        total_duration_mins: itinerary.total_duration_mins,
        total_budget: itinerary.total_budget,
        experience_ids: updatedIds
      });
      setItinerary(updatedItin);
    } catch (err) {
      console.error('Failed to update itinerary:', err);
    }
  };

  const handleExecuteReplan = async (
    scenario: string,
    params?: { new_budget?: number; new_duration_mins?: number }
  ) => {
    if (!itinerary) return;
    setIsReplanning(true);
    try {
      const currentIds = itinerary.items.map((i) => i.experience.id);
      const res = await api.replanItinerary({
        itinerary_id: itinerary.id,
        city: targetCity,
        current_experience_ids: currentIds,
        scenario: scenario,
        new_budget: params?.new_budget,
        new_duration_mins: params?.new_duration_mins
      });

      setItinerary(res.itinerary);
      localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(res.updated_experience_ids));
      setReplanNotice(res.explanation);
      setIsReplanModalOpen(false);
    } catch (err) {
      console.error('Re-plan execution failed:', err);
    } finally {
      setIsReplanning(false);
    }
  };

  const itineraryExperiences = itinerary ? itinerary.items.map((i) => i.experience) : [];

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 transition-colors">
      {/* Top Header Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-4 sm:px-6 py-4 sticky top-16 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                {itinerary?.title || `${targetCity} Day Itinerary`}
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Live Feasibility Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sequenced timeline with verified inter-stop travel times and dynamic re-planning in {targetCity}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReplanModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-lg shadow-orange-500/20 hover:opacity-95 hover:scale-105 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Re-Plan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Replan Notification Banner */}
        {replanNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between animate-in fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{replanNotice}</span>
            </div>
            <button onClick={() => setReplanNotice(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
              Dismiss
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 rounded-full border-4 border-orange-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-400">Computing transit durations & feasibility scores in {targetCity}...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Timeline & Metrics (7 Cols) */}
            <div className="lg:col-span-7">
              <TimelineView
                itinerary={itinerary}
                onRemoveItem={handleRemoveItem}
                onReplanTrigger={() => setIsReplanModalOpen(true)}
              />
            </div>

            {/* Right Column: Interactive Route Map (5 Cols) */}
            <div className="lg:col-span-5 lg:sticky lg:top-40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {targetCity} Route Map
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {itineraryExperiences.length} Stops Connected
                </span>
              </div>

              <InteractiveMap
                experiences={allExperiences}
                itineraryExperiences={itineraryExperiences}
                cityName={targetCity}
                heightClass="h-[520px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dynamic Re-Plan Simulator Modal */}
      <ReplanModal
        isOpen={isReplanModalOpen}
        onClose={() => setIsReplanModalOpen(false)}
        onExecuteReplan={handleExecuteReplan}
        isLoading={isReplanning}
      />
    </div>
  );
}

export default function ItineraryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Itinerary Planner...</div>}>
      <ItineraryContent />
    </Suspense>
  );
}
