'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '../lib/theme-context';
import { Experience } from '../types';
import {
  MapPin,
  Compass,
  Sparkles,
  Layers,
  Plus,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Car,
  Footprints,
  Clock,
  Coins,
  Building,
  Flag,
  ArrowRight,
  Info,
  Globe2
} from 'lucide-react';

interface InteractiveMapProps {
  experiences: Experience[];
  selectedExperience?: Experience | null;
  itineraryExperiences?: Experience[];
  onSelectExperience?: (exp: Experience) => void;
  onToggleItinerary?: (exp: Experience) => void;
  hotelLocation?: { lat: number; lng: number; name: string };
  cityName?: string;
  heightClass?: string;
}

export function InteractiveMap({
  experiences,
  selectedExperience,
  itineraryExperiences = [],
  onSelectExperience,
  onToggleItinerary,
  hotelLocation,
  cityName = 'India',
  heightClass = 'h-[580px]'
}: InteractiveMapProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [zoom, setZoom] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeNeighborhood, setActiveNeighborhood] = useState<string>('all');
  const [hoveredExp, setHoveredExp] = useState<Experience | null>(null);

  // Dynamic Centroid Calculation
  const centerCoords = useMemo(() => {
    if (hotelLocation) {
      return { lat: hotelLocation.lat, lng: hotelLocation.lng, name: hotelLocation.name };
    }
    if (experiences.length > 0) {
      const avgLat = experiences.reduce((acc, e) => acc + e.latitude, 0) / experiences.length;
      const avgLng = experiences.reduce((acc, e) => acc + e.longitude, 0) / experiences.length;
      const primaryCity = experiences[0].city || cityName;
      return { lat: avgLat, lng: avgLng, name: `Center of ${primaryCity}` };
    }
    return { lat: 19.0760, lng: 72.8777, name: 'Mumbai City Center' };
  }, [hotelLocation, experiences, cityName]);

  // Dynamic Bounding Box Calculation
  const bounds = useMemo(() => {
    if (experiences.length === 0) {
      return {
        minLat: centerCoords.lat - 0.06,
        maxLat: centerCoords.lat + 0.06,
        minLng: centerCoords.lng - 0.06,
        maxLng: centerCoords.lng + 0.06
      };
    }
    const lats = experiences.map((e) => e.latitude);
    const lngs = experiences.map((e) => e.longitude);
    const minLat = Math.min(...lats, centerCoords.lat);
    const maxLat = Math.max(...lats, centerCoords.lat);
    const minLng = Math.min(...lngs, centerCoords.lng);
    const maxLng = Math.max(...lngs, centerCoords.lng);
    
    const latSpan = Math.max(0.03, maxLat - minLat);
    const lngSpan = Math.max(0.03, maxLng - minLng);
    const padLat = latSpan * 0.18;
    const padLng = lngSpan * 0.18;

    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng
    };
  }, [experiences, centerCoords]);

  // Convert lat/lng to percentage X/Y inside dynamic bounds
  const getCoordinates = (lat: number, lng: number) => {
    const latSpan = Math.max(0.001, bounds.maxLat - bounds.minLat);
    const lngSpan = Math.max(0.001, bounds.maxLng - bounds.minLng);

    const clampedLat = Math.max(bounds.minLat, Math.min(bounds.maxLat, lat));
    const clampedLng = Math.max(bounds.minLng, Math.min(bounds.maxLng, lng));

    const x = ((clampedLng - bounds.minLng) / lngSpan) * 100;
    const y = ((bounds.maxLat - clampedLat) / latSpan) * 100;

    return { x: Math.max(6, Math.min(94, x)), y: Math.max(6, Math.min(94, y)) };
  };

  const hotelCoords = getCoordinates(centerCoords.lat, centerCoords.lng);

  // Extract distinct neighborhoods for filter chips
  const distinctNeighborhoods = useMemo(() => {
    const set = new Set<string>();
    experiences.forEach((e) => {
      if (e.neighborhood) set.add(e.neighborhood);
    });
    return Array.from(set).slice(0, 5);
  }, [experiences]);

  const filteredExperiences = useMemo(() => {
    return experiences.filter((e) => {
      const matchCat = activeCategory === 'all' || e.category === activeCategory;
      const matchNeigh = activeNeighborhood === 'all' || e.neighborhood === activeNeighborhood;
      return matchCat && matchNeigh;
    });
  }, [experiences, activeCategory, activeNeighborhood]);

  // Itinerary Sequence
  const itinerarySequence = useMemo(() => {
    const stops: Array<{ order: number; title: string; localTip: string; coords: { x: number; y: number }; exp: Experience | null }> = [
      {
        order: 0,
        title: centerCoords.name,
        localTip: "Day Start / Hotel Stay",
        coords: hotelCoords,
        exp: null
      }
    ];
    itineraryExperiences.forEach((exp, idx) => {
      stops.push({
        order: idx + 1,
        title: exp.title,
        localTip: `${exp.neighborhood}, ${exp.city}`,
        coords: getCoordinates(exp.latitude, exp.longitude),
        exp: exp
      });
    });
    return stops;
  }, [itineraryExperiences, hotelCoords, centerCoords]);

  const categoryColors: Record<string, { bg: string; border: string; text: string; pin: string }> = {
    food: { bg: 'bg-amber-500', border: 'border-amber-400', text: 'text-amber-400', pin: '#f59e0b' },
    culture: { bg: 'bg-rose-500', border: 'border-rose-400', text: 'text-rose-400', pin: '#f43f5e' },
    workshop: { bg: 'bg-indigo-500', border: 'border-indigo-400', text: 'text-indigo-400', pin: '#6366f1' },
    hidden_gem: { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-emerald-400', pin: '#10b981' },
    adventure: { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-400', pin: '#f97316' },
    nature: { bg: 'bg-teal-500', border: 'border-teal-400', text: 'text-teal-400', pin: '#14b8a6' },
    shopping: { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-400', pin: '#06b6d4' },
    nightlife: { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-400', pin: '#a855f7' },
    events: { bg: 'bg-fuchsia-500', border: 'border-fuchsia-400', text: 'text-fuchsia-400', pin: '#d946ef' }
  };

  const totalRouteKm = useMemo(() => {
    if (itineraryExperiences.length === 0) return 0;
    return Math.round((2.0 + (itineraryExperiences.length - 1) * 2.5) * 10) / 10;
  }, [itineraryExperiences]);

  const estimatedAutoFare = Math.max(50, Math.round(totalRouteKm * 20));

  const currentDestinationName = experiences.length > 0 ? experiences[0].city : cityName;

  return (
    <div className={`relative w-full ${heightClass} rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col select-none transition-colors`}>
      {/* TOP BAR: Destination Badge, Neighborhood Filters, Zoom Controls */}
      <div className="relative z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* Destination & Neighborhood Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setActiveNeighborhood('all')}
              className={`text-[11px] font-extrabold px-2.5 py-1 rounded-xl transition-all whitespace-nowrap flex items-center gap-1 shadow-sm ${
                activeNeighborhood === 'all'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-orange-500/25'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Globe2 className="w-3 h-3" />
              <span>All {currentDestinationName}</span>
            </button>

            {distinctNeighborhoods.map((neigh) => (
              <button
                key={neigh}
                onClick={() => setActiveNeighborhood(neigh)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl transition-all whitespace-nowrap shadow-sm ${
                  activeNeighborhood === neigh
                    ? 'bg-orange-500 text-white shadow-orange-500/25'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                }`}
              >
                📍 {neigh}
              </button>
            ))}
          </div>

          {/* Map Controls */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
            <button
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.7, z - 0.2))}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setZoom(1); setActiveNeighborhood('all'); }}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Route Summary Helper Bar */}
        {itineraryExperiences.length > 0 && (
          <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950/80 px-3 py-1.5 rounded-xl border border-orange-500/30 text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="font-bold text-orange-600 dark:text-orange-400">🛺 Route Transit in {currentDestinationName}:</span>
              <span>{itineraryExperiences.length} Stops · ~{totalRouteKm} km total</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
              <Coins className="w-3 h-3" />
              <span>Est. Transit Fare: ~₹{estimatedAutoFare}</span>
            </div>
          </div>
        )}
      </div>

      {/* MAP CANVAS AREA */}
      <div
        className="relative flex-1 w-full h-full transition-transform duration-300 overflow-hidden"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
      >
        {/* Dynamic Vector Map Texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="cityGrid" width="35" height="35" patternUnits="userSpaceOnUse">
              <path d="M 35 0 L 0 0 0 35" fill="none" stroke={isDark ? "#1e293b" : "#cbd5e1"} strokeWidth="0.5" />
            </pattern>
            <linearGradient id="panIndiaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="routeBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#cityGrid)" />

          {/* Destination Name Watermark */}
          <text
            x="50%"
            y="92%"
            textAnchor="middle"
            fill={isDark ? "#334155" : "#94a3b8"}
            fontSize="18"
            fontWeight="900"
            letterSpacing="4"
            opacity="0.5"
          >
            {currentDestinationName.toUpperCase()} · LOCAL EXPERIENCE MAP
          </text>

          {/* Connected Itinerary Route Lines */}
          {itinerarySequence.length > 1 && (
            <g filter="url(#routeBlur)">
              <polyline
                points={itinerarySequence.map((s) => `${s.coords.x}%,${s.coords.y}%`).join(' ')}
                fill="none"
                stroke="url(#panIndiaGlow)"
                strokeWidth="4"
                strokeDasharray="8 4"
                className="animate-pulse"
              />
            </g>
          )}
        </svg>

        {/* HOTEL / ORIGIN PIN */}
        <div
          className="absolute z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          style={{ left: `${hotelCoords.x}%`, top: `${hotelCoords.y}%` }}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-xl shadow-emerald-500/50 ring-4 ring-slate-950 animate-bounce">
              <Navigation className="w-4 h-4 text-slate-950 fill-current" />
            </div>
            <div className="mt-1 whitespace-nowrap bg-slate-950/95 backdrop-blur-md text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-lg">
              🏨 {centerCoords.name}
            </div>
          </div>
        </div>

        {/* SEQUENCE ROUTE STOP BADGES (#1, #2, #3) */}
        {itinerarySequence.slice(1).map((step, idx) => (
          <div
            key={`route-step-${idx}`}
            className="absolute z-28 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `${step.coords.x}%`, top: `${step.coords.y - 4.5}%` }}
          >
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg border border-white/40 animate-pulse">
              <Flag className="w-2.5 h-2.5" />
              <span>STOP {step.order}</span>
            </div>
          </div>
        ))}

        {/* EXPERIENCE PINS */}
        {filteredExperiences.map((exp, idx) => {
          const coords = getCoordinates(exp.latitude, exp.longitude);
          const isSelected = selectedExperience?.id === exp.id;
          const itinIndex = itineraryExperiences.findIndex((ie) => ie.id === exp.id);
          const isInItin = itinIndex !== -1;
          const colors = categoryColors[exp.category] || categoryColors.food;

          return (
            <div
              key={exp.id}
              onClick={() => onSelectExperience && onSelectExperience(exp)}
              onMouseEnter={() => setHoveredExp(exp)}
              onMouseLeave={() => setHoveredExp(null)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'z-40 scale-130'
                  : isInItin
                  ? 'z-35 scale-115'
                  : 'z-20 hover:scale-115'
              }`}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                {/* Marker Head */}
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-xl transition-all ${
                    isSelected
                      ? 'bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-400 ring-4 ring-orange-400/50 shadow-orange-500/60 rotate-6'
                      : isInItin
                      ? 'bg-emerald-500 ring-2 ring-emerald-300 shadow-emerald-500/50'
                      : `${colors.bg} hover:ring-2 hover:ring-white/80`
                  }`}
                >
                  {isInItin ? (
                    <span className="font-extrabold text-xs">#{itinIndex + 1}</span>
                  ) : exp.is_hidden_gem ? (
                    <Sparkles className="w-4 h-4 text-amber-200" />
                  ) : (
                    <span className="text-[11px]">{idx + 1}</span>
                  )}
                </div>

                {/* Price Tag */}
                <div className="mt-1 whitespace-nowrap bg-slate-950/90 backdrop-blur-md text-[9px] font-bold px-1.5 py-0.2 rounded border border-slate-700/80 text-slate-200 shadow-md">
                  {exp.price === 0 ? 'Free' : `₹${Math.round(exp.price)}`}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING EXPERIENCE CARD */}
      {(selectedExperience || hoveredExp) && (
        <div className="absolute bottom-3 left-3 right-3 z-40 bg-slate-900/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          {(() => {
            const activeExp = selectedExperience || hoveredExp!;
            const itinIdx = itineraryExperiences.findIndex((ie) => ie.id === activeExp.id);
            const isInItin = itinIdx !== -1;
            return (
              <>
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={activeExp.images[0] || 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800'}
                    alt={activeExp.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-700 shadow-md"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] uppercase font-extrabold text-orange-400 bg-orange-500/10 px-2 py-0.2 rounded border border-orange-500/20">
                        {activeExp.category.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-300">
                        📍 {activeExp.neighborhood}, {activeExp.city}
                      </span>
                      {activeExp.is_hidden_gem && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          ✨ Local Gem
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                      {activeExp.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="text-amber-300 font-extrabold text-xs">
                        {activeExp.price === 0 ? 'Free' : `₹${Math.round(activeExp.price)}/person`}
                      </span>
                      <span>· {activeExp.duration_mins} mins</span>
                      <span>· {activeExp.rating}★ ({activeExp.review_count})</span>
                      {activeExp.accessibility_low_walking && (
                        <span className="text-emerald-400 font-medium">· Low Walk</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  {onToggleItinerary && (
                    <button
                      onClick={() => onToggleItinerary(activeExp)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                        isInItin
                          ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                          : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:opacity-95 hover:scale-105'
                      }`}
                    >
                      {isInItin ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Stop #{itinIdx + 1} in Plan</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Route</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
