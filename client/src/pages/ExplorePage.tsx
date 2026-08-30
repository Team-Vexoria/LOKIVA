import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Experience } from '../types';
import { ExperienceCard } from '../components/experience/ExperienceCard';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Coins,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';

export function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCity = searchParams.get('city') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialBudget = searchParams.get('budget') ? parseInt(searchParams.get('budget')!, 10) : 3000;
  const initialWheelchair = searchParams.get('wheelchair') === 'true';
  const initialWalking = searchParams.get('walking') === 'true';

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [maxPrice, setMaxPrice] = useState(initialBudget);
  const [wheelchairOnly, setWheelchairOnly] = useState(initialWheelchair);
  const [lowWalkingOnly, setLowWalkingOnly] = useState(initialWalking);
  const [hiddenGemsOnly, setHiddenGemsOnly] = useState(false);
  const [rainSafeOnly, setRainSafeOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchList() {
      setIsLoading(true);
      try {
        const data = await api.getExperiences({
          city: selectedCity || undefined,
          category: selectedCategory || undefined,
          max_price: maxPrice,
          wheelchair: wheelchairOnly || undefined,
          low_walking: lowWalkingOnly || undefined,
          is_hidden_gem: hiddenGemsOnly || undefined,
          is_indoor: rainSafeOnly || undefined,
          search: searchQuery || undefined,
        });
        setExperiences(data);
      } catch (err) {
        console.error('Failed to load experiences:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchList();
  }, [
    selectedCity,
    selectedCategory,
    maxPrice,
    wheelchairOnly,
    lowWalkingOnly,
    hiddenGemsOnly,
    rainSafeOnly,
    searchQuery,
  ]);

  const categories = [
    'All Categories',
    'Food & Culinary',
    'Art & Craft',
    'Heritage & History',
    'Music & Dance',
    'Nature & Wildlife',
    'Wellness & Spiritual',
    'Local Markets',
  ];

  const cities = [
    'All Cities',
    'Mumbai',
    'Jaipur',
    'Kochi',
    'Goa',
    'Delhi',
    'Varanasi',
    'Udaipur',
    'Amritsar',
    'Mysuru',
    'Kolkata',
  ];

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-marigold" />
            <span>229 Vetted Experiences across 15 States</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">
            Cultural Experiences Catalog
          </h1>
          <p className="text-xs text-dusk-600">
            Enforcing hard accessibility pre-filtering, budget ceilings, and real travel-time feasibility.
          </p>
        </div>

        {/* Filter Panel */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 shadow-md space-y-6">
          {/* Top Search & Dropdown row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-dusk absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pottery, spice walk, kathakali..."
                className="w-full pl-10 pr-4 py-2.5 bg-paper-100 border border-paper-300 rounded-xl text-xs text-ink placeholder-dusk focus:outline-none focus:border-marigold font-sans"
              />
            </div>

            {/* City Dropdown */}
            <div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value === 'All Cities' ? '' : e.target.value)}
                className="w-full py-2.5 px-3 bg-paper-100 border border-paper-300 rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              >
                {cities.map((c) => (
                  <option key={c} value={c === 'All Cities' ? '' : c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value === 'All Categories' ? '' : e.target.value)}
                className="w-full py-2.5 px-3 bg-paper-100 border border-paper-300 rounded-xl text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottom Filter Controls: Sliders & Accessibility Toggles */}
          <div className="pt-4 border-t border-paper-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Budget Ceiling Slider */}
            <div className="w-full lg:w-72 space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-dusk uppercase">Budget Ceiling</span>
                <strong className="text-teal font-extrabold">₹{maxPrice} / pax</strong>
              </div>
              <input
                type="range"
                min="300"
                max="5000"
                step="200"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-paper-300 rounded-lg appearance-none cursor-pointer accent-teal"
              />
            </div>

            {/* Hard Constraint Checkboxes */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
                <input
                  type="checkbox"
                  checked={wheelchairOnly}
                  onChange={(e) => setWheelchairOnly(e.target.checked)}
                  className="rounded text-marigold focus:ring-marigold"
                />
                <span>♿ Wheelchair Access</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
                <input
                  type="checkbox"
                  checked={lowWalkingOnly}
                  onChange={(e) => setLowWalkingOnly(e.target.checked)}
                  className="rounded text-marigold focus:ring-marigold"
                />
                <span>🚶 Low Walking</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
                <input
                  type="checkbox"
                  checked={hiddenGemsOnly}
                  onChange={(e) => setHiddenGemsOnly(e.target.checked)}
                  className="rounded text-marigold focus:ring-marigold"
                />
                <span>💎 Unlisted Gems</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
                <input
                  type="checkbox"
                  checked={rainSafeOnly}
                  onChange={(e) => setRainSafeOnly(e.target.checked)}
                  className="rounded text-clay focus:ring-clay"
                />
                <span className="text-clay font-bold">🌧️ 100% Indoor / Rain-Safe</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Counter in JetBrains Mono */}
        <div className="flex items-center justify-between text-xs font-mono text-dusk">
          <span>
            Showing <strong className="text-ink">{experiences.length}</strong> verified feasible options
          </span>
          <span className="text-[11px] text-teal font-semibold">
            ✓ Hard constraints pre-filtered
          </span>
        </div>

        {/* Experiences Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-white border border-paper-400 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : experiences.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-paper-400 p-8 space-y-3">
            <h3 className="text-lg font-display font-bold text-ink">No experiences match all active constraints</h3>
            <p className="text-xs text-dusk font-sans">
              Try adjusting your budget ceiling or relaxing the rain-safe filter.
            </p>
            <button
              onClick={() => {
                setSelectedCity('');
                setSelectedCategory('');
                setMaxPrice(5000);
                setWheelchairOnly(false);
                setLowWalkingOnly(false);
                setHiddenGemsOnly(false);
                setRainSafeOnly(false);
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-ink text-paper rounded-xl font-mono text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
