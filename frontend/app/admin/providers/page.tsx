'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Provider } from '../../../types';
import { RouteGuard } from '../../../components/RouteGuard';
import { ShieldCheck, Building, CheckCircle2, XCircle, Star, MapPin } from 'lucide-react';

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProviders() {
      try {
        const provs = await api.getAdminProviders();
        setProviders(provs);
      } catch (err) {
        console.error('Failed to load providers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProviders();
  }, []);

  const toggleVerify = async (id: number, currentStatus: boolean) => {
    try {
      const updated = await api.verifyProvider(id, !currentStatus);
      setProviders(providers.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error('Failed to update provider status:', err);
    }
  };

  return (
    <RouteGuard allowedRoles={['admin']}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Host Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Provider Verification Queue ({providers.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review and grant verified host credentials to local artisans, studios, and culinary hosts.
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs">Loading provider verification queue...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      p.is_verified
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.is_verified ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{p.is_verified ? 'Verified Host' : 'Pending Review'}</span>
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {p.business_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                      {p.description || 'Authentic artisan workshops and cultural walks.'}
                    </p>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div>📍 {p.address || `${p.city}, India`}</div>
                    <div className="text-slate-400">✉ {p.contact_email || 'provider@lokiva.demo'}</div>
                    <div className="text-amber-500 font-semibold">★ {p.rating} ({p.total_reviews} reviews)</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: PROV-{p.id}</span>
                  <button
                    type="button"
                    onClick={() => toggleVerify(p.id, p.is_verified)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      p.is_verified
                        ? 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {p.is_verified ? 'Revoke Verification' : 'Grant Verified Badge'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
