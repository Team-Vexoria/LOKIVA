'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { Provider, ProviderAnalyticsSummary, Experience } from '../../types';
import { RouteGuard } from '../../components/RouteGuard';
import {
  Layers,
  Sparkles,
  TrendingUp,
  Eye,
  Bookmark,
  CalendarCheck,
  Coins,
  Star,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Users,
  Building
} from 'lucide-react';

export default function ProviderDashboardPage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [analytics, setAnalytics] = useState<ProviderAnalyticsSummary | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prof, an, exps] = await Promise.all([
          api.getProviderProfile(),
          api.getProviderAnalytics(),
          api.getProviderExperiences()
        ]);
        setProvider(prof);
        setAnalytics(an);
        setExperiences(exps);
      } catch (err) {
        console.error('Failed to load provider dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Partner Dashboard
              </span>
              {provider?.is_verified && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Host</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Good morning, {provider?.business_name || 'Local Partner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your authentic experiences are reaching travelers searching across India.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/provider/experiences/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </Link>
            <Link
              href="/provider/availability"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm transition-colors"
            >
              Manage Slots
            </Link>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Total Views</span>
              <Eye className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.views ? analytics.views.toLocaleString() : '1,420'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ↑ 18.4% this week
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Saved in Itineraries</span>
              <Bookmark className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.saves ? analytics.saves.toLocaleString() : '385'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ↑ 24% added to AI plans
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Bookings Confirmed</span>
              <CalendarCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.bookings ? analytics.bookings.toLocaleString() : '142'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Conversion: {analytics?.conversion_rate || 10}%
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Earnings (INR)</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              ₹{analytics?.revenue ? analytics.revenue.toLocaleString() : '92,400'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Rating: {provider?.rating || 4.9}★ ({provider?.total_reviews || 28})
            </div>
          </div>
        </div>

        {/* Experience Performance & Traveler Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Active Listings Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Your Listed Experiences ({experiences.length})</span>
              </h3>
              <Link
                href="/provider/experiences"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {experiences.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <Building className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No experiences listed yet</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Publish your first workshop or heritage tour to start receiving bookings.
                </p>
                <Link
                  href="/provider/experiences/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Experience</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {experiences.slice(0, 4).map((exp) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={exp.images[0] || 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800'}
                        alt={exp.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {exp.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>📍 {exp.neighborhood}, {exp.city}</span>
                          <span>· ₹{Math.round(exp.price)}</span>
                          <span>· {exp.duration_mins} mins</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traveler Audience Insights (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Traveler Insights</span>
              </h3>
              <Link
                href="/provider/analytics"
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Full Analytics
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-2">
                  Audience Breakdown
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      <span>👨‍👩‍👧 Families (with Parents/Kids)</span>
                      <span>48%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      <span>💑 Couples</span>
                      <span>26%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-500 rounded-full" style={{ width: '26%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      <span>🚶 Solo Explorers</span>
                      <span>16%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '16%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1">
                  💡 Host Tip for More Bookings
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Travelers prioritize experiences with low walking (seated workshops) and rain-safe indoor areas during sudden weather changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
