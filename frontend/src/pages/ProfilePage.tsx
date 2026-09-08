import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { User, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [travelerType, setTravelerType] = useState(user?.profile?.traveler_type || 'Family with Kids');
  const [groupSize, setGroupSize] = useState(user?.profile?.group_size || 4);
  const [budget, setBudget] = useState(user?.profile?.budget || 1500);
  const [lowWalking, setLowWalking] = useState(user?.profile?.accessibility_prefs?.low_walking ?? true);
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if user loads later
  React.useEffect(() => {
    if (user?.full_name) {
      setFullName(user.full_name);
    }
  }, [user?.full_name]);

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-paper-400 p-8 max-w-md w-full text-center space-y-5 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-paper-100 border border-paper-300 flex items-center justify-center mx-auto text-[#D85A38] shadow-sm">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-ink">User Profile & Settings</h2>
            <p className="text-xs text-dusk font-sans leading-relaxed">
              Sign in to manage your cultural trip solver constraints, dietary preferences, and account profile.
            </p>
          </div>
          <Link
            to="/login?redirect=/profile"
            className="block w-full py-3.5 bg-[#D85A38] hover:bg-[#C24927] text-white rounded-xl font-mono text-xs font-bold transition shadow-md hover:shadow-lg"
          >
            Sign In to View Profile
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(
      {
        traveler_type: travelerType,
        group_size: groupSize,
        budget,
        accessibility_prefs: {
          low_walking: lowWalking,
          family_friendly: travelerType.includes('Family'),
        },
      },
      fullName.trim() || undefined
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-paper text-ink py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-[#D85A38] flex items-center justify-center text-white text-3xl font-bold font-display shadow-md">
            {fullName ? fullName[0] : (user?.full_name ? user.full_name[0] : 'T')}
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-bold font-display text-ink">{fullName || user?.full_name || 'Cultural Traveler'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                {user?.role || 'Traveler'}
              </span>
            </div>
            <p className="text-xs font-mono text-dusk">{user?.email || 'traveler@lokiva.com'}</p>
            <div className="pt-2 flex items-center justify-center sm:justify-start gap-3 text-xs font-mono text-dusk-700">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-marigold" />
                Cultural Explorer
              </span>
            </div>
          </div>
        </div>

        {/* Preferences Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
          <h2 className="text-xl font-display font-bold text-ink flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-marigold" />
            Traveler Profile & Solver Constraints
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-mono text-xs">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-dusk uppercase block font-bold">Display Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Piyush"
                className="w-full bg-paper-100 border border-paper-300 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              />
            </div>
            {/* Traveler Style */}
            <div className="space-y-1.5">
              <label className="text-dusk uppercase block font-bold">Traveler Persona</label>
              <select
                value={travelerType}
                onChange={(e) => setTravelerType(e.target.value)}
                className="w-full bg-paper-100 border border-paper-300 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              >
                <option value="Solo Explorer">Solo Explorer</option>
                <option value="Family with Kids">Family with Kids / Elderly Parents</option>
                <option value="Couples & Friends">Couples & Friends</option>
                <option value="Cultural Researcher">Cultural Researcher</option>
              </select>
            </div>

            {/* Group Size */}
            <div className="space-y-1.5">
              <label className="text-dusk uppercase block font-bold">Default Group Size</label>
              <input
                type="number"
                min="1"
                max="10"
                value={groupSize}
                onChange={(e) => setGroupSize(parseInt(e.target.value, 10))}
                className="w-full bg-paper-100 border border-paper-300 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              />
            </div>

            {/* Target Budget */}
            <div className="space-y-1.5">
              <label className="text-dusk uppercase block font-bold">Default Budget Ceiling (₹)</label>
              <input
                type="number"
                step="500"
                min="500"
                max="10000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value, 10))}
                className="w-full bg-paper-100 border border-paper-300 rounded-xl px-4 py-2.5 text-xs text-ink font-semibold focus:outline-none focus:border-marigold"
              />
            </div>

            {/* Accessibility Checkbox */}
            <div className="space-y-1.5">
              <label className="text-dusk uppercase block font-bold">Accessibility Hard Pre-Filter</label>
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-ink font-bold">
                  <input
                    type="checkbox"
                    checked={lowWalking}
                    onChange={(e) => setLowWalking(e.target.checked)}
                    className="w-4 h-4 rounded text-marigold focus:ring-marigold"
                  />
                  <span>Prioritize Low Walking & Step-Free Venues</span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-paper-300 flex items-center justify-between">
            {isSaved ? (
              <span className="text-xs font-mono text-teal font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Constraints saved to solver profile!
              </span>
            ) : (
              <span className="text-xs font-mono text-dusk">Auto-applied by AI Cultural Concierge</span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#D85A38] hover:bg-[#C24927] text-white font-mono rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg"
            >
              Save Constraints
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
