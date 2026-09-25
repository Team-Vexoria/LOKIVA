import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Radio,
  Calendar,
  DollarSign,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
  Eye,
  Star,
  CheckCircle2,
  Plus,
  Clock,
  MapPin,
  TrendingUp,
  Search,
  Check,
  X,
  Phone,
  Mail,
  Zap,
  Tag,
  Building,
  Lock,
  Edit,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useProviderStore } from '../store/useProviderStore';
import { FlashBeaconStudio } from '../components/provider/FlashBeaconStudio';
import { DemandClusterRadar } from '../components/provider/DemandClusterRadar';
import { WorkshopSlotEditorDrawer } from '../components/provider/WorkshopSlotEditorDrawer';
import { WorkshopSlot } from '../types/provider';

type TabType = 'dashboard' | 'beacon' | 'slots' | 'listings' | 'bookings' | 'earnings' | 'copilot' | 'profile';

export function ProviderDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'dashboard';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const { user } = useAuth();
  const profile = useProviderStore((s) => s.profile);
  const slots = useProviderStore((s) => s.slots);
  const bookings = useProviderStore((s) => s.bookings);
  const listings = useProviderStore((s) => s.listings);
  const recentFeedEvents = useProviderStore((s) => s.recentFeedEvents);
  const updateGuildProfile = useProviderStore((s) => s.updateGuildProfile);
  const deleteWorkshopSlot = useProviderStore((s) => s.deleteWorkshopSlot);

  // Dynamic Metrics computed live from store
  const totalRevenue = useProviderStore((s) => s.getTotalRevenue());
  const verifiedBookingsCount = useProviderStore((s) => s.getVerifiedBookingsCount());
  const audienceReach = useProviderStore((s) => s.getAudienceReach());
  const communityRating = useProviderStore((s) => s.getCommunityRating());
  const reviewCount = useProviderStore((s) => s.getReviewCount());

  // Search & Filter in Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'flash' | 'confirmed' | 'checked_in'>('all');

  // Workshop Slot Editor Slide-Over Drawer State
  const [isSlotEditorOpen, setIsSlotEditorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<WorkshopSlot | null>(null);

  // Floating Claim Indicator Animation
  const [floatingNotification, setFloatingNotification] = useState<string | null>(null);

  // Profile Edit Form State
  const [profileForm, setProfileForm] = useState({
    guildName: profile.guildName,
    craftSpecialty: profile.craftSpecialty,
    city: profile.city,
    precinct: profile.precinct,
    generationalHeritage: profile.generationalHeritage,
    isStepFreeAccessible: profile.isStepFreeAccessible,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    settlementAccount: profile.settlementAccount,
    bio: profile.bio || '',
  });
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    setIsSlotEditorOpen(true);
  };

  const handleOpenEditSlot = (slot: WorkshopSlot) => {
    setEditingSlot(slot);
    setIsSlotEditorOpen(true);
  };

  const handleSeatClaimTriggered = (amountOrCluster: number | string, maybeAmount?: number) => {
    const amount = typeof amountOrCluster === 'number' ? amountOrCluster : (maybeAmount || 840);
    setFloatingNotification(`+₹${amount.toLocaleString('en-IN')}`);
    setTimeout(() => setFloatingNotification(null), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateGuildProfile(profileForm);
    setProfileSavedToast(true);
    setTimeout(() => setProfileSavedToast(false), 3000);
  };

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.travelerName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.listingTitle.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.bookingId.toLowerCase().includes(bookingSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (bookingFilter === 'flash') return b.bookedViaFlashBeacon;
    if (bookingFilter === 'confirmed') return b.status === 'confirmed';
    if (bookingFilter === 'checked_in') return b.status === 'checked_in';
    return true;
  });

  const activeBeaconSlot = slots.find((s) => s.flashBeacon?.isActive);

  // Calculate Today's Total Capacity and Seat Fill Rate
  const totalSlotsCapacity = slots.reduce((sum, s) => sum + s.totalCapacity, 0);
  const totalSeatsBooked = slots.reduce((sum, s) => sum + s.bookedSeats, 0);
  const fillRatePercent = totalSlotsCapacity > 0 ? Math.round((totalSeatsBooked / totalSlotsCapacity) * 100) : 82;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#12213B] font-sans pb-16">
      {/* Floating Revenue Increment Toast */}
      <AnimatePresence>
        {floatingNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.85 }}
            className="fixed top-24 right-8 z-50 px-4 py-2.5 bg-[#065F46] text-white font-mono font-extrabold text-sm rounded-2xl shadow-xl flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#A7F3D0]" />
            <span>Direct Payout Received: {floatingNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-6">
        
        {/* TOP GUILD BANNER */}
        <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-[#C85A32] bg-[#FAF4ED] border border-[#E8DEC8] px-3 py-0.5 rounded-full">
                Artisan Command Console
              </span>
              <span className="text-[11px] font-mono text-[#556275] bg-[#FAF8F5] border border-[#E5DFD5] px-2.5 py-0.5 rounded-md">
                {profile.generationalHeritage}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B]">
              {profile.guildName}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#556275]">
              <span className="flex items-center gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-[#C85A32]" />
                <span>{profile.city} · {profile.precinct}</span>
              </span>
              <span>·</span>
              <span className="font-heading font-bold text-[#12213B]">
                {profile.craftSpecialty}
              </span>
              {profile.isStepFreeAccessible && (
                <>
                  <span>·</span>
                  <span className="text-[#065F46] font-mono font-bold">
                    ♿ Step-Free Ground Floor
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeBeaconSlot && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF4ED] border border-[#C85A32] text-[#C85A32] font-mono text-xs font-bold animate-pulse shadow-2xs">
                <Radio className="w-4 h-4 text-[#C85A32]" />
                <span>Flash Beacon Active</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#065F46]" />
              <span>KYC Level 2 Verified</span>
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E5DFD5] scrollbar-none font-heading text-xs">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#D99B43]" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => handleTabChange('beacon')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 relative ${
              activeTab === 'beacon'
                ? 'bg-[#C85A32] text-white shadow-2xs'
                : 'bg-[#FAF4ED] hover:bg-[#F3EAD8] text-[#C85A32] border border-[#E8DEC8]'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#C85A32] animate-pulse" />
            <span>Flash Beacon Live Yield</span>
            {activeBeaconSlot && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('slots')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'slots'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#065F46]" />
            <span>Workshop Slots ({slots.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('listings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'listings'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>My Listings ({listings.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('bookings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#556275]" />
            <span>Bookings & Manifest ({bookings.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('earnings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'earnings'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-[#065F46]" />
            <span>0% Commission Earnings</span>
          </button>

          {/* AI Co-Pilot Teaser Tab */}
          <button
            onClick={() => handleTabChange('copilot')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'copilot'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D99B43]" />
            <span>AI Co-Pilot Studio</span>
            <span className="px-1.5 py-0.2 rounded bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8] font-mono text-[9px] uppercase font-bold">
              Teaser
            </span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'profile'
                ? 'bg-[#12213B] text-white shadow-2xs'
                : 'bg-white hover:bg-[#FAF8F5] text-[#556275] hover:text-[#12213B] border border-[#E5DFD5]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#D99B43]" />
            <span>Guild Profile</span>
          </button>
        </div>

        {/* TAB 1: COMMAND CENTER (MAIN DASHBOARD) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* DYNAMIC KPI BENTO ROW (ZERO 0 VALUES) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {/* Card 1: Direct Artisan Revenue */}
              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD5] space-y-2 shadow-2xs relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Direct Artisan Revenue</span>
                  <DollarSign className="w-4 h-4 text-[#065F46]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#12213B] tracking-tight">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-[#065F46] font-mono font-semibold">
                  100% Direct Payout · 0% Platform Middleman Cut
                </div>
              </div>

              {/* Card 2: Today's Seat Fill Rate */}
              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD5] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Today's Seat Fill Rate</span>
                  <Users className="w-4 h-4 text-[#C85A32]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#12213B] tracking-tight">
                  {fillRatePercent}% Utilized
                </div>
                <div className="space-y-1">
                  <div className="w-full h-2 bg-[#FAF7F2] rounded-full overflow-hidden border border-[#E5DFD5]">
                    <div
                      className="h-full bg-[#C85A32] rounded-full transition-all duration-500"
                      style={{ width: `${fillRatePercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-[#556275] font-mono">
                    {totalSeatsBooked} of {totalSlotsCapacity} Total Seats Filled
                  </div>
                </div>
              </div>

              {/* Card 3: Live Geo-Radius Impressions */}
              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD5] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Live Geo-Radius Impressions</span>
                  <Eye className="w-4 h-4 text-[#12213B]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#12213B] tracking-tight">
                  148 Active
                </div>
                <div className="text-[11px] text-[#065F46] font-mono font-semibold">
                  Travelers within 8 km matching craft tags
                </div>
              </div>

              {/* Card 4: Verified Guild Trust Score */}
              <div className="bg-white p-5 rounded-3xl border border-[#E5DFD5] space-y-2 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Verified Guild Trust Score</span>
                  <Star className="w-4 h-4 text-[#D99B43] fill-[#D99B43]" />
                </div>
                <div className="text-3xl font-display font-extrabold text-[#12213B] tracking-tight">
                  {communityRating.toFixed(2)} / 5.0
                </div>
                <div className="text-[11px] text-[#556275] font-mono">
                  {reviewCount} verified traveler cultural reviews
                </div>
              </div>
            </div>

            {/* SIGNATURE FLASH BEACON LIVE YIELD STUDIO (CENTERPIECE) */}
            <FlashBeaconStudio
              onOpenSlotManager={handleOpenAddSlot}
              onSeatClaimAnimation={handleSeatClaimTriggered}
            />

            {/* INTERACTIVE GEO-RADIUS DEMAND RADAR */}
            <DemandClusterRadar onBeamOfferSuccess={handleSeatClaimTriggered} />

            {/* WORKSHOP SESSIONS & RECENT GUILD ACTIVITY */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upcoming Workshop Sessions */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                  <h3 className="text-base font-heading font-bold text-[#12213B] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C85A32]" />
                    <span>Workshop Sessions & Yield Manager</span>
                  </h3>

                  <button
                    onClick={handleOpenAddSlot}
                    className="px-3 py-1.5 bg-[#12213B] hover:bg-[#1A2E4C] text-white rounded-xl text-xs font-heading font-bold transition shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D99B43]" />
                    <span>+ New Craft Session</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {slots.slice(0, 4).map((slot) => {
                    const openSeats = Math.max(0, slot.totalCapacity - slot.bookedSeats);
                    return (
                      <div
                        key={slot.slotId}
                        className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-mono font-bold text-[#556275]">
                            {slot.timeLabel}
                          </div>
                          <div className="text-xs sm:text-sm font-heading font-bold text-[#12213B] line-clamp-1">
                            {slot.listingTitle}
                          </div>
                          <div className="text-[11px] font-mono text-[#556275]">
                            ₹{slot.basePricePerPerson}/pax · {slot.bookedSeats}/{slot.totalCapacity} Booked
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSlot(slot)}
                            className="p-2 bg-white hover:bg-[#FAF4ED] text-[#556275] hover:text-[#C85A32] border border-[#E5DFD5] rounded-xl text-xs font-heading font-bold transition"
                            title="Edit Slot & Pricing"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {openSeats > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleTabChange('beacon')}
                              className="px-3 py-1.5 rounded-xl bg-[#FAF4ED] hover:bg-[#F3EAD8] border border-[#E8DEC8] text-[#C85A32] font-heading text-xs font-extrabold flex items-center gap-1"
                            >
                              <Zap className="w-3 h-3" />
                              <span>{openSeats} Open</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-xs font-bold">
                              Full
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Activity Feed */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                  <h3 className="text-base font-heading font-bold text-[#12213B] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D99B43]" />
                    <span>Real-Time Guild Activity</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded font-bold">
                    Live Sync
                  </span>
                </div>

                <div className="space-y-3">
                  {recentFeedEvents.slice(0, 5).map((ev) => (
                    <div key={ev.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] space-y-1">
                      <div className="flex items-center justify-between text-xs font-heading font-bold text-[#12213B]">
                        <span>{ev.title}</span>
                        <span className="text-[10px] font-mono text-[#556275]">{ev.time}</span>
                      </div>
                      <p className="text-[11px] text-[#556275] font-sans leading-normal">
                        {ev.subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: FLASH BEACON DEDICATED DECK */}
        {activeTab === 'beacon' && (
          <div className="space-y-6">
            <FlashBeaconStudio
              onOpenSlotManager={handleOpenAddSlot}
              onSeatClaimAnimation={handleSeatClaimTriggered}
            />
            <DemandClusterRadar onBeamOfferSuccess={handleSeatClaimTriggered} />
          </div>
        )}

        {/* TAB 3: WORKSHOP SLOTS & YIELD MANAGER */}
        {activeTab === 'slots' && (
          <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-[#12213B]">
                  Workshop Slots & Seat Capacity Manager
                </h2>
                <p className="text-xs text-[#556275]">
                  Add upcoming calendar slots, adjust seat caps, and monitor live booking occupancy
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSlot}
                className="px-4 py-2.5 bg-[#12213B] hover:bg-[#1A2E4C] text-[#FAF7F2] font-heading font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#D99B43]" />
                <span>+ New Craft Session</span>
              </button>
            </div>

            {/* Slot List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slots.map((slot) => {
                const openSeats = Math.max(0, slot.totalCapacity - slot.bookedSeats);
                const occupancyPercent = (slot.bookedSeats / slot.totalCapacity) * 100;

                return (
                  <div
                    key={slot.slotId}
                    className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-xs font-mono font-bold text-[#556275] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#C85A32]" />
                          <span>{slot.timeLabel}</span>
                        </div>
                        <h4 className="text-sm font-heading font-bold text-[#12213B]">
                          {slot.listingTitle}
                        </h4>
                      </div>

                      <span className="text-xs font-mono font-bold text-[#065F46] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded shrink-0">
                        ₹{slot.basePricePerPerson} / seat
                      </span>
                    </div>

                    {/* Occupancy Progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-[#556275]">Occupancy ({Math.round(occupancyPercent)}%):</span>
                        <span className="font-bold text-[#12213B]">
                          {slot.bookedSeats} of {slot.totalCapacity} Seats Booked ({openSeats} open)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-[#FAF7F2] rounded-full border border-[#E5DFD5] overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            openSeats === 0 ? 'bg-[#065F46]' : 'bg-[#C85A32]'
                          }`}
                          style={{ width: `${occupancyPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSlot(slot)}
                        className="text-[#12213B] font-heading font-bold hover:underline flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3 text-[#556275]" />
                        <span>Edit Slot & Pricing</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {openSeats > 0 && (
                          <button
                            type="button"
                            onClick={() => handleTabChange('beacon')}
                            className="text-[#C85A32] font-heading font-bold hover:underline flex items-center gap-1"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Trigger Beacon</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => deleteWorkshopSlot(slot.slotId)}
                          className="text-[#556275] hover:text-[#C85A32] font-mono text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MY LISTINGS (ATELIER CATALOG) */}
        {activeTab === 'listings' && (
          <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-[#12213B]">
                  Verified Craft Atelier Listings ({listings.length})
                </h2>
                <p className="text-xs text-[#556275]">
                  Live masterclasses published to LOKIVA's autonomous cultural solver catalogue
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddSlot}
                className="px-4 py-2.5 bg-[#C85A32] hover:bg-[#B34322] text-white font-heading font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Publish New Experience</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {listings.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-paper-200 overflow-hidden">
                    <img
                      src={exp.coverImage}
                      alt={exp.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs font-mono text-[10px] font-bold text-[#12213B] shadow-2xs">
                      {exp.category}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-[#12213B]/90 text-white font-mono text-[10px] font-bold">
                      ₹{exp.pricePerPerson} / seat
                    </div>
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-heading font-bold text-[#12213B] line-clamp-2">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-[#556275] line-clamp-2 font-sans">
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#556275]">Rating: {exp.rating} ({exp.reviewCount})</span>
                      <button
                        type="button"
                        onClick={handleOpenAddSlot}
                        className="text-[#C85A32] font-heading font-bold hover:underline"
                      >
                        + Add Schedule
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: BOOKINGS & GUEST MANIFEST */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-[#12213B]">
                  Guest Bookings & Session Manifest
                </h2>
                <p className="text-xs text-[#556275]">
                  Real-time traveler attendance, flash deal claims, and instant check-in verification
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#556275] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    placeholder="Search guest or ID..."
                    className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#12213B] font-sans focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div className="flex p-0.5 bg-[#FAF8F5] rounded-xl border border-[#E5DFD5] text-xs font-heading font-bold">
                  {(['all', 'confirmed', 'checked_in', 'flash'] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setBookingFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg capitalize transition ${
                        bookingFilter === filter
                          ? 'bg-[#12213B] text-white shadow-2xs'
                          : 'text-[#556275] hover:text-[#12213B]'
                      }`}
                    >
                      {filter === 'flash' ? '⚡ Flash' : filter.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-[#E5DFD5] bg-[#FAF8F5] text-[#556275] font-heading font-bold text-[11px] uppercase tracking-wider">
                    <th className="p-3">Booking ID & Time</th>
                    <th className="p-3">Guest / Party</th>
                    <th className="p-3">Workshop & Slot</th>
                    <th className="p-3">Amount Paid</th>
                    <th className="p-3">Source & Channel</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5DFD5]">
                  {filteredBookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-[#FAF8F5]/60 transition">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-[#12213B]">{b.bookingId}</div>
                        <div className="text-[10px] text-[#556275]">{b.timestamp}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-heading font-bold text-[#12213B]">{b.travelerName}</div>
                        <div className="text-[11px] text-[#556275] font-mono">{b.guestEmail || 'Verified LOKIVA Guest'}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-[#12213B] line-clamp-1">{b.listingTitle}</div>
                        <div className="text-[11px] font-mono text-[#556275]">{b.slotTime}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#065F46]">
                        ₹{b.amountPaid.toLocaleString('en-IN')}
                      </td>
                      <td className="p-3 font-mono">
                        {b.bookedViaFlashBeacon ? (
                          <span className="px-2 py-0.5 rounded bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8] text-[10px] font-bold">
                            ⚡ Flash Beacon (30% OFF)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[#556275] border border-[#E5DFD5] text-[10px]">
                            Standard Booking
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {b.status === 'checked_in' ? (
                          <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] text-[10px] font-bold">
                            ✓ Checked In
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-[#FAF4ED] text-[#C85A32] border border-[#E8DEC8] text-[10px] font-bold">
                            Confirmed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: 0% COMMISSION SETTLEMENT */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DFD5] pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-[#12213B]">
                  0% Commission Settlement & Earnings
                </h2>
                <p className="text-xs text-[#556275]">
                  100% direct payouts to your verified settlement account with zero aggregator take rates
                </p>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl text-xs font-mono font-bold text-[#065F46]">
                <ShieldCheck className="w-4 h-4 text-[#065F46]" />
                <span>Zero Platform Fees Active</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
              <div className="p-5 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] space-y-1">
                <div className="text-xs text-[#556275] font-sans font-heading font-bold">Lifetime Direct Payouts</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#12213B]">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#065F46]">Settled directly via UPI/IMPS</div>
              </div>

              <div className="p-5 bg-[#FAF4ED] rounded-2xl border border-[#E8DEC8] space-y-1">
                <div className="text-xs text-[#C85A32] font-sans font-heading font-bold">Today's Unsettled Balance</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#C85A32]">
                  ₹4,800
                </div>
                <div className="text-[10px] text-[#556275]">Auto-settles tonight at 11:59 PM</div>
              </div>

              <div className="p-5 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] space-y-1">
                <div className="text-xs text-[#065F46] font-sans font-heading font-bold">OTA Fee You Saved</div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#065F46]">
                  +₹{Math.round(totalRevenue * 0.2).toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#065F46]">Saved vs standard 20% commission apps</div>
              </div>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#E5DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-heading font-bold text-[#12213B]">
                  Verified Bank Settlement Account
                </div>
                <div className="text-xs font-mono text-[#556275]">
                  {profile.settlementAccount}
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-[#065F46] bg-white border border-[#A7F3D0] px-3 py-1.5 rounded-xl">
                ✓ Active Direct Deposit
              </span>
            </div>
          </div>
        )}

        {/* TAB 7: AI CO-PILOT TEASER */}
        {activeTab === 'copilot' && (
          <div className="bg-gradient-to-br from-[#FAF4ED] to-[#F3EAD8] rounded-3xl border border-[#E8DEC8] p-6 sm:p-10 shadow-sm space-y-6 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#E8DEC8] text-xs font-heading font-bold text-[#C85A32] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Provider AI Co-Pilot Studio (Preview)</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#12213B]">
                Natural Language Workshop & Masterclass Creator
              </h2>
              <p className="text-xs sm:text-sm text-[#556275] max-w-xl mx-auto leading-relaxed">
                Describe your craft, tools, and atelier in plain words in any Indian language. Our AI extracts optimal timings, group caps, accessibility badges, and automatically submits your masterclass to LOKIVA's solver catalogue.
              </p>
            </div>

            <div className="p-4 bg-white/80 rounded-2xl border border-[#E5DFD5] text-left max-w-lg mx-auto font-mono text-xs text-[#556275] space-y-1">
              <div className="text-[#12213B] font-bold">Example Input:</div>
              <p className="italic text-[#12213B]">
                "I host a 2-hour Kutch Rogan painting session for 6 people on weekends in Bandra, wheelchair friendly, ₹1,200 per head."
              </p>
            </div>

            <div className="pt-2">
              <span className="inline-block px-4 py-2 bg-[#12213B] text-[#FAF7F2] font-heading font-bold rounded-xl text-xs">
                Full AI Co-Pilot Studio Coming In Next Phase
              </span>
            </div>
          </div>
        )}

        {/* TAB 8: GUILD PROFILE & KYC */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-4">
              <div>
                <h2 className="text-xl font-display font-bold text-[#12213B]">
                  Artisan Guild Profile & Trust Settings
                </h2>
                <p className="text-xs text-[#556275]">
                  Update your public craft heritage bio, precinct coordinates, and settlement account
                </p>
              </div>

              {profileSavedToast && (
                <span className="px-3 py-1 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-xl text-xs font-mono font-bold">
                  ✓ Profile Updated
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-heading font-bold text-[#12213B]">Guild / Studio Name</label>
                  <input
                    type="text"
                    value={profileForm.guildName}
                    onChange={(e) => setProfileForm({ ...profileForm, guildName: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-heading font-bold text-[#12213B]">Craft Discipline & Specialty</label>
                  <input
                    type="text"
                    value={profileForm.craftSpecialty}
                    onChange={(e) => setProfileForm({ ...profileForm, craftSpecialty: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-heading font-bold text-[#12213B]">Operating City</label>
                  <input
                    type="text"
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-heading font-bold text-[#12213B]">Heritage Precinct / Quarter</label>
                  <input
                    type="text"
                    value={profileForm.precinct}
                    onChange={(e) => setProfileForm({ ...profileForm, precinct: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-heading font-bold text-[#12213B]">Generational Heritage Lineage</label>
                  <input
                    type="text"
                    value={profileForm.generationalHeritage}
                    onChange={(e) => setProfileForm({ ...profileForm, generationalHeritage: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-heading font-bold text-[#12213B]">Settlement Bank Details</label>
                  <input
                    type="text"
                    value={profileForm.settlementAccount}
                    onChange={(e) => setProfileForm({ ...profileForm, settlementAccount: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-heading font-bold text-[#12213B]">Studio Bio & Cultural Heritage Context</label>
                <textarea
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl p-2.5 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#B34322] text-white font-heading font-bold rounded-xl text-xs transition shadow-2xs"
                >
                  Save Guild Profile Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* WORKSHOP SLOT EDITOR DRAWER (SLIDE-OVER) */}
        <WorkshopSlotEditorDrawer
          isOpen={isSlotEditorOpen}
          onClose={() => setIsSlotEditorOpen(false)}
          editingSlot={editingSlot}
        />

      </div>
    </div>
  );
}

export default ProviderDashboardPage;
