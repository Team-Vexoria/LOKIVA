'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { State, City, DestinationSummary } from '../../types';
import {
  Globe2,
  MapPin,
  Compass,
  Search,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Building,
  Layers
} from 'lucide-react';

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const regions = ['all', 'North', 'West', 'South', 'East', 'Northeast'];

  useEffect(() => {
    async function loadData() {
      try {
        const [dests, sts, cts] = await Promise.all([
          api.getDestinations(30),
          api.getStates(),
          api.getCities()
        ]);
        setDestinations(dests);
        setStates(sts);
        setCities(cts);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStates = states.filter((s) => {
    const matchRegion = selectedRegion === 'all' || s.region === selectedRegion;
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cities.some(
        (c) => c.state_id === s.id && c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchRegion && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-orange-400 text-xs font-bold shadow-md">
          <Globe2 className="w-4 h-4" />
          <span>Pan-India Destination Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-100 tracking-tight">
          Explore India by{' '}
          <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-300 bg-clip-text text-transparent">
            State & City
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Discover authentic local experiences across 28 states and 8 union territories, curated from neighborhood artisans and verified providers.
        </p>

        {/* Search & Region Filter Bar */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search state or city (e.g. Mumbai, Goa, Kerala)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
                  selectedRegion === reg
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {reg === 'all' ? 'All Regions' : reg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* States & Cities Directory */}
      <div className="space-y-8">
        {filteredStates.map((state) => {
          const stateCities = cities.filter((c) => c.state_id === state.id);
          const stateSlug = state.name.toLowerCase().replace(/\s+/g, '-');

          return (
            <div
              key={state.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl"
            >
              {/* State Title Bar */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center font-black text-sm border border-orange-500/20">
                    {state.code}
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100">{state.name}</h2>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {state.region} Region · {stateCities.length} Cities Active
                    </span>
                  </div>
                </div>

                <Link
                  href={`/explore?state=${encodeURIComponent(state.name)}`}
                  className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1"
                >
                  <span>Explore State</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Cities Grid for this State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stateCities.map((city) => {
                  const citySlug = city.name.toLowerCase().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={city.id}
                      href={`/destination/${stateSlug}/${citySlug}`}
                      className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 hover:border-orange-500/40 transition-all duration-200 group flex items-center gap-3"
                    >
                      <img
                        src={city.image_url || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'}
                        alt={city.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800 group-hover:scale-105 transition-transform"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-orange-400 transition-colors truncate">
                          {city.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{city.tagline}</p>
                        <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                          {city.experience_count} experiences
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
