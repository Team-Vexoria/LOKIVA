'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import { State, City } from '../../../../types';
import { RouteGuard } from '../../../../components/RouteGuard';
import {
  Sparkles,
  ChevronLeft,
  Building,
  MapPin,
  Clock,
  Coins,
  Check,
  Upload,
  Info
} from 'lucide-react';

export default function NewExperiencePage() {
  const router = useRouter();
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'workshop',
    price: 450,
    duration_mins: 90,
    neighborhood: 'Bandra',
    address: 'Bandra West, Mumbai',
    latitude: 19.0596,
    longitude: 72.8295,
    opening_time: '10:00',
    closing_time: '18:00',
    capacity: 15,
    is_indoor: true,
    is_hidden_gem: true,
    accessibility_low_walking: true,
    accessibility_wheelchair: true,
    accessibility_family_friendly: true,
    dietary_vegetarian: true
  });

  useEffect(() => {
    async function loadGeo() {
      try {
        const [sts, cts] = await Promise.all([
          api.getStates(),
          api.getCities()
        ]);
        setStates(sts);
        setCities(cts);
      } catch (err) {
        console.error('Failed to load geo data:', err);
      }
    }
    loadGeo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await api.createProviderExperience({
        ...form,
        category: form.category as any,
        state: selectedState,
        city: selectedCity,
        images: ['https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?w=800'],
        tags: [form.category, selectedCity.toLowerCase(), 'artisan', 'authentic']
      });
      router.push('/provider/experiences');
    } catch (err: any) {
      setError(err.message || 'Failed to create experience');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={['provider']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <Link
            href="/provider/experiences"
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to My Experiences</span>
          </Link>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
            New Listing Creator
          </span>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
              List a New Local Experience
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Provide authentic details, pricing, neighborhood context, and accessibility flags for travelers.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Experience Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Master Block Printing with 5th Gen Artisan"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="workshop">Artisan Workshop</option>
                  <option value="food">Food & Culinary</option>
                  <option value="culture">Heritage & Culture</option>
                  <option value="hidden_gem">Hidden Gem</option>
                  <option value="adventure">Adventure & Trek</option>
                  <option value="nature">Nature & Wildlife</option>
                  <option value="shopping">Artisanal Bazaar</option>
                  <option value="nightlife">Evening & Rooftop</option>
                </select>
              </div>
            </div>

            {/* State & City Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">State / Region</label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  {states.map((s) => (
                    <option key={s.id} value={s.name}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">City / Destination</label>
                <input
                  type="text"
                  required
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  placeholder="Mumbai, Goa, Kochi, Jaipur..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Neighborhood / Area</label>
                <input
                  type="text"
                  required
                  value={form.neighborhood}
                  onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  placeholder="Bandra, Dadar, Fort Kochi..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Price, Duration, Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Price (₹ INR / Person)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  min={15}
                  value={form.duration_mins}
                  onChange={(e) => setForm({ ...form, duration_mins: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Max Capacity / Slot</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Experience Story & Description</label>
              <textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Explain the heritage tradition, materials provided to guests, hands-on activities, and key takeaways..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Accessibility Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Accessibility, Mobility & Dietary Features
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.accessibility_low_walking}
                    onChange={(e) => setForm({ ...form, accessibility_low_walking: e.target.checked })}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Low Walking / Seated</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_indoor}
                    onChange={(e) => setForm({ ...form, is_indoor: e.target.checked })}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Indoor (Rain-Safe)</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_hidden_gem}
                    onChange={(e) => setForm({ ...form, is_hidden_gem: e.target.checked })}
                    className="rounded accent-blue-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Local Hidden Gem</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/provider/experiences"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Experience'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
}
