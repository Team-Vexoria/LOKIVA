import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { State, City, Experience } from '../types';
import {
  MapPin,
  Compass,
  ArrowRight,
  Sparkles,
  Search,
  SlidersHorizontal,
  Navigation,
  Map,
  Grid,
  Building2,
  Landmark,
  X,
  ChevronRight,
  Filter,
  Layers,
  Heart,
import { PanIndiaDestinationsMap } from '../components/map/PanIndiaDestinationsMap';

const REGIONS = [
  'All',
  'North India',
  'South India',
  'West India',
  'East India',
  'Central India',
  'North-East India',
  'Islands',
];

const CATEGORIES = [
  { label: 'All', icon: '✨' },
  { label: 'Heritage', icon: '🏛️' },
  { label: 'Art & Culture', icon: '🎨' },
  { label: 'Local Food', icon: '🍛' },
  { label: 'Festivals', icon: '🎭' },
  { label: 'Workshops', icon: '🧑‍🍳' },
  { label: 'Nature', icon: '🌿' },
  { label: 'Adventure', icon: '🥾' },
  { label: 'Spiritual', icon: '🛕' },
  { label: 'Hidden Gems', icon: '💎' },
];

export function DestinationsPage() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and View State
  const [viewMode, setViewMode] = useState<'all' | 'states' | 'uts' | 'cities' | 'map'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'heritage' | 'experiences' | 'name' | 'popular'>('popular');

  // State Drilldown Modal
  const [selectedStateDetail, setSelectedStateDetail] = useState<State | null>(null);

  // Geolocation state
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyData, setNearbyData] = useState<{
    nearestCity: City | null;
    nearbyCities: City[];
    nearbyExperiences: Experience[];
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statesData, citiesData, expData] = await Promise.all([
          api.getStates(),
          api.getCities({ limit: 150 }),
          api.getExperiences({ limit: 60 }),
        ]);
        setStates(statesData);
        setCities(citiesData);
        setExperiences(expData);
      } catch (err) {
        console.error('Failed to load Pan-India destinations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Geolocation Detection Handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        try {
          const res = await api.getNearbyDestinations(coords.lat, coords.lng, 350);
          setNearbyData({
            nearestCity: res.nearest_city,
            nearbyCities: res.nearby_cities || [],
            nearbyExperiences: res.nearby_experiences || [],
          });
        } catch (err) {
          console.error('Failed to fetch nearby destinations:', err);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError('Location permission was denied. Search anywhere across India manually.');
      },
      { timeout: 10000 }
    );
  };

  // Filtered States
  const filteredStates = useMemo(() => {
    return states.filter((state) => {
      // View mode filter (all, states, uts)
      if (viewMode === 'states' && state.is_union_territory) return false;
      if (viewMode === 'uts' && !state.is_union_territory) return false;

      // Region filter
      if (selectedRegion !== 'All' && state.region !== selectedRegion) return false;

      // Search query filter (matches name, code, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = state.name.toLowerCase().includes(q);
        const matchesCode = state.code.toLowerCase().includes(q);
        const matchesDesc = (state.description || '').toLowerCase().includes(q);
        const matchesCity = cities.some(
          (c) =>
            (c.state_id === state.id || c.state_name === state.name) &&
            (c.name.toLowerCase().includes(q) || (c.aliases || []).some((a) => a.toLowerCase().includes(q)))
        );
        if (!matchesName && !matchesCode && !matchesDesc && !matchesCity) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'heritage') return (b.heritage_count || 0) - (a.heritage_count || 0);
      if (sortBy === 'experiences') return (b.experience_count || 0) - (a.experience_count || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.heritage_count || 0) - (a.heritage_count || 0);
    });
  }, [states, cities, viewMode, selectedRegion, searchQuery, sortBy]);

  // Filtered Cities
  const filteredCities = useMemo(() => {
    return cities.filter((city) => {
      // Region filter
      if (selectedRegion !== 'All') {
        const parentState = states.find((s) => s.id === city.state_id || s.name === city.state_name);
        if (parentState && parentState.region !== selectedRegion) return false;
      }

      // Category filter
      if (selectedCategory !== 'All') {
        const cats = city.categories || city.popular_categories || [];
        if (!cats.some((c) => c.toLowerCase().includes(selectedCategory.toLowerCase()))) return false;
      }

      // Search query filter (matches city name, state, aliases, tagline, description)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = city.name.toLowerCase().includes(q);
        const matchesState = (city.state_name || '').toLowerCase().includes(q);
        const matchesAliases = (city.aliases || []).some((a) => a.toLowerCase().includes(q));
        const matchesTagline = (city.tagline || '').toLowerCase().includes(q);
        const matchesDesc = (city.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesState && !matchesAliases && !matchesTagline && !matchesDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'heritage') return (b.heritage_count || 0) - (a.heritage_count || 0);
      if (sortBy === 'experiences') return (b.experience_count || 0) - (a.experience_count || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
    });
  }, [cities, states, selectedRegion, selectedCategory, searchQuery, sortBy]);

  // Featured Quick Links
  const featuredHubs = useMemo(() => {
    const hubNames = ['Mumbai', 'Jaipur', 'Varanasi', 'Kochi', 'Amritsar', 'Hampi', 'Srinagar', 'Kolkata', 'Udaipur', 'Madurai', 'Shillong', 'Delhi'];
    return cities.filter((c) => hubNames.includes(c.name)).slice(0, 12);
  }, [cities]);

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12 selection:bg-marigold selection:text-ink">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* 1. Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
              <Compass className="w-3.5 h-3.5 text-marigold" />
              <span>PAN-INDIA DESTINATION NETWORK</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-bold text-ink tracking-tight">
              Explore India — State by State, City by City
            </h1>

            <p className="text-xs sm:text-sm text-dusk-600 font-sans leading-relaxed">
              Discover local culture, heritage, food, experiences, hidden gems, festivals, and communities across all 28 States and 8 Union Territories.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="px-4 py-2.5 bg-white hover:bg-paper-200 border border-paper-400 text-ink rounded-xl text-xs font-mono font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Navigation className={`w-4 h-4 text-teal ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Detecting...' : 'Near You'}</span>
            </button>
          </div>
        </div>

        {/* 2. Geolocation Nearby Discovery Banner */}
        {nearbyData && nearbyData.nearestCity && (
          <div className="bg-gradient-to-r from-teal-50 via-white to-marigold-50 border border-teal-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  📍
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-teal-800 uppercase tracking-wider">
                    Location Detected
                  </div>
                  <h3 className="text-lg font-display font-bold text-ink">
                    You are near {nearbyData.nearestCity.name} ({nearbyData.nearestCity.state_name})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/destination/${encodeURIComponent(nearbyData.nearestCity.state_name || '')}/${encodeURIComponent(nearbyData.nearestCity.name)}`}
                  className="px-4 py-1.5 bg-ink text-white hover:bg-teal rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5"
                >
                  <span>Explore {nearbyData.nearestCity.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setNearbyData(null)}
                  className="p-1.5 text-dusk hover:text-ink transition rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nearby Hubs Chips */}
            {nearbyData.nearbyCities.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-paper-300">
                <span className="text-xs font-mono font-bold text-dusk">Nearby Enclaves:</span>
                {nearbyData.nearbyCities.slice(1, 6).map((nc) => (
                  <Link
                    key={nc.id}
                    to={`/destination/${encodeURIComponent(nc.state_name || '')}/${encodeURIComponent(nc.name)}`}
                    className="px-2.5 py-1 bg-white border border-paper-400 hover:border-ink rounded-lg text-xs font-mono text-ink transition flex items-center gap-1"
                  >
                    <span>{nc.name}</span>
                    <span className="text-[10px] text-dusk">({nc.distance_km}km)</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {locationError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-4 py-3 text-xs font-mono flex items-center justify-between">
            <span>⚠️ {locationError}</span>
            <button onClick={() => setLocationError(null)} className="text-amber-700 hover:text-amber-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Featured Destinations Quick Ribbon */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-dusk uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-marigold" />
              <span>Featured Across India</span>
            </span>
            <span className="text-[11px] font-mono text-dusk-600">36 States & UTs Available</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {featuredHubs.map((hub) => (
              <Link
                key={hub.id}
                to={`/destination/${encodeURIComponent(hub.state_name || '')}/${encodeURIComponent(hub.name)}`}
                className="px-3.5 py-1.5 bg-white hover:bg-ink hover:text-white border border-paper-400 rounded-full text-xs font-mono text-ink whitespace-nowrap shadow-sm transition flex items-center gap-1.5 group"
              >
                <MapPin className="w-3 h-3 text-marigold group-hover:text-marigold" />
                <span>{hub.name}</span>
                <span className="text-[10px] text-dusk-500 group-hover:text-dusk-200">
                  {hub.state_code || hub.state_name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. Search and View Controls */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 shadow-sm space-y-5">
          {/* Main Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-dusk absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search across all states, cities, towns, heritage sites, craft clusters, or aliases (e.g. Pune, Rajasthan, Hampi, Aurangabad, pottery, beaches)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-paper-100 border border-paper-400 rounded-2xl text-xs sm:text-sm font-sans focus:outline-none focus:border-ink transition placeholder:text-dusk-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-dusk hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Mode Buttons & Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-paper-300">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-paper-200 p-1 rounded-2xl gap-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'all' ? 'bg-white text-ink shadow-sm' : 'text-dusk hover:text-ink'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>All India (36)</span>
              </button>
              <button
                onClick={() => setViewMode('states')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'states' ? 'bg-white text-ink shadow-sm' : 'text-dusk hover:text-ink'
                }`}
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>28 States</span>
              </button>
              <button
                onClick={() => setViewMode('uts')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'uts' ? 'bg-white text-ink shadow-sm' : 'text-dusk hover:text-ink'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>8 UTs</span>
              </button>
              <button
                onClick={() => setViewMode('cities')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'cities' ? 'bg-white text-ink shadow-sm' : 'text-dusk hover:text-ink'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Cities & Hubs ({cities.length})</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'map' ? 'bg-ink text-white shadow-sm' : 'text-dusk hover:text-ink'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-marigold" />
                <span>Explore on Map</span>
              </button>
            </div>

            {/* Region Dropdown & Sort */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-paper-100 px-3 py-1.5 rounded-xl border border-paper-400 text-xs font-mono">
                <span className="text-dusk">Region:</span>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-paper-100 px-3 py-1.5 rounded-xl border border-paper-400 text-xs font-mono">
                <span className="text-dusk">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer"
                >
                  <option value="popular">Popularity</option>
                  <option value="heritage">Heritage Sites</option>
                  <option value="experiences">Experiences</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition flex items-center gap-1.5 whitespace-nowrap ${
                  selectedCategory === cat.label
                    ? 'bg-ink text-white font-bold'
                    : 'bg-paper-100 hover:bg-paper-300 text-ink border border-paper-300'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 5. Interactive Map View or Cards Grid */}
        {viewMode === 'map' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-ink">
                Interactive Pan-India Discovery Map
              </h3>
              <span className="text-xs font-mono text-dusk">
                Showing {filteredCities.length} mapped cultural hubs
              </span>
            </div>
            <PanIndiaDestinationsMap
              cities={filteredCities}
              userCoords={userCoords}
            />
          </div>
        ) : (
          <div>
            {/* View Mode: Cities Hubs View */}
            {viewMode === 'cities' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-ink">
                    Verified Destination Hubs & Cities ({filteredCities.length})
                  </h3>
                  <span className="text-xs font-mono text-dusk">
                    Tier 1, Tier 2, Tier 3 & Heritage Clusters
                  </span>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-64 bg-white border border-paper-400 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredCities.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-paper-400 p-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-paper-200 rounded-full flex items-center justify-center mx-auto text-2xl">
                      🔍
                    </div>
                    <h3 className="text-lg font-display font-bold text-ink">
                      No destinations found
                    </h3>
                    <p className="text-xs text-dusk-600 max-w-md mx-auto">
                      No Indian cities matched your search "{searchQuery}" with the current filters. Try resetting the filters.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRegion('All');
                        setSelectedCategory('All');
                      }}
                      className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCities.map((city) => (
                      <div
                        key={city.id}
                        className="bg-white rounded-3xl border border-paper-400 p-6 space-y-4 shadow-sm hover:shadow-xl hover:border-ink/40 transition flex flex-col justify-between group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-paper-200 text-teal-700 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-marigold" />
                              <span>{city.state_name}</span>
                            </span>
                            <span className="text-[11px] font-mono text-dusk">
                              {city.tier || 'Heritage Hub'}
                            </span>
                          </div>

                          <h3 className="text-2xl font-display font-bold text-ink group-hover:text-teal transition">
                            {city.name}
                          </h3>

                          <p className="text-xs text-dusk-600 line-clamp-2 leading-relaxed font-sans">
                            {city.tagline || city.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(city.categories || city.popular_categories || ['Heritage', 'Local Food']).slice(0, 3).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-paper-100 text-[10px] font-mono rounded-md text-dusk-700"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
                          <div className="text-dusk">
                            <span className="font-bold text-ink">{city.experience_count || 12}</span> Experiences
                          </div>
                          <Link
                            to={`/destination/${encodeURIComponent(city.state_name || '')}/${encodeURIComponent(city.name)}`}
                            className="inline-flex items-center gap-1 text-teal-700 hover:text-ink font-bold transition group-hover:translate-x-0.5"
                          >
                            <span>Explore {city.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* View Mode: All India / States / Union Territories Grid */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-display font-bold text-ink">
                    {viewMode === 'uts'
                      ? 'Indian Union Territories (8)'
                      : viewMode === 'states'
                      ? 'Indian States (28)'
                      : 'All 36 Indian States & Union Territories'}
                  </h3>
                  <span className="text-xs font-mono text-dusk">
                    Showing {filteredStates.length} Regions
                  </span>
                </div>

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="h-64 bg-white border border-paper-400 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : filteredStates.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-paper-400 p-12 text-center space-y-4">
                    <div className="w-12 h-12 bg-paper-200 rounded-full flex items-center justify-center mx-auto text-2xl">
                      🔍
                    </div>
                    <h3 className="text-lg font-display font-bold text-ink">
                      No states or UTs found
                    </h3>
                    <p className="text-xs text-dusk-600 max-w-md mx-auto">
                      No region matched "{searchQuery}" under {selectedRegion}. Try searching across all India.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRegion('All');
                      }}
                      className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStates.map((state) => {
                      const stateCities = cities.filter(
                        (c) => c.state_id === state.id || c.state_name === state.name
                      );

                      return (
                        <div
                          key={state.id}
                          className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-7 space-y-4 shadow-sm hover:shadow-xl hover:border-ink/40 transition flex flex-col justify-between group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-paper-200 text-teal-700">
                                📍 {state.region}
                              </span>
                              <span className="text-[11px] font-mono text-dusk font-bold">
                                {state.is_union_territory ? 'Union Territory' : 'State'}
                              </span>
                            </div>

                            <h3 className="text-2xl font-display font-bold text-ink group-hover:text-teal transition">
                              {state.name}
                            </h3>

                            <div className="flex items-center gap-3 text-xs font-mono text-dusk-600">
                              <span>{stateCities.length || state.city_count || 1} Enclaves</span>
                              <span>•</span>
                              <span>{state.heritage_count || 14} Heritage Sites</span>
                              <span>•</span>
                              <span>{state.experience_count || 18} Experiences</span>
                            </div>

                            <p className="text-xs text-dusk-600 line-clamp-2 leading-relaxed font-sans">
                              {state.description}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-paper-300">
                            {/* City Pills inside State Card */}
                            <div className="flex flex-wrap gap-1.5">
                              {stateCities.slice(0, 4).map((city) => (
                                <Link
                                  key={city.id}
                                  to={`/destination/${encodeURIComponent(state.name)}/${encodeURIComponent(city.name)}`}
                                  className="px-2.5 py-1 bg-paper-100 hover:bg-ink hover:text-paper rounded-lg text-xs font-mono text-ink transition flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3 text-marigold" />
                                  <span>{city.name}</span>
                                </Link>
                              ))}
                              {stateCities.length > 4 && (
                                <button
                                  onClick={() => setSelectedStateDetail(state)}
                                  className="px-2 py-1 bg-paper-200 hover:bg-paper-300 rounded-lg text-xs font-mono text-dusk font-bold"
                                >
                                  +{stateCities.length - 4} more
                                </button>
                              )}
                            </div>

                            {/* Explore State Button */}
                            <button
                              onClick={() => setSelectedStateDetail(state)}
                              className="w-full py-2.5 px-4 bg-paper-100 hover:bg-ink hover:text-white border border-paper-300 rounded-xl text-xs font-mono font-bold text-ink transition flex items-center justify-between"
                            >
                              <span>Explore {state.name} Network</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* State Drill-down Modal */}
        {selectedStateDetail && (
          <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-paper-200 text-teal-800 rounded-full text-xs font-mono font-bold">
                    <span>📍 {selectedStateDetail.region}</span>
                    <span>•</span>
                    <span>{selectedStateDetail.is_union_territory ? 'Union Territory' : 'Indian State'}</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-ink mt-2">
                    {selectedStateDetail.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-dusk-600 font-sans mt-1">
                    {selectedStateDetail.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStateDetail(null)}
                  className="p-2 text-dusk hover:text-ink bg-paper-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verified Cities in this State */}
              <div className="space-y-4">
                <h3 className="text-sm font-mono font-bold text-ink uppercase tracking-wider">
                  Verified Cities & Destinations in {selectedStateDetail.name}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cities
                    .filter((c) => c.state_id === selectedStateDetail.id || c.state_name === selectedStateDetail.name)
                    .map((c) => (
                      <Link
                        key={c.id}
                        to={`/destination/${encodeURIComponent(selectedStateDetail.name)}/${encodeURIComponent(c.name)}`}
                        onClick={() => setSelectedStateDetail(null)}
                        className="p-4 bg-paper-50 hover:bg-paper-100 border border-paper-300 hover:border-ink rounded-2xl transition space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-ink group-hover:text-teal transition">
                            {c.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-dusk px-2 py-0.5 bg-white rounded-md border border-paper-300">
                            {c.tier || 'Heritage Hub'}
                          </span>
                        </div>
                        <p className="text-xs text-dusk-600 line-clamp-2">
                          {c.tagline || c.description}
                        </p>
                        <div className="text-[11px] font-mono text-teal-700 font-bold flex items-center gap-1 pt-1">
                          <span>Explore {c.name}</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition" />
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DestinationsPage;
