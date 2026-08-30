'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { DestinationDetail, Experience } from '../../../../types';
import { ExperienceCard } from '../../../../components/ExperienceCard';
import { InteractiveMap } from '../../../../components/InteractiveMap';
import {
  MapPin,
  Sparkles,
  CloudSun,
  Compass,
  Calendar,
  Layers,
  ArrowRight,
  ChevronLeft,
  Check,
  Plus
} from 'lucide-react';

interface PageProps {
  params: Promise<{ state: string; city: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [data, setData] = useState<DestinationDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [itineraryIds, setItineraryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDestination() {
      try {
        const res = await api.getDestinationDetail(resolvedParams.state, resolvedParams.city);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Destination not found');
      } finally {
        setIsLoading(false);
      }
    }
    loadDestination();
  }, [resolvedParams.state, resolvedParams.city]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading authentic local experiences for {resolvedParams.city}...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-200">Destination Not Found</h2>
        <p className="text-xs text-slate-400">
          We couldn&apos;t find information for {resolvedParams.city}, {resolvedParams.state}.
        </p>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Browse All Destinations</span>
        </Link>
      </div>
    );
  }

  const { city, state_name, weather_context, areas, experiences } = data;

  const filteredExperiences = selectedCategory === 'all'
    ? experiences
    : experiences.filter((e) => e.category === selectedCategory);

  const itineraryExperiences = experiences.filter((e) => itineraryIds.includes(e.id));

  const toggleItinerary = (exp: Experience) => {
    if (itineraryIds.includes(exp.id)) {
      setItineraryIds(itineraryIds.filter((id) => id !== exp.id));
    } else {
      setItineraryIds([...itineraryIds, exp.id]);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* DESTINATION HERO */}
      <section className="relative h-80 sm:h-96 rounded-b-[40px] overflow-hidden flex flex-col justify-end p-6 sm:p-12 select-none border-b border-slate-800">
        <img
          src={city.image_url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'}
          alt={city.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

        <div className="relative z-10 max-w-5xl space-y-3">
          {/* Breadcrumb & Weather */}
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/destinations"
              className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-700/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>All India</span>
            </Link>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/30 backdrop-blur-sm">
              {state_name}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-700/80 backdrop-blur-sm">
              <CloudSun className="w-3.5 h-3.5 text-amber-400" />
              <span>{weather_context}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
            {city.name}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-medium">
            {city.tagline || city.description}
          </p>

          {/* Neighborhood Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Neighborhoods:</span>
            {areas.slice(0, 6).map((area) => (
              <span
                key={area}
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-900/90 text-slate-300 border border-slate-800"
              >
                📍 {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ACTION BAR: Ask AI about this city / Plan Itinerary */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                Plan a custom day in {city.name} with AI
              </h3>
              <p className="text-xs text-slate-400">
                Tell us your available hours, budget, and walking preferences
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href={`/ai-guide?prompt=${encodeURIComponent(`Plan a 4-hour cultural & food experience in ${city.name}`)}`}
              className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
            >
              Ask AI Concierge
            </Link>
            {itineraryIds.length > 0 && (
              <Link
                href={`/itinerary?city=${encodeURIComponent(city.name)}`}
                className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-colors"
              >
                View Plan ({itineraryIds.length})
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SPLIT SCREEN: Interactive Map & Experience Catalog */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {['all', 'food', 'culture', 'workshop', 'hidden_gem', 'adventure', 'nature', 'shopping', 'nightlife'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm shrink-0 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-500/25'
                  : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? `All Experiences (${experiences.length})` : cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Map & List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Experience Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredExperiences.map((exp) => (
                <div key={exp.id} className="relative group">
                  <ExperienceCard
                    experience={exp}
                    onSelect={(e) => setSelectedExp(e)}
                    isSelected={selectedExp?.id === exp.id}
                  />
                  <button
                    onClick={() => toggleItinerary(exp)}
                    className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md transition-all flex items-center gap-1 ${
                      itineraryIds.includes(exp.id)
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-700 hover:bg-orange-500 hover:text-white'
                    }`}
                  >
                    {itineraryIds.includes(exp.id) ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>In Plan</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Vector Map for this City (5 cols sticky) */}
          <div className="lg:col-span-5 sticky top-20 space-y-3">
            <InteractiveMap
              experiences={filteredExperiences}
              selectedExperience={selectedExp}
              itineraryExperiences={itineraryExperiences}
              onSelectExperience={(e) => setSelectedExp(e)}
              onToggleItinerary={toggleItinerary}
              cityName={city.name}
              heightClass="h-[560px]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
