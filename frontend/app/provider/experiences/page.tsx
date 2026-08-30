'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { Experience } from '../../../types';
import { RouteGuard } from '../../../components/RouteGuard';
import {
  Sparkles,
  Plus,
  Edit,
  Eye,
  Star,
  MapPin,
  Clock,
  Coins,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ProviderExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const exps = await api.getProviderExperiences();
        setExperiences(exps);
      } catch (err) {
        console.error('Failed to load experiences:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Listing Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              My Experiences ({experiences.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your workshop details, pricing, capacities, and active listing statuses.
            </p>
          </div>

          <Link
            href="/provider/experiences/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Experience</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading your listings...</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Sparkles className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No experiences listed yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Add your culinary walk, pottery studio, or textile printing workshop to reach travelers.
            </p>
            <Link
              href="/provider/experiences/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Listing</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full">
                    <img
                      src={exp.images[0] || 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800'}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                      LIVE
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                      {exp.category.replace('_', ' ')} · {exp.city}
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {exp.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-2">
                      <span>₹{Math.round(exp.price)}/person</span>
                      <span>· {exp.duration_mins} mins</span>
                      <span>· {exp.rating}★</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Capacity: {exp.capacity} pax/slot
                  </span>
                  <Link
                    href={`/experience/${exp.id}`}
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Public Page</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
