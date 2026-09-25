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
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { useProviderStore } from '../store/useProviderStore';
import { FlashBeaconControlDeck } from '../components/provider/FlashBeaconControlDeck';
import { DemandClusterRadar } from '../components/provider/DemandClusterRadar';

type TabType = 'dashboard' | 'beacon' | 'slots' | 'bookings' | 'earnings' | 'copilot' | 'profile';

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
  const addWorkshopSlot = useProviderStore((s) => s.addWorkshopSlot);
  const deleteWorkshopSlot = useProviderStore((s) => s.deleteWorkshopSlot);
  const updateSlotCapacityOrBookings = useProviderStore((s) => s.updateSlotCapacityOrBookings);

  // Dynamic Metrics computed live from store
  const totalRevenue = useProviderStore((s) => s.getTotalRevenue());
  const verifiedBookingsCount = useProviderStore((s) => s.getVerifiedBookingsCount());
  const audienceReach = useProviderStore((s) => s.getAudienceReach());
  const communityRating = useProviderStore((s) => s.getCommunityRating());
  const reviewCount = useProviderStore((s) => s.getReviewCount());

  // Search & Filter in Bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'flash' | 'confirmed' | 'checked_in'>('all');

  // Add Slot Modal State
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotTitle, setNewSlotTitle] = useState(listings[0]?.title || 'Master Artisan Workshop');
  const [newSlotTime, setNewSlotTime] = useState('Tomorrow · 04:00 PM - 05:30 PM');
  const [newSlotCapacity, setNewSlotCapacity] = useState(8);
  const [newSlotPrice, setNewSlotPrice] = useState(1200);

  // Profile Edit State
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

  const handleAddSlotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWorkshopSlot({
      listingId: 'exp-' + Date.now(),
      listingTitle: newSlotTitle,
      timeLabel: newSlotTime,
      totalCapacity: Number(newSlotCapacity),
      bookedSeats: 0,
      basePricePerPerson: Number(newSlotPrice),
    });
    setIsAddSlotOpen(false);
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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#12213B] font-sans pb-16">
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
            
            {/* DYNAMIC KPI METRICS (100% Calculated from Store) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Total Direct Revenue</span>
                  <DollarSign className="w-4 h-4 text-[#065F46]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#12213B] tracking-tight">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#065F46] font-semibold">
                  100% direct host payout · 0% commission
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Verified Bookings</span>
                  <Users className="w-4 h-4 text-[#C85A32]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#12213B] tracking-tight">
                  {verifiedBookingsCount}
                </div>
                <div className="text-[10px] text-[#556275]">
                  {bookings.length} recorded in active ledger
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Audience Reach</span>
                  <Eye className="w-4 h-4 text-[#12213B]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#12213B] tracking-tight">
                  {audienceReach.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-[#065F46] font-semibold">
                  {profile.city} precinct impressions
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5DFD5] space-y-1 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-[#556275] font-sans">
                  <span className="font-heading font-bold text-[#12213B]">Community Rating</span>
                  <Star className="w-4 h-4 text-[#D99B43] fill-[#D99B43]" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#12213B] tracking-tight">
                  {communityRating.toFixed(2)} / 5.0
                </div>
                <div className="text-[10px] text-[#556275]">
                  {reviewCount} verified traveler reviews
                </div>
              </div>
            </div>

            {/* SIGNATURE FLASH BEACON LIVE YIELD ENGINE */}
            <FlashBeaconControlDeck onOpenSlotManager={() => handleTabChange('slots')} />

            {/* LIVE DEMAND RADAR (GEO-RADIUS MATCH) */}
            <DemandClusterRadar />

            {/* RECENT FEED & QUICK STATS SPLIT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upcoming Workshop Sessions */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DEC8] p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                  <h3 className="text-base font-heading font-bold text-[#12213B] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C85A32]" />
                    <span>Upcoming Workshop Sessions</span>
                  </h3>

                  <button
                    onClick={() => handleTabChange('slots')}
                    className="text-xs font-heading font-bold text-[#C85A32] hover:underline"
                  >
                    Manage Slots ({slots.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {slots.slice(0, 3).map((slot) => {
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
                            Base: ₹{slot.basePricePerPerson}/pax · {slot.bookedSeats}/{slot.totalCapacity} Booked
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {openSeats > 0 ? (
                            <span className="px-2.5 py-1 rounded-lg bg-[#FAF4ED] border border-[#E8DEC8] text-[#C85A32] font-mono text-xs font-bold block">
                              {openSeats} open spots
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] font-mono text-xs font-bold block">
                              Sold Out
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
                  <span className="text-[10px] font-mono text-[#065F46] bg-[#ECFDF5] px-2 py-0.5 rounded">
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
            <FlashBeaconControlDeck onOpenSlotManager={() => handleTabChange('slots')} />
            <DemandClusterRadar />
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
                onClick={() => setIsAddSlotOpen(true)}
                className="px-4 py-2.5 bg-[#12213B] hover:bg-[#1A2E4C] text-[#FAF7F2] font-heading font-bold rounded-xl text-xs transition shadow-2xs flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4 text-[#D99B43]" />
                <span>Add Workshop Slot</span>
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
                        ₹{slot.basePricePerPerson} / pax
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
                      {openSeats > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleTabChange('beacon')}
                          className="text-[#C85A32] font-heading font-bold hover:underline flex items-center gap-1"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Trigger Flash Beacon (30% OFF)</span>
                        </button>
                      ) : (
                        <span className="text-[#065F46] font-mono font-bold">
                          ✓ Session Fully Booked
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => deleteWorkshopSlot(slot.slotId)}
                        className="text-[#556275] hover:text-[#C85A32] font-mono text-[11px]"
                      >
                        Remove Slot
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ADD SLOT DRAWER / MODAL */}
            {isAddSlotOpen && (
              <div className="p-5 bg-[#FAF4ED] border border-[#E8DEC8] rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-2">
                  <h3 className="text-sm font-heading font-bold text-[#12213B]">
                    Schedule New Workshop Session
                  </h3>
                  <button onClick={() => setIsAddSlotOpen(false)} className="text-[#556275]">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddSlotSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-[#12213B]">Workshop Title</label>
                    <input
                      type="text"
                      value={newSlotTitle}
                      onChange={(e) => setNewSlotTitle(e.target.value)}
                      required
                      className="w-full bg-white border border-[#E5DFD5] rounded-xl px-3 py-2 text-xs font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-[#12213B]">Date & Time Slot</label>
                    <input
                      type="text"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      required
                      placeholder="e.g. Tomorrow · 04:00 PM - 05:30 PM"
                      className="w-full bg-white border border-[#E5DFD5] rounded-xl px-3 py-2 text-xs font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-[#12213B]">Seat Capacity</label>
                    <input
                      type="number"
                      min={1}
                      max={25}
                      value={newSlotCapacity}
                      onChange={(e) => setNewSlotCapacity(Number(e.target.value))}
                      required
                      className="w-full bg-white border border-[#E5DFD5] rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-heading font-bold text-[#12213B]">Base Price per Person (₹)</label>
                    <input
                      type="number"
                      min={100}
                      step={50}
                      value={newSlotPrice}
                      onChange={(e) => setNewSlotPrice(Number(e.target.value))}
                      required
                      className="w-full bg-white border border-[#E5DFD5] rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddSlotOpen(false)}
                      className="px-4 py-2 bg-white text-[#556275] border border-[#E5DFD5] rounded-xl text-xs font-heading font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#C85A32] text-white rounded-xl text-xs font-heading font-bold shadow-2xs"
                    >
                      Save & Publish Slot
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BOOKINGS & GUEST MANIFEST */}
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

        {/* TAB 5: 0% COMMISSION EARNINGS & SETTLEMENT */}
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

            {/* Earnings Cards */}
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

            {/* Settlement Bank Details */}
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

        {/* TAB 6: AI CO-PILOT TEASER */}
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

        {/* TAB 7: GUILD PROFILE & KYC */}
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

      </div>
    </div>
  );
}

export default ProviderDashboardPage;
