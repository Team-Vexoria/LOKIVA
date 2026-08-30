'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { RouteGuard } from '../../components/RouteGuard';
import {
  User,
  Mail,
  Heart,
  Footprints,
  Coins,
  Clock,
  ShieldCheck,
  Check,
  MapPin,
  Compass
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);

  // Preference fields
  const [travelerType, setTravelerType] = useState('Family');
  const [budget, setBudget] = useState(2000);
  const [availableHours, setAvailableHours] = useState(4);
  const [lowWalking, setLowWalking] = useState(true);
  const [wheelchair, setWheelchair] = useState(false);
  const [familyFriendly, setFamilyFriendly] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'food',
    'culture',
    'workshop'
  ]);

  const toggleInterest = (key: string) => {
    if (selectedInterests.includes(key)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== key));
    } else {
      setSelectedInterests([...selectedInterests, key]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <RouteGuard allowedRoles={['traveler']}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="text-xs font-bold text-orange-500 uppercase tracking-wider">
            Traveler Preferences
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
            My Travel Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Customize your AI recommendations, walking constraints, and budget preferences.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          {/* Identity */}
          <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-rose-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-500/20">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {user?.full_name || 'Aarav Sharma'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Active Traveler
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email || 'traveler@lokiva.demo'}</p>
              <div className="text-[11px] text-orange-500 font-semibold mt-1">
                📍 Default Exploration City: Mumbai, Maharashtra
              </div>
            </div>
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Traveler Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300">Traveler Type</label>
                <select
                  value={travelerType}
                  onChange={(e) => setTravelerType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="Family">Family with Parents/Children</option>
                  <option value="Couples">Couples Romantic</option>
                  <option value="Solo">Solo Explorer</option>
                  <option value="Friends">Friends Group</option>
                </select>
              </div>

              {/* Default Budget */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold">
                  <span>Default Budget / Person</span>
                  <span className="text-orange-500">₹{budget}</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={5000}
                  step={100}
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>
            </div>

            {/* Interest Tags */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                Top Experience Interests
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: 'food', label: '🥘 Regional Food Trails' },
                  { key: 'culture', label: '🏛️ Heritage & Architecture' },
                  { key: 'workshop', label: '🎨 Artisan Workshops' },
                  { key: 'hidden_gem', label: '✨ Hidden Gems' },
                  { key: 'adventure', label: '🧗 Adventures & Treks' },
                  { key: 'nature', label: '🌿 Nature & Wildlife' },
                  { key: 'shopping', label: '🛍️ Artisanal Bazaars' },
                  { key: 'nightlife', label: '🌙 Evening & Rooftops' }
                ].map((item) => {
                  const active = selectedInterests.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => toggleInterest(item.key)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessibility Toggles */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 text-xs block">
                Accessibility & Mobility Constraints
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowWalking}
                    onChange={(e) => setLowWalking(e.target.checked)}
                    className="rounded accent-orange-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Low Walking / Seated</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wheelchair}
                    onChange={(e) => setWheelchair(e.target.checked)}
                    className="rounded accent-orange-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Wheelchair Access</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={familyFriendly}
                    onChange={(e) => setFamilyFriendly(e.target.checked)}
                    className="rounded accent-orange-500"
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Senior & Kids Friendly</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              {isSaved ? (
                <span className="text-emerald-500 font-bold text-xs flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Preferences saved successfully!</span>
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-orange-500/20 hover:opacity-95 transition-opacity"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </RouteGuard>
  );
}
