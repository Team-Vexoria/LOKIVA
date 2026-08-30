'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Experience } from '@/types';
import { ExperienceCard } from '../../components/ExperienceCard';
import { RouteGuard } from '../../components/RouteGuard';
import { Bookmark, Compass, ArrowRight, Trash2 } from 'lucide-react';

export default function SavedPage() {
  const [savedExperiences, setSavedExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSaved() {
      try {
        const savedIdsStr = localStorage.getItem('lokiva_itinerary_ids');
        const ids: number[] = savedIdsStr ? JSON.parse(savedIdsStr) : [];
        if (ids.length > 0) {
          const all = await api.getExperiences({ limit: 80 });
          setSavedExperiences(all.filter((e) => ids.includes(e.id)));
        } else {
          // Fallback demo saved items
          const all = await api.getExperiences({ limit: 4 });
          setSavedExperiences(all.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load saved items:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSaved();
  }, []);

  const handleRemove = (id: number) => {
    const updated = savedExperiences.filter((e) => e.id !== id);
    setSavedExperiences(updated);
    try {
      localStorage.setItem('lokiva_itinerary_ids', JSON.stringify(updated.map((e) => e.id)));
    } catch {}
  };

  return (
    <RouteGuard allowedRoles={['traveler']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold text-orange-500 uppercase tracking-wider flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              <span>Saved Bucket List</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Your Saved Local Experiences
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Experiences you&apos;ve shortlisted for your upcoming trips across India.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:opacity-95 transition-all self-start sm:self-auto"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading saved experiences...</p>
          </div>
        ) : savedExperiences.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Bookmark className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No saved experiences yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Explore local workshops, street food trails, and cultural havelis, and bookmark your favorites.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-xs font-bold"
            >
              <span>Explore Experiences</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedExperiences.map((exp) => (
              <div key={exp.id} className="relative group">
                <ExperienceCard experience={exp} />
                <button
                  type="button"
                  onClick={() => handleRemove(exp.id)}
                  className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors shadow-md"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
