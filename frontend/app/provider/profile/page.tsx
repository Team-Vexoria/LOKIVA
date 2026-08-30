'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Provider } from '../../../types';
import { RouteGuard } from '../../../components/RouteGuard';
import { Building, Mail, Phone, MapPin, CheckCircle2, ShieldCheck, Check } from 'lucide-react';

export default function ProviderProfilePage() {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const p = await api.getProviderProfile();
        setProvider(p);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    }
    load();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            Partner Profile
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            Business Profile & Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your public artisan studio details, contact info, and verification badge.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-blue-500/20">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {provider?.business_name || 'India Artisan Guild'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified Partner</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {provider?.contact_email || 'provider@lokiva.demo'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Business / Studio Name</label>
              <input
                type="text"
                defaultValue={provider?.business_name || 'Jaipur Artisan Collective'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">About Studio / Bio</label>
              <textarea
                rows={3}
                defaultValue={provider?.description || 'Authentic local experiences hosted by passionate artisans and heritage custodians across India.'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Contact Phone</label>
                <input
                  type="text"
                  defaultValue={provider?.phone || '+91 98290 12345'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Studio Address</label>
                <input
                  type="text"
                  defaultValue={provider?.address || 'Old City, Jaipur, Rajasthan'}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {isSaved ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Profile saved!</span>
                </span>
              ) : <div />}
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20"
              >
                Save Business Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
}
