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
  Navigation,
  Map,
  Grid,
  Building2,
  Landmark,
  X,
  ChevronRight,
  Palette,
  Utensils,
  PartyPopper,
  Hammer,
  Leaf,
  Footprints,
  Flame,
  Gem,
  AlertTriangle,
  Sun,
  Mountain,
  Waves,
  Eye,
  Crown,
} from 'lucide-react';
import { PanIndiaDestinationsMap } from '../components/map/PanIndiaDestinationsMap';
import { CATEGORY_IMAGE_POOLS } from '../lib/imageDeduplicator';

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

// Experiential mood themes for mood-based browsing
interface MoodFilter {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  states: string[];
}

const MOOD_FILTERS: MoodFilter[] = [
  {
    id: 'all',
    label: 'All Journeys',
    icon: Compass,
    states: [],
  },
  {
    id: 'mountains',
    label: 'Mountain Whispers',
    icon: Mountain,
    states: ['Himachal Pradesh', 'Uttarakhand', 'Jammu and Kashmir', 'Ladakh', 'Sikkim', 'Arunachal Pradesh'],
  },
  {
    id: 'royal',
    label: 'Palaces & Royal Guilds',
    icon: Crown,
    states: ['Rajasthan', 'Madhya Pradesh', 'Delhi', 'Uttar Pradesh', 'Karnataka'],
  },
  {
    id: 'coastal',
    label: 'Coastal Ports & Spice',
    icon: Waves,
    states: ['Kerala', 'Goa', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Andhra Pradesh', 'Odisha'],
  },
  {
    id: 'sacred',
    label: 'Sacred Waters & Ghats',
    icon: Flame,
    states: ['Uttar Pradesh', 'Punjab', 'Bihar', 'Uttarakhand', 'Odisha'],
  },
  {
    id: 'crafts',
    label: 'Artisan Terroir',
    icon: Palette,
    states: ['Gujarat', 'West Bengal', 'Assam', 'Rajasthan', 'Telangana'],
  },
];

// State signature imagery fallback
function getStateCoverImage(state: State): string {
  if (state.image_url && state.image_url.startsWith('http')) {
    return state.image_url;
  }
  const pool = CATEGORY_IMAGE_POOLS.heritage || CATEGORY_IMAGE_POOLS.culture;
  return pool[Math.abs(state.id * 7) % pool.length];
}

function getCityCoverImage(city: City): string {
  if (city.image_url && city.image_url.startsWith('http')) {
    return city.image_url;
  }
  const pool = CATEGORY_IMAGE_POOLS.culture || CATEGORY_IMAGE_POOLS.heritage;
  return pool[Math.abs(city.id * 5) % pool.length];
}

// Regional color styling helper
function getRegionBadgeStyle(region: string) {
  switch (region) {
    case 'North India':
      return {
        badge: 'bg-amber-100/90 text-amber-900 border-amber-300',
        stamp: 'border-amber-700/60 text-amber-800',
        accent: 'text-amber-700',
      };
    case 'South India':
      return {
        badge: 'bg-teal-100/90 text-teal-900 border-teal-300',
        stamp: 'border-teal-700/60 text-teal-800',
        accent: 'text-teal-700',
      };
    case 'West India':
      return {
        badge: 'bg-orange-100/90 text-orange-900 border-orange-300',
        stamp: 'border-orange-700/60 text-orange-800',
        accent: 'text-orange-700',
      };
    case 'East India':
      return {
        badge: 'bg-rose-100/90 text-rose-900 border-rose-300',
        stamp: 'border-rose-700/60 text-rose-800',
        accent: 'text-rose-700',
      };
    case 'Central India':
      return {
        badge: 'bg-stone-100/90 text-stone-900 border-stone-300',
        stamp: 'border-stone-700/60 text-stone-800',
        accent: 'text-stone-700',
      };
    case 'North-East India':
      return {
        badge: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
        stamp: 'border-emerald-700/60 text-emerald-800',
        accent: 'text-emerald-700',
      };
    default:
      return {
        badge: 'bg-cyan-100/90 text-cyan-900 border-cyan-300',
        stamp: 'border-cyan-700/60 text-cyan-800',
        accent: 'text-cyan-700',
      };
  }
}

export function DestinationsPage() {
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter and View State
  const [viewMode, setViewMode] = useState<'all' | 'states' | 'uts' | 'cities' | 'map'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedMood, setSelectedMood] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'experiences' | 'heritage' | 'name'>('popular');

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
          api.getExperiences({ limit: 250 }),
        ]);
        setStates(statesData || []);
        setCities(citiesData || []);
        setExperiences(expData || []);
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
      () => {
        setIsLocating(false);
        setLocationError('Location permission was denied. Search anywhere across India manually.');
      },
      { timeout: 10000 }
    );
  };

  // Filtered States based on ViewMode, Region, Mood, Search, and Sort
  const filteredStates = useMemo(() => {
    return states
      .filter((state) => {
        // View mode filter (all, states, uts)
        if (viewMode === 'states' && state.is_union_territory) return false;
        if (viewMode === 'uts' && !state.is_union_territory) return false;

        // Region filter
        if (selectedRegion !== 'All' && state.region !== selectedRegion) return false;

        // Mood / Experiential Theme filter
        if (selectedMood !== 'all') {
          const mood = MOOD_FILTERS.find((m) => m.id === selectedMood);
          if (mood && !mood.states.some((s) => s.toLowerCase() === state.name.toLowerCase())) {
            return false;
          }
        }

        // Search query filter (matches name, code, description, or cities in state)
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
      })
      .sort((a, b) => {
        if (sortBy === 'heritage') return (b.heritage_count || 0) - (a.heritage_count || 0);
        if (sortBy === 'experiences') return (b.experience_count || 0) - (a.experience_count || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        // 'popular' default: sort by experience count then heritage count
        return (b.experience_count || 0) - (a.experience_count || 0);
      });
  }, [states, cities, viewMode, selectedRegion, selectedMood, searchQuery, sortBy]);

  // Filtered Cities for Cities & Hubs View Mode
  const filteredCities = useMemo(() => {
    return cities
      .filter((city) => {
        if (selectedRegion !== 'All') {
          const parentState = states.find((s) => s.id === city.state_id || s.name === city.state_name);
          if (parentState && parentState.region !== selectedRegion) return false;
        }

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
      })
      .sort((a, b) => {
        if (sortBy === 'heritage') return (b.heritage_count || 0) - (a.heritage_count || 0);
        if (sortBy === 'experiences') return (b.experience_count || 0) - (a.experience_count || 0);
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
      });
  }, [cities, states, selectedRegion, searchQuery, sortBy]);

  // Featured regional spotlights (iconic diverse destinations)
  const featuredSpotlights = useMemo(() => {
    const featuredNames = ['Rajasthan', 'Kerala', 'Himachal Pradesh', 'West Bengal'];
    return states.filter((s) => featuredNames.includes(s.name)).slice(0, 4);
  }, [states]);

  return (
    <div className="relative min-h-screen bg-paper text-ink selection:bg-marigold selection:text-ink pt-14 pb-20 overflow-hidden">
      {/* Decorative Indian Living Cultural Cutouts Flanking Margins (Unique to Destinations) */}
      <div className="pointer-events-none select-none z-0 absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
        {/* 1. Chittorgarh Vijay Stambha (Tower of Victory, Rajasthan) - Upper Left */}
        <div className="absolute left-1 xl:left-5 top-12 w-28 xl:w-36 -rotate-6 opacity-35 xl:opacity-45 filter drop-shadow-md transition-transform duration-700 hover:rotate-0">
          <img
            src="/assets/destinations/chittorgarh-stambha-cutout.png"
            alt="Chittorgarh Vijay Stambha Victory Tower cutout"
            loading="lazy"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* 2. Himalayan Buddhist Stupa & Prayer Flags (High Passes) - Upper Right */}
        <div className="absolute right-1 xl:right-5 top-10 w-36 xl:w-48 rotate-6 opacity-35 xl:opacity-45 filter drop-shadow-md transition-transform duration-700 hover:rotate-0">
          <img
            src="/assets/destinations/himalayan-stupa-cutout.png"
            alt="Himalayan Stupa with prayer flags cutout"
            loading="lazy"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* 3. Kerala Kettuvallam Houseboat - Mid Left Accent */}
        <div className="hidden xl:block absolute left-4 top-[560px] w-36 -rotate-6 opacity-30 filter drop-shadow-md">
          <img
            src="/assets/destinations/kerala-houseboat-cutout.png"
            alt="Kerala Kettuvallam Houseboat cutout"
            loading="lazy"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* 4. Hampi Stone Chariot (Vijayanagara, Karnataka) - Mid Right Accent */}
        <div className="hidden xl:block absolute right-5 top-[560px] w-36 rotate-6 opacity-35 filter drop-shadow-md">
          <img
            src="/assets/destinations/hampi-stone-chariot-cutout.png"
            alt="Hampi Stone Chariot monolithic shrine cutout"
            loading="lazy"
            className="w-full h-auto object-contain"
          />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ==================================================================== */}
        {/* 1. WARM ILLUSTRATED MASTHEAD (Balanced 2-Column Cultural Tableau)    */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-3 pb-4 border-b border-paper-300">
          {/* Left Column: Heading, Narrative, and Regional Count Badges */}
          <div className="lg:col-span-7 space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-ink tracking-tight leading-tight">
              Where Will Your Story Begin?
            </h1>

            <p className="text-xs sm:text-base text-dusk-600 font-sans leading-relaxed max-w-2xl">
              Journey through 36 living states and territories — hand-stamped craft guilds, mountain high passes, sacred river steps, and coastal spice ports.
            </p>

            {/* Quick Regional Stats Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 font-mono text-xs text-dusk-700">
              <span className="px-2.5 py-1 bg-paper-100 rounded-lg border border-paper-300 flex items-center gap-1.5 font-bold">
                <Landmark className="w-3.5 h-3.5 text-teal" />
                <span>36 Living Regions</span>
              </span>
              <span className="px-2.5 py-1 bg-paper-100 rounded-lg border border-paper-300 flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-marigold" />
                <span>75+ Cultural Enclaves</span>
              </span>
              <span className="px-2.5 py-1 bg-paper-100 rounded-lg border border-paper-300 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-clay" />
                <span>1,000+ Vetted Stories</span>
              </span>
            </div>
          </div>

          {/* Right Column: Traveler's Field Dispatch & Cultural Navigator (Fills Highlighted Empty Negative Space) */}
          <div className="lg:col-span-5">
            <div className="relative bg-white/85 backdrop-blur-xs border border-paper-300 rounded-3xl p-5 sm:p-6 shadow-xs overflow-hidden group hover:border-paper-400 transition-colors">
              {/* Watermark Illustration: Konark Sun Wheel of Time & Discovery */}
              <div className="absolute -right-8 -bottom-8 w-44 sm:w-52 opacity-15 group-hover:opacity-25 transition-opacity duration-700 pointer-events-none select-none">
                <img
                  src="/assets/destinations/konark-sun-wheel-cutout.png"
                  alt=""
                  aria-hidden="true"
                  className="w-full h-auto object-contain animate-[spin_120s_linear_infinite]"
                />
              </div>

              {/* Card Body */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-display font-bold text-ink leading-snug">
                    Navigate Living Coordinates
                  </h3>
                  <span className="text-[10px] font-mono text-dusk-600 font-bold bg-paper-100 px-2 py-0.5 rounded border border-paper-300">
                    EST. 2026
                  </span>
                </div>
                <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                  Detect your nearest heritage enclave automatically or hop directly into curated regional travel moods.
                </p>

                {/* Primary Action: Near You Geolocation Detection */}
                <div className="pt-2">
                  <button
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="w-full py-2.5 px-4 bg-teal hover:bg-teal-700 active:scale-[0.99] text-white rounded-xl text-xs font-mono font-bold shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    <Navigation className={`w-3.5 h-3.5 text-marigold ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'Scanning Pan-India Coordinates...' : 'Detect Enclaves Near You'}</span>
                  </button>
                  {locationError && (
                    <p className="text-[11px] text-clay font-mono mt-1.5 leading-tight">
                      {locationError}
                    </p>
                  )}
                </div>

                {/* Quick Vibe Jump Pills */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono font-bold text-dusk-600 uppercase tracking-wider mb-2">
                    Quick Cultural Circuits:
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedMood(selectedMood === 'royal' ? 'all' : 'royal')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer flex items-center gap-1 ${
                        selectedMood === 'royal'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-paper-100 text-dusk-700 border-paper-300 hover:bg-paper-200'
                      }`}
                    >
                      <Crown className="w-3 h-3 text-marigold" />
                      <span>Palaces & Forts</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMood(selectedMood === 'sacred' ? 'all' : 'sacred')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer flex items-center gap-1 ${
                        selectedMood === 'sacred'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-paper-100 text-dusk-700 border-paper-300 hover:bg-paper-200'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-clay" />
                      <span>Sacred Ghats</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMood(selectedMood === 'mountains' ? 'all' : 'mountains')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer flex items-center gap-1 ${
                        selectedMood === 'mountains'
                          ? 'bg-teal-100 text-teal-900 border-teal-300'
                          : 'bg-paper-100 text-dusk-700 border-paper-300 hover:bg-paper-200'
                      }`}
                    >
                      <Mountain className="w-3 h-3 text-teal" />
                      <span>High Passes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMood(selectedMood === 'coastal' ? 'all' : 'coastal')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer flex items-center gap-1 ${
                        selectedMood === 'coastal'
                          ? 'bg-teal-100 text-teal-900 border-teal-300'
                          : 'bg-paper-100 text-dusk-700 border-paper-300 hover:bg-paper-200'
                      }`}
                    >
                      <Waves className="w-3 h-3 text-teal" />
                      <span>Spice Coasts</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Geolocation Nearby Discovery Notification */}
        {nearbyData && nearbyData.nearestCity && (
          <div className="bg-paper-50 border-2 border-dashed border-teal/40 rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[11px] font-mono font-bold text-teal uppercase tracking-widest">
                    Postmark Location Verified
                  </div>
                  <h3 className="text-lg font-display font-bold text-ink">
                    You are in the neighborhood of {nearbyData.nearestCity.name} ({nearbyData.nearestCity.state_name})
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/destination/${encodeURIComponent(nearbyData.nearestCity.state_name || '')}/${encodeURIComponent(nearbyData.nearestCity.name)}`}
                  className="px-4 py-2 bg-ink text-white hover:bg-teal rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Explore {nearbyData.nearestCity.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => setNearbyData(null)}
                  className="p-1.5 text-dusk hover:text-ink transition rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {nearbyData.nearbyCities.length > 1 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-paper-300">
                <span className="text-xs font-mono font-bold text-dusk">Nearby Enclaves:</span>
                {nearbyData.nearbyCities.slice(1, 6).map((nc) => (
                  <Link
                    key={nc.id}
                    to={`/destination/${encodeURIComponent(nc.state_name || '')}/${encodeURIComponent(nc.name)}`}
                    className="px-2.5 py-1 bg-white border border-paper-300 hover:border-ink rounded-lg text-xs font-mono text-ink transition flex items-center gap-1"
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
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              {locationError}
            </span>
            <button onClick={() => setLocationError(null)} className="text-amber-700 hover:text-amber-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. CURATED REGIONAL SPOTLIGHTS (Top Postcard Ribbon)                 */}
        {/* ==================================================================== */}
        {viewMode === 'all' && !searchQuery && selectedRegion === 'All' && selectedMood === 'all' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-dusk uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-marigold" />
                <span>Curated Regional Spotlights</span>
              </div>
              <span className="text-[11px] font-mono text-dusk-500">Hand-Picked Chapters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featuredSpotlights.map((state) => {
                const coverImg = getStateCoverImage(state);
                const regionStyle = getRegionBadgeStyle(state.region);

                return (
                  <div
                    key={state.id}
                    onClick={() => setSelectedStateDetail(state)}
                    className="group relative h-72 rounded-3xl overflow-hidden border-2 border-paper-300 hover:border-marigold shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between p-5 bg-ink"
                  >
                    {/* Background Image with Zoom on Hover */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img
                        src={coverImg}
                        alt={state.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-[0.85]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
                    </div>

                    {/* Top Postage Stamp Badge */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${regionStyle.badge}`}>
                        {state.region}
                      </span>

                      {/* Vintage Postal Cancellation Seal */}
                      <div className="border border-dashed border-white/40 bg-white/15 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest text-white uppercase">
                        POST · {state.code}
                      </div>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="relative z-10 space-y-1.5 text-white">
                      <h3 className="text-xl sm:text-2xl font-display font-bold leading-tight group-hover:text-marigold transition-colors">
                        {state.name}
                      </h3>
                      <p className="text-xs text-paper-200 line-clamp-2 leading-relaxed font-sans opacity-90">
                        {state.description}
                      </p>
                      <div className="pt-1 flex items-center justify-between text-xs font-mono font-bold text-marigold">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Open Dossier</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. UNIFIED FIELD NOTE SEARCH & VIBE EXPLORER                          */}
        {/* ==================================================================== */}
        <div className="bg-paper-100/90 rounded-3xl border border-paper-300 p-5 sm:p-6 shadow-2xs space-y-4">
          {/* Prominent Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-dusk-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Where's your next story? Search state, craft cluster, ghats, or heritage enclave (e.g. Rajasthan, Munnar, Blue Pottery)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 bg-white border border-paper-300 focus:border-ink rounded-2xl text-xs sm:text-sm font-sans focus:outline-none transition placeholder:text-dusk-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-dusk hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Trending Suggestions Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs font-mono">
            <span className="text-dusk-500 text-[11px] uppercase tracking-wider font-bold">Trending:</span>
            {['Rajasthan', 'Kerala', 'Kolkata', 'Varanasi', 'Goa', 'Himachal Pradesh'].map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery(kw)}
                className="px-2.5 py-1 bg-white hover:bg-paper-200 border border-paper-300 rounded-lg text-xs font-mono text-dusk-800 transition cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Luggage Tag / Railway Ticket View Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-paper-300">
            <div className="flex items-center bg-paper-200/90 p-1.5 rounded-2xl gap-1 border border-paper-300 overflow-x-auto">
              <button
                onClick={() => setViewMode('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  viewMode === 'all' ? 'bg-white text-ink shadow-sm' : 'text-dusk-600 hover:text-ink'
                }`}
              >
                <Grid className="w-3.5 h-3.5 text-marigold" />
                <span>All India (36)</span>
              </button>
              <button
                onClick={() => setViewMode('states')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  viewMode === 'states' ? 'bg-white text-ink shadow-sm' : 'text-dusk-600 hover:text-ink'
                }`}
              >
                <Landmark className="w-3.5 h-3.5 text-teal" />
                <span>28 States</span>
              </button>
              <button
                onClick={() => setViewMode('uts')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  viewMode === 'uts' ? 'bg-white text-ink shadow-sm' : 'text-dusk-600 hover:text-ink'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-clay" />
                <span>8 UTs</span>
              </button>
              <button
                onClick={() => setViewMode('cities')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  viewMode === 'cities' ? 'bg-white text-ink shadow-sm' : 'text-dusk-600 hover:text-ink'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-marigold" />
                <span>Cities & Hubs ({cities.length})</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  viewMode === 'map' ? 'bg-ink text-white shadow-sm' : 'text-dusk-600 hover:text-ink'
                }`}
              >
                <Map className="w-3.5 h-3.5 text-marigold" />
                <span>Explore on Map</span>
              </button>
            </div>

            {/* Region Dropdown & Sort */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-paper-300 text-xs font-mono">
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

              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-paper-300 text-xs font-mono">
                <span className="text-dusk">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-ink focus:outline-none cursor-pointer"
                >
                  <option value="popular">Curated Popularity</option>
                  <option value="experiences">Micro-Experiences</option>
                  <option value="heritage">Heritage Sites</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Experiential Mood Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-dusk-500 font-mono text-[10px] uppercase tracking-wider font-bold whitespace-nowrap pr-1">
              By Vibe:
            </span>
            {MOOD_FILTERS.map((mood) => {
              const isSelected = selectedMood === mood.id;
              const IconComp = mood.icon;
              return (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-ink text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-paper-200 text-dusk-800 border border-paper-300'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-marigold' : 'text-dusk'}`} />
                  <span>{mood.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* 4. MAIN DESTINATIONS CONTENT (Cards / Map)                           */}
        {/* ==================================================================== */}
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
              states={states}
              userCoords={userCoords}
              onSelectState={(st) => setSelectedStateDetail(st)}
            />
          </div>
        ) : viewMode === 'cities' ? (
          /* ================================================================ */
          /* CITIES & HUBS POSTCARD VIEW                                      */
          /* ================================================================ */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-ink">
                Verified Destination Hubs & Cities ({filteredCities.length})
              </h3>
              <span className="text-xs font-mono text-dusk">
                Artisan Guilds, Stepwells & Heritage Towns
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 bg-paper-100 border border-paper-300 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredCities.length === 0 ? (
              <div className="bg-paper-100 rounded-3xl border border-paper-300 p-12 text-center space-y-4">
                <Search className="w-8 h-8 text-dusk mx-auto" />
                <h3 className="text-lg font-display font-bold text-ink">
                  No cultural hubs found
                </h3>
                <p className="text-xs text-dusk-600 max-w-md mx-auto">
                  No cities matched "{searchQuery}". Try spinning the compass with another query or reset filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRegion('All');
                    setSelectedMood('all');
                  }}
                  className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCities.map((city) => {
                  const cityCover = getCityCoverImage(city);

                  return (
                    <div
                      key={city.id}
                      className="bg-white rounded-3xl border-2 border-paper-300 hover:border-marigold overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Header with Postal Stamp */}
                        <div className="relative h-48 overflow-hidden bg-ink">
                          <img
                            src={cityCover}
                            alt={city.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent" />

                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/95 text-teal-800 backdrop-blur-md shadow-xs flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-marigold" />
                              <span>{city.state_name}</span>
                            </span>

                            <div className="border border-dashed border-white/60 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest text-white uppercase">
                              {city.tier || 'Heritage Hub'}
                            </div>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="text-2xl font-display font-bold text-white group-hover:text-marigold transition-colors">
                              {city.name}
                            </h3>
                          </div>
                        </div>

                        {/* City Content */}
                        <div className="p-5 space-y-3">
                          <p className="text-xs text-dusk-600 line-clamp-2 leading-relaxed font-sans italic border-l-2 border-marigold/60 pl-2">
                            "{city.tagline || city.description}"
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(city.categories || city.popular_categories || ['Living Heritage', 'Local Craft']).slice(0, 3).map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-paper-100 text-[10px] font-mono rounded-md text-dusk-700 border border-paper-200"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Link */}
                      <div className="p-5 pt-3 border-t border-paper-200 flex items-center justify-between text-xs font-mono">
                        <div className="text-dusk font-bold">
                          <span className="text-ink">{city.experience_count || 12}</span> Micro-Experiences
                        </div>
                        <Link
                          to={`/destination/${encodeURIComponent(city.state_name || '')}/${encodeURIComponent(city.name)}`}
                          className="inline-flex items-center gap-1.5 text-teal-700 hover:text-ink font-bold transition group-hover:translate-x-0.5"
                        >
                          <span>Explore {city.name}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================================================================ */
          /* 36 STATES & UTs COLLECTOR'S POSTCARD GRID                        */
          /* ================================================================ */
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
                Showing {filteredStates.length} Living Regions
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-72 bg-paper-100 border border-paper-300 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : filteredStates.length === 0 ? (
              <div className="bg-paper-100 rounded-3xl border border-paper-300 p-12 text-center space-y-4">
                <Compass className="w-8 h-8 text-dusk mx-auto" />
                <h3 className="text-lg font-display font-bold text-ink">
                  No regional chapters found
                </h3>
                <p className="text-xs text-dusk-600 max-w-md mx-auto">
                  No region matched your current search and filters. Try exploring across all of India.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRegion('All');
                    setSelectedMood('all');
                  }}
                  className="px-4 py-2 bg-ink text-white rounded-xl text-xs font-mono font-bold cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStates.map((state) => {
                  const stateCover = getStateCoverImage(state);
                  const stateCities = cities.filter(
                    (c) => c.state_id === state.id || c.state_name === state.name
                  );
                  const regionStyle = getRegionBadgeStyle(state.region);

                  return (
                    <div
                      key={state.id}
                      className="bg-white rounded-3xl border-2 border-paper-300 hover:border-marigold overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Postcard Image Header with Indian Postal Stamp Motif */}
                        <div className="relative h-52 overflow-hidden bg-ink">
                          <img
                            src={stateCover}
                            alt={state.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${regionStyle.badge}`}>
                              {state.region}
                            </span>

                            {/* Collectible Postal Stamp Motif */}
                            <div className="border-2 border-dashed border-marigold/80 bg-paper-50/95 backdrop-blur-md px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-widest text-ink uppercase shadow-2xs flex items-center gap-1">
                              <span>IND POST</span>
                              <span>•</span>
                              <span>{state.code}</span>
                              <span>•</span>
                              <span className="text-marigold font-extrabold">₹5</span>
                            </div>
                          </div>

                          {/* Card Title on Image */}
                          <div className="absolute bottom-3 left-4 right-4">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-paper-300">
                              {state.is_union_territory ? 'Union Territory' : 'Indian State'}
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white group-hover:text-marigold transition-colors">
                              {state.name}
                            </h3>
                          </div>
                        </div>

                        {/* Storytelling Content */}
                        <div className="p-5 sm:p-6 space-y-3">
                          {/* Prominent Micro-Stats */}
                          <div className="flex items-center gap-3 text-xs font-mono text-dusk-600 border-b border-paper-200 pb-3">
                            <span className="flex items-center gap-1 font-bold text-ink">
                              <Sparkles className="w-3.5 h-3.5 text-marigold" />
                              <span>{state.experience_count || 18}</span> Stories
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-ink">
                              <Landmark className="w-3.5 h-3.5 text-teal" />
                              <span>{state.heritage_count || 14}</span> Sites
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-bold text-ink">
                              <MapPin className="w-3.5 h-3.5 text-clay" />
                              <span>{stateCities.length || 1}</span> Enclaves
                            </span>
                          </div>

                          <p className="text-xs text-dusk-600 line-clamp-2 leading-relaxed font-sans">
                            {state.description}
                          </p>

                          {/* Luggage Tag City Enclave Pills */}
                          <div className="space-y-1.5 pt-1">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-dusk-500 font-bold">
                              Verified Enclaves:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {stateCities.slice(0, 3).map((city) => (
                                <Link
                                  key={city.id}
                                  to={`/destination/${encodeURIComponent(state.name)}/${encodeURIComponent(city.name)}`}
                                  className="px-2.5 py-1 bg-paper-100 hover:bg-ink hover:text-white border border-paper-300 rounded-lg text-xs font-mono text-ink transition flex items-center gap-1"
                                >
                                  <MapPin className="w-3 h-3 text-marigold" />
                                  <span>{city.name}</span>
                                </Link>
                              ))}
                              {stateCities.length > 3 && (
                                <button
                                  onClick={() => setSelectedStateDetail(state)}
                                  className="px-2 py-1 bg-paper-200 hover:bg-paper-300 rounded-lg text-xs font-mono text-dusk font-bold cursor-pointer"
                                >
                                  +{stateCities.length - 3} more
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explore Button */}
                      <div className="p-5 sm:p-6 pt-0">
                        <button
                          onClick={() => setSelectedStateDetail(state)}
                          className="w-full py-2.5 px-4 bg-paper-100 hover:bg-ink hover:text-white border border-paper-300 rounded-xl text-xs font-mono font-bold text-ink transition flex items-center justify-between cursor-pointer group-hover:border-ink"
                        >
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-marigold" />
                            <span>Open {state.name} Dossier</span>
                          </span>
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

        {/* ==================================================================== */}
        {/* 5. ILLUSTRATED FIELD DOSSIER MODAL                                   */}
        {/* ==================================================================== */}
        {selectedStateDetail && (
          <div className="fixed inset-0 z-50 bg-ink/65 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-3xl border-2 border-paper-300 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-paper-200 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-paper-100 text-teal-800 rounded-full text-xs font-mono font-bold border border-paper-300">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-teal-800" />
                      <span>{selectedStateDetail.region}</span>
                    </span>
                    <span>•</span>
                    <span>{selectedStateDetail.is_union_territory ? 'Union Territory' : 'Indian State'}</span>
                  </div>
                  <h2 className="text-3xl font-display font-bold text-ink mt-2">
                    {selectedStateDetail.name} Field Dossier
                  </h2>
                  <p className="text-xs sm:text-sm text-dusk-600 font-sans mt-1 leading-relaxed">
                    {selectedStateDetail.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStateDetail(null)}
                  className="p-2 text-dusk hover:text-ink bg-paper-100 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Verified Cities in this State */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                    Verified Enclaves & Hubs in {selectedStateDetail.name}
                  </h3>
                  <span className="text-[11px] font-mono text-dusk">
                    Click to explore individual city guides
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cities
                    .filter((c) => c.state_id === selectedStateDetail.id || c.state_name === selectedStateDetail.name)
                    .map((c) => (
                      <Link
                        key={c.id}
                        to={`/destination/${encodeURIComponent(selectedStateDetail.name)}/${encodeURIComponent(c.name)}`}
                        onClick={() => setSelectedStateDetail(null)}
                        className="p-4 bg-paper-50 hover:bg-paper-100 border border-paper-300 hover:border-ink rounded-2xl transition space-y-2 group block"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-bold text-ink group-hover:text-teal transition">
                            {c.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-dusk px-2 py-0.5 bg-white rounded-md border border-paper-300">
                            {c.tier || 'Heritage Hub'}
                          </span>
                        </div>
                        <p className="text-xs text-dusk-600 line-clamp-2 font-sans">
                          {c.tagline || c.description}
                        </p>
                        <div className="text-[11px] font-mono text-teal-700 font-bold flex items-center gap-1 pt-1">
                          <span>Explore {c.name} Guide</span>
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
