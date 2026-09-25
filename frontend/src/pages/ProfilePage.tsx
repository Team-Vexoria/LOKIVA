import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthGuard } from '../hooks/useAuthGuard';
import {
  Camera,
  Sparkles,
  MapPin,
  Save,
  CheckCircle2,
  User as UserIcon,
  Compass,
  Store,
  Sliders,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Layers,
  Award
} from 'lucide-react';

export function ProfilePage() {
  const { user, isLoading, updateProfile, logout } = useAuthGuard();

  // Profile fields state
  const [role, setRole] = useState<'traveler' | 'provider'>(user?.role === 'provider' ? 'provider' : 'traveler');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar || user?.avatar_url || null);
  const [displayName, setDisplayName] = useState(user?.full_name || 'Cultural Traveler');
  const [persona, setPersona] = useState(user?.profile?.traveler_type || 'Cultural Explorer');
  const [groupSize, setGroupSize] = useState(user?.profile?.group_size || 2);
  const [budgetCeiling, setBudgetCeiling] = useState(user?.profile?.budget || 5000);
  const [isLowWalking, setIsLowWalking] = useState(user?.profile?.accessibility_prefs?.low_walking ?? false);

  // Provider-specific state
  const [craftName, setCraftName] = useState(user?.profile?.craft_name || 'Generational Lac & Handloom Guild');
  const [workshopCity, setWorkshopCity] = useState(user?.profile?.workshop_city || 'Jaipur');
  const [craftSpecialty, setCraftSpecialty] = useState(user?.profile?.craft_specialty || 'Handloom & Natural Dyes');
  const [workshopCapacity, setWorkshopCapacity] = useState(6);

  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when user object loads or updates
  useEffect(() => {
    if (user) {
      if (user.role) setRole(user.role === 'admin' ? 'traveler' : user.role);
      if (user.avatar || user.avatar_url) setAvatarUrl(user.avatar || user.avatar_url || null);
      if (user.full_name) setDisplayName(user.full_name);
      if (user.profile?.traveler_type) setPersona(user.profile.traveler_type);
      if (user.profile?.group_size) setGroupSize(user.profile.group_size);
      if (user.profile?.budget) setBudgetCeiling(user.profile.budget);
      if (user.profile?.accessibility_prefs?.low_walking !== undefined) {
        setIsLowWalking(Boolean(user.profile.accessibility_prefs.low_walking));
      }
      if (user.profile?.craft_name) setCraftName(user.profile.craft_name);
      if (user.profile?.workshop_city) setWorkshopCity(user.profile.workshop_city);
      if (user.profile?.craft_specialty) setCraftSpecialty(user.profile.craft_specialty);
    }
  }, [user]);

  // Handle local avatar upload with file reader for persistent preview
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarUrl(result);
        // Persist immediately to profile context
        updateProfile({}, undefined, undefined, result, role);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(
      {
        traveler_type: persona,
        group_size: groupSize,
        budget: budgetCeiling,
        craft_name: craftName,
        workshop_city: workshopCity,
        craft_specialty: craftSpecialty,
        accessibility_prefs: {
          low_walking: isLowWalking,
          family_friendly: persona.includes('Family'),
        },
      },
      displayName.trim() || undefined,
      undefined,
      avatarUrl || undefined,
      role
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center py-12 px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl border-4 border-[#C1443B]/20 border-t-[#C1443B] animate-spin" />
          <p className="text-xs font-mono text-[#5B6B8C] uppercase tracking-widest font-bold">
            Authenticating Cultural Passport...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#12213B] py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── TOP HERO PASSPORT CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative bg-white/95 backdrop-blur-xl border border-[#E5DFD5] rounded-3xl p-6 sm:p-8 shadow-xl overflow-hidden"
        >
          {/* Subtle warm accent radial in top corner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FFE8D6]/60 via-[#FDF2E9]/40 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar with Upload Trigger */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-[#FAF7F2] shadow-xl bg-gradient-to-tr from-[#FFC067] via-[#E25C34] to-[#C1443B] flex items-center justify-center text-white text-3xl sm:text-4xl font-display font-extrabold select-none">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{displayName ? displayName.charAt(0).toUpperCase() : 'T'}</span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-[#12213B]/75 backdrop-blur-xs rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[11px] font-heading font-bold cursor-pointer"
                title="Change Avatar"
              >
                <Camera className="w-5 h-5 mb-1 text-[#FFC067]" />
                <span>Update Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>

            {/* Profile Identity Details */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#12213B] tracking-tight">
                  {displayName}
                </h1>
                <span
                  className={`text-[10px] font-mono uppercase tracking-widest font-extrabold px-3 py-1 rounded-full border ${
                    role === 'traveler'
                      ? 'bg-[#FFF7ED] text-[#C1443B] border-[#FDBA74]'
                      : 'bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]'
                  }`}
                >
                  {role === 'traveler' ? '✦ Verified Traveler' : '🏛️ Heritage Artisan / Provider'}
                </span>
              </div>

              <p className="text-xs font-mono text-[#5B6B8C]">
                {user?.email || 'traveler@lokiva.com'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-xs text-[#5B6B8C] font-sans">
                <MapPin className="w-3.5 h-3.5 text-[#C1443B]" />
                <span>
                  {role === 'traveler'
                    ? 'Cultural Explorer & Autonomous Route Strategist'
                    : `${craftName} · ${workshopCity}`}
                </span>
              </div>
            </div>

            {/* Dual Role Switcher Pill */}
            <div className="bg-[#FAF7F2] p-1.5 rounded-2xl border border-[#E5DFD5] flex items-center gap-1 shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => setRole('traveler')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                  role === 'traveler'
                    ? 'bg-white text-[#C1443B] shadow-sm border border-[#E5DFD5]'
                    : 'text-[#5B6B8C] hover:text-[#12213B]'
                }`}
              >
                Traveler
              </button>
              <button
                type="button"
                onClick={() => setRole('provider')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                  role === 'provider'
                    ? 'bg-white text-[#15803D] shadow-sm border border-[#E5DFD5]'
                    : 'text-[#5B6B8C] hover:text-[#12213B]'
                }`}
              >
                Artisan Provider
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── CONSTRAINTS & SETTINGS FORM CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/95 backdrop-blur-xl border border-[#E5DFD5] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6"
        >
          <div className="flex items-center justify-between border-b border-[#EFE8DC] pb-4">
            <div>
              <span className="text-[10px] font-heading uppercase tracking-widest text-[#C1443B] font-extrabold block mb-1">
                Autonomous AI Solver Tuning
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#12213B]">
                {role === 'traveler'
                  ? 'Traveler Preferences & Spatial Solver Limits'
                  : 'Artisan Workshop & Experience Profile'}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] flex items-center justify-center text-[#C1443B]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Form Fields: Traveler vs Provider */}
            <AnimatePresence mode="wait">
              {role === 'traveler' ? (
                <motion.div
                  key="traveler-fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  {/* Display Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Piyush Kumar"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-sans font-semibold text-[#12213B] focus:outline-none focus:border-[#C1443B] transition-colors"
                    />
                  </div>

                  {/* Traveler Archetype */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Traveler Archetype
                    </label>
                    <select
                      value={persona}
                      onChange={(e) => setPersona(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-sans font-semibold text-[#12213B] focus:outline-none focus:border-[#C1443B] cursor-pointer"
                    >
                      <option value="Cultural Explorer">Cultural Explorer</option>
                      <option value="Masterclass Apprentice">Masterclass Apprentice</option>
                      <option value="Street Gastronomy Connoisseur">Street Gastronomy Connoisseur</option>
                      <option value="Sacred Shrine Pilgrim">Sacred Shrine Pilgrim</option>
                      <option value="Family with Kids / Elderly Parents">Family with Kids / Elderly Parents</option>
                      <option value="Vernacular Architecture Admirer">Vernacular Architecture Admirer</option>
                    </select>
                  </div>

                  {/* Travel Party Size */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Default Travel Party Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={16}
                      value={groupSize}
                      onChange={(e) => setGroupSize(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-mono font-semibold text-[#12213B] focus:outline-none focus:border-[#C1443B]"
                    />
                  </div>

                  {/* Daily Budget Ceiling */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Default Daily Budget Ceiling (₹)
                    </label>
                    <input
                      type="number"
                      step={500}
                      min={500}
                      max={50000}
                      value={budgetCeiling}
                      onChange={(e) => setBudgetCeiling(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-mono font-semibold text-[#12213B] focus:outline-none focus:border-[#C1443B]"
                    />
                  </div>

                  {/* Low Walking Accessibility Filter */}
                  <div className="md:col-span-2 pt-2">
                    <label className="flex items-start sm:items-center gap-3.5 p-4 rounded-2xl bg-[#FAF7F2] border border-[#E5DFD5] cursor-pointer hover:border-[#C1443B] transition-colors">
                      <input
                        type="checkbox"
                        checked={isLowWalking}
                        onChange={(e) => setIsLowWalking(e.target.checked)}
                        className="w-4 h-4 mt-0.5 sm:mt-0 accent-[#C1443B] rounded cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-heading font-bold text-[#12213B] block">
                          Accessibility Hard Filter (Strict Low Walking Radius)
                        </span>
                        <span className="text-[11px] text-[#5B6B8C] font-sans">
                          Caps consecutive walking segments under 400m and prioritizes step-free monument access.
                        </span>
                      </div>
                    </label>
                  </div>
                </motion.div>
              ) : (
                /* PROVIDER FIELDS */
                <motion.div
                  key="provider-fields"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Atelier / Guild Name
                    </label>
                    <input
                      type="text"
                      value={craftName}
                      onChange={(e) => setCraftName(e.target.value)}
                      placeholder="e.g. Royal Lac & Blue Pottery Atelier"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-sans font-semibold text-[#12213B] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Operating City &amp; District
                    </label>
                    <input
                      type="text"
                      value={workshopCity}
                      onChange={(e) => setWorkshopCity(e.target.value)}
                      placeholder="e.g. Jaipur, Rajasthan"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-sans font-semibold text-[#12213B] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Master Craft Discipline
                    </label>
                    <select
                      value={craftSpecialty}
                      onChange={(e) => setCraftSpecialty(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-sans font-semibold text-[#12213B] focus:outline-none focus:border-[#15803D] cursor-pointer"
                    >
                      <option value="Handloom & Natural Dyes">Handloom &amp; Natural Dyes</option>
                      <option value="Stone Carving & Inlay">Stone Carving &amp; Inlay</option>
                      <option value="Lac & Metalwork">Lac &amp; Metalwork</option>
                      <option value="Miniature Fresco Painting">Miniature Fresco Painting</option>
                      <option value="Vernacular Culinary Heritage">Vernacular Culinary Heritage</option>
                      <option value="Woodblock Printing & Textiles">Woodblock Printing &amp; Textiles</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#5B6B8C] font-bold block">
                      Workshop Capacity (Simultaneous Learners)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={workshopCapacity}
                      onChange={(e) => setWorkshopCapacity(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E5DFD5] text-xs font-mono font-semibold text-[#12213B] focus:outline-none focus:border-[#15803D]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Bar */}
            <div className="pt-4 border-t border-[#EFE8DC] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-[#5B6B8C]">
                {isSaved ? (
                  <span className="text-[#15803D] font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                    <span>Constraints saved and synced with solver!</span>
                  </span>
                ) : (
                  <span>⚡ Automatically synced with Lokiva AI function calls</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#5B6B8C] hover:text-[#C1443B] border border-[#E5DFD5] text-xs font-heading font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#C1443B] hover:bg-[#A83830] text-white font-heading font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-[0.98]"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Constraints</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>

      </div>
    </div>
  );
}

export default ProfilePage;
