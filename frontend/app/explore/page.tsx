'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { Experience, ScoredExperience } from '../../types';
import { ExperienceCard } from '../../components/ExperienceCard';
import { InteractiveMap } from '../../components/InteractiveMap';
import { LocationSelector } from '../../components/LocationSelector';
import {
  Filter,
  Search,
  Sparkles,
  MapPin,
  SlidersHorizontal,
  Calendar,
  Layers,
  Footprints,
  Accessibility,
  Users,
  Coins,
  Clock,
  CloudRain,
  RotateCcw,
  Check,
  Plus,
  Compass,
  Map as MapIcon,
  List as ListIcon,
  Globe2
} from 'lucide-react';
import Link from 'next/link';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialCity = searchParams.get('city') || 'all';
  const initialGems = searchParams.get('hidden_gems') === 'true';

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [itineraryIds, setItineraryIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [maxBudget, setMaxBudget] = useState<number>(2500);
  const [maxDuration, setMaxDuration] = useState<number>(240);
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState<boolean>(initialGems);
  const [lowWalkingOnly, setLowWalkingOnly] = useState<boolean>(false);
  const [wheelchairOnly, setWheelchairOnly] = useState<boolean>(false);
  const [familyFriendlyOnly, setFamilyFriendlyOnly] = useState<boolean>(false);
  const [indoorOnly, setIndoorOnly] = useState<boolean>(false);
  const [vegetarianOnly, setVegetarianOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'duration'>('rating');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Load saved itinerary from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('lokiva_itinerary_ids');
      if (saved) {
        setItineraryIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveItinerary = (ids: number[]) => {
    setItineraryIds(ids);
    try {
      localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const toggleItinerary = (exp: Experience) => {
    if (itineraryIds.includes(exp.id)) {
      saveItinerary(itineraryIds.filter((id) => id !== exp.id));
    } else {
      saveItinerary([...itineraryIds, exp.id]);
    }
  };

  // Fetch experiences
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await api.getExperiences({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          city: selectedCity !== 'all' ? selectedCity : undefined,
          q: searchQuery || undefined,
          max_price: maxBudget < 2500 ? maxBudget : undefined,
          max_duration_mins: maxDuration < 240 ? maxDuration : undefined,
          is_hidden_gem: hiddenGemsOnly ? true : undefined,
          low_walking: lowWalkingOnly || undefined,
          wheelchair: wheelchairOnly || undefined,
          family_friendly: familyFriendlyOnly || undefined,
          is_indoor: indoorOnly ? true : undefined,
          vegetarian_only: vegetarianOnly || undefined,
          limit: 80
        });
        setExperiences(data);
      } catch (err) {
        console.error('Failed to load experiences:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [
    selectedCategory,
    selectedCity,
    searchQuery,
    maxBudget,
    maxDuration,
    hiddenGemsOnly,
    lowWalkingOnly,
    wheelchairOnly,
    familyFriendlyOnly,
    indoorOnly,
    vegetarianOnly
  ]);

  // Sort experiences
  const sortedExperiences = useMemo(() => {
    const sorted = [...experiences];
    if (sortBy === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.popularity_score - a.popularity_score);
    } else if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'duration') {
      sorted.sort((a, b) => a.duration_mins - b.duration_mins);
    }
    return sorted;
  }, [experiences, sortBy]);

  const itineraryExperiences = experiences.filter((e) => itineraryIds.includes(e.id));

  const resetFilters = () => {
    setSelectedCategory('all');
    setSelectedCity('all');
    setSearchQuery('');
    setMaxBudget(2500);
    setMaxDuration(240);
    setHiddenGemsOnly(false);
    setLowWalkingOnly(false);
    setWheelchairOnly(false);
    setFamilyFriendlyOnly(false);
    setIndoorOnly(false);
    setVegetarianOnly(false);
    setSortBy('rating');
  };

  const categoriesList = [
    { key: 'all', label: 'All' },
    { key: 'food', label: 'Food & Cuisine' },
    { key: 'culture', label: 'Culture & Heritage' },
    { key: 'workshop', label: 'Artisan Workshops' },
    { key: 'hidden_gem', label: 'Hidden Gems' },
    { key: 'adventure', label: 'Adventures' },
    { key: 'nature', label: 'Nature' },
    { key: 'shopping', label: 'Bazaars' },
    { key: 'nightlife', label: 'Nightlife' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              {selectedCity === 'all' ? 'PAN-INDIA CATALOG' : `${selectedCity.toUpperCase()} EXPERIENCES`}
            </span>
            <span className="text-xs text-slate-400">
              {sortedExperiences.length} verified experiences found
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
            {selectedCity === 'all' ? 'Explore Local Experiences Across India' : `Authentic Local Experiences in ${selectedCity}`}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Location Selector */}
          <LocationSelector
            currentCity={selectedCity === 'all' ? 'All India' : selectedCity}
            onSelectLocation={(loc) => {
              if (loc.city) {
                setSelectedCity(loc.city);
              }
            }}
          />

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showFilters || hiddenGemsOnly || lowWalkingOnly || maxBudget < 2500
                ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white shadow-sm'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'split' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Split View (Catalog + Map)"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Itinerary CTA */}
          {itineraryIds.length > 0 && (
            <Link
              href={`/itinerary?city=${encodeURIComponent(selectedCity !== 'all' ? selectedCity : 'Mumbai')}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-opacity"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Itinerary ({itineraryIds.length})</span>
            </Link>
          )}
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
        {categoriesList.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shadow-sm shrink-0 ${
              selectedCategory === cat.key
                ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-500/20'
                : 'bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-500" />
              Refine Search Constraints
            </h3>
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-slate-600 dark:text-slate-400 font-semibold">Keyword Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Kachori, pottery, chai, sunset..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-slate-900 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Max Budget Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Max Budget per person</span>
                <span className="text-amber-300 font-bold">₹{maxBudget}</span>
              </div>
              <input
                type="range"
                min={100}
                max={2500}
                step={50}
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            {/* Max Duration */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400 font-semibold">
                <span>Max Stay Duration</span>
                <span className="text-slate-200 font-bold">{Math.floor(maxDuration / 60)}h {maxDuration % 60}m</span>
              </div>
              <input
                type="range"
                min={30}
                max={240}
                step={15}
                value={maxDuration}
                onChange={(e) => setMaxDuration(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="duration">Quickest Duration</option>
              </select>
            </div>
          </div>

          {/* Boolean Quick Toggles */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-800/80">
            {[
              { label: '✨ Hidden Gems Only', state: hiddenGemsOnly, setter: setHiddenGemsOnly },
              { label: '🚶 Low Walking (Seated)', state: lowWalkingOnly, setter: setLowWalkingOnly },
              { label: '♿ Wheelchair Accessible', state: wheelchairOnly, setter: setWheelchairOnly },
              { label: '👨‍👩‍👧 Family Friendly', state: familyFriendlyOnly, setter: setFamilyFriendlyOnly },
              { label: '🌧️ Indoor (Rain-Safe)', state: indoorOnly, setter: setIndoorOnly },
              { label: '🌱 Pure Vegetarian', state: vegetarianOnly, setter: setVegetarianOnly }
            ].map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => t.setter(!t.state)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  t.state
                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CATALOG & MAP VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Catalog Cards Column (7 cols in split, 12 in list) */}
        <div className={`${viewMode === 'split' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          {isLoading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs">Finding matching authentic experiences across India...</p>
            </div>
          ) : sortedExperiences.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
              <Compass className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-200">No matching experiences found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try widening your search filters, budget, or choose a different city.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${viewMode === 'split' ? 'sm:grid-cols-2' : 'sm:grid-cols-3 md:grid-cols-4'} gap-4`}>
              {sortedExperiences.map((exp) => (
                <div key={exp.id} className="relative group">
                  <ExperienceCard
                    experience={exp}
                    onSelect={(e) => setSelectedExp(e)}
                    isSelected={selectedExp?.id === exp.id}
                  />

                  {/* Add to Itinerary Button */}
                  <button
                    onClick={() => toggleItinerary(exp)}
                    className={`absolute top-3 right-3 z-10 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md transition-all flex items-center gap-1 ${
                      itineraryIds.includes(exp.id)
                        ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                        : 'bg-slate-950/90 text-slate-200 border border-slate-700/80 hover:bg-orange-500 hover:text-white'
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
          )}
        </div>

        {/* Interactive Vector Map Column (5 cols sticky) */}
        {viewMode === 'split' && (
          <div className="lg:col-span-5 sticky top-20 space-y-3">
            <InteractiveMap
              experiences={sortedExperiences}
              selectedExperience={selectedExp}
              itineraryExperiences={itineraryExperiences}
              onSelectExperience={(e) => setSelectedExp(e)}
              onToggleItinerary={toggleItinerary}
              cityName={selectedCity !== 'all' ? selectedCity : 'India'}
              heightClass="h-[600px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Experience Catalog...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
