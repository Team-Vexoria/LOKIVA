'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { AdminStats } from '../../../types';
import { RouteGuard } from '../../../components/RouteGuard';
import { BarChart3, TrendingUp, Globe2, Compass, Search, Coins } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const s = await api.getAdminStats();
        setStats(s);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            National Demand Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Pan-India Traffic & Search Demand
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Real-time intent query metrics, regional popularity, and category search volumes.
          </p>
        </div>

        {/* Category Search Volumes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-500" />
              <span>Category Search Volume & Conversions</span>
            </h3>
            <div className="space-y-3">
              {stats?.category_demand?.map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300">
                    <span>{item.category}</span>
                    <span>{item.searches.toLocaleString()} searches ({item.conversion}% conv)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, (item.searches / 5500) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-purple-500" />
              <span>Top Destination Experience Density</span>
            </h3>
            <div className="space-y-3">
              {stats?.top_destinations?.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    {idx + 1}. {d.city}
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 font-bold">
                    {d.experiences} Verified Experiences
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
