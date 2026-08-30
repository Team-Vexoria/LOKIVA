'use client';

import React from 'react';
import { Itinerary, ItineraryItem, Experience } from '../types';
import {
  Clock,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Compass,
  ArrowDown,
  Car,
  Footprints,
  Coffee,
  Navigation,
  Coins,
  ShieldCheck,
  Info
} from 'lucide-react';

interface TimelineViewProps {
  itinerary: Itinerary | null;
  onRemoveItem?: (index: number) => void;
  onReplanTrigger?: () => void;
}

export function TimelineView({ itinerary, onRemoveItem, onReplanTrigger }: TimelineViewProps) {
  if (!itinerary || !itinerary.items || itinerary.items.length === 0) {
    return (
      <div className="rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-8 text-center shadow-md">
        <Compass className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-200 mb-1">Your Itinerary is Empty</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
          Select experiences from the catalog or ask the AI Concierge to build an intelligent timeline.
        </p>
      </div>
    );
  }

  const getFeasibilityBadge = (score: number, status: string) => {
    if (score >= 85) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
        label: 'Excellent Fit (बिल्कुल सही समय)',
        desc: 'Realistic schedule with generous transit buffers.'
      };
    } else if (score >= 70) {
      return {
        bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400',
        label: 'Good Fit (उचित समय)',
        desc: 'Standard local transit times accounted for.'
      };
    } else if (score >= 50) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400',
        label: 'Tight Schedule (थोड़ा व्यस्त)',
        desc: 'Minimal buffer between stops.'
      };
    }
    return {
      bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400',
      label: 'Not Feasible',
      desc: 'Exceeds budget or available time.'
    };
  };

  const feasBadge = getFeasibilityBadge(itinerary.feasibility_score, itinerary.feasibility_status);

  return (
    <div className="space-y-6">
      {/* Feasibility & Budget Metrics Header Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Feasibility Gauge */}
        <div className={`p-4 rounded-3xl border ${feasBadge.bg} flex flex-col justify-between shadow-lg`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Feasibility Score
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-900/70 border border-current">
              {feasBadge.label}
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-black">{Math.round(itinerary.feasibility_score)}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{feasBadge.desc}</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-950/60 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                itinerary.feasibility_score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, itinerary.feasibility_score)}%` }}
            />
          </div>
        </div>

        {/* Budget Meter */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Budget Used</span>
            <span>Target: ₹{Math.round(itinerary.total_budget).toLocaleString()}</span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-300">
              ₹{Math.round(itinerary.actual_cost).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">
              (₹{Math.max(0, Math.round(itinerary.total_budget - itinerary.actual_cost)).toLocaleString()} left)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                itinerary.actual_cost <= itinerary.total_budget ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (itinerary.actual_cost / (itinerary.total_budget || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Time Window Meter */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Time Breakdown</span>
            <span>Limit: {Math.round(itinerary.total_duration_mins / 60)} hrs</span>
          </div>
          <div className="my-2">
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              {Math.floor((itinerary.total_duration_mins - itinerary.buffer_time_mins) / 60)}h{' '}
              {(itinerary.total_duration_mins - itinerary.buffer_time_mins) % 60}m
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-2 font-bold">
              +{itinerary.buffer_time_mins}m rest buffer
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Includes ~{itinerary.travel_time_mins} mins auto/walk transit</span>
          </div>
        </div>
      </div>

      {/* Dynamic Re-plan Context Alert if Active */}
      {itinerary.weather_context && (
        <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-300">
            <Sparkles className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Context: <strong>{itinerary.weather_context}</strong></span>
          </div>
          {onReplanTrigger && (
            <button
              onClick={onReplanTrigger}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-transform hover:scale-105"
            >
              Re-plan Itinerary
            </button>
          )}
        </div>
      )}

      {/* Sequenced Timeline with Local Directions */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-orange-500 before:to-rose-500">
        {/* Origin / Hotel Step */}
        <div className="relative flex items-start gap-4">
          <div className="absolute -left-6 sm:-left-8 top-1 w-7 h-7 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/40 ring-4 ring-slate-100 dark:ring-slate-950">
            <Navigation className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex-1 flex items-center justify-between shadow-md">
            <div>
              <div className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Start Origin · {itinerary.start_time || '10:00 AM'}
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Traveler&apos;s Hotel (City Center)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Hotel departure point · Auto-rickshaw stand available</div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
              Depart Hotel
            </span>
          </div>
        </div>

        {/* Itinerary Items with Local Transit Connectors */}
        {itinerary.items.map((item, idx) => {
          const exp = item.experience;
          const isWalking = item.distance_km < 1.0;
          const estTransitFare = Math.max(30, Math.round(item.distance_km * 20));

          return (
            <React.Fragment key={idx}>
              {/* Local Transit Connector */}
              <div className="relative flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 my-2 py-1">
                <div className="w-6 h-6 rounded-xl bg-slate-200 dark:bg-slate-800 text-orange-500 flex items-center justify-center text-[10px] -ml-6 sm:-ml-8 ring-4 ring-slate-100 dark:ring-slate-950 shadow-md">
                  {isWalking ? <Footprints className="w-3.5 h-3.5 text-emerald-500" /> : <Car className="w-3.5 h-3.5 text-orange-500" />}
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shadow-sm flex-wrap">
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {isWalking ? '🚶 Walk' : '🛺 Auto-Rickshaw'}: ~{item.travel_time_from_prev_mins} mins
                  </span>
                  <span>({item.distance_km} km)</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    Est. Fare: ~₹{estTransitFare}
                  </span>
                </div>
              </div>

              {/* Experience Card on Timeline */}
              <div className="relative flex items-start gap-4">
                <div className="absolute -left-6 sm:-left-8 top-3 w-7 h-7 rounded-2xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-orange-500/40 ring-4 ring-slate-100 dark:ring-slate-950">
                  {idx + 1}
                </div>

                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40 rounded-3xl p-5 shadow-xl transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                        {item.scheduled_start} – {item.scheduled_end}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ({item.duration_mins} mins stay)
                      </span>
                      <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                        {exp.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {item.cost === 0 ? 'Free' : `₹${Math.round(item.cost).toLocaleString()}`}
                      </span>
                      {onRemoveItem && (
                        <button
                          onClick={() => onRemoveItem(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          title="Remove from plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <img
                      src={exp.images[0] || 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800'}
                      alt={exp.title}
                      className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 dark:border-slate-800 shadow-md"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="text-[11px] font-bold text-orange-600 dark:text-orange-400">
                        📍 {exp.neighborhood}, {exp.city}
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{exp.description}</p>
                      
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                        <span className="text-amber-500 font-semibold">Rating: {exp.rating}★ ({exp.review_count})</span>
                        {exp.accessibility_low_walking && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">· 🚶 Flat / Seated</span>
                        )}
                        {exp.is_indoor ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">· 🌧️ Covered / Rain-safe</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">· ☀️ Outdoor</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
