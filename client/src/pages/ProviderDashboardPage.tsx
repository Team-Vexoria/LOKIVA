import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Provider, Experience, ProviderAnalyticsSummary } from '../types';
import { ProviderAiCopilot } from '../components/provider/ProviderAiCopilot';
import {
  Briefcase,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Edit,
  CheckCircle2,
  Eye,
  Star,
  Sparkles,
  BellRing,
  Send,
  Zap,
  Radio,
  Clock,
  ShieldCheck,
  LayoutDashboard,
  Package,
  Layers,
  Banknote,
  MapPin,
  Check,
  ChevronRight,
} from 'lucide-react';

type TabType = 'dashboard' | 'listings' | 'copilot' | 'bookings' | 'earnings' | 'profile';

export function ProviderDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabType) || 'dashboard';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [provider, setProvider] = useState<Provider | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [analytics, setAnalytics] = useState<ProviderAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reservedAlertId, setReservedAlertId] = useState<number | null>(null);
  const [publishToast, setPublishToast] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [p, expList, a] = await Promise.all([
          api.getProviderProfile(),
          api.getProviderExperiences(),
          api.getProviderAnalytics(),
        ]);
        setProvider(p);
        setExperiences(expList);
        setAnalytics(a);
      } catch (err) {
        console.error('Failed to load provider hub:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handlePublishNewExperience = (newExp: Partial<Experience>) => {
    const fullExperience: Experience = {
      id: newExp.id || Date.now(),
      title: newExp.title || 'Untitled Experience',
      description: newExp.description || '',
      category: newExp.category || 'Art & Craft',
      price: newExp.price || 500,
      city: newExp.city || 'Mumbai',
      state: newExp.state || 'Maharashtra',
      area_name: newExp.area_name || 'Bandra West',
      duration_mins: newExp.duration_mins || 75,
      wheelchair_accessible: !!newExp.wheelchair_accessible,
      accessibility_wheelchair: !!newExp.accessibility_wheelchair,
      is_indoor: !!newExp.is_indoor,
      is_rain_safe: !!newExp.is_rain_safe,
      is_family_friendly: true,
      rating: 5.0,
      review_count: 1,
      images: [],
    };

    setExperiences((prev) => [fullExperience, ...prev]);
    setPublishToast(`"${fullExperience.title}" is now live in the Pan-India catalogue!`);
    setTimeout(() => setPublishToast(null), 5000);
  };

  const handleBroadcastSlot = (alertId: number) => {
    setReservedAlertId(alertId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center font-mono text-xs text-dusk">
        <div className="w-8 h-8 border-3 border-marigold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {/* Global Toast Notification */}
        {publishToast && (
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl text-xs font-mono text-teal-900 flex items-center justify-between shadow-sm animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0" />
              <span>{publishToast}</span>
            </div>
            <button
              onClick={() => handleTabChange('listings')}
              className="text-xs font-bold text-teal underline hover:text-teal-950"
            >
              View in My Listings →
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-paper-300">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-paper-400 text-teal rounded-full text-xs font-mono font-bold shadow-sm">
              <Briefcase className="w-3.5 h-3.5 text-marigold" />
              <span>Providers Console · Local Artisan & Guide Portal</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-ink">
              {provider?.business_name || 'Bandra Artisan Guild'}
            </h1>
            <p className="text-xs font-mono text-dusk">
              {provider?.city || 'Mumbai'}, {provider?.state || 'Maharashtra'} · Verified Cultural Partner
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-bold shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-teal" />
              <span>KYC Verified Partner</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-paper-300 scrollbar-none font-mono text-xs">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-marigold" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => handleTabChange('listings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'listings'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-teal" />
            <span>My Listings ({experiences.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('copilot')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 relative ${
              activeTab === 'copilot'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-marigold" />
            <span>AI Co-Pilot</span>
            <span className="px-1.5 py-0.2 rounded bg-teal-800 text-white font-mono text-[9px] uppercase">
              Ready
            </span>
          </button>

          <button
            onClick={() => handleTabChange('bookings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-dusk" />
            <span>Bookings</span>
          </button>

          <button
            onClick={() => handleTabChange('earnings')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'earnings'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-teal" />
            <span>Earnings</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'profile'
                ? 'bg-ink text-paper shadow-sm'
                : 'bg-white hover:bg-paper-100 text-dusk hover:text-ink border border-paper-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-marigold" />
            <span>Profile</span>
          </button>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* AI Co-Pilot CTA Hero Card */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-ink via-ink-900 to-teal-950 text-paper rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal/20 text-marigold border border-teal/30 font-mono text-[11px] font-bold">
                    Provider AI Co-Pilot
                  </span>
                  <span className="text-[11px] font-mono text-paper-300">
                    ● Ready for plain-language listings
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display font-bold">
                  Turn your story into a verified experience listing.
                </h3>
                <p className="text-xs sm:text-sm text-paper-300 font-sans leading-relaxed">
                  "Your expertise. Our structure." Describe your craft or heritage walk in your own words.
                  Our AI extracts constraints, timings, fair local price bands, and accessibility tags.
                </p>
              </div>

              <button
                onClick={() => handleTabChange('copilot')}
                className="px-6 py-3.5 bg-marigold hover:bg-marigold-600 text-ink rounded-2xl font-mono text-xs sm:text-sm font-bold transition shadow-md flex items-center gap-2 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4 text-ink" />
                <span>Open AI Co-Pilot Studio →</span>
              </button>
            </div>

            {/* KPI Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Total Direct Revenue</span>
                  <DollarSign className="w-4 h-4 text-teal" />
                </div>
                <div className="text-2xl font-extrabold text-ink">₹{analytics?.revenue || '1,84,500'}</div>
                <span className="text-[10px] text-teal font-semibold">100% direct payout, zero ad-tax</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Verified Bookings</span>
                  <Users className="w-4 h-4 text-marigold" />
                </div>
                <div className="text-2xl font-extrabold text-ink">{analytics?.bookings || 342}</div>
                <span className="text-[10px] text-dusk">Avg party: 3.2 pax</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Audience Reach (7d)</span>
                  <Eye className="w-4 h-4 text-ink" />
                </div>
                <div className="text-2xl font-extrabold text-ink">{analytics?.views || '4,120'}</div>
                <span className="text-[10px] text-teal font-semibold">68% via solver itinerary packs</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-xs text-dusk">
                  <span>Community Rating</span>
                  <Star className="w-4 h-4 text-marigold fill-marigold" />
                </div>
                <div className="text-2xl font-extrabold text-ink">4.92 / 5.0</div>
                <span className="text-[10px] text-dusk">128 verified traveler reviews</span>
              </div>
            </div>

            {/* Live Demand-Alert Banner */}
            <div className="bg-white rounded-3xl border border-paper-400 p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-marigold-700">
                  <Radio className="w-4 h-4 text-marigold animate-pulse" />
                  <span>Live Demand-Aware Push Alerts (Geo-Radius Match)</span>
                </div>
                <span className="text-[11px] font-mono text-dusk">Live Socket Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alert 1 */}
                <div className="p-4 bg-paper-50 hover:bg-white rounded-2xl border border-paper-300 space-y-2 transition shadow-sm">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-ink">3 Families Near Bandra West</span>
                    <span className="text-teal font-extrabold">₹500 / pax ceiling</span>
                  </div>
                  <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                    Searching for <strong>artisan craft & food workshops</strong> within a 2-hour afternoon window.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-paper-300 text-xs font-mono">
                    <span className="text-dusk text-[10px]">12 min travel radius</span>
                    {reservedAlertId === 1 ? (
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg font-bold text-[10px] border border-teal-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal" /> Broadcasted to 3 Families
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBroadcastSlot(1)}
                        className="px-3 py-1 bg-ink hover:bg-ink-800 text-paper rounded-lg font-bold text-[10px] transition shadow-sm"
                      >
                        Broadcast 3:30 PM Slot
                      </button>
                    )}
                  </div>
                </div>

                {/* Alert 2: Sharma Family Persona */}
                <div className="p-4 bg-paper-50 hover:bg-white rounded-2xl border border-paper-300 space-y-2 transition shadow-sm">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-ink">Sharma Family (4 pax · Wheelchair)</span>
                    <span className="text-teal font-extrabold">₹1,500 budget</span>
                  </div>
                  <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                    Looking for <strong>step-free seated experiences</strong> near Pali Hill starting at 4:30 PM.
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-paper-300 text-xs font-mono">
                    <span className="text-teal font-semibold text-[10px]">✓ Ramp Access Matches</span>
                    {reservedAlertId === 2 ? (
                      <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-lg font-bold text-[10px] border border-teal-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-teal" /> Matched to Sharma Itinerary
                      </span>
                    ) : (
                      <button
                        onClick={() => handleBroadcastSlot(2)}
                        className="px-3 py-1 bg-marigold hover:bg-marigold-600 text-ink rounded-lg font-bold text-[10px] transition shadow-sm"
                      >
                        Accept & Push to Sharma Plan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Offerings Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-display font-bold text-ink">
                    Active Cultural Offerings ({experiences.length})
                  </h3>
                  <p className="text-xs font-mono text-dusk">
                    Live in Bandra & Pan-India solver itineraries
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTabChange('copilot')}
                    className="px-3.5 py-1.5 bg-teal hover:bg-teal-700 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Listing (AI)</span>
                  </button>
                  <button
                    onClick={() => handleTabChange('listings')}
                    className="text-xs font-mono text-teal hover:underline font-bold px-2 py-1"
                  >
                    View All →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {experiences.slice(0, 3).map((exp) => (
                  <div
                    key={exp.id}
                    className="bg-white rounded-2xl border border-paper-400 p-5 space-y-3 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                          {exp.category}
                        </span>
                        <span className="font-bold text-teal font-mono">₹{exp.price} / pax</span>
                      </div>

                      <h4 className="text-base font-display font-bold text-ink line-clamp-1">
                        {exp.title}
                      </h4>
                      <p className="text-xs text-dusk-600 font-sans line-clamp-2 leading-relaxed">
                        {exp.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
                      <span className="text-dusk">⏱ {exp.duration_mins || 60} mins</span>
                      <div className="flex items-center gap-2">
                        <span className="text-teal font-semibold">● Active</span>
                        <Link
                          to={`/experience/${exp.id}`}
                          className="p-1 text-dusk hover:text-ink transition"
                          title="View Experience"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  My Active Cultural Offerings
                </h2>
                <p className="text-xs font-mono text-dusk">
                  {experiences.length} verified listings indexed for AI itineraries and discovery
                </p>
              </div>

              <button
                onClick={() => handleTabChange('copilot')}
                className="px-4 py-2 bg-teal hover:bg-teal-700 text-white rounded-xl font-mono text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-marigold" />
                <span>Create Experience with AI Co-Pilot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl border border-paper-400 p-5 space-y-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-paper-200 text-ink font-bold uppercase text-[10px]">
                        {exp.category}
                      </span>
                      <span className="font-extrabold text-teal font-mono text-sm">
                        ₹{exp.price} / pax
                      </span>
                    </div>

                    <h4 className="text-base font-display font-bold text-ink leading-snug">
                      {exp.title}
                    </h4>

                    <p className="text-xs text-dusk-600 font-sans line-clamp-3 leading-relaxed">
                      {exp.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.wheelchair_accessible && (
                        <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded text-[10px] font-bold">
                          ✓ Wheelchair Ramp
                        </span>
                      )}
                      {exp.is_indoor && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
                          ✓ Indoor Studio
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-paper-100 text-dusk rounded text-[10px] font-mono">
                        ⏱ {exp.duration_mins || 60} mins
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-paper-300 flex items-center justify-between text-xs font-mono">
                    <span className="text-teal font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-teal" /> Active in Catalogue
                    </span>
                    <Link
                      to={`/experience/${exp.id}`}
                      className="px-3 py-1 bg-paper-100 hover:bg-paper-200 text-ink rounded-lg font-bold transition flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DEDICATED AI CO-PILOT STUDIO */}
        {activeTab === 'copilot' && (
          <ProviderAiCopilot
            onPublishExperience={handlePublishNewExperience}
            existingListingCount={experiences.length}
          />
        )}

        {/* TAB 4: BOOKINGS */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-paper-200">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  Verified Traveler Bookings
                </h2>
                <p className="text-xs font-mono text-dusk">
                  Confirmed through itinerary packing solver and direct traveler requests
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 text-xs font-mono font-bold border border-teal-200">
                All Payouts 100% Direct · Zero Ad Tax
              </span>
            </div>

            <div className="space-y-3">
              {[
                {
                  guest: 'Sharma Family',
                  party: '4 travelers (Wheelchair priority)',
                  slot: 'Tomorrow · 4:30 PM',
                  experience: 'Generational Hand-Block Printing Atelier',
                  amount: '₹1,800',
                  status: 'Confirmed & Matched',
                  isVerified: true,
                },
                {
                  guest: 'Aarav & Meera Patel',
                  party: '2 travelers',
                  slot: 'Friday · 10:30 AM',
                  experience: 'Chimbai Coastal Curry Workshop',
                  amount: '₹1,200',
                  status: 'Confirmed',
                  isVerified: true,
                },
                {
                  guest: 'Rohan Deshmukh & Friends',
                  party: '3 travelers',
                  slot: 'Saturday · 7:30 AM',
                  experience: 'Ranwar Village Heritage Sketching Trail',
                  amount: '₹1,050',
                  status: 'Completed · Payout Sent',
                  isVerified: true,
                },
              ].map((booking, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-paper-50 rounded-2xl border border-paper-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm text-ink">{booking.guest}</strong>
                      <span className="text-[10px] text-dusk">({booking.party})</span>
                    </div>
                    <div className="text-dusk-600 font-sans">{booking.experience}</div>
                    <div className="text-[11px] text-teal font-semibold">Slot: {booking.slot}</div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                    <span className="text-base font-bold text-teal">{booking.amount}</span>
                    <span className="px-2.5 py-0.5 rounded bg-white text-teal-800 text-[10px] font-bold border border-paper-200">
                      ✓ {booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: EARNINGS */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
              <div className="p-5 bg-white rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <span className="text-xs text-dusk uppercase">Total Lifetime Direct Payouts</span>
                <div className="text-2xl font-extrabold text-ink">₹1,84,500</div>
                <span className="text-[10px] text-teal font-semibold">100% direct to artisan UPI/bank</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <span className="text-xs text-dusk uppercase">Next Settlement (Friday)</span>
                <div className="text-2xl font-extrabold text-teal">₹12,450</div>
                <span className="text-[10px] text-dusk">Auto-clears to HDFC Bank ****4102</span>
              </div>
              <div className="p-5 bg-white rounded-2xl border border-paper-400 space-y-1 shadow-sm">
                <span className="text-xs text-dusk uppercase">Platform Ad-Tax Rate</span>
                <div className="text-2xl font-extrabold text-ink">0.0%</div>
                <span className="text-[10px] text-teal font-semibold">Guaranteed by LOKIVA Charter</span>
              </div>
            </div>

            <div className="p-6 bg-white rounded-3xl border border-paper-400 space-y-4 shadow-sm">
              <h3 className="text-lg font-display font-bold text-ink">
                Direct Host Guarantee
              </h3>
              <p className="text-xs text-dusk-600 font-sans leading-relaxed">
                Unlike traditional travel OTA giants that charge 25%–40% commission or demand ad spends for visibility,
                LOKIVA indexes local experiences algorithmically based on travel time, physical accessibility, and authentic local flavor.
                100% of traveler ticket prices are credited directly to the verified cultural host.
              </p>
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-paper-400 p-6 sm:p-8 space-y-6 shadow-md font-mono text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-paper-200">
              <div>
                <h2 className="text-2xl font-display font-bold text-ink">
                  Artisan & Host Credentials
                </h2>
                <p className="text-xs text-dusk mt-0.5">
                  Verified Local Cultural Partner Badge
                </p>
              </div>
              <span className="px-3 py-1 bg-teal-50 text-teal-800 rounded-xl text-xs font-bold border border-teal-200">
                KYC Level 2 Verified ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-dusk uppercase block">Registered Entity</span>
                  <strong className="text-sm text-ink">{provider?.business_name || 'Bandra Artisan Guild'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-dusk uppercase block">Location Base</span>
                  <p className="text-ink">Pali Hill & Ranwar Village, Bandra West, Mumbai, Maharashtra</p>
                </div>
                <div>
                  <span className="text-[10px] text-dusk uppercase block">Craft Specialty</span>
                  <p className="text-ink">Heritage Hand-Block Printing, Indigo Vat Dyeing, Coastal Walks</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-dusk uppercase block">Settlement Account</span>
                  <p className="text-ink">HDFC Bank Limited · Account ending in 4102</p>
                </div>
                <div>
                  <span className="text-[10px] text-dusk uppercase block">Accessibility Compliance</span>
                  <p className="text-teal font-semibold">Verified Ground-Floor Step-Free Ramp at Studio Base</p>
                </div>
                <div>
                  <span className="text-[10px] text-dusk uppercase block">Community Standing</span>
                  <p className="text-ink">4.92 / 5.0 Rating across 128 verified traveler journeys</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
