'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { AdminStats, Provider } from '../../types';
import { RouteGuard } from '../../components/RouteGuard';
import {
  ShieldCheck,
  Users,
  Building,
  Sparkles,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Coins,
  Globe2,
  Lock
} from 'lucide-react';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [st, provs] = await Promise.all([
          api.getAdminStats(),
          api.getAdminProviders()
        ]);
        setStats(st);
        setProviders(provs);
      } catch (err) {
        console.error('Failed to load admin overview:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                System Administration
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Clusters Operational</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
              LOKIVA Platform Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              National overview of travelers, experience creators, GMV, and verification queues.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/providers"
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-colors"
            >
              Review Verification Queue ({stats?.pending_verifications || 4})
            </Link>
          </div>
        </div>

        {/* Platform Overview Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Total Travelers</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats?.total_travelers.toLocaleString() || '2,840'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Active across 15 Hubs
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Experience Creators</span>
              <Building className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats?.total_providers.toLocaleString() || '142'}
            </div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              {stats?.pending_verifications || 4} Pending Audit
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Curated Experiences</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              {stats?.total_experiences.toLocaleString() || '229'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              {stats?.active_listings || 220} Active Listings
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
              <span>Platform GMV (Demo)</span>
              <Coins className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
              ₹{(stats?.demo_revenue ? (stats.demo_revenue / 100000).toFixed(1) : '28.4')}L
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats?.total_bookings || 3420} Bookings Completed
            </div>
          </div>
        </div>

        {/* Quick Management Hub Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/providers"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xl transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-500 transition-colors">
              Provider Verification Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify local artisan credentials, review workshop photos, and grant verified host badges.
            </p>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 pt-1">
              <span>Open Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/experiences"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xl transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-500 transition-colors">
              Experience Catalog Moderation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Review published workshops, check accuracy of pricing and hours, and manage listing status.
            </p>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 pt-1">
              <span>Moderate Listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 shadow-xl transition-all group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-purple-500 transition-colors">
              Pan-India Demand Analytics
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyze search query patterns, category demand across Indian states, and booking volumes.
            </p>
            <div className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 pt-1">
              <span>View Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>
    </RouteGuard>
  );
}
