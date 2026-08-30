'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  ChevronDown,
  X,
  Compass,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../lib/api';
import { DestinationSummary, State } from '../types';

interface LocationSelectorProps {
  currentCity?: string;
  currentState?: string;
  onSelectLocation: (location: {
    city?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    label: string;
  }) => void;
  variant?: 'compact' | 'modal' | 'pill';
}

export function LocationSelector({
  currentCity = 'Mumbai',
  currentState = 'Maharashtra',
  onSelectLocation,
  variant = 'compact'
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [destinations, setDestinations] = useState<DestinationSummary[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [isLocating, setIsLocating] = useState(false);
  const [activeLabel, setActiveLabel] = useState<string>(`${currentCity}, ${currentState}`);

  useEffect(() => {
    setActiveLabel(`${currentCity}, ${currentState}`);
  }, [currentCity, currentState]);

  useEffect(() => {
    async function loadLocations() {
      try {
        const [dests, sts] = await Promise.all([
          api.getDestinations(20),
          api.getStates()
        ]);
        setDestinations(dests);
        setStates(sts);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      }
    }
    loadLocations();
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const label = `Near Me (${radiusKm} km radius)`;
        setActiveLabel(label);
        onSelectLocation({
          latitude,
          longitude,
          radius_km: radiusKm,
          label
        });
        setIsOpen(false);
      },
      (err) => {
        setIsLocating(false);
        alert('Could not access current location. Please select a city manually.');
      },
      { timeout: 8000 }
    );
  };

  const handleSelectCity = (dest: DestinationSummary) => {
    const label = `${dest.name}, ${dest.state_name}`;
    setActiveLabel(label);
    onSelectLocation({
      city: dest.name,
      state: dest.state_name,
      latitude: dest.latitude,
      longitude: dest.longitude,
      label
    });
    setIsOpen(false);
  };

  const filteredDestinations = destinations.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.state_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = selectedState === 'all' || d.state_name === selectedState;
    return matchesSearch && matchesState;
  });

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white hover:border-orange-500/50 hover:bg-slate-800 transition-all shadow-sm"
      >
        <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[180px]">{activeLabel}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {/* Modal / Dropdown Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-orange-400" />
                  Where do you want to explore?
                </h3>
                <p className="text-xs text-slate-400">
                  Select any Indian destination or search experiences near your live location
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GPS Location Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100">Use My Current Location</div>
                  <div className="text-[11px] text-slate-400">Discover experiences within your radius</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-xl border border-slate-800 focus:outline-none"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                </select>

                <button
                  type="button"
                  disabled={isLocating}
                  onClick={handleUseCurrentLocation}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity disabled:opacity-50 shrink-0"
                >
                  {isLocating ? 'Locating...' : 'Locate Me'}
                </button>
              </div>
            </div>

            {/* Search Input & State Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search city across India (e.g. Mumbai, Kochi, Goa, Delhi)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-orange-500/50"
              >
                <option value="all">All States & UTs</option>
                {states.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Grid */}
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Popular Destinations ({filteredDestinations.length})</span>
                <span className="text-orange-400 text-[10px]">India-Wide Network</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-none">
                {filteredDestinations.map((dest) => {
                  const isSelected = activeLabel.includes(dest.name);
                  return (
                    <button
                      key={dest.id}
                      onClick={() => handleSelectCity(dest)}
                      className={`relative text-left p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 overflow-hidden group ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500/50 text-white shadow-md'
                          : 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                      }`}
                    >
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold truncate group-hover:text-orange-400 transition-colors">
                            {dest.name}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-orange-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{dest.state_name}</div>
                        <div className="text-[9px] text-amber-400 font-semibold mt-0.5">
                          {dest.experience_count} experiences
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
