'use client';

import React from 'react';
import Link from 'next/link';
import { Experience, ScoredExperience } from '../types';
import { WhyFitsBadge } from './WhyFitsBadge';
import {
  Star,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck,
  Footprints,
  Accessibility,
  Users,
  Plus,
  Check,
  ArrowRight
} from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
  scored?: ScoredExperience;
  isSelected?: boolean;
  isInItinerary?: boolean;
  onToggleItinerary?: (exp: Experience) => void;
  onSelect?: (exp: Experience) => void;
}

export function ExperienceCard({
  experience,
  scored,
  isSelected = false,
  isInItinerary = false,
  onToggleItinerary,
  onSelect
}: ExperienceCardProps) {
  const categoryColors: Record<string, string> = {
    food: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    culture: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    workshop: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    hidden_gem: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    adventure: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    nature: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    shopping: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
    nightlife: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  };

  const imageSrc =
    experience.images && experience.images.length > 0
      ? experience.images[0]
      : 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800';

  return (
    <div
      onClick={() => onSelect && onSelect(experience)}
      className={`group relative rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
        isSelected
          ? 'border-orange-500 shadow-xl shadow-orange-500/10 ring-2 ring-orange-500/40 translate-y-[-2px]'
          : 'border-slate-200 dark:border-slate-800 hover:border-orange-500/40 hover:shadow-lg dark:hover:border-slate-700'
      }`}
    >
      {/* Top Media Container */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <img
          src={imageSrc}
          alt={experience.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
              categoryColors[experience.category] || categoryColors.food
            }`}
          >
            {experience.category.replace('_', ' ')}
          </span>

          {experience.is_hidden_gem && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-slate-950 border border-emerald-400 shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Hidden Gem</span>
            </span>
          )}
        </div>

        {/* Price & Rating Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-extrabold bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{experience.rating}</span>
            <span className="text-slate-300 text-[10px]">({experience.review_count})</span>
          </div>

          <div className="font-black text-sm bg-gradient-to-r from-orange-500 to-rose-500 px-2.5 py-0.5 rounded-md text-white shadow-md">
            {experience.price === 0 ? 'Free' : `₹${Math.round(experience.price)}`}
            <span className="text-[10px] font-normal text-white/90">/pax</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
            <span className="truncate">{experience.neighborhood}, {experience.city}</span>
          </div>

          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-orange-500 transition-colors">
            {experience.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {experience.description}
          </p>
        </div>

        {/* Accessibility Badges */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{experience.duration_mins} mins</span>
          </span>

          {experience.accessibility_low_walking && (
            <span className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-md">
              <Footprints className="w-3 h-3" />
              <span>Low Walking</span>
            </span>
          )}

          {experience.is_indoor && (
            <span className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 px-2 py-0.5 rounded-md">
              🌧️ Indoor
            </span>
          )}
        </div>

        {/* AI Scored Reasons */}
        {scored && scored.why_it_fits && scored.why_it_fits.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <WhyFitsBadge reasons={scored.why_it_fits} score={scored.overall_score} />
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <Link
            href={`/experience/${experience.id}`}
            className="text-xs font-bold text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 flex items-center gap-1"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          {onToggleItinerary && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleItinerary(experience);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm ${
                isInItinerary
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isInItinerary ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>In Plan</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add to Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
