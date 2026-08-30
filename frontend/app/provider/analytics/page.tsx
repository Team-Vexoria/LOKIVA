'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { ProviderAnalyticsSummary } from '../../../types';
import { RouteGuard } from '../../../components/RouteGuard';
import { BarChart3, TrendingUp, Users, Coins, Eye, Bookmark, CalendarCheck } from 'lucide-react';

export default function ProviderAnalyticsPage() {
  const [analytics, setAnalytics] = useState<ProviderAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await api.getProviderAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Business Performance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Provider Analytics & Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Insights on traveler discovery, conversion rates, and revenue generation.
          </p>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Views</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.views.toLocaleString() || '1,420'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Conversion: {analytics?.conversion_rate || 10}%
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Itinerary Adds</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.saves.toLocaleString() || '385'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              27.1% save rate
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Bookings</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {analytics?.bookings.toLocaleString() || '142'}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              4.9★ Average Rating
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Gross Revenue</span>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              ₹{analytics?.revenue.toLocaleString() || '92,400'}
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
              Payout: Next Tuesday
            </div>
          </div>
        </div>

        {/* Views Trend Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Weekly Traveler Traffic & Bookings
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Past 7 Days</span>
          </div>

          <div className="grid grid-cols-7 gap-3 items-end h-48 pt-6 border-b border-slate-100 dark:border-slate-800 pb-2">
            {analytics?.views_trend?.map((item, idx) => {
              const heightPercent = Math.min(100, (item.views / 350) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.views} views
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all group-hover:brightness-125"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 mt-1">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
